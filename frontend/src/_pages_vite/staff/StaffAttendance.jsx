import React, { useState } from 'react';
import { Inbox } from 'lucide-react';

const StaffAttendance = () => {
    const [students, setStudents] = useState([]);

    const toggleAttendance = (id) => {
        setStudents(students.map(student =>
            student.id === id ? { ...student, present: !student.present } : student
        ));
    };

    const presentCount = students.filter(s => s.present).length;

    return (
        <div className="p-6 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Class Attendance</h1>
                    <p className="text-slate-500 mt-1 font-medium">Select a batch to begin</p>
                </div>
                {students.length > 0 && (
                    <div className="bg-primary/10 border border-primary/20 text-primary px-5 py-3 rounded-xl font-bold text-lg shadow-sm flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                        {presentCount} / {students.length} Present
                    </div>
                )}
            </div>

            {students.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 flex flex-col items-center justify-center text-center">
                    <Inbox className="w-14 h-14 text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700">No students loaded</h3>
                    <p className="text-sm text-slate-400 mt-2 max-w-md">
                        Student lists will populate here once batch assignments are configured by the HOD.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                        {students.map((student) => (
                            <div
                                key={student.id}
                                onClick={() => toggleAttendance(student.id)}
                                className={`cursor-pointer border-2 rounded-2xl p-5 transition-all duration-300 flex items-center justify-between group
                                    ${student.present
                                        ? 'border-primary bg-primary/[0.03] shadow-md shadow-primary/5 hover:bg-primary/[0.05]'
                                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                                    }`}
                            >
                                <div>
                                    <p className={`font-bold text-lg transition-colors ${student.present ? 'text-primary' : 'text-slate-700'}`}>
                                        {student.name}
                                    </p>
                                    <p className={`text-sm mt-0.5 font-bold transition-colors ${student.present ? 'text-primary/70' : 'text-slate-400'}`}>
                                        {student.present ? 'Present' : 'Absent'}
                                    </p>
                                </div>

                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all duration-300
                                    ${student.present
                                        ? 'bg-primary border-primary scale-110 shadow-sm shadow-primary/30'
                                        : 'border-slate-300 group-hover:border-slate-400 bg-slate-50'
                                    }`}>
                                    {student.present && (
                                        <svg className="w-4 h-4 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 flex justify-end">
                        <button className="bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 text-primary-foreground font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Submit Attendance Tracker
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default StaffAttendance;
