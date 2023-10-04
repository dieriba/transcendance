/*
  Warnings:

  - The `privilege` column on the `ChatroomUser` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `restriction` column on the `ChatroomUser` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `restriction` column on the `RestrictedUser` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('DIERIBA', 'CHAT_ADMIN', 'MODERATOR', 'REGULAR_USER');

-- CreateEnum
CREATE TYPE "RESTRICTION" AS ENUM ('MUTED');

-- AlterTable
ALTER TABLE "ChatroomUser" DROP COLUMN "privilege",
ADD COLUMN     "privilege" "ROLE",
DROP COLUMN "restriction",
ADD COLUMN     "restriction" "RESTRICTION";

-- AlterTable
ALTER TABLE "RestrictedUser" DROP COLUMN "restriction",
ADD COLUMN     "restriction" "RESTRICTION";

-- DropEnum
DROP TYPE "Restriction";

-- DropEnum
DROP TYPE "Role";
