import React, { useState, useMemo } from 'react';
import { 
  Product, 
  Category, 
  CartItem, 
  Customer, 
  Outlet, 
  StoreSettings, 
  PaymentMethod, 
  Transaction,
  PaymentDetails 
} from '../types';
import { formatRupiah, calculateCustomerTier } from '../utils/storage';
import confetti from 'canvas-confetti';
import { 
  Search, 
  Barcode, 
  Plus, 
  Minus, 
  Trash2, 
  UserCheck, 
  UserPlus, 
  Sparkles, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Building, 
  Wallet, 
  FileText, 
  Check, 
  X, 
  Copy, 
  RotateCcw,
  ShoppingBag,
  Percent,
  MessageSquare
} from 'lucide-react';

interface CashierViewProps {
  products: Product[];
  categories: Category[];
  customers: Customer[];
  activeOutlet: Outlet;
  settings: StoreSettings;
  onRecordTransaction: (tx: Transaction) => void;
  onOpenReceipt: (tx: Transaction) => void;
  onAddQuickCustomer: (name: string, phone: string) => Customer;
}

export const CashierView: React.FC<CashierViewProps> = ({
  products,
  categories,
  customers,
  activeOutlet,
  settings,
  onRecordTransaction,
  onOpenReceipt,
  onAddQuickCustomer,
}) => {
  // State for POS
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [redeemPoints, setRedeemPoints] = useState<boolean>(false);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [notaDiscount, setNotaDiscount] = useState<number>(0); // in Rupiah
  const [isNotaDiscountPercent, setIsNotaDiscountPercent] = useState<boolean>(false);
  const [notaDiscountInput, setNotaDiscountInput] = useState<string>('');

  // Mobile drawer state
  const [mobileCartOpen, setMobileCartOpen] = useState<boolean>(false);

  // Quick customer modal
  const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);
  const [quickCustName, setQuickCustName] = useState<string>('');
  const [quickCustPhone, setQuickCustPhone] = useState<string>('');

  // Barcode scanner modal
  const [showBarcodeScanner, setShowBarcodeScanner] = useState<boolean>(false);
  const [barcodeInput, setBarcodeInput] = useState<string>('');

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [customCashInput, setCustomCashInput] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('BCA');
  const [selectedEwallet, setSelectedEwallet] = useState<string>('GoPay');
  const [cardApprovalCode, setCardApprovalCode] = useState<string>('');
  const [debtDueDate, setDebtDueDate] = useState<string>('');
  const [debtNotes, setDebtNotes] = useState<string>('');
  const [copiedBank, setCopiedBank] = useState<boolean>(false);

  // Filter products belonging to current outlet
  const outletProducts = useMemo(() => {
    return products.filter(p => p.outletId === activeOutlet.id && p.isActive);
  }, [products, activeOutlet.id]);

  // Filtered by category and search
  const filteredProducts = useMemo(() => {
    return outletProducts.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = !query || 
        p.name.toLowerCase().includes(query) || 
        p.sku.toLowerCase().includes(query) ||
        (p.barcode && p.barcode.toLowerCase().includes(query));
      return matchCat && matchSearch;
    });
  }, [outletProducts, selectedCategory, searchQuery]);

  // Selected customer object
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Calculate cart totals
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.subtotal, 0);
  }, [cart]);

  // Calculate discount
  const calculatedNotaDiscount = useMemo(() => {
    if (isNotaDiscountPercent) {
      const pct = parseFloat(notaDiscountInput) || 0;
      return Math.round((subtotal * pct) / 100);
    }
    return parseFloat(notaDiscountInput) || 0;
  }, [subtotal, isNotaDiscountPercent, notaDiscountInput]);

  // Calculate points discount
  const pointsDiscountValue = useMemo(() => {
    if (!redeemPoints || !selectedCustomer || pointsToRedeem <= 0) return 0;
    return Math.min(
      subtotal - calculatedNotaDiscount,
      pointsToRedeem * settings.loyaltyPointValueInRupiah
    );
  }, [redeemPoints, selectedCustomer, pointsToRedeem, subtotal, calculatedNotaDiscount, settings.loyaltyPointValueInRupiah]);

  // Calculate tax
  const tax = useMemo(() => {
    if (!settings.taxEnabled) return 0;
    const taxableAmount = Math.max(0, subtotal - calculatedNotaDiscount - pointsDiscountValue);
    return Math.round((taxableAmount * settings.taxRate) / 100);
  }, [settings.taxEnabled, settings.taxRate, subtotal, calculatedNotaDiscount, pointsDiscountValue]);

  // Calculate service fee
  const serviceFee = useMemo(() => {
    if (!settings.serviceFeeEnabled) return 0;
    const base = Math.max(0, subtotal - calculatedNotaDiscount - pointsDiscountValue);
    return Math.round((base * settings.serviceFeeRate) / 100);
  }, [settings.serviceFeeEnabled, settings.serviceFeeRate, subtotal, calculatedNotaDiscount, pointsDiscountValue]);

  // Grand total
  const grandTotal = useMemo(() => {
    const raw = subtotal - calculatedNotaDiscount - pointsDiscountValue + tax + serviceFee;
    return Math.max(0, raw);
  }, [subtotal, calculatedNotaDiscount, pointsDiscountValue, tax, serviceFee]);

  // Loyalty points to earn on this transaction
  const pointsEarned = useMemo(() => {
    if (!settings.loyaltyProgramEnabled || !selectedCustomer) return 0;
    return Math.floor(grandTotal / settings.loyaltyEarnThreshold) * settings.loyaltyPointsEarnedPerThreshold;
  }, [settings, selectedCustomer, grandTotal]);

  // Add to cart
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.productId === product.id);
      if (existingIndex > -1) {
        const item = prev[existingIndex];
        if (item.quantity >= product.stock) {
          return prev; // stock limit
        }
        const updated = [...prev];
        const newQty = item.quantity + 1;
        const lineTotal = (item.sellingPrice * newQty) - (item.discount || 0);
        updated[existingIndex] = {
          ...item,
          quantity: newQty,
          subtotal: Math.max(0, lineTotal),
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          productId: product.id,
          name: product.name,
          sku: product.sku,
          unit: product.unit,
          sellingPrice: product.sellingPrice,
          costPrice: product.costPrice,
          quantity: 1,
          discount: 0,
          discountPercent: 0,
          subtotal: product.sellingPrice,
        };
        return [...prev, newItem];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.id === itemId) {
            const product = outletProducts.find(p => p.id === item.productId);
            const maxStock = product?.stock ?? 999;
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > maxStock) return item;
            const lineTotal = (item.sellingPrice * newQty) - (item.discount || 0);
            return {
              ...item,
              quantity: newQty,
              subtotal: Math.max(0, lineTotal),
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  // Remove item
  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  // Update item note
  const updateItemNote = (itemId: string, note: string) => {
    setCart(prev => prev.map(item => item.id === itemId ? { ...item, note } : item));
  };

  // Handle barcode scanning
  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    const matchedProduct = outletProducts.find(
      p => (p.barcode && p.barcode === code) || p.sku.toLowerCase() === code.toLowerCase()
    );

    if (matchedProduct) {
      addToCart(matchedProduct);
      setBarcodeInput('');
      setShowBarcodeScanner(false);
    } else {
      alert(`Produk dengan Barcode/SKU "${code}" tidak ditemukan di cabang ini.`);
    }
  };

  // Open payment modal
  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setCashGiven(grandTotal);
    setCustomCashInput(grandTotal.toString());
    setShowPaymentModal(true);
  };

  // Submit Quick Customer
  const handleCreateQuickCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCustName.trim() || !quickCustPhone.trim()) return;
    const newCust = onAddQuickCustomer(quickCustName.trim(), quickCustPhone.trim());
    setSelectedCustomerId(newCust.id);
    setQuickCustName('');
    setQuickCustPhone('');
    setShowAddCustomerModal(false);
  };

  // Quick cash buttons
  const cashSuggestions = useMemo(() => {
    const suggestions = new Set<number>();
    suggestions.add(grandTotal); // Uang pas
    
    // Nearest common Indonesian banknotes
    [20000, 50000, 100000, 200000, 500000].forEach(note => {
      if (note >= grandTotal) {
        suggestions.add(note);
      }
    });

    const roundedUp50k = Math.ceil(grandTotal / 50000) * 50000;
    if (roundedUp50k > grandTotal) suggestions.add(roundedUp50k);

    const roundedUp100k = Math.ceil(grandTotal / 100000) * 100000;
    if (roundedUp100k > grandTotal) suggestions.add(roundedUp100k);

    return Array.from(suggestions).sort((a, b) => a - b).slice(0, 5);
  }, [grandTotal]);

  // Execute payment and finish transaction
  const handleProcessTransaction = () => {
    if (paymentMethod === 'cash' && cashGiven < grandTotal) {
      alert('Nominal uang tunai diterima kurang dari total belanja.');
      return;
    }

    const txDate = new Date();
    const invoiceNumber = `INV/${txDate.getFullYear()}${String(txDate.getMonth() + 1).padStart(2, '0')}${String(txDate.getDate()).padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;

    const paymentDetails: PaymentDetails = {
      method: paymentMethod,
      cashReceived: paymentMethod === 'cash' ? cashGiven : undefined,
      change: paymentMethod === 'cash' ? Math.max(0, cashGiven - grandTotal) : 0,
      qrisRef: paymentMethod === 'qris' ? `QR-${Date.now().toString().slice(-8)}` : undefined,
      bankName: paymentMethod === 'bank_transfer' ? selectedBank : undefined,
      bankAccount: paymentMethod === 'bank_transfer' ? settings.paymentMethods.bankAccounts.find(b => b.bank === selectedBank)?.accountNo : undefined,
      ewalletProvider: paymentMethod === 'ewallet' ? selectedEwallet : undefined,
      cardApprovalCode: paymentMethod === 'edc_card' ? (cardApprovalCode || 'APRV-' + Math.floor(100000 + Math.random() * 900000)) : undefined,
      customerDebtDueDate: paymentMethod === 'debt' ? debtDueDate : undefined,
      customerDebtNotes: paymentMethod === 'debt' ? debtNotes : undefined,
    };

    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      invoiceNumber,
      outletId: activeOutlet.id,
      outletName: activeOutlet.name,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer ? selectedCustomer.name : 'Umum / Non-Member',
      customerPhone: selectedCustomer?.phone,
      cashierName: activeOutlet.manager || 'Kasir Toko',
      items: [...cart],
      subtotal,
      discount: calculatedNotaDiscount,
      tax,
      taxRate: settings.taxRate,
      serviceFee,
      pointsRedeemed: redeemPoints ? pointsToRedeem : 0,
      pointsDiscount: pointsDiscountValue,
      pointsEarned,
      grandTotal,
      paymentMethod,
      paymentDetails,
      status: 'completed',
      createdAt: txDate.toISOString(),
    };

    // Confetti effect
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }

    onRecordTransaction(newTransaction);
    setShowPaymentModal(false);
    setMobileCartOpen(false);

    // Reset Cart
    setCart([]);
    setSelectedCustomerId('');
    setRedeemPoints(false);
    setPointsToRedeem(0);
    setNotaDiscountInput('');

    // Open receipt modal
    onOpenReceipt(newTransaction);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-100">
      {/* LEFT: Product Catalog & Category Filter */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-3 sm:p-5">
        {/* Search & Actions Bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama produk, SKU, atau ketik barcode..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Barcode scanner button */}
          <button
            onClick={() => setShowBarcodeScanner(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition shrink-0"
            title="Scan Barcode Produk"
          >
            <Barcode className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">Scan Barcode</span>
          </button>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            Semua Produk ({outletProducts.length})
          </button>
          {categories.map(cat => {
            const count = outletProducts.filter(p => p.category === cat.name).length;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-dashed border-slate-300">
              <ShoppingBag className="w-12 h-12 text-slate-300 mb-2" />
              <h3 className="font-semibold text-slate-700">Tidak ada produk ditemukan</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                {searchQuery 
                  ? `Tidak ada produk yang cocok dengan "${searchQuery}". Coba kata kunci lain.`
                  : `Cabang ${activeOutlet.name} belum memiliki produk di kategori ini. Anda dapat menyalin produk dari cabang lain di menu Cabang Toko.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(product => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= product.minStock;
                const inCart = cart.find(c => c.productId === product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    className={`group relative bg-white rounded-2xl border transition duration-150 overflow-hidden flex flex-col justify-between ${
                      isOutOfStock
                        ? 'opacity-60 cursor-not-allowed border-slate-200'
                        : 'hover:shadow-md hover:border-sky-300 active:scale-[0.98] cursor-pointer border-slate-200/90'
                    }`}
                  >
                    {/* Product Image */}
                    <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-sky-50 text-sky-600 font-bold text-xl">
                          {product.name.charAt(0)}
                        </div>
                      )}

                      {/* Stock Badge */}
                      <div className="absolute top-2 right-2">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-xs">
                            Habis
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                            Sisa {product.stock}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-900/60 text-white backdrop-blur-xs">
                            Stok: {product.stock} {product.unit}
                          </span>
                        )}
                      </div>

                      {/* In-cart count badge */}
                      {inCart && inCart.quantity > 0 && (
                        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-sky-600 text-white text-xs font-bold flex items-center justify-center shadow-md animate-scale">
                          {inCart.quantity}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-0.5">
                          {product.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-tight">
                          {product.name}
                        </h4>
                      </div>

                      <div className="mt-2.5 flex items-baseline justify-between">
                        <span className="text-xs sm:text-sm font-bold text-sky-700">
                          {formatRupiah(product.sellingPrice)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          /{product.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart / Checkout Sidebar */}
      <div 
        className={`w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg lg:shadow-none z-30 transition-transform ${
          mobileCartOpen ? 'fixed inset-0 lg:static' : 'hidden lg:flex'
        }`}
      >
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Keranjang Belanja</h3>
            <span className="bg-sky-100 text-sky-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((a, b) => a + b.quantity, 0)} item
            </span>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 p-1 hover:bg-rose-50 rounded-lg transition"
                title="Kosongkan Keranjang"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
            {/* Close button on mobile */}
            <button
              onClick={() => setMobileCartOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customer Selector / Loyalty */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Pelanggan</span>
            </span>
            <button
              onClick={() => setShowAddCustomerModal(true)}
              className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Pelanggan Baru</span>
            </button>
          </div>

          <select
            value={selectedCustomerId}
            onChange={e => {
              setSelectedCustomerId(e.target.value);
              setRedeemPoints(false);
              setPointsToRedeem(0);
            }}
            className="w-full text-xs py-2 px-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
          >
            <option value="">Umum / Non-Member</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone}) - {c.tier} ({c.points} Poin)
              </option>
            ))}
          </select>

          {/* Member Loyalty Card if customer selected */}
          {selectedCustomer && (
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sky-900">{selectedCustomer.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-600 text-white">
                  Tier {selectedCustomer.tier}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 text-[11px]">
                <span>Poin Tersedia: <strong className="text-amber-700">{selectedCustomer.points} Poin</strong></span>
                <span className="text-[10px] text-slate-500">Nilai: {formatRupiah(selectedCustomer.points * settings.loyaltyPointValueInRupiah)}</span>
              </div>

              {/* Redeem points option */}
              {selectedCustomer.points > 0 && (
                <div className="mt-2 pt-2 border-t border-sky-200/60">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[11px] font-medium text-sky-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Tukarkan Poin Diskon
                    </span>
                    <input
                      type="checkbox"
                      checked={redeemPoints}
                      onChange={e => {
                        const checked = e.target.checked;
                        setRedeemPoints(checked);
                        if (checked) {
                          // Redeem up to max points or max order subtotal
                          const maxPtsForOrder = Math.floor(subtotal / settings.loyaltyPointValueInRupiah);
                          setPointsToRedeem(Math.min(selectedCustomer.points, maxPtsForOrder));
                        } else {
                          setPointsToRedeem(0);
                        }
                      }}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                  </label>

                  {redeemPoints && (
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500">Pakai {pointsToRedeem} Poin</span>
                      <span className="text-xs font-bold text-emerald-600">
                        -{formatRupiah(pointsToRedeem * settings.loyaltyPointValueInRupiah)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingBag className="w-12 h-12 stroke-[1.3] text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">Keranjang masih kosong</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Pilih produk di sebelah kiri untuk menambahkan pesanan</p>
            </div>
          ) : (
            cart.map(item => (
              <div 
                key={item.id}
                className="p-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-xl space-y-2 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h5 className="text-xs font-semibold text-slate-800 line-clamp-1">{item.name}</h5>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {formatRupiah(item.sellingPrice)} /{item.unit}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Note input toggle */}
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Catatan (misal: pedas, es dipisah)..."
                    value={item.note || ''}
                    onChange={e => updateItemNote(item.id, e.target.value)}
                    className="w-full text-[11px] bg-white border border-slate-200 rounded-md px-2 py-0.5 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                {/* Quantity Controls & Line Subtotal */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-md transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-md transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-xs font-bold text-slate-900">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Totals & Checkout Button */}
        <div className="p-4 border-t border-slate-200 bg-white space-y-2">
          {/* Subtotal */}
          <div className="flex justify-between text-xs text-slate-600">
            <span>Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>

          {/* Nota Discount input */}
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Percent className="w-3 h-3 text-emerald-600" />
              <span>Diskon Nota</span>
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder="0"
                value={notaDiscountInput}
                onChange={e => setNotaDiscountInput(e.target.value)}
                className="w-16 px-1.5 py-0.5 text-right text-xs bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={() => setIsNotaDiscountPercent(!isNotaDiscountPercent)}
                className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
              >
                {isNotaDiscountPercent ? '%' : 'Rp'}
              </button>
            </div>
          </div>

          {/* Points Discount if applied */}
          {pointsDiscountValue > 0 && (
            <div className="flex justify-between text-xs text-emerald-700 font-medium">
              <span>Diskon Poin ({pointsToRedeem} Poin)</span>
              <span>-{formatRupiah(pointsDiscountValue)}</span>
            </div>
          )}

          {/* Tax */}
          {settings.taxEnabled && (
            <div className="flex justify-between text-xs text-slate-600">
              <span>PPN ({settings.taxRate}%)</span>
              <span>{formatRupiah(tax)}</span>
            </div>
          )}

          {/* Grand Total */}
          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900">Total Tagihan</span>
            <span className="text-lg font-extrabold text-sky-700">
              {formatRupiah(grandTotal)}
            </span>
          </div>

          {/* Points to earn info */}
          {pointsEarned > 0 && (
            <div className="text-[11px] text-amber-700 bg-amber-50 rounded-lg p-1.5 text-center font-medium">
              +{pointsEarned} Poin didapat setelah pembayaran selesai
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handleOpenPayment}
            disabled={cart.length === 0}
            className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 ${
              cart.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-sky-600 hover:bg-sky-700 text-white active:scale-98'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>Bayar Sekarang ({formatRupiah(grandTotal)})</span>
          </button>
        </div>
      </div>

      {/* Floating Bottom Cart Bar for Mobile View */}
      {cart.length > 0 && !mobileCartOpen && (
        <div className="lg:hidden fixed bottom-14 left-0 right-0 z-30 p-2.5 bg-white border-t border-slate-200 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total ({cart.reduce((a, b) => a + b.quantity, 0)} item)</span>
              <span className="text-base font-extrabold text-sky-700">{formatRupiah(grandTotal)}</span>
            </div>
            <button
              onClick={() => setMobileCartOpen(true)}
              className="flex-1 max-w-[200px] py-2.5 px-4 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Lihat Nota / Bayar</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: Quick Add Customer */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">Tambah Pelanggan Cepat</h4>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateQuickCustomer} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Kevin Sanjaya"
                  value={quickCustName}
                  onChange={e => setQuickCustName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No WhatsApp / HP *</label>
                <input
                  type="tel"
                  required
                  placeholder="Misal: 08123456789"
                  value={quickCustPhone}
                  onChange={e => setQuickCustPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Pelanggan langsung terdaftar dalam program loyalitas dan mendapatkan poin dari setiap transaksi.
              </p>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="flex-1 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Barcode Scanner Dialog */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-sky-600" />
                <h4 className="font-bold text-slate-900 text-sm">Scan / Masukkan Barcode</h4>
              </div>
              <button onClick={() => setShowBarcodeScanner(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Virtual Scanner visual preview */}
              <div className="relative aspect-video w-full bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center p-4">
                <div className="w-48 h-20 border-2 border-dashed border-sky-400/80 rounded-lg flex items-center justify-center relative">
                  <div className="absolute inset-x-0 h-0.5 bg-rose-500 shadow-sm animate-pulse" />
                  <Barcode className="w-12 h-12 text-slate-600 opacity-60" />
                </div>
                <p className="text-[10px] text-slate-400 mt-3 text-center">
                  Arahkan barcode scanner fisik atau ketik kode barcode di bawah ini
                </p>
              </div>

              <form onSubmit={handleBarcodeSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Barcode / SKU</label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Contoh: 8991001001"
                    value={barcodeInput}
                    onChange={e => setBarcodeInput(e.target.value)}
                    className="w-full text-sm font-mono px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBarcodeScanner(false)}
                    className="flex-1 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm"
                  >
                    Tambah ke Nota
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PAYMENT MODAL (Cash, QRIS, Bank, E-Wallet, EDC, Debt) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6 overflow-y-auto backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-600 to-sky-700 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-sky-100 uppercase tracking-wider">Pembayaran Pesanan</span>
                <h3 className="text-xl sm:text-2xl font-extrabold">{formatRupiah(grandTotal)}</h3>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Payment Method Selector Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Pilih Jenis Pembayaran
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: 'cash', label: 'Cash / Tunai', icon: Banknote },
                    { id: 'qris', label: 'QRIS', icon: QrCode },
                    { id: 'bank_transfer', label: 'Transfer Bank', icon: Building },
                    { id: 'ewallet', label: 'E-Wallet', icon: Wallet },
                    { id: 'edc_card', label: 'Kartu / EDC', icon: CreditCard },
                    { id: 'debt', label: 'Kasbon / Catat', icon: FileText },
                  ].map(m => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                        className={`p-2.5 rounded-2xl flex flex-col items-center justify-center text-center transition border ${
                          isSelected
                            ? 'bg-sky-50 border-sky-600 text-sky-700 font-bold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                        <span className="text-[11px] leading-tight">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* METHOD 1: CASH */}
              {paymentMethod === 'cash' && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Nominal Uang Diterima</span>
                    <span className="text-xs text-slate-500">Pilih tombol cepat atau ketik</span>
                  </div>

                  {/* Quick Cash Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {cashSuggestions.map(amount => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => {
                          setCashGiven(amount);
                          setCustomCashInput(amount.toString());
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
                          cashGiven === amount
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {amount === grandTotal ? 'Uang Pas' : formatRupiah(amount)}
                      </button>
                    ))}
                  </div>

                  {/* Custom Cash Input */}
                  <div>
                    <input
                      type="number"
                      placeholder="Masukkan nominal uang tunai..."
                      value={customCashInput}
                      onChange={e => {
                        setCustomCashInput(e.target.value);
                        setCashGiven(parseFloat(e.target.value) || 0);
                      }}
                      className="w-full text-base sm:text-lg font-mono font-bold px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  {/* Change Calculation Box */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Kembalian</span>
                      <span className={`text-lg sm:text-xl font-extrabold ${cashGiven >= grandTotal ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {cashGiven >= grandTotal 
                          ? formatRupiah(cashGiven - grandTotal)
                          : `Kurang ${formatRupiah(grandTotal - cashGiven)}`}
                      </span>
                    </div>
                    {cashGiven >= grandTotal && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                        Cukup
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* METHOD 2: QRIS */}
              {paymentMethod === 'qris' && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold tracking-tighter text-red-600 text-lg">QRIS</span>
                    <span className="text-xs text-slate-500 font-medium">Quick Response Code Indonesian Standard</span>
                  </div>

                  {/* QRIS Code Preview Box */}
                  <div className="p-4 bg-white rounded-2xl border-2 border-slate-800 shadow-md flex flex-col items-center">
                    <div className="flex items-center justify-between w-full pb-2 mb-2 border-b border-slate-100 text-[10px] font-bold text-slate-700">
                      <span>{settings.paymentMethods.qrisMerchantName || activeOutlet.name.toUpperCase()}</span>
                      <span className="text-slate-400">NMID: {settings.paymentMethods.qrisNmid}</span>
                    </div>

                    {/* Stylized QR Vector Graphic */}
                    <div className="relative w-48 h-48 bg-white p-2 border border-slate-200 rounded-lg flex items-center justify-center">
                      <svg viewBox="0 0 200 200" className="w-full h-full text-slate-900">
                        {/* QR Corners */}
                        <rect x="10" y="10" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="8" />
                        <rect x="25" y="25" width="20" height="20" fill="currentColor" />

                        <rect x="140" y="10" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="8" />
                        <rect x="155" y="25" width="20" height="20" fill="currentColor" />

                        <rect x="10" y="140" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="8" />
                        <rect x="25" y="155" width="20" height="20" fill="currentColor" />

                        {/* Random pattern nodes */}
                        <rect x="75" y="15" width="12" height="12" fill="currentColor" />
                        <rect x="95" y="25" width="16" height="8" fill="currentColor" />
                        <rect x="115" y="15" width="10" height="25" fill="currentColor" />

                        <rect x="15" y="75" width="15" height="15" fill="currentColor" />
                        <rect x="40" y="85" width="10" height="20" fill="currentColor" />
                        <rect x="20" y="115" width="25" height="10" fill="currentColor" />

                        {/* Center QRIS logo badge */}
                        <rect x="80" y="80" width="40" height="40" rx="8" fill="#dc2626" />
                        <text x="100" y="105" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">QRIS</text>

                        {/* Other bits */}
                        <rect x="135" y="75" width="15" height="15" fill="currentColor" />
                        <rect x="160" y="90" width="25" height="15" fill="currentColor" />
                        <rect x="140" y="115" width="20" height="10" fill="currentColor" />

                        <rect x="75" y="140" width="20" height="15" fill="currentColor" />
                        <rect x="105" y="155" width="25" height="25" fill="currentColor" />
                        <rect x="145" y="145" width="15" height="30" fill="currentColor" />
                        <rect x="170" y="155" width="15" height="15" fill="currentColor" />
                      </svg>
                    </div>

                    <div className="mt-2 text-center">
                      <p className="text-xs font-bold text-slate-800">{formatRupiah(grandTotal)}</p>
                      <p className="text-[10px] text-slate-500">Scan via BCA Mobile, GoPay, OVO, DANA, ShopeePay</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 max-w-sm">
                    Minta pelanggan melakukan scan QR di atas. Setelah pembayaran di HP pelanggan berhasil, klik tombol "Konfirmasi & Selesai".
                  </p>
                </div>
              )}

              {/* METHOD 3: BANK TRANSFER */}
              {paymentMethod === 'bank_transfer' && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Pilih Rekening Tujuan Toko</span>
                  
                  <div className="space-y-2">
                    {settings.paymentMethods.bankAccounts.map(account => (
                      <div
                        key={account.accountNo}
                        onClick={() => setSelectedBank(account.bank)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          selectedBank === account.bank
                            ? 'bg-sky-50 border-sky-600 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-xs text-sky-800">{account.bank}</span>
                          <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">{account.accountNo}</p>
                          <p className="text-[10px] text-slate-500">a/n {account.holder}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(account.accountNo);
                            setCopiedBank(true);
                            setTimeout(() => setCopiedBank(false), 2000);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1"
                        >
                          {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedBank ? 'Tersalin' : 'Salin'}</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                    Pastikan mutasi rekening sudah masuk sejumlah <strong>{formatRupiah(grandTotal)}</strong> sebelum mengonfirmasi transaksi.
                  </div>
                </div>
              )}

              {/* METHOD 4: E-WALLET */}
              {paymentMethod === 'ewallet' && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Pilih Provider E-Wallet</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['GoPay', 'DANA', 'OVO', 'ShopeePay'].map(ew => (
                      <button
                        key={ew}
                        type="button"
                        onClick={() => setSelectedEwallet(ew)}
                        className={`p-3 rounded-xl border text-center font-bold text-xs transition ${
                          selectedEwallet === ew
                            ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {ew}
                      </button>
                    ))}
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-800">Metode E-Wallet Langsung / Push Payment</p>
                    <p>Total tagihan yang dikirim ke aplikasi pelanggan: <strong>{formatRupiah(grandTotal)}</strong></p>
                  </div>
                </div>
              )}

              {/* METHOD 5: KARTU / EDC */}
              {paymentMethod === 'edc_card' && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Informasi EDC / Mesin Gesek</span>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Approval Code / Nomor Referensi EDC</label>
                    <input
                      type="text"
                      placeholder="Misal: 928301"
                      value={cardApprovalCode}
                      onChange={e => setCardApprovalCode(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Silakan gesek / tap kartu debit atau kredit pelanggan pada mesin EDC kasir.
                  </p>
                </div>
              )}

              {/* METHOD 6: KASBON / CATAT */}
              {paymentMethod === 'debt' && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Catat Kasbon / Piutang Pelanggan</span>
                  
                  {!selectedCustomer ? (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                      Perhatian: Anda belum memilih pelanggan terdaftar di keranjang. Kasbon disarankan untuk pelanggan member agar dapat dilacak dengan akurat.
                    </div>
                  ) : (
                    <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800">
                      Piutang akan dicatat atas nama: <strong>{selectedCustomer.name}</strong> ({selectedCustomer.phone})
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Janji Bayar (Jatuh Tempo)</label>
                    <input
                      type="date"
                      value={debtDueDate}
                      onChange={e => setDebtDueDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan Tambahan</label>
                    <input
                      type="text"
                      placeholder="Misal: Bayar tanggal 5 saat gajian"
                      value={debtNotes}
                      onChange={e => setDebtNotes(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleProcessTransaction}
                disabled={paymentMethod === 'cash' && cashGiven < grandTotal}
                className={`py-3 px-6 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg transition flex items-center gap-2 ${
                  paymentMethod === 'cash' && cashGiven < grandTotal
                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Konfirmasi & Cetak Struk</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
