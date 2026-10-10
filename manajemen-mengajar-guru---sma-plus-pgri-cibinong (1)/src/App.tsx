import React, { useState, useEffect } from 'react';
import { ActiveTab, Student, AttendanceRecord, GradeItem, TeachingAgenda, SchoolProfile } from './types';
import { loadAppState, saveAppState, resetToDefaults, AppData } from './utils/storage';
import { Navbar } from './components/Navbar';
import { AbsensiView } from './components/AbsensiView';
import { PenilaianView } from './components/PenilaianView';
import { AgendaMengajarView } from './components/AgendaMengajarView';
import { SiswaManagerView } from './components/SiswaManagerView';
import { SettingsView } from './components/SettingsView';
import { LoginView } from './components/LoginView';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('pgri_auth_session') === 'guru' ||
        sessionStorage.getItem('pgri_auth_session') === 'guru'
      );
    } catch {
      return false;
    }
  });

  const [appState, setAppState] = useState<AppData>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<ActiveTab>('absensi');

  const handleLoginSuccess = (rememberMe: boolean) => {
    try {
      if (rememberMe) {
        localStorage.setItem('pgri_auth_session', 'guru');
      } else {
        sessionStorage.setItem('pgri_auth_session', 'guru');
      }
    } catch (err) {
      console.error(err);
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari Portal Guru?')) {
      try {
        localStorage.removeItem('pgri_auth_session');
        sessionStorage.removeItem('pgri_auth_session');
      } catch (err) {
        console.error(err);
      }
      setIsAuthenticated(false);
    }
  };

  // Sync to local storage whenever state changes
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Handlers for Absensi
  const handleSaveAttendance = (record: AttendanceRecord) => {
    setAppState((prev) => {
      const filtered = prev.attendance.filter(
        (r) => !(r.kelas === record.kelas && r.tanggal === record.tanggal && r.mataPelajaran === record.mataPelajaran)
      );
      return {
        ...prev,
        attendance: [record, ...filtered],
      };
    });
  };

  // Handlers for Penilaian
  const handleSaveGrade = (updatedGrades: GradeItem[]) => {
    setAppState((prev) => {
      if (updatedGrades.length === 0) return prev;
      const targetKelas = updatedGrades[0].kelas;
      const targetMapel = updatedGrades[0].mataPelajaran;
      const targetSem = updatedGrades[0].semester;
      const targetTA = updatedGrades[0].tahunAjaran;

      // Keep grades from other classes/subjects
      const retained = prev.grades.filter(
        (g) =>
          !(
            g.kelas === targetKelas &&
            g.mataPelajaran === targetMapel &&
            g.semester === targetSem &&
            g.tahunAjaran === targetTA
          )
      );

      return {
        ...prev,
        grades: [...retained, ...updatedGrades],
      };
    });
  };

  // Handlers for Agenda Mengajar
  const handleSaveAgenda = (newAgenda: TeachingAgenda) => {
    setAppState((prev) => ({
      ...prev,
      agenda: [newAgenda, ...prev.agenda],
    }));
  };

  const handleUpdateAgenda = (updatedAgenda: TeachingAgenda) => {
    setAppState((prev) => ({
      ...prev,
      agenda: prev.agenda.map((item) => (item.id === updatedAgenda.id ? updatedAgenda : item)),
    }));
  };

  const handleDeleteAgenda = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      agenda: prev.agenda.filter((item) => item.id !== id),
    }));
  };

  // Handlers for Student & Class Management
  const handleAddStudent = (student: Student) => {
    setAppState((prev) => ({
      ...prev,
      students: [...prev.students, student],
    }));
  };

  const handleUpdateStudent = (student: Student) => {
    setAppState((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === student.id ? student : s)),
    }));
  };

  const handleDeleteStudent = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== id),
    }));
  };

  const handleAddClass = (newClass: string) => {
    setAppState((prev) => ({
      ...prev,
      classes: [...prev.classes, newClass],
    }));
  };

  const handleDeleteClass = (className: string) => {
    setAppState((prev) => ({
      ...prev,
      classes: prev.classes.filter((c) => c !== className),
    }));
  };

  const handleImportStudents = (newStudents: Student[]) => {
    setAppState((prev) => {
      // Avoid duplicate NIS if already exists in the same class
      const existingNisSet = new Set(prev.students.map((s) => `${s.kelas}-${s.nis}`));
      const filteredNew = newStudents.filter((s) => !existingNisSet.has(`${s.kelas}-${s.nis}`));
      
      // Auto register any new class from import
      const newClassesSet = new Set(prev.classes);
      filteredNew.forEach((s) => {
        if (s.kelas) newClassesSet.add(s.kelas);
      });

      return {
        ...prev,
        students: [...prev.students, ...filteredNew],
        classes: Array.from(newClassesSet),
      };
    });
  };

  // Profile & System Handlers
  const handleUpdateProfile = (newProfile: SchoolProfile) => {
    setAppState((prev) => ({
      ...prev,
      profile: newProfile,
    }));
  };

  const handleResetAllData = () => {
    const defaults = resetToDefaults();
    setAppState(defaults);
  };

  const handleExportBackup = () => {
    const jsonStr = JSON.stringify(appState, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_manajemen_mengajar_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.students && parsed.classes && parsed.profile) {
          setAppState(parsed);
          alert('Data cadangan berhasil dipulihkan!');
        } else {
          alert('Format berkas cadangan JSON tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca berkas JSON.');
      }
    };
    reader.readAsText(file);
  };

  if (!isAuthenticated) {
    return <LoginView profile={appState.profile} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={appState.profile}
        totalStudents={appState.students.length}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {activeTab === 'absensi' && (
          <AbsensiView
            students={appState.students}
            classes={appState.classes}
            attendanceRecords={appState.attendance}
            profile={appState.profile}
            onSaveAttendance={handleSaveAttendance}
            onImportStudents={handleImportStudents}
          />
        )}

        {activeTab === 'penilaian' && (
          <PenilaianView
            students={appState.students}
            classes={appState.classes}
            grades={appState.grades}
            profile={appState.profile}
            onSaveGrade={handleSaveGrade}
          />
        )}

        {activeTab === 'agenda' && (
          <AgendaMengajarView
            agendaList={appState.agenda}
            classes={appState.classes}
            profile={appState.profile}
            onSaveAgenda={handleSaveAgenda}
            onUpdateAgenda={handleUpdateAgenda}
            onDeleteAgenda={handleDeleteAgenda}
          />
        )}

        {activeTab === 'siswa' && (
          <SiswaManagerView
            students={appState.students}
            classes={appState.classes}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onAddClass={handleAddClass}
            onDeleteClass={handleDeleteClass}
            onImportStudents={handleImportStudents}
          />
        )}

        {activeTab === 'pengaturan' && (
          <SettingsView
            profile={appState.profile}
            onUpdateProfile={handleUpdateProfile}
            onResetAllData={handleResetAllData}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-2.5 px-3 sm:px-6 mt-auto text-center text-[11px] text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <span>
            &copy; {new Date().getFullYear()} {appState.profile.namaSekolah}. Hak Cipta Dilindungi.
          </span>
          <span className="text-slate-400">
            Guru: <strong className="text-slate-700">{appState.profile.guru}</strong> &bull; Kepala Sekolah:{' '}
            <strong className="text-slate-700">{appState.profile.kepalaSekolah}</strong>
          </span>
        </div>
      </footer>
    </div>
  );
}
