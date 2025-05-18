/*
  Warnings:

  - The primary key for the `MonthHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MonthHistory" (
    "userId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "income" REAL NOT NULL,
    "expense" REAL NOT NULL,
    "currency" TEXT NOT NULL,

    PRIMARY KEY ("day", "month", "year", "userId", "currency")
);
INSERT INTO "new_MonthHistory" ("currency", "day", "expense", "income", "month", "userId", "year") SELECT "currency", "day", "expense", "income", "month", "userId", "year" FROM "MonthHistory";
DROP TABLE "MonthHistory";
ALTER TABLE "new_MonthHistory" RENAME TO "MonthHistory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
