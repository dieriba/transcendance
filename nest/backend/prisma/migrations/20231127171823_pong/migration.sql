/*
  Warnings:

  - You are about to drop the column `penFriend` on the `ChatroomUser` table. All the data in the column will be lost.
  - You are about to drop the column `loserId` on the `GameHistory` table. All the data in the column will be lost.
  - Made the column `winnerId` on table `GameHistory` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "GameHistory" DROP CONSTRAINT "GameHistory_loserId_fkey";

-- DropForeignKey
ALTER TABLE "GameHistory" DROP CONSTRAINT "GameHistory_winnerId_fkey";

-- AlterTable
ALTER TABLE "ChatroomUser" DROP COLUMN "penFriend";

-- AlterTable
ALTER TABLE "GameHistory" DROP COLUMN "loserId",
ALTER COLUMN "winnerId" SET NOT NULL;
