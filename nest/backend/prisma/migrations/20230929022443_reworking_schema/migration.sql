/*
  Warnings:

  - You are about to drop the column `first_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fullname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `nickname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otp_auth_url` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otp_enabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otp_secret` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otp_validated` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profile_picture` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_nickname_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "first_name",
DROP COLUMN "fullname",
DROP COLUMN "last_name",
DROP COLUMN "nickname",
DROP COLUMN "otp_auth_url",
DROP COLUMN "otp_enabled",
DROP COLUMN "otp_secret",
DROP COLUMN "otp_validated",
DROP COLUMN "profile_picture",
DROP COLUMN "refresh_token";

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "first_name" TEXT DEFAULT 'Unknown',
    "last_name" TEXT DEFAULT 'Unknown',
    "fullname" TEXT DEFAULT 'Unknown',
    "nickname" TEXT NOT NULL,
    "profile_picture" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwoFa" (
    "id" TEXT NOT NULL,
    "otp_secret" TEXT,
    "otp_auth_url" TEXT,
    "otp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "otp_validated" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TwoFa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_nickname_key" ON "Profile"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TwoFa_userId_key" ON "TwoFa"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwoFa" ADD CONSTRAINT "TwoFa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
