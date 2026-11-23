-- CreateEnum
CREATE TYPE "PtkpStatus" AS ENUM ('TK0', 'TK1', 'TK2', 'TK3', 'K0', 'K1', 'K2', 'K3');

-- AlterTable
ALTER TABLE "PayrollRecord" ADD COLUMN     "netWage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "npwpSnapshot" TEXT,
ADD COLUMN     "pph21Amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ptkpSnapshot" "PtkpStatus",
ADD COLUMN     "taxableGross" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SeafarerProfile" ADD COLUMN     "npwp" TEXT,
ADD COLUMN     "ptkpStatus" "PtkpStatus" NOT NULL DEFAULT 'TK0';
