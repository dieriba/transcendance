/*
  Warnings:

  - Made the column `type` on table `Chatroom` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Chatroom" ALTER COLUMN "type" SET NOT NULL;

-- AlterTable
ALTER TABLE "ChatroomUser" ADD COLUMN     "dm" TEXT;
