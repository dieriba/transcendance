/*
  Warnings:

  - Added the required column `banLife` to the `RestrictedUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RestrictedUser" ADD COLUMN     "banLife" BOOLEAN NOT NULL;
