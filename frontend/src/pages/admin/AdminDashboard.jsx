import React, { useState, useEffect } from 'react';
import { Users, BookOpen, GraduationCap, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_URL}/api/stats/dashboard`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [token]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Executive Dashboard</h1>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm text-gray-600 font-medium">
                    Academic Year 2026-2027
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={loading ? '...' : (stats?.totalStudents?.toLocaleString() ?? '0')}
                    icon={<Users className="w-5 h-5 text-primary" />}
                    loading={loading}
                />
                <StatCard
                    title="Total Staff"
                    value={loading ? '...' : (stats?.totalStaff?.toLocaleString() ?? '0')}
                    icon={<BookOpen className="w-5 h-5 text-primary" />}
                    loading={loading}
                />
                <StatCard
                    title="Active Students"
                    value={loading ? '...' : (stats?.activeStudents?.toLocaleString() ?? '0')}
                    icon={<GraduationCap className="w-5 h-5 text-primary" />}
                    loading={loading}
                />
                <StatCard
                    title="Active Arrears"
                    value={loading ? '...' : (stats?.totalArrears?.toLocaleString() ?? '0')}
                    icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
                    className="border-l-4 border-l-destructive"
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[400px]">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">University Wide Pass Trends</h2>
                    <div className="flex items-center justify-center h-64 bg-slate-50 border border-dashed rounded-lg text-gray-400">
                        [Chart Placeholder: Pass Rates by Department]
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Pending Deletion Approvals</h2>
                    <div className="space-y-4">
                        <div className="text-sm text-gray-500 text-center py-4">No pending requests</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, className = '', loading }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${className}`}>
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
        </div>
        <div className="flex items-baseline space-x-2">
            {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
                <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
            )}
        </div>
    </div>
);

export default AdminDashboard;
