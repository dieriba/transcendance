/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `ChatroomUser` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Chatroom" DROP CONSTRAINT "Chatroom_superAdminId_chatroomId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "ChatroomUser_userId_key" ON "ChatroomUser"("userId");

-- AddForeignKey
ALTER TABLE "Chatroom" ADD CONSTRAINT "Chatroom_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "ChatroomUser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
