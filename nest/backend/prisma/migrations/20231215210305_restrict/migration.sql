-- DropForeignKey
ALTER TABLE "RestrictedUser" DROP CONSTRAINT "RestrictedUser_adminId_chatroomId_fkey";

-- AddForeignKey
ALTER TABLE "RestrictedUser" ADD CONSTRAINT "RestrictedUser_adminId_chatroomId_fkey" FOREIGN KEY ("adminId", "chatroomId") REFERENCES "ChatroomUser"("userId", "chatroomId") ON DELETE CASCADE ON UPDATE CASCADE;
