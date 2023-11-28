/*
  Warnings:

  - You are about to drop the column `invitedUser` on the `Chatroom` table. All the data in the column will be lost.
  - You are about to drop the column `age` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the `Pong` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Pong" DROP CONSTRAINT "Pong_userId_fkey";

-- AlterTable
ALTER TABLE "Chatroom" DROP COLUMN "invitedUser";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "age",
DROP COLUMN "gender";

-- DropTable
DROP TABLE "Pong";

-- CreateTable
CREATE TABLE "InvitedUser" (
    "userId" TEXT NOT NULL,
    "chatroomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "InvitedUser_userId_chatroomId_key" ON "InvitedUser"("userId", "chatroomId");

-- AddForeignKey
ALTER TABLE "InvitedUser" ADD CONSTRAINT "InvitedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitedUser" ADD CONSTRAINT "InvitedUser_chatroomId_fkey" FOREIGN KEY ("chatroomId") REFERENCES "Chatroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
