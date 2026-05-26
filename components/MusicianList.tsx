
import React, { useState } from 'react';
import { User, UserRole, MusicianType, Gender } from '../types';
import { Search, Mail, Calendar, Phone, Fingerprint, Edit2, X, Music, Tag, Trash2, Lock, Eye, EyeOff } from 'lucide-react';

interface MusicianListProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  canEdit: boolean;
  onDelete?: (id: string) => void;
  currentUser: User;
}

const MusicianList: React.FC<MusicianListProps> = ({ users, setUsers, canEdit, onDelete, currentUser }) => {
  const [filter, setFilter] = useState('');
  const [editingMusician, setEditingMusician] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const musicians = users.filter(u => u.role === UserRole.MUSICIAN);

  const filteredMusicians = musicians.filter(s => 
    s.name.toLowerCase().includes(filter.toLowerCase()) ||
    s.email.toLowerCase().includes(filter.toLowerCase()) ||
    s.dni.toLowerCase().includes(filter.toLowerCase())
  );

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMusician) return;
    setUsers(prev => prev.map(u => u.id === editingMusician.id ? editingMusician : u));
    setEditingMusician(null);
    setShowPassword(false);
  };

  const isAdmin = currentUser.role === UserRole.ADMIN;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cuerpo de Música</h2>
          <p className="text-slate-500">Gaiteros y Tamboriteros de la agrupación</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar músico..." 
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-80 shadow-sm bg-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMusicians.map(member => {
          const isGaitero = member.musicianType === MusicianType.GAITERO;
          
          // Gaitero: Violeta/Púrpura | Tamboritero: Naranja
          const themeColor = isGaitero ? 'from-violet-600 to-purple-400' : 'from-orange-500 to-amber-300';
          const borderColor = isGaitero ? 'border-violet-100' : 'border-orange-100';
          const textColor = isGaitero ? 'text-violet-600' : 'text-orange-600';
          const btnBg = isGaitero ? 'bg-violet-50 hover:bg-violet-100 text-violet-700' : 'bg-orange-50 hover:bg-orange-100 text-orange-700';

          return (
            <div key={member.id} className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group relative">
              <div className={`h-28 bg-gradient-to-r ${themeColor} relative flex items-center justify-center`}>
                <Music size={48} className="text-white opacity-20 absolute" />
              </div>
              <div className="px-6 relative">
                <div className="absolute -top-12 left-6 p-1 bg-white rounded-full shadow-lg">
                  <img src={member.avatar} alt={member.name} className={`w-20 h-20 rounded-full object-cover border-2 ${borderColor}`} />
                </div>
                <div className="pt-10 pb-6">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-slate-800">{member.name}</h3>
                    <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-tighter ${isGaitero ? 'bg-violet-100 text-violet-700' : 'bg-orange-100 text-orange-700'}`}>
                      {member.musicianType}
                    </span>
                  </div>
                  <p className={`${textColor} text-sm font-black mb-4 uppercase tracking-widest`}>
                    {member.musicianLabel || (isGaitero ? 'Gaitero' : 'Tamboritero')}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <Fingerprint size={16} className="text-slate-400" />
                      <span className="font-mono">{member.dni}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <Mail size={16} className="text-slate-400" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <Phone size={16} className="text-slate-400" />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <Calendar size={16} className="text-slate-400" />
                      <span>Nac: {member.birthDate ? new Date(member.birthDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>

                  {canEdit && (
                    <div className="mt-6 flex gap-2">
                      <button 
                        onClick={() => setEditingMusician(member)}
                        className={`flex-1 py-2.5 ${btnBg} rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2`}
                      >
                        <Edit2 size={14} />
                        Editar Info
                      </button>
                      <button 
                        onClick={() => onDelete?.(member.id)}
                        className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all active:scale-95 flex items-center justify-center"
                        title="Eliminar músico"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Edición */}
      {editingMusician && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Editar Músico</h3>
              <button onClick={() => setEditingMusician(null)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                    value={editingMusician.name}
                    onChange={(e) => setEditingMusician({...editingMusician, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Rol / Título (ej: Gaitero Oficial)</label>
                  <div className="relative">
                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                      placeholder="Gaitero Oficial, Tamboritero Principal..."
                      value={editingMusician.musicianLabel || ''}
                      onChange={(e) => setEditingMusician({...editingMusician, musicianLabel: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">D.N.I.</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                      value={editingMusician.dni}
                      onChange={(e) => setEditingMusician({...editingMusician, dni: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Instrumento</label>
                    <select 
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                      value={editingMusician.musicianType}
                      onChange={(e) => setEditingMusician({...editingMusician, musicianType: e.target.value as MusicianType})}
                    >
                      <option value={MusicianType.GAITERO}>Gaitero</option>
                      <option value={MusicianType.TAMBORITERO}>Tamboritero</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                      value={editingMusician.email}
                      onChange={(e) => setEditingMusician({...editingMusician, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Fecha de Nacimiento</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                      value={editingMusician.birthDate}
                      onChange={(e) => setEditingMusician({...editingMusician, birthDate: e.target.value})}
                    />
                  </div>
                </div>

                {/* Password Field - ONLY VISIBLE TO ADMIN */}
                {isAdmin && (
                  <div className="space-y-1 bg-amber-50 p-3 rounded-xl border border-amber-100">
                    <label className="text-xs font-bold text-amber-700 uppercase flex items-center gap-2">
                       <Lock size={12} /> Contraseña de Acceso (Admin)
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                        value={editingMusician.password || ''}
                        onChange={(e) => setEditingMusician({...editingMusician, password: e.target.value})}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingMusician(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicianList;
