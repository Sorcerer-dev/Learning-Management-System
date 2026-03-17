import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { useAuth } from './context/ThemeContext';
import { Toaster } from 'sonner';

// Auth Pages
import LoginPage from './_pages_vite/auth/LoginPage';

// Dashboard Pages
import AdminDashboard from './_pages_vite/admin/AdminDashboard';
import UniversityAnalytics from './_pages_vite/admin/UniversityAnalytics';
import ResultPublication from './_pages_vite/admin/ResultPublication';

import HRDashboard from './_pages_vite/hr/HRDashboard';
import StaffManagement from './_pages_vite/hr/StaffManagement';
import StudentBulkUpload from './_pages_vite/hr/StudentBulkUpload';
import StudentManagement from './_pages_vite/hr/StudentManagement';
import AdminDetails from './_pages_vite/hr/AdminDetails';
import StudentDetail from './_pages_vite/hr/StudentDetail';
import StaffDetail from './_pages_vite/hr/StaffDetail';
import HRProfileSettings from './_pages_vite/hr/HRProfileSettings';

import StaffDashboard from './_pages_vite/staff/StaffDashboard';
import MentorGroup from './_pages_vite/staff/MentorGroup';
import ClassAttendance from './_pages_vite/staff/ClassAttendance';

import StudentDashboard from './_pages_vite/student/StudentDashboard';
import StudentAttendance from './_pages_vite/student/StudentAttendance';
import StudentResults from './_pages_vite/student/StudentResults';
import FirstLoginForm from './_pages_vite/student/FirstLoginForm';
import SettingsPage from './_pages_vite/student/SettingsPage';

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
                        <Route path="student-management" element={<StudentManagement />} />
                        <Route path="student/:id" element={<StudentDetail />} />
                        <Route path="staff/:id" element={<StaffDetail />} />
                        <Route path="admin-details" element={<AdminDetails />} />
                        <Route path="profile" element={<HRProfileSettings />} />
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
