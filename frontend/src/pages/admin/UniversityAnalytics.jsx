import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL;

const UniversityAnalytics = () => {
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
                console.error('Failed to fetch analytics:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [token]);

    return (
        <div className="p-6 max-w-5xl mx-auto animate-in fade-in duration-300">
            <h1 className="text-3xl font-bold text-primary mb-2">University Analytics</h1>
            <p className="text-slate-500 mb-8 font-medium">Live data from the University Management System</p>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-8">Department Pass Rates</h3>

                <div className="flex items-center justify-center h-40 bg-slate-50 border border-dashed rounded-lg text-slate-400 font-medium">
                    Pass rate analytics will appear here once exam results are published.
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100">
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Students</p>
                        <p className="text-3xl font-black text-slate-800 mt-2">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (stats?.totalStudents?.toLocaleString() ?? '0')}
                        </p>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Active Students</p>
                        <p className="text-3xl font-black text-primary mt-2">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (stats?.activeStudents?.toLocaleString() ?? '0')}
                        </p>
                    </div>
                    <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-100">
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Staff</p>
                        <p className="text-3xl font-black text-emerald-600 mt-2">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (stats?.totalStaff?.toLocaleString() ?? '0')}
                        </p>
                    </div>
                    <div className="p-4 bg-rose-50/80 rounded-xl border border-rose-100">
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Active Arrears</p>
                        <p className="text-3xl font-black text-rose-600 mt-2">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (stats?.totalArrears?.toLocaleString() ?? '0')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UniversityAnalytics;
