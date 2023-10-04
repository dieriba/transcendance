/*
  Warnings:

  - The values [ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `type` to the `Chatroom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `ChatroomUser` table without a default value. This is not possible if the table is not empty.
  - Made the column `gender` on table `Profile` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "STATUS" AS ENUM ('ONLINE', 'OFFLINE', 'PLAYING');

-- CreateEnum
CREATE TYPE "TYPE" AS ENUM ('PUBLIC', 'PRIVATE', 'PROTECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('DIERIBA', 'CHAT_ADMIN', 'MODERATOR', 'REGULAR_USER');
ALTER TABLE "ChatroomUser" ALTER COLUMN "privilege" TYPE "Role_new" USING ("privilege"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- AlterTable
ALTER TABLE "Chatroom" ADD COLUMN     "password" TEXT,
ADD COLUMN     "type" "TYPE" NOT NULL;

-- AlterTable
ALTER TABLE "ChatroomUser" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "gender" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "STATUS" NOT NULL DEFAULT 'OFFLINE';
