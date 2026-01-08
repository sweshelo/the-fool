-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 1500,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MatchingQueue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "minRating" INTEGER,
    "maxRating" INTEGER,
    "rulePreference" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MatchingQueueEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "queueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "MatchingQueueEntry_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "MatchingQueue" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatchingQueueEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'WAITING',
    "rule" TEXT NOT NULL,
    "winnerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" DATETIME,
    "finishedAt" DATETIME
);

-- CreateTable
CREATE TABLE "PlayerInRoom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinOrder" INTEGER NOT NULL,
    "deckData" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlayerInRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayerInRoom_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "MatchingQueue_mode_status_createdAt_idx" ON "MatchingQueue"("mode", "status", "createdAt");

-- CreateIndex
CREATE INDEX "MatchingQueue_status_expiresAt_idx" ON "MatchingQueue"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "MatchingQueueEntry_userId_status_idx" ON "MatchingQueueEntry"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MatchingQueueEntry_queueId_userId_key" ON "MatchingQueueEntry"("queueId", "userId");

-- CreateIndex
CREATE INDEX "Room_state_createdAt_idx" ON "Room"("state", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerInRoom_roomId_userId_key" ON "PlayerInRoom"("roomId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerInRoom_roomId_joinOrder_key" ON "PlayerInRoom"("roomId", "joinOrder");
