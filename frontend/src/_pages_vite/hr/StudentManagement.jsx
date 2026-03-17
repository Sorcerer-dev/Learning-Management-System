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
    Pencil
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TableSkeleton from '../../components/shared/TableSkeleton';

const API_URL = import.meta.env.VITE_API_URL;
const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'MECH', 'IT'];

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
    const [editForm, setEditForm] = useState({ name: '', email: '', department: 'CSE', batch: '', admissionType: 'Counseling', parentContact: '' });
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
            department: student.department || 'CSE',
            batch: student.batch || '',
            admissionType: student.admissionType || 'Counseling',
            parentContact: student.parentContact || ''
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
            <div className="mb-8 flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                        <Users className="w-8 h-8" />
                        Student Management
                    </h1>
                    <p className="text-slate-500 mt-2">Manage student accounts, view profiles, and access directory.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col gap-6 self-start">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                        <Filter className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-gray-800">Hierarchical Filters</h3>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Select Department</label>
                        <select
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none bg-slate-50"
                        >
                            <option value="">All Departments</option>
                            {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Select Batch</label>
                        <select
                            value={filterBatch}
                            onChange={(e) => setFilterBatch(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none bg-slate-50"
                        >
                            <option value="">All Batches</option>
                            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <LayoutPanelLeft className="w-4 h-4 text-primary" />
                            <h4 className="font-bold text-sm text-gray-800">Field Selector (Columns)</h4>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                <input type="checkbox" checked={showEmail} onChange={() => setShowEmail(!showEmail)} className="rounded text-primary focus:ring-primary" />
                                Email Address
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                <input type="checkbox" checked={showAdmission} onChange={() => setShowAdmission(!showAdmission)} className="rounded text-primary focus:ring-primary" />
                                Admission Type
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                <input type="checkbox" checked={showParentContact} onChange={() => setShowParentContact(!showParentContact)} className="rounded text-primary focus:ring-primary" />
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
                        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                                <h2 className="text-xl font-bold text-slate-800">Student Directory ({students.length})</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name & Reg No</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dept & Batch</th>
                                            {showEmail && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>}
                                            {showAdmission && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Admission</th>}
                                            {showParentContact && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Parent Contact</th>}
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {students.length === 0 ? (
                                            <tr><td colSpan="9" className="px-6 py-8 text-center text-slate-500">No students match your filters.</td></tr>
                                        ) : (
                                            students.map((student) => (
                                                <tr key={student.id} onClick={(e) => {
                                                    if(e.target.closest('button')) return;
                                                    navigate(`/hr/student/${student.id}`);
                                                }} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-slate-800">{student.name}</div>
                                                        <div className="text-xs text-slate-500 mt-0.5">{student.regNo}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-slate-700">{student.department}</div>
                                                        <div className="text-xs text-slate-500 mt-0.5">{student.batch}</div>
                                                    </td>
                                                    {showEmail && <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[150px]">{student.email}</td>}
                                                    {showAdmission && <td className="px-6 py-4 text-sm text-slate-600">{student.admissionType || '-'}</td>}
                                                    {showParentContact && <td className="px-6 py-4 text-sm text-slate-600">{student.parentContact || <span className="text-slate-400 italic text-xs">Not provided</span>}</td>}
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${student.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                            {student.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right border-l border-gray-50 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleStatus(student.id, student.name, student.status);
                                                            }}
                                                            className={`p-2 rounded-lg transition-colors ${student.status === 'Active' ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                                            title={student.status === 'Active' ? 'Deactivate student' : 'Activate student'}
                                                        >
                                                            {student.status === 'Active' ? <UserX className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
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
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Edit Student</h2>
                                <p className="text-sm text-slate-500">Reg No: {editingStudent.regNo || editingStudent.id}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="edit-student-form" onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                        <select
                                            value={editForm.department}
                                            onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none"
                                        >
                                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                                        <select
                                            value={editForm.batch}
                                            onChange={(e) => setEditForm({ ...editForm, batch: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none"
                                        >
                                            <option value="">Select Batch</option>
                                            {batches.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Admission Type</label>
                                        <select
                                            value={editForm.admissionType}
                                            onChange={(e) => setEditForm({ ...editForm, admissionType: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none"
                                        >
                                            <option value="Counseling">Counseling</option>
                                            <option value="Management">Management</option>
                                            <option value="Lateral Entry">Lateral Entry</option>
                                            <option value="Transfer">Transfer</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Contact</label>
                                        <input
                                            type="tel"
                                            value={editForm.parentContact}
                                            onChange={(e) => setEditForm({ ...editForm, parentContact: e.target.value })}
                                            placeholder="Mobile number"
                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-slate-50 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
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
