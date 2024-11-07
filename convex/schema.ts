import { v } from "convex/values";
import { defineTable, defineSchema } from "convex/server";

export default defineSchema({
    boards: defineTable({
        title: v.string(),
        orgId: v.string(),
        authorId: v.string(),
        authorName: v.optional(v.string()),
        imageUrl: v.string(),
    })
        .index("by_org", ["orgId"])
        .searchIndex("search_title", {
            searchField: "title",
            filterFields: ["orgId"],
        }),
        codeDocuments: defineTable({
            title: v.string(),
            orgId: v.string(),
            authorId: v.string(),
            authorName: v.optional(v.string()),
            language: v.string(),
            imageUrl: v.optional(v.string()), // Make imageUrl optional
            lastModified: v.float64(),
            content: v.optional(v.string()),
        })
            .index("by_org", ["orgId"])
            .searchIndex("search_title", {
                searchField: "title",
                filterFields: ["orgId"],
            }),
    userFavorites: defineTable({
        orgId: v.string(),
        userId: v.string(),
        boardId: v.id("boards"),
    })
        .index("by_board", ["boardId"])
        .index("by_user_org", ["userId", "orgId"])
        .index("by_user_board", ["userId", "boardId"])
        .index("by_user_board_org", ["userId", "boardId", "orgId"]),
});