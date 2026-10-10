import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  FileDown,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Calculator,
  Search,
  Check,
  AlertTriangle,
  Award,
  BookOpen,
  Info,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { Student, GradeItem, ComputedGradeItem, SchoolProfile } from '../types';
import { DEFAULT_SUBJECTS } from '../data/initialData';
import { computeGrade, formatNumberIndo } from '../utils/calculations';
import { exportGradesToExcel } from '../utils/excelExport';
import { exportGradesToPDF } from '../utils/pdfExport';
import { PrintPreviewModal } from './PrintPreviewModal';
import { GradeVisualizer } from './GradeVisualizer';

interface PenilaianViewProps {
  students: Student[];
  classes: string[];
  grades: GradeItem[];
  profile: SchoolProfile;
  onSaveGrade: (updatedGrades: GradeItem[]) => void;
}

export const PenilaianView: React.FC<PenilaianViewProps> = ({
  students,
  classes,
  grades,
  profile,
  onSaveGrade,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('Matematika');
  const [selectedClass, setSelectedClass] = useState<string>(classes[0] || 'XI-MIPA-1');
  const [selectedSemester, setSelectedSemester] = useState<'Ganjil' | 'Genap'>(profile.semesterAktif || 'Genap');
  const [selectedYear, setSelectedYear] = useState<string>(profile.tahunAjaranAktif || '2025/2026');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Notices
  const [showPrintPreview, setShowPrintPreview] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);

  // Filter students by selected class
  const classStudents = useMemo(() => {
    return students
      .filter((s) => s.kelas === selectedClass)
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }, [students, selectedClass]);

  // Local state of grade values for real-time editing
  // Map of studentId -> Partial<GradeItem>
  const [localGrades, setLocalGrades] = useState<Record<string, Partial<GradeItem>>>({});

  // Sync localGrades whenever class, subject, semester, year, or global grades change
  React.useEffect(() => {
    const map: Record<string, Partial<GradeItem>> = {};
    classStudents.forEach((student) => {
      const existing = grades.find(
        (g) =>
          g.studentId === student.id &&
          g.mataPelajaran === selectedSubject &&
          g.semester === selectedSemester &&
          g.tahunAjaran === selectedYear
      );

      if (existing) {
        map[student.id] = { ...existing };
      } else {
        map[student.id] = {
          studentId: student.id,
          kelas: selectedClass,
          mataPelajaran: selectedSubject,
          semester: selectedSemester,
          tahunAjaran: selectedYear,
          tugas1: null,
          tugas2: null,
          tugas3: null,
          tugas4: null,
          tugas5: null,
          psts: null,
          pas: null,
        };
      }
    });
    setLocalGrades(map);
  }, [selectedClass, selectedSubject, selectedSemester, selectedYear, classStudents, grades]);

  // Handle grade input change
  const handleScoreChange = (
    studentId: string,
    field: 'tugas1' | 'tugas2' | 'tugas3' | 'tugas4' | 'tugas5' | 'psts' | 'pas',
    valueStr: string
  ) => {
    let numVal: number | null = null;
    if (valueStr.trim() !== '') {
      const parsed = parseFloat(valueStr);
      if (!isNaN(parsed)) {
        numVal = Math.min(100, Math.max(0, parsed));
      }
    }

    setLocalGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        kelas: selectedClass,
        mataPelajaran: selectedSubject,
        semester: selectedSemester,
        tahunAjaran: selectedYear,
        [field]: numVal,
      },
    }));
  };

  // Compute computed grades for all students in class
  const computedList: ComputedGradeItem[] = useMemo(() => {
    return classStudents.map((student) => {
      const item = localGrades[student.id] || {
        studentId: student.id,
        kelas: selectedClass,
        mataPelajaran: selectedSubject,
        semester: selectedSemester,
        tahunAjaran: selectedYear,
        tugas1: null,
        tugas2: null,
        tugas3: null,
        tugas4: null,
        tugas5: null,
        psts: null,
        pas: null,
      };
      return computeGrade(item);
    });
  }, [classStudents, localGrades, selectedClass, selectedSubject, selectedSemester, selectedYear]);

  // Summary statistics calculation
  const statistics = useMemo(() => {
    const totalSiswa = computedList.length;
    if (totalSiswa === 0) {
      return {
        total: 0,
        rataKelas: 0,
        tuntas: 0,
        belumTuntas: 0,
        tuntasPercent: 0,
        nilaiTertinggi: 0,
        nilaiTerendah: 0,
      };
    }

    const totalNilaiAkhir = computedList.reduce((acc, g) => acc + g.nilaiAkhir, 0);
    const rataKelas = Number((totalNilaiAkhir / totalSiswa).toFixed(1));
    const tuntas = computedList.filter((g) => g.status === 'Tuntas').length;
    const belumTuntas = computedList.filter((g) => g.status === 'Belum Tuntas').length;
    const tuntasPercent = Number(((tuntas / totalSiswa) * 100).toFixed(1));
    const scores = computedList.map((g) => g.nilaiAkhir);
    const nilaiTertinggi = Math.max(...scores);
    const nilaiTerendah = Math.min(...scores);

    return {
      total: totalSiswa,
      rataKelas,
      tuntas,
      belumTuntas,
      tuntasPercent,
      nilaiTertinggi,
      nilaiTerendah,
    };
  }, [computedList]);

  // Save all current grades
  const handleSave = () => {
    const itemsToSave: GradeItem[] = computedList.map((g) => ({
      studentId: g.studentId,
      kelas: selectedClass,
      mataPelajaran: selectedSubject,
      semester: selectedSemester,
      tahunAjaran: selectedYear,
      tugas1: g.tugas1,
      tugas2: g.tugas2,
      tugas3: g.tugas3,
      tugas4: g.tugas4,
      tugas5: g.tugas5,
      psts: g.psts,
      pas: g.pas,
    }));

    onSaveGrade(itemsToSave);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  // Filtered by student name/NIS search
  const studentMap = useMemo(() => new Map(classStudents.map((s) => [s.id, s])), [classStudents]);

  const filteredComputed = useMemo(() => {
    if (!searchQuery.trim()) return computedList;
    const q = searchQuery.toLowerCase();
    return computedList.filter((g) => {
      const student = studentMap.get(g.studentId);
      return (
        student?.nama.toLowerCase().includes(q) ||
        student?.nis.toLowerCase().includes(q)
      );
    });
  }, [computedList, searchQuery, studentMap]);

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Banner */}
      <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1">
            {/* Subject Selector (Matematika & Matematika TL) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Mata Pelajaran
              </label>
              <select
                id="select-mapel-penilaian"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {DEFAULT_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Pilih Kelas
              </label>
              <select
                id="select-kelas-penilaian"
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

            {/* Semester */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Semester
              </label>
              <select
                id="select-semester-penilaian"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value as 'Ganjil' | 'Genap')}
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>

            {/* Tahun Ajaran */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Tahun Ajaran
              </label>
              <select
                id="select-tahun-penilaian"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="2025/2026">2025/2026</option>
                <option value="2024/2025">2024/2025</option>
                <option value="2026/2027">2026/2027</option>
              </select>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() =>
                exportGradesToPDF(
                  computedList,
                  students,
                  selectedClass,
                  selectedSubject,
                  selectedSemester,
                  selectedYear,
                  profile
                )
              }
              className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium hover:bg-slate-50 flex items-center gap-1.5 text-slate-700 transition-colors"
              title="Download File PDF Langsung"
            >
              <span className="w-2.5 h-2.5 bg-red-100 border border-red-400 rounded-xs" />
              <span>PDF</span>
            </button>

            <button
              onClick={() =>
                exportGradesToExcel(
                  computedList,
                  students,
                  selectedClass,
                  selectedSubject,
                  selectedSemester,
                  selectedYear,
                  profile
                )
              }
              className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium hover:bg-slate-50 flex items-center gap-1.5 text-slate-700 transition-colors"
              title="Download File MS Excel (.xlsx)"
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

        {/* Formula Information Banner */}
        <div className="bg-indigo-50/60 border border-indigo-100 rounded p-2 text-[11px] text-indigo-950 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
          <div className="flex-1 leading-snug">
            <span className="font-semibold">Bobot:</span> 40% Formatif (Rata-rata Tugas 1–5) + 30% PSTS + 30% PAS &bull;{' '}
            <strong>KKM:</strong> &ge; 75.0 (Tuntas) &bull;{' '}
            <strong>Predikat:</strong> A (&ge;90), B (&ge;75), C (&lt;75)
          </div>
        </div>
      </div>

      {/* Summary KPI Cards - High Density Style */}
      <div className="flex items-center justify-between shrink-0 flex-wrap gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">Rekap Penilaian Siswa</h2>
          <p className="text-xs text-slate-500">Mata Pelajaran: {selectedSubject} &bull; Kelas: {selectedClass}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-slate-50 border border-slate-200 p-2 rounded min-w-[100px]">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Siswa</div>
            <div className="text-lg font-bold text-slate-900 leading-tight">{statistics.total}</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-2 rounded min-w-[100px]">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Rata-rata</div>
            <div className="text-lg font-bold text-slate-900 leading-tight">{statistics.rataKelas}</div>
          </div>

          <div className="bg-green-50 border border-green-200 p-2 rounded min-w-[100px]">
            <div className="text-[9px] font-bold text-green-600 uppercase tracking-wider">Tuntas</div>
            <div className="text-lg font-bold text-green-700 leading-tight">{statistics.tuntas}</div>
          </div>

          <div className="bg-red-50 border border-red-200 p-2 rounded min-w-[100px]">
            <div className="text-[9px] font-bold text-red-600 uppercase tracking-wider">Remidi</div>
            <div className="text-lg font-bold text-red-700 leading-tight">{statistics.belumTuntas}</div>
          </div>
        </div>
      </div>

      {/* Visualisasi Data Statistik & Distribusi Nilai (Recharts) */}
      <GradeVisualizer
        grades={computedList}
        selectedClass={selectedClass}
        selectedSubject={selectedSubject}
        kkm={75}
      />

      {/* Main Grade Input Table */}
      <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
        {/* Table Top Bar */}
        <div className="px-3 py-2 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-50/70">
          <div className="text-xs font-bold text-slate-700">
            Daftar Nilai Siswa ({filteredComputed.length} Siswa)
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

            {/* Save Grade Button */}
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

        {/* Scrollable Grade Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-700">
              <tr>
                <th className="px-2 py-2.5 border-r border-slate-200 w-10 text-center font-bold">No</th>
                <th className="px-2 py-2.5 border-r border-slate-200 w-20 text-center font-bold">NIS</th>
                <th className="px-3 py-2.5 border-r border-slate-200 min-w-[170px] font-bold">Nama Siswa</th>
                <th className="px-1 py-2.5 border-r border-slate-200 w-12 text-center font-medium" title="Tugas 1">T1</th>
                <th className="px-1 py-2.5 border-r border-slate-200 w-12 text-center font-medium" title="Tugas 2">T2</th>
                <th className="px-1 py-2.5 border-r border-slate-200 w-12 text-center font-medium" title="Tugas 3">T3</th>
                <th className="px-1 py-2.5 border-r border-slate-200 w-12 text-center font-medium" title="Tugas 4">T4</th>
                <th className="px-1 py-2.5 border-r border-slate-200 w-12 text-center font-medium" title="Tugas 5">T5</th>
                <th className="px-2 py-2.5 border-r border-slate-200 w-16 text-center bg-indigo-50 font-bold text-indigo-900" title="Formatif (Rata-rata Tugas 1-5)">
                  Formatif
                </th>
                <th className="px-1 py-2.5 border-r border-slate-200 w-14 text-center font-medium" title="Penilaian Sumatif Tengah Semester">PSTS</th>
                <th className="px-1 py-2.5 border-r border-slate-200 w-14 text-center font-medium" title="Penilaian Akhir Semester">PAS</th>
                <th className="px-2 py-2.5 border-r border-slate-200 w-16 text-center bg-indigo-100 font-bold text-indigo-900">
                  Final
                </th>
                <th className="px-2 py-2.5 border-r border-slate-200 w-12 text-center font-bold">Pred</th>
                <th className="px-2 py-2.5 w-20 text-center font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredComputed.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-6 text-center text-slate-500 text-xs">
                    Tidak ada siswa ditemukan di kelas {selectedClass}.
                  </td>
                </tr>
              ) : (
                filteredComputed.map((grade, idx) => {
                  const student = studentMap.get(grade.studentId);
                  const isTuntas = grade.status === 'Tuntas';

                  return (
                    <tr
                      key={grade.studentId}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-2 py-1.5 border-r border-slate-100 text-center font-medium text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="px-2 py-1.5 border-r border-slate-100 text-center font-mono font-medium text-slate-500">
                        {student?.nis}
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-100 font-medium text-slate-800">
                        {student?.nama}
                      </td>

                      {/* Tugas 1 Input */}
                      <td className="px-1 py-1 border-r border-slate-100 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="-"
                          value={grade.tugas1 !== null ? grade.tugas1 : ''}
                          onChange={(e) =>
                            handleScoreChange(grade.studentId, 'tugas1', e.target.value)
                          }
                          className="w-11 text-center text-xs py-0.5 bg-white border border-slate-200 rounded focus:border-indigo-500 focus:outline-none"
                        />
                      </td>

                      {/* Tugas 2 Input */}
                      <td className="px-1 py-1 border-r border-slate-100 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="-"
                          value={grade.tugas2 !== null ? grade.tugas2 : ''}
                          onChange={(e) =>
                            handleScoreChange(grade.studentId, 'tugas2', e.target.value)
                          }
                          className="w-11 text-center text-xs py-0.5 bg-white border border-slate-200 rounded focus:border-indigo-500 focus:outline-none"
                        />
                      </td>

                      {/* Tugas 3 Input */}
                      <td className="px-1 py-1 border-r border-slate-100 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="-"
                          value={grade.tugas3 !== null ? grade.tugas3 : ''}
                          onChange={(e) =>
                            handleScoreChange(grade.studentId, 'tugas3', e.target.value)
                          }
                          className="w-11 text-center text-xs py-0.5 bg-white border border-slate-200 rounded focus:border-indigo-500 focus:outline-none"
                        />
                      </td>

                      {/* Tugas 4 Input */}
                      <td className="px-1 py-1 border-r border-slate-100 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="-"
                          value={grade.tugas4 !== null ? grade.tugas4 : ''}
                          onChange={(e) =>
                            handleScoreChange(grade.studentId, 'tugas4', e.target.value)
                          }
                          className="w-11 text-center text-xs py-0.5 bg-white border border-slate-200 rounded focus:border-indigo-500 focus:outline-none"
                        />
                      </td>

                      {/* Tugas 5 Input */}
                      <td className="px-1 py-1 border-r border-slate-100 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="-"
                          value={grade.tugas5 !== null ? grade.tugas5 : ''}
                          onChange={(e) =>
                            handleScoreChange(grade.studentId, 'tugas5', e.target.value)
                          }
                          className="w-11 text-center text-xs py-0.5 bg-white border border-slate-200 rounded focus:border-indigo-500 focus:outline-none"
                        />
                      </td>

                      {/* Rata-Rata Formatif (Otomatis dari rata-rata nilai tugas) */}
                      <td className="px-2 py-1.5 border-r border-slate-100 text-center bg-indigo-50/50 font-semibold text-slate-800" title="Rata-rata Tugas 1-5">
                        {grade.rataFormatif > 0 ? grade.rataFormatif : '-'}
                      </td>

                      {/* PSTS / PTS Input */}
                      <td className="px-1 py-1 border-r border-slate-100 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="-"
                          value={grade.psts !== null ? grade.psts : ''}
                          onChange={(e) =>
                            handleScoreChange(grade.studentId, 'psts', e.target.value)
                          }
                          className="w-11 text-center text-xs py-0.5 bg-white border border-slate-200 rounded focus:border-indigo-500 focus:outline-none"
                        />
                      </td>

                      {/* PAS / PSAT Input */}
                      <td className="px-1 py-1 border-r border-slate-100 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="-"
                          value={grade.pas !== null ? grade.pas : ''}
                          onChange={(e) =>
                            handleScoreChange(grade.studentId, 'pas', e.target.value)
                          }
                          className="w-11 text-center text-xs py-0.5 bg-white border border-slate-200 rounded focus:border-indigo-500 focus:outline-none"
                        />
                      </td>

                      {/* Nilai Akhir (Otomatis: 40% Formatif + 30% PTS + 30% PAS) */}
                      <td className="px-2 py-1.5 border-r border-slate-100 text-center bg-indigo-100/50 font-bold text-slate-900">
                        {grade.nilaiAkhir > 0 ? grade.nilaiAkhir : '-'}
                      </td>

                      {/* Predikat (A, B, C) */}
                      <td className="px-2 py-1.5 border-r border-slate-100 text-center font-bold">
                        <span
                          className={`${
                            grade.predikat === 'A'
                              ? 'text-green-700'
                              : grade.predikat === 'B'
                              ? 'text-indigo-700'
                              : 'text-red-700'
                          }`}
                        >
                          {grade.predikat}
                        </span>
                      </td>

                      {/* Status (Tuntas vs Belum Tuntas) */}
                      <td className="px-2 py-1.5 text-center">
                        <span
                          className={`font-bold uppercase text-[10px] ${
                            isTuntas
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {grade.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info and quick save bar */}
        <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3 text-slate-600 text-[11px]">
            <span>
              Dinilai: <strong className="text-slate-800">{computedList.filter((g) => g.nilaiAkhir > 0).length}</strong> / {computedList.length}
            </span>
            <span>
              Rata-rata: <strong className="text-indigo-900 font-bold">{statistics.rataKelas}</strong>
            </span>
            <span>
              Tuntas: <strong className="text-green-700 font-bold">{statistics.tuntas}</strong> ({statistics.tuntasPercent}%)
            </span>
          </div>

          <button
            onClick={handleSave}
            className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded shadow-2xs flex items-center gap-1 transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Simpan Nilai</span>
          </button>
        </div>
      </div>

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        title={`Daftar Nilai Capaian Hasil Belajar Peserta Didik - Kelas ${selectedClass}`}
        subTitle={`Kelas: ${selectedClass} | Mata Pelajaran: ${selectedSubject} | Semester: ${selectedSemester} | Tahun Ajaran: ${selectedYear}`}
        profile={profile}
        orientation="landscape"
        onDownloadPdf={() =>
          exportGradesToPDF(
            computedList,
            students,
            selectedClass,
            selectedSubject,
            selectedSemester,
            selectedYear,
            profile
          )
        }
        onDownloadExcel={() =>
          exportGradesToExcel(
            computedList,
            students,
            selectedClass,
            selectedSubject,
            selectedSemester,
            selectedYear,
            profile
          )
        }
      >
        <div className="space-y-4">
          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <p><strong className="font-semibold text-slate-700">Kelas / Rombel:</strong> Kelas {selectedClass}</p>
              <p><strong className="font-semibold text-slate-700">Mata Pelajaran:</strong> {selectedSubject}</p>
            </div>
            <div>
              <p><strong className="font-semibold text-slate-700">Semester / TA:</strong> {selectedSemester} / {selectedYear}</p>
              <p><strong className="font-semibold text-slate-700">Guru Pengampu:</strong> {profile.guru}</p>
            </div>
            <div>
              <p><strong className="font-semibold text-slate-700">KKM / Ketuntasan:</strong> 75.0</p>
              <p><strong className="font-semibold text-slate-700">Bobot:</strong> 40% Formatif (Rata-rata Tugas 1-5) + 30% PTS + 30% PAS</p>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left text-xs border border-slate-300 border-collapse">
            <thead className="bg-slate-200 text-slate-800 font-bold">
              <tr className="border-b border-slate-300 text-center">
                <th className="py-2 px-1 w-8 border-r border-slate-300">No</th>
                <th className="py-2 px-2 w-20 border-r border-slate-300">NIS</th>
                <th className="py-2 px-3 text-left border-r border-slate-300">Nama Siswa</th>
                <th className="py-2 px-1 w-10 border-r border-slate-300">Tug 1</th>
                <th className="py-2 px-1 w-10 border-r border-slate-300">Tug 2</th>
                <th className="py-2 px-1 w-10 border-r border-slate-300">Tug 3</th>
                <th className="py-2 px-1 w-10 border-r border-slate-300">Tug 4</th>
                <th className="py-2 px-1 w-10 border-r border-slate-300">Tug 5</th>
                <th className="py-2 px-1 w-16 border-r border-slate-300 bg-slate-300/40 font-bold">Rata Form</th>
                <th className="py-2 px-1 w-12 border-r border-slate-300">PSTS</th>
                <th className="py-2 px-1 w-12 border-r border-slate-300">PAS</th>
                <th className="py-2 px-2 w-16 border-r border-slate-300 bg-amber-200/50 font-black">Nilai Akhir</th>
                <th className="py-2 px-1 w-12 border-r border-slate-300">Predikat</th>
                <th className="py-2 px-2 w-20">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {computedList.map((g, idx) => {
                const s = studentMap.get(g.studentId);
                return (
                  <tr key={g.studentId} className={idx % 2 === 1 ? 'bg-slate-50/60' : ''}>
                    <td className="py-1 px-1 text-center border-r border-slate-300 text-slate-600">{idx + 1}</td>
                    <td className="py-1 px-2 text-center font-mono border-r border-slate-300 font-medium">{s?.nis}</td>
                    <td className="py-1 px-3 border-r border-slate-300 font-medium">{s?.nama}</td>
                    <td className="py-1 px-1 text-center border-r border-slate-300">{g.tugas1 ?? '-'}</td>
                    <td className="py-1 px-1 text-center border-r border-slate-300">{g.tugas2 ?? '-'}</td>
                    <td className="py-1 px-1 text-center border-r border-slate-300">{g.tugas3 ?? '-'}</td>
                    <td className="py-1 px-1 text-center border-r border-slate-300">{g.tugas4 ?? '-'}</td>
                    <td className="py-1 px-1 text-center border-r border-slate-300">{g.tugas5 ?? '-'}</td>
                    <td className="py-1 px-1 text-center border-r border-slate-300 font-bold bg-slate-100">{g.rataFormatif}</td>
                    <td className="py-1 px-1 text-center border-r border-slate-300">{g.psts ?? '-'}</td>
                    <td className="py-1 px-1 text-center border-r border-slate-300">{g.pas ?? '-'}</td>
                    <td className="py-1 px-2 text-center border-r border-slate-300 font-black text-blue-900 bg-amber-50">{g.nilaiAkhir}</td>
                    <td className="py-1 px-1 text-center border-r border-slate-300 font-bold">{g.predikat}</td>
                    <td className="py-1 px-2 text-center font-bold">
                      <span className={g.status === 'Tuntas' ? 'text-emerald-700' : 'text-rose-700'}>
                        {g.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Statistical Summary Footer */}
          <div className="bg-slate-100 p-2.5 rounded border border-slate-300 text-xs flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-slate-800">
              Statistik Kelas {selectedClass}: Total Siswa: {statistics.total} | Rata-rata Kelas: {statistics.rataKelas} | Tuntas (&ge; 75): {statistics.tuntas} ({statistics.tuntasPercent}%) | Belum Tuntas (&lt; 75): {statistics.belumTuntas}
            </span>
            <span className="text-[11px] text-slate-600 font-medium">
              Bobot: 40% Formatif (Rata-rata Tugas 1–5) + 30% PSTS + 30% PAS &bull; Predikat: A (&ge;90) | B (&ge;75) | C (&lt;75)
            </span>
          </div>
        </div>
      </PrintPreviewModal>
    </div>
  );
};
