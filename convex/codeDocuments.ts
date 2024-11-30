import { v } from "convex/values";
import { query } from "./_generated/server";

// Query to get all documents by organization ID
export const get = query({
    args: {
        orgId: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const documents = await ctx.db
            .query("codeDocuments")
            .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
            .collect();

        return documents;
    },
});

// Query to search documents by title using the search_title index
export const searchByTitle = query({
    args: {
        orgId: v.string(),
        searchTerm: v.string(),
    },
    handler: async (ctx, { orgId, searchTerm }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const documents = await ctx.db
            .query("codeDocuments")
            .withSearchIndex("search_title", (q) =>
                q.search("title", searchTerm).eq("orgId", orgId)
            ) // Properly filters by title and organization ID
            .collect();

        return documents;
    },
});
