import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import CounselingLogModal from './CounselingLogModal';

const MentorGroup = () => {
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Dummy data for 15 mentees
    const mentees = Array.from({ length: 15 }, (_, i) => ({
        id: `MNT${(i + 1).toString().padStart(3, '0')}`,
        name: `Mentee Student ${i + 1}`,
        year: i % 2 === 0 ? 'Year 2' : 'Year 3',
        cgpa: (Math.random() * (4.0 - 2.5) + 2.5).toFixed(2)
    }));

    return (
        <div className="p-6 animate-in fade-in duration-300">
            <h1 className="text-3xl font-bold text-primary mb-6">My Mentor Group</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {mentees.map((mentee) => (
                    <div key={mentee.id} className="bg-white rounded-xl shadow-sm border border-border p-5 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">{mentee.name}</h3>
                                <p className="text-sm font-medium text-slate-500">{mentee.id} • {mentee.year}</p>
                            </div>
                            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-black border border-primary/20">
                                {mentee.cgpa}
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedStudent(mentee)}
                            className="w-full mt-2 flex items-center justify-center gap-2 bg-slate-50 hover:bg-primary hover:text-white text-slate-700 border border-slate-200 py-2.5 rounded-lg font-bold transition-all group"
                        >
                            <FileText className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                            View Counseling Logs
                        </button>
                    </div>
                ))}
            </div>

            <CounselingLogModal
                student={selectedStudent}
                onClose={() => setSelectedStudent(null)}
                onSave={(note) => {
                    console.log(`Saved note for ${selectedStudent?.name}: ${note}`);
                }}
            />
        </div>
    );
};

export default MentorGroup;
