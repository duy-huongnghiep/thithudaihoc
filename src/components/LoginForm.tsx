import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Search,
  PenTool,
  ExternalLink,
  AlertCircle,
  Loader2,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { authenticateStudent } from '../services/api';
import { StudentInfo } from '../types';

interface LoginFormProps {
  onLoginSuccess: (student: StudentInfo) => void;
  onSwitchToSearch: () => void;
  onOpenGuide: () => void;
  initialUsername?: string;
  initialPassword?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onSwitchToSearch,
  onOpenGuide,
  initialUsername = '',
  initialPassword = '',
}) => {
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState(initialPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync if initial props change
  React.useEffect(() => {
    if (initialUsername) setUsername(initialUsername);
    if (initialPassword) setPassword(initialPassword);
  }, [initialUsername, initialPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Vui lòng nhập tài khoản hoặc số điện thoại');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Vui lòng nhập mật khẩu');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const student = await authenticateStudent(username, password);
      if (student) {
        onLoginSuccess(student);
      } else {
        setErrorMessage(
          'Tài khoản hoặc mật khẩu không chính xác! Hãy kiểm tra lại hoặc bấm "Tra cứu thông tin" bên dưới.'
        );
      }
    } catch {
      setErrorMessage(
        'Không thể kết nối máy chủ dữ liệu. Vui lòng kiểm tra lại mạng hoặc bấm nút đồng bộ lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login-section" className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Username Field */}
        <div>
          <label
            htmlFor="input-username"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
          >
            Tài Khoản
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="input-username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Nhập số điện thoại/tài khoản..."
              className="w-full pl-11 pr-4 py-3 bg-[#0b0e1a] border border-[#1f2747] focus:border-blue-500 rounded-xl text-white text-sm transition outline-none placeholder:text-slate-600 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="input-password"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
          >
            Mật Khẩu
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="input-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Nhập mật khẩu..."
              className="w-full pl-11 pr-11 py-3 bg-[#0b0e1a] border border-[#1f2747] focus:border-blue-500 rounded-xl text-white text-sm transition outline-none placeholder:text-slate-600 focus:ring-1 focus:ring-blue-500 font-mono"
            />
            <button
              type="button"
              id="btn-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition p-1"
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Error Message Box */}
        {errorMessage && (
          <div
            id="login-error-msg"
            className="flex items-start gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl animate-fadeIn"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          id="btn-login-submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-600/25 active:scale-[0.98] text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang kiểm tra thông tin...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập</span>
            </>
          )}
        </button>
      </form>

      {/* Action Buttons Grid: Guide & Registration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        {/* NEW: Explore Exams Button */}
        <button
          type="button"
          id="btn-open-exam-guide"
          onClick={onOpenGuide}
          className="w-full py-3 bg-gradient-to-r from-indigo-900/40 to-blue-900/40 hover:from-indigo-900/60 hover:to-blue-900/60 text-blue-300 border border-indigo-500/30 font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 group cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition" />
          <span>Tìm hiểu các kỳ thi</span>
          <ChevronRight className="w-3 h-3 text-blue-400/80 group-hover:translate-x-0.5 transition" />
        </button>

        {/* External Registration Link */}
        <a
          id="link-register-form"
          href="https://forms.gle/wMqrZrqWD4RL68Az8"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 group cursor-pointer"
        >
          <PenTool className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition" />
          <span>Đăng ký test năng lực</span>
          <ExternalLink className="w-3 h-3 text-amber-400/80" />
        </a>
      </div>

      {/* Switch to Search Link */}
      <div className="pt-3 border-t border-slate-800/80 text-center">
        <button
          type="button"
          id="btn-switch-to-search"
          onClick={onSwitchToSearch}
          className="text-xs font-semibold text-slate-400 hover:text-blue-400 transition inline-flex items-center gap-1.5 cursor-pointer group"
        >
          <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition" />
          <span>Tra cứu thông tin dự thi tại đây</span>
        </button>
      </div>
    </div>
  );
};

