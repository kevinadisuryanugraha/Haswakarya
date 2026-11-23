'use client';

import React, { useEffect, useState } from 'react';
import { 
  Ship, 
  Search, 
  Plus, 
  Anchor, 
  ShieldCheck, 
  X,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';

export default function VesselsPage() {
  const [vessels, setVessels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Vessel Form State
  const [formData, setFormData] = useState({
    name: '',
    imoNumber: '',
    callSign: '',
    flag: 'ID',
    vesselType: 'OIL_CHEMICAL_TANKER',
    dwt: '',
    grt: '',
    engineBhp: '',
    engineType: '',
    tradingArea: 'Ocean Going / Southeast Asia',
    ownerName: 'PT Haswakarya Perdana Samudra',
    safeManningTotal: '16',
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadVessels = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/portal/vessels');
      const json = await res.json();
      if (json.success) {
        setVessels(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVessels();
  }, []);

  const handleCreateVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/portal/vessels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal mendaftarkan armada.');
      }

      setIsModalOpen(false);
      setFormData({
        name: '',
        imoNumber: '',
        callSign: '',
        flag: 'ID',
        vesselType: 'OIL_CHEMICAL_TANKER',
        dwt: '',
        grt: '',
        engineBhp: '',
        engineType: '',
        tradingArea: 'Ocean Going / Southeast Asia',
        ownerName: 'PT Haswakarya Perdana Samudra',
        safeManningTotal: '16',
      });
      loadVessels();
    } catch (err: any) {
      setModalError(err.message || 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Armada Kapal Klien (Vessel Registry)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data riil seluruh kapal niaga yang dikelola safe manning-nya di PostgreSQL <code className="font-mono text-slate-700">Vessel</code>
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-[#071b34] hover:bg-[#0c2b52] text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Daftarkan Kapal Baru</span>
        </button>
      </div>

      {/* Fleet Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs min-w-0">
        <div className="overflow-x-auto">
          <table className="mobile-cards w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Kapal & Bendera</th>
                <th className="py-3 px-4">Nomor IMO & Call Sign</th>
                <th className="py-3 px-4">Tipe Kapal</th>
                <th className="py-3 px-4">DWT / BHP</th>
                <th className="py-3 px-4">Daerah Pelayaran</th>
                <th className="py-3 px-4">Safe Manning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {vessels.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                  <td data-label="Nama Kapal" className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Ship className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="break-words">{v.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 break-words">
                      Bendera: {v.flag} • Pemilik: {v.ownerName}
                    </div>
                  </td>
                  <td data-label="IMO / Call Sign" className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-slate-900">IMO {v.imoNumber}</div>
                    <div className="text-[11px] text-slate-400">Call: {v.callSign || '-'}</div>
                  </td>
                  <td data-label="Tipe Kapal" className="py-3.5 px-4 font-medium text-slate-800">
                    {v.vesselType?.replace(/_/g, ' ')}
                  </td>
                  <td data-label="DWT / BHP" className="py-3.5 px-4 font-mono text-slate-800">
                    <div>{v.dwt?.toLocaleString()} DWT</div>
                    <div className="text-[11px] text-slate-400">{v.engineBhp?.toLocaleString()} BHP</div>
                  </td>
                  <td data-label="Daerah Pelayaran" className="py-3.5 px-4 text-slate-600">
                    <div className="truncate max-w-[200px]">{v.tradingArea}</div>
                  </td>
                  <td data-label="Safe Manning" className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 font-mono">
                      {v.safeManningTotal} Awak
                    </span>
                  </td>
                </tr>
              ))}
              {vessels.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400" data-label="">
                    Belum ada armada kapal terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pendaftaran Kapal Nyata */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-w-xl w-full shadow-xl space-y-4 max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Daftarkan Kapal Baru (PostgreSQL)</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateVessel} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Kapal (e.g. MT HASWA NUSANTARA)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="MT ..."
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nomor IMO (7 Digit)</label>
                  <input
                    type="text"
                    required
                    value={formData.imoNumber}
                    onChange={(e) => setFormData({ ...formData, imoNumber: e.target.value })}
                    placeholder="9481920"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tipe Kapal</label>
                  <select
                    value={formData.vesselType}
                    onChange={(e) => setFormData({ ...formData, vesselType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="OIL_CHEMICAL_TANKER">Oil / Chemical Tanker</option>
                    <option value="PRODUCT_TANKER">Product Tanker</option>
                    <option value="BULK_CARRIER">Bulk Carrier</option>
                    <option value="HARBOR_OCEAN_TUG">Harbor / Ocean Tug</option>
                    <option value="CONTAINER_FEEDER">Container Feeder</option>
                    <option value="GENERAL_CARGO">General Cargo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Deadweight Tonnage (DWT)</label>
                  <input
                    type="number"
                    required
                    value={formData.dwt}
                    onChange={(e) => setFormData({ ...formData, dwt: e.target.value })}
                    placeholder="6500"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tenaga Mesin (BHP)</label>
                  <input
                    type="number"
                    required
                    value={formData.engineBhp}
                    onChange={(e) => setFormData({ ...formData, engineBhp: e.target.value })}
                    placeholder="3800"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#071b34] text-white font-bold hover:bg-[#0c2b52] disabled:opacity-50"
                >
                  {submitting ? 'Mendaftarkan...' : 'Daftarkan ke Armada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
