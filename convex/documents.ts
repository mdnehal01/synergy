import { v } from 'convex/values';
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// export const get = query({
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();

//     if (!identity) {
//       throw new Error("User is not authenticated");
//     }

//     const documents = await ctx.db
//       .query("documents")
//       .collect(); // <-- This is the fix 

//     return documents;
//   },
// });

export const archive = mutation({
  args:{
    id:v.id("documents")
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const existingDocuments = await ctx.db.get(args.id);

    if(!existingDocuments){
      throw new Error("Not found")
    }

    if(existingDocuments.userId !== userId){
      throw new Error("Unauthorized");
    }

    const recursiveArchive = async (documentId:Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) => (
          q
            .eq("userId", userId)
            .eq("parentDocument", documentId)
        )).collect()

    for(const child of children) {
      await ctx.db.patch(child._id, {
        isArchived:true,
      });
      
      await recursiveArchive(child._id);
    }
    }

    const document = await ctx.db.patch(args.id,{
      isArchived:true
    })

    recursiveArchive(args.id);

    return document 
  }
})



export const getsidebar = query({
  args: {
    parentDocument: v.optional(v.id("documents"))
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) => 
        q
          .eq("userId", userId)
          .eq("parentDocument", args.parentDocument)
      )
      .filter((q) => 
        q.and(
          q.eq(q.field("isArchived"), false),
          q.eq(q.field("workspaceId"), undefined) // Only show non-workspace documents
        )
      )
      .collect()

    // Sort by order field, then by creation time
    return documents.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return b._creationTime - a._creationTime;
    });
  }
})

export const getByWorkspace = query({
  args: {
    workspaceId: v.id("workspaces")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_workspace", (q) => 
        q
          .eq("userId", userId)
          .eq("workspaceId", args.workspaceId)
      )
      .filter((q) => 
        q.eq(q.field("isArchived"), false)
      )
      .collect();

    // Sort by order field, then by creation time for proper hierarchy
    return documents.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return b._creationTime - a._creationTime;
    });
  }
});

export const getWorkspaceChildren = query({
  args: {
    workspaceId: v.id("workspaces"),
    parentDocument: v.optional(v.id("documents"))
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) => 
        q
          .eq("userId", userId)
          .eq("parentDocument", args.parentDocument)
      )
      .filter((q) => 
        q.and(
          q.eq(q.field("isArchived"), false),
          q.eq(q.field("workspaceId"), args.workspaceId)
        )
      )
      .collect();

    // Sort by order field, then by creation time
    return documents.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return b._creationTime - a._creationTime;
    });
  }
});

export const create = mutation({
    args: {
        title:v.string(),
        parentDocument: v.optional(v.id("documents")),
        workspaceId: v.optional(v.id("workspaces"))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity){
            throw new Error("User is not authenticated")
        }
        
        const userId = identity.subject;

        // Get the highest order number for siblings
        const siblings = await ctx.db
          .query("documents")
          .withIndex("by_user_parent", (q) => 
            q
              .eq("userId", userId)
              .eq("parentDocument", args.parentDocument)
          )
          .filter((q) => 
            q.and(
              q.eq(q.field("isArchived"), false),
              // Only consider documents in the same context (workspace or non-workspace)
              args.workspaceId 
                ? q.eq(q.field("workspaceId"), args.workspaceId)
                : q.eq(q.field("workspaceId"), undefined)
            )
          )
          .collect();

        const maxOrder = siblings.reduce((max, doc) => 
          Math.max(max, doc.order || 0), 0
        );

        const document = await ctx.db.insert("documents", {
            title: args.title,
            parentDocument: args.parentDocument,
            workspaceId: args.workspaceId,
            userId,
            isArchived:false,
            isPublished:false,
            order: maxOrder + 1
        })

        return document;

    }
}); 

export const reorderDocuments = mutation({
  args: {
    documentId: v.id("documents"),
    targetDocumentId: v.id("documents"),
    position: v.union(v.literal("before"), v.literal("after"))
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    // Verify both documents belong to the user
    const [sourceDoc, targetDoc] = await Promise.all([
      ctx.db.get(args.documentId),
      ctx.db.get(args.targetDocumentId)
    ]);

    if (!sourceDoc || !targetDoc) {
      throw new Error("Document not found");
    }

    if (sourceDoc.userId !== userId || targetDoc.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Make sure they have the same parent AND same workspace context
    if (sourceDoc.parentDocument !== targetDoc.parentDocument || 
        sourceDoc.workspaceId !== targetDoc.workspaceId) {
      throw new Error("Documents must have the same parent and workspace context");
    }

    // Get all siblings in the same parent and workspace context
    const siblings = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) => 
        q
          .eq("userId", userId)
          .eq("parentDocument", sourceDoc.parentDocument)
      )
      .filter((q) => 
        q.and(
          q.eq(q.field("isArchived"), false),
          sourceDoc.workspaceId 
            ? q.eq(q.field("workspaceId"), sourceDoc.workspaceId)
            : q.eq(q.field("workspaceId"), undefined)
        )
      )
      .collect();

    // Sort siblings by current order
    const sortedSiblings = siblings.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return a._creationTime - b._creationTime;
    });

    // Remove the source document from the list
    const filteredSiblings = sortedSiblings.filter(doc => doc._id !== args.documentId);
    
    // Find the target position
    const targetIndex = filteredSiblings.findIndex(doc => doc._id === args.targetDocumentId);
    if (targetIndex === -1) {
      throw new Error("Target document not found in siblings");
    }

    // Calculate new position
    const newIndex = args.position === "before" ? targetIndex : targetIndex + 1;
    
    // Insert the source document at the new position
    filteredSiblings.splice(newIndex, 0, sourceDoc);

    // Update all documents with new order
    const updates = filteredSiblings.map((doc, index) => 
      ctx.db.patch(doc._id, { order: index + 1 })
    );

    await Promise.all(updates);

    return { success: true };
  }
});

export const getTrash = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if(!identity) {
      throw new Error("User not authenticated ")
    }

    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => 
        q
          .eq("userId", userId)
      )
      .filter((q) => 
        q.eq(q.field("isArchived"), true)
      )
   
      .collect()
      
      return documents
  }
})


export const restore = mutation({
  args: {id: v.id("documents")},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if(!identity) {
      throw new Error("User not authenticated ")
    }

    const userId = identity.subject; 

    const existingDocuments = await ctx.db.get(args.id);

    if(!existingDocuments){
      throw new Error("Not found")
    }

    if(existingDocuments.userId !== userId){
      throw new Error("Unauthorized");
    }

    const recursiveRestore = async (documentId: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) => (
          q
            .eq("userId", userId)
            .eq("parentDocument", documentId )
        ))
        .collect()

        for(const child of children) {
          await ctx.db.patch(child._id, {
            isArchived:false,
          });
        await recursiveRestore(child._id);
      } 
    }

    const options:Partial<Doc<"documents">> = {
      isArchived:false,
    }

    if(existingDocuments.parentDocument){
      const parent = await ctx.db.get(existingDocuments.parentDocument)
      if(parent?.isArchived) {
        options.parentDocument = undefined
      }
    }

    const document = await ctx.db.patch(args.id, options );

    recursiveRestore(args.id)

    return document
  }
})


export const remove = mutation({
  args: { id: v.id("documents") },
  handler:async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if(!identity) {
      throw new Error("User not authenticated ")
    }

    const userId = identity.subject; 

    const existingDocuments = await ctx.db.get(args.id);

    if(!existingDocuments){
      throw new Error("Not found")
    }

    if(existingDocuments.userId !== userId){
      throw new Error("Unauthorized");
    }

    const document = await ctx.db.delete(args.id)

    return document; 

  }
})

export const getSearch = query({
  handler: async (ctx) => {
    
    const identity = await ctx.auth.getUserIdentity();
    if(!identity) {
      throw new Error("User not authenticated ")
    }

    const userId = identity.subject; 
    
    const documents = await ctx.db.query("documents")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("isArchived"), false))
    .order("desc")
    .collect()

    return documents
  }
});

export const getById = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const document = await ctx.db.get(args.documentId);

    if (!document) {
      throw new Error("Document not found");
    }

    if (document.isPublished && !document.isArchived) {
      return document;
    }

    if (!identity) {
      throw new Error("user not authenticated");
    }

    const userId = identity.subject;

    if (document.userId !== userId) {
      throw new Error("Unauthorized");
    }

    return document;
  },
});


export const update = mutation({
  args:{
    id:v.id("documents"),
    title:v.optional(v.string()),
    content:v.optional(v.string()),
    coverImage:v.optional(v.string()),
    icon:v.optional(v.string()),
    isPublished:v.optional(v.boolean()),
    flowData:v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("user not authenticated");
    }

    const userId = identity.subject;
// eslint-disable-next-line @typescript-eslint/no-unused-vars                                                                                                                       
    const {id, ...rest} = args; 

    const existingDocuments = await ctx.db.get(args.id);

    if(!existingDocuments){
      throw new Error("Not found")
    }

    if(existingDocuments.userId !== userId){
      throw new Error("Unauthorized");
    }

    const document = await ctx.db.patch(args.id, {
      ...rest,
    })

    return document
  }
})

export const removeIcon = mutation({
  args:{id:v.id("documents")},
  handler:async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const existingDocuments = await ctx.db.get(args.id);

    if(!existingDocuments){
      throw new Error("Not found")
    }

    if(existingDocuments.userId !== userId){
      throw new Error("Unauthorized");
    }

    const document = await ctx.db.patch(args.id, {
      icon:undefined
    });

    return document;
  }
})

export const removeCover = mutation({
  args:{id:v.id("documents")},
  handler:async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const existingDocuments = await ctx.db.get(args.id);

    if(!existingDocuments){
      throw new Error("Not found")
    }

    if(existingDocuments.userId !== userId){
      throw new Error("Unauthorized");
    }

    const document = await ctx.db.patch(args.id, {
      coverImage:undefined
    });

    return document;
  }
})

export const duplicate = mutation({
  args: {
    id: v.id("documents"),
    targetParentId: v.optional(v.id("documents")),
    targetWorkspaceId: v.optional(v.id("workspaces"))
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const sourceDoc = await ctx.db.get(args.id);
    if (!sourceDoc) {
      throw new Error("Source document not found");
    }

    if (sourceDoc.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Get the highest order number for siblings in target location
    const siblings = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) => 
        q
          .eq("userId", userId)
          .eq("parentDocument", args.targetParentId)
      )
      .filter((q) => 
        q.and(
          q.eq(q.field("isArchived"), false),
          args.targetWorkspaceId 
            ? q.eq(q.field("workspaceId"), args.targetWorkspaceId)
            : q.eq(q.field("workspaceId"), undefined)
        )
      )
      .collect();

    const maxOrder = siblings.reduce((max, doc) => 
      Math.max(max, doc.order || 0), 0
    );

    // Create duplicate
    const duplicateDoc = await ctx.db.insert("documents", {
      title: `${sourceDoc.title} (Copy)`,
      content: sourceDoc.content,
      icon: sourceDoc.icon,
      coverImage: sourceDoc.coverImage,
      parentDocument: args.targetParentId,
      workspaceId: args.targetWorkspaceId,
      userId,
      isArchived: false,
      isPublished: false,
      order: maxOrder + 1
    });

    return duplicateDoc;
  }
});

export const moveDocument = mutation({
  args: {
    id: v.id("documents"),
    targetParentId: v.optional(v.id("documents")),
    targetWorkspaceId: v.optional(v.id("workspaces"))
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found");
    }

    if (document.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Can't move document to be a child of itself
    if (args.targetParentId === args.id) {
      throw new Error("Cannot move document to be a child of itself");
    }

    // Get the highest order number for siblings in target location
    const siblings = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) => 
        q
          .eq("userId", userId)
          .eq("parentDocument", args.targetParentId)
      )
      .filter((q) => 
        q.and(
          q.eq(q.field("isArchived"), false),
          args.targetWorkspaceId 
            ? q.eq(q.field("workspaceId"), args.targetWorkspaceId)
            : q.eq(q.field("workspaceId"), undefined)
        )
      )
      .collect();

    const maxOrder = siblings.reduce((max, doc) => 
      Math.max(max, doc.order || 0), 0
    );

    // Update document location
    const updatedDoc = await ctx.db.patch(args.id, {
      parentDocument: args.targetParentId,
      workspaceId: args.targetWorkspaceId,
      order: maxOrder + 1
    });

    return updatedDoc;
  }
});

export const makeParent = mutation({
  args: {
    id: v.id("documents")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found");
    }

    if (document.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Check if document is already a parent (has no parent)
    if (!document.parentDocument) {
      throw new Error("Document is already a parent");
    }

    // Get the highest order number for top-level documents in the same context
    const topLevelSiblings = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) => 
        q
          .eq("userId", userId)
          .eq("parentDocument", undefined)
      )
      .filter((q) => 
        q.and(
          q.eq(q.field("isArchived"), false),
          document.workspaceId 
            ? q.eq(q.field("workspaceId"), document.workspaceId)
            : q.eq(q.field("workspaceId"), undefined)
        )
      )
      .collect();

    const maxOrder = topLevelSiblings.reduce((max, doc) => 
      Math.max(max, doc.order || 0), 0
    );

    // Update document to be a parent (remove parentDocument)
    const updatedDoc = await ctx.db.patch(args.id, {
      parentDocument: undefined,
      order: maxOrder + 1
    });

    return updatedDoc;
  }
});