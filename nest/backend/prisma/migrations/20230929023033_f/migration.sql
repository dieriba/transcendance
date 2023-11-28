/*
  Warnings:

  - You are about to drop the column `nickname` on the `Profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nickname]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nickname` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Profile_nickname_key";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "nickname";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nickname" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");
