import React, { useState, useEffect } from 'react';
import { BookOpen, CalendarCheck, TrendingUp, AlertCircle, Loader2, Inbox } from 'lucide-react';
import { useAuth } from '../../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL;

const StudentDashboard = () => {
    const { user, token } = useAuth();
    const [arrearCount, setArrearCount] = useState(null);
    const [loading, setLoading] = useState(true);

    // Try to get student-specific data from the user object
    const studentName = user?.studentProfile?.name || user?.name || user?.email || 'Student';
    const regNo = user?.studentProfile?.regNo || user?.regNo || '—';
    const batchId = user?.studentProfile?.batchId || '—';
    const deptId = user?.deptId || '—';

    useEffect(() => {
        // We could fetch arrear count here in the future
        setLoading(false);
    }, [token]);

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome back, {studentName}!</h1>
                    <p className="text-gray-600 mt-1">{deptId} | Batch {batchId}</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-2">
                    <span className="bg-white px-3 py-1 rounded-full text-sm font-medium border border-gray-200 shadow-sm">Registration: <span className="text-primary">{regNo}</span></span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Overall Attendance"
                    value="—"
                    subtitle="Will populate when attendance is recorded"
                    icon={<CalendarCheck className="w-5 h-5 text-primary" />}
                />
                <StatCard
                    title="Current CGPA"
                    value="—"
                    subtitle="Will populate when results are published"
                    icon={<TrendingUp className="w-5 h-5 text-primary" />}
                />
                <StatCard
                    title="Active Arrears"
                    value="—"
                    subtitle="Will populate when results are published"
                    icon={<AlertCircle className="w-5 h-5 text-emerald-500" />}
                    className="border-t-4 border-t-emerald-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Marks Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Recent Marks</h2>
                    </div>
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                        <Inbox className="w-10 h-10 text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium text-sm">No results published yet.</p>
                        <p className="text-xs text-slate-400 mt-1">Your marks will appear here once results are published by the CoE.</p>
                    </div>
                </div>

                {/* Announcements / Upcoming */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Announcements</h2>
                    <div className="p-4 flex flex-col items-center justify-center text-center">
                        <Inbox className="w-10 h-10 text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium text-sm">No announcements yet.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, subtitle, icon, progress, className = '' }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden ${className}`}>
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
        </div>
        <div className="flex flex-col space-y-1">
            <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
            {subtitle && <span className="text-xs font-medium text-gray-500">{subtitle}</span>}
        </div>
        {progress && (
            <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 absolute bottom-0 left-0">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        )}
    </div>
);

export default StudentDashboard;
