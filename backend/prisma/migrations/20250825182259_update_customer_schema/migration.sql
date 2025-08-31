/*
  Warnings:

  - You are about to drop the column `name` on the `customers` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `customers` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_customers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerNumber" TEXT NOT NULL,
    "company" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_customers" ("address", "createdAt", "customerNumber", "email", "id", "phone", "updatedAt") SELECT "address", "createdAt", "customerNumber", "email", "id", "phone", "updatedAt" FROM "customers";
DROP TABLE "customers";
ALTER TABLE "new_customers" RENAME TO "customers";
CREATE UNIQUE INDEX "customers_customerNumber_key" ON "customers"("customerNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
