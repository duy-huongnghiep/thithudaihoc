import React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';

interface HeaderProps {
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  lastUpdated?: Date | null;
}

export const Header: React.FC<HeaderProps> = ({
  onRefreshData,
  isRefreshing = false,
}) => {
  return (
    <header id="app-header" className="text-center mb-6 relative">
      {onRefreshData && (
        <button
          type="button"
          id="btn-refresh-cache"
          onClick={onRefreshData}
          disabled={isRefreshing}
          title="Làm mới dữ liệu từ Google Sheets"
          className="absolute right-0 top-0 text-slate-500 hover:text-blue-400 transition p-1.5 rounded-lg hover:bg-slate-800/60 text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          <span className="sr-only">Làm mới dữ liệu</span>
        </button>
      )}

      {/* Monogram Logo */}
      <div
        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl tracking-wider shadow-lg shadow-blue-500/25 border border-blue-400/20 relative"
      >
        <span className="relative z-10 font-bold">TD</span>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide uppercase flex items-center justify-center gap-2">
          <span>THI THỬ CÁC KỲ THI</span>
        </h1>
        <p className="text-slate-400 text-xs flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Cổng thông tin & thi đánh giá năng lực</span>
        </p>
      </div>
    </header>
  );
};

