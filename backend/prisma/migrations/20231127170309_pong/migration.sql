/*
  Warnings:

  - You are about to drop the column `pongLosses` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `pongVictory` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "pongLosses",
DROP COLUMN "pongVictory";

-- CreateTable
CREATE TABLE "Pong" (
    "userId" TEXT NOT NULL,
    "victory" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Pong_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "Pong" ADD CONSTRAINT "Pong_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
