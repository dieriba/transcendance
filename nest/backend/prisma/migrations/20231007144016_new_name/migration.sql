/*
  Warnings:

  - You are about to drop the `BlockUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BlockUser" DROP CONSTRAINT "BlockUser_blockedById_fkey";

-- DropForeignKey
ALTER TABLE "BlockUser" DROP CONSTRAINT "BlockUser_blockedUserId_fkey";

-- DropTable
DROP TABLE "BlockUser";

-- CreateTable
CREATE TABLE "_blockUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_blockUser_AB_unique" ON "_blockUser"("A", "B");

-- CreateIndex
CREATE INDEX "_blockUser_B_index" ON "_blockUser"("B");

-- AddForeignKey
ALTER TABLE "_blockUser" ADD CONSTRAINT "_blockUser_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blockUser" ADD CONSTRAINT "_blockUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
