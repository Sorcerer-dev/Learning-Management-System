import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { useTheme } from './context/ThemeContext';

// Placeholders for Pages
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

function App() {
    const { role, setRole } = useTheme();

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
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
                        <Route index element={<StudentDashboard />} />
                        <Route path="first-login" element={<FirstLoginForm />} />
                        <Route path="attendance" element={<StudentAttendance />} />
                        <Route path="results" element={<StudentResults />} />
                    </Route>
                </Route>
            </Routes>

            {/* Dev Mode Theme Switcher - Floating bottom right */}
            <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 z-50">
                <h3 className="text-sm font-bold mb-2">Dev Role Switcher</h3>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full text-sm p-2 border rounded"
                >
                    <option value="admin">Admin (Royal Purple)</option>
                    <option value="hr">HR Admin (Teal)</option>
                    <option value="staff">Staff (Professional Blue)</option>
                    <option value="student">Student (Emerald Green)</option>
                </select>
            </div>
        </Router>
    );
}

export default App;
