/*
  Warnings:

  - You are about to drop the column `oAuthAccount` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "oAuthAccount",
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "user42" TEXT;
