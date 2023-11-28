/*
  Warnings:

  - You are about to drop the column `lastname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastname",
DROP COLUMN "name",
ADD COLUMN     "first_name" TEXT DEFAULT 'Unknown',
ADD COLUMN     "last_name" TEXT DEFAULT 'Unknown';
