/*
  Warnings:

  - You are about to drop the column `allowedToForeignDm` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "allowedToForeignDm",
ADD COLUMN     "allowedForeignToDm" BOOLEAN NOT NULL DEFAULT false;
