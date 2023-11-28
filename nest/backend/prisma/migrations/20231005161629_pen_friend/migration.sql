/*
  Warnings:

  - You are about to alter the column `chatroomName` on the `Chatroom` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.
  - You are about to alter the column `content` on the `Message` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `fullname` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(25)`.
  - You are about to alter the column `firstName` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(25)`.
  - You are about to alter the column `lastName` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(25)`.
  - You are about to alter the column `nickname` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(16)`.

*/
-- AlterEnum
ALTER TYPE "TYPE" ADD VALUE 'DM';

-- AlterTable
ALTER TABLE "Chatroom" ALTER COLUMN "chatroomName" SET DATA TYPE VARCHAR(15);

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "content" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "fullname" SET DATA TYPE VARCHAR(25),
ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(25),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(25);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "nickname" SET DATA TYPE VARCHAR(16);
