/*
  Warnings:

  - You are about to drop the column `chatroomId` on the `Chatroom` table. All the data in the column will be lost.
  - You are about to drop the column `superAdminId` on the `Chatroom` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Chatroom" DROP CONSTRAINT "Chatroom_superAdminId_fkey";

-- DropIndex
DROP INDEX "ChatroomUser_userId_key";

-- AlterTable
ALTER TABLE "Chatroom" DROP COLUMN "chatroomId",
DROP COLUMN "superAdminId",
ADD COLUMN     "numberOfUser" INTEGER NOT NULL DEFAULT 0;
