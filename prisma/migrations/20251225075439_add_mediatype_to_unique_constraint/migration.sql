/*
  Warnings:

  - A unique constraint covering the columns `[userId,tmdbId,mediaType]` on the table `WatchlistItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "WatchlistItem_userId_tmdbId_key";

-- CreateIndex
CREATE INDEX "WatchlistItem_mediaType_idx" ON "WatchlistItem"("mediaType");

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistItem_userId_tmdbId_mediaType_key" ON "WatchlistItem"("userId", "tmdbId", "mediaType");
