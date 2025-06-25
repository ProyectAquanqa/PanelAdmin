import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/Auth/LoginPage';
import AuthDebugPage from '../pages/Auth/AuthDebugPage';
import DashboardLayout from '../components/layout/DashboardLayout';
import DashboardPage from '../pages/DashboardPage';
import UsersPage from '../pages/users/UsersPage';
import DoctorListPage from '../pages/doctors/DoctorListPage';
import DoctorDebugPage from '../pages/doctors/DoctorDebugPage';
import DoctorApiTestPage from '../pages/doctors/DoctorApiTestPage';
import PatientListPage from '../pages/patients/PatientListPage';
import PatientDebugPage from '../pages/patients/PatientDebugPage';
import PatientApiTestPage from '../pages/patients/PatientApiTestPage';
import SpecialtyListPage from '../pages/specialties/SpecialtyListPage';
import AppointmentListPage from '../pages/appointments/AppointmentListPage';
import ChatbotListPage from '../pages/chatbot/ChatbotListPage';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="w-12 h-12 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
  </div>
);

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

const AppRouter = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Prevent flash of login page when checking auth status
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} 
      />
      
      {/* Página de depuración de autenticación - solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <Route path="/auth-debug" element={<AuthDebugPage />} />
          <Route path="/doctors-debug" element={<DoctorDebugPage />} />
          <Route path="/doctors-api-test" element={<DoctorApiTestPage />} />
          <Route path="/patients-debug" element={<PatientDebugPage />} />
          <Route path="/patients-api-test" element={<PatientApiTestPage />} />
        </>
      )}
      
      <Route path="/" element={<ProtectedRoute />}>
        {/* Aquí van todas las rutas protegidas que usarán el DashboardLayout */}
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="doctors" element={<DoctorListPage />} />
        <Route path="patients" element={<PatientListPage />} />
        <Route path="appointments" element={<AppointmentListPage />} />
        <Route path="specialties" element={<SpecialtyListPage />} />
        <Route path="chatbot" element={<ChatbotListPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRouter; 