import React, { useState, useMemo } from 'react';
import {
  Calendar,
  FileDown,
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  Users,
  CheckCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Student, AttendanceRecord, SchoolProfile } from '../types';
import { DEFAULT_SUBJECTS } from '../data/initialData';
import { formatDateIndo } from '../utils/calculations';
import { exportAttendanceRekapToPDF } from '../utils/pdfExport';
import { exportAttendanceRekapToExcel } from '../utils/excelExport';
import { PrintPreviewModal } from './PrintPreviewModal';

interface RekapAbsensiSubViewProps {
  students: Student[];
  classes: string[];
  attendanceRecords: AttendanceRecord[];
  profile: SchoolProfile;
  initialClass?: string;
  initialSubject?: string;
}

export const RekapAbsensiSubView: React.FC<RekapAbsensiSubViewProps> = ({
  students,
  classes,
  attendanceRecords,
  profile,
  initialClass,
  initialSubject,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(initialClass || classes[0] || 'XI-MIPA-1');
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || 'Matematika');
  
  // Default date range: beginning of semester to today
  const defaultStartDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 2);
    return d.toISOString().split('T')[0];
  }, []);
  const defaultEndDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPrintPreview, setShowPrintPreview] = useState<boolean>(false);

  // Filter students for this class
  const classStudents = useMemo(() => {
    return students
      .filter((s) => s.kelas === selectedClass)
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }, [students, selectedClass]);

  // Filter attendance records by class, subject, and date range
  const filteredRecords = useMemo(() => {
    return attendanceRecords
      .filter((r) => {
        const matchClass = r.kelas === selectedClass;
        const matchSubj = selectedSubject === 'Semua' || r.mataPelajaran === selectedSubject;
        const matchDate = (!startDate || r.tanggal >= startDate) && (!endDate || r.tanggal <= endDate);
        return matchClass && matchSubj && matchDate;
      })
      .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
  }, [attendanceRecords, selectedClass, selectedSubject, startDate, endDate]);

  // Aggregate stats per student
  const studentStats = useMemo(() => {
    const totalMeetings = filteredRecords.length;

    return classStudents.map((student) => {
      let hadir = 0;
      let sakit = 0;
      let izin = 0;
      let alpa = 0;
      const perMeetingStatus: Record<string, string> = {};

      filteredRecords.forEach((r) => {
        const st = r.entries[student.id] || '-';
        perMeetingStatus[r.id] = st;
        if (st === 'H') hadir++;
        else if (st === 'S') sakit++;
        else if (st === 'I') izin++;
        else if (st === 'A') alpa++;
      });

      const recordedCount = hadir + sakit + izin + alpa;
      const persentase = totalMeetings > 0 ? Number(((hadir / totalMeetings) * 100).toFixed(1)) : 0;

      return {
        student,
        hadir,
        sakit,
        izin,
        alpa,
        recordedCount,
        totalMeetings,
        persentase,
        perMeetingStatus,
      };
    });
  }, [classStudents, filteredRecords]);

  // Class overall summary
  const classSummary = useMemo(() => {
    let totalHadir = 0;
    let totalSakit = 0;
    let totalIzin = 0;
    let totalAlpa = 0;

    studentStats.forEach((st) => {
      totalHadir += st.hadir;
      totalSakit += st.sakit;
      totalIzin += st.izin;
      totalAlpa += st.alpa;
    });

    const totalStudents = classStudents.length;
    const totalPossibleAttendances = totalStudents * (filteredRecords.length || 1);
    const avgPersentase = totalPossibleAttendances > 0 
      ? Number(((totalHadir / totalPossibleAttendances) * 100).toFixed(1)) 
      : 0;

    return {
      totalStudents,
      totalMeetings: filteredRecords.length,
      totalHadir,
      totalSakit,
      totalIzin,
      totalAlpa,
      avgPersentase,
    };
  }, [studentStats, classStudents, filteredRecords]);

  // Filtered rows by search query
  const displayedRows = useMemo(() => {
    if (!searchQuery.trim()) return studentStats;
    const q = searchQuery.toLowerCase();
    return studentStats.filter(
      (item) =>
        item.student.nama.toLowerCase().includes(q) ||
        item.student.nis.toLowerCase().includes(q)
    );
  }, [studentStats, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Filter and Control Bar */}
      <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Controls Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1">
            {/* Kelas Picker */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Pilih Kelas
              </label>
              <select
                id="select-kelas-rekap"
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

            {/* Mata Pelajaran Picker */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Mata Pelajaran
              </label>
              <select
                id="select-mapel-rekap"
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

            {/* Periode Dari Tanggal */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                id="input-start-date-rekap"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Periode Sampai Tanggal */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                id="input-end-date-rekap"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 self-end lg:self-center">
            <button
              onClick={() =>
                exportAttendanceRekapToPDF(
                  filteredRecords,
                  classStudents,
                  selectedClass,
                  selectedSubject,
                  startDate,
                  endDate,
                  profile
                )
              }
              className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium hover:bg-slate-50 flex items-center gap-1.5 text-slate-700 transition-colors"
              title="Download Rekap PDF Lengkap dengan KOP Sekolah & Tanda Tangan"
            >
              <span className="w-2.5 h-2.5 bg-red-100 border border-red-400 rounded-xs" />
              <span>PDF Rekap</span>
            </button>

            <button
              onClick={() =>
                exportAttendanceRekapToExcel(
                  filteredRecords,
                  classStudents,
                  selectedClass,
                  selectedSubject,
                  startDate,
                  endDate,
                  profile
                )
              }
              className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium hover:bg-slate-50 flex items-center gap-1.5 text-slate-700 transition-colors"
              title="Download Rekap Excel (.xlsx)"
            >
              <span className="w-2.5 h-2.5 bg-green-100 border border-green-400 rounded-xs" />
              <span>Excel Rekap</span>
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

      {/* Summary KPI Cards for Rekap */}
      <div className="flex items-center justify-between shrink-0 flex-wrap gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">
            Rekapitulasi Presensi Periode KBM
          </h2>
          <p className="text-xs text-slate-500">
            Kelas: <strong className="text-slate-700 font-semibold">{selectedClass}</strong> &bull; {selectedSubject} &bull; Periode: {formatDateIndo(startDate)} s.d. {formatDateIndo(endDate)} ({filteredRecords.length} Pertemuan)
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <div className="bg-slate-50 border border-slate-200 p-2 rounded min-w-[70px]">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Siswa</div>
            <div className="text-lg font-bold text-slate-900 leading-tight">{classSummary.totalStudents}</div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 p-2 rounded min-w-[70px]">
            <div className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">Pertemuan</div>
            <div className="text-lg font-bold text-indigo-700 leading-tight">{classSummary.totalMeetings}</div>
          </div>

          <div className="bg-green-50 border border-green-200 p-2 rounded min-w-[70px]">
            <div className="text-[9px] font-bold text-green-600 uppercase tracking-wider">Hadir (H)</div>
            <div className="text-lg font-bold text-green-700 leading-tight">{classSummary.totalHadir}</div>
          </div>

          <div className="bg-sky-50 border border-sky-200 p-2 rounded min-w-[70px]">
            <div className="text-[9px] font-bold text-sky-600 uppercase tracking-wider">Sakit (S)</div>
            <div className="text-lg font-bold text-sky-700 leading-tight">{classSummary.totalSakit}</div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-2 rounded min-w-[70px]">
            <div className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Izin (I)</div>
            <div className="text-lg font-bold text-amber-700 leading-tight">{classSummary.totalIzin}</div>
          </div>

          <div className="bg-red-50 border border-red-200 p-2 rounded min-w-[70px]">
            <div className="text-[9px] font-bold text-red-600 uppercase tracking-wider">Alpa (A)</div>
            <div className="text-lg font-bold text-red-700 leading-tight">{classSummary.totalAlpa}</div>
          </div>

          <div className="bg-blue-900 border border-blue-950 p-2 rounded min-w-[85px] text-white">
            <div className="text-[9px] font-bold text-blue-200 uppercase tracking-wider">% Kehadiran</div>
            <div className="text-lg font-black leading-tight text-amber-300">{classSummary.avgPersentase}%</div>
          </div>
        </div>
      </div>

      {/* Main Rekap Matrix Table */}
      <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
        {/* Table Search bar */}
        <div className="px-3 py-2 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-50/70">
          <div className="text-xs font-bold text-slate-700">
            Tabel Matriks Pertemuan & Akumulasi ({displayedRows.length} Siswa)
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Cari NIS atau Nama Siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Scrollable Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-left border-collapse">
            <thead className="bg-slate-100 border-b border-slate-200 sticky top-0 z-10 text-[10px] uppercase tracking-wider text-slate-700 font-bold">
              <tr>
                <th className="px-2 py-2 border-r border-slate-200 w-9 text-center">No</th>
                <th className="px-2 py-2 border-r border-slate-200 w-20 text-center">NIS</th>
                <th className="px-3 py-2 border-r border-slate-200 min-w-[170px]">Nama Lengkap Siswa</th>
                <th className="px-1.5 py-2 border-r border-slate-200 w-10 text-center">L/P</th>

                {/* Dynamic Meeting Columns */}
                {filteredRecords.map((r, idx) => {
                  const d = new Date(r.tanggal);
                  const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
                  return (
                    <th
                      key={r.id}
                      className="px-1.5 py-2 border-r border-slate-200 w-11 text-center bg-slate-50 hover:bg-slate-200 transition-colors"
                      title={`Pertemuan ${r.pertemuanKe || idx + 1} (${r.tanggal}): ${r.mataPelajaran}`}
                    >
                      <div className="font-bold text-indigo-900">P{r.pertemuanKe || idx + 1}</div>
                      <div className="text-[9px] font-normal text-slate-500">{dateStr}</div>
                    </th>
                  );
                })}

                {/* Aggregation Columns */}
                <th className="px-2 py-2 border-r border-slate-200 w-10 text-center bg-green-50 text-green-800">H</th>
                <th className="px-2 py-2 border-r border-slate-200 w-10 text-center bg-sky-50 text-sky-800">S</th>
                <th className="px-2 py-2 border-r border-slate-200 w-10 text-center bg-amber-50 text-amber-800">I</th>
                <th className="px-2 py-2 border-r border-slate-200 w-10 text-center bg-red-50 text-red-800">A</th>
                <th className="px-2 py-2 border-r border-slate-200 w-12 text-center bg-slate-200 text-slate-800">Total</th>
                <th className="px-2.5 py-2 w-16 text-center bg-blue-900 text-white">% Hadir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {displayedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={10 + filteredRecords.length}
                    className="py-8 text-center text-slate-500 text-xs"
                  >
                    <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
                    Tidak ada data presensi yang sesuai dengan filter kelas ({selectedClass}) dan rentang tanggal yang dipilih.
                  </td>
                </tr>
              ) : (
                displayedRows.map((row, idx) => {
                  return (
                    <tr
                      key={row.student.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-2 py-1.5 border-r border-slate-100 text-center font-medium text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="px-2 py-1.5 border-r border-slate-100 text-center font-mono font-medium text-slate-500">
                        {row.student.nis}
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-100 font-medium text-slate-800">
                        {row.student.nama}
                      </td>
                      <td className="px-1.5 py-1.5 border-r border-slate-100 text-center text-slate-500 font-medium">
                        {row.student.gender || '-'}
                      </td>

                      {/* Dynamic Meeting Status Chips */}
                      {filteredRecords.map((r) => {
                        const st = row.perMeetingStatus[r.id] || '-';
                        let badgeBg = 'text-slate-300';
                        if (st === 'H') badgeBg = 'bg-emerald-100 text-emerald-800 font-bold';
                        else if (st === 'S') badgeBg = 'bg-sky-100 text-sky-800 font-bold';
                        else if (st === 'I') badgeBg = 'bg-amber-100 text-amber-800 font-bold';
                        else if (st === 'A') badgeBg = 'bg-rose-100 text-rose-800 font-bold';

                        return (
                          <td
                            key={r.id}
                            className="px-1 py-1 border-r border-slate-100 text-center font-medium"
                          >
                            <span
                              className={`inline-block w-6 py-0.5 rounded text-[10px] text-center ${badgeBg}`}
                            >
                              {st}
                            </span>
                          </td>
                        );
                      })}

                      {/* Student Cumulative Totals */}
                      <td className="px-2 py-1.5 border-r border-slate-100 text-center font-bold text-green-700 bg-green-50/40">
                        {row.hadir}
                      </td>
                      <td className="px-2 py-1.5 border-r border-slate-100 text-center font-bold text-sky-700 bg-sky-50/40">
                        {row.sakit}
                      </td>
                      <td className="px-2 py-1.5 border-r border-slate-100 text-center font-bold text-amber-700 bg-amber-50/40">
                        {row.izin}
                      </td>
                      <td className="px-2 py-1.5 border-r border-slate-100 text-center font-bold text-red-700 bg-red-50/40">
                        {row.alpa}
                      </td>
                      <td className="px-2 py-1.5 border-r border-slate-100 text-center font-bold text-slate-700 bg-slate-100/60">
                        {row.totalMeetings}
                      </td>
                      <td className="px-2 py-1.5 text-center font-black text-blue-900 bg-blue-50/50">
                        {row.persentase}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Statistics Summary Bar */}
        <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-700 gap-2">
          <div className="font-semibold flex items-center gap-3">
            <span>Kelas: <strong className="text-blue-900">{selectedClass}</strong></span>
            <span>&bull;</span>
            <span>Total Siswa: <strong>{classStudents.length}</strong></span>
            <span>&bull;</span>
            <span>Pertemuan Selesai: <strong>{filteredRecords.length} Pertemuan</strong></span>
          </div>

          <div className="flex items-center gap-2 font-bold">
            <span className="text-green-700">H: {classSummary.totalHadir}</span>
            <span className="text-sky-700">S: {classSummary.totalSakit}</span>
            <span className="text-amber-700">I: {classSummary.totalIzin}</span>
            <span className="text-red-700">A: {classSummary.totalAlpa}</span>
            <span className="px-2 py-0.5 bg-blue-900 text-white rounded text-[11px] font-bold">
              Rata-rata Kelas: {classSummary.avgPersentase}%
            </span>
          </div>
        </div>
      </div>

      {/* Print Preview Modal with KOP & Kelas for Rekap */}
      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        title={`Rekapitulasi Presensi & Kehadiran Siswa - Kelas ${selectedClass}`}
        subTitle={`Mata Pelajaran: ${selectedSubject} | Periode: ${formatDateIndo(startDate)} s.d. ${formatDateIndo(endDate)}`}
        profile={profile}
        orientation="landscape"
        onDownloadPdf={() =>
          exportAttendanceRekapToPDF(
            filteredRecords,
            classStudents,
            selectedClass,
            selectedSubject,
            startDate,
            endDate,
            profile
          )
        }
        onDownloadExcel={() =>
          exportAttendanceRekapToExcel(
            filteredRecords,
            classStudents,
            selectedClass,
            selectedSubject,
            startDate,
            endDate,
            profile
          )
        }
      >
        <div className="space-y-3 font-sans">
          {/* Document Metadata */}
          <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-2.5 rounded border border-slate-300">
            <div>
              <p><strong className="font-semibold text-slate-800">Kelas / Rombel:</strong> Kelas {selectedClass}</p>
              <p><strong className="font-semibold text-slate-800">Mata Pelajaran:</strong> {selectedSubject}</p>
            </div>
            <div>
              <p><strong className="font-semibold text-slate-800">Periode Rekap:</strong> {formatDateIndo(startDate)} s.d. {formatDateIndo(endDate)}</p>
              <p><strong className="font-semibold text-slate-800">Semester / T.A:</strong> {profile.semesterAktif} / {profile.tahunAjaranAktif}</p>
            </div>
            <div>
              <p><strong className="font-semibold text-slate-800">Guru Pengampu:</strong> {profile.guru}</p>
              <p><strong className="font-semibold text-slate-800">Total Pertemuan:</strong> {filteredRecords.length} Pertemuan KBM</p>
            </div>
          </div>

          {/* Matrix Print Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] border border-slate-400 border-collapse">
              <thead className="bg-slate-200 text-slate-900 font-bold">
                <tr className="border-b border-slate-400">
                  <th className="py-1 px-1.5 text-center border-r border-slate-400 w-8">No</th>
                  <th className="py-1 px-1.5 text-center border-r border-slate-400 w-20">NIS</th>
                  <th className="py-1 px-2 border-r border-slate-400 min-w-[140px] text-left">Nama Siswa</th>
                  <th className="py-1 px-1 text-center border-r border-slate-400 w-8">L/P</th>

                  {filteredRecords.map((r, idx) => {
                    const d = new Date(r.tanggal);
                    return (
                      <th
                        key={r.id}
                        className="py-1 px-1 text-center border-r border-slate-400 w-9"
                      >
                        P{r.pertemuanKe || idx + 1}
                        <br />
                        <span className="text-[8px] font-normal">{d.getDate()}/{d.getMonth() + 1}</span>
                      </th>
                    );
                  })}

                  <th className="py-1 px-1.5 text-center border-r border-slate-400 w-8 bg-green-100">H</th>
                  <th className="py-1 px-1.5 text-center border-r border-slate-400 w-8 bg-sky-100">S</th>
                  <th className="py-1 px-1.5 text-center border-r border-slate-400 w-8 bg-amber-100">I</th>
                  <th className="py-1 px-1.5 text-center border-r border-slate-400 w-8 bg-red-100">A</th>
                  <th className="py-1 px-1.5 text-center border-r border-slate-400 w-10">Total</th>
                  <th className="py-1 px-1.5 text-center w-12 bg-blue-100">% Hadir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {studentStats.map((row, idx) => (
                  <tr key={row.student.id} className={idx % 2 === 1 ? 'bg-slate-50/70' : ''}>
                    <td className="py-1 px-1 text-center border-r border-slate-300">{idx + 1}</td>
                    <td className="py-1 px-1 text-center font-mono border-r border-slate-300">{row.student.nis}</td>
                    <td className="py-1 px-2 border-r border-slate-300 font-medium">{row.student.nama}</td>
                    <td className="py-1 px-1 text-center border-r border-slate-300">{row.student.gender || '-'}</td>

                    {filteredRecords.map((r) => (
                      <td
                        key={r.id}
                        className="py-1 px-1 text-center border-r border-slate-300 font-bold"
                      >
                        {row.perMeetingStatus[r.id] || '-'}
                      </td>
                    ))}

                    <td className="py-1 px-1 text-center border-r border-slate-300 font-bold text-green-800 bg-green-50/50">{row.hadir}</td>
                    <td className="py-1 px-1 text-center border-r border-slate-300 font-bold text-sky-800 bg-sky-50/50">{row.sakit}</td>
                    <td className="py-1 px-1 text-center border-r border-slate-300 font-bold text-amber-800 bg-amber-50/50">{row.izin}</td>
                    <td className="py-1 px-1 text-center border-r border-slate-300 font-bold text-red-800 bg-red-50/50">{row.alpa}</td>
                    <td className="py-1 px-1 text-center border-r border-slate-300 font-bold">{row.totalMeetings}</td>
                    <td className="py-1 px-1 text-center font-black text-blue-900 bg-blue-50/60">{row.persentase}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Print Summary Footer */}
          <div className="bg-slate-100 p-2 rounded border border-slate-300 text-xs flex items-center justify-between">
            <span className="font-bold text-slate-800">
              Akumulasi Kelas {selectedClass} &bull; Total Siswa: {classStudents.length} &bull; Hadir: {classSummary.totalHadir} &bull; Sakit: {classSummary.totalSakit} &bull; Izin: {classSummary.totalIzin} &bull; Alpa: {classSummary.totalAlpa}
            </span>
            <span className="font-black text-blue-900 bg-white px-2 py-0.5 rounded border border-slate-300">
              Rata-rata Kehadiran: {classSummary.avgPersentase}%
            </span>
          </div>
        </div>
      </PrintPreviewModal>
    </div>
  );
};
