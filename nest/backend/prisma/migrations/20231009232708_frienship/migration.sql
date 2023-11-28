/*
  Warnings:

  - You are about to drop the column `privilege` on the `ChatroomUser` table. All the data in the column will be lost.
  - You are about to drop the column `restriction` on the `ChatroomUser` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RESTRICTION" ADD VALUE 'BAN';
ALTER TYPE "RESTRICTION" ADD VALUE 'KICK';

-- AlterTable
ALTER TABLE "ChatroomUser" DROP COLUMN "privilege",
DROP COLUMN "restriction",
ADD COLUMN     "role" "ROLE" DEFAULT 'REGULAR_USER';

-- AlterTable
ALTER TABLE "RestrictedUser" ADD COLUMN     "restrictionTimeEnd" TIMESTAMP(3),
ADD COLUMN     "restrictionTimeStart" TIMESTAMP(3);
