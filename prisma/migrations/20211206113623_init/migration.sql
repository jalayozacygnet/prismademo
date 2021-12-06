/*
  Warnings:

  - You are about to drop the column `teacherId` on the `Subjects` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subjects" DROP COLUMN "teacherId";

-- CreateTable
CREATE TABLE "TeacherSubjects" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER,
    "subjectId" INTEGER,

    CONSTRAINT "TeacherSubjects_pkey" PRIMARY KEY ("id")
);
