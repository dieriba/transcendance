/*
  Warnings:

  - You are about to drop the column `chatroom_name` on the `Chatroom` table. All the data in the column will be lost.
  - You are about to drop the column `number_of_user` on the `Chatroom` table. All the data in the column will be lost.
  - You are about to drop the column `chatroom_id` on the `ChatroomUser` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `ChatroomUser` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `ChatroomUser` table. All the data in the column will be lost.
  - You are about to drop the column `user_nickname` on the `ChatroomUser` table. All the data in the column will be lost.
  - You are about to drop the column `chatroom_id` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `chatroom_id` on the `RestrictedUser` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `RestrictedUser` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `RestrictedUser` table. All the data in the column will be lost.
  - You are about to drop the column `otp_auth_url` on the `TwoFa` table. All the data in the column will be lost.
  - You are about to drop the column `otp_enabled` on the `TwoFa` table. All the data in the column will be lost.
  - You are about to drop the column `otp_secret` on the `TwoFa` table. All the data in the column will be lost.
  - You are about to drop the column `otp_validated` on the `TwoFa` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `TwoFa` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hashed_refresh_token` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userNickname,chatroomId]` on the table `ChatroomUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,chatroomId]` on the table `RestrictedUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `TwoFa` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chatroomId` to the `ChatroomUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ChatroomUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userNickname` to the `ChatroomUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chatroomId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chatroomId` to the `RestrictedUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `RestrictedUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `TwoFa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatroomUser" DROP CONSTRAINT "ChatroomUser_chatroom_id_fkey";

-- DropForeignKey
ALTER TABLE "ChatroomUser" DROP CONSTRAINT "ChatroomUser_user_nickname_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatroom_id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_user_id_fkey";

-- DropForeignKey
ALTER TABLE "RestrictedUser" DROP CONSTRAINT "RestrictedUser_chatroom_id_fkey";

-- DropForeignKey
ALTER TABLE "RestrictedUser" DROP CONSTRAINT "RestrictedUser_user_id_fkey";

-- DropForeignKey
ALTER TABLE "TwoFa" DROP CONSTRAINT "TwoFa_user_id_fkey";

-- DropIndex
DROP INDEX "ChatroomUser_user_nickname_chatroom_id_key";

-- DropIndex
DROP INDEX "Profile_user_id_key";

-- DropIndex
DROP INDEX "RestrictedUser_user_id_chatroom_id_key";

-- DropIndex
DROP INDEX "TwoFa_user_id_key";

-- AlterTable
ALTER TABLE "Chatroom" DROP COLUMN "chatroom_name",
DROP COLUMN "number_of_user",
ADD COLUMN     "chatroomName" TEXT,
ADD COLUMN     "numberOfUser" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ChatroomUser" DROP COLUMN "chatroom_id",
DROP COLUMN "created_at",
DROP COLUMN "updated_at",
DROP COLUMN "user_nickname",
ADD COLUMN     "chatroomId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userNickname" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "chatroom_id",
DROP COLUMN "image_url",
DROP COLUMN "user_id",
ADD COLUMN     "chatroomId" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "first_name",
DROP COLUMN "last_name",
DROP COLUMN "user_id",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RestrictedUser" DROP COLUMN "chatroom_id",
DROP COLUMN "created_at",
DROP COLUMN "user_id",
ADD COLUMN     "chatroomId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TwoFa" DROP COLUMN "otp_auth_url",
DROP COLUMN "otp_enabled",
DROP COLUMN "otp_secret",
DROP COLUMN "otp_validated",
DROP COLUMN "user_id",
ADD COLUMN     "otpAuthUrl" TEXT,
ADD COLUMN     "otpEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otpSecret" TEXT,
ADD COLUMN     "otpValidated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "created_at",
DROP COLUMN "hashed_refresh_token",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "hashedRefreshToken" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ChatroomUser_userNickname_chatroomId_key" ON "ChatroomUser"("userNickname", "chatroomId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RestrictedUser_userId_chatroomId_key" ON "RestrictedUser"("userId", "chatroomId");

-- CreateIndex
CREATE UNIQUE INDEX "TwoFa_userId_key" ON "TwoFa"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatroomId_fkey" FOREIGN KEY ("chatroomId") REFERENCES "Chatroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatroomUser" ADD CONSTRAINT "ChatroomUser_userNickname_fkey" FOREIGN KEY ("userNickname") REFERENCES "User"("nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatroomUser" ADD CONSTRAINT "ChatroomUser_chatroomId_fkey" FOREIGN KEY ("chatroomId") REFERENCES "Chatroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestrictedUser" ADD CONSTRAINT "RestrictedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestrictedUser" ADD CONSTRAINT "RestrictedUser_chatroomId_fkey" FOREIGN KEY ("chatroomId") REFERENCES "Chatroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwoFa" ADD CONSTRAINT "TwoFa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
