import React, { useState } from 'react';
import { X, Upload, Clipboard, Check, AlertCircle, Users } from 'lucide-react';
import { Student } from '../types';

interface ImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: string[];
  currentClass: string;
  onImport: (newStudents: Student[]) => void;
}

export const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({
  isOpen,
  onClose,
  classes,
  currentClass,
  onImport,
}) => {
  const [targetClass, setTargetClass] = useState<string>(currentClass || classes[0] || 'XI-MIPA-1');
  const [pasteText, setPasteText] = useState<string>('');
  const [parsedData, setParsedData] = useState<{ nis: string; nama: string; gender?: 'L' | 'P'; kelas: string }[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleParse = (text: string) => {
    setPasteText(text);
    setErrorMessage('');
    setSuccessCount(null);

    if (!text.trim()) {
      setParsedData([]);
      return;
    }

    const lines = text.trim().split(/\r?\n/);
    const parsed: { nis: string; nama: string; gender?: 'L' | 'P'; kelas: string }[] = [];

    lines.forEach((line, index) => {
      // Split by tab (Excel copy) or comma / semicolon
      let parts = line.split('\t');
      if (parts.length < 2) {
        parts = line.split(/[,;]/);
      }
      parts = parts.map((p) => p.trim());

      // If header row like "NIS | NAMA", skip
      const firstCol = parts[0]?.toLowerCase() || '';
      if (firstCol.includes('nis') || firstCol.includes('no') || firstCol.includes('nama')) {
        return;
      }

      if (parts.length >= 2) {
        let nis = parts[0].replace(/[^a-zA-Z0-9]/g, '');
        let nama = parts[1];
        let gender: 'L' | 'P' | undefined = undefined;
        let lineClass = targetClass;

        if (parts.length >= 3) {
          const third = parts[2].toUpperCase();
          if (third === 'L' || third === 'P') {
            gender = third as 'L' | 'P';
          } else if (third.length > 1) {
            lineClass = parts[2];
          }
        }

        if (parts.length >= 4) {
          const fourth = parts[3];
          if (fourth) lineClass = fourth;
        }

        // If user copied: No, NIS, Nama
        if (/^\d+$/.test(parts[0]) && parts.length >= 3 && parts[1].length >= 3) {
          // first column was sequence number, second is NIS, third is Nama
          nis = parts[1].replace(/[^a-zA-Z0-9]/g, '');
          nama = parts[2];
          if (parts.length >= 4 && (parts[3].toUpperCase() === 'L' || parts[3].toUpperCase() === 'P')) {
            gender = parts[3].toUpperCase() as 'L' | 'P';
          }
        }

        if (nama && nama.length > 1) {
          if (!nis) {
            nis = `2324${String(1000 + index).slice(1)}`;
          }
          parsed.push({
            nis,
            nama,
            gender,
            kelas: lineClass || targetClass,
          });
        }
      } else if (parts.length === 1 && parts[0].length > 2) {
        // Just name pasted
        parsed.push({
          nis: `2324${String(1000 + index).slice(1)}`,
          nama: parts[0],
          kelas: targetClass,
        });
      }
    });

    if (parsed.length === 0) {
      setErrorMessage('Tidak ada format data siswa yang valid ditemukan. Silakan salin kolom NIS dan Nama dari Excel.');
    } else {
      setParsedData(parsed);
    }
  };

  const handleApplyImport = () => {
    if (parsedData.length === 0) {
      setErrorMessage('Silakan tempel (paste) data siswa terlebih dahulu.');
      return;
    }

    const newStudents: Student[] = parsedData.map((d, i) => ({
      id: `s-imp-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      nis: d.nis,
      nama: d.nama,
      kelas: d.kelas || targetClass,
      gender: d.gender,
    }));

    onImport(newStudents);
    setSuccessCount(newStudents.length);
    setTimeout(() => {
      onClose();
      setPasteText('');
      setParsedData([]);
      setSuccessCount(null);
    }, 900);
  };

  const loadSampleFormat = () => {
    const sample = `23241019\tAnanda Syahputra\tL\n23241020\tBerliana Citra\tP\n23241021\tChandra Wijaya\tL\n23241022\tDewi Sartika\tP\n23241023\tEko Prasetyo\tL`;
    handleParse(sample);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Impor Data Siswa (Copy-Paste dari MS Excel)
              </h3>
              <p className="text-[11px] text-slate-500">
                Salin baris siswa dari tabel Excel dan tempelkan langsung ke kolom di bawah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Target Kelas
              </label>
              <select
                value={targetClass}
                onChange={(e) => {
                  setTargetClass(e.target.value);
                  if (pasteText) handleParse(pasteText);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {classes.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={loadSampleFormat}
                className="text-xs text-indigo-700 hover:text-indigo-900 font-medium underline py-1.5 flex items-center gap-1"
              >
                <Clipboard className="w-3.5 h-3.5" />
                Isi contoh format data Excel
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Area Tempel (Paste) Data:
              </label>
              <span className="text-[10px] text-slate-500">
                Format: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-800">NIS [Tab] Nama [Tab] L/P</code>
              </span>
            </div>
            <textarea
              rows={5}
              value={pasteText}
              onChange={(e) => handleParse(e.target.value)}
              placeholder="Tempelkan data siswa dari Excel di sini (Ctrl+V)&#10;Contoh:&#10;23241019	Ananda Syahputra	L&#10;23241020	Berliana Citra	P"
              className="w-full px-2.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>

          {errorMessage && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded flex items-center gap-2 text-emerald-700 text-xs font-semibold">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>Berhasil mengimpor {successCount} siswa ke kelas {targetClass}!</span>
            </div>
          )}

          {parsedData.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  Pratinjau Hasil Impor ({parsedData.length} Siswa):
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                  Siap Diimpor
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold sticky top-0 border-b border-slate-200 text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-1.5 px-2.5 w-10">No</th>
                      <th className="py-1.5 px-2.5 w-28">NIS</th>
                      <th className="py-1.5 px-2.5">Nama Siswa</th>
                      <th className="py-1.5 px-2 text-center w-14">L/P</th>
                      <th className="py-1.5 px-2.5 w-24">Kelas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedData.map((d, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-1 px-2.5 text-slate-500">{idx + 1}</td>
                        <td className="py-1 px-2.5 font-mono font-medium text-indigo-800">{d.nis}</td>
                        <td className="py-1 px-2.5 font-medium text-slate-800">{d.nama}</td>
                        <td className="py-1 px-2 text-center text-slate-600">{d.gender || '-'}</td>
                        <td className="py-1 px-2.5 text-slate-600">{d.kelas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={parsedData.length === 0}
            onClick={handleApplyImport}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            Impor {parsedData.length} Siswa ke {targetClass}
          </button>
        </div>
      </div>
    </div>
  );
};
