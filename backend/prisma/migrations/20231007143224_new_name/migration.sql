/*
  Warnings:

  - The primary key for the `BlockUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `blockedByUserId` on the `BlockUser` table. All the data in the column will be lost.
  - Added the required column `blockedById` to the `BlockUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BlockUser" DROP CONSTRAINT "BlockUser_blockedByUserId_fkey";

-- AlterTable
ALTER TABLE "BlockUser" DROP CONSTRAINT "BlockUser_pkey",
DROP COLUMN "blockedByUserId",
ADD COLUMN     "blockedById" TEXT NOT NULL,
ADD CONSTRAINT "BlockUser_pkey" PRIMARY KEY ("blockedUserId", "blockedById");

-- AddForeignKey
ALTER TABLE "BlockUser" ADD CONSTRAINT "BlockUser_blockedById_fkey" FOREIGN KEY ("blockedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
