import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RotateCcw, 
  User, 
  Zap, 
  TrendingUp, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface FinancialSummaryData {
  period: string;
  outlet: string;
  totalOmset: string;
  grossProfit: string;
  profitMargin: string;
  totalHPP: string;
  totalTransactions: number;
  averageBasket: string;
  paymentBreakdown: Record<string, { count: number; total: number }>;
  topProducts: Array<{ name: string; qty: number; revenue: number }>;
  lowStockCount: number;
  debtCount: number;
}

interface FinancialChatbotProps {
  financialData: FinancialSummaryData;
}

const QUICK_PROMPTS = [
  'Berapa margin laba toko saat ini dan apakah sudah ideal?',
  'Produk apa yang paling menghasilkan dan strategi apa untuk meningkatkannya?',
  'Bagaimana evaluasi komposisi metode pembayaran pelanggan?',
  'Berikan 3 rekomendasi strategi promosi atau bundling untuk minggu depan.',
  'Apakah ada risiko stok atau kasbon yang perlu diantisipasi?',
];

export const FinancialChatbot: React.FC<FinancialChatbotProps> = ({ financialData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      text: `Halo! Saya **Asisten Analis Keuangan & Bisnis KasirPro** yang didukung oleh **Google Gemini AI**. 

Saya telah memuat data laporan keuangan Anda untuk periode **${financialData.period}** di **${financialData.outlet}**:
- **Total Omset Penjualan:** ${financialData.totalOmset}
- **Estimasi Laba Kotor:** ${financialData.grossProfit} (Margin: ${financialData.profitMargin})
- **Total Transaksi:** ${financialData.totalTransactions} nota (Rata-rata: ${financialData.averageBasket})

Ada hal spesifik yang ingin Anda tanyakan atau analisis mengenai profitabilitas, produk terlaris, atau strategi peningkatan penjualan toko Anda?`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isExpanded) {
      scrollToBottom();
    }
  }, [messages, isExpanded]);

  // Keep welcome message synced if user changes period or outlet before chatting
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id.startsWith('welcome-')) {
        return [
          {
            id: 'welcome-msg',
            role: 'model',
            text: `Halo! Saya **Asisten Analis Keuangan & Bisnis KasirPro** yang didukung oleh **Google Gemini AI**. 

Saya telah memuat data laporan keuangan Anda untuk periode **${financialData.period}** di **${financialData.outlet}**:
- **Total Omset Penjualan:** ${financialData.totalOmset}
- **Estimasi Laba Kotor:** ${financialData.grossProfit} (Margin: ${financialData.profitMargin})
- **Total Transaksi:** ${financialData.totalTransactions} nota (Rata-rata: ${financialData.averageBasket})

Ada hal spesifik yang ingin Anda tanyakan atau analisis mengenai profitabilitas, produk terlaris, atau strategi peningkatan penjualan toko Anda?`,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      }
      return prev;
    });
  }, [financialData.period, financialData.outlet, financialData.totalOmset, financialData.grossProfit, financialData.totalTransactions]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare payload for backend API
      const apiMessages = newMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const res = await fetch('/api/chat-financial-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          financialSummary: financialData,
          model: selectedModel,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${res.status})`);
      }

      const data = await res.json();
      const modelReply: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply || 'Tidak ada respon yang diterima dari model.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, modelReply]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `⚠️ Maaf, terjadi kendala saat menghubungkan ke Gemini AI: *${err.message || 'Gagal menganalisis'}*. Pastikan koneksi internet stabil dan kunci API telah dikonfigurasi di panel Secrets.`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: `Percakapan telah direset. Data keuangan terbaru (${financialData.period} - ${financialData.outlet}) siap untuk dianalisis kembali. Silakan ajukan pertanyaan baru Anda!`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to render markdown-like simple text formatting
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      // Bold formatting replace
      let formattedLine: React.ReactNode = line;
      if (line.includes('**')) {
        const parts = line.split('**');
        formattedLine = parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-bold text-slate-900">{part}</strong> : part));
      }

      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
            <div className="flex-1">{typeof formattedLine === 'string' ? formattedLine.replace(/^[-*]\s*/, '') : formattedLine}</div>
          </div>
        );
      }

      // Numbered items
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="font-bold text-sky-700 text-xs shrink-0">{line.trim().match(/^\d+\./)?.[0]}</span>
            <div className="flex-1">{typeof formattedLine === 'string' ? formattedLine.replace(/^\d+\.\s*/, '') : formattedLine}</div>
          </div>
        );
      }

      // Empty line / paragraph gap
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return <p key={idx} className="leading-relaxed">{formattedLine}</p>;
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden no-print transition-all">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-sky-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-white">Analis Keuangan AI (Gemini)</h3>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-semibold border border-sky-400/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                Live Analysis
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Analisis cerdas data omset, margin laba, dan rekomendasi bisnis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Model Selector Dropdown */}
          <div className="hidden sm:flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-xl text-xs border border-white/10">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value as any)}
              className="bg-transparent text-white text-xs font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="gemini-3.8-flash" className="bg-slate-900 text-white">
                gemini-3.8-flash (Rekomendasi / Akurat)
              </option>
              <option value="gemini-3.1-flash-lite" className="bg-slate-900 text-white">
                gemini-3.1-flash-lite (Cepat)
              </option>
            </select>
          </div>

          {/* Reset button */}
          <button
            onClick={handleResetChat}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition"
            title="Reset Percakapan"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Expand / Collapse toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition"
            title={isExpanded ? 'Tutup Chat' : 'Buka Chat'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col h-[520px]">
          {/* Scrollable Conversation Thread */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/60">
            {messages.map(msg => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[88%] sm:max-w-[80%] ${
                    isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs shadow-xs ${
                      isUser
                        ? 'bg-sky-600 text-white font-bold'
                        : 'bg-gradient-to-tr from-sky-600 to-indigo-600 text-white'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-1">
                    <div
                      className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs relative group ${
                        isUser
                          ? 'bg-sky-600 text-white rounded-tr-xs'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                      }`}
                    >
                      {renderFormattedText(msg.text)}

                      {/* Copy action for model messages */}
                      {!isUser && (
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 bg-white/80 rounded transition"
                          title="Salin Pesan"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    <span
                      className={`text-[10px] text-slate-400 block px-1 ${
                        isUser ? 'text-right' : 'text-left'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Thinking / Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 mr-auto max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl rounded-tl-xs text-xs text-slate-600 flex items-center gap-2 shadow-xs">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600"></span>
                  </span>
                  <span>Gemini sedang menganalisis data keuangan toko...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Saran:
            </span>
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 border border-slate-200/80 whitespace-nowrap transition active:scale-95 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Tanyakan analisis keuangan (misal: strategi dongkrak laba, bundling menu)..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className={`p-2.5 sm:px-4 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white shadow-sm flex items-center gap-2 transition ${
                !inputText.trim() || isLoading
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-sky-600 hover:bg-sky-700 active:scale-95'
              }`}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
