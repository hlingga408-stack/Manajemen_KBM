import React from 'react';
import { SchoolProfile } from '../types';
import { getTodayDateIndo } from '../utils/calculations';

interface TandaTanganFooterProps {
  profile: SchoolProfile;
  customDate?: string;
}

export const TandaTanganFooter: React.FC<TandaTanganFooterProps> = ({
  profile,
  customDate,
}) => {
  const tanggal = customDate || getTodayDateIndo();

  return (
    <div className="w-full mt-8 pt-4 break-inside-avoid">
      <div className="grid grid-cols-2 gap-8 text-slate-800 text-xs sm:text-sm">
        {/* Pojok Kiri Bawah: Kepala Sekolah */}
        <div className="text-left pl-4">
          <p className="font-normal text-slate-700">Mengetahui,</p>
          <p className="font-semibold text-slate-900">Kepala Sekolah,</p>
          <div className="h-16 sm:h-20" />
          <p className="font-bold text-slate-900 underline underline-offset-2">
            {profile.kepalaSekolah}
          </p>
          {profile.nipKepalaSekolah && (
            <p className="text-xs text-slate-600 mt-0.5">
              NIP. {profile.nipKepalaSekolah}
            </p>
          )}
        </div>

        {/* Pojok Kanan Bawah: Guru Pengampu */}
        <div className="text-right pr-4">
          <p className="font-normal text-slate-700">
            Cibinong, {tanggal}
          </p>
          <p className="font-semibold text-slate-900">
            Guru Mata Pelajaran,
          </p>
          <div className="h-16 sm:h-20" />
          <p className="font-bold text-slate-900 underline underline-offset-2">
            {profile.guru}
          </p>
          {profile.nipGuru && (
            <p className="text-xs text-slate-600 mt-0.5">
              NIP. {profile.nipGuru}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
