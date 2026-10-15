CREATE TABLE "IeltsBotAccount" (
  "id" TEXT NOT NULL,
  "state" JSONB NOT NULL,
  "revision" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IeltsBotAccount_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "IeltsBotUpdate" (
  "accountId" TEXT NOT NULL,
  "updateId" BIGINT NOT NULL,
  "reply" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'prepared',
  "messageId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IeltsBotUpdate_pkey" PRIMARY KEY ("accountId", "updateId"),
  CONSTRAINT "IeltsBotUpdate_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "IeltsBotAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
