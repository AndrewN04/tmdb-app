import "server-only";

import { prisma } from "./prisma";

export async function getWatchlistItemForUser(userId: string, tmdbId: number) {
  if (!userId) {
    return null;
  }

  return prisma.watchlistItem.findUnique({
    where: {
      userId_tmdbId: {
        userId,
        tmdbId,
      },
    },
  });
}
