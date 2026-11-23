-- Tahap visa & dokumen pra-berangkat pada company profile (langkah 7 dari 9)
-- belum punya padanan pada enum CrewStage, sehingga kandidat melompat dari
-- MCU_CLEARANCE langsung ke PKL_SIGNING.
--
-- ALTER TYPE ... ADD VALUE bersifat aditif: nilai lama tidak berubah dan tidak
-- ada baris yang ditulis ulang. Aman dijalankan pada basis data yang sudah berisi.
ALTER TYPE "CrewStage" ADD VALUE IF NOT EXISTS 'VISA_PROCESSING';