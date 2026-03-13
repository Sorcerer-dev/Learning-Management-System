import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Users, FileText, CheckCircle, Loader2, Plus, GraduationCap, Shield, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/ThemeContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;
const COLORS = ['#0D9488', '#2563EB', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

const HRDashboard = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    // Data states
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    // UI states
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

    // Admin form state
    const [adminForm, setAdminForm] = useState({ name: '', email: '', password: 'Welcome@123' });
    const [adminSubmitting, setAdminSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, analyticsRes] = await Promise.all([
                    fetch(`${API_URL}/api/hr/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_URL}/api/hr/analytics`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (statsRes.ok) setStats(await statsRes.json());
                if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        setAdminSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/hr/admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(adminForm)
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Admin user created successfully!');
                setIsAdminModalOpen(false);
                setAdminForm({ name: '', email: '', password: 'Welcome@123' });
            } else {
                toast.error(data.error || 'Failed to create admin');
            }
        } catch (err) {
            toast.error('Network error. Failed to add admin.');
        } finally {
            setAdminSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">HR Operations</h1>

                {/* Quick Add Menu */}
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Quick Add
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                            <button onClick={() => { navigate('/hr/students'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-semibold border-b border-slate-100 flex items-center gap-3 text-slate-700">
                                <GraduationCap className="w-4 h-4 text-emerald-600" /> Student
                            </button>
                            <button onClick={() => { navigate('/hr/staff'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-semibold border-b border-slate-100 flex items-center gap-3 text-slate-700">
                                <Users className="w-4 h-4 text-blue-600" /> Staff
                            </button>
                            <button onClick={() => { setIsAdminModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-semibold flex items-center gap-3 text-slate-700">
                                <Shield className="w-4 h-4 text-purple-600" /> Admin
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="/hr/staff" className="block transition-transform hover:-translate-y-1">
                    <StatCard
                        title="Active Staff"
                        value={loading ? '...' : (stats?.activeStaff?.toLocaleString() ?? '0')}
                        icon={<Users className="w-5 h-5 text-primary" />}
                        loading={loading}
                    />
                </Link>
                <Link to="/hr/students" className="block transition-transform hover:-translate-y-1">
                    <StatCard
                        title="Total Students"
                        value={loading ? '...' : (stats?.totalStudents?.toLocaleString() ?? '0')}
                        icon={<FileText className="w-5 h-5 text-primary" />}
                        loading={loading}
                    />
                </Link>
                <div className="block">
                    <StatCard
                        title="Inactive Users"
                        value={loading ? '...' : (stats?.inactiveUsers?.toLocaleString() ?? '0')}
                        icon={<CheckCircle className="w-5 h-5 text-primary" />}
                        loading={loading}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Student Distribution by Department</h2>
                    <div className="flex-1 min-h-[300px] flex items-center justify-center">
                        {loading ? (
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        ) : analytics?.studentsByDept?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.studentsByDept}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {analytics.studentsByDept.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500 text-sm">No student data available</p>
                        )}
                    </div>
                </div>

                {/* Bulk Student Upload Call-to-Action */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="bg-primary/5 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">Bulk Student Onboarding</h2>
                        <span className="text-xs font-medium bg-primary text-primary-foreground px-2 py-1 rounded">Module</span>
                    </div>
                    <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                            <Upload className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mb-2">Ready to onboard students?</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Use our dedicated module to parse .xlsx files, validate data in real-time, and batch create student accounts.
                        </p>
                        <Link
                            to="/hr/students"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg font-bold transition-all w-full flex items-center justify-center gap-2 shadow-sm"
                        >
                            Open Upload Module
                        </Link>
                    </div>
                </div>
            </div>

            {/* Admin Add Modal */}
            {isAdminModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-purple-600" /> Add Admin User
                            </h2>
                            <button onClick={() => setIsAdminModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4 bg-purple-50 border border-purple-200 text-purple-800 rounded-lg p-3 text-sm flex gap-3">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p>Admin users have full HR and administrative access. Use carefully.</p>
                            </div>
                            <form id="admin-form" onSubmit={handleAdminSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={adminForm.name}
                                        onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                                        required
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        placeholder="Admin Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={adminForm.email}
                                        onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                                        required
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        placeholder="admin@univ.edu"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                                    <input
                                        type="text"
                                        value={adminForm.password}
                                        onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                                        required
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-slate-50"
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                            <button type="button" onClick={() => setIsAdminModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 font-medium rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button type="submit" form="admin-form" disabled={adminSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2">
                                {adminSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Admin'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon, loading }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
        </div>
        <div className="flex items-baseline space-x-2">
            {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
                <h2 className="text-2xl font-bold text-gray-900">{value}</h2>
            )}
        </div>
    </div>
);

export default HRDashboard;
