/*
  Warnings:

  - Added the required column `senderNickname` to the `FriendRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FriendRequest" ADD COLUMN     "senderNickname" TEXT NOT NULL;
