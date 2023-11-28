/*
  Warnings:

  - You are about to drop the column `fullname` on the `Profile` table. All the data in the column will be lost.
  - Added the required column `messageTypes` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MESSAGE_TYPES" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'LINK');

-- AlterTable
ALTER TABLE "Chatroom" ADD COLUMN     "hasStarted" BOOLEAN DEFAULT false,
ADD COLUMN     "isPinned" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "messageTypes" "MESSAGE_TYPES" NOT NULL;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "fullname";
