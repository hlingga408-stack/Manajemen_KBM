import * as XLSX from 'xlsx';
import { Student, AttendanceRecord, ComputedGradeItem, TeachingAgenda, SchoolProfile } from '../types';
import { formatDateIndo, formatNumberIndo, getTodayDateIndo } from './calculations';

export function exportAttendanceToExcel(
  record: AttendanceRecord,
  students: Student[],
  profile: SchoolProfile
) {
  const sortedStudents = [...students].sort((a, b) => a.nama.localeCompare(b.nama));
  
  const hadirCount = sortedStudents.filter(s => record.entries[s.id] === 'H').length;
  const sakitCount = sortedStudents.filter(s => record.entries[s.id] === 'S').length;
  const izinCount = sortedStudents.filter(s => record.entries[s.id] === 'I').length;
  const alpaCount = sortedStudents.filter(s => record.entries[s.id] === 'A').length;
  const total = sortedStudents.length;

  const rows: any[][] = [];

  // Kop Header
  rows.push([profile.yayasan.toUpperCase()]);
  rows.push([profile.namaSekolah.toUpperCase()]);
  rows.push([profile.alamat]);
  rows.push([]);
  rows.push(['DAFTAR KEHADIRAN / PRESENSI SISWA']);
  rows.push([]);
  
  // Metadata
  rows.push(['Mata Pelajaran', ':', record.mataPelajaran, '', 'Pertemuan Ke', ':', record.pertemuanKe]);
  rows.push(['Kelas', ':', record.kelas, '', 'Hari / Tanggal', ':', formatDateIndo(record.tanggal)]);
  rows.push(['Semester / T.A', ':', `${profile.semesterAktif} / ${profile.tahunAjaranAktif}`, '', 'Guru Pengampu', ':', profile.guru]);
  rows.push([]);

  // Table Headers
  rows.push(['NO', 'NIS', 'NAMA PESERTA DIDIK', 'L/P', 'STATUS KEHADIRAN', 'KETERANGAN']);

  // Table Data
  sortedStudents.forEach((student, index) => {
    const status = record.entries[student.id] || 'H';
    let statusText = 'Hadir';
    if (status === 'S') statusText = 'Sakit';
    if (status === 'I') statusText = 'Izin';
    if (status === 'A') statusText = 'Alpa';

    rows.push([
      index + 1,
      student.nis,
      student.nama,
      student.gender || '-',
      statusText,
      status === 'H' ? 'Mengikuti KBM' : statusText,
    ]);
  });

  // Summary
  rows.push([]);
  rows.push(['RINGKASAN KEHADIRAN:']);
  rows.push(['Total Siswa', total, 'Hadir', hadirCount, 'Sakit', sakitCount, 'Izin', izinCount, 'Alpa', alpaCount]);
  rows.push(['Persentase Kehadiran', total > 0 ? `${((hadirCount / total) * 100).toFixed(1)}%` : '0%']);
  if (record.catatan) {
    rows.push(['Catatan KBM', record.catatan]);
  }
  rows.push([]);
  rows.push([]);

  // Signatures
  rows.push([
    'Mengetahui,',
    '',
    '',
    '',
    `Cibinong, ${getTodayDateIndo()}`,
  ]);
  rows.push([
    'Kepala Sekolah',
    '',
    '',
    '',
    'Guru Mata Pelajaran,',
  ]);
  rows.push([]);
  rows.push([]);
  rows.push([]);
  rows.push([
    profile.kepalaSekolah,
    '',
    '',
    '',
    profile.guru,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 14 }, // NIS
    { wch: 32 }, // Nama
    { wch: 8 },  // L/P
    { wch: 18 }, // Status
    { wch: 25 }, // Keterangan
    { wch: 15 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Presensi_${record.kelas}`);
  
  const fileName = `Presensi_${record.kelas}_${record.mataPelajaran.replace(/\s+/g, '_')}_${record.tanggal}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportAttendanceRekapToExcel(
  records: AttendanceRecord[],
  students: Student[],
  kelas: string,
  mataPelajaran: string,
  startDate: string,
  endDate: string,
  profile: SchoolProfile
) {
  const sortedStudents = [...students].sort((a, b) => a.nama.localeCompare(b.nama));
  const sortedRecords = [...records].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

  const rows: any[][] = [];

  // Kop Header
  rows.push([profile.yayasan.toUpperCase()]);
  rows.push([profile.namaSekolah.toUpperCase()]);
  rows.push([profile.alamat]);
  rows.push([]);
  rows.push([`REKAPITULASI PRESENSI & KEHADIRAN SISWA - KELAS ${kelas.toUpperCase()}`]);
  rows.push([]);

  // Metadata
  rows.push(['Kelas', ':', kelas, '', 'Periode Rekap', ':', `${formatDateIndo(startDate)} s.d. ${formatDateIndo(endDate)}`]);
  rows.push(['Mata Pelajaran', ':', mataPelajaran, '', 'Semester / T.A', ':', `${profile.semesterAktif} / ${profile.tahunAjaranAktif}`]);
  rows.push(['Guru Pengampu', ':', profile.guru, '', 'Total Pertemuan', ':', `${records.length} Pertemuan`]);
  rows.push([]);

  // Table Headers
  const headerRow: string[] = ['NO', 'NIS', 'NAMA PESERTA DIDIK', 'L/P'];
  sortedRecords.forEach((r, idx) => {
    headerRow.push(`P${r.pertemuanKe || idx + 1} (${r.tanggal})`);
  });
  headerRow.push('HADIR (H)', 'SAKIT (S)', 'IZIN (I)', 'ALPA (A)', 'TOTAL', '% KEHADIRAN');
  rows.push(headerRow);

  let totalH = 0;
  let totalS = 0;
  let totalI = 0;
  let totalA = 0;

  // Table Data
  sortedStudents.forEach((student, index) => {
    let sH = 0;
    let sS = 0;
    let sI = 0;
    let sA = 0;

    const row: any[] = [
      index + 1,
      student.nis,
      student.nama,
      student.gender || '-',
    ];

    sortedRecords.forEach((r) => {
      const st = r.entries[student.id] || '-';
      if (st === 'H') { sH++; totalH++; }
      else if (st === 'S') { sS++; totalS++; }
      else if (st === 'I') { sI++; totalI++; }
      else if (st === 'A') { sA++; totalA++; }
      row.push(st);
    });

    const studentTotal = sortedRecords.length;
    const pct = studentTotal > 0 ? Number(((sH / studentTotal) * 100).toFixed(1)) : 0;

    row.push(sH, sS, sI, sA, studentTotal, `${pct}%`);
    rows.push(row);
  });

  const totalEntries = sortedStudents.length * (sortedRecords.length || 1);
  const classAvgPct = totalEntries > 0 ? ((totalH / totalEntries) * 100).toFixed(1) : '0';

  // Summary
  rows.push([]);
  rows.push(['RINGKASAN AKUMULASI KELAS:']);
  rows.push(['Total Siswa', sortedStudents.length, 'Total Pertemuan', sortedRecords.length]);
  rows.push(['Akumulasi Hadir (H)', totalH, 'Akumulasi Sakit (S)', totalS, 'Akumulasi Izin (I)', totalI, 'Akumulasi Alpa (A)', totalA]);
  rows.push(['Rata-Rata Kehadiran Kelas', `${classAvgPct}%`]);
  rows.push([]);
  rows.push([]);

  // Signatures
  rows.push([
    'Mengetahui,',
    '',
    '',
    '',
    `Cibinong, ${getTodayDateIndo()}`,
  ]);
  rows.push([
    'Kepala Sekolah',
    '',
    '',
    '',
    'Guru Mata Pelajaran,',
  ]);
  rows.push([]);
  rows.push([]);
  rows.push([]);
  rows.push([
    profile.kepalaSekolah,
    '',
    '',
    '',
    profile.guru,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  const colWidths = [
    { wch: 6 },
    { wch: 14 },
    { wch: 32 },
    { wch: 8 },
  ];
  sortedRecords.forEach(() => colWidths.push({ wch: 14 }));
  colWidths.push({ wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 15 });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap_${kelas}`);

  const fileName = `Rekap_Presensi_${kelas}_${mataPelajaran.replace(/\s+/g, '_')}_${startDate}_sd_${endDate}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportGradesToExcel(
  grades: ComputedGradeItem[],
  students: Student[],
  kelas: string,
  mataPelajaran: string,
  semester: string,
  tahunAjaran: string,
  profile: SchoolProfile
) {
  const studentMap = new Map(students.map(s => [s.id, s]));
  const sortedGrades = [...grades].sort((a, b) => {
    const sA = studentMap.get(a.studentId);
    const sB = studentMap.get(b.studentId);
    return (sA?.nama || '').localeCompare(sB?.nama || '');
  });

  const totalSiswa = sortedGrades.length;
  const avgClass = totalSiswa > 0
    ? sortedGrades.reduce((acc, g) => acc + g.nilaiAkhir, 0) / totalSiswa
    : 0;
  const tuntasCount = sortedGrades.filter(g => g.status === 'Tuntas').length;
  const belumTuntasCount = sortedGrades.filter(g => g.status === 'Belum Tuntas').length;

  const rows: any[][] = [];

  // Kop Header
  rows.push([profile.yayasan.toUpperCase()]);
  rows.push([profile.namaSekolah.toUpperCase()]);
  rows.push([profile.alamat]);
  rows.push([]);
  rows.push(['DAFTAR NILAI CAPAIAN HASIL BELAJAR PESERTA DIDIK']);
  rows.push([]);

  // Metadata
  rows.push(['Mata Pelajaran', ':', mataPelajaran, '', 'Semester / T.A', ':', `${semester} / ${tahunAjaran}`]);
  rows.push(['Kelas', ':', kelas, '', 'KKM / Kriteria Ketuntasan', ':', '75.0']);
  rows.push(['Guru Pengampu', ':', profile.guru, '', 'Tanggal Cetak', ':', getTodayDateIndo()]);
  rows.push([]);

  // Table Headers
  rows.push([
    'NO',
    'NIS',
    'NAMA SISWA',
    'TUGAS 1',
    'TUGAS 2',
    'TUGAS 3',
    'TUGAS 4',
    'TUGAS 5',
    'RATA FORMATIF',
    'PSTS (PTS)',
    'PAS / PSAT',
    'NILAI AKHIR (40%F+30%PTS+30%PAS)',
    'PREDIKAT',
    'STATUS KETUNTASAN',
  ]);

  // Table Data
  sortedGrades.forEach((g, index) => {
    const student = studentMap.get(g.studentId);
    rows.push([
      index + 1,
      student?.nis || '-',
      student?.nama || '-',
      g.tugas1 ?? '-',
      g.tugas2 ?? '-',
      g.tugas3 ?? '-',
      g.tugas4 ?? '-',
      g.tugas5 ?? '-',
      g.rataFormatif,
      g.psts ?? '-',
      g.pas ?? '-',
      g.nilaiAkhir,
      g.predikat,
      g.status,
    ]);
  });

  // Summary
  rows.push([]);
  rows.push(['STATISTIK NILAI KELAS:']);
  rows.push(['Total Siswa Dinilai', totalSiswa]);
  rows.push(['Rata-Rata Nilai Akhir Kelas', Number(avgClass.toFixed(1))]);
  rows.push(['Jumlah Siswa Tuntas (Nilai >= 75)', tuntasCount, `${totalSiswa > 0 ? ((tuntasCount / totalSiswa) * 100).toFixed(1) : 0}%`]);
  rows.push(['Jumlah Siswa Belum Tuntas (Nilai < 75)', belumTuntasCount, `${totalSiswa > 0 ? ((belumTuntasCount / totalSiswa) * 100).toFixed(1) : 0}%`]);
  rows.push(['Keterangan Bobot', '40% Nilai Rata-rata Formatif (Tugas 1-5) + 30% PSTS + 30% PAS/PSAT']);
  rows.push(['Predikat Nilai', 'A: >= 90 | B: >= 75 | C: < 75']);
  rows.push([]);
  rows.push([]);

  // Signatures
  rows.push([
    'Mengetahui,',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    `Cibinong, ${getTodayDateIndo()}`,
  ]);
  rows.push([
    'Kepala Sekolah',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'Guru Mata Pelajaran,',
  ]);
  rows.push([]);
  rows.push([]);
  rows.push([]);
  rows.push([
    profile.kepalaSekolah,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    profile.guru,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 30 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 25 },
    { wch: 10 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Nilai_${kelas}`);
  
  const fileName = `Daftar_Nilai_${kelas}_${mataPelajaran.replace(/\s+/g, '_')}_Sem_${semester}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportAgendaToExcel(
  agendaList: TeachingAgenda[],
  profile: SchoolProfile,
  filterKelas?: string,
  filterSubject?: string
) {
  const rows: any[][] = [];

  rows.push([profile.yayasan.toUpperCase()]);
  rows.push([profile.namaSekolah.toUpperCase()]);
  rows.push([profile.alamat]);
  rows.push([]);
  rows.push(['AGENDA HARIAN DAN JURNAL MENGAJAR GURU']);
  rows.push([]);

  rows.push(['Guru Pengampu', ':', profile.guru, '', 'Semester / T.A', ':', `${profile.semesterAktif} / ${profile.tahunAjaranAktif}`]);
  if (filterKelas) rows.push(['Filter Kelas', ':', filterKelas]);
  if (filterSubject) rows.push(['Filter Mata Pelajaran', ':', filterSubject]);
  rows.push(['Tanggal Cetak', ':', getTodayDateIndo()]);
  rows.push([]);

  // Table Headers
  rows.push([
    'NO',
    'HARI / TANGGAL',
    'JAM KE',
    'KELAS',
    'MATA PELAJARAN',
    'JUDUL MATERI / TOPIK PEMBELAJARAN',
    'MODEL PEMBELAJARAN',
    'CATATAN / REFLEKSI KBM',
    'KEHADIRAN (H/S/I/A)',
  ]);

  agendaList.forEach((ag, index) => {
    const k = ag.kehadiranRingkasan;
    const kehadiranStr = k ? `H:${k.hadir} S:${k.sakit} I:${k.izin} A:${k.alpa}` : '-';

    rows.push([
      index + 1,
      formatDateIndo(ag.tanggal),
      ag.jamKe,
      ag.kelas,
      ag.mataPelajaran,
      ag.materi,
      ag.modelPembelajaran,
      ag.catatan,
      kehadiranStr,
    ]);
  });

  rows.push([]);
  rows.push([]);
  rows.push([
    'Mengetahui,',
    '',
    '',
    '',
    '',
    `Cibinong, ${getTodayDateIndo()}`,
  ]);
  rows.push([
    'Kepala Sekolah',
    '',
    '',
    '',
    '',
    'Guru Mata Pelajaran,',
  ]);
  rows.push([]);
  rows.push([]);
  rows.push([]);
  rows.push([
    profile.kepalaSekolah,
    '',
    '',
    '',
    '',
    profile.guru,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 18 },
    { wch: 12 },
    { wch: 18 },
    { wch: 35 },
    { wch: 28 },
    { wch: 35 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Agenda_Mengajar');

  const fileName = `Agenda_Mengajar_${profile.namaSekolah.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
