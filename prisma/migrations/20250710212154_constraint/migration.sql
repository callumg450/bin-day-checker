/*
  Warnings:

  - A unique constraint covering the columns `[postcode,date,binType]` on the table `BinDay` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BinDay_postcode_date_binType_key" ON "BinDay"("postcode", "date", "binType");
