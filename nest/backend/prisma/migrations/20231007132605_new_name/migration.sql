/*
  Warnings:

  - The primary key for the `BlockUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `blockingUserId` on the `BlockUser` table. All the data in the column will be lost.
  - Added the required column `blockedByUserId` to the `BlockUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BlockUser" DROP CONSTRAINT "BlockUser_blockingUserId_fkey";

-- AlterTable
ALTER TABLE "BlockUser" DROP CONSTRAINT "BlockUser_pkey",
DROP COLUMN "blockingUserId",
ADD COLUMN     "blockedByUserId" TEXT NOT NULL,
ADD CONSTRAINT "BlockUser_pkey" PRIMARY KEY ("blockedUserId", "blockedByUserId");

-- AddForeignKey
ALTER TABLE "BlockUser" ADD CONSTRAINT "BlockUser_blockedByUserId_fkey" FOREIGN KEY ("blockedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
