import { GradeItem, ComputedGradeItem } from '../types';

export function computeGrade(grade: Partial<GradeItem>): ComputedGradeItem {
  const tugasList = [grade.tugas1, grade.tugas2, grade.tugas3, grade.tugas4, grade.tugas5].filter(
    (v): v is number => typeof v === 'number' && !isNaN(v)
  );

  let rataFormatif = 0;
  if (tugasList.length > 0) {
    rataFormatif = Number((tugasList.reduce((acc, curr) => acc + curr, 0) / tugasList.length).toFixed(1));
  }

  const psts = typeof grade.psts === 'number' && !isNaN(grade.psts) ? grade.psts : 0;
  const pas = typeof grade.pas === 'number' && !isNaN(grade.pas) ? grade.pas : 0;

  // Formula: 40% Formatif (rata-rata nilai tugas) + 30% PTS/PSTS + 30% PAS/PSAT
  const rawFinal = 0.4 * rataFormatif + 0.3 * psts + 0.3 * pas;
  const nilaiAkhir = Number(rawFinal.toFixed(1));

  let predikat: 'A' | 'B' | 'C' = 'C';
  if (nilaiAkhir >= 90) {
    predikat = 'A';
  } else if (nilaiAkhir >= 75) {
    predikat = 'B';
  } else {
    predikat = 'C';
  }

  const status: 'Tuntas' | 'Belum Tuntas' = nilaiAkhir >= 75 ? 'Tuntas' : 'Belum Tuntas';

  return {
    studentId: grade.studentId || '',
    kelas: grade.kelas || '',
    mataPelajaran: grade.mataPelajaran || 'Matematika',
    semester: grade.semester || 'Genap',
    tahunAjaran: grade.tahunAjaran || '2025/2026',
    tugas1: grade.tugas1 ?? null,
    tugas2: grade.tugas2 ?? null,
    tugas3: grade.tugas3 ?? null,
    tugas4: grade.tugas4 ?? null,
    tugas5: grade.tugas5 ?? null,
    psts: grade.psts ?? null,
    pas: grade.pas ?? null,
    rataFormatif,
    nilaiAkhir,
    predikat,
    status,
  };
}

export function formatNumberIndo(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '-';
  return num.toLocaleString('id-ID', { maximumFractionDigits: 1 });
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getTodayDateIndo(): string {
  return new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
