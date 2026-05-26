
import React, { useState } from 'react';
import { User, UserRole, Gender } from '../types';
import { Search, Mail, Calendar, Phone, Fingerprint, Edit2, X, Trash2, Lock, Eye, EyeOff } from 'lucide-react';

interface StudentListProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  canEdit: boolean;
  onDelete?: (id: string) => void;
  currentUser: User;
}

const StudentList: React.FC<StudentListProps> = ({ users, setUsers, canEdit, onDelete, currentUser }) => {
  const [filter, setFilter] = useState('');
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Incluimos tanto estudiantes como profesores en la lista
  const visibleMembers = users.filter(u => u.role === UserRole.STUDENT || u.role === UserRole.TEACHER);

  const filteredMembers = visibleMembers.filter(s => 
    s.name.toLowerCase().includes(filter.toLowerCase()) ||
    s.email.toLowerCase().includes(filter.toLowerCase()) ||
    s.dni.toLowerCase().includes(filter.toLowerCase())
  );

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    
    setUsers(prev => prev.map(u => u.id === editingStudent.id ? editingStudent : u));
    setEditingStudent(null);
    setShowPassword(false);
  };

  const getMemberLabel = (member: User) => {
    const isFemale = member.gender === Gender.FEMALE;
    if (member.role === UserRole.TEACHER) {
      return isFemale ? 'Profesora de Baile' : 'Profesor de Baile';
    }
    return isFemale ? 'Bailarina' : 'Bailarín';
  };

  const isAdmin = currentUser.role === UserRole.ADMIN;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Directorio de la Agrupación</h2>
          <p className="text-slate-500">Listado completo de bailadores y profesorado</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, email o DNI..." 
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-80 shadow-sm bg-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {filteredMembers.map(member => {
          const isFemale = member.gender === Gender.FEMALE;
          
          // Colores temáticos por género
          const themeColor = isFemale ? 'from-rose-500 to-rose-300' : 'from-blue-600 to-blue-400';
          const borderColor = isFemale ? 'border-rose-100' : 'border-blue-100';
          const textColor = isFemale ? 'text-rose-600' : 'text-blue-600';
          const btnBg = isFemale ? 'bg-rose-50 hover:bg-rose-100 text-rose-700' : 'bg-blue-50 hover:bg-blue-100 text-blue-700';

          return (
            <div key={member.id} className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group relative">
              <div className={`h-24 bg-gradient-to-r ${themeColor} relative`}>
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
              </div>
              <div className="px-6 relative">
                <div className="absolute -top-12 left-6 p-1 bg-white rounded-full shadow-lg">
                  <img src={member.avatar} alt={member.name} className={`w-20 h-20 rounded-full object-cover border-2 ${borderColor}`} />
                </div>
                <div className="pt-10 pb-6">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-slate-800">{member.name}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isFemale ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                      {isFemale ? 'Mujer' : 'Hombre'}
                    </span>
                  </div>
                  <p className={`${textColor} text-sm font-semibold mb-4`}>
                    {getMemberLabel(member)}
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
                      <span>Nac: {new Date(member.birthDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {canEdit && (
                    <div className="mt-6 flex gap-2">
                      <button 
                        onClick={() => setEditingStudent(member)}
                        className={`flex-1 py-2.5 ${btnBg} rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2`}
                      >
                        <Edit2 size={14} />
                        Editar
                      </button>
                      <button 
                        onClick={() => onDelete?.(member.id)}
                        className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all active:scale-95 flex items-center justify-center"
                        title="Eliminar integrante"
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

      {/* Modal Edición (Solo Admin/Profe) */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Editar Ficha</h3>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">D.N.I.</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    value={editingStudent.dni}
                    onChange={(e) => setEditingStudent({...editingStudent, dni: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Teléfono</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({...editingStudent, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Fecha Nacimiento</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    value={editingStudent.birthDate}
                    onChange={(e) => setEditingStudent({...editingStudent, birthDate: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Género</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    value={editingStudent.gender}
                    onChange={(e) => setEditingStudent({...editingStudent, gender: e.target.value as Gender})}
                  >
                    <option value={Gender.MALE}>Hombre</option>
                    <option value={Gender.FEMALE}>Mujer</option>
                  </select>
                </div>

                {/* Password Field - ONLY VISIBLE TO ADMIN */}
                {isAdmin && (
                  <div className="md:col-span-2 space-y-1 bg-amber-50 p-3 rounded-xl border border-amber-100">
                    <label className="text-xs font-bold text-amber-700 uppercase flex items-center gap-2">
                       <Lock size={12} /> Contraseña de Acceso (Admin)
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                        value={editingStudent.password || ''}
                        onChange={(e) => setEditingStudent({...editingStudent, password: e.target.value})}
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
                  onClick={() => setEditingStudent(null)}
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
      
      {filteredMembers.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 text-slate-400">
          No se encontraron integrantes con esos criterios.
        </div>
      )}
    </div>
  );
};

export default StudentList;
