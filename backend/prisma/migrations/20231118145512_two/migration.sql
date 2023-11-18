/*
  Warnings:

  - You are about to drop the column `otpAuthUrl` on the `TwoFa` table. All the data in the column will be lost.
  - You are about to drop the column `otpValidated` on the `TwoFa` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TwoFa" DROP COLUMN "otpAuthUrl",
DROP COLUMN "otpValidated",
ADD COLUMN     "otpTempSecret" TEXT;
