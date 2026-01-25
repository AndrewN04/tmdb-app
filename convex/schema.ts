import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Reviews for Movies and TV Shows
  reviews: defineTable({
    userId: v.string(),
    userName: v.string(),
    userImage: v.optional(v.string()),
    tmdbId: v.number(),
    mediaType: v.union(v.literal("movie"), v.literal("tv")),
    rating: v.number(),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_media", ["tmdbId", "mediaType"])
  .index("by_user", ["userId"]),

  // User Library (Favorites & Watchlist)
  libraryItems: defineTable({
    userId: v.string(),
    tmdbId: v.number(),
    mediaType: v.union(v.literal("movie"), v.literal("tv")),
    title: v.string(),
    posterPath: v.optional(v.string()),
    isFavorite: v.boolean(),
    isWatchlist: v.boolean(),
    updatedAt: v.number(),
  })
  .index("by_user_media", ["userId", "tmdbId", "mediaType"])
  .index("by_user_favorite", ["userId", "isFavorite"])
  .index("by_user_watchlist", ["userId", "isWatchlist"]),
});
