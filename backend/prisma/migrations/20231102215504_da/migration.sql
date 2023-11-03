/*
  Warnings:

  - You are about to drop the column `hasStarted` on the `Chatroom` table. All the data in the column will be lost.
  - You are about to drop the column `isPinned` on the `Chatroom` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `FriendRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chatroom" DROP COLUMN "hasStarted",
DROP COLUMN "isPinned";

-- AlterTable
ALTER TABLE "FriendRequest" DROP COLUMN "status";

-- DropEnum
DROP TYPE "REQUEST_STATUS";
