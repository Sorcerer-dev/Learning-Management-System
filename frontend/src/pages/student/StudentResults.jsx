import React from 'react';

const StudentResults = () => {
    const results = [
        { subject: 'Advanced Mathematics', code: 'MAT301', grade: 'A', points: 4.0 },
        { subject: 'Quantum Physics', code: 'PHY302', grade: 'B', points: 3.0 },
        { subject: 'Organic Chemistry', code: 'CHE303', grade: 'A', points: 4.0 },
        { subject: 'Computer Science', code: 'CSC304', grade: 'A', points: 4.0 },
        { subject: 'World History', code: 'HIS305', grade: 'B', points: 3.0 },
    ];

    return (
        <div className="p-6 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold mb-6 text-primary tracking-tight">Academic Results</h1>

            <div className="grid gap-5">
                {results.map((result, index) => (
                    <div
                        key={index}
                        className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-primary hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:-translate-y-0.5 group"
                    >
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors">{result.subject}</h3>
                            <p className="text-sm font-medium text-slate-500 mt-1">{result.code}</p>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto flex flex-row border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 sm:flex-col items-center sm:items-end justify-between">
                            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary/70">{result.grade}</span>
                            <div className="flex shrink-0 items-center justify-center w-max bg-slate-100 sm:bg-transparent px-3 py-1 rounded-full sm:px-0 sm:py-0 mt-0 sm:mt-1">
                                <p className="text-xs font-bold text-slate-600 sm:text-slate-500">{result.points.toFixed(1)} Grade Points</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentResults;
