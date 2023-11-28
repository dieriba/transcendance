/*
  Warnings:

  - The values [TEXT,VIDEO,LINK] on the enum `MESSAGE_TYPES` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MESSAGE_TYPES_new" AS ENUM ('IMAGE', 'REPLY', 'DOCUMENT');
ALTER TABLE "Message" ALTER COLUMN "messageTypes" TYPE "MESSAGE_TYPES_new" USING ("messageTypes"::text::"MESSAGE_TYPES_new");
ALTER TYPE "MESSAGE_TYPES" RENAME TO "MESSAGE_TYPES_old";
ALTER TYPE "MESSAGE_TYPES_new" RENAME TO "MESSAGE_TYPES";
DROP TYPE "MESSAGE_TYPES_old";
COMMIT;
