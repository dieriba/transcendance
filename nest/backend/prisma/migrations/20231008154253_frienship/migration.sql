/*
  Warnings:

  - You are about to drop the `Follows` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "REQUEST_STATUS" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "Follows" DROP CONSTRAINT "Follows_followerId_fkey";

-- DropForeignKey
ALTER TABLE "Follows" DROP CONSTRAINT "Follows_followingId_fkey";

-- DropTable
DROP TABLE "Follows";

-- CreateTable
CREATE TABLE "FriendRequest" (
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "status" "REQUEST_STATUS" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "FriendRequest_senderId_recipientId_key" ON "FriendRequest"("senderId", "recipientId");

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
