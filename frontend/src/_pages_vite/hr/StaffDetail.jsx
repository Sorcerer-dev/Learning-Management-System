import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/ThemeContext';
import { ArrowLeft, Briefcase, User, MapPin, Contact, Calendar, Users, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const StaffDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const res = await fetch(`${API_URL}/api/hr/staff/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setStaff(await res.json());
                } else {
                    console.error('Failed to fetch staff');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, [id, token]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!staff) {
        return (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                <h2>Staff member not found.</h2>
                <button onClick={() => navigate('/hr/staff')} className="mt-4 text-primary underline">Go back</button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
            {/* Header Area */}
            <button
                onClick={() => navigate('/hr/staff')}
                className="flex items-center gap-2 mb-6 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors w-fit"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Staff List
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-gray-100 dark:border-slate-800 pb-5">
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 dark:from-indigo-500/30 dark:to-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-sm">
                        <User className="w-10 h-10 text-indigo-500 opacity-80" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-gray-100 tracking-tight">{staff.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1 uppercase text-sm flex items-center gap-2">
                            {staff.staffId} &bull; {staff.user?.email}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className={`px-4 py-1.5 rounded-full font-bold text-xs border shadow-sm ${staff.user?.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {staff.user?.status || 'Unknown'} Account
                    </div>
                    <span className="text-xs font-bold text-slate-400">Joined: {new Date(staff.doj).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Details */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Professional Context */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-gray-100 mb-4 border-b dark:border-slate-800 pb-2">
                            <Briefcase className="w-5 h-5 text-indigo-500" /> Work Profile
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div><p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-0.5 uppercase tracking-wider">Department</p><p className="font-bold text-slate-800 dark:text-gray-200">{staff.deptId || '-'}</p></div>
                            <div><p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-0.5 uppercase tracking-wider">Designation / Role</p><p className="font-bold text-slate-800 dark:text-gray-200">{staff.designation || staff.user?.tagAccess || '-'}</p></div>
                            {staff.salary !== null && staff.salary !== undefined && (
                                <div><p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-0.5 uppercase tracking-wider">Compensation</p><p className="font-bold text-slate-800 dark:text-gray-200">${staff.salary.toLocaleString()}</p></div>
                            )}
                        </div>
                    </div>

                    {/* Personal Details */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-gray-100 mb-4 border-b dark:border-slate-800 pb-2">
                            <Contact className="w-5 h-5 text-indigo-500" /> Personal Information
                        </h3>
                        <div className="space-y-4 text-sm grid grid-cols-2 gap-x-2">
                            <div className="col-span-2"><p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-0.5 uppercase tracking-wider">Phone</p><p className="font-medium text-slate-800 dark:text-gray-200">{staff.phone || '-'}</p></div>
                            <div className="col-span-2"><p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-0.5 uppercase tracking-wider">Parent/Guardian</p><p className="font-medium text-slate-800 dark:text-gray-200">{staff.parentName || '-'}</p></div>
                            <div className="col-span-2"><p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-0.5 uppercase tracking-wider">Religion</p><p className="font-medium text-slate-800 dark:text-gray-200">{staff.religion || '-'}</p></div>
                        </div>
                    </div>

                    {/* Location Info */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-gray-100 mb-4 border-b dark:border-slate-800 pb-2">
                            <MapPin className="w-5 h-5 text-indigo-500" /> Location Details
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div><p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-0.5 uppercase tracking-wider">City</p><p className="font-medium text-slate-700 dark:text-gray-300">{staff.city || '-'}</p></div>
                            <div><p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-0.5 uppercase tracking-wider">Boarding Status</p>
                                <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 rounded-full font-bold text-xs">{staff.boardingStatus || 'Day Scholar'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Roles & Mentorship Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Mentorship / Advising Groups */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-gray-100">
                                <Users className="w-5 h-5 text-indigo-500" /> Assigned Students & Groups
                            </h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
                            {/* Advisor Group */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-5 flex flex-col">
                                <h4 className="font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 text-sm uppercase tracking-wide">Batch Advised</h4>
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    {(staff.advisedBatch && staff.advisedBatch.length > 0) ? (
                                        <div className="space-y-3">
                                            {staff.advisedBatch.map(stu => (
                                                <div key={stu.regNo} className="bg-white border text-sm border-slate-200 p-3 rounded-lg shadow-sm group hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => navigate(`/hr/student/${stu.regNo}`)}>
                                                    <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{stu.name}</p>
                                                    <p className="text-xs text-slate-500">{stu.regNo} • {stu.batchId}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                                            <p className="text-sm">No batch assigned as advisor.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mentoring Group */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-5 flex flex-col">
                                <h4 className="font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 text-sm uppercase tracking-wide">Mentees</h4>
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    {(staff.mentees && staff.mentees.length > 0) ? (
                                        <div className="space-y-3">
                                            {staff.mentees.map(stu => (
                                                <div key={stu.regNo} className="bg-white text-sm border border-slate-200 p-3 rounded-lg shadow-sm group hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => navigate(`/hr/student/${stu.regNo}`)}>
                                                    <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{stu.name}</p>
                                                    <p className="text-xs text-slate-500">{stu.regNo}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                                            <p className="text-sm">No mentees assigned.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDetail;
