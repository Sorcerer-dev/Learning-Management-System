import React, { useState } from 'react';
import { useAuth } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { 
    Users, 
    Search, 
    Filter, 
    MoreVertical, 
    Table,
    Download,
    Upload,
    Plus,
    X,
    Loader2,
    CheckCircle2,
    UserX,
    AlertCircle,
    UserPlus,
    TrendingUp,
    FilterX,
    ChevronRight,
    LayoutPanelLeft,
    Pencil,
    Lock,
    Unlock
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TableSkeleton from '../../components/shared/TableSkeleton';

const API_URL = import.meta.env.VITE_API_URL;

const StudentManagement = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // List & Filter State
    const [filterBatch, setFilterBatch] = useState('');
    const [filterDept, setFilterDept] = useState('');

    // Field Selector State
    const [showEmail, setShowEmail] = useState(true);
    const [showAdmission, setShowAdmission] = useState(false);
    const [showParentContact, setShowParentContact] = useState(false);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [editForm, setEditForm] = useState({ 
        name: '', email: '', department: '', batch: '', admissionType: 'Counseling', 
        parentName: '', parentContact: '', 
        phone: '', address: '', dob: '', gender: '', bloodGroup: '', religion: '', city: '', boardingStatus: 'Day Scholar',
        profilePic: '', doj: ''
    });
    const [editSubmitting, setEditSubmitting] = useState(false);

    // Fetch Students
    const { data: students = [], isLoading: studentsLoading } = useQuery({
        queryKey: ['students', filterBatch, filterDept],
        queryFn: async () => {
            const query = new URLSearchParams();
            if (filterBatch) query.append('batch', filterBatch);
            if (filterDept) query.append('dept', filterDept);
            const res = await fetch(`${API_URL}/api/hr/students?${query.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch students');
            return res.json();
        },
        enabled: !!token
    });

    // Fetch Batches
    const { data: batches = [] } = useQuery({
        queryKey: ['batches'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/api/hr/batches`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch batches');
            return res.json();
        },
        enabled: !!token
    });

    // Fetch Departments
    const { data: departments = [] } = useQuery({
        queryKey: ['departments'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/api/hr/departments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch departments');
            return res.json();
        },
        enabled: !!token
    });

    // Optimistic Status Toggle Mutation
    const statusMutation = useMutation({
        mutationFn: async ({ id }) => {
            const res = await fetch(`${API_URL}/api/hr/students/${id}/status`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Status update failed');
            return res.json();
        },
        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({ queryKey: ['students'] });
            const previousStudents = queryClient.getQueryData(['students', filterBatch, filterDept]);

            queryClient.setQueryData(['students', filterBatch, filterDept], (old) => 
                old?.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s)
            );

            return { previousStudents };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['students', filterBatch, filterDept], context.previousStudents);
            toast.error('Failed to update student status');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['hrStats'] });
            queryClient.invalidateQueries({ queryKey: ['hrAnalytics'] });
        }
    });

    // Profile Lock Mutation
    const lockMutation = useMutation({
        mutationFn: async ({ id }) => {
            const res = await fetch(`${API_URL}/api/hr/students/${id}/lock-profile`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Lock update failed');
            return res.json();
        },
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
        onError: () => {
            toast.error('Failed to update profile access');
        }
    });

    const handleToggleLock = (e, id) => {
        e.stopPropagation();
        lockMutation.mutate({ id });
    };

    const handleToggleStatus = (id, name, currentStatus) => {
        const actionStr = currentStatus === 'Active' ? 'deactivate' : 'activate';
        if (!window.confirm(`Are you sure you want to ${actionStr} ${name}?`)) return;
        
        toast.promise(statusMutation.mutateAsync({ id }), {
            loading: `${actionStr.charAt(0).toUpperCase() + actionStr.slice(1)}ing student...`,
            success: `Student account ${actionStr}d successfully`,
            error: `Failed to ${actionStr} student`
        });
    };

    const openEditModal = (student) => {
        setEditingStudent(student);
        setEditForm({
            name: student.name || '',
            email: student.email || '',
            department: student.department || student.user?.deptId || '',
            batch: student.batch || '',
            admissionType: student.admissionType || 'Counseling',
            parentName: student.parentName || '',
            parentContact: student.parentContact || '',
            phone: student.phone || '',
            address: student.address || '',
            dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
            gender: student.gender || '',
            bloodGroup: student.bloodGroup || '',
            religion: student.religion || '',
            city: student.city || '',
            boardingStatus: student.boardingStatus || 'Day Scholar',
            profilePic: student.profilePic || '',
            doj: student.doj ? new Date(student.doj).toISOString().split('T')[0] : ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editingStudent) return;
        setEditSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/hr/students/${editingStudent.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Student updated successfully');
                setIsEditModalOpen(false);
                setEditingStudent(null);
                queryClient.invalidateQueries({ queryKey: ['students'] });
                queryClient.invalidateQueries({ queryKey: ['hrStats'] });
                queryClient.invalidateQueries({ queryKey: ['hrAnalytics'] });
            } else {
                toast.error(data.error || 'Failed to update student');
            }
        } catch (err) {
            toast.error('Network error. Failed to update student.');
        } finally {
            setEditSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-300">
            <div className="mb-8 flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                        <Users className="w-8 h-8" />
                        Student Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Manage student accounts, view profiles, and access directory.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-border dark:border-slate-800 p-6 flex flex-col gap-6 self-start">
                    <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                        <Filter className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">Hierarchical Filters</h3>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select Department</label>
                        <select
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none bg-slate-50 dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                        >
                            <option value="">All Departments</option>
                            {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.id}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select Batch</label>
                        <select
                            value={filterBatch}
                            onChange={(e) => setFilterBatch(e.target.value)}
                            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none bg-slate-50 dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                        >
                            <option value="">All Batches</option>
                            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <LayoutPanelLeft className="w-4 h-4 text-primary" />
                            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100">Field Selector (Columns)</h4>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                <input type="checkbox" checked={showEmail} onChange={() => setShowEmail(!showEmail)} className="rounded text-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700" />
                                Email Address
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                <input type="checkbox" checked={showAdmission} onChange={() => setShowAdmission(!showAdmission)} className="rounded text-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700" />
                                Admission Type
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                <input type="checkbox" checked={showParentContact} onChange={() => setShowParentContact(!showParentContact)} className="rounded text-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700" />
                                Parent Contact
                            </label>
                        </div>
                    </div>
                </div>

                {/* Table View */}
                <div className="lg:col-span-3">
                    {studentsLoading && students.length === 0 ? (
                        <TableSkeleton rows={8} cols={6} />
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-border dark:border-slate-800 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">Student Directory ({students.length})</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name & Reg No</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Dept & Batch</th>
                                            {showEmail && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Email</th>}
                                            {showAdmission && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Admission</th>}
                                            {showParentContact && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Parent Contact</th>}
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                        {students.length === 0 ? (
                                            <tr><td colSpan="9" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No students match your filters.</td></tr>
                                        ) : (
                                            students.map((student) => (
                                                <tr key={student.id} onClick={(e) => {
                                                    if(e.target.closest('button')) return;
                                                    navigate(`/hr/student/${student.id}`);
                                                }} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
                                                                {student.profilePic ? (
                                                                    <img src={student.profilePic} alt={student.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Users className="w-5 h-5 text-slate-400" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{student.name}</div>
                                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{student.regNo}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{student.department}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{student.batch}</div>
                                                    </td>
                                                    {showEmail && <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 truncate max-w-[150px]">{student.email}</td>}
                                                    {showAdmission && <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{student.admissionType || '-'}</td>}
                                                    {showParentContact && <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{student.parentContact || <span className="text-slate-400 dark:text-slate-500 italic text-xs">Not provided</span>}</td>}
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${student.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                                                            {student.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right border-l border-gray-50 dark:border-slate-800 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={(e) => handleToggleLock(e, student.id)}
                                                            className={`p-2 rounded-lg transition-colors ${student.profileLocked ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                                                            title={student.profileLocked ? 'Grant profile edit access' : 'Revoke profile edit access'}
                                                        >
                                                            {student.profileLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleStatus(student.id, student.name, student.status);
                                                            }}
                                                            className={`p-2 rounded-lg transition-colors ${student.status === 'Active' ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20' : 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20'}`}
                                                            title={student.status === 'Active' ? 'Deactivate student' : 'Activate student'}
                                                        >
                                                            {student.status === 'Active' ? <UserX className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openEditModal(student);
                                                            }}
                                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                            title="Edit student"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Student Modal */}
            {isEditModalOpen && editingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Edit Student</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Reg No: {editingStudent.regNo || editingStudent.id}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-500 dark:text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="edit-student-form" onSubmit={handleEditSubmit} className="space-y-4">
                                <div className="space-y-6">
                                    {/* Section 1: Identity & Enrollment */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-gray-100 dark:border-slate-800 pb-1">1. Identity & Enrollment</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                                                <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none" required />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Email</label>
                                                <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none" required />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Date of Joining</label>
                                                <input type="date" value={editForm.doj} onChange={(e) => setEditForm({...editForm, doj: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Department</label>
                                                <select value={editForm.department} onChange={(e) => setEditForm({...editForm, department: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                                                    {departments.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Batch</label>
                                                <select value={editForm.batch} onChange={(e) => setEditForm({...editForm, batch: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                                                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Admission Type</label>
                                                <select value={editForm.admissionType} onChange={(e) => setEditForm({...editForm, admissionType: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                                                    <option value="Counseling">Counseling</option>
                                                    <option value="Management">Management</option>
                                                    <option value="Lateral Entry">Lateral Entry</option>
                                                    <option value="Transfer">Transfer</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Profile Pic URL</label>
                                                <input type="text" value={editForm.profilePic} onChange={(e) => setEditForm({...editForm, profilePic: e.target.value})} placeholder="https://..." className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Personal & Demographic */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-gray-100 dark:border-slate-800 pb-1">2. Personal & Demographic</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Date of Birth</label>
                                                <input type="date" value={editForm.dob} onChange={(e) => setEditForm({...editForm, dob: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Gender</label>
                                                <select value={editForm.gender} onChange={(e) => setEditForm({...editForm, gender: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                                                    <option value="">Select</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Blood Group</label>
                                                <input type="text" value={editForm.bloodGroup} onChange={(e) => setEditForm({...editForm, bloodGroup: e.target.value})} placeholder="O+" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Religion</label>
                                                <input type="text" value={editForm.religion} onChange={(e) => setEditForm({...editForm, religion: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">City</label>
                                                <input type="text" value={editForm.city} onChange={(e) => setEditForm({...editForm, city: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Boarding Status</label>
                                                <select value={editForm.boardingStatus} onChange={(e) => setEditForm({...editForm, boardingStatus: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                                                    <option value="Hosteller">Hosteller</option>
                                                    <option value="Day Scholar">Day Scholar</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Student Phone</label>
                                                <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Current Address</label>
                                                <textarea value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none" rows="2" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Guardian Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-gray-100 dark:border-slate-800 pb-1">3. Guardian & Family</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Guardian Name</label>
                                                <input type="text" value={editForm.parentName} onChange={(e) => setEditForm({...editForm, parentName: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Guardian Contact</label>
                                                <input type="tel" value={editForm.parentContact} onChange={(e) => setEditForm({...editForm, parentContact: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/30 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="edit-student-form"
                                disabled={editSubmitting}
                                className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
                            >
                                {editSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentManagement;
