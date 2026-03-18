import React, { useState } from 'react';
import { X, Loader2, Save, BarChart3, Percent } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

const PerformanceModal = ({ student, token, onClose, onRefresh }) => {
    const [type, setType] = useState('Marks'); // 'Marks' or 'Attendance'
    const [submitting, setSubmitting] = useState(false);

    // Marks State
    const [markForm, setMarkForm] = useState({
        semester: '1',
        subjectCode: '',
        markType: 'Semester',
        mark: '',
        passedYear: new Date().getFullYear().toString()
    });

    // Attendance State
    const [attForm, setAttForm] = useState({
        semester: '1',
        percentage: ''
    });

    const handleMarkSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/staff/students/${student.regNo}/marks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(markForm)
            });
            if (res.ok) {
                toast.success('Marks recorded successfully');
                setMarkForm({ ...markForm, subjectCode: '', mark: '' });
                if (onRefresh) onRefresh();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to record marks');
            }
        } catch (err) {
            toast.error('Network error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAttSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/staff/students/${student.regNo}/attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(attForm)
            });
            if (res.ok) {
                toast.success('Attendance recorded successfully');
                if (onRefresh) onRefresh();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to record attendance');
            }
        } catch (err) {
            toast.error('Network error');
        } finally {
            setSubmitting(false);
        }
    };

    if (!student) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">Performance Recording</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">{student.name} ({student.regNo})</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="flex border-b border-gray-100 dark:border-slate-800">
                    <button 
                        onClick={() => setType('Marks')} 
                        className={`flex-1 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 ${type === 'Marks' ? 'bg-primary/5 text-primary border-b-2 border-primary' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <BarChart3 className="w-4 h-4" /> Record Marks
                    </button>
                    <button 
                        onClick={() => setType('Attendance')} 
                        className={`flex-1 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 ${type === 'Attendance' ? 'bg-primary/5 text-primary border-b-2 border-primary' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Percent className="w-4 h-4" /> Record Attendance
                    </button>
                </div>

                <div className="p-6">
                    {type === 'Marks' ? (
                        <form onSubmit={handleMarkSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Semester</label>
                                    <select 
                                        value={markForm.semester} 
                                        onChange={(e) => setMarkForm({...markForm, semester: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Exam Type</label>
                                    <select 
                                        value={markForm.markType} 
                                        onChange={(e) => setMarkForm({...markForm, markType: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="Internal 1">Internal 1</option>
                                        <option value="Internal 2">Internal 2</option>
                                        <option value="Model">Model Exam</option>
                                        <option value="Semester">Semester Exam</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Subject Code</label>
                                <input 
                                    type="text" 
                                    value={markForm.subjectCode} 
                                    onChange={(e) => setMarkForm({...markForm, subjectCode: e.target.value})} 
                                    placeholder="e.g. CS8101" 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" 
                                    required 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Marks (Out of 100)</label>
                                    <input 
                                        type="number" 
                                        max="100" 
                                        min="0" 
                                        value={markForm.mark} 
                                        onChange={(e) => setMarkForm({...markForm, mark: e.target.value})} 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Year</label>
                                    <input 
                                        type="number" 
                                        value={markForm.passedYear} 
                                        onChange={(e) => setMarkForm({...markForm, passedYear: e.target.value})} 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" 
                                        required 
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Mark Record</>}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleAttSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Semester</label>
                                <select 
                                    value={attForm.semester} 
                                    onChange={(e) => setAttForm({...attForm, semester: e.target.value})}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Attendance Percentage</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        max="100" 
                                        min="0" 
                                        step="0.01" 
                                        value={attForm.percentage} 
                                        onChange={(e) => setAttForm({...attForm, percentage: e.target.value})} 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary" 
                                        required 
                                    />
                                    <span className="absolute right-3 top-2.5 font-bold text-slate-400">%</span>
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Update Attendance</>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PerformanceModal;
