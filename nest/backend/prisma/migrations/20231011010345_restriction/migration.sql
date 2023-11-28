/*
  Warnings:

  - The values [BAN,KICK] on the enum `RESTRICTION` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `adminId` to the `RestrictedUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RESTRICTION_new" AS ENUM ('BANNED', 'MUTED', 'KICKED');
ALTER TABLE "RestrictedUser" ALTER COLUMN "restriction" TYPE "RESTRICTION_new" USING ("restriction"::text::"RESTRICTION_new");
ALTER TYPE "RESTRICTION" RENAME TO "RESTRICTION_old";
ALTER TYPE "RESTRICTION_new" RENAME TO "RESTRICTION";
DROP TYPE "RESTRICTION_old";
COMMIT;

-- AlterTable
ALTER TABLE "RestrictedUser" ADD COLUMN     "adminId" TEXT NOT NULL,
ADD COLUMN     "reason" TEXT;

-- AddForeignKey
ALTER TABLE "RestrictedUser" ADD CONSTRAINT "RestrictedUser_adminId_chatroomId_fkey" FOREIGN KEY ("adminId", "chatroomId") REFERENCES "ChatroomUser"("userId", "chatroomId") ON DELETE RESTRICT ON UPDATE CASCADE;
