/*
  Warnings:

  - You are about to drop the column `content` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `tasks` table. All the data in the column will be lost.
  - Added the required column `description` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- DropIndex
DROP INDEX "tasks_slug_key";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "content",
DROP COLUMN "slug",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "priority" "Priority" NOT NULL,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING';
