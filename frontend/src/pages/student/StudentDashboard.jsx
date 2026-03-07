import React from 'react';
import { BookOpen, CalendarCheck, TrendingUp, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const StudentDashboard = () => {
    const { role } = useTheme();

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome back, Alex!</h1>
                    <p className="text-gray-600 mt-1">B.Tech Computer Science | Sem 4 | Batch 2024-28</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-2">
                    <span className="bg-white px-3 py-1 rounded-full text-sm font-medium border border-gray-200 shadow-sm">Registration: <span className="text-primary">REG24CS089</span></span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Overall Attendance"
                    value="88.5%"
                    subtitle="Target: 75%"
                    icon={<CalendarCheck className="w-5 h-5 text-primary" />}
                    progress={88.5}
                />
                <StatCard
                    title="Current CGPA"
                    value="8.42"
                    subtitle="Up 0.2 from last sem"
                    icon={<TrendingUp className="w-5 h-5 text-primary" />}
                />
                <StatCard
                    title="Active Arrears"
                    value="0"
                    subtitle="All clear! 🎉"
                    icon={<AlertCircle className="w-5 h-5 text-emerald-500" />}
                    className="border-t-4 border-t-emerald-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Marks Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Recent Marks (Sem 3)</h2>
                        <button className="text-sm text-primary font-medium hover:underline">View All</button>
                    </div>
                    <div className="p-0">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Subject</th>
                                    <th className="px-6 py-3">Grade</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <MarkRow subject="CS301: OOP in Java" grade="A" />
                                <MarkRow subject="CS302: Digital Logic" grade="A+" />
                                <MarkRow subject="MA301: Discrete Math" grade="B" />
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Announcements / Upcoming */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Announcements</h2>
                    <div className="space-y-4">
                        <div className="flex space-x-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-gray-100 transition-colors">
                            <div className="mt-0.5"><BookOpen className="w-5 h-5 text-primary" /></div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">End Semester Exam Timetable Released</p>
                                <p className="text-xs text-gray-500 mt-1">Posted by CoE Office • 2 days ago</p>
                            </div>
                        </div>
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

const MarkRow = ({ subject, grade }) => (
    <tr className="hover:bg-gray-50/50">
        <td className="px-6 py-4 font-medium text-gray-900">{subject}</td>
        <td className="px-6 py-4 font-bold">{grade}</td>
        <td className="px-6 py-4">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Pass
            </span>
        </td>
    </tr>
)

export default StudentDashboard;
