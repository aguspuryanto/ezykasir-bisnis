import React from 'react';
import { Outlet, Product } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  Store, 
  ShoppingCart, 
  Boxes, 
  Users, 
  BarChart3, 
  Building2, 
  Settings, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  outlets: Outlet[];
  activeOutlet: Outlet;
  onSelectOutlet: (outletId: string) => void;
  products: Product[];
  onOpenLowStock: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  outlets,
  activeOutlet,
  onSelectOutlet,
  products,
  onOpenLowStock,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter low stock products for current outlet
  const lowStockCount = products.filter(
    p => p.outletId === activeOutlet.id && p.isActive && p.stock <= p.minStock
  ).length;

  const navItems = [
    { id: 'cashier', label: 'Kasir', icon: ShoppingCart },
    { id: 'stock', label: 'Stok Produk', icon: Boxes },
    { id: 'customers', label: 'Pelanggan', icon: Users },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
    { id: 'outlets', label: 'Cabang Toko', icon: Building2 },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Outlet Switcher */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab('cashier')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition">
                <Store className="w-5 h-5" />
              </div>
              <div className="hidden xs:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">Kasir<span className="text-sky-600">Pro</span></span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-sky-100 text-sky-700 rounded-md">POS</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Sistem Kasir & Stok Multi-Cabang</p>
              </div>
            </div>

            {/* Outlet Switcher Dropdown */}
            <div className="relative ml-2 sm:ml-4" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold transition border border-slate-200"
              >
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span className="max-w-[130px] sm:max-w-[180px] truncate">{activeOutlet.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Pilih Cabang Aktif</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {outlets.map(outlet => (
                      <button
                        key={outlet.id}
                        onClick={() => {
                          onSelectOutlet(outlet.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-start justify-between text-xs transition ${
                          outlet.id === activeOutlet.id
                            ? 'bg-sky-50 text-sky-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="truncate">{outlet.name}</p>
                          <p className="text-[10px] text-slate-400 font-normal truncate">{outlet.address}</p>
                        </div>
                        {outlet.id === activeOutlet.id && (
                          <span className="w-2 h-2 rounded-full bg-sky-600 mt-1 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="px-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setActiveTab('outlets');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-center py-1.5 text-xs text-sky-600 hover:text-sky-700 font-semibold"
                    >
                      + Kelola Cabang Toko
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Low Stock Badge, PWA Install, Profile */}
          <div className="flex items-center gap-2">
            {/* Low stock alert badge */}
            {lowStockCount > 0 && (
              <button
                onClick={onOpenLowStock}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition animate-pulse"
                title={`${lowStockCount} produk stok menipis / habis`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Stok Menipis:</span>
                <span className="bg-amber-500 text-white px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                  {lowStockCount}
                </span>
              </button>
            )}

            {/* PWA Install Button */}
            <PWAInstallButton />
          </div>
        </div>
      </div>
    </header>
  );
};
