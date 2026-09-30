import React, { useState } from 'react';
import { Outlet, Product } from '../types';
import { 
  Building2, 
  Plus, 
  Copy, 
  MapPin, 
  Phone, 
  User, 
  Check, 
  Edit3, 
  Trash2, 
  X, 
  ArrowRight, 
  Boxes, 
  CheckCircle2, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface OutletViewProps {
  outlets: Outlet[];
  activeOutlet: Outlet;
  products: Product[];
  onSelectOutlet: (outletId: string) => void;
  onSaveOutlet: (outlet: Outlet) => void;
  onDeleteOutlet: (outletId: string) => void;
  onCopyProducts: (
    sourceOutletId: string, 
    targetOutletId: string, 
    options: { copyStock: boolean; overwriteExistingSku: boolean; customInitialStock?: number }
  ) => { copiedCount: number; skippedCount: number };
}

export const OutletView: React.FC<OutletViewProps> = ({
  outlets,
  activeOutlet,
  products,
  onSelectOutlet,
  onSaveOutlet,
  onDeleteOutlet,
  onCopyProducts,
}) => {
  // Add / Edit Modal
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Copy Products Modal
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySourceId, setCopySourceId] = useState<string>(activeOutlet.id);
  const [copyTargetId, setCopyTargetId] = useState<string>('');
  const [copyStock, setCopyStock] = useState<boolean>(true);
  const [overwriteExisting, setOverwriteExisting] = useState<boolean>(false);
  const [copyResult, setCopyResult] = useState<{ copied: number; skipped: number } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    manager: '',
  });

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingOutlet(null);
    setFormData({
      name: '',
      code: `CAB-${outlets.length + 1}`,
      address: '',
      phone: '',
      manager: '',
    });
    setIsAddEditOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (outlet: Outlet) => {
    setEditingOutlet(outlet);
    setFormData({
      name: outlet.name,
      code: outlet.code,
      address: outlet.address,
      phone: outlet.phone,
      manager: outlet.manager,
    });
    setIsAddEditOpen(true);
  };

  // Submit Add / Edit
  const handleSubmitOutlet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const outletToSave: Outlet = {
      id: editingOutlet ? editingOutlet.id : `out-${Date.now()}`,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      manager: formData.manager.trim(),
      isDefault: editingOutlet ? editingOutlet.isDefault : false,
      createdAt: editingOutlet ? editingOutlet.createdAt : new Date().toISOString(),
    };

    onSaveOutlet(outletToSave);
    setIsAddEditOpen(false);
  };

  // Open Copy Wizard
  const handleOpenCopyWizard = (sourceId?: string) => {
    const src = sourceId || activeOutlet.id;
    setCopySourceId(src);
    // Find target outlet that is not the source
    const availableTargets = outlets.filter(o => o.id !== src);
    setCopyTargetId(availableTargets[0]?.id || '');
    setCopyResult(null);
    setIsCopyModalOpen(true);
  };

  // Execute Copy Products
  const handleExecuteCopy = () => {
    if (!copySourceId || !copyTargetId) {
      alert('Pilih cabang asal dan cabang tujuan.');
      return;
    }
    if (copySourceId === copyTargetId) {
      alert('Cabang asal dan tujuan tidak boleh sama.');
      return;
    }

    const res = onCopyProducts(copySourceId, copyTargetId, {
      copyStock,
      overwriteExistingSku: overwriteExisting,
      customInitialStock: 0,
    });

    setCopyResult({ copied: res.copiedCount, skipped: res.skippedCount });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Manajemen Cabang Toko (Outlet)</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Dukung banyak cabang toko dan fitur salin katalog produk agar tidak lelah menginput ulang satu per satu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenCopyWizard()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-sky-700 border border-sky-200 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition"
          >
            <Copy className="w-4 h-4 text-sky-600" />
            <span>Salin Produk Antar Cabang</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-sky-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Cabang</span>
          </button>
        </div>
      </div>

      {/* Feature Highlight Callout */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <h3 className="font-bold text-sm sm:text-base">Membuka Cabang Baru dengan Produk yang Sama?</h3>
          </div>
          <p className="text-xs sm:text-sm text-sky-100 max-w-xl">
            Gunakan fitur <strong>Salin Produk</strong> untuk menyalin seluruh daftar harga, kategori, foto, dan spesifikasi barang ke cabang baru hanya dalam 1 klik!
          </p>
        </div>

        <button
          onClick={() => handleOpenCopyWizard()}
          className="self-start sm:self-auto px-4 py-2 bg-white text-sky-700 hover:bg-sky-50 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition"
        >
          Salin Produk Sekarang &rarr;
        </button>
      </div>

      {/* Outlets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {outlets.map(outlet => {
          const isActive = outlet.id === activeOutlet.id;
          const outletProductCount = products.filter(p => p.outletId === outlet.id).length;

          return (
            <div
              key={outlet.id}
              className={`bg-white rounded-2xl border transition duration-200 p-5 flex flex-col justify-between ${
                isActive ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md' : 'border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isActive ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">{outlet.name}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{outlet.code}</span>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1">
                      <Check className="w-3 h-3 text-sky-600" />
                      Aktif
                    </span>
                  ) : (
                    <button
                      onClick={() => onSelectOutlet(outlet.id)}
                      className="text-xs text-sky-600 hover:text-sky-700 font-bold hover:underline"
                    >
                      Jadikan Aktif
                    </button>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-slate-600 my-4 pt-2 border-t border-slate-100">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{outlet.address || 'Alamat belum diisi'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{outlet.phone || '-'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Penanggung Jawab: <strong>{outlet.manager || 'Kasir'}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-slate-700 font-medium">
                    <Boxes className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>Jumlah Produk: <strong>{outletProductCount} item</strong></span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenCopyWizard(outlet.id)}
                  className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin ke cabang lain</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(outlet)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition"
                    title="Edit Cabang"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {outlets.length > 1 && !outlet.isDefault && (
                    <button
                      onClick={() => setDeleteConfirmId(outlet.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                      title="Hapus Cabang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Tambah / Edit Cabang */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingOutlet ? 'Edit Informasi Cabang' : 'Tambah Cabang Toko Baru'}
              </h3>
              <button onClick={() => setIsAddEditOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOutlet} className="p-4 sm:p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Cabang / Toko *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Cabang 2 - Riau Bandung"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Cabang</label>
                <input
                  type="text"
                  required
                  placeholder="BDG-02"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className="w-full text-xs font-mono uppercase px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  placeholder="Jl. L.L.R.E Martadinata No. 105, Bandung"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. Telepon / WA</label>
                  <input
                    type="tel"
                    placeholder="0813-7777-6666"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kepala Toko</label>
                  <input
                    type="text"
                    placeholder="Rian Firmansyah"
                    value={formData.manager}
                    onChange={e => setFormData({ ...formData, manager: e.target.value })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md"
                >
                  Simpan Cabang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SALIN PRODUK ANTAR CABANG (FITUR SPESIAL) */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-600 to-sky-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Copy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Salin Produk Antar Cabang</h3>
                  <p className="text-xs text-sky-100">Kopi katalog tanpa perlu memasukkan satu per satu lagi</p>
                </div>
              </div>
              <button onClick={() => setIsCopyModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Branch Selector Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    1. Cabang Asal (Sumber)
                  </label>
                  <select
                    value={copySourceId}
                    onChange={e => setCopySourceId(e.target.value)}
                    className="w-full text-xs font-semibold py-2 px-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  >
                    {outlets.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({products.filter(p => p.outletId === o.id).length} produk)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl">
                  <label className="block text-[11px] font-bold text-sky-800 uppercase tracking-wider mb-1">
                    2. Cabang Tujuan (Salin Ke)
                  </label>
                  <select
                    value={copyTargetId}
                    onChange={e => setCopyTargetId(e.target.value)}
                    className="w-full text-xs font-semibold py-2 px-2.5 bg-white border border-sky-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  >
                    {outlets
                      .filter(o => o.id !== copySourceId)
                      .map(o => (
                        <option key={o.id} value={o.id}>
                          {o.name} ({products.filter(p => p.outletId === o.id).length} produk)
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Options */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Opsi Penyalinan:</span>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={copyStock}
                    onChange={e => setCopyStock(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Sertakan Nilai Stok Asal</span>
                    <span className="text-[11px] text-slate-500">
                      Jika tidak dicentang, stok di cabang tujuan akan diatur ke 0 (bisa diisi restock nanti).
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-slate-200/80">
                  <input
                    type="checkbox"
                    checked={overwriteExisting}
                    onChange={e => setOverwriteExisting(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Perbarui Jika Kode SKU Sudah Ada</span>
                    <span className="text-[11px] text-slate-500">
                      Jika dicentang, harga dan data produk dengan SKU sama akan diperbarui dengan data cabang asal.
                    </span>
                  </div>
                </label>
              </div>

              {/* Success Result Banner */}
              {copyResult && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-800">
                    <p className="font-bold">Berhasil Menyalin Produk!</p>
                    <p className="mt-0.5">
                      <strong>{copyResult.copied} produk</strong> berhasil disalin ke cabang tujuan.
                      {copyResult.skipped > 0 && ` (${copyResult.skipped} produk dilewati karena SKU sudah ada).`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="py-2.5 px-4 text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={handleExecuteCopy}
                className="py-2.5 px-6 text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 active:scale-95 rounded-xl shadow-md flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span>Mulai Salin Produk</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm">Hapus Cabang Ini?</h4>
            <p className="text-xs text-slate-500 mt-1">
              Data cabang akan dihapus. Pastikan produk dan transaksi sudah tidak aktif sebelum menghapus.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteOutlet(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
