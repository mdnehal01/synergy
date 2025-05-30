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

    const document = await ctx.db.patch(args.id,{
      isArchived:true
    })

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
        q.eq(q.field("isArchived"), false)
      )
      .order("desc")
      .collect()
      
      return documents
  }
})

export const create = mutation({
    args: {
        title:v.string(),
        parentDocument: v.optional(v.id("documents"))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity){
            throw new Error("User is not authenticated")
        }
        
        const userId = identity.subject;

        const document = await ctx.db.insert("documents", {
            title: args.title,
            parentDocument: args.parentDocument,
            userId,
            isArchived:false,
            isPublished:false 
        })

        return document;

    }
}); 