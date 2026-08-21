-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "needsRevision" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "revisionNote" TEXT;
