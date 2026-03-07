import React from 'react';

const UniversityAnalytics = () => {
    const data = [
        { dept: 'Civil Engineering (CIV)', passRate: 88, color: 'bg-indigo-500' },
        { dept: 'Electronics (ECE)', passRate: 76, color: 'bg-emerald-500' },
        { dept: 'Electrical (EEE)', passRate: 82, color: 'bg-amber-500' },
        { dept: 'Mechanical (MECH)', passRate: 70, color: 'bg-rose-500' },
    ];

    return (
        <div className="p-6 max-w-5xl mx-auto animate-in fade-in duration-300">
            <h1 className="text-3xl font-bold text-primary mb-2">University Analytics</h1>
            <p className="text-slate-500 mb-8 font-medium">Semester Results Overview - Pass Percentage by Department</p>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-8">Department Pass Rates</h3>

                <div className="flex flex-col gap-6">
                    {data.map((item) => (
                        <div key={item.dept}>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                                <span className="font-bold text-slate-700">{item.dept}</span>
                                <span className="font-extrabold text-slate-600 sm:text-right">{item.passRate}% Pass Rate</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden border border-slate-200/50">
                                <div
                                    className={`h-5 rounded-full ${item.color} transition-all duration-1000 ease-out`}
                                    style={{ width: `${item.passRate}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100">
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Students</p>
                        <p className="text-3xl font-black text-slate-800 mt-2">4,250</p>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Overall Pass</p>
                        <p className="text-3xl font-black text-primary mt-2">79%</p>
                    </div>
                    <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-100">
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Distinctions</p>
                        <p className="text-3xl font-black text-emerald-600 mt-2">1,120</p>
                    </div>
                    <div className="p-4 bg-rose-50/80 rounded-xl border border-rose-100">
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Arrears</p>
                        <p className="text-3xl font-black text-rose-600 mt-2">890</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UniversityAnalytics;
