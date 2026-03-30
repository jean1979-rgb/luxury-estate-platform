-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'BROKER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BrokerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BrokerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BrokerProperty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerBrokerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "publicationStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "sourceExternalId" TEXT,
    "city" TEXT NOT NULL,
    "location" TEXT,
    "price" TEXT,
    "currency" TEXT DEFAULT 'MXN',
    "coverImage" TEXT,
    "gallery" JSONB,
    "tagline" TEXT,
    "description" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BrokerProfile_userId_key" ON "BrokerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BrokerProfile_slug_key" ON "BrokerProfile"("slug");

-- CreateIndex
CREATE INDEX "BrokerProperty_ownerBrokerId_idx" ON "BrokerProperty"("ownerBrokerId");

-- CreateIndex
CREATE UNIQUE INDEX "BrokerProperty_ownerBrokerId_slug_key" ON "BrokerProperty"("ownerBrokerId", "slug");
