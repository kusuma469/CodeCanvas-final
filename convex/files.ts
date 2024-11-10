import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const save = mutation({
  args: {
    boardId: v.string(),
    orgId: v.string(),
    title: v.string(),
    content: v.string(),
    roomLink: v.union(v.string(), v.null()),
    authorId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("fileData")
      .withIndex("by_boardId", (q) => q.eq("boardId", args.boardId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        content: args.content,
        roomLink: args.roomLink,
        lastModified: Date.now(),
      });
    } else {
      await ctx.db.insert("fileData", {
        boardId: args.boardId,
        orgId: args.orgId,
        title: args.title,
        content: args.content,
        roomLink: args.roomLink,
        authorId: args.authorId,
        lastModified: Date.now(),
      });
    }
  },
});

export const get = query({
  args: { boardId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("fileData")
      .withIndex("by_boardId", (q) => q.eq("boardId", args.boardId))
      .first();
  },
});