import React, { useState } from 'react';

const ClassAttendance = () => {
    // Generate 20 dummy students
    const initialStudents = Array.from({ length: 20 }, (_, i) => ({
        id: `STD${(i + 1).toString().padStart(3, '0')}`,
        name: `Student Name ${i + 1}`,
        present: true
    }));

    const [students, setStudents] = useState(initialStudents);

    const toggleAttendance = (id) => {
        setStudents(students.map(s => s.id === id ? { ...s, present: !s.present } : s));
    };

    const presentCount = students.filter(s => s.present).length;

    return (
        <div className="p-6 max-w-5xl mx-auto animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-slate-800">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Class Attendance</h1>
                    <p className="text-slate-500 font-medium mt-1">Semester 5 - Data Structures</p>
                </div>
                <div className="bg-primary/10 border border-primary/20 text-primary px-5 py-3 rounded-xl font-bold text-lg shadow-sm">
                    {presentCount} / 20 Present
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Roll No</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Name</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600 whitespace-nowrap">{student.id}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-800 whitespace-nowrap">{student.name}</td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-3">
                                            <span className={`text-sm font-bold w-12 text-center hidden sm:inline-block ${student.present ? 'text-primary' : 'text-slate-400'}`}>
                                                {student.present ? 'Present' : 'Absent'}
                                            </span>
                                            <button
                                                onClick={() => toggleAttendance(student.id)}
                                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${student.present ? 'bg-primary' : 'bg-slate-300'}`}
                                            >
                                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${student.present ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-xl shadow-md transition-all sm:w-auto w-full">
                    Submit Attendance Tracker
                </button>
            </div>
        </div>
    );
};

export default ClassAttendance;
