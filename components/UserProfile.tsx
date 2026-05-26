
import React, { useState } from 'react';
import { User, Gender, UserRole } from '../types';
import { Save, User as UserIcon, Mail, Phone, Fingerprint, Calendar, CheckCircle } from 'lucide-react';

interface UserProfileProps {
  currentUser: User;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserProfile: React.FC<UserProfileProps> = ({ currentUser, setUsers, setCurrentUser }) => {
  const [formData, setFormData] = useState<User>({ ...currentUser });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers(prev => prev.map(u => u.id === formData.id ? formData : u));
    setCurrentUser(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const isFemale = formData.gender === Gender.FEMALE;
  const accentColor = isFemale ? 'rose' : 'blue';

  const getProfileTitle = () => {
    if (formData.role === UserRole.TEACHER) {
      return isFemale ? 'Profesora de Baile' : 'Profesor de Baile';
    }
    return isFemale ? 'Bailarina Activa' : 'Bailarín Activo';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Mi Perfil Personal</h2>
        <p className="text-slate-500">Mantén tu información actualizada para la gestión de la agrupación</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card Izquierda: Foto y Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className={`h-32 bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-300 relative`}>
               <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
            </div>
            <div className="px-6 pb-8 relative text-center">
              <div className="inline-block -mt-16 p-2 bg-white rounded-full shadow-lg mb-4">
                <img src={formData.avatar} alt="" className={`w-32 h-32 rounded-full border-4 border-${accentColor}-50 object-cover`} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">{formData.name}</h3>
              <p className={`text-${accentColor}-600 font-semibold mb-6 uppercase tracking-wider text-sm`}>
                {getProfileTitle()}
              </p>
              
              <div className="space-y-4 text-left border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3 text-slate-600">
                  <Fingerprint size={18} className="text-slate-400" />
                  <span className="font-mono text-sm">{formData.dni}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail size={18} className="text-slate-400" />
                  <span className="text-sm truncate">{formData.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Derecha: Formulario */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nombre y Apellidos</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">D.N.I. (Documento Identidad)</label>
                <div className="relative">
                  <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                    value={formData.dni}
                    onChange={(e) => setFormData({...formData, dni: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Teléfono de Contacto</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Fecha de Nacimiento</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="date" 
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Género</label>
                <select 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value as Gender})}
                >
                  <option value={Gender.MALE}>Hombre</option>
                  <option value={Gender.FEMALE}>Mujer</option>
                </select>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between gap-4">
              {isSaved && (
                <div className="flex items-center gap-2 text-emerald-600 font-bold animate-in fade-in slide-in-from-left duration-300">
                  <CheckCircle size={20} />
                  Perfil guardado correctamente
                </div>
              )}
              <div className="flex-1"></div>
              <button 
                type="submit"
                className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-xl shadow-emerald-100 flex items-center gap-2"
              >
                <Save size={20} />
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
