-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPERADMIN', 'CREWING_MANAGER', 'CREWING_OFFICER', 'SHIPOWNER_CLIENT', 'CANDIDATE_SEAFARER');

-- CreateEnum
CREATE TYPE "VesselType" AS ENUM ('OIL_CHEMICAL_TANKER', 'PRODUCT_TANKER', 'BULK_CARRIER', 'CONTAINER_FEEDER', 'HARBOR_OCEAN_TUG', 'ASPHALT_BITUMEN_TANKER', 'GENERAL_CARGO', 'OFFSHORE_CREW_BOAT');

-- CreateEnum
CREATE TYPE "RequisitionStatus" AS ENUM ('OPEN', 'INTERVIEWING', 'VETTING_COMPLETED', 'FULFILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MaritimeRank" AS ENUM ('MASTER', 'CHIEF_OFFICER', 'SECOND_OFFICER', 'THIRD_OFFICER', 'DECK_CADET', 'BOSUN', 'ABLE_SEAMAN', 'ORDINARY_SEAMAN', 'CHIEF_ENGINEER', 'SECOND_ENGINEER', 'THIRD_ENGINEER', 'FOURTH_ENGINEER', 'ENGINE_CADET', 'FITTER', 'OILER', 'WIPER', 'CHIEF_COOK', 'MESSMAN');

-- CreateEnum
CREATE TYPE "SeafarerStatus" AS ENUM ('ONBOARD', 'SIGN_OFF', 'LEAVE_ROTATION', 'STANDBY_POOL', 'TRAINING', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CertCategory" AS ENUM ('COC', 'COP', 'FLAG_ENDORSEMENT', 'TRAVEL_DOCUMENT');

-- CreateEnum
CREATE TYPE "MedicalStatus" AS ENUM ('FIT_FOR_SEA_DUTY', 'FIT_WITH_RESTRICTION', 'TEMPORARY_UNFIT', 'PERMANENT_UNFIT');

-- CreateEnum
CREATE TYPE "CrewStage" AS ENUM ('APPLIED', 'DOCUMENT_VERIFIED', 'TECHNICAL_INTERVIEW', 'MARLINS_ASSESSMENT', 'OWNER_VETTING', 'MCU_CLEARANCE', 'PKL_SIGNING', 'ONBOARD_DEPLOYED', 'SIGN_OFF_LEAVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "CrewApplicationSource" AS ENUM ('REQUISITION', 'DIRECT_TALENT_POOL');

-- CreateEnum
CREATE TYPE "VettingRecommendation" AS ENUM ('STRONGLY_APPROVED', 'APPROVED_WITH_CONDITIONS', 'MATRIX_NON_COMPLIANT', 'REJECTED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'AWAITING_SEAFARER_SIGN', 'AWAITING_OWNER_SIGN', 'ENDORSED_SYAHBANDAR', 'ACTIVE_ONBOARD', 'COMPLETED', 'TERMINATED_EARLY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CANDIDATE_SEAFARER',
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vessel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imoNumber" TEXT NOT NULL,
    "callSign" TEXT,
    "flag" TEXT NOT NULL DEFAULT 'ID',
    "vesselType" "VesselType" NOT NULL,
    "dwt" DOUBLE PRECISION NOT NULL,
    "grt" DOUBLE PRECISION NOT NULL,
    "engineBhp" DOUBLE PRECISION NOT NULL,
    "engineType" TEXT,
    "tradingArea" TEXT NOT NULL DEFAULT 'Near Coastal Voyages (NCV)',
    "ownerName" TEXT NOT NULL,
    "safeManningTotal" INTEGER NOT NULL DEFAULT 14,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vessel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrewRequisition" (
    "id" TEXT NOT NULL,
    "requisitionNo" TEXT NOT NULL,
    "vesselId" TEXT NOT NULL,
    "rank" "MaritimeRank" NOT NULL,
    "requiredQuantity" INTEGER NOT NULL DEFAULT 1,
    "minSeaTimeMonths" INTEGER NOT NULL DEFAULT 12,
    "minBhpDwtExp" DOUBLE PRECISION,
    "targetJoinDate" TIMESTAMP(3) NOT NULL,
    "targetPort" TEXT NOT NULL,
    "salaryBudgetUsd" DOUBLE PRECISION,
    "salaryBudgetIdr" DOUBLE PRECISION,
    "status" "RequisitionStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrewRequisition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeafarerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seamanBookNo" TEXT NOT NULL,
    "passportNo" TEXT,
    "sidNumber" TEXT,
    "primaryRank" "MaritimeRank" NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "placeOfBirth" TEXT NOT NULL,
    "bloodType" TEXT,
    "homeAddress" TEXT NOT NULL,
    "emergencyContact" TEXT NOT NULL,
    "emergencyPhone" TEXT NOT NULL,
    "currentStatus" "SeafarerStatus" NOT NULL DEFAULT 'STANDBY_POOL',
    "totalSeaTimeDays" INTEGER NOT NULL DEFAULT 0,
    "marlinsScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeafarerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeaTimeRecord" (
    "id" TEXT NOT NULL,
    "seafarerId" TEXT NOT NULL,
    "vesselName" TEXT NOT NULL,
    "imoNumber" TEXT,
    "vesselType" "VesselType" NOT NULL,
    "rankServed" "MaritimeRank" NOT NULL,
    "grt" DOUBLE PRECISION,
    "dwt" DOUBLE PRECISION,
    "bhp" DOUBLE PRECISION,
    "engineModel" TEXT,
    "signOnDate" TIMESTAMP(3) NOT NULL,
    "signOffDate" TIMESTAMP(3) NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "dischargePort" TEXT,
    "signOnPort" TEXT,
    "operatingCompany" TEXT,
    "isVerifiedHubla" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeaTimeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificateSTCW" (
    "id" TEXT NOT NULL,
    "seafarerId" TEXT NOT NULL,
    "category" "CertCategory" NOT NULL,
    "certName" TEXT NOT NULL,
    "certificateNo" TEXT NOT NULL,
    "issuingAuthority" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "fileVaultPath" TEXT,
    "fileChecksumSha" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificateSTCW_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "id" TEXT NOT NULL,
    "seafarerId" TEXT NOT NULL,
    "clinicName" TEXT NOT NULL,
    "doctorName" TEXT NOT NULL,
    "examinationDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "overallStatus" "MedicalStatus" NOT NULL DEFAULT 'FIT_FOR_SEA_DUTY',
    "bmi" DOUBLE PRECISION,
    "colorVision" TEXT NOT NULL DEFAULT 'Normal',
    "audiometryStatus" TEXT NOT NULL DEFAULT 'Normal',
    "certificatePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrewApplication" (
    "id" TEXT NOT NULL,
    "requisitionId" TEXT,
    "seafarerId" TEXT NOT NULL,
    "source" "CrewApplicationSource" NOT NULL DEFAULT 'REQUISITION',
    "currentStage" "CrewStage" NOT NULL DEFAULT 'APPLIED',
    "matchScore" DOUBLE PRECISION,
    "rejectionReason" TEXT,
    "vettingToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrewApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AtsHistory" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fromStage" "CrewStage" NOT NULL,
    "toStage" "CrewStage" NOT NULL,
    "changedByUserId" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AtsHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManningInquiry" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "workEmail" TEXT NOT NULL,
    "phoneWhatsApp" TEXT,
    "vesselName" TEXT,
    "imoNumber" TEXT,
    "vesselType" TEXT,
    "targetRanks" TEXT,
    "joinPort" TEXT,
    "expectedJoiningDate" TIMESTAMP(3),
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "matchedVesselId" TEXT,
    "requisitionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManningInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VettingAssessment" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "sireMatrixScore" DOUBLE PRECISION,
    "timeInRankMonths" INTEGER NOT NULL DEFAULT 0,
    "timeOnVesselTypeMos" INTEGER NOT NULL DEFAULT 0,
    "timeWithOperatorMos" INTEGER NOT NULL DEFAULT 0,
    "marlinsPercent" DOUBLE PRECISION,
    "pairedOfficerSeaTime" INTEGER,
    "recommendation" "VettingRecommendation" NOT NULL DEFAULT 'APPROVED_WITH_CONDITIONS',
    "matrixSummary" TEXT,
    "verifiedByMaster" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VettingAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmploymentContractPKL" (
    "id" TEXT NOT NULL,
    "contractNo" TEXT NOT NULL,
    "seafarerId" TEXT NOT NULL,
    "vesselId" TEXT NOT NULL,
    "rank" "MaritimeRank" NOT NULL,
    "signOnDate" TIMESTAMP(3) NOT NULL,
    "durationMonths" INTEGER NOT NULL DEFAULT 6,
    "monthlyBasicWageIdr" DOUBLE PRECISION,
    "monthlyBasicWageUsd" DOUBLE PRECISION,
    "allotmentPercentage" DOUBLE PRECISION NOT NULL DEFAULT 80.0,
    "onboardCashAdvance" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "insurancePolicyNo" TEXT,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "pklPdfVaultPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmploymentContractPKL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRecord" (
    "id" TEXT NOT NULL,
    "seafarerId" TEXT NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "basicWage" DOUBLE PRECISION NOT NULL,
    "leavePay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtimeAllowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dangerBonusCargo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalGrossWage" DOUBLE PRECISION NOT NULL,
    "allotmentAmount" DOUBLE PRECISION NOT NULL,
    "onboardPaidAmount" DOUBLE PRECISION NOT NULL,
    "bankAccountTarget" TEXT,
    "isDisbursed" BOOLEAN NOT NULL DEFAULT false,
    "disbursedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditTrail" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditTrail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Vessel_imoNumber_key" ON "Vessel"("imoNumber");

-- CreateIndex
CREATE INDEX "Vessel_imoNumber_idx" ON "Vessel"("imoNumber");

-- CreateIndex
CREATE INDEX "Vessel_vesselType_idx" ON "Vessel"("vesselType");

-- CreateIndex
CREATE UNIQUE INDEX "CrewRequisition_requisitionNo_key" ON "CrewRequisition"("requisitionNo");

-- CreateIndex
CREATE INDEX "CrewRequisition_vesselId_idx" ON "CrewRequisition"("vesselId");

-- CreateIndex
CREATE INDEX "CrewRequisition_rank_idx" ON "CrewRequisition"("rank");

-- CreateIndex
CREATE INDEX "CrewRequisition_status_idx" ON "CrewRequisition"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SeafarerProfile_userId_key" ON "SeafarerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SeafarerProfile_seamanBookNo_key" ON "SeafarerProfile"("seamanBookNo");

-- CreateIndex
CREATE INDEX "SeafarerProfile_seamanBookNo_idx" ON "SeafarerProfile"("seamanBookNo");

-- CreateIndex
CREATE INDEX "SeafarerProfile_primaryRank_idx" ON "SeafarerProfile"("primaryRank");

-- CreateIndex
CREATE INDEX "SeafarerProfile_currentStatus_idx" ON "SeafarerProfile"("currentStatus");

-- CreateIndex
CREATE INDEX "SeaTimeRecord_seafarerId_idx" ON "SeaTimeRecord"("seafarerId");

-- CreateIndex
CREATE INDEX "SeaTimeRecord_vesselType_idx" ON "SeaTimeRecord"("vesselType");

-- CreateIndex
CREATE INDEX "SeaTimeRecord_rankServed_idx" ON "SeaTimeRecord"("rankServed");

-- CreateIndex
CREATE INDEX "CertificateSTCW_seafarerId_idx" ON "CertificateSTCW"("seafarerId");

-- CreateIndex
CREATE INDEX "CertificateSTCW_category_idx" ON "CertificateSTCW"("category");

-- CreateIndex
CREATE INDEX "CertificateSTCW_expiryDate_idx" ON "CertificateSTCW"("expiryDate");

-- CreateIndex
CREATE INDEX "MedicalRecord_seafarerId_idx" ON "MedicalRecord"("seafarerId");

-- CreateIndex
CREATE INDEX "MedicalRecord_expiryDate_idx" ON "MedicalRecord"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "CrewApplication_vettingToken_key" ON "CrewApplication"("vettingToken");

-- CreateIndex
CREATE INDEX "CrewApplication_currentStage_idx" ON "CrewApplication"("currentStage");

-- CreateIndex
CREATE INDEX "CrewApplication_source_idx" ON "CrewApplication"("source");

-- CreateIndex
CREATE INDEX "CrewApplication_vettingToken_idx" ON "CrewApplication"("vettingToken");

-- CreateIndex
CREATE UNIQUE INDEX "CrewApplication_requisitionId_seafarerId_key" ON "CrewApplication"("requisitionId", "seafarerId");

-- CreateIndex
CREATE INDEX "AtsHistory_applicationId_idx" ON "AtsHistory"("applicationId");

-- CreateIndex
CREATE INDEX "ManningInquiry_workEmail_idx" ON "ManningInquiry"("workEmail");

-- CreateIndex
CREATE INDEX "ManningInquiry_status_idx" ON "ManningInquiry"("status");

-- CreateIndex
CREATE INDEX "ManningInquiry_createdAt_idx" ON "ManningInquiry"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VettingAssessment_applicationId_key" ON "VettingAssessment"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "EmploymentContractPKL_contractNo_key" ON "EmploymentContractPKL"("contractNo");

-- CreateIndex
CREATE INDEX "EmploymentContractPKL_contractNo_idx" ON "EmploymentContractPKL"("contractNo");

-- CreateIndex
CREATE INDEX "EmploymentContractPKL_seafarerId_idx" ON "EmploymentContractPKL"("seafarerId");

-- CreateIndex
CREATE INDEX "EmploymentContractPKL_vesselId_idx" ON "EmploymentContractPKL"("vesselId");

-- CreateIndex
CREATE INDEX "EmploymentContractPKL_status_idx" ON "EmploymentContractPKL"("status");

-- CreateIndex
CREATE INDEX "PayrollRecord_periodYear_periodMonth_idx" ON "PayrollRecord"("periodYear", "periodMonth");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRecord_seafarerId_periodMonth_periodYear_key" ON "PayrollRecord"("seafarerId", "periodMonth", "periodYear");

-- CreateIndex
CREATE INDEX "AuditTrail_entityType_entityId_idx" ON "AuditTrail"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditTrail_createdAt_idx" ON "AuditTrail"("createdAt");

-- AddForeignKey
ALTER TABLE "CrewRequisition" ADD CONSTRAINT "CrewRequisition_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "Vessel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeafarerProfile" ADD CONSTRAINT "SeafarerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeaTimeRecord" ADD CONSTRAINT "SeaTimeRecord_seafarerId_fkey" FOREIGN KEY ("seafarerId") REFERENCES "SeafarerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateSTCW" ADD CONSTRAINT "CertificateSTCW_seafarerId_fkey" FOREIGN KEY ("seafarerId") REFERENCES "SeafarerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_seafarerId_fkey" FOREIGN KEY ("seafarerId") REFERENCES "SeafarerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewApplication" ADD CONSTRAINT "CrewApplication_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "CrewRequisition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewApplication" ADD CONSTRAINT "CrewApplication_seafarerId_fkey" FOREIGN KEY ("seafarerId") REFERENCES "SeafarerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtsHistory" ADD CONSTRAINT "AtsHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "CrewApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtsHistory" ADD CONSTRAINT "AtsHistory_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VettingAssessment" ADD CONSTRAINT "VettingAssessment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "CrewApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentContractPKL" ADD CONSTRAINT "EmploymentContractPKL_seafarerId_fkey" FOREIGN KEY ("seafarerId") REFERENCES "SeafarerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentContractPKL" ADD CONSTRAINT "EmploymentContractPKL_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "Vessel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRecord" ADD CONSTRAINT "PayrollRecord_seafarerId_fkey" FOREIGN KEY ("seafarerId") REFERENCES "SeafarerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditTrail" ADD CONSTRAINT "AuditTrail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

