/*
  Warnings:

  - The values [REJECTED] on the enum `REQUEST_STATUS` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `userId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "REQUEST_STATUS_new" AS ENUM ('PENDING', 'ACCEPTED');
ALTER TABLE "FriendRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "FriendRequest" ALTER COLUMN "status" TYPE "REQUEST_STATUS_new" USING ("status"::text::"REQUEST_STATUS_new");
ALTER TYPE "REQUEST_STATUS" RENAME TO "REQUEST_STATUS_old";
ALTER TYPE "REQUEST_STATUS_new" RENAME TO "REQUEST_STATUS";
DROP TYPE "REQUEST_STATUS_old";
ALTER TABLE "FriendRequest" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Friends" (
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Friends_userId_friendId_key" ON "Friends"("userId", "friendId");

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
