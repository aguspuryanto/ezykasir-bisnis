export type MembershipTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface Outlet {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  manager: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface Product {
  id: string;
  outletId: string; // Belongs to specific outlet
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  costPrice: number; // Harga Modal (HPP)
  sellingPrice: number; // Harga Jual
  stock: number;
  minStock: number;
  unit: string; // pcs, porsi, botol, cup, kg, dll
  image?: string;
  description?: string;
  isActive: boolean;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  points: number; // Loyalty points balance
  totalSpent: number;
  totalOrders: number;
  tier: MembershipTier;
  createdAt: string;
  lastPurchaseDate?: string;
}

export interface CartItem {
  id: string; // unique item line id
  productId: string;
  name: string;
  sku: string;
  unit: string;
  sellingPrice: number;
  costPrice: number;
  quantity: number;
  discount: number; // Discount in rupiah
  discountPercent: number; // Discount in percent
  note?: string;
  subtotal: number;
}

export type PaymentMethod = 
  | 'cash' 
  | 'qris' 
  | 'bank_transfer' 
  | 'ewallet' 
  | 'edc_card' 
  | 'debt';

export interface BankAccount {
  bank: string; // BCA, Mandiri, BRI, BNI, dll
  accountNo: string;
  holder: string;
}

export interface PaymentDetails {
  method: PaymentMethod;
  cashReceived?: number;
  change?: number;
  qrisRef?: string;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
  ewalletProvider?: 'GoPay' | 'OVO' | 'DANA' | 'ShopeePay' | 'LinkAja' | string;
  ewalletPhone?: string;
  cardType?: 'debit' | 'credit';
  cardBank?: string;
  cardLast4?: string;
  cardApprovalCode?: string;
  customerDebtDueDate?: string;
  customerDebtNotes?: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: string; // e.g. INV/20260930/0001
  outletId: string;
  outletName: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  cashierName: string;
  items: CartItem[];
  subtotal: number;
  discount: number; // Nota level discount
  tax: number; // PPN
  taxRate: number; // e.g. 11%
  serviceFee: number;
  pointsRedeemed: number;
  pointsDiscount: number;
  pointsEarned: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentDetails: PaymentDetails;
  status: 'completed' | 'cancelled' | 'pending';
  notes?: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  receiptFooter: string;
  receiptPaperSize: '58mm' | '80mm';
  showLogoOnReceipt: boolean;
  showPhoneOnReceipt: boolean;
  showBarcodeOnReceipt: boolean;
  currencySymbol: string;
  taxEnabled: boolean;
  taxRate: number; // percentage (e.g., 11)
  serviceFeeEnabled: boolean;
  serviceFeeRate: number; // percentage (e.g., 2)
  loyaltyProgramEnabled: boolean;
  loyaltyEarnThreshold: number; // e.g., Every Rp 10.000 spent gives X points
  loyaltyPointsEarnedPerThreshold: number; // e.g. 10 points
  loyaltyPointValueInRupiah: number; // 1 point = Rp 100
  paymentMethods: {
    cash: boolean;
    qris: boolean;
    qrisMerchantName: string;
    qrisNmid: string;
    bank_transfer: boolean;
    bankAccounts: BankAccount[];
    ewallet: boolean;
    ewalletProviders: string[];
    edc_card: boolean;
    debt: boolean;
  };
}

export type DateFilterType = 'today' | 'yesterday' | 'week' | 'month' | 'custom';
