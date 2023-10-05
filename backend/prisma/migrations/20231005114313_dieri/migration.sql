/*
  Warnings:

  - You are about to drop the column `name` on the `Chatroom` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chatroom" DROP COLUMN "name",
ADD COLUMN     "chatroom_name" TEXT;
