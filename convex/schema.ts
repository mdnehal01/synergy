import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    documents: defineTable({
        title:v.string(),
        userId:v.string(),
        isArchived: v.boolean(),
        parentDocument: v.optional(v.id("documents")),
        content:v.optional(v.string()),
        coverImage:v.optional(v.string()),
        icon: v.optional(v.string()),
        isPublished: v.boolean(),
        order: v.optional(v.number()),
        workspaceId: v.optional(v.id("workspaces"))
    })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"])
    .index("by_user_parent_order", ["userId", "parentDocument", "order"])
    .index("by_workspace", ["workspaceId"])
    .index("by_user_workspace", ["userId", "workspaceId"]),

    workspaces: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        userId: v.string(),
        icon: v.optional(v.string()),
        isArchived: v.boolean(),
        createdAt: v.number()
    })
    .index("by_user", ["userId"])
    .index("by_user_archived", ["userId", "isArchived"])
})