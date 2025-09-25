/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `tasks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tasks_slug_key" ON "tasks"("slug");
