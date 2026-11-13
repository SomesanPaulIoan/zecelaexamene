-- Book orders can be guest checkouts (no account required to buy a book) — matches
-- legacy behavior where every paid book Order has a NULL UserID.
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL;
