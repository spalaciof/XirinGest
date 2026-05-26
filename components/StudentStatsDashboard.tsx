
import React, { useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { User, AttendanceRecord, AttendanceStatus, Performance, PerformanceAttendance, UserRole } from '../types';
import { Award, CalendarDays, TrendingUp, Zap, ArrowLeft, Music } from 'lucide-react';
import { MONTH_NAMES } from '../constants';

interface StudentStatsDashboardProps {
  studentId: string;
  users: User[];
  rehearsalAttendance: AttendanceRecord[];
  performances: Performance[];
  performanceAttendance: PerformanceAttendance[];
  onBack?: () => void;
  showBackButton?: boolean;
}

const StudentStatsDashboard: React.FC<StudentStatsDashboardProps> = ({
  studentId,
  users,
  rehearsalAttendance,
  performances,
  performanceAttendance,
  onBack,
  showBackButton
}) => {
  const targetUser = users.find(u => u.id === studentId);
  const isMusician = targetUser?.role === UserRole.MUSICIAN;

  // --- LÓGICA DE CALENDARIO ESCOLAR Y FESTIVOS ASTURIAS ---
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

  // --- CÁLCULO DINÁMICO DE DÍAS DE ENSAYO ---
  const getEffectiveScheduledDates = (limitDate: string) => {
    const target = new Date(limitDate);
    const start = new Date(target.getFullYear(), 0, 1);
    
    const dates = new Set<string>();
    
    // 1. Días oficiales por calendario
    const temp = new Date(start);
    while (temp <= target) {
      if (isRehearsalDay(new Date(temp))) {
        dates.add(temp.toISOString().split('T')[0]);
      }
      temp.setDate(temp.getDate() + 1);
    }

    // 2. Días que tengan registros reales (ensayos extraordinarios)
    rehearsalAttendance.forEach(record => {
      const recordDate = new Date(record.date);
      if (recordDate >= start && recordDate <= target) {
        dates.add(record.date);
      }
    });

    return Array.from(dates).sort();
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const effectiveScheduledUntilNow = useMemo(() => getEffectiveScheduledDates(todayStr), [todayStr, rehearsalAttendance]);
  const myAttendanceRecords = rehearsalAttendance.filter(a => a.studentId === studentId);

  const detailedStats = useMemo(() => {
    const historicalDates = effectiveScheduledUntilNow.filter(d => d <= todayStr);
    const totalScheduled = historicalDates.length;

    let present = 0;
    let late = 0;
    let excused = 0;
    let absent = 0;

    historicalDates.forEach(date => {
      const record = myAttendanceRecords.find(a => a.date === date);
      if (!record) {
        absent++;
      } else {
        switch (record.status) {
          case AttendanceStatus.PRESENT: present++; break;
          case AttendanceStatus.LATE: late++; break;
          case AttendanceStatus.EXCUSED: excused++; break;
          case AttendanceStatus.ABSENT: absent++; break;
          default: absent++;
        }
      }
    });

    const presentPct = totalScheduled > 0 ? Math.round(((present + late) / totalScheduled) * 100) : 0;
    
    // Performance Stats (Verified by Teacher)
    const currentYear = new Date().getFullYear();
    const pastPerformances = performances.filter(p => {
      const d = new Date(p.date);
      return d.getFullYear() === currentYear && d <= new Date();
    });
    
    const performancesWithVerification = pastPerformances.filter(p => {
       const record = performanceAttendance.find(pa => pa.performanceId === p.id && pa.userId === studentId);
       return record?.verifiedStatus !== undefined;
    });

    const totalVerifiedPerformances = performancesWithVerification.length;
    const attendedVerifiedPerformances = performancesWithVerification.filter(p => {
      const record = performanceAttendance.find(pa => pa.performanceId === p.id && pa.userId === studentId);
      return record?.verifiedStatus === AttendanceStatus.PRESENT || record?.verifiedStatus === AttendanceStatus.LATE;
    }).length;

    const performancePct = totalVerifiedPerformances > 0 ? Math.round((attendedVerifiedPerformances / totalVerifiedPerformances) * 100) : 0;

    return {
      totalScheduled,
      present,
      late,
      excused,
      absent,
      presentPct,
      presentOnlyPct: totalScheduled > 0 ? Math.round((present / totalScheduled) * 100) : 0,
      latePct: totalScheduled > 0 ? Math.round((late / totalScheduled) * 100) : 0,
      excusedPct: totalScheduled > 0 ? Math.round((excused / totalScheduled) * 100) : 0,
      absentPct: totalScheduled > 0 ? Math.round((absent / totalScheduled) * 100) : 0,
      performancePct
    };
  }, [effectiveScheduledUntilNow, myAttendanceRecords, performances, performanceAttendance, studentId, todayStr]);

  const monthlyChartData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return MONTH_NAMES.map((monthName, index) => {
      const monthPrefix = `${currentYear}-${(index + 1).toString().padStart(2, '0')}`;
      const monthRehearsals = effectiveScheduledUntilNow.filter(d => d.startsWith(monthPrefix));
      if (monthRehearsals.length === 0) return null;
      const attended = myAttendanceRecords.filter(a => a.date.startsWith(monthPrefix) && (a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE)).length;
      return { name: monthName.substring(0, 3), dias: attended, total: monthRehearsals.length, fullName: monthName };
    }).filter(Boolean);
  }, [effectiveScheduledUntilNow, myAttendanceRecords]);

  const groupedAttendance = useMemo(() => {
    const groups: Record<string, { date: string, status?: AttendanceStatus }[]> = {};
    const historical = effectiveScheduledUntilNow.filter(d => d <= todayStr).reverse();
    historical.forEach(date => {
      const monthKey = date.substring(0, 7);
      if (!groups[monthKey]) groups[monthKey] = [];
      const record = myAttendanceRecords.find(a => a.date === date);
      groups[monthKey].push({ date, status: record?.status || AttendanceStatus.ABSENT });
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [effectiveScheduledUntilNow, myAttendanceRecords, todayStr]);

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

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="mb-6 flex items-center gap-4">
        {showBackButton && onBack && (
          <button 
            onClick={onBack}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            title="Volver al listado"
          >
            <ArrowLeft size={24} className="text-slate-600"/>
          </button>
        )}
        <div>
          <h2 className="text-3xl font-bold text-slate-800">
            {showBackButton ? `Estadísticas: ${targetUser?.name}` : 'Mi Panel de Compromiso'}
          </h2>
          <p className="text-slate-500">Métricas detalladas de participación anual</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 overflow-hidden relative">
         <div className="absolute top-0 right-0 p-8 opacity-5">
           {isMusician ? <Music size={120} /> : <Award size={120} />}
         </div>

         <div className="space-y-8 relative z-10">
            
            {/* Solo mostramos la barra de ensayos si NO es músico */}
            {!isMusician && (
              <div>
                <div className="flex justify-between items-end mb-2">
                  <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <Zap size={20} className="text-amber-500 fill-amber-500" />
                    Asistencia a Ensayos
                  </h3>
                  <span className="text-2xl font-black text-slate-800">{detailedStats.presentPct}%</span>
                </div>
                <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${detailedStats.presentPct}%`,
                      background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)'
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Barra de Actuaciones - Siempre visible */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                  <Award size={20} className="text-purple-500 fill-purple-500" />
                  Asistencia a Actuaciones
                </h3>
                <span className="text-2xl font-black text-slate-800">{detailedStats.performancePct}%</span>
              </div>
              <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${detailedStats.performancePct}%`,
                    background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)'
                  }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-1 italic">* Calculado solo sobre las actuaciones verificadas por la dirección.</p>
            </div>

            {/* Desglose de Ensayos - Oculto para Músicos */}
            {!isMusician && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100 mt-6">
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-center">
                  <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Presente</p>
                  <p className="text-xl font-black text-emerald-800">{detailedStats.presentOnlyPct}%</p>
                  <p className="text-[10px] text-emerald-600/70">{detailedStats.present} días</p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-center">
                  <p className="text-xs font-bold text-blue-600 uppercase mb-1">Retraso</p>
                  <p className="text-xl font-black text-blue-800">{detailedStats.latePct}%</p>
                  <p className="text-[10px] text-blue-600/70">{detailedStats.late} días</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center">
                  <p className="text-xs font-bold text-amber-600 uppercase mb-1">Justificado</p>
                  <p className="text-xl font-black text-amber-800">{detailedStats.excusedPct}%</p>
                  <p className="text-[10px] text-amber-600/70">{detailedStats.excused} días</p>
                </div>
                <div className="bg-red-50 rounded-2xl p-4 border border-red-100 text-center">
                  <p className="text-xs font-bold text-red-600 uppercase mb-1">Ausente</p>
                  <p className="text-xl font-black text-red-800">{detailedStats.absentPct}%</p>
                  <p className="text-[10px] text-red-600/70">{detailedStats.absent} días</p>
                </div>
              </div>
            )}
         </div>
      </div>

      {/* Gráfico y Lista de Ensayos - Oculto para Músicos */}
      {!isMusician && (
        <>
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
            <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-600" />
              Evolución Mensual (Días Asistidos)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyChartData}>
                  <defs>
                    <linearGradient id="colorDias" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    formatter={(value, name, props) => [`${value} de ${props.payload.total} ensayos`, 'Asistencia']}
                  />
                  <Area type="monotone" dataKey="dias" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorDias)" dot={{ r: 5, fill: '#10b981', stroke: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {groupedAttendance.map(([monthKey, days]) => (
              <div key={monthKey} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <CalendarDays size={18} className="text-emerald-600" />
                    {MONTH_NAMES[parseInt(monthKey.split('-')[1]) - 1]} {monthKey.split('-')[0]}
                  </h3>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{days.length} Registros</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {days.map(day => (
                    <div key={day.date} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{new Date(day.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}</span>
                        <span className="text-xs text-slate-400 font-medium">{isRehearsalDay(new Date(day.date)) ? 'Ensayo de Agrupación' : 'Ensayo Extraordinario'}</span>
                      </div>
                      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColorClass(day.status)}`}>
                        {getStatusLabel(day.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentStatsDashboard;
