import React, { useState, useEffect } from 'react';
import { StoreSettings, BankAccount, Outlet, Product } from '../types';
import { OutletView } from './OutletView';
import { 
  Settings, 
  Store, 
  CreditCard, 
  Percent, 
  Receipt, 
  Save, 
  Check, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Download, 
  Upload, 
  Sparkles,
  Smartphone,
  ShieldCheck,
  Building,
  Building2,
  QrCode,
  Wallet
} from 'lucide-react';

interface SettingsViewProps {
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  outlets?: Outlet[];
  activeOutlet?: Outlet;
  products?: Product[];
  onSelectOutlet?: (outletId: string) => void;
  onSaveOutlet?: (outlet: Outlet) => void;
  onDeleteOutlet?: (outletId: string) => void;
  onCopyProducts?: (
    sourceOutletId: string, 
    targetOutletId: string, 
    options: { copyStock: boolean; overwriteExistingSku: boolean; customInitialStock?: number }
  ) => { copiedCount: number; skippedCount: number };
  initialTab?: 'store' | 'outlets' | 'payment' | 'tax' | 'loyalty' | 'receipt' | 'data';
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetData,
  onExportData,
  onImportData,
  outlets,
  activeOutlet,
  products,
  onSelectOutlet,
  onSaveOutlet,
  onDeleteOutlet,
  onCopyProducts,
  initialTab = 'store',
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'store' | 'outlets' | 'payment' | 'tax' | 'loyalty' | 'receipt' | 'data'>(initialTab);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // New Bank Account Form
  const [newBank, setNewBank] = useState('');
  const [newAccountNo, setNewAccountNo] = useState('');
  const [newHolder, setNewHolder] = useState('');

  // Handle Save
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Add Bank Account
  const handleAddBank = () => {
    if (!newBank || !newAccountNo || !newHolder) return;
    const newEntry: BankAccount = {
      bank: newBank.trim(),
      accountNo: newAccountNo.trim(),
      holder: newHolder.trim().toUpperCase(),
    };
    setFormData({
      ...formData,
      paymentMethods: {
        ...formData.paymentMethods,
        bankAccounts: [...formData.paymentMethods.bankAccounts, newEntry],
      },
    });
    setNewBank('');
    setNewAccountNo('');
    setNewHolder('');
  };

  // Remove Bank Account
  const handleRemoveBank = (index: number) => {
    const updated = [...formData.paymentMethods.bankAccounts];
    updated.splice(index, 1);
    setFormData({
      ...formData,
      paymentMethods: {
        ...formData.paymentMethods,
        bankAccounts: updated,
      },
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Pengaturan Toko & POS</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Konfigurasi profil toko, metode pembayaran (Cash, QRIS, Bank, E-Wallet), pajak PPN, struk, dan data
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan Berhasil Disimpan!</span>
          </div>
        )}
      </div>

      {/* Main Settings Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar Nav Tabs */}
        <div className="w-full md:w-64 bg-slate-50/80 border-b md:border-b-0 md:border-r border-slate-200 p-3 sm:p-4 space-y-1">
          {[
            { id: 'store', label: 'Profil Toko', icon: Store },
            { id: 'outlets', label: 'Cabang Toko', icon: Building2 },
            { id: 'payment', label: 'Metode Pembayaran', icon: CreditCard },
            { id: 'tax', label: 'Pajak & Layanan', icon: Percent },
            { id: 'loyalty', label: 'Program Loyalitas', icon: Sparkles },
            { id: 'receipt', label: 'Format Struk', icon: Receipt },
            { id: 'data', label: 'Cadangan & Data', icon: RotateCcw },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        {activeTab === 'outlets' ? (
          <div className="flex-1 min-w-0 bg-slate-50 overflow-hidden flex flex-col">
            {outlets && activeOutlet && onSelectOutlet && onSaveOutlet && onDeleteOutlet && onCopyProducts ? (
              <OutletView
                outlets={outlets}
                activeOutlet={activeOutlet}
                products={products || []}
                onSelectOutlet={onSelectOutlet}
                onSaveOutlet={onSaveOutlet}
                onDeleteOutlet={onDeleteOutlet}
                onCopyProducts={onCopyProducts}
              />
            ) : (
              <div className="p-8 text-center text-slate-500">Memuat data cabang...</div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 p-5 sm:p-8 space-y-6">
          {/* TAB 1: PROFIL TOKO */}
          {activeTab === 'store' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Informasi Identitas Toko
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Toko *</label>
                <input
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full text-sm font-semibold px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Slogan / Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Kantor / Toko Utama</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp / Telepon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Toko</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: METODE PEMBAYARAN */}
          {activeTab === 'payment' && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Pengaturan Pembayaran (Cash, QRIS, Bank, E-Wallet, Kartu)
              </h3>

              {/* Cash & QRIS toggles */}
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Tunai (Cash)</span>
                      <span className="text-[11px] text-slate-500">Menerima pembayaran tunai dengan kalkulator kembalian</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.paymentMethods.cash}
                    onChange={e => setFormData({
                      ...formData,
                      paymentMethods: { ...formData.paymentMethods, cash: e.target.checked }
                    })}
                    className="w-5 h-5 text-sky-600 rounded"
                  />
                </label>

                {/* QRIS */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">QRIS (Quick Response Code)</span>
                        <span className="text-[11px] text-slate-500">Menerima pembayaran QRIS dinamis di kasir</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.paymentMethods.qris}
                      onChange={e => setFormData({
                        ...formData,
                        paymentMethods: { ...formData.paymentMethods, qris: e.target.checked }
                      })}
                      className="w-5 h-5 text-sky-600 rounded"
                    />
                  </label>

                  {formData.paymentMethods.qris && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Merchant QRIS</label>
                        <input
                          type="text"
                          value={formData.paymentMethods.qrisMerchantName}
                          onChange={e => setFormData({
                            ...formData,
                            paymentMethods: { ...formData.paymentMethods, qrisMerchantName: e.target.value }
                          })}
                          className="w-full text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">NMID QRIS</label>
                        <input
                          type="text"
                          value={formData.paymentMethods.qrisNmid}
                          onChange={e => setFormData({
                            ...formData,
                            paymentMethods: { ...formData.paymentMethods, qrisNmid: e.target.value }
                          })}
                          className="w-full text-xs font-mono px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Transfer Bank */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Transfer Rekening Bank</span>
                        <span className="text-[11px] text-slate-500">Daftar rekening tujuan transfer pelanggan</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.paymentMethods.bank_transfer}
                      onChange={e => setFormData({
                        ...formData,
                        paymentMethods: { ...formData.paymentMethods, bank_transfer: e.target.checked }
                      })}
                      className="w-5 h-5 text-sky-600 rounded"
                    />
                  </div>

                  {formData.paymentMethods.bank_transfer && (
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      {/* Existing accounts */}
                      <div className="space-y-2">
                        {formData.paymentMethods.bankAccounts.map((account, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
                            <div>
                              <span className="font-bold text-slate-800">{account.bank}</span>: <span className="font-mono">{account.accountNo}</span> (a/n {account.holder})
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveBank(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add account input */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                        <span className="text-[11px] font-bold text-slate-700 block">+ Tambah Rekening Baru</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Nama Bank (BCA, Mandiri...)"
                            value={newBank}
                            onChange={e => setNewBank(e.target.value)}
                            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="Nomor Rekening"
                            value={newAccountNo}
                            onChange={e => setNewAccountNo(e.target.value)}
                            className="text-xs font-mono px-2.5 py-1.5 border border-slate-300 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="Atas Nama"
                            value={newHolder}
                            onChange={e => setNewHolder(e.target.value)}
                            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddBank}
                          className="px-3 py-1 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg"
                        >
                          + Tambah Rekening
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* E-Wallet & EDC Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-indigo-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">E-Wallet (GoPay, OVO, DANA)</span>
                        <span className="text-[10px] text-slate-500">Integrasi dompet digital</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.paymentMethods.ewallet}
                      onChange={e => setFormData({
                        ...formData,
                        paymentMethods: { ...formData.paymentMethods, ewallet: e.target.checked }
                      })}
                      className="w-5 h-5 text-sky-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-sky-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Kartu Debit / EDC</span>
                        <span className="text-[10px] text-slate-500">Mesin gesek EDC bank</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.paymentMethods.edc_card}
                      onChange={e => setFormData({
                        ...formData,
                        paymentMethods: { ...formData.paymentMethods, edc_card: e.target.checked }
                      })}
                      className="w-5 h-5 text-sky-600 rounded"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAJAK & BIAYA LAYANAN */}
          {activeTab === 'tax' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Pajak Pertambahan Nilai (PPN) & Biaya Layanan
              </h3>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Aktifkan PPN</span>
                    <span className="text-[11px] text-slate-500">Pajak akan otomatis dihitung pada setiap nota kasir</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.taxEnabled}
                    onChange={e => setFormData({ ...formData, taxEnabled: e.target.checked })}
                    className="w-5 h-5 text-sky-600 rounded"
                  />
                </label>

                {formData.taxEnabled && (
                  <div className="pt-2 border-t border-slate-200 flex items-center gap-3">
                    <label className="text-xs font-semibold text-slate-700">Persentase Tarif PPN (%):</label>
                    <div className="relative w-28">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.taxRate}
                        onChange={e => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs font-bold font-mono px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Biaya Layanan (Service Charge)</span>
                    <span className="text-[11px] text-slate-500">Khusus kafe / resto dengan service charge</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.serviceFeeEnabled}
                    onChange={e => setFormData({ ...formData, serviceFeeEnabled: e.target.checked })}
                    className="w-5 h-5 text-sky-600 rounded"
                  />
                </label>

                {formData.serviceFeeEnabled && (
                  <div className="pt-2 border-t border-slate-200 flex items-center gap-3">
                    <label className="text-xs font-semibold text-slate-700">Tarif Layanan (%):</label>
                    <div className="relative w-28">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.serviceFeeRate}
                        onChange={e => setFormData({ ...formData, serviceFeeRate: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs font-bold font-mono px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PROGRAM LOYALITAS */}
          {activeTab === 'loyalty' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Pengaturan Program Loyalitas & Poin Pelanggan
              </h3>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Aktifkan Program Poin Loyalitas</span>
                    <span className="text-[11px] text-slate-500">Pelanggan terdaftar mendapatkan poin reward dari setiap transaksi</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.loyaltyProgramEnabled}
                    onChange={e => setFormData({ ...formData, loyaltyProgramEnabled: e.target.checked })}
                    className="w-5 h-5 text-sky-600 rounded"
                  />
                </label>

                {formData.loyaltyProgramEnabled && (
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Setiap Kelipatan Belanja (Rp)
                        </label>
                        <input
                          type="number"
                          value={formData.loyaltyEarnThreshold}
                          onChange={e => setFormData({ ...formData, loyaltyEarnThreshold: parseInt(e.target.value) || 10000 })}
                          className="w-full text-xs font-mono font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Mendapatkan Poin
                        </label>
                        <input
                          type="number"
                          value={formData.loyaltyPointsEarnedPerThreshold}
                          onChange={e => setFormData({ ...formData, loyaltyPointsEarnedPerThreshold: parseInt(e.target.value) || 10 })}
                          className="w-full text-xs font-mono font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nilai Tukar Diskon per 1 Poin (Rp)
                      </label>
                      <input
                        type="number"
                        value={formData.loyaltyPointValueInRupiah}
                        onChange={e => setFormData({ ...formData, loyaltyPointValueInRupiah: parseInt(e.target.value) || 100 })}
                        className="w-full text-xs font-mono font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Contoh: 1 Poin = Rp {formData.loyaltyPointValueInRupiah} diskon. Maka 100 poin = diskon Rp {100 * formData.loyaltyPointValueInRupiah}.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: FORMAT STRUK */}
          {activeTab === 'receipt' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Pengaturan Kertas & Format Struk Pembayaran
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ukuran Kertas Thermal Printer</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['58mm', '80mm'].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFormData({ ...formData, receiptPaperSize: size as any })}
                        className={`p-3 rounded-xl border text-center font-bold text-xs transition ${
                          formData.receiptPaperSize === size
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {size} {size === '58mm' ? '(Standar Kasir Portable)' : '(Standar Printer Kasir Meja)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Kaki Struk (Footer)</label>
                  <textarea
                    rows={3}
                    value={formData.receiptFooter}
                    onChange={e => setFormData({ ...formData, receiptFooter: e.target.value })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showPhoneOnReceipt}
                      onChange={e => setFormData({ ...formData, showPhoneOnReceipt: e.target.checked })}
                      className="rounded text-sky-600"
                    />
                    <span>Tampilkan No. Telepon di Struk</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showBarcodeOnReceipt}
                      onChange={e => setFormData({ ...formData, showBarcodeOnReceipt: e.target.checked })}
                      className="rounded text-sky-600"
                    />
                    <span>Tampilkan Simulasi Barcode Struk</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CADANGAN & DATA */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Cadangan Data & Reset Demo
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export Data */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-xs text-slate-800">Ekspor Cadangan (Backup JSON)</h4>
                  <p className="text-[11px] text-slate-500">
                    Unduh seluruh data produk, outlet, pelanggan, dan transaksi sebagai file JSON untuk dicadangkan.
                  </p>
                  <button
                    type="button"
                    onClick={onExportData}
                    className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Backup JSON</span>
                  </button>
                </div>

                {/* Import Data */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-xs text-slate-800">Pulihkan Cadangan (Restore)</h4>
                  <p className="text-[11px] text-slate-500">
                    Muat kembali data cadangan dari file JSON yang telah diunduh sebelumnya.
                  </p>
                  <label className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih File Backup</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) onImportData(file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Reset Data Factory Demo */}
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                <h4 className="font-bold text-xs text-rose-800">Reset ke Data Awal (Demo Factory Reset)</h4>
                <p className="text-[11px] text-rose-600">
                  Mengembalikan seluruh database ke kondisi awal demo dengan katalog produk Indonesia lengkap, cabang contoh, dan riwayat transaksi simulasi.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Yakin ingin mereset seluruh data kembali ke data contoh bawaan?')) {
                      onResetData();
                    }
                  }}
                  className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition"
                >
                  Reset ke Data Bawaan
                </button>
              </div>
            </div>
          )}

          {/* Form Submit Footer */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};
