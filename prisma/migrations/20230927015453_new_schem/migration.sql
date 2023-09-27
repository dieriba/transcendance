/*
  Warnings:

  - You are about to drop the column `user42` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "user42",
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "fullName" SET DEFAULT 'unknown',
ALTER COLUMN "lastName" SET DEFAULT 'unknown',
ALTER COLUMN "name" SET DEFAULT 'unknown';
