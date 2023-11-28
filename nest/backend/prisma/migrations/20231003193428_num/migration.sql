/*
  Warnings:

  - You are about to drop the column `user_nickname` on the `ChatroomUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,chatroom_id]` on the table `ChatroomUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `ChatroomUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatroomUser" DROP CONSTRAINT "ChatroomUser_user_nickname_fkey";

-- DropIndex
DROP INDEX "ChatroomUser_user_nickname_chatroom_id_key";

-- AlterTable
ALTER TABLE "ChatroomUser" DROP COLUMN "user_nickname",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ChatroomUser_user_id_chatroom_id_key" ON "ChatroomUser"("user_id", "chatroom_id");

-- AddForeignKey
ALTER TABLE "ChatroomUser" ADD CONSTRAINT "ChatroomUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
