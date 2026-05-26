
import React, { useState } from 'react';
import { Performance, PerformanceAttendance, User, UserRole, RSVPStatus } from '../types';
import { Calendar as CalendarIcon, MapPin, Clock, Plus, Trash2, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';

interface PerformancesCalendarProps {
  performances: Performance[];
  attendance: PerformanceAttendance[];
  setPerformances: React.Dispatch<React.SetStateAction<Performance[]>>;
  setPerformanceAttendance: React.Dispatch<React.SetStateAction<PerformanceAttendance[]>>;
  currentUser: User;
}

const PerformancesCalendar: React.FC<PerformancesCalendarProps> = ({ 
  performances, 
  attendance, 
  setPerformances, 
  setPerformanceAttendance,
  currentUser 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPerformance, setNewPerformance] = useState<Partial<Performance>>({
    title: '',
    date: '',
    endDate: '',
    time: '',
    location: '',
    description: ''
  });

  const canManage = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.TEACHER;

  // Calendar Logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday
  // Adjust so Monday is 0 (Spanish style)
  const startingDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Format date to YYYY-MM-DD ensuring local time consistency
  const getDayStr = (year: number, month: number, day: number) => {
    return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  const currentMonthStart = getDayStr(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const currentMonthEnd = getDayStr(currentDate.getFullYear(), currentDate.getMonth(), daysInMonth);

  // Filter overlapping performances
  const monthPerformances = performances.filter(p => {
    const start = p.date;
    const end = p.endDate || p.date;
    return start <= currentMonthEnd && end >= currentMonthStart;
  });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const openModal = (performance?: Performance) => {
    if (performance) {
      setEditingId(performance.id);
      setNewPerformance({ ...performance });
    } else {
      setEditingId(null);
      setNewPerformance({ title: '', date: '', endDate: '', time: '', location: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setNewPerformance({ title: '', date: '', endDate: '', time: '', location: '', description: '' });
  };

  const handleSavePerformance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerformance.title || !newPerformance.date) return;

    if (newPerformance.endDate && newPerformance.endDate < newPerformance.date) {
        alert("La fecha de fin no puede ser anterior a la fecha de inicio");
        return;
    }

    if (editingId) {
      // Edit Mode
      setPerformances(prev => prev.map(p => p.id === editingId ? { ...p, ...newPerformance } as Performance : p));
    } else {
      // Create Mode
      const perf: Performance = {
        id: `perf-${Math.random().toString(36).substr(2, 9)}`,
        title: newPerformance.title!,
        date: newPerformance.date!,
        endDate: newPerformance.endDate,
        time: newPerformance.time || '00:00',
        location: newPerformance.location || 'Por determinar',
        description: newPerformance.description
      };
      setPerformances(prev => [...prev, perf]);
    }
    closeModal();
  };

  const handleDeletePerformance = (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar esta actuación? Se borrarán las confirmaciones de asistencia.')) {
      setPerformances(prev => prev.filter(p => p.id !== id));
      setPerformanceAttendance(prev => prev.filter(pa => pa.performanceId !== id));
    }
  };

  const handleRSVP = (performanceId: string, status: RSVPStatus) => {
    setPerformanceAttendance(prev => {
      const existing = prev.findIndex(pa => pa.performanceId === performanceId && pa.userId === currentUser.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], status };
        return updated;
      }
      return [...prev, { performanceId, userId: currentUser.id, status }];
    });
  };

  const getMyStatus = (performanceId: string) => {
    const record = attendance.find(pa => pa.performanceId === performanceId && pa.userId === currentUser.id);
    return record ? record.status : RSVPStatus.PENDING;
  };

  // Sort upcoming performances
  const upcomingPerformances = performances
    .filter(p => {
        const end = p.endDate || p.date;
        const today = new Date().setHours(0,0,0,0);
        return new Date(end) >= new Date(today);
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Calendario de Actuaciones</h2>
          <p className="text-slate-500">Consulta y confirma tu asistencia a los próximos eventos.</p>
        </div>
        {canManage && (
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95"
          >
            <Plus size={20} />
            Nueva Actuación
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar View */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft /></button>
            <h3 className="text-xl font-black text-slate-700 capitalize">
              {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight /></button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
              <div key={d} className="text-xs font-bold text-slate-400">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startingDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 md:h-32 bg-slate-50/50 rounded-xl"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = getDayStr(currentDate.getFullYear(), currentDate.getMonth(), day);
              
              const dayEvents = monthPerformances.filter(p => {
                 const start = p.date;
                 const end = p.endDate || p.date;
                 return dateStr >= start && dateStr <= end;
              });
              
              return (
                <div key={day} className={`h-24 md:h-32 border border-slate-100 rounded-xl p-2 relative hover:shadow-md transition-shadow ${dayEvents.length > 0 ? 'bg-amber-50' : 'bg-white'}`}>
                  <span className="text-sm font-bold text-slate-700">{day}</span>
                  <div className="mt-1 space-y-1 overflow-y-auto max-h-[70%]">
                    {dayEvents.map(ev => (
                      <div key={ev.id} className="text-[10px] leading-tight bg-white p-1 rounded border border-amber-200 shadow-sm relative group">
                        <span className="font-bold text-amber-800">{ev.time}</span> <span className="truncate">{ev.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming List & RSVP */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CalendarIcon className="text-emerald-600" /> Próximas Actuaciones
            </h3>
            
            <div className="space-y-4">
              {upcomingPerformances.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No hay actuaciones programadas próximamente.</p>
              ) : (
                upcomingPerformances.map(perf => {
                  const myStatus = getMyStatus(perf.id);
                  const statusColor = myStatus === RSVPStatus.CONFIRMED ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                                      myStatus === RSVPStatus.DECLINED ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-100';

                  return (
                    <div key={perf.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 relative overflow-hidden group">
                      {/* Status Badge */}
                      <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase rounded-bl-xl border-b border-l ${statusColor}`}>
                        {myStatus === RSVPStatus.PENDING ? 'Pendiente' : myStatus === RSVPStatus.CONFIRMED ? 'Confirmado' : 'No Asistiré'}
                      </div>
                      
                      {canManage && (
                         <div className="absolute top-2 right-24 hidden group-hover:flex gap-2 bg-white/80 p-1 rounded-lg backdrop-blur-sm">
                            <button 
                              onClick={() => openModal(perf)}
                              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                              title="Editar"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeletePerformance(perf.id)}
                              className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                         </div>
                      )}

                      <div className="mb-3 pr-16">
                         <h4 className="font-bold text-slate-800">{perf.title}</h4>
                         <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                           <CalendarIcon size={12} /> 
                           {new Date(perf.date).toLocaleDateString()} 
                           {perf.endDate && perf.endDate !== perf.date && ` - ${new Date(perf.endDate).toLocaleDateString()}`}
                           <span className="mx-1">•</span> 
                           <Clock size={12} /> {perf.time}
                         </div>
                         <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                           <MapPin size={12} /> {perf.location}
                         </div>
                      </div>

                      {/* RSVP Buttons */}
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={() => handleRSVP(perf.id, RSVPStatus.CONFIRMED)}
                          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-all ${myStatus === RSVPStatus.CONFIRMED ? 'bg-emerald-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'}`}
                        >
                          <CheckCircle size={14} /> Asistiré
                        </button>
                        <button 
                          onClick={() => handleRSVP(perf.id, RSVPStatus.DECLINED)}
                          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-all ${myStatus === RSVPStatus.DECLINED ? 'bg-red-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200'}`}
                        >
                          <XCircle size={14} /> No iré
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add/Edit Performance */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
             <h3 className="text-xl font-bold text-slate-800 mb-4">{editingId ? 'Editar Actuación' : 'Programar Actuación'}</h3>
             <form onSubmit={handleSavePerformance} className="space-y-4">
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Título</label>
                   <input required type="text" className="w-full border p-2 rounded-lg" value={newPerformance.title} onChange={e => setNewPerformance({...newPerformance, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Fecha Inicio</label>
                      <input required type="date" className="w-full border p-2 rounded-lg" value={newPerformance.date} onChange={e => setNewPerformance({...newPerformance, date: e.target.value})} />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Fecha Fin (Opcional)</label>
                      <input type="date" className="w-full border p-2 rounded-lg" value={newPerformance.endDate || ''} onChange={e => setNewPerformance({...newPerformance, endDate: e.target.value})} />
                   </div>
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Hora</label>
                   <input required type="time" className="w-full border p-2 rounded-lg" value={newPerformance.time} onChange={e => setNewPerformance({...newPerformance, time: e.target.value})} />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Ubicación</label>
                   <input required type="text" className="w-full border p-2 rounded-lg" value={newPerformance.location} onChange={e => setNewPerformance({...newPerformance, location: e.target.value})} />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Descripción</label>
                   <textarea className="w-full border p-2 rounded-lg h-24" value={newPerformance.description} onChange={e => setNewPerformance({...newPerformance, description: e.target.value})}></textarea>
                </div>
                <div className="flex gap-2 pt-2">
                   <button type="button" onClick={closeModal} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600">Cancelar</button>
                   <button type="submit" className="flex-1 py-3 bg-emerald-600 rounded-xl font-bold text-white">Guardar</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformancesCalendar;
