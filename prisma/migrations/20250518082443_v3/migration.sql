/*
  Warnings:

  - The primary key for the `YearHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_YearHistory" (
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "income" REAL NOT NULL,
    "expense" REAL NOT NULL,
    "currency" TEXT NOT NULL,

    PRIMARY KEY ("month", "year", "userId", "currency")
);
INSERT INTO "new_YearHistory" ("currency", "expense", "income", "month", "userId", "year") SELECT "currency", "expense", "income", "month", "userId", "year" FROM "YearHistory";
DROP TABLE "YearHistory";
ALTER TABLE "new_YearHistory" RENAME TO "YearHistory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
