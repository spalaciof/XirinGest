
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import MusicianList from './components/MusicianList';
import AttendanceTracker from './components/AttendanceTracker';
import PerformanceAttendanceTracker from './components/PerformanceAttendanceTracker';
import PaymentManager from './components/PaymentManager';
import PerformancesCalendar from './components/PerformancesCalendar';
import LoginScreen from './components/LoginScreen';
import UserProfile from './components/UserProfile';
import AddStudentModal from './components/AddStudentModal';
import AddMusicianModal from './components/AddMusicianModal';
import { 
  INITIAL_USERS, 
  INITIAL_ATTENDANCE, 
  INITIAL_PAYMENTS, 
  INITIAL_PERFORMANCES, 
  INITIAL_PERFORMANCE_ATTENDANCE 
} from './constants';
import { User, AttendanceRecord, PaymentRecord, UserRole, PasswordRequest, Performance, PerformanceAttendance } from './types';

const App: React.FC = () => {
  // Global State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddMusicianModalOpen, setIsAddMusicianModalOpen] = useState(false);
  
  // Data State (Mock Database)
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [passwordRequests, setPasswordRequests] = useState<PasswordRequest[]>([]);
  const [performances, setPerformances] = useState<Performance[]>(INITIAL_PERFORMANCES);
  const [performanceAttendance, setPerformanceAttendance] = useState<PerformanceAttendance[]>(INITIAL_PERFORMANCE_ATTENDANCE);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveTab(user.role === UserRole.STUDENT || user.role === UserRole.MUSICIAN ? 'profile' : 'dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleAddStudent = (newStudent: User) => {
    setUsers(prev => [...prev, newStudent]);
    setActiveTab('students');
  };

  const handleAddMusician = (newMusician: User) => {
    setUsers(prev => [...prev, newMusician]);
    setActiveTab('musicians');
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar a este integrante? Esta acción no se puede deshacer.')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      // También deberíamos limpiar registros asociados en una app real
    }
  };

  // --- Password Request Logic ---
  const handleRequestPassword = (email: string): boolean => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      // Check if already requested
      if (passwordRequests.some(req => req.userId === user.id)) {
        return true; // Already requested
      }
      
      const newRequest: PasswordRequest = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        requestDate: new Date().toISOString()
      };
      setPasswordRequests(prev => [...prev, newRequest]);
      return true;
    }
    return false;
  };

  const handleApproveRequest = (requestId: string) => {
    const request = passwordRequests.find(r => r.id === requestId);
    if (!request) return;

    // Buscar al usuario para obtener el email
    const targetUser = users.find(u => u.id === request.userId);
    if (!targetUser) {
      alert("Error: Usuario no encontrado");
      return;
    }

    // Generate random simple password (e.g., 8 chars alphanumeric uppercase for readability)
    const newPass = Math.random().toString(36).slice(-8).toUpperCase();

    setUsers(prev => prev.map(u => {
      if (u.id === request.userId) {
        return { ...u, password: newPass };
      }
      return u;
    }));

    // Remove request
    setPasswordRequests(prev => prev.filter(r => r.id !== requestId));
    
    // Construct Email Content
    const subject = encodeURIComponent("Credenciales de Acceso - XirinGest");
    const body = encodeURIComponent(`Hola ${targetUser.name},

Tu solicitud de acceso a la plataforma XirinGest ha sido aprobada por la administración.

A continuación encontrarás tus credenciales de acceso:
------------------------------------------------
Usuario/Email: ${targetUser.email}
Contraseña temporal: ${newPass}
------------------------------------------------

Te recomendamos acceder a tu perfil y revisar tus datos.

Atentamente,
La Administración de XirinGest`);

    // Open Mail Client
    window.location.href = `mailto:${targetUser.email}?subject=${subject}&body=${body}`;
  };

  // Derived Permissions
  const canEdit = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.TEACHER;

  // Render content based on active tab
  const renderContent = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          users={users} 
          attendance={attendance} 
          payments={payments} 
          performances={performances}
          performanceAttendance={performanceAttendance}
        />;
      case 'performances':
        return <PerformancesCalendar 
          performances={performances}
          attendance={performanceAttendance}
          setPerformances={setPerformances}
          setPerformanceAttendance={setPerformanceAttendance}
          currentUser={currentUser}
        />;
      case 'students':
        return <StudentList 
          users={users} 
          setUsers={setUsers} 
          canEdit={canEdit} 
          onDelete={handleDeleteUser} 
          currentUser={currentUser}
        />;
      case 'musicians':
        return <MusicianList 
          users={users} 
          setUsers={setUsers} 
          canEdit={canEdit} 
          onDelete={handleDeleteUser}
          currentUser={currentUser}
        />;
      case 'attendance_rehearsals':
        return <AttendanceTracker 
          users={users} 
          attendance={attendance} 
          setAttendance={setAttendance} 
          canEdit={canEdit}
          currentUser={currentUser}
          performances={performances}
          performanceAttendance={performanceAttendance}
        />;
      case 'attendance_performances':
        return <PerformanceAttendanceTracker 
          users={users} 
          performances={performances}
          attendance={performanceAttendance}
          rehearsalAttendance={attendance} 
          setAttendance={setPerformanceAttendance} 
          canEdit={canEdit}
        />;
      case 'payments':
        const selfList = users.filter(u => u.id === currentUser.id);
        return <PaymentManager 
          users={selfList} 
          payments={payments} 
          setPayments={setPayments} 
          canEdit={false} 
        />;
      case 'payments_admin':
        return <PaymentManager 
          users={users} 
          payments={payments} 
          setPayments={setPayments} 
          canEdit={canEdit} 
        />;
      case 'profile':
        return <UserProfile 
          currentUser={currentUser} 
          setUsers={setUsers} 
          setCurrentUser={setCurrentUser} 
        />;
      default:
        return <Dashboard users={users} attendance={attendance} payments={payments} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginScreen 
        users={users} 
        onLogin={handleLogin} 
        onRequestPassword={handleRequestPassword}
      />
    );
  }

  return (
    <>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser!}
        onLogout={handleLogout}
        onAddStudentClick={() => setIsAddModalOpen(true)}
        onAddMusicianClick={() => setIsAddMusicianModalOpen(true)}
        passwordRequests={passwordRequests}
        onApproveRequest={handleApproveRequest}
        performances={performances}
        performanceAttendance={performanceAttendance}
      >
        {renderContent()}
      </Layout>

      <AddStudentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddStudent} 
      />

      <AddMusicianModal 
        isOpen={isAddMusicianModalOpen} 
        onClose={() => setIsAddMusicianModalOpen(false)} 
        onAdd={handleAddMusician} 
      />
    </>
  );
};

export default App;
