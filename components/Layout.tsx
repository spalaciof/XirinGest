
import React, { useState } from 'react';
import { 
  Users, 
  CalendarCheck, 
  CreditCard, 
  BarChart3, 
  LogOut, 
  Menu,
  Music4,
  UserCircle,
  UserPlus,
  Music,
  Bell,
  Check,
  X,
  Key,
  CalendarDays,
  Zap,
  Award
} from 'lucide-react';
import { User, UserRole, Gender, PasswordRequest, Performance, PerformanceAttendance, RSVPStatus } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
  onAddStudentClick?: () => void;
  onAddMusicianClick?: () => void;
  passwordRequests: PasswordRequest[];
  onApproveRequest: (requestId: string) => void;
  // New props for performances notifications
  performances?: Performance[];
  performanceAttendance?: PerformanceAttendance[];
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onLogout, 
  onAddStudentClick,
  onAddMusicianClick,
  passwordRequests,
  onApproveRequest,
  performances = [],
  performanceAttendance = []
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Panel General', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { id: 'performances', label: 'Calendario Actuaciones', icon: CalendarDays, roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.MUSICIAN] },
    { id: 'students', label: 'Bailarines', icon: Users, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { id: 'musicians', label: 'Músicos', icon: Music, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { 
      id: 'attendance_rehearsals', 
      label: currentUser.role === UserRole.STUDENT ? 'Asistencia' : 'Asistencia Ensayos', 
      icon: Zap, 
      roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT] 
    },
    { id: 'attendance_performances', label: 'Asistencia Actuaciones', icon: Award, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { id: 'payments', label: 'Mis Pagos', icon: CreditCard, roles: [UserRole.STUDENT] },
    { id: 'payments_admin', label: 'Tesorería', icon: CreditCard, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { id: 'profile', label: 'Mi Perfil', icon: UserCircle, roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.MUSICIAN] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(currentUser.role));
  const canAddMember = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.TEACHER;
  const isAdmin = currentUser.role === UserRole.ADMIN;
  
  // Calculate Notifications
  let notificationCount = 0;
  let pendingPerformances: Performance[] = [];

  if (isAdmin) {
    notificationCount = passwordRequests.length;
  }
  
  // Logic for Pending Performances (Students/Musicians)
  if (currentUser.role === UserRole.STUDENT || currentUser.role === UserRole.MUSICIAN) {
    const today = new Date().toISOString().split('T')[0];
    const upcoming = performances.filter(p => p.date >= today);
    
    pendingPerformances = upcoming.filter(p => {
      const response = performanceAttendance.find(pa => pa.performanceId === p.id && pa.userId === currentUser.id);
      return !response || response.status === RSVPStatus.PENDING;
    });
    
    notificationCount += pendingPerformances.length;
  }

  const getDisplayRole = () => {
    if (currentUser.role === UserRole.ADMIN) return 'Administrador';
    if (currentUser.role === UserRole.TEACHER) {
      return currentUser.gender === Gender.FEMALE ? 'Profesora de Baile' : 'Profesor de Baile';
    }
    if (currentUser.role === UserRole.MUSICIAN) {
      return currentUser.musicianType === 'GAITERO' ? 'Gaitero' : 'Tamboritero';
    }
    return currentUser.gender === Gender.FEMALE ? 'Bailarina' : 'Bailarín';
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-emerald-900 text-white shadow-xl relative z-30">
        <div className="py-8 px-4 flex flex-col items-center text-center border-b border-emerald-800">
          <div className="bg-amber-400 p-3 rounded-2xl text-emerald-900 shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300">
            <Music4 size={32} strokeWidth={2.5} />
          </div>
          
          <h1 className="text-3xl font-black mb-1 tracking-tight leading-none">
            <span className="text-red-500">Xirin</span><span className="text-white">Gest</span>
          </h1>
          
          <div className="h-1 w-12 bg-emerald-700 mx-auto rounded-full my-3"></div>
          
          <p className="text-emerald-300 font-bold text-[10px] uppercase tracking-widest px-2 leading-relaxed">
            Gestión Integral de Grupo Folklórico
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-amber-400 text-emerald-950 font-semibold shadow-lg translate-x-1' 
                  : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {/* Badge for menu item if pending performances */}
              {item.id === 'performances' && pendingPerformances.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 rounded-full ml-auto">
                  {pendingPerformances.length}
                </span>
              )}
            </button>
          ))}

          {/* Special Quick Actions for Teachers/Admin */}
          {canAddMember && (
            <div className="pt-4 mt-4 border-t border-emerald-800 space-y-3">
              <button
                onClick={onAddStudentClick}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-400 text-emerald-950 font-bold shadow-lg hover:bg-amber-300 transition-all active:scale-95"
              >
                <UserPlus size={18} />
                <span className="text-sm">Añadir Bailarín</span>
              </button>
              <button
                onClick={onAddMusicianClick}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-500 text-white font-bold shadow-lg hover:bg-indigo-400 transition-all active:scale-95"
              >
                <Music size={18} />
                <span className="text-sm">Añadir Músico</span>
              </button>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-emerald-800 bg-emerald-950">
          {/* Notification Area for ALL Users */}
          <div className="mb-4 relative">
              <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-emerald-900 rounded-lg hover:bg-emerald-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-amber-400" />
                  <span className="text-sm font-medium text-emerald-100">Avisos</span>
                </div>
                {notificationCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {notificationCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {isNotificationsOpen && (
                <div className="absolute bottom-full left-0 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 mb-2 overflow-hidden text-slate-800 z-50">
                  <div className="p-3 border-b border-slate-100 bg-slate-50 font-bold text-xs uppercase text-slate-500">
                    Notificaciones
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notificationCount === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-xs">No hay notificaciones pendientes.</div>
                    ) : (
                      <>
                        {/* Admin: Password Requests */}
                        {isAdmin && passwordRequests.map(req => (
                          <div key={req.id} className="p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-bold text-sm text-slate-800">{req.userName}</p>
                                  <p className="text-xs text-slate-500">Solicitud Contraseña</p>
                                </div>
                                <span className="text-[10px] text-slate-400">{new Date(req.requestDate).toLocaleDateString()}</span>
                            </div>
                            <button 
                              onClick={() => onApproveRequest(req.id)}
                              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                            >
                              <Key size={12} />
                              Generar
                            </button>
                          </div>
                        ))}

                        {/* Students: Pending Performances */}
                        {pendingPerformances.map(perf => (
                          <div key={perf.id} className="p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors bg-amber-50/50">
                             <div className="mb-2">
                               <p className="font-bold text-sm text-slate-800 truncate">{perf.title}</p>
                               <p className="text-xs text-amber-600 font-bold">¡Nueva Actuación!</p>
                             </div>
                             <button
                               onClick={() => { setActiveTab('performances'); setIsNotificationsOpen(false); }}
                               className="w-full text-xs font-bold text-emerald-600 hover:underline text-left"
                             >
                               Ir al calendario &rarr;
                             </button>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <img src={currentUser.avatar} alt="Profile" className="w-10 h-10 rounded-full border-2 border-amber-400 object-cover" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-emerald-400 uppercase tracking-wider">{getDisplayRole()}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-emerald-800 hover:bg-red-700 text-white text-sm transition-colors"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-emerald-900 text-white z-50 flex items-center justify-between p-4 shadow-md">
        <div className="flex items-center gap-2">
           <Music4 size={20} className="text-amber-400"/>
           <span className="font-black text-lg tracking-tight">
             <span className="text-red-500">Xirin</span><span className="text-white">Gest</span>
           </span>
        </div>
        <div className="flex items-center gap-4">
           {notificationCount > 0 && (
             <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                className="relative"
             >
                <Bell size={24} />
                <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full border-2 border-emerald-900"></span>
             </button>
           )}
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             <Menu size={24} />
           </button>
        </div>
      </div>

      {/* Mobile Notifications Modal */}
      {isNotificationsOpen && (
         <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 md:hidden" onClick={() => setIsNotificationsOpen(false)}>
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
               <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Notificaciones</h3>
                  <button onClick={() => setIsNotificationsOpen(false)}><X size={20} /></button>
               </div>
               <div className="max-h-80 overflow-y-auto p-2">
                  {notificationCount === 0 ? (
                       <div className="p-8 text-center text-slate-400">No hay notificaciones pendientes.</div>
                     ) : (
                       <>
                         {isAdmin && passwordRequests.map(req => (
                           <div key={req.id} className="p-4 border-b border-slate-100 bg-slate-50 rounded-xl mb-2">
                              <div className="mb-3">
                                   <p className="font-bold text-slate-800">{req.userName}</p>
                                   <p className="text-xs text-slate-500">Solicitud Contraseña • {new Date(req.requestDate).toLocaleDateString()}</p>
                              </div>
                              <button 
                                onClick={() => { onApproveRequest(req.id); setIsNotificationsOpen(false); }}
                                className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-3 rounded-xl"
                              >
                                <Key size={16} />
                                Generar & Enviar
                              </button>
                           </div>
                         ))}
                         {pendingPerformances.map(perf => (
                           <div key={perf.id} className="p-4 border-b border-slate-100 bg-amber-50 rounded-xl mb-2">
                              <p className="font-bold text-slate-800">{perf.title}</p>
                              <p className="text-xs text-amber-700 mb-2">Requiere confirmación de asistencia</p>
                              <button 
                                onClick={() => { setActiveTab('performances'); setIsNotificationsOpen(false); }}
                                className="w-full bg-amber-400 text-emerald-900 font-bold py-2 rounded-lg"
                              >
                                Ver Calendario
                              </button>
                           </div>
                         ))}
                       </>
                     )}
               </div>
            </div>
         </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-emerald-900 z-40 pt-20 px-4 md:hidden overflow-y-auto">
           <nav className="space-y-3 pb-8">
            {filteredMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-lg text-lg ${
                  activeTab === item.id 
                    ? 'bg-amber-400 text-emerald-950 font-bold' 
                    : 'text-white border border-emerald-700'
                }`}
              >
                <item.icon size={24} />
                <span>{item.label}</span>
                {item.id === 'performances' && pendingPerformances.length > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                    {pendingPerformances.length}
                  </span>
                )}
              </button>
            ))}
            {canAddMember && (
              <>
                <button 
                  onClick={() => { onAddStudentClick?.(); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-lg text-lg bg-amber-400 text-emerald-950 font-bold"
                >
                  <UserPlus size={24} />
                  <span>Añadir Bailarín</span>
                </button>
                <button 
                  onClick={() => { onAddMusicianClick?.(); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-lg text-lg bg-indigo-500 text-white font-bold"
                >
                  <Music size={24} />
                  <span>Añadir Músico</span>
                </button>
              </>
            )}
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-lg text-lg text-red-300 border border-red-900"
            >
              <LogOut size={24} />
              Cerrar Sesión
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
