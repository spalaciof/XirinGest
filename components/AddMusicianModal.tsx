
import React, { useState } from 'react';
import { User, UserRole, Gender, MusicianType } from '../types';
import { X, Music, Fingerprint, Mail, Phone, Calendar, Save, UserPlus, Tag } from 'lucide-react';

interface AddMusicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newMusician: User) => void;
}

const AddMusicianModal: React.FC<AddMusicianModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    dni: '',
    email: '',
    phone: '',
    birthDate: '',
    musicianType: MusicianType.GAITERO,
    musicianLabel: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMusician: User = {
      id: `music-${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name,
      role: UserRole.MUSICIAN,
      musicianType: formData.musicianType,
      musicianLabel: formData.musicianLabel || (formData.musicianType === MusicianType.GAITERO ? 'Gaitero Oficial' : 'Tamboritero Principal'),
      email: formData.email,
      username: formData.email,
      password: '1234',
      avatar: `https://picsum.photos/seed/${Math.floor(Math.random() * 500)}/150/150`,
      joinDate: new Date().toISOString().split('T')[0],
      gender: Gender.MALE, // Default internal
      dni: formData.dni,
      phone: formData.phone,
      birthDate: formData.birthDate,
    };
    onAdd(newMusician);
    setFormData({ 
      name: '', 
      dni: '', 
      email: '', 
      phone: '', 
      birthDate: '', 
      musicianType: MusicianType.GAITERO,
      musicianLabel: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-900 text-white">
          <div className="flex items-center gap-3">
            <Music size={24} className="text-amber-400" />
            <h3 className="text-xl font-bold">Alta de Nuevo Músico</h3>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instrumento Principal</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, musicianType: MusicianType.GAITERO})}
                  className={`py-3 rounded-xl border-2 font-bold transition-all ${formData.musicianType === MusicianType.GAITERO ? 'bg-violet-600 border-violet-600 text-white shadow-lg' : 'border-slate-100 text-slate-400 hover:border-violet-200'}`}
                >
                  Gaitero
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, musicianType: MusicianType.TAMBORITERO})}
                  className={`py-3 rounded-xl border-2 font-bold transition-all ${formData.musicianType === MusicianType.TAMBORITERO ? 'bg-orange-500 border-orange-500 text-white shadow-lg' : 'border-slate-100 text-slate-400 hover:border-orange-200'}`}
                >
                  Tamboritero
                </button>
              </div>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rol Personalizado (Opcional)</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder={formData.musicianType === MusicianType.GAITERO ? "Ej: Gaitero Oficial" : "Ej: Tamboritero Principal"}
                  value={formData.musicianLabel}
                  onChange={(e) => setFormData({...formData, musicianLabel: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Músico</label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required
                  type="text" 
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Ej: Nel de Xixón"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">D.N.I.</label>
              <div className="relative">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required
                  type="text" 
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                  placeholder="12345678A"
                  value={formData.dni}
                  onChange={(e) => setFormData({...formData, dni: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email de Contacto</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required
                  type="email" 
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="correo@musica.as"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required
                  type="text" 
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="600 000 000"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de Nacimiento</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required
                  type="date" 
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className={`flex-1 py-4 text-white rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 ${formData.musicianType === MusicianType.GAITERO ? 'bg-violet-600 shadow-violet-100' : 'bg-orange-500 shadow-orange-100'}`}
            >
              <Save size={20} />
              Registrar Músico
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMusicianModal;
