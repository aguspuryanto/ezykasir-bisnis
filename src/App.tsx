import React, { useState, useEffect, useMemo } from 'react';
import { 
  Outlet, 
  Product, 
  Category, 
  Customer, 
  Transaction, 
  StoreSettings 
} from './types';
import { storage } from './utils/storage';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ReceiptModal } from './components/ReceiptModal';
import { CashierView } from './views/CashierView';
import { StockView } from './views/StockView';
import { CustomerView } from './views/CustomerView';
import { ReportsView } from './views/ReportsView';
import { OutletView } from './views/OutletView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('cashier');

  // Core Data
  const [outlets, setOutlets] = useState<Outlet[]>(() => storage.getOutlets());
  const [activeOutletId, setActiveOutletId] = useState<string>(() => storage.getActiveOutletId());
  const [categories, setCategories] = useState<Category[]>(() => storage.getCategories());
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [customers, setCustomers] = useState<Customer[]>(() => storage.getCustomers());
  const [transactions, setTransactions] = useState<Transaction[]>(() => storage.getTransactions());
  const [settings, setSettings] = useState<StoreSettings>(() => storage.getSettings());

  // Receipt Modal State
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);

  // Stock Filter from Alert
  const [stockInitialFilter, setStockInitialFilter] = useState<'all' | 'low' | 'out'>('all');

  // Active Outlet object
  const activeOutlet = useMemo(() => {
    return outlets.find(o => o.id === activeOutletId) || outlets[0];
  }, [outlets, activeOutletId]);

  // Switch Active Outlet
  const handleSelectOutlet = (outletId: string) => {
    setActiveOutletId(outletId);
    storage.setActiveOutletId(outletId);
  };

  // Record Transaction
  const handleRecordTransaction = (tx: Transaction) => {
    storage.recordTransaction(tx);
    // Refresh local states
    setTransactions(storage.getTransactions());
    setProducts(storage.getProducts());
    setCustomers(storage.getCustomers());
  };

  // Open Receipt
  const handleOpenReceipt = (tx: Transaction) => {
    setReceiptTx(tx);
    setIsReceiptOpen(true);
  };

  // Quick Customer add
  const handleAddQuickCustomer = (name: string, phone: string): Customer => {
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name,
      phone,
      points: 10, // Welcome 10 points bonus
      totalSpent: 0,
      totalOrders: 0,
      tier: 'Bronze',
      createdAt: new Date().toISOString(),
    };
    const updated = [newCust, ...customers];
    setCustomers(updated);
    storage.saveCustomers(updated);
    return newCust;
  };

  // Product actions
  const handleSaveProduct = (product: Product) => {
    const existingIndex = products.findIndex(p => p.id === product.id);
    let updated: Product[];
    if (existingIndex > -1) {
      updated = [...products];
      updated[existingIndex] = product;
    } else {
      updated = [product, ...products];
    }
    setProducts(updated);
    storage.saveProducts(updated);
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    setProducts(updated);
    storage.saveProducts(updated);
  };

  const handleSaveCategory = (category: Category) => {
    const updated = [...categories, category];
    setCategories(updated);
    storage.saveCategories(updated);
  };

  // Customer actions
  const handleSaveCustomer = (customer: Customer) => {
    const existingIndex = customers.findIndex(c => c.id === customer.id);
    let updated: Customer[];
    if (existingIndex > -1) {
      updated = [...customers];
      updated[existingIndex] = customer;
    } else {
      updated = [customer, ...customers];
    }
    setCustomers(updated);
    storage.saveCustomers(updated);
  };

  const handleDeleteCustomer = (customerId: string) => {
    const updated = customers.filter(c => c.id !== customerId);
    setCustomers(updated);
    storage.saveCustomers(updated);
  };

  // Outlet actions
  const handleSaveOutlet = (outlet: Outlet) => {
    const existingIndex = outlets.findIndex(o => o.id === outlet.id);
    let updated: Outlet[];
    if (existingIndex > -1) {
      updated = [...outlets];
      updated[existingIndex] = outlet;
    } else {
      updated = [...outlets, outlet];
    }
    setOutlets(updated);
    storage.saveOutlets(updated);
  };

  const handleDeleteOutlet = (outletId: string) => {
    const updated = outlets.filter(o => o.id !== outletId);
    setOutlets(updated);
    storage.saveOutlets(updated);
    if (activeOutletId === outletId && updated.length > 0) {
      handleSelectOutlet(updated[0].id);
    }
  };

  // Copy products between outlets (Special feature)
  const handleCopyProducts = (
    sourceOutletId: string,
    targetOutletId: string,
    options: { copyStock: boolean; overwriteExistingSku: boolean; customInitialStock?: number }
  ) => {
    const result = storage.copyProductsBetweenOutlets(sourceOutletId, targetOutletId, options);
    setProducts(storage.getProducts());
    return result;
  };

  // Settings & Data actions
  const handleSaveSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  const handleResetData = () => {
    storage.resetAll();
    setOutlets(storage.getOutlets());
    setActiveOutletId(storage.getActiveOutletId());
    setCategories(storage.getCategories());
    setProducts(storage.getProducts());
    setCustomers(storage.getCustomers());
    setTransactions(storage.getTransactions());
    setSettings(storage.getSettings());
    alert('Database demo berhasil direset ke pengaturan awal pabrik!');
  };

  const handleExportData = () => {
    const jsonStr = storage.exportAll();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KasirPro_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      const success = storage.importAll(content);
      if (success) {
        setOutlets(storage.getOutlets());
        setActiveOutletId(storage.getActiveOutletId());
        setCategories(storage.getCategories());
        setProducts(storage.getProducts());
        setCustomers(storage.getCustomers());
        setTransactions(storage.getTransactions());
        setSettings(storage.getSettings());
        alert('Data cadangan berhasil dipulihkan!');
      } else {
        alert('Gagal membaca file cadangan. Format JSON tidak sesuai.');
      }
    };
    reader.readAsText(file);
  };

  // Open Low stock filter
  const handleOpenLowStock = () => {
    setStockInitialFilter('low');
    setActiveTab('stock');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 pb-16 lg:pb-0">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        outlets={outlets}
        activeOutlet={activeOutlet}
        onSelectOutlet={handleSelectOutlet}
        products={products}
        onOpenLowStock={handleOpenLowStock}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'cashier' && (
          <CashierView
            products={products}
            categories={categories}
            customers={customers}
            activeOutlet={activeOutlet}
            settings={settings}
            onRecordTransaction={handleRecordTransaction}
            onOpenReceipt={handleOpenReceipt}
            onAddQuickCustomer={handleAddQuickCustomer}
          />
        )}

        {activeTab === 'stock' && (
          <StockView
            products={products}
            categories={categories}
            activeOutlet={activeOutlet}
            outlets={outlets}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onSaveCategory={handleSaveCategory}
            initialFilterStatus={stockInitialFilter}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerView
            customers={customers}
            transactions={transactions}
            settings={settings}
            onSaveCustomer={handleSaveCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onViewReceipt={handleOpenReceipt}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            transactions={transactions}
            outlets={outlets}
            activeOutlet={activeOutlet}
            settings={settings}
            onViewReceipt={handleOpenReceipt}
          />
        )}

        {activeTab === 'outlets' && (
          <OutletView
            outlets={outlets}
            activeOutlet={activeOutlet}
            products={products}
            onSelectOutlet={handleSelectOutlet}
            onSaveOutlet={handleSaveOutlet}
            onDeleteOutlet={handleDeleteOutlet}
            onCopyProducts={handleCopyProducts}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onResetData={handleResetData}
            onExportData={handleExportData}
            onImportData={handleImportData}
          />
        )}
      </main>

      {/* Receipt Modal (Thermal Printing & WhatsApp share) */}
      <ReceiptModal
        transaction={receiptTx}
        settings={settings}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        onNewTransaction={() => {
          setIsReceiptOpen(false);
          setActiveTab('cashier');
        }}
      />

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={0}
      />
    </div>
  );
}
