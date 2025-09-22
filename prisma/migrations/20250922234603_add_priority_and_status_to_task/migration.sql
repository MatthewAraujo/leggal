/*
  Warnings:

  - You are about to drop the column `content` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `tasks` table. All the data in the column will be lost.
  - Added the required column `description` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- DropIndex
DROP INDEX "public"."tasks_slug_key";

-- AlterTable
ALTER TABLE "public"."tasks" DROP COLUMN "content",
DROP COLUMN "slug",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "priority" "public"."Priority" NOT NULL,
ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'PENDING';
