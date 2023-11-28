/*
  Warnings:

  - You are about to drop the column `dm` on the `ChatroomUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatroomUser" DROP COLUMN "dm",
ADD COLUMN     "penfriend" TEXT,
ALTER COLUMN "privilege" SET DEFAULT 'REGULAR_USER';
