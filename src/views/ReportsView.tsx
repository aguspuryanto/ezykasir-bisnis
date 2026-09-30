import React, { useState, useMemo } from 'react';
import { Transaction, Outlet, DateFilterType, StoreSettings, Product } from '../types';
import { formatRupiah, formatDateTimeIndonesian } from '../utils/storage';
import { FinancialChatbot, FinancialSummaryData } from '../components/FinancialChatbot';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Printer, 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  ShoppingBag, 
  ChevronRight, 
  Search,
  Building2,
  PieChart,
  ArrowUpRight,
  Sparkles,
  Bot
} from 'lucide-react';

interface ReportsViewProps {
  transactions: Transaction[];
  outlets: Outlet[];
  activeOutlet: Outlet;
  settings: StoreSettings;
  onViewReceipt: (tx: Transaction) => void;
  products?: Product[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  outlets,
  activeOutlet,
  settings,
  onViewReceipt,
  products = [],
}) => {
  const [dateFilter, setDateFilter] = useState<DateFilterType>('today');
  const [selectedOutletFilter, setSelectedOutletFilter] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>(
    new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchInvoice, setSearchInvoice] = useState<string>('');

  // Date filtering logic
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const sevenDaysAgo = todayStart - 6 * 86400000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return transactions.filter(t => {
      // Outlet filter
      if (selectedOutletFilter !== 'all' && t.outletId !== selectedOutletFilter) {
        return false;
      }

      const txTime = new Date(t.createdAt).getTime();

      // Search invoice / customer
      if (searchInvoice.trim()) {
        const query = searchInvoice.toLowerCase();
        const matchInv = t.invoiceNumber.toLowerCase().includes(query);
        const matchCust = (t.customerName || '').toLowerCase().includes(query);
        if (!matchInv && !matchCust) return false;
      }

      // Date range filter
      if (dateFilter === 'today') {
        return txTime >= todayStart;
      } else if (dateFilter === 'yesterday') {
        return txTime >= yesterdayStart && txTime < todayStart;
      } else if (dateFilter === 'week') {
        return txTime >= sevenDaysAgo;
      } else if (dateFilter === 'month') {
        return txTime >= monthStart;
      } else if (dateFilter === 'custom') {
        const start = new Date(customStartDate + 'T00:00:00').getTime();
        const end = new Date(customEndDate + 'T23:59:59').getTime();
        return txTime >= start && txTime <= end;
      }

      return true;
    });
  }, [transactions, selectedOutletFilter, searchInvoice, dateFilter, customStartDate, customEndDate]);

  // Aggregated KPIs
  const totalOmset = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.grandTotal, 0);
  }, [filteredTransactions]);

  const totalTransactionCount = filteredTransactions.length;

  const totalHPP = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => {
      const itemsHpp = t.items.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0);
      return sum + itemsHpp;
    }, 0);
  }, [filteredTransactions]);

  const grossProfit = totalOmset - totalHPP;
  const averageBasket = totalTransactionCount > 0 ? Math.round(totalOmset / totalTransactionCount) : 0;

  // Breakdown by payment methods
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {
      cash: { count: 0, total: 0 },
      qris: { count: 0, total: 0 },
      bank_transfer: { count: 0, total: 0 },
      ewallet: { count: 0, total: 0 },
      edc_card: { count: 0, total: 0 },
      debt: { count: 0, total: 0 },
    };

    filteredTransactions.forEach(t => {
      const m = t.paymentMethod || 'cash';
      if (!map[m]) map[m] = { count: 0, total: 0 };
      map[m].count += 1;
      map[m].total += t.grandTotal;
    });

    return map;
  }, [filteredTransactions]);

  // Top Selling Products
  const topProducts = useMemo(() => {
    const prodMap: Record<string, { name: string; qty: number; revenue: number }> = {};

    filteredTransactions.forEach(t => {
      t.items.forEach(item => {
        if (!prodMap[item.name]) {
          prodMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
        }
        prodMap[item.name].qty += item.quantity;
        prodMap[item.name].revenue += item.subtotal;
      });
    });

    return Object.values(prodMap).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [filteredTransactions]);

  // Current outlet label
  const currentOutletName = selectedOutletFilter === 'all' 
    ? 'Semua Cabang Toko' 
    : (outlets.find(o => o.id === selectedOutletFilter)?.name || 'Cabang Terpilih');

  const periodLabel = {
    today: 'Hari Ini',
    yesterday: 'Kemarin',
    week: '7 Hari Terakhir',
    month: 'Bulan Ini',
    custom: `Rentang Kustom (${customStartDate} s/d ${customEndDate})`,
  }[dateFilter];

  const lowStockCount = useMemo(() => {
    return products.filter(p => {
      const matchOutlet = selectedOutletFilter === 'all' || p.outletId === selectedOutletFilter;
      return matchOutlet && p.isActive && p.stock <= p.minStock;
    }).length;
  }, [products, selectedOutletFilter]);

  const debtCount = useMemo(() => {
    return filteredTransactions.filter(t => t.paymentMethod === 'debt').length;
  }, [filteredTransactions]);

  const financialSummaryData: FinancialSummaryData = useMemo(() => ({
    period: periodLabel,
    outlet: currentOutletName,
    totalOmset: formatRupiah(totalOmset),
    grossProfit: formatRupiah(grossProfit),
    profitMargin: `${totalOmset > 0 ? Math.round((grossProfit / totalOmset) * 100) : 0}%`,
    totalHPP: formatRupiah(totalHPP),
    totalTransactions: totalTransactionCount,
    averageBasket: formatRupiah(averageBasket),
    paymentBreakdown,
    topProducts,
    lowStockCount,
    debtCount,
  }), [periodLabel, currentOutletName, totalOmset, grossProfit, totalHPP, totalTransactionCount, averageBasket, paymentBreakdown, topProducts, lowStockCount, debtCount]);

  // Export to CSV Function
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('Tidak ada data transaksi untuk diekspor pada filter ini.');
      return;
    }

    const headers = [
      'No Nota',
      'Tanggal & Waktu',
      'Cabang Toko',
      'Nama Kasir',
      'Nama Pelanggan',
      'Jumlah Item',
      'Rincian Produk Dibeli',
      'Subtotal',
      'Diskon',
      'PPN',
      'Total Akhir (IDR)',
      'Metode Pembayaran',
      'Status',
    ];

    const rows = filteredTransactions.map(t => {
      const itemsDetail = t.items.map(i => `${i.name} (${i.quantity}x)`).join('; ');
      return [
        `"${t.invoiceNumber}"`,
        `"${formatDateTimeIndonesian(t.createdAt)}"`,
        `"${t.outletName}"`,
        `"${t.cashierName}"`,
        `"${t.customerName || 'Umum'}"`,
        t.items.reduce((a, b) => a + b.quantity, 0),
        `"${itemsDetail}"`,
        t.subtotal,
        t.discount + t.pointsDiscount,
        t.tax,
        t.grandTotal,
        `"${t.paymentMethod.toUpperCase()}"`,
        `"${t.status}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Penjualan_${dateFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Report Handler
  const handlePrintReport = () => {
    window.print();
  };

  const paymentLabels: Record<string, string> = {
    cash: 'Tunai / Cash',
    qris: 'QRIS',
    bank_transfer: 'Transfer Bank',
    ewallet: 'E-Wallet',
    edc_card: 'Kartu / EDC',
    debt: 'Kasbon / Catat',
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Laporan & Analitik Penjualan</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Rekap omset harian, mingguan, bulanan, laba kotor, dan riwayat transaksi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const el = document.getElementById('gemini-financial-chatbot');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Tanya Gemini AI</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-sky-500/20 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (No-Print) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 no-print">
        {/* Date Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'today', label: 'Hari Ini' },
            { id: 'yesterday', label: 'Kemarin' },
            { id: 'week', label: '7 Hari Terakhir' },
            { id: 'month', label: 'Bulan Ini' },
            { id: 'custom', label: 'Costum Rentang' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setDateFilter(f.id as DateFilterType)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                dateFilter === f.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}

          {/* Outlet Filter Dropdown */}
          <div className="ml-auto flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedOutletFilter}
              onChange={e => setSelectedOutletFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">Semua Cabang Toko</option>
              {outlets.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Pickers if 'custom' is active */}
        {dateFilter === 'custom' && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Dari:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-xl bg-slate-50 font-mono text-xs focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Sampai:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-xl bg-slate-50 font-mono text-xs focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* KPI Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Omset */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Penjualan (Omset)</span>
          <p className="text-xl sm:text-2xl font-extrabold text-sky-700 mt-1">{formatRupiah(totalOmset)}</p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{totalTransactionCount} Transaksi Selesai</span>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Estimasi Laba Kotor</span>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1">{formatRupiah(grossProfit)}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Margin: {totalOmset > 0 ? Math.round((grossProfit / totalOmset) * 100) : 0}% dari Omset
          </p>
        </div>

        {/* Total HPP / Modal */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Modal (HPP)</span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-700 mt-1">{formatRupiah(totalHPP)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Harga pokok barang terjual</p>
        </div>

        {/* Average Basket Size */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Rata-Rata per Nota</span>
          <p className="text-xl sm:text-2xl font-extrabold text-purple-700 mt-1">{formatRupiah(averageBasket)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Rata-rata belanja per customer</p>
        </div>
      </div>

      {/* Visual Analytics: Payment Breakdown & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-sky-600" />
              <span>Komposisi Metode Pembayaran</span>
            </h3>
            <span className="text-xs text-slate-500">{totalTransactionCount} Transaksi</span>
          </div>

          <div className="space-y-3">
            {Object.entries(paymentBreakdown).map(([method, data]) => {
              const pct = totalOmset > 0 ? Math.round((data.total / totalOmset) * 100) : 0;
              return (
                <div key={method} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{paymentLabels[method] || method} ({data.count}x)</span>
                    <span className="font-mono">{formatRupiah(data.total)} ({pct}%)</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-sky-600 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>5 Produk Paling Laris (Top Seller)</span>
            </h3>
            <span className="text-xs text-slate-500">Berdasarkan Kuantitas</span>
          </div>

          <div className="space-y-2.5">
            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada item terjual pada periode ini</p>
            ) : (
              topProducts.map((prod, idx) => (
                <div
                  key={prod.name}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800 line-clamp-1">{prod.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block font-mono">{formatRupiah(prod.revenue)}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{prod.qty} terjual</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Gemini AI Financial Chatbot Section */}
      <div id="gemini-financial-chatbot">
        <FinancialChatbot financialData={financialSummaryData} />
      </div>

      {/* Detailed Transactions History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Riwayat Transaksi Penjualan</h3>
            <p className="text-xs text-slate-500">Daftar semua nota yang diterbitkan</p>
          </div>

          <div className="relative w-full sm:w-64 no-print">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor nota atau pelanggan..."
              value={searchInvoice}
              onChange={e => setSearchInvoice(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
                <th className="py-3 px-4">No. Nota & Waktu</th>
                <th className="py-3 px-4">Cabang</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4 text-right">Total Akhir</th>
                <th className="py-3 px-4 text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada riwayat transaksi</p>
                    <p className="text-xs text-slate-400 mt-0.5">Ubah filter periode tanggal di atas.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                    {/* Invoice & Time */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block font-mono">{tx.invoiceNumber}</span>
                      <span className="text-[11px] text-slate-400">{formatDateTimeIndonesian(tx.createdAt)}</span>
                    </td>

                    {/* Outlet */}
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {tx.outletName}
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">{tx.customerName || 'Umum'}</span>
                      <span className="text-[11px] text-slate-400">{tx.items.length} jenis item</span>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border">
                        {tx.paymentMethod}
                      </span>
                    </td>

                    {/* Grand Total */}
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900 font-mono">
                      {formatRupiah(tx.grandTotal)}
                    </td>

                    {/* Action: View Receipt */}
                    <td className="py-3 px-4 text-center no-print">
                      <button
                        onClick={() => onViewReceipt(tx)}
                        className="px-2.5 py-1 text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition"
                      >
                        Cetak Struk
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
