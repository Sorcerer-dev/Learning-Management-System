import React, { useState } from 'react';
import { X } from 'lucide-react';

const CounselingLogModal = ({ student, onClose, onSave }) => {
    const [note, setNote] = useState('');

    if (!student) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Counseling Log</h2>
                        <p className="text-sm text-slate-500">{student.name} ({student.id})</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex-1">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        Add New Session Note
                    </label>
                    <textarea
                        className="w-full border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none h-40 text-slate-700"
                        placeholder="Enter discussion points, academic concerns, or general notes..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    ></textarea>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { onSave(note); onClose(); }}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-bold shadow-sm transition-colors"
                    >
                        Save Note
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CounselingLogModal;
