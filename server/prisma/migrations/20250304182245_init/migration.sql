-- AlterTable
ALTER TABLE "users" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "accessTokenExpiration" TIMESTAMP(3),
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "refreshTokenExpiration" TIMESTAMP(3);
