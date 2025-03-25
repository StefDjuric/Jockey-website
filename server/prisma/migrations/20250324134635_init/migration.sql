-- CreateTable
CREATE TABLE "playlist_likes" (
    "id" SERIAL NOT NULL,
    "playlistId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playlist_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "playlist_likes_playlistId_userId_key" ON "playlist_likes"("playlistId", "userId");

-- AddForeignKey
ALTER TABLE "playlist_likes" ADD CONSTRAINT "playlist_likes_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_likes" ADD CONSTRAINT "playlist_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
