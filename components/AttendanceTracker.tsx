
import React, { useState, useMemo } from 'react';
import { User, AttendanceRecord, AttendanceStatus, UserRole, Performance, PerformanceAttendance } from '../types';
import { Calendar, CheckCircle2, RotateCcw, Info, PieChart, ChevronDown } from 'lucide-react';
import StudentStatsDashboard from './StudentStatsDashboard';

interface AttendanceTrackerProps {
  users: User[];
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  canEdit: boolean;
  currentUser: User;
  performances?: Performance[];
  performanceAttendance?: PerformanceAttendance[];
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ 
  users, 
  attendance, 
  setAttendance, 
  canEdit, 
  currentUser,
  performances = [],
  performanceAttendance = []
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);

  const isStudentView = currentUser.role === UserRole.STUDENT;
  
  // --- LÓGICA DE CALENDARIO (Solo para la vista de profesor/tabla) ---
  const isHoliday = (date: Date) => {
    const month = date.getMonth(); 
    const day = date.getDate();
    const fixedHolidays = ['01-01', '01-06', '05-01', '08-15', '09-08', '10-12', '11-01', '12-06', '12-08', '12-25'];
    const dayMonth = `${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    if (fixedHolidays.includes(dayMonth)) return true;
    if ((month === 11 && day >= 23) || (month === 0 && day <= 7)) return true;
    if (month === 3 && day >= 10 && day <= 17) return true;
    return false;
  };

  const isRehearsalDay = (date: Date) => {
    const month = date.getMonth();
    const dayOfWeek = date.getDay(); 
    if (isHoliday(date)) return false;
    if (month === 6 || month === 7) return dayOfWeek === 4; // Jueves Julio/Agosto
    return dayOfWeek === 5; // Viernes resto del año
  };

  const getEffectiveScheduledDates = (limitDate: string, monthOnly: boolean = false) => {
    const target = new Date(limitDate);
    const start = monthOnly 
      ? new Date(target.getFullYear(), target.getMonth(), 1)
      : new Date(target.getFullYear(), 0, 1);
    
    const dates = new Set<string>();
    
    const temp = new Date(start);
    while (temp <= target) {
      if (isRehearsalDay(new Date(temp))) {
        dates.add(temp.toISOString().split('T')[0]);
      }
      temp.setDate(temp.getDate() + 1);
    }

    attendance.forEach(record => {
      const recordDate = new Date(record.date);
      if (recordDate >= start && recordDate <= target) {
        dates.add(record.date);
      }
    });

    return Array.from(dates).sort();
  };

  const effectiveScheduledUntilNow = useMemo(() => getEffectiveScheduledDates(selectedDate), [selectedDate, attendance]);
  const effectiveScheduledInMonth = useMemo(() => getEffectiveScheduledDates(selectedDate, true), [selectedDate, attendance]);

  const students = users.filter(u => u.role === UserRole.STUDENT);

  const updateStatus = (studentId: string, newStatus: AttendanceStatus | '') => {
    if (!canEdit) return;
    setAttendance(prev => {
      const idx = prev.findIndex(a => a.studentId === studentId && a.date === selectedDate);
      if (idx >= 0) {
        if (newStatus === '') return prev.filter((_, i) => i !== idx);
        const next = [...prev];
        next[idx] = { ...next[idx], status: newStatus as AttendanceStatus };
        return next;
      }
      if (newStatus === '') return prev;
      return [...prev, { id: Math.random().toString(36).substr(2, 9), date: selectedDate, studentId, status: newStatus as AttendanceStatus }];
    });
  };

  const markAllPresent = () => {
    if (!canEdit) return;
    setAttendance(prev => {
      let next = [...prev];
      students.forEach(student => {
        const idx = next.findIndex(a => a.studentId === student.id && a.date === selectedDate);
        if (idx >= 0) {
          next[idx] = { ...next[idx], status: AttendanceStatus.PRESENT };
        } else {
          next.push({ id: Math.random().toString(36).substr(2, 9), date: selectedDate, studentId: student.id, status: AttendanceStatus.PRESENT });
        }
      });
      return next;
    });
  };

  const resetAllStatus = () => {
    if (!canEdit) return;
    setAttendance(prev => prev.filter(a => a.date !== selectedDate));
  };

  const getStatusColorClass = (status?: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case AttendanceStatus.ABSENT: return 'bg-red-100 text-red-800 border-red-200';
      case AttendanceStatus.EXCUSED: return 'bg-amber-100 text-amber-800 border-amber-200';
      case AttendanceStatus.LATE: return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-50 text-slate-400 border-slate-100 italic';
    }
  };

  const getStatusLabel = (status?: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return 'Presente';
      case AttendanceStatus.ABSENT: return 'Ausente';
      case AttendanceStatus.EXCUSED: return 'Justificado';
      case AttendanceStatus.LATE: return 'Retraso';
      default: return 'FALTA (Sin Reg)';
    }
  };

  // --- RENDERIZADO DEL DASHBOARD DETALLADO (Si es alumno o profesor viendo detalles) ---
  if (isStudentView || viewingStudentId) {
    const targetId = isStudentView ? currentUser.id : viewingStudentId!;
    return (
      <StudentStatsDashboard 
        studentId={targetId}
        users={users}
        rehearsalAttendance={attendance}
        performances={performances}
        performanceAttendance={performanceAttendance}
        showBackButton={!isStudentView}
        onBack={() => setViewingStudentId(null)}
      />
    );
  }

  // --- VISTA PROFESOR / ADMIN (LISTADO ENSAYOS) ---
  const isSelectedDateRehearsal = isRehearsalDay(new Date(selectedDate));
  const hasRecordsThisDay = attendance.some(a => a.date === selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Control de Asistencia (Ensayos)</h2>
          <p className="text-slate-500">Gestiona las faltas y presencias en los ensayos</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {canEdit && (
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={markAllPresent}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95 text-sm"
              >
                <CheckCircle2 size={18} />
                Marcar todos Presente
              </button>
              <button 
                onClick={resetAllStatus}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95 text-sm"
                title="Borrar registros del día"
              >
                <RotateCcw size={18} />
                Limpiar Día
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
            <Calendar className="text-emerald-600 shrink-0" size={20} />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-bold text-slate-700 focus:outline-none w-full cursor-pointer"
            />
          </div>
        </div>
      </div>

      {!isSelectedDateRehearsal && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-colors ${hasRecordsThisDay ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-blue-50 text-blue-800 border-blue-100 animate-pulse'}`}>
          <Info size={20} className="shrink-0" />
          <p className="text-sm font-medium">
            {hasRecordsThisDay 
              ? 'Día Extraordinario: Has registrado asistencia para una fecha fuera del calendario oficial.' 
              : 'Nota: El día seleccionado no es un día de ensayo oficial (o es festivo). Los botones de marcado rápido siguen disponibles.'}
          </p>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-emerald-900 text-white border-b border-emerald-950">
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-widest">Bailarín/a</th>
                <th className="px-4 py-5 font-bold text-xs uppercase tracking-widest text-center">% Mes</th>
                <th className="px-4 py-5 font-bold text-xs uppercase tracking-widest text-center">% Anual</th>
                <th className="px-6 py-5 font-bold text-right text-xs uppercase tracking-widest">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map(student => {
                const record = attendance.find(a => a.studentId === student.id && a.date === selectedDate);
                const status = record?.status;
                const studentRecords = attendance.filter(a => a.studentId === student.id);
                
                const presentInMonth = studentRecords.filter(r => effectiveScheduledInMonth.includes(r.date) && (r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE)).length;
                const monthRate = effectiveScheduledInMonth.length > 0 ? Math.round((presentInMonth / effectiveScheduledInMonth.length) * 100) : 0;

                const presentInYear = studentRecords.filter(r => effectiveScheduledUntilNow.includes(r.date) && (r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE)).length;
                const yearRate = effectiveScheduledUntilNow.length > 0 ? Math.round((presentInYear / effectiveScheduledUntilNow.length) * 100) : 0;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <img src={student.avatar} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-slate-100" />
                      <div>
                        <p className="font-bold text-slate-700">{student.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{student.dni}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center font-black text-sm">{monthRate}%</td>
                    <td className="px-4 py-4 text-center font-black text-sm">{yearRate}%</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                         {/* Botón para ver estadísticas del alumno */}
                         {canEdit && (
                           <button 
                              onClick={() => setViewingStudentId(student.id)}
                              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                              title="Ver panel de compromiso del alumno"
                           >
                              <PieChart size={20} />
                           </button>
                         )}

                         {canEdit ? (
                          <div className="relative inline-block w-48">
                            <select
                              value={status || ''}
                              onChange={(e) => updateStatus(student.id, e.target.value as AttendanceStatus)}
                              className={`appearance-none w-full pl-4 pr-10 py-3 rounded-xl text-xs font-black uppercase border-2 transition-all cursor-pointer ${getStatusColorClass(status)}`}
                            >
                              <option value="">SIN ASIGNAR</option>
                              <option value={AttendanceStatus.PRESENT}>Presente</option>
                              <option value={AttendanceStatus.ABSENT}>Ausente</option>
                              <option value={AttendanceStatus.EXCUSED}>Justificado</option>
                              <option value={AttendanceStatus.LATE}>Retraso</option>
                            </select>
                            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                          </div>
                        ) : (
                          <div className={`inline-flex px-4 py-2 rounded-xl text-xs font-black uppercase border-2 ${getStatusColorClass(status)}`}>{getStatusLabel(status)}</div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;
