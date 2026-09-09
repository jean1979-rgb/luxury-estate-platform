ALTER TABLE "PublicExperience"
ADD COLUMN "heroVideoUrl" TEXT,
ADD COLUMN "heroVideoPoster" TEXT,
ADD COLUMN "gallery" JSONB,
ADD COLUMN "scenes360" JSONB,
ADD COLUMN "editorialEyebrow" TEXT,
ADD COLUMN "editorialTitle" TEXT,
ADD COLUMN "sideEyebrow" TEXT,
ADD COLUMN "sideTitle" TEXT,
ADD COLUMN "sideText" TEXT,
ADD COLUMN "sideHighlights" JSONB,
ADD COLUMN "partnerId" TEXT;

CREATE INDEX "PublicExperience_partnerId_idx"
ON "PublicExperience"("partnerId");

ALTER TABLE "PublicExperience"
ADD CONSTRAINT "PublicExperience_partnerId_fkey"
FOREIGN KEY ("partnerId")
REFERENCES "PublicPartner"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
