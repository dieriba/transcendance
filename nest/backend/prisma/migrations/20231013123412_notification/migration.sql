-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(15) NOT NULL,
    "description" VARCHAR(50) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
