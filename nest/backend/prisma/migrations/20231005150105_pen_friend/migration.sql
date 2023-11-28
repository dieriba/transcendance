/*
  Warnings:

  - You are about to drop the column `penfriend` on the `ChatroomUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatroomUser" DROP COLUMN "penfriend",
ADD COLUMN     "penFriend" TEXT;
