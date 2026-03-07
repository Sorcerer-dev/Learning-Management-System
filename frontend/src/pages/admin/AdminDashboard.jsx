import React from 'react';
import { Users, BookOpen, GraduationCap, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
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
                <StatCard title="Total Students" value="4,208" icon={<Users className="w-5 h-5 text-primary" />} trend="+2% from last year" />
                <StatCard title="Total Staff" value="312" icon={<BookOpen className="w-5 h-5 text-primary" />} />
                <StatCard title="Avg Pass Percentage" value="84.2%" icon={<GraduationCap className="w-5 h-5 text-primary" />} trend="Up 1.5%" />
                <StatCard title="Red Flags (Arrears)" value="89" icon={<AlertTriangle className="w-5 h-5 text-destructive" />} className="border-l-4 border-l-destructive" />
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
                        <div className="p-4 border rounded-lg bg-orange-50 border-orange-100 flex items-start justify-between">
                            <div>
                                <p className="font-medium text-sm text-gray-900">Batch 2021-25 Records</p>
                                <p className="text-xs text-gray-500 mt-1">Requested by HR Admin</p>
                            </div>
                            <button className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded font-medium">Review</button>
                        </div>
                        <div className="text-sm text-gray-500 text-center py-4">No more requests</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, trend, className = '' }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${className}`}>
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
        </div>
        <div className="flex items-baseline space-x-2">
            <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
            {trend && <span className="text-xs font-medium text-green-600">{trend}</span>}
        </div>
    </div>
);

export default AdminDashboard;
