import React, { useState } from 'react';
import {
  Settings,
  Building,
  UserCheck,
  Award,
  Save,
  RotateCcw,
  Check,
  Download,
  Upload,
  ShieldCheck,
} from 'lucide-react';
import { SchoolProfile } from '../types';
import { KopSurat } from './KopSurat';
import { TandaTanganFooter } from './TandaTanganFooter';
import { resetToDefaults } from '../utils/storage';

interface SettingsViewProps {
  profile: SchoolProfile;
  onUpdateProfile: (newProfile: SchoolProfile) => void;
  onResetAllData: () => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onResetAllData,
  onExportBackup,
  onImportBackup,
}) => {
  const [formData, setFormData] = useState<SchoolProfile>({ ...profile });
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 mb-4">
          <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Pengaturan Profil Satuan Pendidikan, Kop Surat & Tanda Tangan
            </h2>
            <p className="text-[11px] text-slate-500">
              Konfigurasi data resmi untuk seluruh dokumen cetak dan ekspor PDF/Excel
            </p>
          </div>
        </div>

        {savedNotice && (
          <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs font-semibold flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>Pengaturan profil dan identitas kop berhasil diperbarui!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Data Lembaga & Sekolah */}
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-indigo-600" />
              1. Identitas Lembaga & Sekolah
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nama Yayasan / Lembaga Penyelenggara
                </label>
                <input
                  type="text"
                  required
                  value={formData.yayasan}
                  onChange={(e) => setFormData({ ...formData, yayasan: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nama Satuan Pendidikan
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaSekolah}
                  onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-indigo-950"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Kota / Kabupaten
                </label>
                <input
                  type="text"
                  required
                  value={formData.kota}
                  onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Alamat Lengkap, Telepon / Fax
                </label>
                <input
                  type="text"
                  required
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Penandatangan Resmi (Kepala Sekolah & Guru) */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              2. Pengesahan & Penandatangan Resmi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* Pojok Kiri: Kepala Sekolah */}
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                  Penandatangan Kiri Bawah: Kepala Sekolah
                </span>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                      Nama Lengkap & Gelar Kepala Sekolah
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.kepalaSekolah}
                      onChange={(e) =>
                        setFormData({ ...formData, kepalaSekolah: e.target.value })
                      }
                      className="w-full px-2.5 py-1 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                      NIP Kepala Sekolah (Opsional)
                    </label>
                    <input
                      type="text"
                      value={formData.nipKepalaSekolah || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, nipKepalaSekolah: e.target.value })
                      }
                      placeholder="Contoh: 19740512 199903 1 002"
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Pojok Kanan: Guru Pengampu */}
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                  Penandatangan Kanan Bawah: Guru Mata Pelajaran
                </span>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                      Nama Lengkap & Gelar Guru Pengampu
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.guru}
                      onChange={(e) => setFormData({ ...formData, guru: e.target.value })}
                      className="w-full px-2.5 py-1 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                      NIP Guru (Opsional)
                    </label>
                    <input
                      type="text"
                      value={formData.nipGuru || ''}
                      onChange={(e) => setFormData({ ...formData, nipGuru: e.target.value })}
                      placeholder="Contoh: 19880115 201504 1 003"
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Periode Akademik Aktif */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              3. Periode Akademik Aktif
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tahun Ajaran Aktif
                </label>
                <input
                  type="text"
                  required
                  value={formData.tahunAjaranAktif}
                  onChange={(e) =>
                    setFormData({ ...formData, tahunAjaranAktif: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Semester Aktif
                </label>
                <select
                  value={formData.semesterAktif}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      semesterAktif: e.target.value as 'Ganjil' | 'Genap',
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded shadow-2xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>

      {/* Live Pratinjau Kop & Tanda Tangan */}
      <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          Pratinjau Langsung Kop Surat & Tanda Tangan Resmi
        </h3>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded max-w-3xl mx-auto">
          <KopSurat
            profile={formData}
            judulDokumen="DOKUMEN ADMINISTRASI GURU"
            subJudul="Pratinjau format cetak dan ekspor dokumen resmi"
          />
          <div className="h-12 flex items-center justify-center text-xs text-slate-400 italic border border-dashed border-slate-200 my-3 rounded">
            [ Area Isi Dokumen: Presensi / Penilaian / Agenda Mengajar ]
          </div>
          <TandaTanganFooter profile={formData} />
        </div>
      </div>

      {/* Database Backup & Reset Operations */}
      <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Pemeliharaan & Cadangan Data (Backup / Restore)
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Seluruh data tersimpan secara otomatis di peramban (browser) Anda. Anda dapat mengunduh salinan berkas JSON untuk cadangan atau memulihkan data.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExportBackup}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Unduh Cadangan Data (JSON)</span>
          </button>

          <label className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs">
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pulihkan Cadangan (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={onImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (
                confirm(
                  'Perhatian: Tindakan ini akan mengembalikan seluruh data ke data sampel bawaan. Apakah Anda yakin?'
                )
              ) {
                onResetAllData();
              }
            }}
            className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded flex items-center gap-1.5 transition-colors ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Data Sampel Bawaan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
