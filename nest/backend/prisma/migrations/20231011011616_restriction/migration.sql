/*
  Warnings:

  - Added the required column `chatroomId` to the `Chatroom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `superAdminId` to the `Chatroom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chatroom" ADD COLUMN     "chatroomId" TEXT NOT NULL,
ADD COLUMN     "superAdminId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Chatroom" ADD CONSTRAINT "Chatroom_superAdminId_chatroomId_fkey" FOREIGN KEY ("superAdminId", "chatroomId") REFERENCES "ChatroomUser"("userId", "chatroomId") ON DELETE RESTRICT ON UPDATE CASCADE;
