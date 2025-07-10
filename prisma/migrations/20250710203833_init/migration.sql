-- CreateTable
CREATE TABLE "BinDay" (
    "id" SERIAL NOT NULL,
    "postcode" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "binType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BinDay_pkey" PRIMARY KEY ("id")
);
