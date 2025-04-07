-- DropForeignKey
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_creatorId_fkey";

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
