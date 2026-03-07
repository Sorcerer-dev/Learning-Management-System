import React from 'react';
import { ClipboardList, Users, MessageSquare } from 'lucide-react';

const StaffDashboard = () => {
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
                <StatCard title="Total Mentees" value="18" icon={<Users className="w-5 h-5 text-primary" />} />
                <StatCard title="Classes Today" value="3" icon={<ClipboardList className="w-5 h-5 text-primary" />} />
                <StatCard title="Pending Counseling Logs" value="2" icon={<MessageSquare className="w-5 h-5 text-primary" />} className="border-l-4 border-l-yellow-400" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Today's Classes & Attendance</h2>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        <ClassRow time="09:00 AM" subject="CS401: Data Structures" batch="CSE - 2nd Year" status="pending" />
                        <ClassRow time="11:15 AM" subject="CS405: Algorithms" batch="CSE - 2nd Year" status="marked" />
                        <ClassRow time="02:00 PM" subject="Lab: Data Structures" batch="CSE - 2nd Year Lab A" status="pending" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ClassRow = ({ time, subject, batch, status }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
        <div className="flex items-center space-x-4">
            <div className="text-sm font-bold text-gray-500 w-20">{time}</div>
            <div>
                <p className="font-semibold text-gray-900">{subject}</p>
                <p className="text-xs text-gray-500">{batch}</p>
            </div>
        </div>
        <div>
            {status === 'marked' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Marked
                </span>
            ) : (
                <button className="text-sm text-primary font-medium hover:underline">Take Attendance →</button>
            )}
        </div>
    </div>
);

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
