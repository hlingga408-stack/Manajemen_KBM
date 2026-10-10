import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  FileDown,
  FileSpreadsheet,
  Printer,
  Upload,
  Search,
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Clock,
  BookOpen,
  ClipboardList,
  BarChart3,
} from 'lucide-react';
import { Student, AttendanceRecord, AttendanceStatus, SchoolProfile } from '../types';
import { DEFAULT_SUBJECTS } from '../data/initialData';
import { formatDateIndo } from '../utils/calculations';
import { exportAttendanceToExcel } from '../utils/excelExport';
import { exportAttendanceToPDF } from '../utils/pdfExport';
import { PrintPreviewModal } from './PrintPreviewModal';
import { ImportStudentsModal } from './ImportStudentsModal';
import { RekapAbsensiSubView } from './RekapAbsensiSubView';

interface AbsensiViewProps {
  students: Student[];
  classes: string[];
  attendanceRecords: AttendanceRecord[];
  profile: SchoolProfile;
  onSaveAttendance: (record: AttendanceRecord) => void;
  onImportStudents: (newStudents: Student[]) => void;
}

export const AbsensiView: React.FC<AbsensiViewProps> = ({
  students,
  classes,
  attendanceRecords,
  profile,
  onSaveAttendance,
  onImportStudents,
}) => {
  // Sub-menu state: 'harian' | 'rekap'
  const [activeSubTab, setActiveSubTab] = useState<'harian' | 'rekap'>('harian');

  const [selectedClass, setSelectedClass] = useState<string>(classes[0] || 'XI-MIPA-1');
  const [selectedSubject, setSelectedSubject] = useState<string>('Matematika');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [pertemuanKe, setPertemuanKe] = useState<number>(1);
  const [catatanKBM, setCatatanKBM] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals
  const [showPrintPreview, setShowPrintPreview] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);

  // Filter students by selected class
  const classStudents = useMemo(() => {
    return students
      .filter((s) => s.kelas === selectedClass)
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }, [students, selectedClass]);

  // Current session entries (studentId -> 'H' | 'S' | 'I' | 'A')
  const [entries, setEntries] = useState<Record<string, AttendanceStatus>>({});

  // Sync state when class, date, or subject changes to load existing record if any
  React.useEffect(() => {
    const existing = attendanceRecords.find(
      (r) => r.kelas === selectedClass && r.tanggal === selectedDate && r.mataPelajaran === selectedSubject
    );

    if (existing) {
      setEntries(existing.entries);
      setPertemuanKe(existing.pertemuanKe || 1);
      setCatatanKBM(existing.catatan || '');
    } else {
      // Default all to 'H'
      const initial: Record<string, AttendanceStatus> = {};
      classStudents.forEach((s) => {
        initial[s.id] = 'H';
      });
      setEntries(initial);
      setCatatanKBM('');
    }
  }, [selectedClass, selectedDate, selectedSubject, attendanceRecords, classStudents]);

  // Handle single student status toggle
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setEntries((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Set Semua Hadir in 1 Click
  const handleSetSemuaHadir = () => {
    const updated: Record<string, AttendanceStatus> = {};
    classStudents.forEach((s) => {
      updated[s.id] = 'H';
    });
    setEntries(updated);
  };

  // Summary counts
  const summary = useMemo(() => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;

    classStudents.forEach((s) => {
      const st = entries[s.id] || 'H';
      if (st === 'H') hadir++;
      else if (st === 'S') sakit++;
      else if (st === 'I') izin++;
      else if (st === 'A') alpa++;
    });

    const total = classStudents.length;
    const persentase = total > 0 ? Number(((hadir / total) * 100).toFixed(1)) : 0;

    return { total, hadir, sakit, izin, alpa, persentase };
  }, [classStudents, entries]);

  // Current record object for export
  const currentRecord: AttendanceRecord = useMemo(() => {
    return {
      id: `att-${selectedClass}-${selectedDate}-${selectedSubject}`,
      tanggal: selectedDate,
      kelas: selectedClass,
      mataPelajaran: selectedSubject,
      pertemuanKe,
      entries,
      catatan: catatanKBM,
      createdAt: Date.now(),
    };
  }, [selectedClass, selectedDate, selectedSubject, pertemuanKe, entries, catatanKBM]);

  const handleSave = () => {
    onSaveAttendance(currentRecord);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  // Search filtered student list
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return classStudents;
    const q = searchQuery.toLowerCase();
    return classStudents.filter(
      (s) => s.nama.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q)
    );
  }, [classStudents, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Sub-menu Navigation Bar */}
      <div className="bg-white rounded-lg p-1.5 border border-slate-200 shadow-2xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="subtab-presensi-harian"
            onClick={() => setActiveSubTab('harian')}
            className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'harian'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Presensi Harian</span>
          </button>

          <button
            type="button"
            id="subtab-rekap-absensi"
            onClick={() => setActiveSubTab('rekap')}
            className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'rekap'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Rekap Absensi Siswa</span>
            <span className="px-1.5 py-0.2 text-[9px] font-black bg-amber-400 text-blue-950 rounded">
              Periode
            </span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 font-medium px-2">
          <span>Semester: <strong className="text-slate-800">{profile.semesterAktif}</strong> &bull; T.A: <strong className="text-slate-800">{profile.tahunAjaranAktif}</strong></span>
        </div>
      </div>

      {/* Sub-menu View Routing */}
      {activeSubTab === 'rekap' ? (
        <RekapAbsensiSubView
          students={students}
          classes={classes}
          attendanceRecords={attendanceRecords}
          profile={profile}
          initialClass={selectedClass}
          initialSubject={selectedSubject}
        />
      ) : (
        <>
          {/* Control Panel Header */}
          <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              {/* Class, Subject, Date, Meeting selection */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1">
                {/* Kelas Picker */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Pilih Kelas
                  </label>
                  <select
                    id="select-kelas-absensi"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
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
                    id="select-mapel-absensi"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {DEFAULT_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tanggal */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Hari / Tanggal
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="input-tanggal-absensi"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Pertemuan Ke- */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Pertemuan Ke-
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={pertemuanKe}
                    onChange={(e) => setPertemuanKe(parseInt(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Export Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium hover:bg-slate-50 flex items-center gap-1.5 text-slate-700 transition-colors"
                  title="Salin dan tempel daftar nama siswa dari Excel"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Impor</span>
                </button>

                <button
                  onClick={() => exportAttendanceToPDF(currentRecord, classStudents, profile)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium hover:bg-slate-50 flex items-center gap-1.5 text-slate-700 transition-colors"
                  title="Download PDF Langsung dengan Kop Surat, Kelas & Tanda Tangan"
                >
                  <span className="w-2.5 h-2.5 bg-red-100 border border-red-400 rounded-xs" />
                  <span>PDF</span>
                </button>

                <button
                  onClick={() => exportAttendanceToExcel(currentRecord, classStudents, profile)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium hover:bg-slate-50 flex items-center gap-1.5 text-slate-700 transition-colors"
                  title="Download format MS Excel (.xlsx)"
                >
                  <span className="w-2.5 h-2.5 bg-green-100 border border-green-400 rounded-xs" />
                  <span>Excel</span>
                </button>

                <button
                  onClick={() => setShowPrintPreview(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-2xs flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Preview</span>
                </button>
              </div>
            </div>
          </div>

          {/* Summary Statistics Cards & 1-Click Set Hadir - High Density */}
          <div className="flex items-center justify-between shrink-0 flex-wrap gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">Presensi Harian</h2>
              <p className="text-xs text-slate-500">
                Kelas: <strong className="text-slate-800 font-semibold">{selectedClass}</strong> &bull; Pertemuan {pertemuanKe} &bull; {formatDateIndo(selectedDate)}
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <div className="bg-slate-50 border border-slate-200 p-2 rounded min-w-[70px]">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total</div>
                <div className="text-lg font-bold text-slate-900 leading-tight">{summary.total}</div>
              </div>

              <div className="bg-green-50 border border-green-200 p-2 rounded min-w-[70px]">
                <div className="text-[9px] font-bold text-green-600 uppercase tracking-wider">Hadir</div>
                <div className="text-lg font-bold text-green-700 leading-tight">{summary.hadir}</div>
              </div>

              <div className="bg-sky-50 border border-sky-200 p-2 rounded min-w-[70px]">
                <div className="text-[9px] font-bold text-sky-600 uppercase tracking-wider">Sakit</div>
                <div className="text-lg font-bold text-sky-700 leading-tight">{summary.sakit}</div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-2 rounded min-w-[70px]">
                <div className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Izin</div>
                <div className="text-lg font-bold text-amber-700 leading-tight">{summary.izin}</div>
              </div>

              <div className="bg-red-50 border border-red-200 p-2 rounded min-w-[70px]">
                <div className="text-[9px] font-bold text-red-600 uppercase tracking-wider">Alpa</div>
                <div className="text-lg font-bold text-red-700 leading-tight">{summary.alpa}</div>
              </div>

              {/* Quick Action: Set Semua Hadir Button */}
              <button
                onClick={handleSetSemuaHadir}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all self-stretch"
                title="Setel semua siswa dalam kelas ini menjadi Hadir (H) dengan satu kali klik"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Semua Hadir</span>
              </button>
            </div>
          </div>

          {/* Main Attendance Table Section */}
          <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
            {/* Table Search and Filter Bar */}
            <div className="px-3 py-2 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-50/70">
              <div className="text-xs font-bold text-slate-700">
                Daftar Presensi Kelas <span className="text-blue-900 font-extrabold">{selectedClass}</span> ({filteredStudents.length} Siswa)
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Search Input */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Cari NIS atau Nama..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Save Attendance Button */}
                <button
                  onClick={handleSave}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-all flex items-center gap-1 flex-shrink-0 ${
                    saveSuccessNotice
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{saveSuccessNotice ? 'Tersimpan!' : 'Simpan'}</span>
                </button>
              </div>
            </div>

            {/* Student Rows Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-700">
                  <tr>
                    <th className="px-2 py-2.5 border-r border-slate-200 w-10 text-center font-bold">No</th>
                    <th className="px-2 py-2.5 border-r border-slate-200 w-24 text-center font-bold">NIS</th>
                    <th className="px-3 py-2.5 border-r border-slate-200 min-w-[180px] font-bold">Nama Lengkap Siswa</th>
                    <th className="px-2 py-2.5 border-r border-slate-200 w-12 text-center font-bold">L/P</th>
                    <th className="px-3 py-2.5 w-64 text-center font-bold">
                      Status Presensi (Klik Langsung)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                        <AlertCircle className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                        Belum ada data siswa di kelas {selectedClass}.
                        <button
                          onClick={() => setShowImportModal(true)}
                          className="block mx-auto mt-1.5 text-xs font-bold text-indigo-600 hover:underline"
                        >
                          + Impor data siswa dari Excel
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, idx) => {
                      const currentStatus = entries[student.id] || 'H';

                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-2 py-1.5 border-r border-slate-100 text-center font-medium text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="px-2 py-1.5 border-r border-slate-100 text-center font-mono font-medium text-slate-500">
                            {student.nis}
                          </td>
                          <td className="px-3 py-1.5 border-r border-slate-100 font-medium text-slate-800">
                            <div className="flex items-center gap-2">
                              <span>{student.nama}</span>
                              {currentStatus !== 'H' && (
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                    currentStatus === 'S'
                                      ? 'bg-sky-100 text-sky-800'
                                      : currentStatus === 'I'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {currentStatus === 'S' ? 'Sakit' : currentStatus === 'I' ? 'Izin' : 'Alpa'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-1.5 border-r border-slate-100 text-center text-slate-500 font-medium">
                            {student.gender || '-'}
                          </td>
                          {/* 1-Click Status Selection (NO DROPDOWN - DIRECT CHIP BUTTONS) */}
                          <td className="px-2 py-1">
                            <div className="grid grid-cols-4 gap-1 max-w-xs mx-auto">
                              {/* Hadir Button */}
                              <button
                                type="button"
                                id={`btn-hadir-${student.id}`}
                                onClick={() => handleStatusChange(student.id, 'H')}
                                className={`py-1 px-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                                  currentStatus === 'H'
                                    ? 'bg-green-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-green-50 hover:text-green-700'
                                }`}
                              >
                                <span>H</span>
                              </button>

                              {/* Sakit Button */}
                              <button
                                type="button"
                                id={`btn-sakit-${student.id}`}
                                onClick={() => handleStatusChange(student.id, 'S')}
                                className={`py-1 px-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                                  currentStatus === 'S'
                                    ? 'bg-sky-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                                }`}
                              >
                                <span>S</span>
                              </button>

                              {/* Izin Button */}
                              <button
                                type="button"
                                id={`btn-izin-${student.id}`}
                                onClick={() => handleStatusChange(student.id, 'I')}
                                className={`py-1 px-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                                  currentStatus === 'I'
                                    ? 'bg-amber-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                                }`}
                              >
                                <span>I</span>
                              </button>

                              {/* Alpa Button */}
                              <button
                                type="button"
                                id={`btn-alpa-${student.id}`}
                                onClick={() => handleStatusChange(student.id, 'A')}
                                className={`py-1 px-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                                  currentStatus === 'A'
                                    ? 'bg-red-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700'
                                }`}
                              >
                                <span>A</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Catatan KBM Section */}
            <div className="px-3 py-2.5 bg-slate-50 border-t border-slate-200">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Catatan Pelaksanaan KBM / Kejadian Khusus:
              </label>
              <div className="flex flex-col sm:flex-row gap-2 items-start">
                <textarea
                  rows={2}
                  value={catatanKBM}
                  onChange={(e) => setCatatanKBM(e.target.value)}
                  placeholder="Contoh: Seluruh siswa hadir tepat waktu. Materi Trigonometri dipahami dengan baik..."
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  onClick={handleSave}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded shadow-2xs flex-shrink-0 flex items-center gap-1 transition-all self-stretch sm:self-auto justify-center"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Catatan</span>
                </button>
              </div>
            </div>
          </div>

          {/* Print Preview Modal */}
          <PrintPreviewModal
            isOpen={showPrintPreview}
            onClose={() => setShowPrintPreview(false)}
            title="Laporan Presensi & Kehadiran Peserta Didik"
            subTitle={`Kelas: ${selectedClass} | Mata Pelajaran: ${selectedSubject} | Hari/Tanggal: ${formatDateIndo(selectedDate)}`}
            profile={profile}
            orientation="portrait"
            onDownloadPdf={() => exportAttendanceToPDF(currentRecord, classStudents, profile)}
            onDownloadExcel={() => exportAttendanceToExcel(currentRecord, classStudents, profile)}
          >
            <div className="space-y-4">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <p><strong className="font-semibold text-slate-700">Kelas / Rombel:</strong> Kelas {selectedClass}</p>
                  <p><strong className="font-semibold text-slate-700">Mata Pelajaran:</strong> {selectedSubject}</p>
                  <p><strong className="font-semibold text-slate-700">Semester / TA:</strong> {profile.semesterAktif} / {profile.tahunAjaranAktif}</p>
                </div>
                <div>
                  <p><strong className="font-semibold text-slate-700">Pertemuan Ke:</strong> {pertemuanKe}</p>
                  <p><strong className="font-semibold text-slate-700">Hari / Tanggal:</strong> {formatDateIndo(selectedDate)}</p>
                  <p><strong className="font-semibold text-slate-700">Guru Pengampu:</strong> {profile.guru}</p>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead className="bg-slate-200 text-slate-800 font-bold">
                  <tr className="border-b border-slate-300">
                    <th className="py-2 px-2 text-center w-8 border-r border-slate-300">No</th>
                    <th className="py-2 px-2 text-center w-24 border-r border-slate-300">NIS</th>
                    <th className="py-2 px-3 border-r border-slate-300">Nama Siswa</th>
                    <th className="py-2 px-2 text-center w-10 border-r border-slate-300">L/P</th>
                    <th className="py-2 px-3 text-center w-28 border-r border-slate-300">Status</th>
                    <th className="py-2 px-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {classStudents.map((s, idx) => {
                    const st = entries[s.id] || 'H';
                    let label = 'Hadir (H)';
                    if (st === 'S') label = 'Sakit (S)';
                    if (st === 'I') label = 'Izin (I)';
                    if (st === 'A') label = 'Alpa (A)';

                    return (
                      <tr key={s.id} className={idx % 2 === 1 ? 'bg-slate-50/60' : ''}>
                        <td className="py-1.5 px-2 text-center border-r border-slate-300 text-slate-600">{idx + 1}</td>
                        <td className="py-1.5 px-2 text-center font-mono border-r border-slate-300 font-medium">{s.nis}</td>
                        <td className="py-1.5 px-3 border-r border-slate-300 font-medium">{s.nama}</td>
                        <td className="py-1.5 px-2 text-center border-r border-slate-300 text-slate-600">{s.gender || '-'}</td>
                        <td className="py-1.5 px-3 text-center border-r border-slate-300 font-semibold">
                          <span className={st === 'H' ? 'text-emerald-700' : st === 'S' ? 'text-sky-700' : st === 'I' ? 'text-amber-700' : 'text-rose-700'}>
                            {label}
                          </span>
                        </td>
                        <td className="py-1.5 px-3 text-slate-600">
                          {st === 'H' ? 'Mengikuti Pembelajaran' : `Keterangan: ${label}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Summary Box */}
              <div className="bg-slate-100 p-2.5 rounded border border-slate-300 text-xs flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  Ringkasan Kehadiran Kelas {selectedClass}: Total: {summary.total} Siswa | Hadir: {summary.hadir} | Sakit: {summary.sakit} | Izin: {summary.izin} | Alpa: {summary.alpa}
                </span>
                <span className="font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                  {summary.persentase}% Kehadiran
                </span>
              </div>

              {catatanKBM && (
                <div className="text-xs bg-slate-50 p-2 rounded border border-slate-200">
                  <strong className="font-semibold text-slate-700">Catatan Guru:</strong> {catatanKBM}
                </div>
              )}
            </div>
          </PrintPreviewModal>

          {/* Import Modal */}
          <ImportStudentsModal
            isOpen={showImportModal}
            onClose={() => setShowImportModal(false)}
            classes={classes}
            currentClass={selectedClass}
            onImport={(newStudents) => {
              onImportStudents(newStudents);
            }}
          />
        </>
      )}
    </div>
  );
};
