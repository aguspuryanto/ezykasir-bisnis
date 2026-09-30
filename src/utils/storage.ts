import { Outlet, Product, Category, Customer, Transaction, StoreSettings, MembershipTier } from '../types';

const STORAGE_KEYS = {
  OUTLETS: 'kasirpro_outlets',
  ACTIVE_OUTLET_ID: 'kasirpro_active_outlet_id',
  CATEGORIES: 'kasirpro_categories',
  PRODUCTS: 'kasirpro_products',
  CUSTOMERS: 'kasirpro_customers',
  TRANSACTIONS: 'kasirpro_transactions',
  SETTINGS: 'kasirpro_settings',
};

export const DEFAULT_OUTLETS: Outlet[] = [
  {
    id: 'out-1',
    name: 'Toko Pusat - Senopati',
    code: 'PST-01',
    address: 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan',
    phone: '0812-8888-9999',
    manager: 'Budi Santoso',
    isDefault: true,
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: 'out-2',
    name: 'Cabang 2 - Riau Bandung',
    code: 'BDG-02',
    address: 'Jl. L.L.R.E. Martadinata (Riau) No. 105, Bandung',
    phone: '0813-7777-6666',
    manager: 'Rian Firmansyah',
    isDefault: false,
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: 'out-3',
    name: 'Cabang 3 - Tunjungan Surabaya',
    code: 'SBY-03',
    address: 'Jl. Tunjungan No. 24, Genteng, Surabaya',
    phone: '0819-3333-2222',
    manager: 'Siti Aminah',
    isDefault: false,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Kopi & Minuman', icon: 'Coffee', color: '#0284c7' },
  { id: 'cat-2', name: 'Makanan Utama', icon: 'Utensils', color: '#ea580c' },
  { id: 'cat-3', name: 'Snack & Pastry', icon: 'Cookie', color: '#d97706' },
  { id: 'cat-4', name: 'Paket Hemat', icon: 'Sparkles', color: '#7c3aed' },
  { id: 'cat-5', name: 'Retail & Kemasan', icon: 'Package', color: '#059669' },
];

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Karsa Jiwa Cafe & Resto',
  tagline: 'Otentik & Berkualitas Sejak 2020',
  address: 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan',
  phone: '0812-8888-9999',
  email: 'halo@karsajiwa.id',
  website: 'www.karsajiwa.id',
  receiptFooter: 'Terima kasih atas kunjungan Anda!\nFollow Instagram kami: @karsajiwa.id\nKritik & Saran WA: 0812-8888-9999',
  receiptPaperSize: '58mm',
  showLogoOnReceipt: true,
  showPhoneOnReceipt: true,
  showBarcodeOnReceipt: true,
  currencySymbol: 'Rp',
  taxEnabled: true,
  taxRate: 11, // PPN 11%
  serviceFeeEnabled: false,
  serviceFeeRate: 2,
  loyaltyProgramEnabled: true,
  loyaltyEarnThreshold: 10000, // Tiap 10.000 belanja
  loyaltyPointsEarnedPerThreshold: 10, // Dapat 10 poin
  loyaltyPointValueInRupiah: 100, // 1 poin = Rp 100 (100 poin = Rp 10.000 diskon)
  paymentMethods: {
    cash: true,
    qris: true,
    qrisMerchantName: 'KARSA JIWA SENOPATI',
    qrisNmid: 'ID102030405060789',
    bank_transfer: true,
    bankAccounts: [
      { bank: 'BCA', accountNo: '8830129384', holder: 'PT KARSA JIWA MANDIRI' },
      { bank: 'Bank Mandiri', accountNo: '1370019283741', holder: 'PT KARSA JIWA MANDIRI' },
      { bank: 'BRI', accountNo: '034101002345501', holder: 'PT KARSA JIWA MANDIRI' },
    ],
    ewallet: true,
    ewalletProviders: ['GoPay', 'DANA', 'OVO', 'ShopeePay', 'LinkAja'],
    edc_card: true,
    debt: true,
  },
};

export const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Dimas Anggara',
    phone: '081234567890',
    email: 'dimas.anggara@gmail.com',
    address: 'Kebayoran Baru, Jakarta Selatan',
    notes: 'Suka Kopi less sugar, langganan pagi',
    points: 120, // Rp 12.000 nilai diskon
    totalSpent: 1450000,
    totalOrders: 14,
    tier: 'Gold',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    lastPurchaseDate: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'cust-2',
    name: 'Siti Rahmawati',
    phone: '085712345678',
    email: 'siti.rahma@yahoo.com',
    address: 'Tebet Timur, Jakarta Selatan',
    notes: 'Member VIP',
    points: 350, // Rp 35.000 nilai diskon
    totalSpent: 3820000,
    totalOrders: 28,
    tier: 'Platinum',
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    lastPurchaseDate: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'cust-3',
    name: 'Andi Pratama',
    phone: '087890123456',
    email: 'andi.pratama@outlook.com',
    address: 'Pondok Indah, Jakarta',
    notes: 'Sering pesan take-away rombongan kantor',
    points: 60,
    totalSpent: 680000,
    totalOrders: 6,
    tier: 'Silver',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    lastPurchaseDate: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'cust-4',
    name: 'Dewi Lestari',
    phone: '081388990011',
    email: 'dewi.lestari@gmail.com',
    address: 'Fatmawati, Jakarta Selatan',
    points: 20,
    totalSpent: 195000,
    totalOrders: 2,
    tier: 'Bronze',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    lastPurchaseDate: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export const INITIAL_PRODUCTS_DATA: Omit<Product, 'id' | 'outletId'>[] = [
  {
    name: 'Es Kopi Susu Gula Aren',
    sku: 'KOP-001',
    barcode: '8991001001',
    category: 'Kopi & Minuman',
    costPrice: 8000,
    sellingPrice: 22000,
    stock: 45,
    minStock: 10,
    unit: 'cup',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80',
    description: 'Espresso blend Arabika & Robusta dengan susu segar dan gula aren murni',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    name: 'Americano Ice Double Shot',
    sku: 'KOP-002',
    barcode: '8991001002',
    category: 'Kopi & Minuman',
    costPrice: 5000,
    sellingPrice: 18000,
    stock: 60,
    minStock: 10,
    unit: 'cup',
    image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=400&auto=format&fit=crop&q=80',
    description: 'Espresso double shot disajikan dingin menyegarkan',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    name: 'Matcha Latte Premium',
    sku: 'MIN-003',
    barcode: '8991001003',
    category: 'Kopi & Minuman',
    costPrice: 11000,
    sellingPrice: 26000,
    stock: 28,
    minStock: 8,
    unit: 'cup',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80',
    description: 'Matcha Uji Jepang asli dengan susu creamy lembut',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    name: 'Nasi Goreng Spesial Karsa',
    sku: 'MAK-001',
    barcode: '8991001004',
    category: 'Makanan Utama',
    costPrice: 14000,
    sellingPrice: 32000,
    stock: 25,
    minStock: 5,
    unit: 'porsi',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&auto=format&fit=crop&q=80',
    description: 'Nasi goreng bumbu racik istimewa dengan telur mata sapi, ayam suwir & kerupuk',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    name: 'Ayam Geprek Sambal Matah',
    sku: 'MAK-002',
    barcode: '8991001005',
    category: 'Makanan Utama',
    costPrice: 15000,
    sellingPrice: 30000,
    stock: 18,
    minStock: 5,
    unit: 'porsi',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop&q=80',
    description: 'Ayam krispi renyah ditumbuk dengan sambal matah khas Bali segar dan nasi hangat',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    name: 'Croissant Butter Perancis',
    sku: 'SNK-001',
    barcode: '8991001006',
    category: 'Snack & Pastry',
    costPrice: 10000,
    sellingPrice: 24000,
    stock: 14,
    minStock: 5,
    unit: 'pcs',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80',
    description: 'Pastry mentega renyah berlapis harum wangi khas butter Eropa',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    name: 'Kentang Goreng Truffle (French Fries)',
    sku: 'SNK-002',
    barcode: '8991001007',
    category: 'Snack & Pastry',
    costPrice: 9000,
    sellingPrice: 22000,
    stock: 3, // Low stock demo!
    minStock: 5,
    unit: 'porsi',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80',
    description: 'Kentang goreng garing dibumbui truffle oil dan taburan parmesan',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    name: 'Paket Sarapan Komplit (Kopi + Croissant)',
    sku: 'PKT-001',
    barcode: '8991001008',
    category: 'Paket Hemat',
    costPrice: 17000,
    sellingPrice: 38000,
    stock: 20,
    minStock: 5,
    unit: 'paket',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
    description: 'Kopi Susu / Americano + 1 Croissant Butter hangat',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    name: 'Biji Kopi Arabika Gayo 250gr',
    sku: 'RET-001',
    barcode: '8991001009',
    category: 'Retail & Kemasan',
    costPrice: 55000,
    sellingPrice: 95000,
    stock: 12,
    minStock: 4,
    unit: 'pack',
    image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=400&auto=format&fit=crop&q=80',
    description: 'Whole beans Arabika Aceh Gayo Specialty Roast Profile Medium',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    name: 'Air Mineral Gunung 600ml',
    sku: 'MIN-004',
    barcode: '8991001010',
    category: 'Kopi & Minuman',
    costPrice: 3000,
    sellingPrice: 8000,
    stock: 50,
    minStock: 12,
    unit: 'botol',
    image: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400&auto=format&fit=crop&q=80',
    description: 'Air mineral pegunungan alami segar',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
];

// Helper to determine customer tier
export const calculateCustomerTier = (totalSpent: number): MembershipTier => {
  if (totalSpent >= 2500000) return 'Platinum';
  if (totalSpent >= 1000000) return 'Gold';
  if (totalSpent >= 300000) return 'Silver';
  return 'Bronze';
};

// Generate realistic seeded transactions
const generateSampleTransactions = (outlets: Outlet[]): Transaction[] => {
  const p1 = outlets[0] || DEFAULT_OUTLETS[0];
  const now = new Date();
  
  const createTx = (
    daysAgo: number, 
    hoursAgo: number, 
    invNum: string, 
    custName: string, 
    paymentMethod: Transaction['paymentMethod'], 
    grandTotal: number, 
    itemsSummary: { name: string; qty: number; price: number }[]
  ): Transaction => {
    const txDate = new Date(now.getTime() - (daysAgo * 86400000) - (hoursAgo * 3600000));
    const items = itemsSummary.map((item, idx) => ({
      id: `line-${idx}-${invNum}`,
      productId: `prod-sample-${idx}`,
      name: item.name,
      sku: `SKU-${idx}`,
      unit: 'pcs',
      sellingPrice: item.price,
      costPrice: Math.round(item.price * 0.45),
      quantity: item.qty,
      discount: 0,
      discountPercent: 0,
      subtotal: item.price * item.qty,
    }));
    const subtotal = items.reduce((acc, i) => acc + i.subtotal, 0);
    const tax = Math.round(subtotal * 0.11);
    const total = subtotal + tax;

    return {
      id: `tx-${invNum}`,
      invoiceNumber: `INV/${txDate.getFullYear()}${String(txDate.getMonth() + 1).padStart(2, '0')}${String(txDate.getDate()).padStart(2, '0')}/${invNum}`,
      outletId: p1.id,
      outletName: p1.name,
      customerName: custName,
      customerPhone: custName === 'Umum / Non-Member' ? undefined : '081234567890',
      cashierName: 'Kasir 01 (Dewi)',
      items,
      subtotal,
      discount: 0,
      tax,
      taxRate: 11,
      serviceFee: 0,
      pointsRedeemed: 0,
      pointsDiscount: 0,
      pointsEarned: Math.floor(total / 10000) * 10,
      grandTotal: total,
      paymentMethod,
      paymentDetails: {
        method: paymentMethod,
        cashReceived: paymentMethod === 'cash' ? Math.ceil(total / 50000) * 50000 : undefined,
        change: paymentMethod === 'cash' ? (Math.ceil(total / 50000) * 50000) - total : 0,
        qrisRef: paymentMethod === 'qris' ? `QRIS-ID-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
        bankName: paymentMethod === 'bank_transfer' ? 'BCA' : undefined,
        ewalletProvider: paymentMethod === 'ewallet' ? 'GoPay' : undefined,
      },
      status: 'completed',
      createdAt: txDate.toISOString(),
    };
  };

  return [
    // Today
    createTx(0, 1, '001', 'Dimas Anggara', 'qris', 48840, [
      { name: 'Es Kopi Susu Gula Aren', qty: 2, price: 22000 }
    ]),
    createTx(0, 2, '002', 'Umum / Non-Member', 'cash', 59940, [
      { name: 'Nasi Goreng Spesial Karsa', qty: 1, price: 32000 },
      { name: 'Americano Ice Double Shot', qty: 1, price: 18000 + 4000 }
    ]),
    createTx(0, 4, '003', 'Siti Rahmawati', 'ewallet', 97680, [
      { name: 'Ayam Geprek Sambal Matah', qty: 2, price: 30000 },
      { name: 'Matcha Latte Premium', qty: 1, price: 28000 }
    ]),
    // Yesterday
    createTx(1, 3, '004', 'Andi Pratama', 'cash', 84360, [
      { name: 'Paket Sarapan Komplit (Kopi + Croissant)', qty: 2, price: 38000 }
    ]),
    createTx(1, 5, '005', 'Umum / Non-Member', 'bank_transfer', 105450, [
      { name: 'Biji Kopi Arabika Gayo 250gr', qty: 1, price: 95000 }
    ]),
    // 3 days ago (this week)
    createTx(3, 2, '006', 'Dimas Anggara', 'qris', 53280, [
      { name: 'Croissant Butter Perancis', qty: 2, price: 24000 }
    ]),
    createTx(4, 4, '007', 'Umum / Non-Member', 'cash', 71040, [
      { name: 'Nasi Goreng Spesial Karsa', qty: 2, price: 32000 }
    ]),
    // 6 days ago (this week)
    createTx(6, 6, '008', 'Siti Rahmawati', 'edc_card', 142080, [
      { name: 'Ayam Geprek Sambal Matah', qty: 3, price: 30000 },
      { name: 'Es Kopi Susu Gula Aren', qty: 2, price: 22000 }
    ]),
    // Earlier this month
    createTx(12, 1, '009', 'Dewi Lestari', 'qris', 51060, [
      { name: 'Kentang Goreng Truffle', qty: 1, price: 22000 },
      { name: 'Matcha Latte Premium', qty: 1, price: 24000 }
    ]),
    createTx(18, 3, '010', 'Andi Pratama', 'cash', 122100, [
      { name: 'Biji Kopi Arabika Gayo 250gr', qty: 1, price: 95000 },
      { name: 'Air Mineral Gunung 600ml', qty: 2, price: 8000 }
    ]),
  ];
};

// Storage Utilities
export const storage = {
  // Outlets
  getOutlets: (): Outlet[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OUTLETS);
      if (!data) {
        storage.saveOutlets(DEFAULT_OUTLETS);
        return DEFAULT_OUTLETS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_OUTLETS;
    }
  },

  saveOutlets: (outlets: Outlet[]) => {
    localStorage.setItem(STORAGE_KEYS.OUTLETS, JSON.stringify(outlets));
  },

  getActiveOutletId: (): string => {
    const outlets = storage.getOutlets();
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_OUTLET_ID);
    if (stored && outlets.some(o => o.id === stored)) {
      return stored;
    }
    const defaultOutlet = outlets.find(o => o.isDefault) || outlets[0];
    if (defaultOutlet) {
      storage.setActiveOutletId(defaultOutlet.id);
      return defaultOutlet.id;
    }
    return 'out-1';
  },

  setActiveOutletId: (id: string) => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_OUTLET_ID, id);
  },

  // Categories
  getCategories: (): Category[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) {
        storage.saveCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategories: (categories: Category[]) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  // Products
  getProducts: (): Product[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!data) {
        const outlets = storage.getOutlets();
        const primaryOutlet = outlets[0]?.id || 'out-1';
        const secondOutlet = outlets[1]?.id;

        const seeded: Product[] = INITIAL_PRODUCTS_DATA.map((p, idx) => ({
          ...p,
          id: `prod-${idx + 1}`,
          outletId: primaryOutlet,
        }));

        // Also add some products to branch 2 so that testing switching outlet works immediately
        if (secondOutlet) {
          INITIAL_PRODUCTS_DATA.slice(0, 4).forEach((p, idx) => {
            seeded.push({
              ...p,
              id: `prod-bdg-${idx + 1}`,
              outletId: secondOutlet,
              stock: Math.max(5, p.stock - 5),
            });
          });
        }

        storage.saveProducts(seeded);
        return seeded;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveProducts: (products: Product[]) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  // Copy products from one outlet to another
  copyProductsBetweenOutlets: (
    sourceOutletId: string, 
    targetOutletId: string, 
    options: { copyStock: boolean; overwriteExistingSku: boolean; customInitialStock?: number }
  ): { copiedCount: number; skippedCount: number } => {
    const allProducts = storage.getProducts();
    const sourceProducts = allProducts.filter(p => p.outletId === sourceOutletId);
    const targetProducts = allProducts.filter(p => p.outletId === targetOutletId);
    const targetSkus = new Set(targetProducts.map(p => p.sku.toLowerCase()));

    let copiedCount = 0;
    let skippedCount = 0;
    const newProducts: Product[] = [...allProducts];

    sourceProducts.forEach(sourceP => {
      const exists = targetSkus.has(sourceP.sku.toLowerCase());
      if (exists && !options.overwriteExistingSku) {
        skippedCount++;
        return;
      }

      if (exists && options.overwriteExistingSku) {
        // update existing
        const idx = newProducts.findIndex(p => p.outletId === targetOutletId && p.sku.toLowerCase() === sourceP.sku.toLowerCase());
        if (idx !== -1) {
          newProducts[idx] = {
            ...sourceP,
            id: newProducts[idx].id,
            outletId: targetOutletId,
            stock: options.copyStock ? sourceP.stock : (options.customInitialStock ?? 0),
            updatedAt: new Date().toISOString(),
          };
          copiedCount++;
        }
      } else {
        // insert new copy
        newProducts.push({
          ...sourceP,
          id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          outletId: targetOutletId,
          stock: options.copyStock ? sourceP.stock : (options.customInitialStock ?? 0),
          updatedAt: new Date().toISOString(),
        });
        copiedCount++;
      }
    });

    storage.saveProducts(newProducts);
    return { copiedCount, skippedCount };
  },

  // Customers
  getCustomers: (): Customer[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (!data) {
        storage.saveCustomers(DEFAULT_CUSTOMERS);
        return DEFAULT_CUSTOMERS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_CUSTOMERS;
    }
  },

  saveCustomers: (customers: Customer[]) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  // Transactions
  getTransactions: (): Transaction[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!data) {
        const outlets = storage.getOutlets();
        const seeded = generateSampleTransactions(outlets);
        storage.saveTransactions(seeded);
        return seeded;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  // Record a completed transaction (updates inventory stock, customer points and spent)
  recordTransaction: (transaction: Transaction) => {
    const transactions = storage.getTransactions();
    transactions.unshift(transaction);
    storage.saveTransactions(transactions);

    // Deduct stock for items in the specific outlet
    const products = storage.getProducts();
    transaction.items.forEach(cartItem => {
      const prodIndex = products.findIndex(p => p.id === cartItem.productId);
      if (prodIndex !== -1) {
        products[prodIndex].stock = Math.max(0, products[prodIndex].stock - cartItem.quantity);
        products[prodIndex].updatedAt = new Date().toISOString();
      }
    });
    storage.saveProducts(products);

    // Update customer if attached
    if (transaction.customerId) {
      const customers = storage.getCustomers();
      const custIndex = customers.findIndex(c => c.id === transaction.customerId);
      if (custIndex !== -1) {
        const currentCust = customers[custIndex];
        const newTotalSpent = currentCust.totalSpent + transaction.grandTotal;
        const newPoints = Math.max(0, currentCust.points - transaction.pointsRedeemed + transaction.pointsEarned);
        
        customers[custIndex] = {
          ...currentCust,
          points: newPoints,
          totalSpent: newTotalSpent,
          totalOrders: currentCust.totalOrders + 1,
          tier: calculateCustomerTier(newTotalSpent),
          lastPurchaseDate: transaction.createdAt,
        };
        storage.saveCustomers(customers);
      }
    }
  },

  // Settings
  getSettings: (): StoreSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        storage.saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings: StoreSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Reset to original factory demo data
  resetAll: () => {
    localStorage.removeItem(STORAGE_KEYS.OUTLETS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_OUTLET_ID);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    
    // re-trigger getters to re-populate
    storage.getOutlets();
    storage.getCategories();
    storage.getProducts();
    storage.getCustomers();
    storage.getTransactions();
    storage.getSettings();
  },

  exportAll: (): string => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      outlets: storage.getOutlets(),
      activeOutletId: storage.getActiveOutletId(),
      categories: storage.getCategories(),
      products: storage.getProducts(),
      customers: storage.getCustomers(),
      transactions: storage.getTransactions(),
      settings: storage.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importAll: (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.outlets) storage.saveOutlets(parsed.outlets);
      if (parsed.categories) storage.saveCategories(parsed.categories);
      if (parsed.products) storage.saveProducts(parsed.products);
      if (parsed.customers) storage.saveCustomers(parsed.customers);
      if (parsed.transactions) storage.saveTransactions(parsed.transactions);
      if (parsed.settings) storage.saveSettings(parsed.settings);
      if (parsed.activeOutletId) storage.setActiveOutletId(parsed.activeOutletId);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
};

// Indonesian Rupiah Currency Formatter
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// Date Formatter helper
export const formatDateTimeIndonesian = (isoDate: string): string => {
  try {
    const d = new Date(isoDate);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoDate;
  }
};
