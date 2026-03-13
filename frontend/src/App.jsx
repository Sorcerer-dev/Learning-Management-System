import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { useAuth } from './context/ThemeContext';
import { Toaster } from 'sonner';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UniversityAnalytics from './pages/admin/UniversityAnalytics';
import ResultPublication from './pages/admin/ResultPublication';

import HRDashboard from './pages/hr/HRDashboard';
import StaffManagement from './pages/hr/StaffManagement';
import StudentBulkUpload from './pages/hr/StudentBulkUpload';

import StaffDashboard from './pages/staff/StaffDashboard';
import MentorGroup from './pages/staff/MentorGroup';
import ClassAttendance from './pages/staff/ClassAttendance';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentResults from './pages/student/StudentResults';
import FirstLoginForm from './pages/student/FirstLoginForm';
import SettingsPage from './pages/student/SettingsPage';

// Protected Route wrapper
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

// Profile Lock Guard — redirects unlocked student profiles to the setup form
function ProfileGuard({ children }) {
    const { user, role } = useAuth();

    // Only apply to student users
    if (role === 'student' && user && user.profileLocked === false) {
        return <Navigate to="/student/first-login" replace />;
    }

    return children;
}

function App() {
    const { role, setRole, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading UMS...</p>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {/* Public Route: Login */}
                <Route path="/login" element={
                    isAuthenticated ? <Navigate to={`/${role}`} replace /> : <LoginPage />
                } />

                {/* Protected Routes: Dashboard */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }>
                    {/* Base redirect based on current role */}
                    <Route index element={<Navigate to={`/${role}`} replace />} />

                    {/* Admin Routes */}
                    <Route path="admin">
                        <Route index element={<AdminDashboard />} />
                        <Route path="analytics" element={<UniversityAnalytics />} />
                        <Route path="results" element={<ResultPublication />} />
                    </Route>

                    {/* HR Admin Routes */}
                    <Route path="hr">
                        <Route index element={<HRDashboard />} />
                        <Route path="staff" element={<StaffManagement />} />
                        <Route path="students" element={<StudentBulkUpload />} />
                    </Route>

                    {/* Staff Routes */}
                    <Route path="staff">
                        <Route index element={<StaffDashboard />} />
                        <Route path="students" element={<MentorGroup />} />
                        <Route path="attendance" element={<ClassAttendance />} />
                    </Route>

                    {/* Student Routes */}
                    <Route path="student">
                        <Route index element={<ProfileGuard><StudentDashboard /></ProfileGuard>} />
                        <Route path="first-login" element={<FirstLoginForm />} />
                        <Route path="settings" element={<ProfileGuard><SettingsPage /></ProfileGuard>} />
                        <Route path="attendance" element={<ProfileGuard><StudentAttendance /></ProfileGuard>} />
                        <Route path="results" element={<ProfileGuard><StudentResults /></ProfileGuard>} />
                    </Route>
                </Route>

                {/* Catch-all: redirect to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <Toaster richColors position="top-right" />
        </Router>
    );
}

export default App;
