/*
  Warnings:

  - You are about to drop the column `invitedUser` on the `ChatroomUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chatroom" ADD COLUMN     "invitedUser" TEXT[];

-- AlterTable
ALTER TABLE "ChatroomUser" DROP COLUMN "invitedUser";
