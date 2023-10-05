/*
  Warnings:

  - A unique constraint covering the columns `[chatroomName]` on the table `Chatroom` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Chatroom_chatroomName_key" ON "Chatroom"("chatroomName");
