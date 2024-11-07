// convex/codeDocuments.ts

import { v } from "convex/values";
import { query } from "./_generated/server";

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
            .order("desc")
            .collect();

        return documents;
    },
});