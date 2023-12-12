-- DropForeignKey
ALTER TABLE "RestrictedUser" DROP CONSTRAINT "RestrictedUser_chatroomId_fkey";

-- DropForeignKey
ALTER TABLE "RestrictedUser" DROP CONSTRAINT "RestrictedUser_userId_fkey";

-- AddForeignKey
ALTER TABLE "RestrictedUser" ADD CONSTRAINT "RestrictedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestrictedUser" ADD CONSTRAINT "RestrictedUser_chatroomId_fkey" FOREIGN KEY ("chatroomId") REFERENCES "Chatroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
