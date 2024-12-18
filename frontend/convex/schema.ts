import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { UserIdentity } from "convex/server";

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    parentDocument: v.optional(v.id("documents")),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    published: v.boolean(),
    isFolder: v.boolean(),
    isActive: v.boolean(),
    userProfile: v.optional(v.string()),
    publishedUserName: v.optional(v.string()),
    likes: v.optional(v.number()),
    views: v.optional(v.number()),
    words: v.optional(v.number()),
    characters: v.optional(v.number()),
    githubRepo: v.optional(v.string()),
    // identity: v.optional(v.object())
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"])
    .index("by_likes", ["likes"])
    .index("by_views", ["views"]),

  likeData: defineTable({
    userId: v.string(),
    documentId: v.id("documents"),
  }),
});
