import React, { useState, useMemo } from 'react';
import {
  BookOpenCheck,
  Plus,
  FileDown,
  FileSpreadsheet,
  Printer,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  Check,
  Search,
  Filter,
  Layers,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { TeachingAgenda, SchoolProfile } from '../types';
import {
  DEFAULT_CLASSES,
  DEFAULT_SUBJECTS,
  DEFAULT_LEARNING_MODELS,
} from '../data/initialData';
import { formatDateIndo } from '../utils/calculations';
import { exportAgendaToExcel } from '../utils/excelExport';
import { exportAgendaToPDF } from '../utils/pdfExport';
import { PrintPreviewModal } from './PrintPreviewModal';

interface AgendaMengajarViewProps {
  agendaList: TeachingAgenda[];
  classes: string[];
  profile: SchoolProfile;
  onSaveAgenda: (newAgenda: TeachingAgenda) => void;
  onUpdateAgenda: (updatedAgenda: TeachingAgenda) => void;
  onDeleteAgenda: (id: string) => void;
}

export const AgendaMengajarView: React.FC<AgendaMengajarViewProps> = ({
  agendaList,
  classes,
  profile,
  onSaveAgenda,
  onUpdateAgenda,
  onDeleteAgenda,
}) => {
  // Form State for inputting daily teaching agenda
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formJamKe, setFormJamKe] = useState<string>('1 - 3 (07:15 - 09:30)');
  const [formClass, setFormClass] = useState<string>(classes[0] || 'XI-MIPA-1');
  const [formSubject, setFormSubject] = useState<string>('Matematika');
  const [formMateri, setFormMateri] = useState<string>('');
  const [formModel, setFormModel] = useState<string>(DEFAULT_LEARNING_MODELS[0]);
  const [formCatatan, setFormCatatan] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter and search
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Notifications
  const [showPrintPreview, setShowPrintPreview] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const resetForm = () => {
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormJamKe('1 - 3 (07:15 - 09:30)');
    setFormClass(classes[0] || 'XI-MIPA-1');
    setFormSubject('Matematika');
    setFormMateri('');
    setFormModel(DEFAULT_LEARNING_MODELS[0]);
    setFormCatatan('');
    setEditingId(null);
  };

  const handleEditClick = (agenda: TeachingAgenda) => {
    setEditingId(agenda.id);
    setFormDate(agenda.tanggal);
    setFormJamKe(agenda.jamKe);
    setFormClass(agenda.kelas);
    setFormSubject(agenda.mataPelajaran);
    setFormMateri(agenda.materi);
    setFormModel(agenda.modelPembelajaran);
    setFormCatatan(agenda.catatan);

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMateri.trim()) {
      alert('Mohon masukkan judul materi / topik pelajaran.');
      return;
    }

    if (editingId) {
      const updated: TeachingAgenda = {
        id: editingId,
        tanggal: formDate,
        jamKe: formJamKe,
        kelas: formClass,
        mataPelajaran: formSubject,
        materi: formMateri,
        modelPembelajaran: formModel,
        catatan: formCatatan,
        createdAt: Date.now(),
      };
      onUpdateAgenda(updated);
      setNotification('Agenda mengajar berhasil diperbarui!');
    } else {
      const newItem: TeachingAgenda = {
        id: `ag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        tanggal: formDate,
        jamKe: formJamKe,
        kelas: formClass,
        mataPelajaran: formSubject,
        materi: formMateri,
        modelPembelajaran: formModel,
        catatan: formCatatan,
        createdAt: Date.now(),
      };
      onSaveAgenda(newItem);
      setNotification('Agenda mengajar hari ini berhasil disimpan!');
    }

    resetForm();
    setTimeout(() => setNotification(null), 3000);
  };

  // Filtered agenda list
  const filteredList = useMemo(() => {
    return agendaList
      .filter((item) => {
        if (filterClass !== 'all' && item.kelas !== filterClass) return false;
        if (filterSubject !== 'all' && item.mataPelajaran !== filterSubject) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchMateri = item.materi.toLowerCase().includes(q);
          const matchCatatan = item.catatan.toLowerCase().includes(q);
          const matchModel = item.modelPembelajaran.toLowerCase().includes(q);
          if (!matchMateri && !matchCatatan && !matchModel) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [agendaList, filterClass, filterSubject, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Input Form Card for Daily Teaching Agenda */}
      <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded">
              <BookOpenCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                {editingId ? 'Edit Jurnal & Agenda Mengajar' : 'Input Agenda Mengajar Hari Ini'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Catat topik pelajaran, model pembelajaran, dan refleksi harian kelas
              </p>
            </div>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2.5 py-1 rounded transition-colors"
            >
              Batalkan Edit
            </button>
          )}
        </div>

        {notification && (
          <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs font-semibold flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>{notification}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Row 1: Date, Jam Ke, Kelas, Mata Pelajaran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Tanggal */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Hari / Tanggal KBM
              </label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Jam Ke- */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Jam Pelajaran Ke-
              </label>
              <input
                type="text"
                required
                value={formJamKe}
                onChange={(e) => setFormJamKe(e.target.value)}
                placeholder="Contoh: 1 - 3 (07:15 - 09:30)"
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Kelas */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Kelas
              </label>
              <select
                value={formClass}
                onChange={(e) => setFormClass(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {classes.map((c) => (
                  <option key={c} value={c}>
                    Kelas {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Mata Pelajaran */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Mata Pelajaran
              </label>
              <select
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {DEFAULT_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Judul Materi / Topik & Model Pembelajaran */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {/* Judul Materi / Topik Pelajaran */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Judul Materi / Topik Pelajaran <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formMateri}
                onChange={(e) => setFormMateri(e.target.value)}
                placeholder="Contoh: Polinomial: Teorema Sisa dan Teorema Faktor"
                className="w-full px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Model Pembelajaran */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Model Pembelajaran <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {DEFAULT_LEARNING_MODELS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                  <option value="Model Lainnya / Fleksibel">Model Lainnya / Fleksibel</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 3: Catatan / Refleksi Mengajar */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Catatan / Refleksi Pembelajaran Hari Ini
            </label>
            <textarea
              rows={2}
              value={formCatatan}
              onChange={(e) => setFormCatatan(e.target.value)}
              placeholder="Tuliskan catatan pelaksanaan KBM, respon siswa, tindak lanjut..."
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingId ? 'Simpan Perubahan' : 'Simpan Agenda'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* History and List Section */}
      <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
        {/* Filter and Export Bar */}
        <div className="px-3 py-2 border-b border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-2.5 bg-slate-50/70">
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
              Riwayat Jurnal Mengajar ({filteredList.length})
            </h3>

            {/* Filter Kelas */}
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  Kelas {c}
                </option>
              ))}
            </select>

            {/* Filter Mapel */}
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">Semua Mapel</option>
              {DEFAULT_SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto justify-end">
            {/* Search */}
            <div className="relative w-full sm:w-52">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Cari materi / catatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Export buttons */}
            <button
              onClick={() =>
                exportAgendaToPDF(
                  filteredList,
                  profile,
                  filterClass !== 'all' ? filterClass : undefined,
                  filterSubject !== 'all' ? filterSubject : undefined
                )
              }
              className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-medium hover:bg-slate-50 flex items-center gap-1 text-slate-700 transition-colors"
              title="Download PDF Langsung"
            >
              <span className="w-2 h-2 bg-red-100 border border-red-400 rounded-xs" />
              <span>PDF</span>
            </button>

            <button
              onClick={() =>
                exportAgendaToExcel(
                  filteredList,
                  profile,
                  filterClass !== 'all' ? filterClass : undefined,
                  filterSubject !== 'all' ? filterSubject : undefined
                )
              }
              className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-medium hover:bg-slate-50 flex items-center gap-1 text-slate-700 transition-colors"
              title="Download MS Excel (.xlsx)"
            >
              <span className="w-2 h-2 bg-green-100 border border-green-400 rounded-xs" />
              <span>Excel</span>
            </button>

            <button
              onClick={() => setShowPrintPreview(true)}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-2xs flex items-center gap-1 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Table of Past Teaching Agendas */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-700">
              <tr>
                <th className="px-2 py-2 border-r border-slate-200 w-8 text-center font-bold">No</th>
                <th className="px-2.5 py-2 border-r border-slate-200 w-28 font-bold">Hari / Tanggal</th>
                <th className="px-2 py-2 border-r border-slate-200 w-24 text-center font-bold">Jam & Kelas</th>
                <th className="px-2.5 py-2 border-r border-slate-200 w-28 font-bold">Mapel</th>
                <th className="px-3 py-2 border-r border-slate-200 min-w-[180px] font-bold">Judul Materi / Topik</th>
                <th className="px-2.5 py-2 border-r border-slate-200 min-w-[140px] font-bold">Model Pembelajaran</th>
                <th className="px-3 py-2 border-r border-slate-200 min-w-[180px] font-bold">Catatan / Refleksi</th>
                <th className="px-2 py-2 w-16 text-center font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500 text-xs">
                    Belum ada agenda mengajar yang tercatat. Silakan input agenda pada form di atas.
                  </td>
                </tr>
              ) : (
                filteredList.map((ag, idx) => (
                  <tr key={ag.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-2 py-1.5 border-r border-slate-100 text-center font-medium text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="px-2.5 py-1.5 border-r border-slate-100 font-medium text-slate-800 whitespace-nowrap">
                      {formatDateIndo(ag.tanggal)}
                    </td>
                    <td className="px-2 py-1.5 border-r border-slate-100 text-center whitespace-nowrap">
                      <span className="font-semibold text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 text-[10px]">
                        {ag.kelas}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">{ag.jamKe}</span>
                    </td>
                    <td className="px-2.5 py-1.5 border-r border-slate-100 font-medium text-slate-700 whitespace-nowrap">
                      {ag.mataPelajaran}
                    </td>
                    <td className="px-3 py-1.5 border-r border-slate-100 font-semibold text-slate-900">
                      {ag.materi}
                    </td>
                    <td className="px-2.5 py-1.5 border-r border-slate-100 text-slate-700">
                      <span className="inline-block bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-medium text-[10px]">
                        {ag.modelPembelajaran}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 border-r border-slate-100 text-slate-600 italic">
                      {ag.catatan || '-'}
                    </td>
                    <td className="px-2 py-1.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEditClick(ag)}
                          className="p-1 text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                          title="Edit Catatan Agenda"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Yakin ingin menghapus agenda mengajar ini?')) {
                              onDeleteAgenda(ag.id);
                            }
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Hapus Agenda"
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

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        title="Jurnal & Agenda Harian Mengajar Guru"
        subTitle={`Semester ${profile.semesterAktif} Tahun Ajaran ${profile.tahunAjaranAktif}`}
        profile={profile}
        orientation="landscape"
        onDownloadPdf={() =>
          exportAgendaToPDF(
            filteredList,
            profile,
            filterClass !== 'all' ? filterClass : undefined,
            filterSubject !== 'all' ? filterSubject : undefined
          )
        }
        onDownloadExcel={() =>
          exportAgendaToExcel(
            filteredList,
            profile,
            filterClass !== 'all' ? filterClass : undefined,
            filterSubject !== 'all' ? filterSubject : undefined
          )
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <p><strong className="font-semibold text-slate-700">Guru Pengampu:</strong> {profile.guru}</p>
              <p><strong className="font-semibold text-slate-700">Semester / TA:</strong> {profile.semesterAktif} / {profile.tahunAjaranAktif}</p>
            </div>
            <div>
              <p><strong className="font-semibold text-slate-700">Total Catatan:</strong> {filteredList.length} Pertemuan</p>
              <p><strong className="font-semibold text-slate-700">Satuan Pendidikan:</strong> {profile.namaSekolah}</p>
            </div>
          </div>

          <table className="w-full text-left text-xs border border-slate-300 border-collapse">
            <thead className="bg-slate-200 text-slate-800 font-bold">
              <tr className="border-b border-slate-300">
                <th className="py-2 px-1 text-center w-8 border-r border-slate-300">No</th>
                <th className="py-2 px-2 w-28 border-r border-slate-300">Hari / Tanggal</th>
                <th className="py-2 px-1 w-16 text-center border-r border-slate-300">Jam</th>
                <th className="py-2 px-1 w-16 text-center border-r border-slate-300">Kelas</th>
                <th className="py-2 px-2 w-24 border-r border-slate-300">Mapel</th>
                <th className="py-2 px-3 border-r border-slate-300">Judul Materi / Topik</th>
                <th className="py-2 px-3 w-40 border-r border-slate-300">Model Pembelajaran</th>
                <th className="py-2 px-3">Catatan / Refleksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredList.map((ag, idx) => (
                <tr key={ag.id} className={idx % 2 === 1 ? 'bg-slate-50/60' : ''}>
                  <td className="py-1.5 px-1 text-center border-r border-slate-300 text-slate-600">{idx + 1}</td>
                  <td className="py-1.5 px-2 font-medium border-r border-slate-300 whitespace-nowrap">{formatDateIndo(ag.tanggal)}</td>
                  <td className="py-1.5 px-1 text-center border-r border-slate-300">{ag.jamKe}</td>
                  <td className="py-1.5 px-1 text-center font-bold border-r border-slate-300">{ag.kelas}</td>
                  <td className="py-1.5 px-2 border-r border-slate-300">{ag.mataPelajaran}</td>
                  <td className="py-1.5 px-3 font-semibold border-r border-slate-300">{ag.materi}</td>
                  <td className="py-1.5 px-3 border-r border-slate-300 text-[11px]">{ag.modelPembelajaran}</td>
                  <td className="py-1.5 px-3 italic text-slate-600">{ag.catatan || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PrintPreviewModal>
    </div>
  );
};
