import React from 'react';
import { SchoolProfile } from '../types';
import { getSchoolLogoSvg } from '../utils/logo';

interface KopSuratProps {
  profile: SchoolProfile;
  judulDokumen: string;
  subJudul?: string;
}

export const KopSurat: React.FC<KopSuratProps> = ({ profile, judulDokumen, subJudul }) => {
  return (
    <div className="w-full font-sans border-b-2 border-slate-900 pb-3 mb-4">
      <div className="flex items-center gap-4">
        {/* Logo Sekolah di Kiri Atas */}
        {profile.logoUrl ? (
          <img
            src={profile.logoUrl}
            alt={`Logo ${profile.namaSekolah}`}
            className="w-20 h-24 object-contain flex-shrink-0"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div 
            className="w-20 h-24 flex-shrink-0 flex items-center justify-center"
            title={`Logo Resmi ${profile.namaSekolah}`}
            dangerouslySetInnerHTML={{ __html: getSchoolLogoSvg() }}
          />
        )}

        {/* Identitas Kop Surat */}
        <div className="flex-1 text-center pr-8 sm:pr-12">
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-slate-800 uppercase">
            {profile.yayasan}
          </p>
          <h1 className="text-lg sm:text-2xl font-black text-blue-900 tracking-tight uppercase mt-0.5">
            {profile.namaSekolah}
          </h1>
          <p className="text-xs text-slate-600 font-normal mt-0.5">
            {profile.alamat}
          </p>
          <p className="text-[11px] text-slate-500 italic mt-0.5">
            Akreditasi &ldquo;A&rdquo; (Unggul) &bull; NPSN: 20231940 &bull; Website: smapluspgricibinong.sch.id &bull; Email: smapluspgricibinong@gmail.com
          </p>
        </div>
      </div>

      {/* Garis Ganda Kop Surat */}
      <div className="mt-3">
        <div className="h-[2.5px] bg-slate-900 w-full" />
        <div className="h-[1px] bg-slate-700 w-full mt-[1.5px]" />
      </div>

      {/* Judul Dokumen */}
      <div className="text-center mt-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wide">
          {judulDokumen}
        </h2>
        {subJudul && (
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
            {subJudul}
          </p>
        )}
      </div>
    </div>
  );
};
