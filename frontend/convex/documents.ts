import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { error } from "console";

export const moveFile = mutation({
  args: {
    id: v.id("documents"),
    parentId: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated.");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    const destId = args.parentId;
    let destinationDocument: typeof existingDocument | undefined;

    if (destId) {
      destinationDocument = await ctx.db.get(destId);
    } else {
      destinationDocument = undefined;
    }

    if (!existingDocument) {
      throw new Error("Document does not exist");
    }
    if (existingDocument.userId !== userId) {
      throw new Error("Not authorized");
    }

    if (existingDocument.isFolder && destId && destinationDocument) {
      // Check if the destination is a child of the current folder
      let currentParentId = destId;
      while (currentParentId) {
        const currentParentDocument = await ctx.db.get(currentParentId);
        if (!currentParentDocument) {
          break;
        }
        // If the destination is a child of the document being moved, prevent the move
        if (currentParentId === args.id) {
          throw new Error(
            "Cannot move a parent folder into one of its child folders.",
          );
        }
        // Update currentParentId regardless of whether parentDocument is defined
        if (!currentParentDocument.parentDocument) {
          break;
        }
        currentParentId = currentParentDocument.parentDocument;
      }
    }

    if (!destinationDocument) {
      await ctx.db.patch(args.id, {
        parentDocument: undefined,
      });
    } else if (!destinationDocument?.isFolder) {
      if (destinationDocument.parentDocument) {
        await ctx.db.patch(args.id, {
          parentDocument: destinationDocument.parentDocument,
        });
      } else {
        await ctx.db.patch(args.id, {
          parentDocument: undefined,
        });
      }
    } else if (destinationDocument?.isFolder) {
      await ctx.db.patch(args.id, {
        parentDocument: args.parentId,
      });
    }
  },
});

export const archive = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("User not authenticated.");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Document not found.");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized to modify.");
    }

    const recursiveArchive = async (documentId: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documentId),
        )
        .collect();
      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: true,
        });

        await recursiveArchive(child._id);
      }
      return children;
    };

    const document = await ctx.db.patch(args.id, {
      isArchived: true,
    });

    recursiveArchive(args.id);

    return document;
  },
});

export const getSidebar = query({
  args: {
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("User not authenticated.");
    }

    const userId = identity.subject;
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", userId).eq("parentDocument", args.parentDocument),
      )
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});

export const createFile = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated.");
    }

    const userId = identity.subject;
    const document = await ctx.db.insert("documents", {
      title: args.title,
      parentDocument: args.parentDocument,
      userId: userId,
      isArchived: false,
      published: false,
      isFolder: false,
      isActive: false,
      userProfile: identity.pictureUrl,
    });

    return document;
  },
});

export const createFolder = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated.");
    }

    const userId = identity.subject;
    const document = await ctx.db.insert("documents", {
      title: args.title,
      parentDocument: args.parentDocument,
      userId: userId,
      isArchived: false,
      published: false,
      isFolder: true,
      isActive: false,
    });

    return document;
  },
});

export const getTrash = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated.");
    }

    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .order("desc")
      .collect();

    return documents;
  },
});

export const restore = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated.");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Document does not exist");
    }
    if (existingDocument.userId !== userId) {
      throw new Error("Not authorized");
    }

    const recursiveRestore = async (documentId: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documentId),
        )
        .collect();

      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: false,
        });

        await recursiveRestore(child._id);
      }
    };

    const options: Partial<Doc<"documents">> = {
      isArchived: false,
    };
    if (existingDocument.parentDocument) {
      const parent = await ctx.db.get(existingDocument.parentDocument);
      if (parent?.isArchived) {
        options.parentDocument = undefined;
      }
    }

    const document = await ctx.db.patch(args.id, options);

    recursiveRestore(args.id);

    return document;
  },
});

export const remove = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated.");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Document does not exist");
    }
    if (existingDocument.userId !== userId) {
      throw new Error("Not authorized");
    }

    const document = await ctx.db.delete(args.id);
    return document;
  },
});

export const getSearch = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated.");
    }

    const userId = identity.subject;

    const documents = ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});

export const getById = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    const document = await ctx.db.get(args.documentId);

    if (!document) {
      throw new Error("Not found");
    }

    if (document.published && !document.isArchived) {
      return document;
    }

    if (!identity) {
      throw new Error("Not authenticated.");
    }
    const userId = identity.subject;

    if (document.userId !== userId) {
      throw new Error("Unauthorized to view.");
    }

    return document;
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const userId = identity.subject;

    const { id, ...rest } = args;
    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const document = await ctx.db.patch(args.id, {
      ...rest,
    });

    return document;
  },
});

export const removeIcon = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);
    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const document = await ctx.db.patch(args.id, {
      icon: undefined,
    });

    return document;
  },
});

export const getAllPublished = query({
  handler: async (ctx) => {
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //   throw new Error("Not authenticated.");
    // }

    const documents = ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("isArchived"), false))
      .filter((q) => q.eq(q.field("published"), true))
      .collect();

    return documents;
  },
});
