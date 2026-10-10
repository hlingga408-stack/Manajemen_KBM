import React from 'react';
import {
  CalendarCheck,
  GraduationCap,
  BookOpenCheck,
  Users,
  Settings,
  School,
  Clock,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { ActiveTab, SchoolProfile } from '../types';
import { getSchoolLogoSvg } from '../utils/logo';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  profile: SchoolProfile;
  totalStudents: number;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  totalStudents,
  onLogout,
}) => {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const navItems = [
    {
      id: 'absensi' as ActiveTab,
      label: 'Absensi Siswa',
      icon: CalendarCheck,
      badge: null,
    },
    {
      id: 'penilaian' as ActiveTab,
      label: 'Penilaian Siswa',
      icon: GraduationCap,
      badge: '40:30:30',
    },
    {
      id: 'agenda' as ActiveTab,
      label: 'Agenda Mengajar',
      icon: BookOpenCheck,
      badge: null,
    },
    {
      id: 'siswa' as ActiveTab,
      label: 'Data Siswa & Kelas',
      icon: Users,
      badge: totalStudents > 0 ? `${totalStudents}` : null,
    },
    {
      id: 'pengaturan' as ActiveTab,
      label: 'Pengaturan & Kop',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shrink-0">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            {profile.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt={`Logo ${profile.namaSekolah}`}
                className="w-11 h-13 sm:w-12 sm:h-14 object-contain flex-shrink-0 drop-shadow-xs"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="w-11 h-13 sm:w-12 sm:h-14 flex-shrink-0 flex items-center justify-center filter drop-shadow-xs transition-transform hover:scale-105"
                title={`Logo Resmi ${profile.namaSekolah}`}
                dangerouslySetInnerHTML={{ __html: getSchoolLogoSvg() }}
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black leading-tight text-slate-900 tracking-tight">
                  {profile.namaSekolah}
                </h1>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-blue-900 text-white rounded">
                  Portal Guru
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                Guru: <strong className="text-slate-800 font-semibold">{profile.guru}</strong> &bull; TA {profile.tahunAjaranAktif} ({profile.semesterAktif}) &bull; {currentDate}
              </p>
            </div>
          </div>

          {/* Quick Info Badges & Logout */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-left hidden sm:block">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Kepala Sekolah</span>
              <span className="text-xs font-semibold text-slate-800">{profile.kepalaSekolah}</span>
            </div>
            <div className="px-2.5 py-1 bg-indigo-50/70 border border-indigo-200 text-indigo-900 rounded text-left hidden sm:block">
              <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-wider block">Mata Pelajaran</span>
              <span className="text-xs font-semibold">Matematika & Tingkat Lanjut</span>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Keluar dari Portal Guru"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 border border-rose-200 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Keluar</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex items-center gap-1 sm:gap-1.5 mt-2.5 pt-2 border-t border-slate-100 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-btn-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isActive
                        ? 'bg-indigo-700 text-indigo-100'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

