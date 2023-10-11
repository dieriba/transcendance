/*
  Warnings:

  - The values [MODERATOR] on the enum `ROLE` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ROLE_new" AS ENUM ('DIERIBA', 'CHAT_ADMIN', 'REGULAR_USER');
ALTER TABLE "ChatroomUser" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "ChatroomUser" ALTER COLUMN "role" TYPE "ROLE_new" USING ("role"::text::"ROLE_new");
ALTER TYPE "ROLE" RENAME TO "ROLE_old";
ALTER TYPE "ROLE_new" RENAME TO "ROLE";
DROP TYPE "ROLE_old";
ALTER TABLE "ChatroomUser" ALTER COLUMN "role" SET DEFAULT 'REGULAR_USER';
COMMIT;
