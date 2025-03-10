/*
  Warnings:

  - Added the required column `likes` to the `playlists` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "playlists" ADD COLUMN     "likes" INTEGER NOT NULL;
