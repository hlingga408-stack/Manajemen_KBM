export type AttendanceStatus = 'H' | 'S' | 'I' | 'A';

export interface Student {
  id: string;
  nis: string;
  nama: string;
  kelas: string;
  gender?: 'L' | 'P';
}

export interface AttendanceRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  kelas: string;
  mataPelajaran: string;
  pertemuanKe: number;
  entries: Record<string, AttendanceStatus>; // studentId -> status
  catatan?: string;
  createdAt: number;
}

export interface GradeItem {
  studentId: string;
  kelas: string;
  mataPelajaran: 'Matematika' | 'Matematika Tingkat Lanjut' | string;
  semester: 'Ganjil' | 'Genap';
  tahunAjaran: string;
  tugas1: number | null;
  tugas2: number | null;
  tugas3: number | null;
  tugas4: number | null;
  tugas5: number | null;
  psts: number | null; // Penilaian Sumatif Tengah Semester / PTS
  pas: number | null;  // Penilaian Akhir Semester / PSAT
}

export interface ComputedGradeItem extends GradeItem {
  rataFormatif: number;
  nilaiAkhir: number;
  predikat: 'A' | 'B' | 'C';
  status: 'Tuntas' | 'Belum Tuntas';
}

export interface TeachingAgenda {
  id: string;
  tanggal: string; // YYYY-MM-DD
  jamKe: string;
  kelas: string;
  mataPelajaran: 'Matematika' | 'Matematika Tingkat Lanjut' | string;
  materi: string;
  modelPembelajaran: string;
  catatan: string;
  kehadiranRingkasan?: {
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
    total: number;
  };
  createdAt: number;
}

export interface SchoolProfile {
  yayasan: string;
  namaSekolah: string;
  alamat: string;
  kota: string;
  kepalaSekolah: string;
  guru: string;
  nipKepalaSekolah?: string;
  nipGuru?: string;
  tahunAjaranAktif: string;
  semesterAktif: 'Ganjil' | 'Genap';
  logoUrl?: string;
}

export type ActiveTab = 'absensi' | 'penilaian' | 'agenda' | 'siswa' | 'pengaturan';
