import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API endpoint for Financial Report Chatbot Analysis
app.post('/api/chat-financial-analysis', async (req, res) => {
  try {
    const { messages, financialSummary, model } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Daftar pesan percakapan (messages) diperlukan.' });
    }

    const selectedModel = model === 'gemini-3.1-flash-lite' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';

    const systemInstruction = `Anda adalah "Asisten Analis Keuangan & Bisnis Senior" untuk aplikasi kasir toko KasirPro.
Peran Anda adalah menganalisis laporan keuangan toko, omset penjualan, estimasi laba kotor, efisiensi modal HPP, perputaran stok, dan tren transaksi pelanggan.

DATA KEUANGAN & PENJUALAN TOKO TERKINI:
---------------------------------------------
- Periode Laporan: ${financialSummary?.period || 'Semua Waktu'}
- Cabang Toko: ${financialSummary?.outlet || 'Semua Cabang'}
- Total Penjualan (Omset Bersih): ${financialSummary?.totalOmset || 'Rp 0'}
- Estimasi Laba Kotor: ${financialSummary?.grossProfit || 'Rp 0'} (Margin: ${financialSummary?.profitMargin || '0%'})
- Total Modal HPP (Harga Pokok Penjualan): ${financialSummary?.totalHPP || 'Rp 0'}
- Jumlah Transaksi / Nota: ${financialSummary?.totalTransactions || 0} transaksi
- Rata-Rata Belanja per Nota (Basket Size): ${financialSummary?.averageBasket || 'Rp 0'}

KOMPOSISI METODE PEMBAYARAN:
${JSON.stringify(financialSummary?.paymentBreakdown || {}, null, 2)}

5 PRODUK TERLARIS (TOP SELLING):
${JSON.stringify(financialSummary?.topProducts || [], null, 2)}

STATUS STOK & RISIKO:
- Jumlah Produk Menipis / Perlu Restock: ${financialSummary?.lowStockCount || 0} item
- Jumlah Transaksi Kasbon / Piutang Belum Lunas: ${financialSummary?.debtCount || 0} nota
---------------------------------------------

PETUNJUK ANALISIS & GAYA KOMUNIKASI:
1. Berikan wawasan bisnis yang tajam, profesional, ramah, dan solutif dalam Bahasa Indonesia.
2. Gunakan format nominal Rupiah yang rapi (contoh: Rp 500.000).
3. Berikan saran strategi praktis yang bisa langsung diterapkan pemilik toko (misal: rekomendasi bundling menu terlaris dengan minuman ber-margin tinggi, strategi optimasi kasir di jam sibuk, saran mitigasi stok menipis, promo diskon loyalitas).
4. Susun respon dengan pemformatan yang mudah dibaca (bullet point, teks tebal, dan paragraf ringkas).
5. Selalu bersikap suportif terhadap perkembangan bisnis toko pengguna.`;

    // Format messages for @google/genai SDK
    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: Array.isArray(m.parts) ? m.parts : [{ text: String(m.content || m.text || '') }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Maaf, saya tidak dapat menghasilkan respon analisis saat ini. Silakan coba lagi.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/chat-financial-analysis:', error);
    return res.status(500).json({ 
      error: error.message || 'Terjadi kesalahan saat memproses analisis laporan keuangan dengan Gemini.' 
    });
  }
});

// Mount Vite middleware in development or serve static in production
const startServer = async () => {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server KasirPro berjalan di http://localhost:${PORT}`);
  });
};

startServer();
