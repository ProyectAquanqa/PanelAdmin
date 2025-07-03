import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/Auth/LoginPage';
import AuthDebugPage from '../pages/Auth/AuthDebugPage';
import DashboardLayout from '../components/layout/DashboardLayout';
import DashboardPage from '../pages/DashboardPage';
import UsersPage from '../pages/users/UsersPage';
import DoctorListPage from '../pages/doctors/DoctorListPage';
import DoctorDetailsPage from '../pages/doctors/DoctorDetailsPage';
import DoctorFormPage from '../pages/doctors/DoctorFormPage';
import DoctorDebugPage from '../pages/doctors/DoctorDebugPage';
import PatientListPage from '../pages/patients/PatientListPage';
import PatientApiTestPage from '../pages/patients/PatientApiTestPage';
import AppointmentHistoryPage from '../pages/patients/AppointmentHistoryPage';
import SpecialtyListPage from '../pages/specialties/SpecialtyListPage';
import AppointmentListPage from '../pages/appointments/AppointmentListPage';
import ChatbotListPage from '../pages/chatbot/ChatbotListPage';
import SettingsPage from '../pages/settings/SettingsPage';
import DoctorSchedulePage from '../pages/doctors/DoctorSchedulePage';
import DoctorAvailabilityPage from '../pages/doctors/DoctorAvailabilityPage';
import PaymentListPage from '../pages/payments/PaymentListPage';
import AuditLogListPage from '../pages/audit/AuditLogListPage';
import AnalyticsDashboardPage from '../pages/analytics/AnalyticsDashboardPage';
import MedicalRecordsPage from '../pages/medical/MedicalRecordsPage';

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
          <Route path="/patients-api-test" element={<PatientApiTestPage />} />
          <Route path="/doctors-debug" element={<DoctorDebugPage />} />
        </>
      )}
      
      <Route path="/" element={<ProtectedRoute />}>
        {/* Aquí van todas las rutas protegidas que usarán el DashboardLayout */}
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="doctors" element={<DoctorListPage />} />
        {/* Primero las rutas específicas de doctores */}
        <Route path="doctors/new" element={<DoctorFormPage />} />
        <Route path="doctors/debug" element={<DoctorDebugPage />} />
        {/* Luego las rutas con parámetros */}
        <Route path="doctors/edit/:id" element={<DoctorFormPage />} />
        <Route path="doctors/schedule/:id" element={<DoctorSchedulePage />} />
        <Route path="doctors/availability/:id" element={<DoctorAvailabilityPage />} />
        <Route path="doctors/availability" element={<DoctorAvailabilityPage />} />
        <Route path="doctors/:id" element={<DoctorDetailsPage />} />
        <Route path="patients" element={<PatientListPage />} />
        <Route path="patients/:patientId/appointments" element={<AppointmentHistoryPage />} />
        <Route path="appointments" element={<AppointmentListPage />} />
        <Route path="medical" element={<MedicalRecordsPage />} />
        <Route path="specialties" element={<SpecialtyListPage />} />
        <Route path="chatbot" element={<ChatbotListPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="payments" element={<PaymentListPage />} />
        <Route path="audit" element={<AuditLogListPage />} />
        <Route path="analytics" element={<AnalyticsDashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRouter; 