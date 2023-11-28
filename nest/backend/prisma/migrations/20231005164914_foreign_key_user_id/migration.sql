/*
  Warnings:

  - You are about to drop the column `userNickname` on the `ChatroomUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,chatroomId]` on the table `ChatroomUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `ChatroomUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatroomUser" DROP CONSTRAINT "ChatroomUser_userNickname_fkey";

-- DropIndex
DROP INDEX "ChatroomUser_userNickname_chatroomId_key";

-- AlterTable
ALTER TABLE "ChatroomUser" DROP COLUMN "userNickname",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ChatroomUser_userId_chatroomId_key" ON "ChatroomUser"("userId", "chatroomId");

-- AddForeignKey
ALTER TABLE "ChatroomUser" ADD CONSTRAINT "ChatroomUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
