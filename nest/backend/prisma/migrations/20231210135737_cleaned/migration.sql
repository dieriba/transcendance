/*
  Warnings:

  - You are about to drop the column `groupImage` on the `Chatroom` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfUser` on the `Chatroom` table. All the data in the column will be lost.
  - You are about to alter the column `chatroomName` on the `Chatroom` table. The data in that column could be lost. The data in that column will be cast from `VarChar(30)` to `VarChar(20)`.
  - You are about to alter the column `password` on the `Chatroom` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(24)`.
  - You are about to alter the column `password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(24)`.
  - You are about to drop the `Notifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_userId_fkey";

-- AlterTable
ALTER TABLE "Chatroom" DROP COLUMN "groupImage",
DROP COLUMN "numberOfUser",
ALTER COLUMN "chatroomName" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(24);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" SET DATA TYPE VARCHAR(24);

-- DropTable
DROP TABLE "Notifications";
