import { Student, AttendanceRecord, GradeItem, TeachingAgenda, SchoolProfile } from '../types';
import {
  DEFAULT_CLASSES,
  DEFAULT_SCHOOL_PROFILE,
  INITIAL_STUDENTS,
  INITIAL_GRADES,
  INITIAL_ATTENDANCE,
  INITIAL_AGENDA,
} from '../data/initialData';

const STORAGE_KEYS = {
  STUDENTS: 'pgri_students_v1',
  CLASSES: 'pgri_classes_v1',
  ATTENDANCE: 'pgri_attendance_v1',
  GRADES: 'pgri_grades_v1',
  AGENDA: 'pgri_agenda_v1',
  PROFILE: 'pgri_profile_v1',
};

export interface AppData {
  students: Student[];
  classes: string[];
  attendance: AttendanceRecord[];
  grades: GradeItem[];
  agenda: TeachingAgenda[];
  profile: SchoolProfile;
}

export function loadAppState(): AppData {
  try {
    const rawStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const rawClasses = localStorage.getItem(STORAGE_KEYS.CLASSES);
    const rawAttendance = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    const rawGrades = localStorage.getItem(STORAGE_KEYS.GRADES);
    const rawAgenda = localStorage.getItem(STORAGE_KEYS.AGENDA);
    const rawProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);

    const sanitizeSubject = (subj: string) => (subj === 'Matematika TL' ? 'Matematika Tingkat Lanjut' : subj);

    const grades: GradeItem[] = (rawGrades ? JSON.parse(rawGrades) : INITIAL_GRADES).map((g: GradeItem) => ({
      ...g,
      mataPelajaran: sanitizeSubject(g.mataPelajaran),
    }));

    const attendance: AttendanceRecord[] = (rawAttendance ? JSON.parse(rawAttendance) : INITIAL_ATTENDANCE).map((a: AttendanceRecord) => ({
      ...a,
      mataPelajaran: sanitizeSubject(a.mataPelajaran),
    }));

    const agenda: TeachingAgenda[] = (rawAgenda ? JSON.parse(rawAgenda) : INITIAL_AGENDA).map((ag: TeachingAgenda) => ({
      ...ag,
      mataPelajaran: sanitizeSubject(ag.mataPelajaran),
    }));

    return {
      students: rawStudents ? JSON.parse(rawStudents) : INITIAL_STUDENTS,
      classes: rawClasses ? JSON.parse(rawClasses) : DEFAULT_CLASSES,
      attendance,
      grades,
      agenda,
      profile: rawProfile ? JSON.parse(rawProfile) : DEFAULT_SCHOOL_PROFILE,
    };
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return {
      students: INITIAL_STUDENTS,
      classes: DEFAULT_CLASSES,
      attendance: INITIAL_ATTENDANCE,
      grades: INITIAL_GRADES,
      agenda: INITIAL_AGENDA,
      profile: DEFAULT_SCHOOL_PROFILE,
    };
  }
}

export function saveAppState(data: Partial<AppData>): void {
  try {
    if (data.students !== undefined) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data.students));
    }
    if (data.classes !== undefined) {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(data.classes));
    }
    if (data.attendance !== undefined) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data.attendance));
    }
    if (data.grades !== undefined) {
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(data.grades));
    }
    if (data.agenda !== undefined) {
      localStorage.setItem(STORAGE_KEYS.AGENDA, JSON.stringify(data.agenda));
    }
    if (data.profile !== undefined) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
    }
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
}

export function resetToDefaults(): AppData {
  localStorage.clear();
  return {
    students: INITIAL_STUDENTS,
    classes: DEFAULT_CLASSES,
    attendance: INITIAL_ATTENDANCE,
    grades: INITIAL_GRADES,
    agenda: INITIAL_AGENDA,
    profile: DEFAULT_SCHOOL_PROFILE,
  };
}
