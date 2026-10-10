import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, AttendanceRecord, ComputedGradeItem, TeachingAgenda, SchoolProfile } from '../types';
import { formatDateIndo, formatNumberIndo, getTodayDateIndo } from './calculations';

// Helper to convert SVG to canvas image data URL for jsPDF
function createLogoPngDataUrl(): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    // Draw high quality school crest
    const cx = 80;
    const cy = 80;

    // Background circle
    ctx.beginPath();
    ctx.arc(cx, cy, 74, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e3a8a';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(cx, cy, 66, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1e3a8a';
    ctx.stroke();

    // Blue shield
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(110, 50);
    ctx.lineTo(105, 105);
    ctx.lineTo(80, 126);
    ctx.lineTo(55, 105);
    ctx.closePath();
    ctx.fillStyle = '#0284c7';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#1e3a8a';
    ctx.stroke();

    // Torch
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(76, 70, 8, 26);
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(80, 48, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(80, 50, 8, 0, Math.PI * 2);
    ctx.fill();

    // Text banner
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(35, 124, 90, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PGRI PLUS', 80, 137);

    // Text top
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('SMA PLUS PGRI', 80, 28);
    ctx.fillText('CIBINONG', 80, 40);

    resolve(canvas.toDataURL('image/png'));
  });
}

function drawKop(
  doc: jsPDF,
  profile: SchoolProfile,
  logoDataUrl: string,
  docTitle: string,
  isLandscape = false
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const leftMargin = 14;
  const rightMargin = pageWidth - 14;

  // Draw School Logo
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', leftMargin, 10, 22, 22);
    } catch {
      // fallback if image fail
    }
  }

  // Header texts
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(profile.yayasan.toUpperCase(), pageWidth / 2 + 5, 14, { align: 'center' });

  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138); // Navy blue
  doc.text(profile.namaSekolah.toUpperCase(), pageWidth / 2 + 5, 21, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(profile.alamat, pageWidth / 2 + 5, 27, { align: 'center' });
  doc.text('Akreditasi "A" (Unggul) | Website: smapluspgricibinong.sch.id | Email: info@smapluspgri.sch.id', pageWidth / 2 + 5, 31, { align: 'center' });

  // Double divider line
  doc.setLineWidth(1.2);
  doc.setDrawColor(30, 58, 138);
  doc.line(leftMargin, 35, rightMargin, 35);
  doc.setLineWidth(0.4);
  doc.setDrawColor(100, 116, 139);
  doc.line(leftMargin, 36.5, rightMargin, 36.5);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(docTitle.toUpperCase(), pageWidth / 2, 44, { align: 'center' });

  return 48; // Y position after kop
}

function drawSignatures(doc: jsPDF, profile: SchoolProfile, startY: number) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  let sigY = startY + 15;
  if (sigY + 45 > pageHeight) {
    doc.addPage();
    sigY = 25;
  }

  const leftX = 25;
  const rightX = pageWidth - 65;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);

  // Left (Kepala Sekolah)
  doc.text('Mengetahui,', leftX, sigY);
  doc.text('Kepala Sekolah', leftX, sigY + 5);

  // Right (Guru)
  doc.text(`Cibinong, ${getTodayDateIndo()}`, rightX, sigY);
  doc.text('Guru Mata Pelajaran,', rightX, sigY + 5);

  // Space for physical signature / stempel
  const nameY = sigY + 28;

  doc.setFont('helvetica', 'bold');
  doc.text(profile.kepalaSekolah, leftX, nameY);
  doc.text(profile.guru, rightX, nameY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  if (profile.nipKepalaSekolah) {
    doc.text(`NIP. ${profile.nipKepalaSekolah}`, leftX, nameY + 4);
  }
  if (profile.nipGuru) {
    doc.text(`NIP. ${profile.nipGuru}`, rightX, nameY + 4);
  }
}

export async function exportAttendanceToPDF(
  record: AttendanceRecord,
  students: Student[],
  profile: SchoolProfile
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const logoDataUrl = await createLogoPngDataUrl();
  const startY = drawKop(doc, profile, logoDataUrl, 'Laporan Presensi & Kehadiran Siswa', false);

  // Metadata block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  const col1X = 14;
  const col2X = 110;

  doc.setFont('helvetica', 'bold');
  doc.text(`Kelas          : ${record.kelas}`, col1X, startY + 2);
  doc.setFont('helvetica', 'normal');
  doc.text(`Mata Pelajaran : ${record.mataPelajaran}`, col1X, startY + 7);
  doc.text(`Semester / TA  : ${profile.semesterAktif} / ${profile.tahunAjaranAktif}`, col1X, startY + 12);

  doc.text(`Pertemuan Ke   : ${record.pertemuanKe}`, col2X, startY + 2);
  doc.text(`Hari / Tanggal : ${formatDateIndo(record.tanggal)}`, col2X, startY + 7);
  doc.text(`Guru Pengampu  : ${profile.guru}`, col2X, startY + 12);

  const sortedStudents = [...students].sort((a, b) => a.nama.localeCompare(b.nama));
  const hadirCount = sortedStudents.filter(s => record.entries[s.id] === 'H').length;
  const sakitCount = sortedStudents.filter(s => record.entries[s.id] === 'S').length;
  const izinCount = sortedStudents.filter(s => record.entries[s.id] === 'I').length;
  const alpaCount = sortedStudents.filter(s => record.entries[s.id] === 'A').length;

  const tableData = sortedStudents.map((s, idx) => {
    const st = record.entries[s.id] || 'H';
    let label = 'Hadir (H)';
    if (st === 'S') label = 'Sakit (S)';
    if (st === 'I') label = 'Izin (I)';
    if (st === 'A') label = 'Alpa (A)';

    return [
      idx + 1,
      s.nis,
      s.nama,
      s.gender || '-',
      label,
      st === 'H' ? 'Mengikuti KBM Penuh' : `Keterangan: ${label}`,
    ];
  });

  autoTable(doc, {
    startY: startY + 17,
    head: [['No', 'NIS', 'Nama Siswa', 'L/P', 'Status Kehadiran', 'Keterangan']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8.5,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 22 },
      2: { cellWidth: 65 },
      3: { halign: 'center', cellWidth: 12 },
      4: { halign: 'center', cellWidth: 32 },
      5: { cellWidth: 41 },
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  const lastY = (doc as any).lastAutoTable.finalY || startY + 80;

  // Mini summary box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, lastY + 3, 182, 10, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Kelas: ${record.kelas} | Total: ${sortedStudents.length} Siswa | Hadir: ${hadirCount} | Sakit: ${sakitCount} | Izin: ${izinCount} | Alpa: ${alpaCount} | Kehadiran: ${((hadirCount / (sortedStudents.length || 1)) * 100).toFixed(1)}%`,
    18,
    lastY + 9.5
  );

  drawSignatures(doc, profile, lastY + 16);

  doc.save(`Presensi_Kelas_${record.kelas}_${record.tanggal}.pdf`);
}

export async function exportAttendanceRekapToPDF(
  records: AttendanceRecord[],
  students: Student[],
  kelas: string,
  mataPelajaran: string,
  startDate: string,
  endDate: string,
  profile: SchoolProfile
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const logoDataUrl = await createLogoPngDataUrl();
  const startY = drawKop(doc, profile, logoDataUrl, `Rekapitulasi Presensi & Kehadiran Siswa - Kelas ${kelas}`, true);

  // Metadata block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  const col1X = 14;
  const col2X = 110;
  const col3X = 200;

  doc.setFont('helvetica', 'bold');
  doc.text(`Kelas          : ${kelas}`, col1X, startY + 2);
  doc.setFont('helvetica', 'normal');
  doc.text(`Mata Pelajaran : ${mataPelajaran}`, col1X, startY + 7);

  doc.text(`Periode Rekap  : ${formatDateIndo(startDate)} s.d. ${formatDateIndo(endDate)}`, col2X, startY + 2);
  doc.text(`Semester / TA  : ${profile.semesterAktif} / ${profile.tahunAjaranAktif}`, col2X, startY + 7);

  doc.text(`Guru Pengampu  : ${profile.guru}`, col3X, startY + 2);
  doc.text(`Total Pertemuan: ${records.length} Pertemuan KBM`, col3X, startY + 7);

  const sortedStudents = [...students].sort((a, b) => a.nama.localeCompare(b.nama));
  const sortedRecords = [...records].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

  // Build Table Headers: No, NIS, Nama, L/P, [P1, P2, ...], H, S, I, A, %
  const headRow: string[] = ['No', 'NIS', 'Nama Siswa', 'L/P'];
  sortedRecords.forEach((r, idx) => {
    const d = new Date(r.tanggal);
    const dayStr = `${d.getDate()}/${d.getMonth() + 1}`;
    headRow.push(`P${r.pertemuanKe || idx + 1}\n${dayStr}`);
  });
  headRow.push('H', 'S', 'I', 'A', 'Total', '% Hadir');

  // Build Table Body
  const bodyRows: any[][] = [];
  let totalH = 0;
  let totalS = 0;
  let totalI = 0;
  let totalA = 0;

  sortedStudents.forEach((student, sIdx) => {
    let sH = 0;
    let sS = 0;
    let sI = 0;
    let sA = 0;

    const row: any[] = [
      sIdx + 1,
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

    const studentTotalMeetings = sortedRecords.length;
    const pct = studentTotalMeetings > 0 ? ((sH / studentTotalMeetings) * 100).toFixed(1) : '0.0';

    row.push(sH, sS, sI, sA, studentTotalMeetings, `${pct}%`);
    bodyRows.push(row);
  });

  const totalEntries = sortedStudents.length * (sortedRecords.length || 1);
  const classAvgPct = totalEntries > 0 ? ((totalH / totalEntries) * 100).toFixed(1) : '0.0';

  autoTable(doc, {
    startY: startY + 12,
    head: [headRow],
    body: bodyRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'center', cellWidth: 20 },
      2: { cellWidth: 50 },
      3: { halign: 'center', cellWidth: 10 },
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  const lastY = (doc as any).lastAutoTable.finalY || startY + 80;

  // Rekap Summary Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, lastY + 3, 269, 9, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Akumulasi Kelas ${kelas} | Total Siswa: ${sortedStudents.length} | Total Hadir (H): ${totalH} | Sakit (S): ${totalS} | Izin (I): ${totalI} | Alpa (A): ${totalA} | Rata-rata Kehadiran: ${classAvgPct}%`,
    18,
    lastY + 9
  );

  drawSignatures(doc, profile, lastY + 15);

  doc.save(`Rekap_Presensi_Kelas_${kelas}_${startDate}_sd_${endDate}.pdf`);
}

export async function exportGradesToPDF(
  grades: ComputedGradeItem[],
  students: Student[],
  kelas: string,
  mataPelajaran: string,
  semester: string,
  tahunAjaran: string,
  profile: SchoolProfile
) {
  // Use Landscape for complete grade table width
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const logoDataUrl = await createLogoPngDataUrl();
  const startY = drawKop(doc, profile, logoDataUrl, 'Daftar Nilai Capaian Hasil Belajar Peserta Didik', true);

  const studentMap = new Map(students.map(s => [s.id, s]));
  const sortedGrades = [...grades].sort((a, b) => {
    const sA = studentMap.get(a.studentId);
    const sB = studentMap.get(b.studentId);
    return (sA?.nama || '').localeCompare(sB?.nama || '');
  });

  // Metadata row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  const col1X = 14;
  const col2X = 110;
  const col3X = 200;

  doc.text(`Mata Pelajaran : ${mataPelajaran}`, col1X, startY + 2);
  doc.text(`Kelas          : ${kelas}`, col1X, startY + 7);

  doc.text(`Semester / TA  : ${semester} / ${tahunAjaran}`, col2X, startY + 2);
  doc.text(`Guru Pengampu  : ${profile.guru}`, col2X, startY + 7);

  doc.text(`KKM / Kriteria : 75.0`, col3X, startY + 2);
  doc.text(`Bobot Nilai    : 40% Formatif (Rata-rata Tugas 1-5) + 30% PSTS + 30% PAS`, col3X, startY + 7);

  const totalSiswa = sortedGrades.length;
  const avgClass = totalSiswa > 0
    ? sortedGrades.reduce((acc, g) => acc + g.nilaiAkhir, 0) / totalSiswa
    : 0;
  const tuntasCount = sortedGrades.filter(g => g.status === 'Tuntas').length;
  const belumTuntasCount = sortedGrades.filter(g => g.status === 'Belum Tuntas').length;

  const tableData = sortedGrades.map((g, idx) => {
    const s = studentMap.get(g.studentId);
    return [
      idx + 1,
      s?.nis || '-',
      s?.nama || '-',
      g.tugas1 !== null ? g.tugas1 : '-',
      g.tugas2 !== null ? g.tugas2 : '-',
      g.tugas3 !== null ? g.tugas3 : '-',
      g.tugas4 !== null ? g.tugas4 : '-',
      g.tugas5 !== null ? g.tugas5 : '-',
      g.rataFormatif,
      g.psts !== null ? g.psts : '-',
      g.pas !== null ? g.pas : '-',
      g.nilaiAkhir,
      g.predikat,
      g.status,
    ];
  });

  autoTable(doc, {
    startY: startY + 12,
    head: [[
      'No',
      'NIS',
      'Nama Siswa',
      'Tugas 1',
      'Tugas 2',
      'Tugas 3',
      'Tugas 4',
      'Tugas 5',
      'Rata Formatif',
      'PSTS (PTS)',
      'PAS/PSAT',
      'Nilai Akhir',
      'Predikat',
      'Status',
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'center', cellWidth: 20 },
      2: { cellWidth: 54 },
      3: { halign: 'center', cellWidth: 14 },
      4: { halign: 'center', cellWidth: 14 },
      5: { halign: 'center', cellWidth: 14 },
      6: { halign: 'center', cellWidth: 14 },
      7: { halign: 'center', cellWidth: 14 },
      8: { halign: 'center', cellWidth: 22, fontStyle: 'bold' },
      9: { halign: 'center', cellWidth: 16 },
      10: { halign: 'center', cellWidth: 16 },
      11: { halign: 'center', cellWidth: 20, fontStyle: 'bold', textColor: [30, 58, 138] },
      12: { halign: 'center', cellWidth: 14, fontStyle: 'bold' },
      13: { halign: 'center', cellWidth: 22 },
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  const lastY = (doc as any).lastAutoTable.finalY || startY + 80;

  // Summary box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, lastY + 3, 269, 9, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Total Siswa: ${totalSiswa} | Rata-rata Kelas: ${avgClass.toFixed(1)} | Tuntas (>= 75): ${tuntasCount} (${((tuntasCount / (totalSiswa || 1)) * 100).toFixed(1)}%) | Belum Tuntas (< 75): ${belumTuntasCount} | Predikat: A (>=90), B (>=75), C (<75)`,
    18,
    lastY + 9
  );

  drawSignatures(doc, profile, lastY + 15);

  doc.save(`Daftar_Nilai_${kelas}_${mataPelajaran.replace(/\s+/g, '_')}_Sem_${semester}.pdf`);
}

export async function exportAgendaToPDF(
  agendaList: TeachingAgenda[],
  profile: SchoolProfile,
  filterKelas?: string,
  filterSubject?: string
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const logoDataUrl = await createLogoPngDataUrl();
  const startY = drawKop(doc, profile, logoDataUrl, 'Jurnal & Agenda Harian Mengajar Guru', true);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  doc.text(`Guru Pengampu  : ${profile.guru}`, 14, startY + 2);
  doc.text(`Semester / TA  : ${profile.semesterAktif} / ${profile.tahunAjaranAktif}`, 14, startY + 7);
  if (filterKelas) doc.text(`Filter Kelas   : ${filterKelas}`, 140, startY + 2);
  if (filterSubject) doc.text(`Mata Pelajaran : ${filterSubject}`, 140, startY + 7);

  const tableData = agendaList.map((ag, idx) => {
    const k = ag.kehadiranRingkasan;
    const kehadiranStr = k ? `H:${k.hadir} S:${k.sakit} I:${k.izin} A:${k.alpa}` : '-';

    return [
      idx + 1,
      formatDateIndo(ag.tanggal),
      ag.jamKe,
      ag.kelas,
      ag.mataPelajaran,
      ag.materi,
      ag.modelPembelajaran,
      ag.catatan,
      kehadiranStr,
    ];
  });

  autoTable(doc, {
    startY: startY + 12,
    head: [[
      'No',
      'Hari / Tanggal',
      'Jam Ke',
      'Kelas',
      'Mata Pelajaran',
      'Judul Materi / Topik Pelajaran',
      'Model Pembelajaran',
      'Catatan / Refleksi Mengajar',
      'Presensi',
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8.5,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 26 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 16 },
      4: { cellWidth: 26 },
      5: { cellWidth: 50 },
      6: { cellWidth: 38 },
      7: { cellWidth: 62 },
      8: { halign: 'center', cellWidth: 22 },
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  const lastY = (doc as any).lastAutoTable.finalY || startY + 80;
  drawSignatures(doc, profile, lastY + 15);

  doc.save(`Agenda_Mengajar_Guru_${new Date().toISOString().split('T')[0]}.pdf`);
}
