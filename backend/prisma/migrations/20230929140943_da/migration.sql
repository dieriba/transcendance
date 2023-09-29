/*
  Warnings:

  - You are about to drop the column `profile_picture` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "profile_picture",
ADD COLUMN     "avatar" TEXT;
