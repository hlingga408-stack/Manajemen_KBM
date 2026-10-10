import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { SchoolProfile } from '../types';
import { getSchoolLogoSvg } from '../utils/logo';

interface LoginViewProps {
  profile: SchoolProfile;
  onLoginSuccess: (rememberMe: boolean) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ profile, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setErrorMsg('Silakan masukkan username');
      return;
    }
    if (!cleanPassword) {
      setErrorMsg('Silakan masukkan kata sandi');
      return;
    }

    setIsLoading(true);

    // Simulate authenticating for a smooth responsive feel
    setTimeout(() => {
      if (cleanUsername === 'guru' && cleanPassword === '19882026') {
        setIsLoading(false);
        onLoginSuccess(rememberMe);
      } else {
        setIsLoading(false);
        setErrorMsg('Username atau kata sandi tidak valid. Silakan coba lagi.');
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Header Branding */}
      <div className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full pt-2">
        <div className="flex items-center gap-2.5 text-white/90">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-300 block">
              Sistem Manajemen Akademik
            </span>
            <span className="text-sm font-bold text-slate-100">{profile.namaSekolah}</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Akses Terautentikasi Guru</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md mx-auto my-8">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
          {/* Logo & School Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-3">
              {profile.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt={`Logo ${profile.namaSekolah}`}
                  className="w-16 h-20 object-contain drop-shadow-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="w-16 h-20 flex items-center justify-center drop-shadow-md"
                  title={`Logo ${profile.namaSekolah}`}
                  dangerouslySetInnerHTML={{ __html: getSchoolLogoSvg() }}
                />
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Portal Guru
            </h1>
            <p className="text-xs sm:text-sm font-medium text-indigo-700 mt-0.5">
              {profile.namaSekolah}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              Masuk untuk mengelola Absensi, Penilaian Siswa, dan Agenda Mengajar
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Gagal Masuk:</strong> {errorMsg}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label
                htmlFor="login-username"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Nama Pengguna (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all text-slate-900"
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Kata Sandi (Password)
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 transition-colors"
                />
                <span className="text-xs text-slate-600">Ingat sesi di perangkat ini</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Aplikasi</span>
                </>
              )}
            </button>
          </form>

          {/* Discreet Security Badge */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Portal khusus Guru & Tenaga Pendidik SMA Plus PGRI Cibinong.</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-xs text-slate-400 pb-2">
        <p>
          &copy; {new Date().getFullYear()} {profile.namaSekolah}. Hak Cipta Dilindungi.
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">
          Guru Pengampu: {profile.guru} &bull; Kepala Sekolah: {profile.kepalaSekolah}
        </p>
      </div>
    </div>
  );
};
