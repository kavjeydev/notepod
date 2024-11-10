import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const addLikeFromUser = mutation({
  args: { id: v.id("documents") }, // This is correct if you're liking a document
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated.");
    }

    // Insert a new record into the likeData table
    const likeRecord = await ctx.db.insert("likeData", {
      documentId: args.id,
      userId: identity.subject,
    });

    return likeRecord;
  },
});

export const removeLikeFromUser = mutation({
  args: { id: v.id("likeData") }, // Ensure the ID type matches the 'likeData' table
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated.");
    }

    // This assumes you are deleting from 'likeData' using its ID
    const result = await ctx.db.delete(args.id);

    return result;
  },
});

export const getLikeFromUser = query({
  args: {
    documentId: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("User not authenticated.");
    }

    const userId = identity.subject;
    const likes = await ctx.db
      .query("likeData")
      .filter((q) => q.eq(q.field("documentId"), args.documentId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    if (!likes) {
      return undefined;
    }

    return likes[0];
  },
});
