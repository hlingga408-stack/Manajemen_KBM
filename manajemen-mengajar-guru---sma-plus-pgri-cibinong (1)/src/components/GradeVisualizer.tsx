import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ComputedGradeItem } from '../types';

interface GradeVisualizerProps {
  grades: ComputedGradeItem[];
  selectedClass: string;
  selectedSubject: string;
  kkm?: number;
}

export const GradeVisualizer: React.FC<GradeVisualizerProps> = ({
  grades,
  selectedClass,
  selectedSubject,
  kkm = 75,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'distribution' | 'predicate' | 'components'>('all');

  // Compute distribution by score brackets
  const distributionData = useMemo(() => {
    const buckets = [
      { range: '< 60', label: 'Kurang (<60)', count: 0, color: '#ef4444' },
      { range: '60 - 74', label: 'Belum Tuntas (60-74)', count: 0, color: '#f59e0b' },
      { range: '75 - 84', label: 'Cukup / Baik (75-84)', count: 0, color: '#6366f1' },
      { range: '85 - 94', label: 'Sangat Baik (85-94)', count: 0, color: '#3b82f6' },
      { range: '95 - 100', label: 'Istimewa (95-100)', count: 0, color: '#10b981' },
    ];

    grades.forEach((g) => {
      const score = g.nilaiAkhir;
      if (score < 60) buckets[0].count++;
      else if (score < 75) buckets[1].count++;
      else if (score < 85) buckets[2].count++;
      else if (score < 95) buckets[3].count++;
      else buckets[4].count++;
    });

    const total = grades.length || 1;
    return buckets.map((b) => ({
      ...b,
      persen: Number(((b.count / total) * 100).toFixed(1)),
    }));
  }, [grades]);

  // Compute Predicate data (A, B, C)
  const predicateData = useMemo(() => {
    let aCount = 0;
    let bCount = 0;
    let cCount = 0;

    grades.forEach((g) => {
      if (g.predikat === 'A') aCount++;
      else if (g.predikat === 'B') bCount++;
      else cCount++;
    });

    const total = grades.length || 1;
    return [
      {
        name: 'Predikat A (≥ 90)',
        predikat: 'A',
        count: aCount,
        persen: Number(((aCount / total) * 100).toFixed(1)),
        color: '#10b981', // emerald
      },
      {
        name: 'Predikat B (75 - 89)',
        predikat: 'B',
        count: bCount,
        persen: Number(((bCount / total) * 100).toFixed(1)),
        color: '#6366f1', // indigo
      },
      {
        name: 'Predikat C (< 75)',
        predikat: 'C',
        count: cCount,
        persen: Number(((cCount / total) * 100).toFixed(1)),
        color: '#ef4444', // red
      },
    ];
  }, [grades]);

  // Compute Average per component (Tugas 1-5, PSTS, PAS, Nilai Akhir)
  const componentsAvgData = useMemo(() => {
    const calcAvg = (getter: (g: ComputedGradeItem) => number | null) => {
      const valid = grades.map(getter).filter((v): v is number => v !== null && v !== undefined);
      if (valid.length === 0) return 0;
      const sum = valid.reduce((a, b) => a + b, 0);
      return Number((sum / valid.length).toFixed(1));
    };

    return [
      { name: 'Tugas 1', rata: calcAvg((g) => g.tugas1), tipe: 'Formatif' },
      { name: 'Tugas 2', rata: calcAvg((g) => g.tugas2), tipe: 'Formatif' },
      { name: 'Tugas 3', rata: calcAvg((g) => g.tugas3), tipe: 'Formatif' },
      { name: 'Tugas 4', rata: calcAvg((g) => g.tugas4), tipe: 'Formatif' },
      { name: 'Tugas 5', rata: calcAvg((g) => g.tugas5), tipe: 'Formatif' },
      { name: 'Formatif', rata: calcAvg((g) => (g.rataFormatif > 0 ? g.rataFormatif : null)), tipe: 'Rata Formatif' },
      { name: 'PSTS', rata: calcAvg((g) => g.psts), tipe: 'Sumatif' },
      { name: 'PAS', rata: calcAvg((g) => g.pas), tipe: 'Sumatif' },
      { name: 'Akhir', rata: calcAvg((g) => g.nilaiAkhir), tipe: 'Hasil Akhir' },
    ];
  }, [grades]);

  // Statistics highlights
  const statsSummary = useMemo(() => {
    if (grades.length === 0) {
      return { tuntas: 0, belum: 0, persenTuntas: 0, highest: 0, lowest: 0 };
    }
    const tuntas = grades.filter((g) => g.status === 'Tuntas').length;
    const belum = grades.filter((g) => g.status === 'Belum Tuntas').length;
    const scores = grades.map((g) => g.nilaiAkhir);
    return {
      tuntas,
      belum,
      persenTuntas: Number(((tuntas / grades.length) * 100).toFixed(1)),
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
    };
  }, [grades]);

  if (grades.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden transition-all">
      {/* Header Bar with Toggle & Tabs */}
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-slate-50 via-indigo-50/20 to-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800">
                Visualisasi Distribusi & Analisis Nilai
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                Kelas {selectedClass} &bull; {selectedSubject}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Grafik analitik sebaran nilai akhir, predikat capaian, dan komparasi rata-rata tugas/ujian
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOpen && (
            <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 text-xs shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                  activeTab === 'all'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Grafik
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('distribution')}
                className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                  activeTab === 'distribution'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rentang Nilai
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('predicate')}
                className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                  activeTab === 'predicate'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Predikat (A/B/C)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('components')}
                className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                  activeTab === 'components'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rata Komponen
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-slate-200/60 rounded text-slate-600 transition-colors"
            title={isOpen ? 'Ciutkan Grafik' : 'Tampilkan Grafik'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-3.5 space-y-4">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded border border-emerald-100 bg-emerald-50/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Ketuntasan Kelas
                </span>
                <span className="text-lg font-bold text-emerald-700">
                  {statsSummary.persenTuntas}%
                </span>
                <span className="text-[10px] text-emerald-600 block">
                  {statsSummary.tuntas} dari {grades.length} Siswa
                </span>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-500 opacity-80" />
            </div>

            <div className="p-2.5 rounded border border-rose-100 bg-rose-50/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                  Perlu Bimbingan / Remidi
                </span>
                <span className="text-lg font-bold text-rose-700">
                  {statsSummary.belum} Siswa
                </span>
                <span className="text-[10px] text-rose-600 block">
                  Nilai &lt; {kkm} (KKM)
                </span>
              </div>
              <AlertCircle className="w-6 h-6 text-rose-500 opacity-80" />
            </div>

            <div className="p-2.5 rounded border border-indigo-100 bg-indigo-50/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
                  Nilai Tertinggi
                </span>
                <span className="text-lg font-bold text-indigo-700">
                  {statsSummary.highest}
                </span>
                <span className="text-[10px] text-indigo-600 block">
                  Pencapaian maksimal kelas
                </span>
              </div>
              <Award className="w-6 h-6 text-indigo-500 opacity-80" />
            </div>

            <div className="p-2.5 rounded border border-amber-100 bg-amber-50/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  Nilai Terendah
                </span>
                <span className="text-lg font-bold text-amber-700">
                  {statsSummary.lowest}
                </span>
                <span className="text-[10px] text-amber-600 block">
                  Rentang: {(statsSummary.highest - statsSummary.lowest).toFixed(1)} poin
                </span>
              </div>
              <TrendingUp className="w-6 h-6 text-amber-500 opacity-80" />
            </div>
          </div>

          {/* Charts Grid */}
          <div
            className={`grid gap-3.5 ${
              activeTab === 'all'
                ? 'grid-cols-1 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}
          >
            {/* Chart 1: Distribusi Rentang Nilai (Bar Chart) */}
            {(activeTab === 'all' || activeTab === 'distribution') && (
              <div className="bg-slate-50/60 p-3 rounded border border-slate-200 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-800">Distribusi Rentang Nilai</h4>
                  </div>
                  <span className="text-[10px] text-slate-500">Frekuensi Siswa</span>
                </div>
                <div className="w-full h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="range"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(val: any, _name: any, item: any) => [
                          `${val} Siswa (${item.payload.persen}%)`,
                          item.payload.label,
                        ]}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#cbd5e1',
                          borderRadius: '6px',
                          fontSize: '11px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-dist-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 text-center flex flex-wrap justify-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> &lt;60
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> 60-74 (Remidi)
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" /> 75-84 (Tuntas)
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> 85-94
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> 95-100
                  </span>
                </div>
              </div>
            )}

            {/* Chart 2: Komposisi Predikat (Donut Chart) */}
            {(activeTab === 'all' || activeTab === 'predicate') && (
              <div className="bg-slate-50/60 p-3 rounded border border-slate-200 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <PieChartIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-800">Komposisi Predikat Nilai</h4>
                  </div>
                  <span className="text-[10px] text-slate-500">Skala A / B / C</span>
                </div>
                <div className="w-full h-52 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={predicateData}
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="count"
                      >
                        {predicateData.map((entry, index) => (
                          <Cell key={`cell-pred-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, _name: any, item: any) => [
                          `${val} Siswa (${item.payload.persen}%)`,
                          item.payload.name,
                        ]}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#cbd5e1',
                          borderRadius: '6px',
                          fontSize: '11px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-1 flex flex-col gap-1 text-[11px]">
                  {predicateData.map((p) => (
                    <div key={p.predikat} className="flex items-center justify-between px-2 py-0.5 rounded bg-white border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="font-semibold text-slate-700">{p.name}</span>
                      </div>
                      <div className="text-slate-600 font-bold">
                        {p.count} Siswa <span className="text-slate-400 font-normal">({p.persen}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chart 3: Rata-Rata per Komponen Penilaian (Bar Chart with Reference Line KKM) */}
            {(activeTab === 'all' || activeTab === 'components') && (
              <div className="bg-slate-50/60 p-3 rounded border border-slate-200 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-800">Rata-Rata per Komponen</h4>
                  </div>
                  <span className="text-[10px] text-indigo-700 font-semibold">Garis KKM: {kkm}</span>
                </div>
                <div className="w-full h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={componentsAvgData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 9.5, fill: '#64748b' }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(val: any, _name: any, item: any) => [
                          `${val} (Kategori: ${item.payload.tipe})`,
                          item.payload.name,
                        ]}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#cbd5e1',
                          borderRadius: '6px',
                          fontSize: '11px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <ReferenceLine
                        y={kkm}
                        stroke="#dc2626"
                        strokeDasharray="4 4"
                        label={{
                          value: `KKM ${kkm}`,
                          position: 'insideTopRight',
                          fill: '#dc2626',
                          fontSize: 9,
                        }}
                      />
                      <Bar dataKey="rata" radius={[3, 3, 0, 0]}>
                        {componentsAvgData.map((entry, index) => {
                          const isFinal = entry.name === 'Akhir';
                          const isFormatif = entry.name === 'Formatif';
                          const barColor = isFinal
                            ? '#4f46e5' // indigo-600
                            : isFormatif
                            ? '#0284c7' // sky-600
                            : entry.rata >= kkm
                            ? '#10b981' // emerald-500
                            : '#f59e0b'; // amber-500
                          return <Cell key={`cell-comp-${index}`} fill={barColor} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 text-center flex flex-wrap justify-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-emerald-500" /> &ge; KKM
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-amber-500" /> &lt; KKM
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-indigo-600" /> Nilai Akhir
                  </span>
                  <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                    -- Garis KKM ({kkm})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
