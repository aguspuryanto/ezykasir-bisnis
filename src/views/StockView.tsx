import React, { useState, useMemo } from 'react';
import { Product, Category, Outlet } from '../types';
import { formatRupiah } from '../utils/storage';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Package, 
  Layers, 
  ArrowUpDown, 
  X, 
  Check, 
  RefreshCw,
  FolderPlus
} from 'lucide-react';

interface StockViewProps {
  products: Product[];
  categories: Category[];
  activeOutlet: Outlet;
  outlets: Outlet[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onSaveCategory: (category: Category) => void;
  initialFilterStatus?: 'all' | 'low' | 'out';
}

export const StockView: React.FC<StockViewProps> = ({
  products,
  categories,
  activeOutlet,
  outlets,
  onSaveProduct,
  onDeleteProduct,
  onSaveCategory,
  initialFilterStatus = 'all',
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'available' | 'low' | 'out'>(initialFilterStatus);

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Quick Restock modal
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState<string>('10');

  // Category management modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Form states for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: '',
    costPrice: '',
    sellingPrice: '',
    stock: '',
    minStock: '5',
    unit: 'pcs',
    image: '',
    description: '',
  });

  // Current outlet products
  const outletProducts = useMemo(() => {
    return products.filter(p => p.outletId === activeOutlet.id);
  }, [products, activeOutlet.id]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return outletProducts.filter(p => {
      const matchCat = selectedCat === 'all' || p.category === selectedCat;
      const query = search.toLowerCase().trim();
      const matchSearch = !query || 
        p.name.toLowerCase().includes(query) || 
        p.sku.toLowerCase().includes(query) ||
        (p.barcode && p.barcode.toLowerCase().includes(query));

      let matchStatus = true;
      if (stockStatusFilter === 'out') {
        matchStatus = p.stock <= 0;
      } else if (stockStatusFilter === 'low') {
        matchStatus = p.stock > 0 && p.stock <= p.minStock;
      } else if (stockStatusFilter === 'available') {
        matchStatus = p.stock > p.minStock;
      }

      return matchCat && matchSearch && matchStatus;
    });
  }, [outletProducts, selectedCat, search, stockStatusFilter]);

  // Summary counts
  const totalItemsCount = outletProducts.length;
  const outOfStockCount = outletProducts.filter(p => p.stock <= 0).length;
  const lowStockCount = outletProducts.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const totalStockValue = outletProducts.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);
  const totalCostValue = outletProducts.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      barcode: `899${Math.floor(1000000 + Math.random() * 9000000)}`,
      category: categories[0]?.name || 'Umum',
      costPrice: '',
      sellingPrice: '',
      stock: '20',
      minStock: '5',
      unit: 'pcs',
      image: '',
      description: '',
    });
    setIsAddEditOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || '',
      category: product.category,
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      unit: product.unit,
      image: product.image || '',
      description: product.description || '',
    });
    setIsAddEditOpen(true);
  };

  // Submit Add / Edit
  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const cost = parseFloat(formData.costPrice) || 0;
    const price = parseFloat(formData.sellingPrice) || 0;
    const stockVal = parseInt(formData.stock) || 0;
    const minStockVal = parseInt(formData.minStock) || 0;

    const productToSave: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      outletId: activeOutlet.id,
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      barcode: formData.barcode.trim(),
      category: formData.category,
      costPrice: cost,
      sellingPrice: price,
      stock: stockVal,
      minStock: minStockVal,
      unit: formData.unit || 'pcs',
      image: formData.image.trim(),
      description: formData.description.trim(),
      isActive: true,
      updatedAt: new Date().toISOString(),
    };

    onSaveProduct(productToSave);
    setIsAddEditOpen(false);
  };

  // Quick Restock submit
  const handleQuickRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;
    const addQty = parseInt(restockAmount) || 0;
    if (addQty <= 0) return;

    const updated: Product = {
      ...restockProduct,
      stock: restockProduct.stock + addQty,
      updatedAt: new Date().toISOString(),
    };

    onSaveProduct(updated);
    setRestockProduct(null);
  };

  // Add category submit
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
    };
    onSaveCategory(newCat);
    setNewCatName('');
  };

  // Calculate profit margin for modal
  const modalMargin = useMemo(() => {
    const cost = parseFloat(formData.costPrice) || 0;
    const price = parseFloat(formData.sellingPrice) || 0;
    if (price <= 0) return 0;
    return Math.round(((price - cost) / price) * 100);
  }, [formData.costPrice, formData.sellingPrice]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Manajemen Stok & Produk</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daftar inventaris untuk <strong>{activeOutlet.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <FolderPlus className="w-3.5 h-3.5 text-sky-600" />
            <span>Kategori</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-sky-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Produk</span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">{totalItemsCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Item aktif di cabang</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Stok Menipis</span>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1">{lowStockCount}</p>
          <button
            onClick={() => setStockStatusFilter('low')}
            className="text-[11px] text-amber-700 hover:underline font-medium mt-1 inline-block"
          >
            Lihat daftar &rarr;
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Stok Habis</span>
          <p className="text-xl sm:text-2xl font-extrabold text-rose-600 mt-1">{outOfStockCount}</p>
          <button
            onClick={() => setStockStatusFilter('out')}
            className="text-[11px] text-rose-700 hover:underline font-medium mt-1 inline-block"
          >
            Perlu restock &rarr;
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Estimasi Nilai Jual</span>
          <p className="text-lg sm:text-xl font-extrabold text-sky-700 mt-1">{formatRupiah(totalStockValue)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Modal HPP: {formatRupiah(totalCostValue)}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama barang, SKU, atau barcode..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
            className="w-full sm:w-48 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'available', label: 'Aman' },
              { id: 'low', label: 'Menipis' },
              { id: 'out', label: 'Habis' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStockStatusFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                  stockStatusFilter === f.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
                <th className="py-3 px-4">Produk</th>
                <th className="py-3 px-4">Kategori / SKU</th>
                <th className="py-3 px-4 text-right">Harga Modal (HPP)</th>
                <th className="py-3 px-4 text-right">Harga Jual</th>
                <th className="py-3 px-4 text-center">Status Stok</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada produk ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Sesuaikan kata kunci pencarian atau tambah produk baru.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock = product.stock > 0 && product.stock <= product.minStock;
                  const marginPct = product.sellingPrice > 0 
                    ? Math.round(((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100) 
                    : 0;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/70 transition">
                      {/* Name & Photo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{product.name}</span>
                            {product.barcode && (
                              <span className="text-[11px] text-slate-400 font-mono">Barcode: {product.barcode}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category & SKU */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 inline-block mb-1">
                          {product.category}
                        </span>
                        <p className="text-[11px] font-mono text-slate-500">{product.sku}</p>
                      </td>

                      {/* Cost Price */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                        {formatRupiah(product.costPrice)}
                      </td>

                      {/* Selling Price & Margin */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold font-mono text-slate-900 block">{formatRupiah(product.sellingPrice)}</span>
                        <span className={`text-[10px] font-semibold ${marginPct >= 30 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          Margin: {marginPct}%
                        </span>
                      </td>

                      {/* Stock Status & Quick Restock */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {isOutOfStock ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                              Habis (0 {product.unit})
                            </span>
                          ) : isLowStock ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                              Menipis: {product.stock} {product.unit}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              {product.stock} {product.unit}
                            </span>
                          )}

                          <button
                            onClick={() => {
                              setRestockProduct(product);
                              setRestockAmount('10');
                            }}
                            className="text-[11px] text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            <span>+ Restock</span>
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                            title="Edit Produk"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(product.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Produk"
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

      {/* MODAL 1: Tambah / Edit Produk */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-5 overflow-y-auto backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base sm:text-lg">
                  {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
                </h3>
                <p className="text-xs text-slate-400">Cabang: {activeOutlet.name}</p>
              </div>
              <button onClick={() => setIsAddEditOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Es Kopi Susu Aren"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 font-semibold"
                />
              </div>

              {/* SKU & Barcode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kode SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="KOP-001"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Barcode (Opsional)</label>
                  <input
                    type="text"
                    placeholder="8991001001"
                    value={formData.barcode}
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Satuan</label>
                  <input
                    type="text"
                    placeholder="pcs / cup / porsi / botol"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Pricing (HPP & Jual) + Margin Indicator */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Harga Modal (HPP)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">Rp</span>
                      <input
                        type="number"
                        placeholder="8000"
                        value={formData.costPrice}
                        onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Harga Jual *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">Rp</span>
                      <input
                        type="number"
                        required
                        placeholder="22000"
                        value={formData.sellingPrice}
                        onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/80">
                  <span className="text-slate-500">Estimasi Margin Laba:</span>
                  <span className={`font-bold ${modalMargin >= 25 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {modalMargin}% ({formatRupiah((parseFloat(formData.sellingPrice) || 0) - (parseFloat(formData.costPrice) || 0))} per {formData.unit || 'item'})
                  </span>
                </div>
              </div>

              {/* Stock & Min Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stok Awal Saat Ini</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Minimal Stok (Alert)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={e => setFormData({ ...formData, minStock: e.target.value })}
                    className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL Gambar Produk (Opsional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan bahan / resep / detail produk..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Form Footer */}
              <div className="pt-3 flex gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md"
                >
                  {editingProduct ? 'Perbarui Produk' : 'Simpan Produk Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Quick Restock */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">Tambah Stok (Restock)</h4>
              <button onClick={() => setRestockProduct(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickRestockSubmit} className="mt-4 space-y-4">
              <div>
                <span className="text-xs text-slate-500">Nama Produk:</span>
                <p className="font-bold text-slate-800 text-sm">{restockProduct.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Stok saat ini: <strong>{restockProduct.stock} {restockProduct.unit}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Tambahan Masuk</label>
                <div className="flex items-center gap-2 mb-2">
                  {[5, 10, 25, 50].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRestockAmount(val.toString())}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 border border-slate-200"
                    >
                      +{val}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockAmount}
                  onChange={e => setRestockAmount(e.target.value)}
                  className="w-full text-base font-bold font-mono px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="p-2.5 bg-sky-50 rounded-xl text-xs text-sky-800">
                Stok setelah restock: <strong>{restockProduct.stock + (parseInt(restockAmount) || 0)} {restockProduct.unit}</strong>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRestockProduct(null)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm"
                >
                  Simpan Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Category Management */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">Kelola Kategori Produk</h4>
              <button onClick={() => setIsCatModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Nama kategori baru..."
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shrink-0"
                >
                  + Tambah
                </button>
              </form>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {categories.map(cat => {
                  const count = products.filter(p => p.category === cat.name).length;
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      <span className="font-semibold text-slate-800">{cat.name}</span>
                      <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {count} item
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Hapus Produk Ini?</h4>
            <p className="text-xs text-slate-500 mt-1">
              Produk yang dihapus tidak dapat dikembalikan. Data riwayat transaksi sebelumnya tetap tercatat.
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
                  onDeleteProduct(deleteConfirmId);
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
