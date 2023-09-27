/*
  Warnings:

  - You are about to drop the column `user42Id` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "user42Id",
ADD COLUMN     "oAuthAccount" BOOLEAN NOT NULL DEFAULT false;
