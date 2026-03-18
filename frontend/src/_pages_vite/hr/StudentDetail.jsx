import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/ThemeContext';
import { ArrowLeft, User, Library, GraduationCap, MapPin, Contact, Loader2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';

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

    // Process marks to compute averages per semester and type
    const marksData = (student.marks || []).reduce((acc, curr) => {
        const sem = `Sem ${curr.semester}`;
        if (!acc[sem]) acc[sem] = { semester: sem, Internal: 0, Model: 0, Semester: 0, counts: { Internal: 0, Model: 0, Semester: 0 } };
        
        const type = curr.markType || 'Semester';
        acc[sem][type] += curr.mark;
        acc[sem].counts[type] += 1;
        return acc;
    }, {});

    const formattedMarksValues = Object.values(marksData).map(s => ({
        semester: s.semester,
        Internal: s.counts.Internal ? Math.round(s.Internal / s.counts.Internal) : 0,
        Model: s.counts.Model ? Math.round(s.Model / s.counts.Model) : 0,
        Semester: s.counts.Semester ? Math.round(s.Semester / s.counts.Semester) : 0,
    }));

    // Process Attendance
    const attendanceData = (student.attendance || [])
        .sort((a, b) => a.semester - b.semester)
        .map(a => ({
            semester: `Sem ${a.semester}`,
            percentage: a.percentage
        }));

    // Process Fees
    const feesData = (student.fees || [])
        .sort((a, b) => a.year - b.year)
        .map(f => ({
            year: `Year ${f.year}`,
            paid: f.paidAmount,
            pending: f.totalAmount - f.paidAmount,
            total: f.totalAmount
        }));
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
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 border border-primary/20 flex items-center justify-center shadow-md">
                        {student.profilePic ? (
                            <img src={student.profilePic} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-12 h-12 text-primary opacity-80" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-gray-100 tracking-tight">{student.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1 uppercase text-sm">
                            {student.regNo} &bull; {student.user?.email}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 italic">Joined: {student.doj ? new Date(student.doj).toLocaleDateString() : 'N/A'}</p>
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
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-gray-100">
                                <Library className="w-5 h-5 text-primary" /> Performance Analytics
                            </h3>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">Arrears: {student.arrears?.length || 0}</span>
                        </div>
                        <div className="h-[300px] w-full min-h-0">
                            {formattedMarksValues.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={formattedMarksValues} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                                        <XAxis dataKey="semester" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748B', fontWeight: 600 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 100]} />
                                        <RechartsTooltip />
                                        <Legend verticalAlign="top" height={36}/>
                                        <Bar dataKey="Internal" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Model" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Semester" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                                    <Library className="w-12 h-12 mb-3 opacity-20" />
                                    <p className="font-medium text-sm">No marks data found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Attendance Tracking */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
                        <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-gray-100 mb-6">
                            <TrendingUp className="w-5 h-5 text-emerald-500" /> Attendance History
                        </h3>
                        <div className="h-[200px] w-full min-h-0">
                            {attendanceData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={attendanceData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                                        <XAxis dataKey="semester" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                        <RechartsTooltip />
                                        <Line type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                                    <p className="text-sm italic">Attendance records not available yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fees widget */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-gray-100 mb-6">
                            <Contact className="w-5 h-5 text-amber-500" /> Fee Status (All Years)
                        </h3>
                        {feesData.length > 0 ? (
                            <div className="space-y-4">
                                {feesData.map((fee, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{fee.year}</p>
                                            <p className="font-bold text-slate-800 dark:text-gray-200">₹{fee.paid.toLocaleString()} / ₹{fee.total.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${fee.pending <= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {fee.pending <= 0 ? 'Fully Paid' : `Pending: ₹${fee.pending.toLocaleString()}`}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-slate-400">
                                <p className="text-sm">No fee records found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetail;
