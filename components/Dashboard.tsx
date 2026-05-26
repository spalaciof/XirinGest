
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { User, AttendanceRecord, AttendanceStatus, PaymentRecord, PaymentStatus, UserRole, Performance, PerformanceAttendance, RSVPStatus } from '../types';
import { Users, TrendingUp, AlertCircle, Euro, CalendarDays, Wallet, Star, Music, Check, X, HelpCircle } from 'lucide-react';
import { MONTH_NAMES } from '../constants';

interface DashboardProps {
  users: User[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  performances?: Performance[];
  performanceAttendance?: PerformanceAttendance[];
}

const COLORS = ['#059669', '#F59E0B', '#EF4444', '#3B82F6'];

const Dashboard: React.FC<DashboardProps> = ({ 
  users, 
  attendance, 
  payments, 
  performances = [], 
  performanceAttendance = [] 
}) => {
  
  // Stats Calculation
  const stats = useMemo(() => {
    const students = users.filter(u => u.role === UserRole.STUDENT);
    const totalStudents = students.length;
    
    // Attendance Rate (Global)
    const totalAttendanceRecords = attendance.length;
    const presentCount = attendance.filter(a => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE).length;
    const attendanceRate = totalAttendanceRecords ? Math.round((presentCount / totalAttendanceRecords) * 100) : 0;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Revenue this month
    const paidThisMonth = payments.filter(p => p.month === currentMonth && p.year === currentYear && p.status === PaymentStatus.PAID);
    const monthlyRevenue = paidThisMonth.reduce((acc, curr) => acc + curr.amount, 0);

    // Annual Revenue (RECAUDADO TOTAL ANUAL)
    const paidThisYear = payments.filter(p => p.year === currentYear && p.status === PaymentStatus.PAID);
    const annualRevenue = paidThisYear.reduce((acc, curr) => acc + curr.amount, 0);

    // Pending Payments (Current Month only)
    const pendingThisMonth = payments.filter(p => p.month === currentMonth && p.year === currentYear && p.status !== PaymentStatus.PAID).length;

    return { totalStudents, attendanceRate, monthlyRevenue, annualRevenue, pendingThisMonth };
  }, [users, attendance, payments]);

  // Chart Data: Attendance Trend (Monthly)
  const annualAttendanceTrend = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    return MONTH_NAMES.map((name, index) => {
      const monthPrefix = `${currentYear}-${(index + 1).toString().padStart(2, '0')}`;
      const recordsThisMonth = attendance.filter(a => a.date.startsWith(monthPrefix));
      
      const presentCount = recordsThisMonth.filter(a => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE).length;
      const total = recordsThisMonth.length;
      const rate = total > 0 ? Math.round((presentCount / total) * 100) : null;
      
      return { month: name.substring(0, 3), Porcentaje: rate };
    }).filter(d => d.Porcentaje !== null);
  }, [attendance]);

  // Chart Data: Payment Status (MENSUAL)
  const paymentStatusData = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const monthlyPayments = payments.filter(p => p.month === currentMonth && p.year === currentYear);
    
    const paid = monthlyPayments.filter(p => p.status === PaymentStatus.PAID).length;
    const pending = monthlyPayments.filter(p => p.status === PaymentStatus.PENDING).length;
    const overdue = monthlyPayments.filter(p => p.status === PaymentStatus.OVERDUE).length;
    
    return [
      { name: 'Pagado', value: paid },
      { name: 'Pendiente', value: pending },
      { name: 'Atrasado', value: overdue },
    ];
  }, [payments]);

  // Chart Data: Total Attendance Ranking (Rehearsals vs Performances)
  const engagementRanking = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Filter relevant members (Students and Musicians)
    const members = users.filter(u => u.role === UserRole.STUDENT || u.role === UserRole.MUSICIAN);

    // Filter performances of this year that have passed
    const yearPerformances = performances.filter(p => {
      const d = new Date(p.date);
      return d.getFullYear() === currentYear && d < today;
    });

    return members.map(member => {
      // Rehearsal Stats (Only for Students usually, but let's calc for all if records exist)
      const memberRehearsals = attendance.filter(a => 
        a.studentId === member.id && 
        new Date(a.date).getFullYear() === currentYear
      );
      const rehearsalPresent = memberRehearsals.filter(a => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE).length;
      const rehearsalTotal = memberRehearsals.length;
      const rehearsalPct = rehearsalTotal > 0 ? Math.round((rehearsalPresent / rehearsalTotal) * 100) : 0;

      // Performance Stats
      const memberPerfAttendance = performanceAttendance.filter(pa => 
        pa.userId === member.id && 
        yearPerformances.some(yp => yp.id === pa.performanceId)
      );
      const perfPresent = memberPerfAttendance.filter(pa => pa.status === RSVPStatus.CONFIRMED).length;
      const perfTotal = yearPerformances.length; // Compare against total events, not just answered ones
      const perfPct = perfTotal > 0 ? Math.round((perfPresent / perfTotal) * 100) : 0;

      return {
        name: member.name.split(' ')[0], // First name
        fullName: member.name,
        Ensayos: rehearsalPct,
        Actuaciones: perfPct,
        average: (rehearsalPct + perfPct) / 2
      };
    }).sort((a, b) => b.average - a.average);

  }, [users, attendance, performances, performanceAttendance]);

  // --- Musician Specific Stats ---
  const musicianStats = useMemo(() => {
    const musicians = users.filter(u => u.role === UserRole.MUSICIAN);
    const sortedPerformances = [...performances].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const chartData = musicians.map(m => {
      const confirmedCount = performanceAttendance.filter(pa => 
        pa.userId === m.id && pa.status === RSVPStatus.CONFIRMED
      ).length;
      const total = sortedPerformances.length;
      const percentage = total > 0 ? Math.round((confirmedCount / total) * 100) : 0;
      
      return {
        name: m.name,
        Asistencia: percentage,
        count: confirmedCount,
        total: total
      };
    }).sort((a, b) => b.Asistencia - a.Asistencia);

    return { musicians, sortedPerformances, chartData };
  }, [users, performances, performanceAttendance]);

  // --- NEW: Dancer Specific Stats ---
  const dancerStats = useMemo(() => {
    const students = users.filter(u => u.role === UserRole.STUDENT);
    const sortedPerformances = [...performances].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const chartData = students.map(s => {
      const confirmedCount = performanceAttendance.filter(pa => 
        pa.userId === s.id && pa.status === RSVPStatus.CONFIRMED
      ).length;
      const total = sortedPerformances.length;
      const percentage = total > 0 ? Math.round((confirmedCount / total) * 100) : 0;
      
      return {
        name: s.name,
        Asistencia: percentage,
        count: confirmedCount,
        total: total
      };
    }).sort((a, b) => b.Asistencia - a.Asistencia);

    // Ordenamos también la lista de estudiantes para la tabla para que coincida con el ranking
    const sortedStudents = [...students].sort((a, b) => {
      const statsA = chartData.find(d => d.name === a.name);
      const statsB = chartData.find(d => d.name === b.name);
      return (statsB?.Asistencia || 0) - (statsA?.Asistencia || 0);
    });

    return { students: sortedStudents, sortedPerformances, chartData };
  }, [users, performances, performanceAttendance]);


  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Panel General de Gestión</h2>
        <p className="text-slate-500">Resumen integral de la agrupación XirinGest</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600 w-fit mb-3">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bailadores</p>
            <p className="text-2xl font-black text-emerald-700">{stats.totalStudents}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="bg-blue-100 p-2 rounded-xl text-blue-600 w-fit mb-3">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Asistencia Media</p>
            <p className="text-2xl font-black text-blue-600">{stats.attendanceRate}%</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="bg-amber-100 p-2 rounded-xl text-amber-600 w-fit mb-3">
            <Euro size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recaudado (Mes)</p>
            <p className="text-2xl font-black text-amber-500">{stats.monthlyRevenue} €</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="bg-emerald-900 p-2 rounded-xl text-amber-400 w-fit mb-3 shadow-md">
            <Wallet size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Anual</p>
            <p className="text-2xl font-black text-emerald-900">{stats.annualRevenue} €</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="bg-red-100 p-2 rounded-xl text-red-600 w-fit mb-3">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pendientes (Mes)</p>
            <p className="text-2xl font-black text-red-500">{stats.pendingThisMonth}</p>
          </div>
        </div>
      </div>

      {/* Middle Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
          <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            Tendencia de Asistencia (Global)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={annualAttendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`${value}%`, 'Asistencia']}
                />
                <Line 
                  type="monotone" 
                  dataKey="Porcentaje" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
          <h3 className="text-lg font-bold text-slate-700 mb-2 flex items-center gap-2">
            <Euro size={20} className="text-emerald-500" />
            Pagos del Mes Corriente
          </h3>
          <p className="text-xs text-slate-400 mb-4">Estado mensual de las cuotas de 15€</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION: Dancers Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart: Dancers Performance Attendance % */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
          <h3 className="text-lg font-bold text-slate-700 mb-2 flex items-center gap-2">
            <Users size={20} className="text-pink-500" />
            Asistencia de Bailarines
          </h3>
          <p className="text-xs text-slate-400 mb-6">% de Actuaciones confirmadas sobre el total programado.</p>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={dancerStats.chartData} 
                layout="vertical" 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                barSize={12}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 10, fontWeight: 600}} 
                  width={100}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value, name, props) => [`${value}%`, `Asistencia (${props.payload.count}/${props.payload.total})`]}
                />
                <Bar 
                  dataKey="Asistencia" 
                  name="Asistencia" 
                  fill="#059669" 
                  radius={[0, 4, 4, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Matrix: Dancers */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 overflow-hidden flex flex-col h-[480px]">
          <h3 className="text-lg font-bold text-slate-700 mb-2 flex items-center gap-2">
            <CalendarDays size={20} className="text-orange-500" />
            Desglose por Actuación (Bailarines)
          </h3>
          <p className="text-xs text-slate-400 mb-4">Detalle de asistencia de cada bailarín a los eventos.</p>
          
          <div className="overflow-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-2 pl-2 font-bold text-slate-500 sticky left-0 bg-white z-10 min-w-[120px]">Bailarín</th>
                  {dancerStats.sortedPerformances.map(p => (
                    <th key={p.id} className="py-2 px-3 font-medium text-slate-400 text-xs whitespace-nowrap text-center">
                      <div className="w-20 truncate" title={p.title}>{p.title}</div>
                      <div className="text-[10px] opacity-70">{new Date(p.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dancerStats.students.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="py-2 pl-2 font-bold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-xs">
                      {student.name}
                    </td>
                    {dancerStats.sortedPerformances.map(p => {
                      const record = performanceAttendance.find(pa => pa.userId === student.id && pa.performanceId === p.id);
                      const status = record?.status;
                      
                      let Icon = HelpCircle;
                      let colorClass = "text-slate-300";

                      if (status === RSVPStatus.CONFIRMED) {
                        Icon = Check;
                        colorClass = "text-emerald-500 bg-emerald-50 rounded-full p-0.5";
                      } else if (status === RSVPStatus.DECLINED) {
                        Icon = X;
                        colorClass = "text-red-400 bg-red-50 rounded-full p-0.5";
                      } else {
                        Icon = HelpCircle;
                        colorClass = "text-slate-200";
                      }

                      return (
                        <td key={p.id} className="py-2 px-2 text-center">
                           <div className="flex justify-center">
                             <Icon size={16} className={colorClass} />
                           </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {dancerStats.sortedPerformances.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-slate-400 italic">No hay actuaciones registradas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION: Musicians Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart: Musicians Performance Attendance % */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
          <h3 className="text-lg font-bold text-slate-700 mb-2 flex items-center gap-2">
            <Music size={20} className="text-violet-500" />
            Asistencia de Músicos
          </h3>
          <p className="text-xs text-slate-400 mb-6">% de Actuaciones confirmadas sobre el total programado.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={musicianStats.chartData} 
                layout="vertical" 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 11, fontWeight: 600}} 
                  width={100}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value, name, props) => [`${value}%`, `Asistencia (${props.payload.count}/${props.payload.total})`]}
                />
                <Bar 
                  dataKey="Asistencia" 
                  name="Asistencia" 
                  fill="#8b5cf6" 
                  radius={[0, 4, 4, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Matrix: Musicians */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold text-slate-700 mb-2 flex items-center gap-2">
            <CalendarDays size={20} className="text-orange-500" />
            Desglose por Actuación (Músicos)
          </h3>
          <p className="text-xs text-slate-400 mb-4">Detalle de asistencia de cada músico a los eventos.</p>
          
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-2 pl-2 font-bold text-slate-500 sticky left-0 bg-white z-10 min-w-[120px]">Músico</th>
                  {musicianStats.sortedPerformances.map(p => (
                    <th key={p.id} className="py-2 px-3 font-medium text-slate-400 text-xs whitespace-nowrap text-center">
                      <div className="w-20 truncate" title={p.title}>{p.title}</div>
                      <div className="text-[10px] opacity-70">{new Date(p.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {musicianStats.musicians.map(musician => (
                  <tr key={musician.id} className="hover:bg-slate-50">
                    <td className="py-3 pl-2 font-bold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      {musician.name.split(' ')[0]}
                    </td>
                    {musicianStats.sortedPerformances.map(p => {
                      const record = performanceAttendance.find(pa => pa.userId === musician.id && pa.performanceId === p.id);
                      const status = record?.status;
                      
                      let Icon = HelpCircle;
                      let colorClass = "text-slate-300";

                      if (status === RSVPStatus.CONFIRMED) {
                        Icon = Check;
                        colorClass = "text-emerald-500 bg-emerald-50 rounded-full p-1";
                      } else if (status === RSVPStatus.DECLINED) {
                        Icon = X;
                        colorClass = "text-red-400 bg-red-50 rounded-full p-1";
                      } else {
                        Icon = HelpCircle;
                        colorClass = "text-slate-200";
                      }

                      return (
                        <td key={p.id} className="py-2 px-2 text-center">
                           <div className="flex justify-center">
                             <Icon size={20} className={colorClass} />
                           </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {musicianStats.sortedPerformances.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-slate-400 italic">No hay actuaciones registradas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Engagement Ranking Chart (Existing) */}
      <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
        <h3 className="text-lg font-bold text-slate-700 mb-2 flex items-center gap-2">
          <Star size={20} className="text-amber-500" />
          Ranking de Compromiso (Año Actual)
        </h3>
        <p className="text-xs text-slate-400 mb-6">Comparativa de % Asistencia a Ensayos vs. % Participación en Actuaciones por miembro.</p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={engagementRanking} 
              layout="vertical" 
              margin={{ top: 5, right: 30, left: 40, bottom: 40 }}
              barGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#475569', fontSize: 11, fontWeight: 600}} 
                width={80}
              />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar 
                dataKey="Ensayos" 
                name="Asistencia Ensayos" 
                fill="#3b82f6" 
                radius={[0, 4, 4, 0]} 
                barSize={10}
              />
              <Bar 
                dataKey="Actuaciones" 
                name="Participación Actuaciones" 
                fill="#F59E0B" 
                radius={[0, 4, 4, 0]} 
                barSize={10}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
