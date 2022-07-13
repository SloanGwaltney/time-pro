-- CreateTable
CREATE TABLE "ProjectPersonnel" (
    "assignedUserId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectPersonnel_pkey" PRIMARY KEY ("assignedUserId","projectId")
);

-- AddForeignKey
ALTER TABLE "ProjectPersonnel" ADD CONSTRAINT "ProjectPersonnel_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPersonnel" ADD CONSTRAINT "ProjectPersonnel_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
