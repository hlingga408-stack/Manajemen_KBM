import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  Edit3,
  Search,
  Upload,
  Check,
  Plus,
  Sparkles,
  School,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { Student } from '../types';
import { ImportStudentsModal } from './ImportStudentsModal';

interface SiswaManagerViewProps {
  students: Student[];
  classes: string[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onAddClass: (newClass: string) => void;
  onDeleteClass: (className: string) => void;
  onImportStudents: (newStudents: Student[]) => void;
}

export const SiswaManagerView: React.FC<SiswaManagerViewProps> = ({
  students,
  classes,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAddClass,
  onDeleteClass,
  onImportStudents,
}) => {
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showImportModal, setShowImportModal] = useState<boolean>(false);

  // Add/Edit Student Form
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [nisInput, setNisInput] = useState<string>('');
  const [namaInput, setNamaInput] = useState<string>('');
  const [kelasInput, setKelasInput] = useState<string>(classes[0] || 'XI-MIPA-1');
  const [genderInput, setGenderInput] = useState<'L' | 'P'>('L');

  // Add Class Form
  const [newClassName, setNewClassName] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisInput.trim() || !namaInput.trim()) {
      alert('Mohon lengkapi NIS dan Nama Siswa.');
      return;
    }

    if (editingStudentId) {
      const updated: Student = {
        id: editingStudentId,
        nis: nisInput.trim(),
        nama: namaInput.trim(),
        kelas: kelasInput,
        gender: genderInput,
      };
      onUpdateStudent(updated);
      setNotification(`Data siswa ${updated.nama} berhasil diperbarui!`);
      setEditingStudentId(null);
    } else {
      const newStudent: Student = {
        id: `s-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        nis: nisInput.trim(),
        nama: namaInput.trim(),
        kelas: kelasInput,
        gender: genderInput,
      };
      onAddStudent(newStudent);
      setNotification(`Siswa ${newStudent.nama} berhasil ditambahkan!`);
    }

    setNisInput('');
    setNamaInput('');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEditClick = (student: Student) => {
    setEditingStudentId(student.id);
    setNisInput(student.nis);
    setNamaInput(student.nama);
    setKelasInput(student.kelas);
    setGenderInput(student.gender || 'L');
  };

  const handleAddClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    const formatted = newClassName.trim().toUpperCase();
    if (classes.includes(formatted)) {
      alert('Nama kelas sudah ada!');
      return;
    }
    onAddClass(formatted);
    setNewClassName('');
    setNotification(`Kelas ${formatted} berhasil ditambahkan!`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        if (selectedClassFilter !== 'all' && s.kelas !== selectedClassFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return s.nama.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => a.kelas.localeCompare(b.kelas) || a.nama.localeCompare(b.nama));
  }, [students, selectedClassFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Top Notification */}
      {notification && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs font-semibold flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" />
          <span>{notification}</span>
        </div>
      )}

      {/* Grid for Student Form & Class Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Student Form (2 cols on lg) */}
        <div className="lg:col-span-2 bg-white rounded-lg p-3.5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  {editingStudentId ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Input identitas NIS, nama lengkap, kelas, dan jenis kelamin
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowImportModal(true)}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded flex items-center gap-1 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>Impor Excel</span>
            </button>
          </div>

          <form onSubmit={handleStudentSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* NIS */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nomor Induk Siswa (NIS) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nisInput}
                  onChange={(e) => setNisInput(e.target.value)}
                  placeholder="Contoh: 23241019"
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-semibold bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Kelas */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Kelas Siswa <span className="text-red-500">*</span>
                </label>
                <select
                  value={kelasInput}
                  onChange={(e) => setKelasInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {classes.map((c) => (
                    <option key={c} value={c}>
                      Kelas {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Nama Siswa */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nama Lengkap Siswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaInput}
                  onChange={(e) => setNamaInput(e.target.value)}
                  placeholder="Contoh: Muhammad Bintang Pratama"
                  className="w-full px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Jenis Kelamin
                </label>
                <select
                  value={genderInput}
                  onChange={(e) => setGenderInput(e.target.value as 'L' | 'P')}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              {editingStudentId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingStudentId(null);
                    setNisInput('');
                    setNamaInput('');
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-2xs flex items-center gap-1.5 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingStudentId ? 'Simpan Perubahan' : 'Tambahkan Siswa'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Classes Manager Card (1 col) */}
        <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 mb-3">
              <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Kelola Rombel / Kelas</h3>
                <p className="text-[11px] text-slate-500">Daftar kelas aktif</p>
              </div>
            </div>

            {/* List of Classes with student count */}
            <div className="space-y-1.5 mb-3 max-h-44 overflow-y-auto pr-1">
              {classes.map((cls) => {
                const count = students.filter((s) => s.kelas === cls).length;
                return (
                  <div
                    key={cls}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">Kelas {cls}</span>
                      <span className="text-[10px] text-slate-500 block">{count} Peserta Didik</span>
                    </div>

                    {classes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              `Hapus kelas ${cls}? Siswa di kelas ini tetap ada tetapi Anda dapat memindahkannya.`
                            )
                          ) {
                            onDeleteClass(cls);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Hapus Kelas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Class Input Form */}
          <form onSubmit={handleAddClassSubmit} className="pt-2 border-t border-slate-100">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Tambah Kelas Baru
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Contoh: XII-MIPA-2"
                className="w-full px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
              />
              <button
                type="submit"
                className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-2xs flex-shrink-0"
              >
                + Tambah
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Top Bar */}
        <div className="px-3 py-2 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-slate-50/70">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
              Database Siswa ({filteredStudents.length})
            </h3>

            {/* Filter Kelas */}
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">Semua Kelas ({students.length})</option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  Kelas {c} ({students.filter((s) => s.kelas === c).length})
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Cari NIS / Nama Siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-700">
              <tr>
                <th className="px-2 py-2 border-r border-slate-200 w-10 text-center font-bold">No</th>
                <th className="px-2.5 py-2 border-r border-slate-200 w-28 text-center font-bold">NIS</th>
                <th className="px-3 py-2 border-r border-slate-200 font-bold">Nama Lengkap Siswa</th>
                <th className="px-2 py-2 border-r border-slate-200 w-14 text-center font-bold">L/P</th>
                <th className="px-2.5 py-2 border-r border-slate-200 w-28 text-center font-bold">Kelas</th>
                <th className="px-2 py-2 w-20 text-center font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                    Tidak ada data siswa ditemukan.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-2 py-1.5 border-r border-slate-100 text-center font-medium text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="px-2.5 py-1.5 border-r border-slate-100 text-center font-mono font-medium text-slate-600">
                      {s.nis}
                    </td>
                    <td className="px-3 py-1.5 border-r border-slate-100 font-medium text-slate-800">
                      {s.nama}
                    </td>
                    <td className="px-2 py-1.5 border-r border-slate-100 text-center text-slate-500 font-medium">
                      {s.gender || '-'}
                    </td>
                    <td className="px-2.5 py-1.5 border-r border-slate-100 text-center">
                      <span className="font-semibold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-[10px]">
                        {s.kelas}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditClick(s)}
                          className="p-1 text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                          title="Edit Siswa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus data siswa ${s.nama}?`)) {
                              onDeleteStudent(s.id);
                            }
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      <ImportStudentsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        classes={classes}
        currentClass={selectedClassFilter !== 'all' ? selectedClassFilter : classes[0]}
        onImport={(newStudents) => {
          onImportStudents(newStudents);
        }}
      />
    </div>
  );
};
