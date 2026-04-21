/*
  Warnings:

  - You are about to drop the column `roles` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `platformRole` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "TenantRole" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "roles",
ADD COLUMN     "tenantRoles" "TenantRole"[] DEFAULT ARRAY['USER']::"TenantRole"[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "platformRole",
ADD COLUMN     "platformRoles" "PlatformRole"[] DEFAULT ARRAY['USER']::"PlatformRole"[];

-- DropEnum
DROP TYPE "PlatformRoles";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_lastUsedAt_idx" ON "Session"("lastUsedAt");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Session_refreshTokenHash_idx" ON "Session"("refreshTokenHash");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
