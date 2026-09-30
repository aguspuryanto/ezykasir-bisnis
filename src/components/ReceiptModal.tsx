import React, { useRef } from 'react';
import { Transaction, StoreSettings } from '../types';
import { formatRupiah, formatDateTimeIndonesian } from '../utils/storage';
import { Printer, Share2, Copy, Check, X, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onNewTransaction?: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  settings,
  isOpen,
  onClose,
  onNewTransaction,
}) => {
  const [copied, setCopied] = React.useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const getReceiptPlainText = () => {
    let text = `================================\n`;
    text += `${settings.storeName.toUpperCase()}\n`;
    text += `${transaction.outletName}\n`;
    text += `${settings.address}\n`;
    text += `Telp/WA: ${settings.phone}\n`;
    text += `================================\n`;
    text += `No. Nota : ${transaction.invoiceNumber}\n`;
    text += `Tanggal  : ${formatDateTimeIndonesian(transaction.createdAt)}\n`;
    text += `Kasir    : ${transaction.cashierName}\n`;
    if (transaction.customerName) {
      text += `Pelanggan: ${transaction.customerName}\n`;
    }
    text += `--------------------------------\n`;
    transaction.items.forEach(item => {
      text += `${item.name}\n`;
      text += `  ${item.quantity} x ${formatRupiah(item.sellingPrice)}`;
      if (item.discount > 0) {
        text += ` (Disc -${formatRupiah(item.discount)})`;
      }
      text += ` = ${formatRupiah(item.subtotal)}\n`;
    });
    text += `--------------------------------\n`;
    text += `Subtotal        : ${formatRupiah(transaction.subtotal)}\n`;
    if (transaction.discount > 0) {
      text += `Diskon Nota     : -${formatRupiah(transaction.discount)}\n`;
    }
    if (transaction.pointsDiscount > 0) {
      text += `Diskon Poin     : -${formatRupiah(transaction.pointsDiscount)} (${transaction.pointsRedeemed} Poin)\n`;
    }
    if (transaction.tax > 0) {
      text += `PPN (${transaction.taxRate}%)       : ${formatRupiah(transaction.tax)}\n`;
    }
    if (transaction.serviceFee > 0) {
      text += `Biaya Layanan   : ${formatRupiah(transaction.serviceFee)}\n`;
    }
    text += `TOTAL AKHIR     : ${formatRupiah(transaction.grandTotal)}\n`;
    text += `Metode Bayar    : ${transaction.paymentMethod.toUpperCase()}\n`;

    if (transaction.paymentMethod === 'cash' && transaction.paymentDetails.cashReceived) {
      text += `Tunai Diterima  : ${formatRupiah(transaction.paymentDetails.cashReceived)}\n`;
      text += `Kembalian       : ${formatRupiah(transaction.paymentDetails.change || 0)}\n`;
    } else if (transaction.paymentMethod === 'qris') {
      text += `Ref QRIS        : ${transaction.paymentDetails.qrisRef || 'BERHASIL'}\n`;
    } else if (transaction.paymentMethod === 'bank_transfer') {
      text += `Bank Transfer   : ${transaction.paymentDetails.bankName || 'BCA'}\n`;
    }

    if (transaction.pointsEarned > 0) {
      text += `Poin Didapat    : +${transaction.pointsEarned} Poin\n`;
    }
    text += `================================\n`;
    text += `${settings.receiptFooter || 'Terima kasih atas kunjungan Anda!'}\n`;
    return text;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getReceiptPlainText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getReceiptPlainText());
    let phone = transaction.customerPhone || '';
    phone = phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const isSmallReceipt = settings.receiptPaperSize === '58mm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto backdrop-blur-xs">
      {/* Container for on-screen modal & printable component */}
      <div className="relative w-full max-w-md my-8 flex flex-col items-center">
        {/* Modal Controls */}
        <div className="w-full flex items-center justify-between pb-3 text-white no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">Transaksi Berhasil Disimpan</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons Toolbar (No Print) */}
        <div className="w-full grid grid-cols-3 gap-2 mb-3 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md active:scale-95 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md active:scale-95 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Kirim WA</span>
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-md active:scale-95 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin' : 'Salin Nota'}</span>
          </button>
        </div>

        {/* Paper Receipt Simulation */}
        <div
          ref={receiptRef}
          id="receipt-to-print"
          className={`w-full bg-white text-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-200 font-mono text-xs leading-relaxed ${
            isSmallReceipt ? 'max-w-[320px]' : 'max-w-[380px]'
          }`}
        >
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <h2 className="text-base font-bold tracking-tight text-slate-900">{settings.storeName}</h2>
            <p className="font-semibold text-slate-700 mt-0.5">{transaction.outletName}</p>
            <p className="text-[11px] text-slate-500 mt-1">{settings.address}</p>
            {settings.showPhoneOnReceipt && (
              <p className="text-[11px] text-slate-500">Telp/WA: {settings.phone}</p>
            )}
          </div>

          {/* Meta Info */}
          <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">No. Nota</span>
              <span className="font-bold text-slate-800">{transaction.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Waktu</span>
              <span>{formatDateTimeIndonesian(transaction.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kasir</span>
              <span>{transaction.cashierName}</span>
            </div>
            {transaction.customerName && (
              <div className="flex justify-between font-medium text-sky-800">
                <span>Pelanggan</span>
                <span>{transaction.customerName}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-2.5 border-b border-dashed border-slate-300 space-y-2">
            {transaction.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span className="truncate pr-2">{item.name}</span>
                  <span>{formatRupiah(item.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>
                    {item.quantity} x {formatRupiah(item.sellingPrice)}
                    {item.discount > 0 && ` (Disc -${formatRupiah(item.discount)})`}
                  </span>
                  {item.note && <span className="italic text-[10px] text-amber-700">"{item.note}"</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatRupiah(transaction.subtotal)}</span>
            </div>

            {transaction.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Diskon Nota</span>
                <span>-{formatRupiah(transaction.discount)}</span>
              </div>
            )}

            {transaction.pointsDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Diskon Poin ({transaction.pointsRedeemed} Poin)</span>
                <span>-{formatRupiah(transaction.pointsDiscount)}</span>
              </div>
            )}

            {transaction.tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>PPN ({transaction.taxRate}%)</span>
                <span>{formatRupiah(transaction.tax)}</span>
              </div>
            )}

            {transaction.serviceFee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Biaya Layanan</span>
                <span>{formatRupiah(transaction.serviceFee)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
              <span>TOTAL</span>
              <span>{formatRupiah(transaction.grandTotal)}</span>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-600">Metode Pembayaran</span>
              <span className="uppercase text-sky-700 font-bold">{transaction.paymentMethod}</span>
            </div>

            {transaction.paymentMethod === 'cash' && (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>Tunai Diterima</span>
                  <span>{formatRupiah(transaction.paymentDetails.cashReceived || transaction.grandTotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Kembalian</span>
                  <span>{formatRupiah(transaction.paymentDetails.change || 0)}</span>
                </div>
              </>
            )}

            {transaction.paymentMethod === 'qris' && (
              <div className="flex justify-between text-slate-600">
                <span>Ref QRIS</span>
                <span className="font-mono text-[10px]">{transaction.paymentDetails.qrisRef || 'LUNAS (OTOMATIS)'}</span>
              </div>
            )}

            {transaction.paymentMethod === 'bank_transfer' && (
              <div className="flex justify-between text-slate-600">
                <span>Bank Tujuan</span>
                <span>{transaction.paymentDetails.bankName || 'BCA'}</span>
              </div>
            )}

            {transaction.paymentMethod === 'ewallet' && (
              <div className="flex justify-between text-slate-600">
                <span>E-Wallet</span>
                <span>{transaction.paymentDetails.ewalletProvider || 'GoPay / DANA'}</span>
              </div>
            )}

            {transaction.paymentMethod === 'edc_card' && (
              <div className="flex justify-between text-slate-600">
                <span>EDC / Kartu</span>
                <span>Apprv: {transaction.paymentDetails.cardApprovalCode || '839210'}</span>
              </div>
            )}

            {transaction.pointsEarned > 0 && (
              <div className="flex justify-between text-amber-700 font-semibold pt-1">
                <span>Poin Loyalitas Diperoleh</span>
                <span>+{transaction.pointsEarned} Poin</span>
              </div>
            )}
          </div>

          {/* Barcode Graphic simulation */}
          {settings.showBarcodeOnReceipt && (
            <div className="pt-3 pb-1 text-center">
              <div className="h-8 flex justify-center items-end gap-1 px-4 opacity-75">
                {[2, 4, 1, 3, 2, 5, 2, 4, 1, 3, 4, 2, 3, 5, 1, 3, 2, 4, 2, 3, 1, 4, 3, 2].map((height, i) => (
                  <span
                    key={i}
                    className="bg-black inline-block"
                    style={{
                      width: i % 2 === 0 ? '2px' : '3px',
                      height: `${14 + height * 2.5}px`,
                    }}
                  />
                ))}
              </div>
              <p className="text-[9px] tracking-widest text-slate-400 mt-1">{transaction.invoiceNumber}</p>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-2 text-center text-[10px] text-slate-500 whitespace-pre-line leading-tight">
            {settings.receiptFooter}
          </div>
        </div>

        {/* Bottom CTA for new transaction */}
        <div className="w-full mt-4 no-print flex gap-2">
          {onNewTransaction && (
            <button
              onClick={() => {
                onClose();
                onNewTransaction();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-lg text-center transition"
            >
              + Transaksi Baru
            </button>
          )}
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium text-sm transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
