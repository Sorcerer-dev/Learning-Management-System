import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/ThemeContext';
import { ArrowLeft, User, Library, GraduationCap, MapPin, Contact, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL;

const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await fetch(`${API_URL}/api/hr/students/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setStudent(await res.json());
                } else {
                    console.error('Failed to fetch student');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [id, token]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!student) {
        return (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                <h2>Student not found.</h2>
                <button onClick={() => navigate('/hr/student-management')} className="mt-4 text-primary underline">Go back</button>
            </div>
        );
    }

    // Process marks to compute averages per semester
    const semesterAverages = Object.values(
        (student.marks || []).reduce((acc, curr) => {
            if (!acc[curr.semester]) acc[curr.semester] = { semester: `Sem ${curr.semester}`, total: 0, count: 0 };
            acc[curr.semester].total += curr.mark;
            acc[curr.semester].count += 1;
            return acc;
        }, {})
    ).map(s => ({ ...s, averageMark: Math.round(s.total / s.count) }));

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
            {/* Header Area */}
            <button
                onClick={() => navigate('/hr/student-management')}
                className="flex items-center gap-2 mb-6 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors w-fit"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Directory
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-gray-100 dark:border-slate-800 pb-5">
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
                        <User className="w-10 h-10 text-primary opacity-80" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-gray-100 tracking-tight">{student.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1 uppercase text-sm">
                            {student.regNo} &bull; {student.user?.email}
                        </p>
                    </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full font-bold text-sm border shadow-sm ${student.user?.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {student.user?.status || 'Unknown'} Account
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Details */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Academic Context */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-gray-100 mb-4 border-b dark:border-slate-800 pb-2">
                            <GraduationCap className="w-5 h-5 text-primary" /> Enrollment Info
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div><p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-0.5 uppercase tracking-wider">Department</p><p className="font-bold text-slate-800 dark:text-gray-200">{student.user?.deptId || student.deptId || '-'}</p></div>
                            <div><p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-0.5 uppercase tracking-wider">Batch</p><p className="font-bold text-slate-800 dark:text-gray-200">{student.batchId || '-'}</p></div>
                            <div><p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-0.5 uppercase tracking-wider">Admission Type</p><p className="font-bold text-slate-800 dark:text-gray-200">{student.admissionType}</p></div>
                        </div>
                    </div>

                    {/* Personal & Family Details */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-gray-100 mb-4 border-b dark:border-slate-800 pb-2">
                            <Contact className="w-5 h-5 text-primary" /> Personal Profile
                        </h3>
                        <div className="space-y-4 text-sm grid grid-cols-2 gap-x-2">
                            <div className="col-span-2"><p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-0.5 uppercase tracking-wider">Parent/Guardian Name</p><p className="font-bold text-slate-800 dark:text-gray-200">{student.parentName || 'N/A'}</p></div>
                            <div className="col-span-2"><p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-0.5 uppercase tracking-wider">Parent Contact</p><p className="font-bold text-slate-800 dark:text-gray-200">{student.parentContact || 'N/A'}</p></div>
                            
                            <div className="col-span-1"><p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-0.5 uppercase tracking-wider">Religion</p><p className="font-medium text-slate-700 dark:text-gray-300">{student.religion || '-'}</p></div>
                            <div className="col-span-1"><p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-0.5 uppercase tracking-wider">Gender</p><p className="font-medium text-slate-700 dark:text-gray-300">{student.gender || '-'}</p></div>
                            <div className="col-span-1"><p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-0.5 uppercase tracking-wider">DOB</p><p className="font-medium text-slate-700 dark:text-gray-300">{student.dob ? new Date(student.dob).toLocaleDateString() : '-'}</p></div>
                            <div className="col-span-1"><p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-0.5 uppercase tracking-wider">Blood Group</p><p className="font-medium text-slate-700 dark:text-gray-300">{student.bloodGroup || '-'}</p></div>
                        </div>
                    </div>

                    {/* Location & Logistical Info */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-gray-100 mb-4 border-b dark:border-slate-800 pb-2">
                            <MapPin className="w-5 h-5 text-primary" /> Logistics
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div><p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-0.5 uppercase tracking-wider">Boarding Status</p>
                                <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 rounded-full font-bold text-xs">{student.boardingStatus || 'Day Scholar'}</span>
                            </div>
                            <div><p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-0.5 uppercase tracking-wider">City</p><p className="font-medium text-slate-700 dark:text-gray-300">{student.city || '-'}</p></div>
                            <div><p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-0.5 uppercase tracking-wider">Full Address</p><p className="font-medium text-slate-700 dark:text-gray-300">{student.address || 'Address unprovided'}</p></div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Analytics & Stats */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Academic Performance Chart */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 h-[400px] flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-gray-100">
                                <Library className="w-5 h-5 text-primary" /> Academic Trajectory
                            </h3>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">Total Arrears: {student.arrears?.length || 0}</span>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            {semesterAverages.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={semesterAverages} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                                        <XAxis dataKey="semester" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748B', fontWeight: 600 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 100]} />
                                        <RechartsTooltip
                                            cursor={{ fill: 'rgba(56, 189, 248, 0.05)' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'var(--tw-bg-opacity, #fff)', color: 'var(--tw-text-opacity, #000)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            className="dark:fill-slate-900"
                                            itemStyle={{ color: '#0ea5e9' }}
                                        />
                                        <Bar dataKey="averageMark" name="Avg Marks" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={60} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                                    <Library className="w-12 h-12 mb-3 opacity-20" />
                                    <p className="font-medium">No marks data found for this student.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Further widgets (e.g., Timeline, Recent Activity) could be added here */}
                </div>
            </div>
        </div>
    );
};

export default StudentDetail;
