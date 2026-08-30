ALTER TABLE "account" ADD COLUMN "issuer" text;--> statement-breakpoint
UPDATE "account"
SET "issuer" = 'local:credential'
WHERE "providerId" = 'credential' AND "issuer" IS NULL;--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "account"
    WHERE "issuer" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot migrate account identities automatically; review non-credential provider rows first';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "account"
    WHERE "providerId" = 'credential' AND "accountId" <> "userId"
  ) THEN
    RAISE EXCEPTION 'Cannot migrate credential accounts with an accountId different from userId';
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "issuer" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "account_issuer_accountId_uidx" ON "account" USING btree ("issuer","accountId");
