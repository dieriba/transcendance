/*
  Warnings:

  - You are about to drop the column `opt_validated` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "opt_validated",
ADD COLUMN     "otp_validated" BOOLEAN NOT NULL DEFAULT false;
