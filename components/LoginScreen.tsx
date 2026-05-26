
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Shield, GraduationCap, Users, Music4, Lock, Mail, ChevronLeft, AlertCircle, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
  onRequestPassword: (email: string) => boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin, onRequestPassword }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Request Password State
  const [isRequestingPass, setIsRequestingPass] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');
  const [requestStatus, setRequestStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password &&
      u.role === selectedRole
    );

    if (user) {
      onLogin(user);
    } else {
      setError('Credenciales incorrectas para este perfil.');
    }
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onRequestPassword(requestEmail);
    if (success) {
      setRequestStatus('success');
      setTimeout(() => {
        setIsRequestingPass(false);
        setRequestStatus('idle');
        setRequestEmail('');
      }, 3000);
    } else {
      setRequestStatus('error');
    }
  };

  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return { title: 'Administrador', icon: Shield };
      case UserRole.TEACHER: return { title: 'Profesor', icon: GraduationCap };
      case UserRole.STUDENT: return { title: 'Bailarín', icon: Users };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center relative overflow-hidden font-montserrat">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-[45vh] bg-emerald-900 transform -skew-y-3 origin-top-left z-0 scale-110 -translate-y-10"></div>

      <div className="z-10 w-full max-w-6xl px-4 pt-16 flex-1 flex flex-col items-center">
        
        {/* Header Card Section */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-emerald-900/20 p-8 md:px-16 md:py-10 flex flex-col items-center text-center mb-16 relative animate-in fade-in slide-in-from-top duration-700 max-w-2xl w-full">
             {/* Floating Icon */}
             <div className="absolute -top-10 bg-amber-400 p-5 rounded-3xl shadow-lg text-emerald-900 transform hover:scale-110 transition-transform duration-300">
                <Music4 size={40} strokeWidth={2.5} />
             </div>
             
             {/* Main Title */}
             <div className="mt-6">
               <h1 className="text-5xl md:text-6xl font-black mb-2 tracking-tight">
                 <span className="text-red-600">Xirin</span><span className="text-black">Gest</span>
               </h1>
               <div className="h-1 w-24 bg-slate-100 mx-auto rounded-full my-4"></div>
               <p className="text-black font-bold text-sm md:text-base uppercase tracking-widest">
                 Gestión Integral de Grupo Folklórico
               </p>
             </div>
        </div>

        {/* Modal Solicitar Contraseña */}
        {isRequestingPass && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative">
               <button 
                  onClick={() => setIsRequestingPass(false)}
                  className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
               >
                 <ChevronLeft size={20} />
               </button>
               
               <div className="text-center mb-6">
                 <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <KeyRound size={32} />
                 </div>
                 <h3 className="text-2xl font-black text-slate-800">Solicitar Acceso</h3>
                 <p className="text-slate-500 text-sm mt-2">Introduce tu email registrado para solicitar una nueva contraseña al administrador.</p>
               </div>

               {requestStatus === 'success' ? (
                 <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl text-center flex flex-col items-center gap-2">
                   <CheckCircle2 size={48} />
                   <p className="font-bold">¡Solicitud Enviada!</p>
                   <p className="text-sm">El administrador revisará tu petición.</p>
                 </div>
               ) : (
                 <form onSubmit={handleRequestSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Tu Email</label>
                      <input
                        type="email"
                        required
                        value={requestEmail}
                        onChange={(e) => setRequestEmail(e.target.value)}
                        placeholder="nombre@xiringest.as"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-amber-400 transition-all font-medium text-slate-700"
                      />
                    </div>
                    {requestStatus === 'error' && (
                       <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg">
                         No encontramos este email en el sistema.
                       </div>
                    )}
                    <button 
                      type="submit"
                      className="w-full bg-amber-400 text-emerald-950 py-3 rounded-xl font-black hover:bg-amber-300 transition-all active:scale-95 shadow-lg shadow-amber-100"
                    >
                      Enviar Solicitud
                    </button>
                 </form>
               )}
             </div>
          </div>
        )}

        {!selectedRole ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom duration-500 w-full">
            {[UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN].map((role) => {
              const info = getRoleInfo(role);
              const Icon = info.icon;
              
              let bgIcon, textIcon, textSelect, borderHover;
              
              if (role === UserRole.ADMIN) {
                bgIcon = 'bg-purple-100'; textIcon = 'text-purple-600'; textSelect = 'text-purple-600'; borderHover = 'hover:border-purple-200 hover:shadow-purple-100';
              } else if (role === UserRole.TEACHER) {
                bgIcon = 'bg-blue-100'; textIcon = 'text-blue-600'; textSelect = 'text-blue-600'; borderHover = 'hover:border-blue-200 hover:shadow-blue-100';
              } else {
                bgIcon = 'bg-emerald-100'; textIcon = 'text-emerald-600'; textSelect = 'text-emerald-600'; borderHover = 'hover:border-emerald-200 hover:shadow-emerald-100';
              }

              return (
                <button 
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border-[3px] border-transparent ${borderHover} hover:-translate-y-2 transition-all duration-300 group text-left flex flex-col relative overflow-hidden`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${bgIcon} ${textIcon}`}>
                    <Icon size={32} />
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 mb-3">{info.title}</h3>
                  
                  <p className="text-slate-500 text-sm leading-relaxed font-medium mb-10">
                    {role === UserRole.STUDENT ? 'Accede a tus datos, calendario y pagos.' :
                     role === UserRole.TEACHER ? 'Gestiona la asistencia y consulta el grupo.' :
                     'Control total de usuarios y finanzas del grupo.'}
                  </p>
                  
                  <div className={`mt-auto inline-flex items-center font-bold text-sm ${textSelect}`}>
                    Seleccionar 
                    <div className="ml-2 relative transition-transform group-hover:translate-x-1">
                        <ArrowRight size={18} strokeWidth={3} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="max-w-md mx-auto animate-in fade-in zoom-in duration-300 relative z-20 w-full">
             <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-full h-2 ${
                selectedRole === UserRole.ADMIN ? 'bg-purple-500' :
                selectedRole === UserRole.TEACHER ? 'bg-blue-500' : 'bg-emerald-500'
              }`}></div>
              
              <button 
                onClick={() => { setSelectedRole(null); setError(''); }}
                className="text-sm text-slate-400 hover:text-slate-600 mb-8 flex items-center gap-1 transition-colors font-bold"
              >
                <ChevronLeft size={16} strokeWidth={3} /> Volver
              </button>
              
              <div className="mb-8 flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                  selectedRole === UserRole.ADMIN ? 'bg-purple-100 text-purple-600' :
                  selectedRole === UserRole.TEACHER ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  <Lock size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-800">
                  {getRoleInfo(selectedRole).title}
                </h2>
                <p className="text-slate-500 text-center text-sm mt-2 font-medium">Identifícate para acceder</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email / Usuario</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@xiringest.as"
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-500 transition-all font-medium text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-500 transition-all font-medium text-slate-700"
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2 border border-red-100 font-medium">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="text-right">
                  <button 
                    type="button" 
                    onClick={() => { setIsRequestingPass(true); setEmail(''); setPassword(''); setError(''); }}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    ¿Olvidaste tu contraseña? Solicitar Acceso
                  </button>
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-amber-800 text-[10px] uppercase font-bold tracking-wider leading-tight text-center">
                  Demo Pass: {selectedRole === UserRole.ADMIN ? 'ADMIN' : selectedRole === UserRole.TEACHER ? 'PROFE' : '1234'}
                </div>
                
                <button 
                  type="submit"
                  className={`w-full text-white py-4 rounded-2xl font-bold active:scale-95 transition-all shadow-lg text-lg ${
                    selectedRole === UserRole.ADMIN ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' :
                    selectedRole === UserRole.TEACHER ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                  }`}
                >
                  Entrar
                </button>
              </form>
            </div>
          </div>
        )}
        
        <div className="mt-auto py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
          &copy; {new Date().getFullYear()} Agrupación Folklórica Asturiana Aires de Asturias
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
