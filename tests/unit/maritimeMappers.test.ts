import { describe, expect, it } from 'vitest';
import { isKnownRank, normalizeRank, supportedRanks } from '@/lib/maritime/rankMapper';
import { isTankerVesselType, normalizeVesselType } from '@/lib/maritime/vesselTypeMapper';

describe('Pemetaan jabatan — strict, tanpa default', () => {
  it('memetakan jabatan dek', () => {
    expect(normalizeRank('Master')).toBe('MASTER');
    expect(normalizeRank('Nakhoda')).toBe('MASTER');
    expect(normalizeRank('Chief Officer')).toBe('CHIEF_OFFICER');
    expect(normalizeRank('Mualim I')).toBe('CHIEF_OFFICER');
    expect(normalizeRank('2nd Officer')).toBe('SECOND_OFFICER');
    expect(normalizeRank('Mualim II')).toBe('SECOND_OFFICER');
    expect(normalizeRank('3rd Officer')).toBe('THIRD_OFFICER');
    expect(normalizeRank('Bosun')).toBe('BOSUN');
    expect(normalizeRank('Able Seaman')).toBe('ABLE_SEAMAN');
    expect(normalizeRank('Juru Mudi')).toBe('ABLE_SEAMAN');
    expect(normalizeRank('AB')).toBe('ABLE_SEAMAN');
    expect(normalizeRank('Ordinary Seaman')).toBe('ORDINARY_SEAMAN');
    expect(normalizeRank('Kelasi')).toBe('ORDINARY_SEAMAN');
  });

  it('memetakan jabatan mesin tanpa tertukar dengan dek', () => {
    expect(normalizeRank('Chief Engineer')).toBe('CHIEF_ENGINEER');
    expect(normalizeRank('KKM')).toBe('CHIEF_ENGINEER');
    expect(normalizeRank('Masinis I')).toBe('CHIEF_ENGINEER');
    expect(normalizeRank('Second Engineer')).toBe('SECOND_ENGINEER');
    expect(normalizeRank('Masinis II')).toBe('SECOND_ENGINEER');
    expect(normalizeRank('Third Engineer')).toBe('THIRD_ENGINEER');
    expect(normalizeRank('Masinis III')).toBe('THIRD_ENGINEER');
    expect(normalizeRank('Fourth Engineer')).toBe('FOURTH_ENGINEER');
    expect(normalizeRank('Oiler')).toBe('OILER');
    expect(normalizeRank('Wiper')).toBe('WIPER');
  });

  it('memetakan jabatan katering', () => {
    expect(normalizeRank('Chief Cook')).toBe('CHIEF_COOK');
    expect(normalizeRank('Koki')).toBe('CHIEF_COOK');
    expect(normalizeRank('Messman')).toBe('MESSMAN');
  });

  it('mengembalikan null untuk input tak dikenal (bukan menebak)', () => {
    expect(normalizeRank('')).toBeNull();
    expect(normalizeRank('   ')).toBeNull();
    expect(normalizeRank('Astronaut')).toBeNull();
    expect(normalizeRank('Manajer Pemasaran')).toBeNull();
    expect(normalizeRank(undefined)).toBeNull();
    expect(normalizeRank(42)).toBeNull();
  });

  it('isKnownRank hanya menerima nilai enum sah', () => {
    expect(isKnownRank('MASTER')).toBe(true);
    expect(isKnownRank('master')).toBe(false);
    expect(supportedRanks()).toContain('CHIEF_COOK');
  });
});

describe('Pemetaan tipe kapal — strict', () => {
  it('memetakan aspal sebelum tanker generik', () => {
    expect(normalizeVesselType('Asphalt Tanker')).toBe('ASPHALT_BITUMEN_TANKER');
    expect(normalizeVesselType('Bitumen Carrier')).toBe('ASPHALT_BITUMEN_TANKER');
  });

  it('memetakan produk sebelum tanker generik', () => {
    expect(normalizeVesselType('Product Tanker')).toBe('PRODUCT_TANKER');
    expect(normalizeVesselType('Crude Oil Tanker')).toBe('OIL_CHEMICAL_TANKER');
    expect(normalizeVesselType('Chemical Tanker')).toBe('OIL_CHEMICAL_TANKER');
  });

  it('memetakan tipe lain', () => {
    expect(normalizeVesselType('Bulk Carrier')).toBe('BULK_CARRIER');
    expect(normalizeVesselType('Container Feeder')).toBe('CONTAINER_FEEDER');
    expect(normalizeVesselType('Harbor Tug')).toBe('HARBOR_OCEAN_TUG');
    expect(normalizeVesselType('Offshore Crew Boat')).toBe('OFFSHORE_CREW_BOAT');
    expect(normalizeVesselType('General Cargo')).toBe('GENERAL_CARGO');
  });

  it('mengembalikan null untuk tipe tak dikenal', () => {
    expect(normalizeVesselType('Kapal Selam')).toBeNull();
    expect(normalizeVesselType('')).toBeNull();
    expect(normalizeVesselType(null)).toBeNull();
  });

  it('mengenali keluarga tanker', () => {
    expect(isTankerVesselType('PRODUCT_TANKER')).toBe(true);
    expect(isTankerVesselType('BULK_CARRIER')).toBe(false);
    expect(isTankerVesselType(undefined)).toBe(false);
  });
});
