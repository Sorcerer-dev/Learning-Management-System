import React from 'react';
import { Inbox } from 'lucide-react';

const StudentAttendance = () => {
    // Will be populated from API when attendance tracking is implemented
    const attendanceRecords = [];

    const overallPercentage = attendanceRecords.length > 0
        ? Math.round((attendanceRecords.filter(r => r.status === 'Present').length / attendanceRecords.length) * 100)
        : 0;

    return (
        <div className="p-6 animate-in slide-in-from-bottom-4 duration-500 ease-out">
            <h1 className="text-3xl font-bold mb-6 text-primary">Attendance Report</h1>

            {attendanceRecords.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-border p-12 flex flex-col items-center justify-center text-center">
                    <Inbox className="w-14 h-14 text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700">No attendance records yet</h3>
                    <p className="text-sm text-slate-400 mt-2 max-w-md">
                        Your attendance records will appear here once your faculty begins tracking daily attendance.
                    </p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-border">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Overall Attendance</h2>
                            <span className="text-4xl font-black text-primary drop-shadow-sm">{overallPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 mt-5 overflow-hidden">
                            <div className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${overallPercentage}%` }}></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-border">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {attendanceRecords.map((record, index) => (
                                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">{record.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{record.subject}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${record.status === 'Present'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentAttendance;
