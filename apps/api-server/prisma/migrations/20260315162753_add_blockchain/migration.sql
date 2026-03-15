-- CreateTable
CREATE TABLE "blocks" (
    "id" TEXT NOT NULL,
    "index" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "prevHash" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nonce" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block_transactions" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "fromUserId" TEXT,
    "toUserId" TEXT,
    "data" JSONB NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "block_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blocks_index_key" ON "blocks"("index");

-- CreateIndex
CREATE UNIQUE INDEX "blocks_hash_key" ON "blocks"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "block_transactions_hash_key" ON "block_transactions"("hash");

-- AddForeignKey
ALTER TABLE "block_transactions" ADD CONSTRAINT "block_transactions_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "blocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
