/*
  Warnings:

  - You are about to drop the column `user_id` on the `ChatroomUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_nickname,chatroom_id]` on the table `ChatroomUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_nickname` to the `ChatroomUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatroomUser" DROP CONSTRAINT "ChatroomUser_user_id_fkey";

-- DropIndex
DROP INDEX "ChatroomUser_user_id_chatroom_id_key";

-- AlterTable
ALTER TABLE "Chatroom" ADD COLUMN     "number_of_user" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ChatroomUser" DROP COLUMN "user_id",
ADD COLUMN     "user_nickname" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ChatroomUser_user_nickname_chatroom_id_key" ON "ChatroomUser"("user_nickname", "chatroom_id");

-- AddForeignKey
ALTER TABLE "ChatroomUser" ADD CONSTRAINT "ChatroomUser_user_nickname_fkey" FOREIGN KEY ("user_nickname") REFERENCES "User"("nickname") ON DELETE RESTRICT ON UPDATE CASCADE;
