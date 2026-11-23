-- Narasi dossier hasil model punya kolom sendiri.
-- `matrixSummary` tetap milik keputusan shipowner (rute endorse), sehingga
-- narasi AI tidak pernah menimpa alasan keputusan manusia.
ALTER TABLE "VettingAssessment"
  ADD COLUMN "aiNarrative" TEXT,
  ADD COLUMN "aiNarrativeModel" TEXT,
  ADD COLUMN "aiNarrativeAt" TIMESTAMP(3);
