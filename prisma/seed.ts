import { PrismaClient, UserRole, VesselType, MaritimeRank, SeafarerStatus, CertCategory, CrewStage, RequisitionStatus, PtkpStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('[H-COS Seed] Memulai seeding database maritim nyata...');

  // Kata sandi akun seed TIDAK boleh hardcode di repositori. Ambil dari
  // SEED_ADMIN_PASSWORD; bila kosong, buat acak sekali pakai dan cetak di akhir.
  const seedPassword = process.env.SEED_ADMIN_PASSWORD?.trim() || randomBytes(15).toString('base64url');
  const generatedSeedPassword = !process.env.SEED_ADMIN_PASSWORD?.trim();

  const passwordHash = await bcrypt.hash(seedPassword, 10);

  // 1. Bersihkan Data Lama
  await prisma.auditTrail.deleteMany();
  await prisma.atsHistory.deleteMany();
  await prisma.vettingAssessment.deleteMany();
  await prisma.employmentContractPKL.deleteMany();
  await prisma.payrollRecord.deleteMany();
  await prisma.crewApplication.deleteMany();
  await prisma.certificateSTCW.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.seaTimeRecord.deleteMany();
  await prisma.seafarerProfile.deleteMany();
  await prisma.crewRequisition.deleteMany();
  await prisma.vessel.deleteMany();
  await prisma.user.deleteMany();

  console.log('[H-COS Seed] Database dibersihkan. Memasukkan akun pengguna RBAC...');

  // 2. Akun Superadmin & Manajemen
  const superadmin = await prisma.user.create({
    data: {
      email: 'admin@haswakarya.com',
      fullName: 'Capt. H. Sulaeman Noor, M.Mar',
      passwordHash,
      role: UserRole.SUPERADMIN,
      phone: '+628112345678',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'crewing.manager@haswakarya.com',
      fullName: 'Raden Hendro Wibowo, S.T.',
      passwordHash,
      role: UserRole.CREWING_MANAGER,
      phone: '+628123456789',
    },
  });

  const shipowner = await prisma.user.create({
    data: {
      email: 'owner@pertamina.com',
      fullName: 'VP Fleet Marine PT Pertamina International Shipping',
      passwordHash,
      role: UserRole.SHIPOWNER_CLIENT,
      phone: '+628219876543',
    },
  });

  // 3. Armada Kapal (Real Vessel Registry)
  console.log('[H-COS Seed] Memasukkan data armada kapal komersial...');
  const vTanker = await prisma.vessel.create({
    data: {
      name: 'MT HASWA SAMUDRA',
      imoNumber: '9481920',
      callSign: 'YB2941',
      flag: 'ID',
      vesselType: VesselType.OIL_CHEMICAL_TANKER,
      dwt: 6500,
      grt: 4200,
      engineBhp: 3800,
      engineType: 'MAN B&W 6S50MC-C',
      tradingArea: 'Ocean Going / Southeast Asia',
      ownerName: 'PT Pertamina International Shipping (Charter)',
      safeManningTotal: 16,
    },
  });

  const vBulker = await prisma.vessel.create({
    data: {
      name: 'MV HASWA PERKASA',
      imoNumber: '9238491',
      callSign: 'YC8812',
      flag: 'ID',
      vesselType: VesselType.BULK_CARRIER,
      dwt: 32000,
      grt: 18500,
      engineBhp: 7800,
      engineType: 'Mitsubishi UEC 52LSE',
      tradingArea: 'Domestic & Asia Pacific',
      ownerName: 'PT Samudera Bahtera Perkasa',
      safeManningTotal: 18,
    },
  });

  const vTug = await prisma.vessel.create({
    data: {
      name: 'TB HASWA PIONEER',
      imoNumber: '9671124',
      callSign: 'PK3310',
      flag: 'ID',
      vesselType: VesselType.HARBOR_OCEAN_TUG,
      dwt: 650,
      grt: 480,
      engineBhp: 4200,
      engineType: 'Niigata 6L28HX (Z-Peller)',
      tradingArea: 'Near Coastal Voyages (Batam & Singapore Strait)',
      ownerName: 'PT Pelayaran Haswa Nusantara',
      safeManningTotal: 10,
    },
  });

  const vProduct = await prisma.vessel.create({
    data: {
      name: 'MT HASWA BARUNA',
      imoNumber: '9510294',
      callSign: 'YD4401',
      flag: 'ID',
      vesselType: VesselType.PRODUCT_TANKER,
      dwt: 3800,
      grt: 2600,
      engineBhp: 2400,
      engineType: 'Daihatsu 6DKM-26',
      tradingArea: 'Near Coastal Voyages (Domestic)',
      ownerName: 'PT Pertamina Trans Kontinental',
      safeManningTotal: 14,
    },
  });

  // 4. Safe Manning Requisitions
  console.log('[H-COS Seed] Memasukkan safe manning requisitions...');
  const req1 = await prisma.crewRequisition.create({
    data: {
      requisitionNo: 'REQ-2026-TNK-018',
      vesselId: vTanker.id,
      rank: MaritimeRank.MASTER,
      requiredQuantity: 1,
      minSeaTimeMonths: 24,
      targetJoinDate: new Date('2026-12-10'),
      targetPort: 'Pelabuhan Tanjung Priok, Jakarta',
      salaryBudgetUsd: 5500,
      salaryBudgetIdr: 88000000,
      status: RequisitionStatus.OPEN,
      notes: 'Wajib lolos audit OCIMF SIRE 2.0 dan skor Marlins >= 85%.',
    },
  });

  const req2 = await prisma.crewRequisition.create({
    data: {
      requisitionNo: 'REQ-2026-BLK-042',
      vesselId: vBulker.id,
      rank: MaritimeRank.CHIEF_ENGINEER,
      requiredQuantity: 1,
      minSeaTimeMonths: 36,
      targetJoinDate: new Date('2026-12-15'),
      targetPort: 'Pelabuhan Cigading, Banten',
      salaryBudgetUsd: 5200,
      salaryBudgetIdr: 83000000,
      status: RequisitionStatus.OPEN,
      notes: 'Pengalaman mesin 2-stroke MAN B&W atau Mitsubishi UEC.',
    },
  });

  const req3 = await prisma.crewRequisition.create({
    data: {
      requisitionNo: 'REQ-2026-TUG-007',
      vesselId: vTug.id,
      rank: MaritimeRank.CHIEF_OFFICER,
      requiredQuantity: 1,
      minSeaTimeMonths: 12,
      targetJoinDate: new Date('2026-12-20'),
      targetPort: 'Pelabuhan Batu Ampar, Batam',
      salaryBudgetIdr: 28000000,
      status: RequisitionStatus.OPEN,
      notes: 'Sertifikat ANT-III/IV dengan pengalaman ASD Tug handling.',
    },
  });

  // 5. Profil Pelaut Nyata & Sertifikat STCW
  console.log('[H-COS Seed] Memasukkan profil digital awak kapal...');

  // Pelaut 1: Capt. Hendra Gunawan (Master)
  const uCapt = await prisma.user.create({
    data: {
      email: 'hendra.gunawan@haswakarya.com',
      fullName: 'Capt. Hendra Gunawan, M.Mar',
      passwordHash,
      role: UserRole.CANDIDATE_SEAFARER,
      phone: '+6281311223344',
    },
  });

  const pCapt = await prisma.seafarerProfile.create({
    data: {
      userId: uCapt.id,
      seamanBookNo: 'B.0492819',
      passportNo: 'C.9182371',
      sidNumber: 'IDN-SID-882194',
      npwp: '0912345678901000',
      ptkpStatus: PtkpStatus.K1,
      primaryRank: MaritimeRank.MASTER,
      dateOfBirth: new Date('1982-05-14'),
      placeOfBirth: 'Surabaya',
      bloodType: 'O+',
      homeAddress: 'Jl. Bahari Indah No. 42, Tanjung Priok, Jakarta Utara',
      emergencyContact: 'Ibu Ratna Hendra (Istri)',
      emergencyPhone: '+6281399887766',
      currentStatus: SeafarerStatus.STANDBY_POOL,
      totalSeaTimeDays: 3450, // ~9.5 tahun
      marlinsScore: 89.0,
    },
  });

  await prisma.certificateSTCW.createMany({
    data: [
      {
        seafarerId: pCapt.id,
        category: CertCategory.COC,
        certName: 'ANT-I (Master Mariner)',
        certificateNo: '62018401928374',
        issuingAuthority: 'Direktorat Jenderal Perhubungan Laut',
        issueDate: new Date('2018-04-10'),
        isVerified: true,
      },
      {
        seafarerId: pCapt.id,
        category: CertCategory.COP,
        certName: 'Basic Safety Training (BST)',
        certificateNo: 'BST/2024/09182',
        issuingAuthority: 'BP3IP Jakarta',
        issueDate: new Date('2024-05-18'),
        expiryDate: new Date('2029-05-18'),
        isVerified: true,
      },
      {
        seafarerId: pCapt.id,
        category: CertCategory.COP,
        certName: 'Advanced Fire Fighting (AFF)',
        certificateNo: 'AFF/2023/18290',
        issuingAuthority: 'STIP Jakarta',
        issueDate: new Date('2023-08-14'),
        expiryDate: new Date('2028-08-14'),
        isVerified: true,
      },
    ],
  });

  await prisma.seaTimeRecord.createMany({
    data: [
      {
        seafarerId: pCapt.id,
        vesselName: 'MT PERMATA SAMUDRA',
        vesselType: VesselType.PRODUCT_TANKER,
        rankServed: MaritimeRank.MASTER,
        dwt: 6200,
        grt: 4100,
        bhp: 3600,
        signOnDate: new Date('2023-01-10'),
        signOffDate: new Date('2024-03-15'),
        totalDays: 430,
        signOnPort: 'Tanjung Priok',
        dischargePort: 'Balikpapan',
        operatingCompany: 'PT Pelayaran Samudera',
        isVerifiedHubla: true,
      },
      {
        seafarerId: pCapt.id,
        vesselName: 'MT HASWA BARUNA',
        vesselType: VesselType.OIL_CHEMICAL_TANKER,
        rankServed: MaritimeRank.MASTER,
        dwt: 3800,
        grt: 2600,
        bhp: 2400,
        signOnDate: new Date('2022-02-01'),
        signOffDate: new Date('2022-12-05'),
        totalDays: 308,
        signOnPort: 'Merak',
        dischargePort: 'Surabaya',
        operatingCompany: 'PT Haswakarya Perdana Samudra',
        isVerifiedHubla: true,
      },
    ],
  });

  // Pelaut 2: Mualim I Irfan Hakim (Chief Officer)
  const uChoff = await prisma.user.create({
    data: {
      email: 'irfan.hakim@haswakarya.com',
      fullName: 'Mualim I Irfan Hakim, S.Tr.Pel',
      passwordHash,
      role: UserRole.CANDIDATE_SEAFARER,
      phone: '+6281355667788',
    },
  });

  const pChoff = await prisma.seafarerProfile.create({
    data: {
      userId: uChoff.id,
      seamanBookNo: 'B.0583192',
      passportNo: 'C.8819201',
      sidNumber: 'IDN-SID-772910',
      npwp: '0923456789012000',
      ptkpStatus: PtkpStatus.TK0,
      primaryRank: MaritimeRank.CHIEF_OFFICER,
      dateOfBirth: new Date('1988-11-20'),
      placeOfBirth: 'Makassar',
      bloodType: 'B+',
      homeAddress: 'Jl. Samudra No. 18, Batam Center, Batam',
      emergencyContact: 'Bpk. Hakim (Ayah)',
      emergencyPhone: '+6281344556677',
      currentStatus: SeafarerStatus.STANDBY_POOL,
      totalSeaTimeDays: 2100, // ~5.8 tahun
      marlinsScore: 84.0,
    },
  });

  // Pelaut 3: Ir. Bambang Triyono (Chief Engineer)
  const uCheng = await prisma.user.create({
    data: {
      email: 'bambang.triyono@haswakarya.com',
      fullName: 'Ir. Bambang Triyono, C.Eng',
      passwordHash,
      role: UserRole.CANDIDATE_SEAFARER,
      phone: '+6281288990011',
    },
  });

  const pCheng = await prisma.seafarerProfile.create({
    data: {
      userId: uCheng.id,
      seamanBookNo: 'C.0392014',
      passportNo: 'C.7719283',
      sidNumber: 'IDN-SID-661829',
      primaryRank: MaritimeRank.CHIEF_ENGINEER,
      dateOfBirth: new Date('1979-08-04'),
      placeOfBirth: 'Semarang',
      bloodType: 'A+',
      homeAddress: 'Jl. Candi Prambanan No. 5, Semarang',
      emergencyContact: 'Ibu Siti Triyono (Istri)',
      emergencyPhone: '+6281277889900',
      currentStatus: SeafarerStatus.STANDBY_POOL,
      totalSeaTimeDays: 4380, // ~12 tahun
      marlinsScore: 82.0,
    },
  });

  // Pelaut 4: Masinis II Agus Setiawan
  const u2eng = await prisma.user.create({
    data: {
      email: 'agus.setiawan@haswakarya.com',
      fullName: 'Masinis II Agus Setiawan',
      passwordHash,
      role: UserRole.CANDIDATE_SEAFARER,
      phone: '+6281233445566',
    },
  });

  const p2eng = await prisma.seafarerProfile.create({
    data: {
      userId: u2eng.id,
      seamanBookNo: 'C.0782910',
      primaryRank: MaritimeRank.SECOND_ENGINEER,
      dateOfBirth: new Date('1991-03-12'),
      placeOfBirth: 'Cirebon',
      bloodType: 'O+',
      homeAddress: 'Jl. Pelabuhan Cirebon No. 12, Cirebon',
      emergencyContact: 'Ibu Ningsih (Ibu)',
      emergencyPhone: '+6281244332211',
      currentStatus: SeafarerStatus.STANDBY_POOL,
      totalSeaTimeDays: 1530, // ~4.2 tahun
      marlinsScore: 78.0,
    },
  });

  // Pelaut 5: Juru Mudi Slamet Riyadi
  const uRating = await prisma.user.create({
    data: {
      email: 'slamet.riyadi@haswakarya.com',
      fullName: 'Juru Mudi Slamet Riyadi',
      passwordHash,
      role: UserRole.CANDIDATE_SEAFARER,
      phone: '+6285211223344',
    },
  });

  const pRating = await prisma.seafarerProfile.create({
    data: {
      userId: uRating.id,
      seamanBookNo: 'D.0991823',
      primaryRank: MaritimeRank.ABLE_SEAMAN,
      dateOfBirth: new Date('1996-07-25'),
      placeOfBirth: 'Tegal',
      bloodType: 'B+',
      homeAddress: 'Jl. Martoloyo No. 88, Tegal',
      emergencyContact: 'Bpk. Riyadi (Ayah)',
      emergencyPhone: '+6285299887766',
      currentStatus: SeafarerStatus.STANDBY_POOL,
      totalSeaTimeDays: 910, // ~2.5 tahun
      marlinsScore: 74.0,
    },
  });

  // 6. Hubungkan ke Aplikasi ATS (Crew Application)
  console.log('[H-COS Seed] Memasukkan aplikasi rekrutmen ATS aktif...');

  // Token vetting demo diberi masa berlaku nyata (30 hari) agar alur dossier
  // shipowner dapat diuji end-to-end tanpa token abadi.
  const vettingTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  // App 1: Capt. Hendra Gunawan -> REQ Tanker (OWNER_VETTING)
  const app1 = await prisma.crewApplication.create({
    data: {
      requisitionId: req1.id,
      seafarerId: pCapt.id,
      currentStage: CrewStage.OWNER_VETTING,
      matchScore: 96.0,
      vettingToken: 'demo-master-tanker',
      tokenExpiresAt: vettingTokenExpiry,
    },
  });

  await prisma.vettingAssessment.create({
    data: {
      applicationId: app1.id,
      sireMatrixScore: 96.0,
      timeInRankMonths: 24,
      timeOnVesselTypeMos: 48,
      timeWithOperatorMos: 18,
      marlinsPercent: 89.0,
      pairedOfficerSeaTime: 74,
      matrixSummary: 'Memenuhi seluruh kriteria SIRE 2.0 & RightShip Matrix. Sangat direkomendasikan berlayar.',
    },
  });

  // App 2: Mualim I Irfan Hakim -> REQ Tanker (OWNER_VETTING)
  await prisma.crewApplication.create({
    data: {
      requisitionId: req1.id,
      seafarerId: pChoff.id,
      currentStage: CrewStage.OWNER_VETTING,
      matchScore: 92.0,
      vettingToken: 'demo-choff-tanker',
      tokenExpiresAt: vettingTokenExpiry,
    },
  });

  // App 3: Ir. Bambang Triyono -> REQ Bulker (TECHNICAL_INTERVIEW)
  await prisma.crewApplication.create({
    data: {
      requisitionId: req2.id,
      seafarerId: pCheng.id,
      currentStage: CrewStage.TECHNICAL_INTERVIEW,
      matchScore: 94.0,
      vettingToken: 'demo-cheng-bulk',
      tokenExpiresAt: vettingTokenExpiry,
    },
  });

  // App 4: Masinis II Agus Setiawan -> REQ Bulker (MARLINS_ASSESSMENT)
  await prisma.crewApplication.create({
    data: {
      requisitionId: req2.id,
      seafarerId: p2eng.id,
      currentStage: CrewStage.MARLINS_ASSESSMENT,
      matchScore: 88.0,
      vettingToken: 'demo-2eng-bulk',
      tokenExpiresAt: vettingTokenExpiry,
    },
  });

  // App 5: Juru Mudi Slamet Riyadi -> REQ Tug (APPLIED)
  await prisma.crewApplication.create({
    data: {
      requisitionId: req3.id,
      seafarerId: pRating.id,
      currentStage: CrewStage.APPLIED,
      matchScore: 82.0,
      vettingToken: 'demo-ab-tanker',
      tokenExpiresAt: vettingTokenExpiry,
    },
  });

  // 7. Catat ke Audit Trail
  await prisma.auditTrail.create({
    data: {
      userId: superadmin.id,
      action: 'SYSTEM_INITIALIZATION',
      entityType: 'System',
      entityId: 'SEED_2026',
      details: 'Inisialisasi data produksi maritim Haswakarya selesai.',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('[H-COS Seed] ✅ SEED SUKSES! 4 Kapal, 5 Pelaut, 3 Requisition, 5 ATS Applications berhasil dimasukkan.');
  if (generatedSeedPassword) {
    console.log(`[H-COS Seed] Kata sandi akun seed dibuat acak: ${seedPassword}`);
    console.log('[H-COS Seed] Simpan sekarang; set SEED_ADMIN_PASSWORD untuk memakai sandi tetap.');
  }
}

main()
  .catch((e) => {
    console.error('[H-COS Seed Error]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
