import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/ThemeContext';
import { FileText, Inbox, Users, Activity, Loader2, Phone } from 'lucide-react';
import { toast } from 'sonner';
import CounselingLogModal from './CounselingLogModal';
import PerformanceModal from './PerformanceModal';

const API_URL = import.meta.env.VITE_API_URL;

const MentorGroup = () => {
    const { token, role } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [performanceStudent, setPerformanceStudent] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await fetch(`${API_URL}/api/staff/my-department-students`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch department students');
                }

                const data = await res.json();
                setStudents(data);
            } catch (error) {
                console.error('Error fetching students:', error);
                toast.error('Failed to load students');
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [token]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Inactive': return 'bg-red-100 text-red-700 border-red-200';
            case 'Alumni': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-slate-500 font-medium">Loading department students...</p>
            </div>
        );
    }

    return (
        <div className="p-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {role === 'hr' ? 'All Students' : 'Department Students'}
                    </h1>
                    <p className="text-slate-500">Overview of all students currently enrolled in your department.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-border shadow-sm">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-bold text-lg text-slate-800">{students.length}</span>
                    <span className="text-sm font-medium text-slate-500">Students</span>
                </div>
            </div>

            {students.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-border p-12 flex flex-col items-center justify-center text-center">
                    <Inbox className="w-14 h-14 text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700">No students found</h3>
                    <p className="text-sm text-slate-400 mt-2 max-w-md">
                        There are currently no students assigned to your department. HR can upload students in bulk.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 text-slate-500 text-sm font-bold uppercase tracking-wider border-b border-border">
                                    <th className="px-6 py-4">Student Info</th>
                                    <th className="px-6 py-4">Batch</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {students.map((student) => (
                                    <tr key={student.regNo} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{student.name}</p>
                                                    <p className="text-sm text-slate-500">{student.regNo}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                {student.batchId}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                {student.phone ? (
                                                    <>
                                                        <Phone className="w-4 h-4 text-slate-400" />
                                                        {student.phone}
                                                    </>
                                                ) : (
                                                    <span className="text-slate-400 italic">No phone setup</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5 max-w-[200px] truncate" title={student.user?.email}>
                                                {student.user?.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(student.user?.status)}`}>
                                                <Activity className="w-3.5 h-3.5" />
                                                {student.user?.status || 'Active'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setPerformanceStudent(student)}
                                                    className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-bold text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 rounded-lg transition-colors cursor-pointer"
                                                    title="Record Marks & Attendance"
                                                >
                                                    <Activity className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Record</span>
                                                </button>
                                                <button
                                                    onClick={() => setSelectedStudent(student)}
                                                    className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-bold text-primary hover:text-white bg-primary/5 hover:bg-primary border border-primary/20 hover:border-primary rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Counseling</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <CounselingLogModal
                student={selectedStudent}
                onClose={() => setSelectedStudent(null)}
                onSave={(note) => {
                    console.log(`Saved note for ${selectedStudent?.name}: ${note}`);
                    toast.success('Counseling log added');
                    setSelectedStudent(null);
                }}
            />
        </div>
    );
};

export default MentorGroup;
