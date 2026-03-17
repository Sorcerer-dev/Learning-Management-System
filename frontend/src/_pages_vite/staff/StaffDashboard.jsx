import React, { useState, useEffect } from 'react';
import { ClipboardList, Users, MessageSquare, Loader2, Inbox } from 'lucide-react';
import { useAuth } from '../../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL;

const StaffDashboard = () => {
    const { user, token } = useAuth();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Faculty Hub</h1>
                <div className="flex space-x-3">
                    <button className="bg-white border border-gray-300 text-gray-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-gray-50">View Schedule</button>
                    <button className="bg-primary text-primary-foreground font-medium text-sm px-4 py-2 rounded-lg shadow-sm hover:opacity-95">Mark Attendance</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Mentees" value="—" icon={<Users className="w-5 h-5 text-primary" />} />
                <StatCard title="Classes Today" value="—" icon={<ClipboardList className="w-5 h-5 text-primary" />} />
                <StatCard title="Pending Counseling Logs" value="—" icon={<MessageSquare className="w-5 h-5 text-primary" />} className="border-l-4 border-l-yellow-400" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Today's Classes & Attendance</h2>
                </div>
                <div className="p-12 flex flex-col items-center justify-center text-center">
                    <Inbox className="w-12 h-12 text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No classes scheduled yet.</p>
                    <p className="text-sm text-slate-400 mt-1">Class schedules will appear here once configured by the HOD.</p>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, className = '' }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${className}`}>
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
        </div>
        <div className="flex items-baseline space-x-2">
            <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
        </div>
    </div>
);

export default StaffDashboard;
