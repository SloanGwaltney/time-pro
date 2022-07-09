/*
  Warnings:

  - A unique constraint covering the columns `[number]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "ChargeCode" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdById" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "ChargeCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChargeCode_number_key" ON "ChargeCode"("number");

-- CreateIndex
CREATE UNIQUE INDEX "ChargeCode_projectId_number_key" ON "ChargeCode"("projectId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Project_number_key" ON "Project"("number");

-- AddForeignKey
ALTER TABLE "ChargeCode" ADD CONSTRAINT "ChargeCode_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChargeCode" ADD CONSTRAINT "ChargeCode_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
