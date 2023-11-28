/*
  Warnings:

  - You are about to drop the column `magicWord` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TwoFa" ADD COLUMN     "answer" TEXT,
ADD COLUMN     "question" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "magicWord";
