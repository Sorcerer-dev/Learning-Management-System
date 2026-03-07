import React from 'react';

const StudentAttendance = () => {
    // Dummy Data
    const attendanceRecords = [
        { date: '2023-10-01', subject: 'Mathematics', status: 'Present' },
        { date: '2023-10-02', subject: 'Physics', status: 'Absent' },
        { date: '2023-10-03', subject: 'Chemistry', status: 'Present' },
        { date: '2023-10-04', subject: 'Mathematics', status: 'Present' },
        { date: '2023-10-05', subject: 'Physics', status: 'Present' },
    ];

    return (
        <div className="p-6 animate-in slide-in-from-bottom-4 duration-500 ease-out">
            <h1 className="text-3xl font-bold mb-6 text-primary">Attendance Report</h1>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-border">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Overall Attendance</h2>
                    <span className="text-4xl font-black text-primary drop-shadow-sm">75%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 mt-5 overflow-hidden">
                    <div className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: '75%' }}></div>
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
        </div>
    );
};

export default StudentAttendance;
