/*
  Warnings:

  - You are about to drop the `songs` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[spotifyId]` on the table `playlist_songs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[youtubeId]` on the table `playlist_songs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `artist` to the `playlist_songs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `playlist_songs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "playlist_songs" DROP CONSTRAINT "playlist_songs_songId_fkey";

-- AlterTable
ALTER TABLE "playlist_songs" ADD COLUMN     "album" TEXT,
ADD COLUMN     "albumArtURL" TEXT,
ADD COLUMN     "artist" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "previewURL" TEXT,
ADD COLUMN     "releaseDate" TIMESTAMP(3),
ADD COLUMN     "spotifyId" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "youtubeId" TEXT;

-- DropTable
DROP TABLE "songs";

-- CreateIndex
CREATE UNIQUE INDEX "playlist_songs_spotifyId_key" ON "playlist_songs"("spotifyId");

-- CreateIndex
CREATE UNIQUE INDEX "playlist_songs_youtubeId_key" ON "playlist_songs"("youtubeId");
