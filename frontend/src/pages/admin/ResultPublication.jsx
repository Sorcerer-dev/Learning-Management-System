import React, { useState } from 'react';
import { Megaphone, CheckCircle2 } from 'lucide-react';

const ResultPublication = () => {
    const [loading, setLoading] = useState(false);
    const [published, setPublished] = useState(false);

    const handlePublish = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setPublished(true);
        }, 2500);
    };

    return (
        <div className="p-6 max-w-3xl mx-auto animate-in fade-in duration-300">
            <h1 className="text-3xl font-bold text-primary mb-6">Result Publication</h1>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
                {!published ? (
                    <>
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-slate-700 mb-3">
                                Select Academic Batch for Publication
                            </label>
                            <select className="w-full border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-800 font-bold appearance-none bg-slate-50 cursor-pointer">
                                <option>Fall 2023 - Semester 5</option>
                                <option>Fall 2023 - Semester 7</option>
                                <option>Spring 2023 - Semester 2</option>
                                <option>Spring 2023 - Semester 4</option>
                            </select>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-xl mb-8 font-medium text-sm flex gap-4 items-start shadow-sm">
                            <Megaphone className="w-6 h-6 shrink-0 text-amber-600 mt-0.5" />
                            <p className="leading-relaxed">Publishing results will instantly notify all students via email and SMS. It will also lock the marks entry for grading staff in this batch. Are you sure you're ready to proceed?</p>
                        </div>

                        <button
                            onClick={handlePublish}
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all flex items-center justify-center gap-3
                                ${loading ? 'bg-primary/70 cursor-wait' : 'bg-primary hover:bg-primary/90 hover:-translate-y-1 hover:shadow-primary/30'}
                            `}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing Results...
                                </>
                            ) : (
                                'Publish Results to Student Portal'
                            )}
                        </button>
                    </>
                ) : (
                    <div className="text-center py-12 animate-in zoom-in duration-300">
                        <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-800 mb-3">Results Published Successfully!</h2>
                        <p className="text-slate-500 font-medium mb-10 max-w-md mx-auto leading-relaxed">
                            The Fall 2023 Semester 5 results are now live. Students can view them on their dashboards and notifications have been dispatched.
                        </p>
                        <button
                            onClick={() => setPublished(false)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl transition-colors"
                        >
                            Publish another batch
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultPublication;
