-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ITEM_VERIFIED', 'ITEM_REJECTED');

-- CreateTable
CREATE TABLE "notifications" (
    "id"        TEXT         NOT NULL,
    "userId"    TEXT         NOT NULL,
    "type"      "NotificationType" NOT NULL,
    "message"   TEXT         NOT NULL,
    "itemId"    TEXT,
    "read"      BOOLEAN      NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notifications"
    ADD CONSTRAINT "notifications_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications"
    ADD CONSTRAINT "notifications_itemId_fkey"
    FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
