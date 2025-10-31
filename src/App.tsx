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

// Add this route
<Route
  path="/view-prescriptions"
  element={
    <ProtectedRoute>
      <ViewPrescriptions />
    </ProtectedRoute>
  }
/>
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
          
          {/* Protected route - Landing Page */}
          <Route
            path="/landing"
            element={
              <ProtectedRoute>
                <LandingPage />
              </ProtectedRoute>
            }
          />
          
          {/* Protected route - Create Reseta Template */}
          <Route
            path="/create-reseta-template"
            element={
              <ProtectedRoute>
                <CreateResetaTemplate />
              </ProtectedRoute>
            }
          />
          
          {/* Protected route - Patients Management */}
          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <PatientsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
  path="/view-prescriptions"
  element={
    <ProtectedRoute>
      <ViewPrescriptions />
    </ProtectedRoute>
  }
/>
          <Route
  path="/generate-prescription"
  element={
    <ProtectedRoute>
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