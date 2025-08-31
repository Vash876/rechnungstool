/*
  Warnings:

  - Added the required column `updatedAt` to the `company_settings` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_company_settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'company',
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "taxNumber" TEXT,
    "vatId" TEXT,
    "bankAccount" TEXT,
    "bankName" TEXT,
    "iban" TEXT,
    "bic" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "owner" TEXT,
    "defaultTaxRate" DECIMAL NOT NULL DEFAULT 19.00,
    "defaultPaymentDue" INTEGER NOT NULL DEFAULT 14,
    "isSmallBusiness" BOOLEAN NOT NULL DEFAULT false,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "invoicePrefix" TEXT NOT NULL DEFAULT 'R',
    "quotePrefix" TEXT NOT NULL DEFAULT 'A',
    "invoiceStartNum" INTEGER NOT NULL DEFAULT 1,
    "quoteStartNum" INTEGER NOT NULL DEFAULT 1,
    "invoiceFooter" TEXT,
    "quoteFooter" TEXT,
    "termsAndConditions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_company_settings" ("address", "bankAccount", "email", "id", "logo", "name", "phone", "taxNumber") SELECT "address", "bankAccount", "email", "id", "logo", "name", "phone", "taxNumber" FROM "company_settings";
DROP TABLE "company_settings";
ALTER TABLE "new_company_settings" RENAME TO "company_settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
