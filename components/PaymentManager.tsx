
import React, { useState } from 'react';
import { User, PaymentRecord, PaymentStatus, UserRole, Gender } from '../types';
import { MONTH_NAMES } from '../constants';
import { Check, X, Clock, ChevronLeft, ChevronRight, Euro } from 'lucide-react';

interface PaymentManagerProps {
  users: User[];
  payments: PaymentRecord[];
  setPayments: React.Dispatch<React.SetStateAction<PaymentRecord[]>>;
  canEdit: boolean;
}

const PaymentManager: React.FC<PaymentManagerProps> = ({ users, payments, setPayments, canEdit }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // En esta vista solo mostramos los que nos pasan (ya vienen filtrados desde App.tsx)
  const students = users.filter(u => u.role === UserRole.STUDENT || u.role === UserRole.TEACHER);
  const isSingleUserView = students.length === 1;

  const handleMonthChange = (increment: number) => {
    let newMonth = selectedMonth + increment;
    let newYear = selectedYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const togglePayment = (studentId: string) => {
    if (!canEdit) return;

    setPayments(prev => {
      const existingIdx = prev.findIndex(p => p.studentId === studentId && p.month === selectedMonth && p.year === selectedYear);
      let newRecords = [...prev];

      if (existingIdx >= 0) {
        const current = newRecords[existingIdx].status;
        let next = PaymentStatus.PAID;
        if (current === PaymentStatus.PAID) next = PaymentStatus.PENDING;
        else if (current === PaymentStatus.PENDING) next = PaymentStatus.OVERDUE;
        
        newRecords[existingIdx] = { 
          ...newRecords[existingIdx], 
          status: next,
          paidDate: next === PaymentStatus.PAID ? new Date().toISOString() : undefined
        };
      } else {
        newRecords.push({
          id: Math.random().toString(36).substr(2, 9),
          studentId,
          month: selectedMonth,
          year: selectedYear,
          amount: 15, // Cuota actualizada a 15€
          status: PaymentStatus.PAID,
          paidDate: new Date().toISOString()
        });
      }
      return newRecords;
    });
  };

  const getPaymentStatus = (studentId: string) => {
    const record = payments.find(p => p.studentId === studentId && p.month === selectedMonth && p.year === selectedYear);
    return record ? record.status : PaymentStatus.PENDING;
  };

  const getRoleLabel = (user: User) => {
    const isFemale = user.gender === Gender.FEMALE;
    if (user.role === UserRole.TEACHER) return isFemale ? 'Profesora' : 'Profesor';
    return isFemale ? 'Bailarina' : 'Bailarín';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isSingleUserView ? 'Estado de mis Pagos' : 'Gestión de Tesorería'}
          </h2>
          <p className="text-slate-500">
            {isSingleUserView ? 'Consulta la situación de tus cuotas mensuales' : 'Control de cuotas mensuales de la agrupación'}
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <span className="font-bold text-lg text-emerald-800 w-40 text-center">
            {MONTH_NAMES[selectedMonth]} {selectedYear}
          </span>
          <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      {isSingleUserView && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-4 text-emerald-800 mb-2">
          <div className="bg-emerald-100 p-2 rounded-full">
            <Euro size={20} />
          </div>
          <p className="text-sm font-medium">La cuota mensual establecida para este periodo es de <strong>15,00 €</strong>.</p>
        </div>
      )}

      <div className={`grid grid-cols-1 ${isSingleUserView ? 'max-w-md' : 'lg:grid-cols-2 xl:grid-cols-3'} gap-4`}>
        {students.map(student => {
          const status = getPaymentStatus(student.id);
          
          let cardColor = "bg-white border-slate-200";
          let statusColor = "bg-slate-100 text-slate-500";
          let Icon = Clock;

          if (status === PaymentStatus.PAID) {
            cardColor = "bg-white border-emerald-200 shadow-emerald-50";
            statusColor = "bg-emerald-100 text-emerald-700";
            Icon = Check;
          } else if (status === PaymentStatus.OVERDUE) {
            cardColor = "bg-red-50 border-red-200";
            statusColor = "bg-red-100 text-red-700";
            Icon = X;
          } else {
             cardColor = "bg-amber-50 border-amber-200";
             statusColor = "bg-amber-100 text-amber-700";
             Icon = Clock;
          }

          return (
            <div key={student.id} className={`p-5 rounded-2xl border-2 transition-all duration-300 ${cardColor} flex items-center justify-between shadow-sm hover:shadow-md`}>
              <div className="flex items-center gap-4">
                <img src={student.avatar} alt="" className="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover" />
                <div>
                  <p className="font-bold text-slate-800 text-lg">{student.name}</p>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                      {getRoleLabel(student)}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${statusColor} inline-flex items-center gap-1 w-fit`}>
                      {status === PaymentStatus.PAID && 'Pagado'}
                      {status === PaymentStatus.PENDING && 'Pendiente'}
                      {status === PaymentStatus.OVERDUE && 'Atrasado'}
                    </span>
                  </div>
                </div>
              </div>

              {canEdit ? (
                <button 
                  onClick={() => togglePayment(student.id)}
                  className={`p-3 rounded-xl transition-all active:scale-95 ${
                    status === PaymentStatus.PAID 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                      : 'bg-white text-slate-400 border border-slate-200 hover:border-emerald-400 hover:text-emerald-600'
                  }`}
                  title="Cambiar estado de pago"
                >
                  <Icon size={24} />
                </button>
              ) : (
                <div className={`p-3 rounded-xl ${status === PaymentStatus.PAID ? 'text-emerald-600' : 'text-slate-300'}`}>
                  <Icon size={28} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {!isSingleUserView && students.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 text-slate-400">
          No hay integrantes registrados para mostrar cobros.
        </div>
      )}
    </div>
  );
};

export default PaymentManager;
