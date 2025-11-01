// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Login from './auth/Login';
import LandingPage from './pages/LandingPage';
import PatientsPage from './pages/PatientsPage';
import PatientSelfRegistration from './pages/PatientSelfRegistration';
import CreateResetaTemplate from './components/reusable/CreateResetaTemplate';
import GeneratePrescription from './components/reusable/GeneratePrescription';
import ViewPrescriptions from './components/reusable/ViewPrescription';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Public route - Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Public route - Patient Self Registration */}
          <Route path="/register-patient/:doctorId" element={<PatientSelfRegistration />} />
          
          {/* 
            Protected route - Landing Page 
            Does NOT require verification - users can view dashboard but can't perform actions
          */}
          <Route
            path="/landing"
            element={
              <ProtectedRoute requireVerification={false}>
                <LandingPage />
              </ProtectedRoute>
            }
          />
          
          {/* 
            Protected routes - Require BOTH authentication AND verification
            Users must complete profile before accessing these features
          */}
          <Route
            path="/create-reseta-template"
            element={
              <ProtectedRoute requireVerification={true}>
                <CreateResetaTemplate />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/patients"
            element={
              <ProtectedRoute requireVerification={true}>
                <PatientsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/view-prescriptions"
            element={
              <ProtectedRoute requireVerification={true}>
                <ViewPrescriptions />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/generate-prescription"
            element={
              <ProtectedRoute requireVerification={true}>
                <GeneratePrescription />
              </ProtectedRoute>
            }
          />
          
          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;