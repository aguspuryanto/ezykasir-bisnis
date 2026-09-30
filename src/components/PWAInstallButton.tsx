import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidManualGuide, setShowAndroidManualGuide] = useState(false);

  // If already running as an installed standalone PWA, show a sleek "PWA Terinstal" chip or hide
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>PWA Aktif</span>
      </div>
    );
  }

  // Chromium / Android / Desktop direct install prompt
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-700 active:scale-95 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition duration-150"
        title="Pasang Aplikasi KasirPro di Layar Utama HP / Komputer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 px-2.5 py-1.5 text-xs font-medium transition"
          title="Pasang di iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-sky-600" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Pasang di iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs shrink-0">1</span>
                  <p>Buka menu <strong>Share</strong> (ikon kotak berpanah ke atas) di bilah bawah Safari.</p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs shrink-0">2</span>
                  <p>Gulir ke bawah dan ketuk opsi <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.</p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs shrink-0">3</span>
                  <p>Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas. Aplikasi KasirPro siap diakses seperti aplikasi native!</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-sky-600 hover:bg-sky-700 py-2.5 text-sm font-semibold text-white shadow-sm transition"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for Android Chrome when prompt already dismissed or inside iframe
  return (
    <>
      <button
        onClick={() => setShowAndroidManualGuide(true)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-300 hover:border-sky-400 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 px-2.5 py-1.5 text-xs font-medium transition"
        title="Pasang Aplikasi KasirPro"
      >
        <Smartphone className="w-3.5 h-3.5 text-slate-500" />
        <span className="hidden sm:inline">Pasang PWA</span>
        <span className="sm:hidden">Install</span>
      </button>

      {showAndroidManualGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Pasang Aplikasi KasirPro</h3>
              </div>
              <button
                onClick={() => setShowAndroidManualGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Aplikasi ini mendukung mode Progressive Web App (PWA) offline:</p>
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs shrink-0">1</span>
                <p>Klik menu titik tiga <strong>(⋮)</strong> di pojok kanan atas browser Chrome Anda.</p>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs shrink-0">2</span>
                <p>Pilih <strong>"Pasang aplikasi" (Install app)</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</p>
              </div>
            </div>

            <button
              onClick={() => setShowAndroidManualGuide(false)}
              className="mt-5 w-full rounded-xl bg-sky-600 hover:bg-sky-700 py-2.5 text-sm font-semibold text-white shadow-sm transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
