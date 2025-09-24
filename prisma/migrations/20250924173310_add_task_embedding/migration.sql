-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN  "embedding" public.vector(1536);
