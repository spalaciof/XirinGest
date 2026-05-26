
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  MUSICIAN = 'MUSICIAN'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum MusicianType {
  GAITERO = 'GAITERO',
  TAMBORITERO = 'TAMBORITERO'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  username: string;
  password?: string;
  avatar: string;
  joinDate: string;
  gender: Gender;
  dni: string;
  phone: string;
  birthDate: string;
  musicianType?: MusicianType; // Opcional, solo para músicos
  musicianLabel?: string;      // Etiqueta personalizada (ej: "Gaitero Oficial")
}

export interface PasswordRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  requestDate: string;
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  EXCUSED = 'EXCUSED',
  LATE = 'LATE'
}

export interface AttendanceRecord {
  id: string;
  date: string;
  studentId: string;
  status: AttendanceStatus;
}

export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE'
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  month: number;
  year: number;
  amount: number;
  status: PaymentStatus;
  paidDate?: string;
}

export enum RSVPStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED'
}

export interface Performance {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  time: string;
  location: string;
  description?: string;
}

export interface PerformanceAttendance {
  performanceId: string;
  userId: string;
  status: RSVPStatus; // La intención del alumno (Asistiré/No iré)
  verifiedStatus?: AttendanceStatus; // La realidad marcada por el profesor (Presente/Ausente)
}

export interface DashboardStats {
  totalStudents: number;
  attendanceRate: number;
  monthlyRevenue: number;
  pendingPayments: number;
}
