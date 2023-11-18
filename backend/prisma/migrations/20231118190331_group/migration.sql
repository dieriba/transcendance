-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "allowAll" BOOLEAN NOT NULL,
    "onlyAllowFriend" BOOLEAN NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
