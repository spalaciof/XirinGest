
import React, { useState } from 'react';
import { User, UserRole, Performance, PerformanceAttendance, RSVPStatus, AttendanceStatus, AttendanceRecord } from '../types';
import { CalendarDays, MapPin, Clock, ChevronDown, CheckCircle2, PieChart } from 'lucide-react';
import StudentStatsDashboard from './StudentStatsDashboard';

interface PerformanceAttendanceTrackerProps {
  users: User[];
  performances: Performance[];
  attendance: PerformanceAttendance[];
  rehearsalAttendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<PerformanceAttendance[]>>;
  canEdit: boolean;
}

const PerformanceAttendanceTracker: React.FC<PerformanceAttendanceTrackerProps> = ({
  users,
  performances,
  attendance,
  rehearsalAttendance,
  setAttendance,
  canEdit
}) => {
  const [selectedPerformanceId, setSelectedPerformanceId] = useState<string>(
    performances.length > 0 ? performances[0].id : ''
  );
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);

  const selectedPerformance = performances.find(p => p.id === selectedPerformanceId);
  const performers = users.filter(u => u.role === UserRole.STUDENT || u.role === UserRole.MUSICIAN);

  const updateVerifiedStatus = (userId: string, status: AttendanceStatus | '') => {
    if (!canEdit || !selectedPerformanceId) return;

    setAttendance(prev => {
      const idx = prev.findIndex(a => a.performanceId === selectedPerformanceId && a.userId === userId);
      
      // If record exists
      if (idx >= 0) {
         const updated = [...prev];
         if (status === '') {
            // Remove verified status but keep RSVP
            updated[idx] = { ...updated[idx], verifiedStatus: undefined };
         } else {
            updated[idx] = { ...updated[idx], verifiedStatus: status as AttendanceStatus };
         }
         return updated;
      }

      // If record doesn't exist (user never RSVP'd), create one with PENDING rsvp and verified status
      if (status !== '') {
        return [...prev, {
          performanceId: selectedPerformanceId,
          userId: userId,
          status: RSVPStatus.PENDING,
          verifiedStatus: status as AttendanceStatus
        }];
      }
      return prev;
    });
  };

  const markAllConfirmedPresent = () => {
     if (!canEdit || !selectedPerformanceId) return;
     
     setAttendance(prev => {
       const updated = [...prev];
       
       performers.forEach(user => {
         const idx = updated.findIndex(a => a.performanceId === selectedPerformanceId && a.userId === user.id);
         
         if (idx >= 0) {
           // If they confirmed, mark as present automatically
           if (updated[idx].status === RSVPStatus.CONFIRMED) {
             updated[idx] = { ...updated[idx], verifiedStatus: AttendanceStatus.PRESENT };
           }
         }
       });
       return updated;
     });
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
      default: return 'Sin Verificar';
    }
  };

  // --- RENDER DASHBOARD IF VIEWING STUDENT ---
  if (viewingStudentId) {
    return (
      <StudentStatsDashboard 
        studentId={viewingStudentId}
        users={users}
        rehearsalAttendance={rehearsalAttendance}
        performances={performances}
        performanceAttendance={attendance}
        showBackButton={true}
        onBack={() => setViewingStudentId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Verificación de Actuaciones</h2>
          <p className="text-slate-500">Confirma la asistencia real de los miembros a los eventos.</p>
        </div>

        <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
           <div className="relative min-w-[300px]">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <select
                value={selectedPerformanceId}
                onChange={(e) => setSelectedPerformanceId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl appearance-none font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              >
                {performances.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(perf => (
                  <option key={perf.id} value={perf.id}>
                     {new Date(perf.date).toLocaleDateString()} - {perf.title}
                  </option>
                ))}
                {performances.length === 0 && <option value="">No hay actuaciones</option>}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
           </div>
        </div>
      </div>

      {selectedPerformance && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
           <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
              <div>
                 <h3 className="text-xl font-bold text-slate-800">{selectedPerformance.title}</h3>
                 <div className="flex gap-4 mt-2 text-sm text-slate-500">
                    <div className="flex items-center gap-1"><Clock size={16}/> {selectedPerformance.time}</div>
                    <div className="flex items-center gap-1"><MapPin size={16}/> {selectedPerformance.location}</div>
                 </div>
              </div>
              
              {canEdit && (
                 <button 
                  onClick={markAllConfirmedPresent}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 text-sm whitespace-nowrap"
                 >
                    <CheckCircle2 size={18} />
                    Confirmar Asistencia a Todos (RSVP Sí)
                 </button>
              )}
           </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
             <thead>
                <tr className="bg-slate-800 text-white border-b border-slate-900">
                   <th className="px-6 py-5 font-bold text-xs uppercase tracking-widest">Miembro</th>
                   <th className="px-4 py-5 font-bold text-xs uppercase tracking-widest text-center">Rol</th>
                   <th className="px-4 py-5 font-bold text-xs uppercase tracking-widest text-center">RSVP (Intención)</th>
                   <th className="px-6 py-5 font-bold text-right text-xs uppercase tracking-widest">Asistencia Real</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {performers.map(user => {
                   const record = attendance.find(a => a.performanceId === selectedPerformanceId && a.userId === user.id);
                   const rsvp = record?.status || RSVPStatus.PENDING;
                   const verified = record?.verifiedStatus;

                   let rsvpClass = 'bg-slate-100 text-slate-500';
                   if (rsvp === RSVPStatus.CONFIRMED) rsvpClass = 'bg-emerald-100 text-emerald-700';
                   else if (rsvp === RSVPStatus.DECLINED) rsvpClass = 'bg-red-100 text-red-700';

                   return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                         <td className="px-6 py-4 flex items-center gap-4">
                           <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-slate-100" />
                           <div>
                              <p className="font-bold text-slate-700">{user.name}</p>
                           </div>
                         </td>
                         <td className="px-4 py-4 text-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                               {user.role === UserRole.MUSICIAN ? 'Músico' : 'Bailarín'}
                            </span>
                         </td>
                         <td className="px-4 py-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${rsvpClass}`}>
                               {rsvp === RSVPStatus.CONFIRMED ? 'Confirmado' : rsvp === RSVPStatus.DECLINED ? 'No Asistirá' : 'Pendiente'}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                                {canEdit && (user.role === UserRole.STUDENT || user.role === UserRole.MUSICIAN) && (
                                   <button 
                                      onClick={() => setViewingStudentId(user.id)}
                                      className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                                      title="Ver panel de compromiso del miembro"
                                   >
                                      <PieChart size={20} />
                                   </button>
                                )}

                                {canEdit ? (
                                   <div className="relative inline-block w-48">
                                      <select
                                        value={verified || ''}
                                        onChange={(e) => updateVerifiedStatus(user.id, e.target.value as AttendanceStatus)}
                                        className={`appearance-none w-full pl-4 pr-10 py-3 rounded-xl text-xs font-black uppercase border-2 transition-all cursor-pointer ${getStatusColorClass(verified)}`}
                                      >
                                         <option value="">-- VERIFICAR --</option>
                                         <option value={AttendanceStatus.PRESENT}>Presente</option>
                                         <option value={AttendanceStatus.ABSENT}>Ausente</option>
                                         <option value={AttendanceStatus.EXCUSED}>Justificado</option>
                                         <option value={AttendanceStatus.LATE}>Retraso</option>
                                      </select>
                                      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                                   </div>
                                ) : (
                                   <div className={`inline-flex px-4 py-2 rounded-xl text-xs font-black uppercase border-2 ${getStatusColorClass(verified)}`}>
                                      {getStatusLabel(verified)}
                                   </div>
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

export default PerformanceAttendanceTracker;
