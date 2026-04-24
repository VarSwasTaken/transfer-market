ALTER TABLE "Nationality" ADD COLUMN IF NOT EXISTS "name_PL" TEXT;

UPDATE "Nationality"
SET "name_PL" = "name"
WHERE "name_PL" IS NULL;

ALTER TABLE "Nationality" ALTER COLUMN "name_PL" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Nationality_name_PL_key" ON "Nationality"("name_PL");

ALTER TABLE "Player" ADD COLUMN IF NOT EXISTS "shirtNumber" INTEGER;

UPDATE "Player"
SET "shirtNumber" = (("id" - 1) % 99) + 1
WHERE "shirtNumber" IS NULL;

ALTER TABLE "Player" ALTER COLUMN "shirtNumber" SET NOT NULL;

ALTER TABLE "Player" DROP CONSTRAINT IF EXISTS "Player_shirtNumber_range_check";

ALTER TABLE "Player"
ADD CONSTRAINT "Player_shirtNumber_range_check"
CHECK ("shirtNumber" BETWEEN 1 AND 99);

CREATE UNIQUE INDEX IF NOT EXISTS "Player_clubId_shirtNumber_key"
ON "Player"("clubId", "shirtNumber");
