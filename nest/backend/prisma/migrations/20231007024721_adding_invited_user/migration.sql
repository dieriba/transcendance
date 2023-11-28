/*
  Warnings:

  - You are about to drop the `_BlockedUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BlockedUsers" DROP CONSTRAINT "_BlockedUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_BlockedUsers" DROP CONSTRAINT "_BlockedUsers_B_fkey";

-- DropTable
DROP TABLE "_BlockedUsers";

-- CreateTable
CREATE TABLE "BlockUser" (
    "blockedUserId" TEXT NOT NULL,
    "blockingUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockUser_pkey" PRIMARY KEY ("blockedUserId","blockingUserId")
);

-- AddForeignKey
ALTER TABLE "BlockUser" ADD CONSTRAINT "BlockUser_blockedUserId_fkey" FOREIGN KEY ("blockedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockUser" ADD CONSTRAINT "BlockUser_blockingUserId_fkey" FOREIGN KEY ("blockingUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
