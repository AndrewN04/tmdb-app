import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

// --- Library Actions ---

export const toggleLibraryStatus = mutation({
  args: {
    tmdbId: v.number(),
    mediaType: v.union(v.literal("movie"), v.literal("tv")),
    title: v.string(),
    posterPath: v.optional(v.string()),
    action: v.union(v.literal("favorite"), v.literal("watchlist")),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Unauthorized");
    const userId = authUser._id;

    const existing = await ctx.db
      .query("libraryItems")
      .withIndex("by_user_media", (q) => 
        q.eq("userId", userId).eq("tmdbId", args.tmdbId).eq("mediaType", args.mediaType)
      )
      .first();

    if (existing) {
      // Toggle existing
      const field = args.action === "favorite" ? "isFavorite" : "isWatchlist";
      const newValue = !existing[field];
      
      await ctx.db.patch(existing._id, {
        [field]: newValue,
        updatedAt: Date.now(),
        title: args.title,
        posterPath: args.posterPath,
      });
      return newValue;
    } else {
      // Create new
      await ctx.db.insert("libraryItems", {
        userId,
        tmdbId: args.tmdbId,
        mediaType: args.mediaType,
        title: args.title,
        posterPath: args.posterPath,
        isFavorite: args.action === "favorite",
        isWatchlist: args.action === "watchlist",
        updatedAt: Date.now(),
      });
      return true;
    }
  },
});

export const getLibraryItemStatus = query({
  args: {
    tmdbId: v.number(),
    mediaType: v.union(v.literal("movie"), v.literal("tv")),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) return null;
    const userId = authUser._id;

    return await ctx.db
      .query("libraryItems")
      .withIndex("by_user_media", (q) => 
        q.eq("userId", userId).eq("tmdbId", args.tmdbId).eq("mediaType", args.mediaType)
      )
      .first();
  },
});

export const getUserLibrary = query({
  args: {
    filter: v.union(v.literal("favorite"), v.literal("watchlist")),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) return [];
    const userId = authUser._id;

    const indexName = args.filter === "favorite" ? "by_user_favorite" : "by_user_watchlist";
    const fieldName = args.filter === "favorite" ? "isFavorite" : "isWatchlist";

    return await ctx.db
      .query("libraryItems")
      .withIndex(indexName, (q) => q.eq("userId", userId).eq(fieldName, true))
      .order("desc")
      .collect();
  },
});

// --- Review Actions ---

export const postReview = mutation({
  args: {
    tmdbId: v.number(),
    mediaType: v.union(v.literal("movie"), v.literal("tv")),
    rating: v.number(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Unauthorized");

    // Simple validation
    if (args.rating < 0 || args.rating > 10) throw new Error("Invalid rating");
    if (args.content.length > 1000) throw new Error("Review too long");

    await ctx.db.insert("reviews", {
      userId: authUser._id,
      userName: authUser.name || "Anonymous",
      userImage: authUser.image || undefined,
      tmdbId: args.tmdbId,
      mediaType: args.mediaType,
      rating: args.rating,
      content: args.content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getReviews = query({
  args: {
    tmdbId: v.number(),
    mediaType: v.union(v.literal("movie"), v.literal("tv")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_media", (q) => 
        q.eq("tmdbId", args.tmdbId).eq("mediaType", args.mediaType)
      )
      .order("desc")
      .take(20);
  },
});

export const deleteReview = mutation({
  args: {
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Unauthorized");

    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review not found");

    if (review.userId !== authUser._id) throw new Error("Not authorized to delete this review");

    await ctx.db.delete(args.reviewId);
  },
});
