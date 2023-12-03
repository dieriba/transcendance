-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'GENDERFLUID', 'NON_BINARY', 'MULTIGENDER', 'TRANSGENDER', 'DOG', 'HORSE');

-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('DIERIBA', 'CHAT_ADMIN', 'REGULAR_USER');

-- CreateEnum
CREATE TYPE "RESTRICTION" AS ENUM ('BANNED', 'MUTED', 'KICKED');

-- CreateEnum
CREATE TYPE "STATUS" AS ENUM ('ONLINE', 'OFFLINE', 'PLAYING');

-- CreateEnum
CREATE TYPE "TYPE" AS ENUM ('PUBLIC', 'PRIVATE', 'PROTECTED', 'DM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nickname" VARCHAR(16) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "status" "STATUS" NOT NULL DEFAULT 'OFFLINE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hashedRefreshToken" TEXT,
    "allowForeignToDm" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameHistory" (
    "id" TEXT NOT NULL,
    "winnerId" TEXT NOT NULL,
    "looserId" TEXT NOT NULL,
    "matchDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "allowAll" BOOLEAN NOT NULL,
    "onlyAllowFriend" BOOLEAN NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pong" (
    "userId" TEXT NOT NULL,
    "victory" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Friends" (
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "FriendRequest" (
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "avatar" TEXT,
    "firstname" VARCHAR(25),
    "lastname" VARCHAR(25),

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(15) NOT NULL,
    "description" VARCHAR(50) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chatroom" (
    "id" TEXT NOT NULL,
    "chatroomName" VARCHAR(30),
    "password" TEXT,
    "type" "TYPE" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "numberOfUser" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "groupImage" TEXT,

    CONSTRAINT "Chatroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "content" VARCHAR(255) NOT NULL,
    "imageUrl" TEXT,
    "userId" TEXT NOT NULL,
    "chatroomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatroomUser" (
    "userId" TEXT NOT NULL,
    "chatroomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "ROLE" DEFAULT 'REGULAR_USER',
    "penFriend" TEXT
);

-- CreateTable
CREATE TABLE "InvitedUser" (
    "userId" TEXT NOT NULL,
    "chatroomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "RestrictedUser" (
    "adminId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chatroomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "restriction" "RESTRICTION",
    "restrictionTimeStart" TIMESTAMP(3),
    "restrictionTimeEnd" TIMESTAMP(3),
    "banLife" BOOLEAN NOT NULL,
    "reason" VARCHAR(255)
);

-- CreateTable
CREATE TABLE "TwoFa" (
    "id" TEXT NOT NULL,
    "otpSecret" TEXT,
    "otpTempSecret" TEXT,
    "otpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "question" TEXT,
    "answer" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TwoFa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_blockUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_blockedUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GameHistory_winnerId_looserId_matchDate_key" ON "GameHistory"("winnerId", "looserId", "matchDate");

-- CreateIndex
CREATE UNIQUE INDEX "Pong_userId_key" ON "Pong"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Friends_userId_friendId_key" ON "Friends"("userId", "friendId");

-- CreateIndex
CREATE UNIQUE INDEX "FriendRequest_senderId_recipientId_key" ON "FriendRequest"("senderId", "recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Chatroom_chatroomName_key" ON "Chatroom"("chatroomName");

-- CreateIndex
CREATE UNIQUE INDEX "ChatroomUser_userId_chatroomId_key" ON "ChatroomUser"("userId", "chatroomId");

-- CreateIndex
CREATE UNIQUE INDEX "InvitedUser_userId_chatroomId_key" ON "InvitedUser"("userId", "chatroomId");

-- CreateIndex
CREATE UNIQUE INDEX "RestrictedUser_userId_chatroomId_key" ON "RestrictedUser"("userId", "chatroomId");

-- CreateIndex
CREATE UNIQUE INDEX "TwoFa_userId_key" ON "TwoFa"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_blockUser_AB_unique" ON "_blockUser"("A", "B");

-- CreateIndex
CREATE INDEX "_blockUser_B_index" ON "_blockUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_blockedUsers_AB_unique" ON "_blockedUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_blockedUsers_B_index" ON "_blockedUsers"("B");

-- AddForeignKey
ALTER TABLE "GameHistory" ADD CONSTRAINT "GameHistory_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Pong"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameHistory" ADD CONSTRAINT "GameHistory_looserId_fkey" FOREIGN KEY ("looserId") REFERENCES "Pong"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pong" ADD CONSTRAINT "Pong_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatroomId_fkey" FOREIGN KEY ("chatroomId") REFERENCES "Chatroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatroomUser" ADD CONSTRAINT "ChatroomUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatroomUser" ADD CONSTRAINT "ChatroomUser_chatroomId_fkey" FOREIGN KEY ("chatroomId") REFERENCES "Chatroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitedUser" ADD CONSTRAINT "InvitedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitedUser" ADD CONSTRAINT "InvitedUser_chatroomId_fkey" FOREIGN KEY ("chatroomId") REFERENCES "Chatroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestrictedUser" ADD CONSTRAINT "RestrictedUser_adminId_chatroomId_fkey" FOREIGN KEY ("adminId", "chatroomId") REFERENCES "ChatroomUser"("userId", "chatroomId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestrictedUser" ADD CONSTRAINT "RestrictedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestrictedUser" ADD CONSTRAINT "RestrictedUser_chatroomId_fkey" FOREIGN KEY ("chatroomId") REFERENCES "Chatroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwoFa" ADD CONSTRAINT "TwoFa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blockUser" ADD CONSTRAINT "_blockUser_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blockUser" ADD CONSTRAINT "_blockUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blockedUsers" ADD CONSTRAINT "_blockedUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Chatroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blockedUsers" ADD CONSTRAINT "_blockedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
