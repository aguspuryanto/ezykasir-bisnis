import React, { useState, useMemo } from 'react';
import { Customer, Transaction, MembershipTier, StoreSettings } from '../types';
import { formatRupiah, formatDateTimeIndonesian, calculateCustomerTier } from '../utils/storage';
import { 
  Users, 
  UserPlus, 
  Search, 
  Sparkles, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  Edit3, 
  Trash2, 
  X, 
  Award, 
  Receipt,
  FileText,
  ChevronRight
} from 'lucide-react';

interface CustomerViewProps {
  customers: Customer[];
  transactions: Transaction[];
  settings: StoreSettings;
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onViewReceipt: (tx: Transaction) => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  customers,
  transactions,
  settings,
  onSaveCustomer,
  onDeleteCustomer,
  onViewReceipt,
}) => {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | MembershipTier>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Adjust points modal
  const [pointsAdjustCust, setPointsAdjustCust] = useState<Customer | null>(null);
  const [adjustPointDelta, setAdjustPointDelta] = useState<string>('50');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchTier = tierFilter === 'all' || c.tier === tierFilter;
      const query = search.toLowerCase().trim();
      const matchQuery = !query || 
        c.name.toLowerCase().includes(query) || 
        c.phone.includes(query) ||
        (c.email && c.email.toLowerCase().includes(query));
      return matchTier && matchQuery;
    });
  }, [customers, tierFilter, search]);

  // Selected customer
  const activeCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Customer transactions history
  const customerTransactions = useMemo(() => {
    if (!activeCustomer) return [];
    return transactions.filter(t => 
      t.customerId === activeCustomer.id || 
      (t.customerPhone && t.customerPhone === activeCustomer.phone)
    );
  }, [transactions, activeCustomer]);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    });
    setIsAddEditOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      notes: customer.notes || '',
    });
    setIsAddEditOpen(true);
  };

  // Submit Add / Edit
  const handleSubmitCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    const customerToSave: Customer = {
      id: editingCustomer ? editingCustomer.id : `cust-${Date.now()}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      notes: formData.notes.trim(),
      points: editingCustomer ? editingCustomer.points : 10, // Initial bonus 10 points
      totalSpent: editingCustomer ? editingCustomer.totalSpent : 0,
      totalOrders: editingCustomer ? editingCustomer.totalOrders : 0,
      tier: editingCustomer ? editingCustomer.tier : 'Bronze',
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString(),
      lastPurchaseDate: editingCustomer?.lastPurchaseDate,
    };

    onSaveCustomer(customerToSave);
    setIsAddEditOpen(false);
  };

  // Submit manual points adjustment
  const handleSavePointsAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointsAdjustCust) return;
    const delta = parseInt(adjustPointDelta) || 0;
    const updated: Customer = {
      ...pointsAdjustCust,
      points: Math.max(0, pointsAdjustCust.points + delta),
    };
    onSaveCustomer(updated);
    setPointsAdjustCust(null);
  };

  const totalPointsCirculating = customers.reduce((acc, c) => acc + c.points, 0);
  const totalCustomerLifetimeSpend = customers.reduce((acc, c) => acc + c.totalSpent, 0);

  const getTierColor = (tier: MembershipTier) => {
    switch (tier) {
      case 'Platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Gold': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Silver': return 'bg-slate-200 text-slate-800 border-slate-300';
      case 'Bronze': default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Manajemen Pelanggan & Loyalitas</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola data pelanggan, kumpulkan poin reward, dan pantau riwayat transaksi member
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-sky-500/20 transition self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pelanggan</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Pelanggan</span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">{customers.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Member terdaftar</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Poin Beredar</span>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1">{totalPointsCirculating.toLocaleString('id-ID')}</p>
          <p className="text-[11px] text-slate-400 mt-1">Senilai {formatRupiah(totalPointsCirculating * settings.loyaltyPointValueInRupiah)} diskon</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Member VIP (Gold & Plat)</span>
          <p className="text-xl sm:text-2xl font-extrabold text-purple-600 mt-1">
            {customers.filter(c => c.tier === 'Gold' || c.tier === 'Platinum').length}
          </p>
          <p className="text-[11px] text-purple-700 font-medium mt-1">Pelanggan setia</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Belanja Member</span>
          <p className="text-lg sm:text-xl font-extrabold text-emerald-600 mt-1">{formatRupiah(totalCustomerLifetimeSpend)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Akumulasi seluruh transaksi</p>
        </div>
      </div>

      {/* Main Container: Split or Table View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer List */}
        <div className={`space-y-4 ${selectedCustomerId ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {/* Filter Bar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, no. WhatsApp, atau email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Tier Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {(['all', 'Bronze', 'Silver', 'Gold', 'Platinum'] as const).map(tier => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    tierFilter === tier
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {tier === 'all' ? 'Semua Tier' : tier}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Cards / Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
                    <th className="py-3 px-4">Nama Pelanggan</th>
                    <th className="py-3 px-4">Kontak</th>
                    <th className="py-3 px-4 text-center">Tier & Poin</th>
                    <th className="py-3 px-4 text-right">Total Belanja</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600">Tidak ada pelanggan ditemukan</p>
                        <p className="text-xs text-slate-400 mt-1">Tambahkan pelanggan baru untuk mulai mencatat loyalitas.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(customer => {
                      const isSelected = selectedCustomerId === customer.id;

                      return (
                        <tr
                          key={customer.id}
                          onClick={() => setSelectedCustomerId(customer.id)}
                          className={`cursor-pointer transition ${
                            isSelected ? 'bg-sky-50/80' : 'hover:bg-slate-50/70'
                          }`}
                        >
                          {/* Name & Notes */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                                {customer.name.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">{customer.name}</span>
                                {customer.notes && (
                                  <span className="text-[11px] text-slate-400 line-clamp-1 italic">
                                    "{customer.notes}"
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                              <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                              <span>{customer.phone}</span>
                            </div>
                            {customer.email && (
                              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                                <Mail className="w-3 h-3 shrink-0" />
                                <span>{customer.email}</span>
                              </div>
                            )}
                          </td>

                          {/* Tier & Points */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block mb-1 ${getTierColor(customer.tier)}`}>
                              {customer.tier}
                            </span>
                            <div className="flex items-center justify-center gap-1 text-amber-700 font-bold text-xs">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>{customer.points} Poin</span>
                            </div>
                          </td>

                          {/* Total Spend */}
                          <td className="py-3.5 px-4 text-right">
                            <span className="font-bold text-slate-900 block font-mono">{formatRupiah(customer.totalSpent)}</span>
                            <span className="text-[11px] text-slate-400">{customer.totalOrders}x Transaksi</span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEdit(customer)}
                                className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                                title="Edit Pelanggan"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(customer.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Hapus Pelanggan"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Details & Purchase History Drawer */}
        {activeCustomer && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 flex flex-col space-y-5 h-fit">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md">
                  {activeCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{activeCustomer.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block mt-0.5 ${getTierColor(activeCustomer.tier)}`}>
                    Member {activeCustomer.tier}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomerId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Loyalty Points Showcase */}
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Poin Loyalitas
                  </span>
                  <p className="text-2xl font-black text-amber-900 mt-1">{activeCustomer.points} Poin</p>
                  <p className="text-xs text-amber-700 font-medium">
                    Nilai tukar: <strong>{formatRupiah(activeCustomer.points * settings.loyaltyPointValueInRupiah)}</strong> potongan
                  </p>
                </div>

                <button
                  onClick={() => {
                    setPointsAdjustCust(activeCustomer);
                    setAdjustPointDelta('50');
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  +/- Poin
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{activeCustomer.phone}</span>
              </div>
              {activeCustomer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{activeCustomer.email}</span>
                </div>
              )}
              {activeCustomer.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{activeCustomer.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Terdaftar sejak {formatDateTimeIndonesian(activeCustomer.createdAt)}</span>
              </div>
            </div>

            {/* Purchase History */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-sky-600" />
                  <span>Riwayat Belanja ({customerTransactions.length})</span>
                </h4>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {customerTransactions.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    Belum ada riwayat transaksi tercatat untuk pelanggan ini.
                  </p>
                ) : (
                  customerTransactions.map(tx => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{tx.invoiceNumber}</span>
                        <span className="font-extrabold text-sky-700 font-mono">{formatRupiah(tx.grandTotal)}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{formatDateTimeIndonesian(tx.createdAt)}</span>
                        <span className="uppercase text-[10px] px-1.5 py-0.2 bg-white rounded-md border font-medium">
                          {tx.paymentMethod}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                        <span className="text-slate-500">{tx.items.length} item</span>
                        <button
                          onClick={() => onViewReceipt(tx)}
                          className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Lihat Struk</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Tambah / Edit Pelanggan */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingCustomer ? 'Edit Data Pelanggan' : 'Daftarkan Pelanggan Baru'}
              </h3>
              <button onClick={() => setIsAddEditOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCustomer} className="p-4 sm:p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Dimas Anggara"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp / HP *</label>
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs font-mono px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Opsional)</label>
                <input
                  type="email"
                  placeholder="dimas@gmail.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat (Opsional)</label>
                <input
                  type="text"
                  placeholder="Kebayoran Baru, Jakarta Selatan"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Khusus</label>
                <textarea
                  rows={2}
                  placeholder="Preferensi pesanan (misal: suka manis, langganan pagi)..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
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
                  {editingCustomer ? 'Perbarui' : 'Simpan Pelanggan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Adjust Points Manually */}
      {pointsAdjustCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">Sesuaikan Poin Loyalitas</h4>
              <button onClick={() => setPointsAdjustCust(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePointsAdjust} className="mt-4 space-y-3">
              <div>
                <span className="text-xs text-slate-500">Pelanggan:</span>
                <p className="font-bold text-slate-800 text-sm">{pointsAdjustCust.name}</p>
                <p className="text-xs text-amber-700 font-semibold mt-0.5">
                  Poin saat ini: {pointsAdjustCust.points} Poin
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tambah (+) atau Kurangi (-) Poin
                </label>
                <input
                  type="number"
                  required
                  placeholder="+50 atau -20"
                  value={adjustPointDelta}
                  onChange={e => setAdjustPointDelta(e.target.value)}
                  className="w-full text-base font-bold font-mono px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="p-2.5 bg-sky-50 rounded-xl text-xs text-sky-800">
                Poin akhir: <strong>{Math.max(0, pointsAdjustCust.points + (parseInt(adjustPointDelta) || 0))} Poin</strong>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPointsAdjustCust(null)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm"
                >
                  Simpan Poin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm">Hapus Pelanggan Ini?</h4>
            <p className="text-xs text-slate-500 mt-1">
              Data pelanggan dan poin yang terakumulasi akan dihapus. Riwayat nota sebelumnya tidak terpengaruh.
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
                  onDeleteCustomer(deleteConfirmId);
                  setDeleteConfirmId(null);
                  if (selectedCustomerId === deleteConfirmId) {
                    setSelectedCustomerId(null);
                  }
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
