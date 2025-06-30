import { v } from 'convex/values';
import { mutation, query } from "./_generated/server";

export const create = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        icon: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("User is not authenticated");
        }
        
        const userId = identity.subject;

        const workspace = await ctx.db.insert("workspaces", {
            name: args.name,
            description: args.description,
            icon: args.icon,
            userId,
            isArchived: false,
            createdAt: Date.now()
        });

        return workspace;
    }
});

export const getAll = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;

        const workspaces = await ctx.db
            .query("workspaces")
            .withIndex("by_user_archived", (q) => 
                q
                    .eq("userId", userId)
                    .eq("isArchived", false)
            )
            .order("desc")
            .collect();

        return workspaces;
    }
});

export const getById = query({
    args: { workspaceId: v.id("workspaces") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const workspace = await ctx.db.get(args.workspaceId);

        if (!workspace) {
            throw new Error("Workspace not found");
        }

        if (!identity) {
            throw new Error("User not authenticated");
        }

        const userId = identity.subject;

        if (workspace.userId !== userId) {
            throw new Error("Unauthorized");
        }

        return workspace;
    },
});

export const update = mutation({
    args: {
        id: v.id("workspaces"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        icon: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("User not authenticated");
        }

        const userId = identity.subject;
        const { id, ...rest } = args;

        const existingWorkspace = await ctx.db.get(args.id);

        if (!existingWorkspace) {
            throw new Error("Workspace not found");
        }

        if (existingWorkspace.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const workspace = await ctx.db.patch(args.id, {
            ...rest,
        });

        return workspace;
    }
});

export const archive = mutation({
    args: {
        id: v.id("workspaces")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;

        const existingWorkspace = await ctx.db.get(args.id);

        if (!existingWorkspace) {
            throw new Error("Workspace not found");
        }

        if (existingWorkspace.userId !== userId) {
            throw new Error("Unauthorized");
        }

        // Archive all documents in this workspace
        const documents = await ctx.db
            .query("documents")
            .withIndex("by_user_workspace", (q) => 
                q
                    .eq("userId", userId)
                    .eq("workspaceId", args.id)
            )
            .collect();

        for (const document of documents) {
            await ctx.db.patch(document._id, {
                isArchived: true,
            });
        }

        const workspace = await ctx.db.patch(args.id, {
            isArchived: true
        });

        return workspace;
    }
});

export const remove = mutation({
    args: { id: v.id("workspaces") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("User not authenticated");
        }

        const userId = identity.subject;

        const existingWorkspace = await ctx.db.get(args.id);

        if (!existingWorkspace) {
            throw new Error("Workspace not found");
        }

        if (existingWorkspace.userId !== userId) {
            throw new Error("Unauthorized");
        }

        // Delete all documents in this workspace
        const documents = await ctx.db
            .query("documents")
            .withIndex("by_user_workspace", (q) => 
                q
                    .eq("userId", userId)
                    .eq("workspaceId", args.id)
            )
            .collect();

        for (const document of documents) {
            await ctx.db.delete(document._id);
        }

        const workspace = await ctx.db.delete(args.id);

        return workspace;
    }
});