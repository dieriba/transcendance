/*
  Warnings:

  - You are about to drop the column `losses` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `victory` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "losses",
DROP COLUMN "victory",
ADD COLUMN     "pongLosses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pongVictory" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Pong" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Pong_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pong_userId_key" ON "Pong"("userId");

-- AddForeignKey
ALTER TABLE "Pong" ADD CONSTRAINT "Pong_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
