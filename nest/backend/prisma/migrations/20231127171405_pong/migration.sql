/*
  Warnings:

  - The primary key for the `Pong` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId]` on the table `Pong` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "GameHistory" DROP CONSTRAINT "GameHistory_loserId_fkey";

-- DropForeignKey
ALTER TABLE "GameHistory" DROP CONSTRAINT "GameHistory_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "GameHistory" DROP CONSTRAINT "GameHistory_user2Id_fkey";

-- DropForeignKey
ALTER TABLE "GameHistory" DROP CONSTRAINT "GameHistory_winnerId_fkey";

-- AlterTable
ALTER TABLE "Pong" DROP CONSTRAINT "Pong_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "Pong_userId_key" ON "Pong"("userId");

-- AddForeignKey
ALTER TABLE "GameHistory" ADD CONSTRAINT "GameHistory_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "Pong"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameHistory" ADD CONSTRAINT "GameHistory_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "Pong"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameHistory" ADD CONSTRAINT "GameHistory_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Pong"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameHistory" ADD CONSTRAINT "GameHistory_loserId_fkey" FOREIGN KEY ("loserId") REFERENCES "Pong"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
