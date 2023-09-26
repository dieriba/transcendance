/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "profilePicture" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "refreshToken" DROP NOT NULL;

-- CreateTable
CREATE TABLE "GroupChat" (
    "id" TEXT NOT NULL,
    "bannedUsers" TEXT[],
    "mutedUsers" TEXT[],

    CONSTRAINT "GroupChat_pkey" PRIMARY KEY ("id")
);
