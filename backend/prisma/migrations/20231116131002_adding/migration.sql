/*
  Warnings:

  - You are about to drop the column `allowedForeignToDm` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "allowedForeignToDm",
ADD COLUMN     "allowForeignToDm" BOOLEAN NOT NULL DEFAULT false;
