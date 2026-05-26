
import { User, UserRole, AttendanceRecord, PaymentRecord, AttendanceStatus, PaymentStatus, Gender, MusicianType, Performance, PerformanceAttendance, RSVPStatus } from './types';

const FIRST_NAMES_FEMALE = ['Covadonga', 'Llara', 'Olaya', 'Guillermina', 'Deva', 'Xana', 'Aida', 'Carmina', 'Marina', 'Celia', 'Beatriz', 'Inés', 'Valeria', 'Lucía', 'Isabel'];
const FIRST_NAMES_MALE = ['Pelayo', 'Xuan', 'Nel', 'Favila', 'Enol', 'Manolo', 'Dario', 'Iyán', 'Guzmán', 'Felipe', 'Mateo', 'Santiago', 'Rodrigo', 'Alonso'];

const LAST_NAMES = ['Fernández', 'García', 'Martínez', 'Álvarez', 'Menéndez', 'González', 'Rodríguez', 'Suárez', 'Díaz', 'Pérez', 'Sánchez', 'Romero'];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateDNI = () => Math.floor(10000000 + Math.random() * 90000000) + 'X';
const generatePhone = () => '6' + Math.floor(10000000 + Math.random() * 90000000);

export const INITIAL_USERS: User[] = [];

// Admin
INITIAL_USERS.push({
  id: 'user-admin',
  name: 'Administrador General',
  role: UserRole.ADMIN,
  email: 'admin@xiringest.as',
  username: 'admin@xiringest.as',
  password: 'ADMIN',
  avatar: 'https://picsum.photos/seed/admin/150/150',
  joinDate: '2023-01-01',
  gender: Gender.MALE,
  dni: '12345678A',
  phone: '600111222',
  birthDate: '1985-05-15'
});

// Profesor
INITIAL_USERS.push({
  id: 'user-teacher',
  name: 'Maestro de Baile',
  role: UserRole.TEACHER,
  email: 'profe@xiringest.as',
  username: 'profe@xiringest.as',
  password: 'PROFE',
  avatar: 'https://picsum.photos/seed/teacher/150/150',
  joinDate: '2023-01-01',
  gender: Gender.MALE,
  dni: '87654321B',
  phone: '600333444',
  birthDate: '1990-08-20'
});

// Músicos Iniciales
INITIAL_USERS.push({
  id: 'music-1',
  name: 'Nel de Pravia',
  role: UserRole.MUSICIAN,
  musicianType: MusicianType.GAITERO,
  musicianLabel: 'Gaitero Oficial',
  email: 'nel@gaita.as',
  username: 'nel@gaita.as',
  password: '1234',
  avatar: 'https://picsum.photos/seed/gaita/150/150',
  joinDate: '2023-01-01',
  gender: Gender.MALE,
  dni: '11223344G',
  phone: '611222333',
  birthDate: '1988-04-12'
});

INITIAL_USERS.push({
  id: 'music-2',
  name: 'Xuan el del Tambor',
  role: UserRole.MUSICIAN,
  musicianType: MusicianType.TAMBORITERO,
  musicianLabel: 'Tamboritero Principal',
  email: 'xuan@tambor.as',
  username: 'xuan@tambor.as',
  password: '1234',
  avatar: 'https://picsum.photos/seed/tambor/150/150',
  joinDate: '2023-01-01',
  gender: Gender.MALE,
  dni: '55667788T',
  phone: '622333444',
  birthDate: '1992-11-30'
});

// Add Explicit Student: Guillermina Romero
INITIAL_USERS.push({
  id: 'student-guillermina',
  name: 'Guillermina Romero',
  role: UserRole.STUDENT,
  email: 'guillermina.romero@xiringest.as',
  username: 'guillermina',
  password: '123',
  avatar: 'https://picsum.photos/seed/guillermina/150/150',
  joinDate: '2023-09-01',
  gender: Gender.FEMALE,
  dni: '71829384K',
  phone: '699888777',
  birthDate: '1995-03-12'
});

// 29 Alumnos Aleatorios (total 30)
for (let i = 0; i < 29; i++) {
  const isFemale = Math.random() > 0.5;
  const firstName = isFemale ? getRandomElement(FIRST_NAMES_FEMALE) : getRandomElement(FIRST_NAMES_MALE);
  const lastName = getRandomElement(LAST_NAMES);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@xiringest.as`;
  
  INITIAL_USERS.push({
    id: `student-${i}`,
    name: `${firstName} ${lastName}`,
    role: UserRole.STUDENT,
    email: email,
    username: email,
    password: '1234',
    avatar: `https://picsum.photos/seed/${i + 100}/150/150`,
    joinDate: '2023-09-01',
    gender: isFemale ? Gender.FEMALE : Gender.MALE,
    dni: generateDNI(),
    phone: generatePhone(),
    birthDate: `200${Math.floor(Math.random() * 9)}-0${Math.floor(Math.random() * 8 + 1)}-15`
  });
}

// Asistencia
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
const students = INITIAL_USERS.filter(u => u.role === UserRole.STUDENT);
const today = new Date();

for (let i = 0; i < 8; i++) {
  const classDate = new Date(today);
  classDate.setDate(today.getDate() - (i * 3));
  const dateStr = classDate.toISOString().split('T')[0];

  students.forEach(student => {
    const rand = Math.random();
    let status = AttendanceStatus.PRESENT;
    if (rand > 0.95) status = AttendanceStatus.LATE;
    else if (rand > 0.90) status = AttendanceStatus.EXCUSED;
    else if (rand > 0.80) status = AttendanceStatus.ABSENT;

    INITIAL_ATTENDANCE.push({
      id: generateId(),
      date: dateStr,
      studentId: student.id,
      status: status
    });
  });
}

// Pagos
export const INITIAL_PAYMENTS: PaymentRecord[] = [];
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

students.forEach(student => {
  for (let m = 0; m < 3; m++) {
    let month = currentMonth - m;
    let year = currentYear;
    if (month < 0) { month += 12; year -= 1; }

    let status = PaymentStatus.PAID;
    const rand = Math.random();
    if (m === 0 && rand > 0.4) status = PaymentStatus.PENDING;
    else if (m > 0 && rand > 0.95) status = PaymentStatus.OVERDUE;

    INITIAL_PAYMENTS.push({
      id: generateId(),
      studentId: student.id,
      month,
      year,
      amount: 15,
      status,
      paidDate: status === PaymentStatus.PAID ? new Date(year, month, 5).toISOString() : undefined
    });
  }
});

// --- NEW MOCK DATA: Performances ---
export const INITIAL_PERFORMANCES: Performance[] = [
  {
    id: 'perf-1',
    title: 'Festival de la Manzana',
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5).toISOString().split('T')[0],
    time: '18:00',
    location: 'Plaza del Ayuntamiento, Villaviciosa',
    description: 'Actuación principal con traje de gala. Repertorio completo.'
  },
  {
    id: 'perf-2',
    title: 'Fiestas de San Juan',
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10).toISOString().split('T')[0], // Pasada
    time: '20:00',
    location: 'Mieres',
    description: 'Colaboración con banda de gaitas local.'
  }
];

export const INITIAL_PERFORMANCE_ATTENDANCE: PerformanceAttendance[] = [];

// Generar asistencia aleatoria para las actuaciones pasadas
const pastPerformances = INITIAL_PERFORMANCES.filter(p => new Date(p.date) < today);
const performers = INITIAL_USERS.filter(u => u.role === UserRole.STUDENT || u.role === UserRole.MUSICIAN);

pastPerformances.forEach(perf => {
  performers.forEach(user => {
    // 80% asistencia confirmada por alumno (RSVP)
    const rsvpStatus = Math.random() > 0.2 ? RSVPStatus.CONFIRMED : RSVPStatus.DECLINED;
    
    // Si confirmó, el profesor verificó (90% probabilidad de que fuera verdad, 10% falló)
    let verifiedStatus: AttendanceStatus | undefined = undefined;
    if (rsvpStatus === RSVPStatus.CONFIRMED) {
       verifiedStatus = Math.random() > 0.1 ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT;
    } else {
       // Si dijo que no iba, verificamos que no fue
       verifiedStatus = AttendanceStatus.EXCUSED; 
    }

    INITIAL_PERFORMANCE_ATTENDANCE.push({
      performanceId: perf.id,
      userId: user.id,
      status: rsvpStatus,
      verifiedStatus: verifiedStatus
    });
  });
});

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
