import React, { useState, useEffect } from 'react';
import { Pencil, UserX, Loader2, Inbox, Plus, X, Filter, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/ThemeContext';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TableSkeleton from '../../components/shared/TableSkeleton';

const API_URL = import.meta.env.VITE_API_URL;

const DESIGNATIONS = ['HOD', 'Advisor', 'Mentor'];
const DESIGNATION_LABELS = { HOD: 'Head of Department', Advisor: 'Advisor', Mentor: 'Mentor', HR: 'HR Officer' };
const CATEGORIES = ['Staff'];

const StaffManagement = () => {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', deptId: 'CSE', category: 'Staff', functionalTags: [], adminRoleName: '', salary: '', phone: '' });
    const [editSubmitting, setEditSubmitting] = useState(false);

    // Filter state
    const [filterDept, setFilterDept] = useState('');
    const [filterDesignation, setFilterDesignation] = useState('');

    // Add form state
    const [formData, setFormData] = useState({
        name: '', email: '', staffId: '', deptId: '', category: 'Staff', functionalTags: [], adminRoleName: '', salary: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Fetch Departments
    const { data: departments = [], isLoading: deptsLoading } = useQuery({
        queryKey: ['departments'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/api/hr/departments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch departments');
            return res.json();
        },
        enabled: !!token,
        onSuccess: (data) => {
            if (data.length > 0 && !formData.deptId) {
                setFormData(prev => ({ ...prev, deptId: data[0].id }));
            }
        }
    });

    // Effect to set initial deptId when depts are loaded
    useEffect(() => {
        if (departments.length > 0 && !formData.deptId) {
            setFormData(prev => ({ ...prev, deptId: departments[0].id }));
        }
    }, [departments]);

    // Fetch Staff
    const { data: staffMembers = [], isLoading: staffLoading } = useQuery({
        queryKey: ['staff', filterDept, filterDesignation],
        queryFn: async () => {
            const query = new URLSearchParams();
            if (filterDept) query.append('dept', filterDept);
            if (filterDesignation) query.append('designation', filterDesignation);
            const res = await fetch(`${API_URL}/api/hr/staff?${query.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch staff');
            return res.json();
        },
        enabled: !!token
    });

    // Fetch Analytics
    const { data: analytics = null } = useQuery({
        queryKey: ['hrAnalytics'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/api/hr/analytics`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch analytics');
            return res.json();
        },
        enabled: !!token
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/hr/staff`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Staff member added successfully');
                setIsAddModalOpen(false);
                setFormData({ name: '', email: '', staffId: '', deptId: 'CSE', category: 'Staff', functionalTags: [], adminRoleName: '', salary: '' });
                queryClient.invalidateQueries({ queryKey: ['staff'] });
                queryClient.invalidateQueries({ queryKey: ['hrStats'] });
                queryClient.invalidateQueries({ queryKey: ['hrAnalytics'] });
            } else {
                toast.error(data.error || 'Failed to add staff');
            }
        } catch (err) {
            toast.error('Network error. Failed to add staff.');
        } finally {
            setSubmitting(false);
        }
    };

    // Open Edit modal pre-filled with staff data
    const openEditModal = (staff) => {
        setEditingStaff(staff);
        setEditForm({
            name: staff.name || '',
            email: staff.email || '',
            deptId: staff.department || 'CSE',
            category: staff.category || 'Staff',
            functionalTags: Array.isArray(staff.functionalTags) ? staff.functionalTags : [],
            adminRoleName: staff.category === 'Admin' ? staff.designation : '',
            salary: staff.salary ?? '',
            phone: staff.phone || ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditStaff = async (e) => {
        e.preventDefault();
        if (!editingStaff) return;
        setEditSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/hr/staff/${editingStaff.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Staff member updated successfully');
                setIsEditModalOpen(false);
                setEditingStaff(null);
                queryClient.invalidateQueries({ queryKey: ['staff'] });
                queryClient.invalidateQueries({ queryKey: ['hrStats'] });
                queryClient.invalidateQueries({ queryKey: ['hrAnalytics'] });
            } else {
                toast.error(data.error || 'Failed to update staff');
            }
        } catch (err) {
            console.error('Edit Staff Error:', err);
            toast.error('Network error. Failed to update staff.');
        } finally {
            setEditSubmitting(false);
        }
    };

    // Optimistic Toggle Status
    const statusMutation = useMutation({
        mutationFn: async ({ id }) => {
            const res = await fetch(`${API_URL}/api/hr/staff/${id}/status`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Status update failed');
            return res.json();
        },
        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({ queryKey: ['staff'] });
            const previousStaff = queryClient.getQueryData(['staff', filterDept, filterDesignation]);

            queryClient.setQueryData(['staff', filterDept, filterDesignation], (old) => 
                old?.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s)
            );

            return { previousStaff };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['staff', filterDept, filterDesignation], context.previousStaff);
            toast.error('Failed to update status');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['staff'] });
        }
    });

    const handleToggleStatus = (staff) => {
        const actionStr = staff.status === 'Active' ? 'deactivate' : 'activate';
        if (!window.confirm(`Are you sure you want to ${actionStr} ${staff.name}?`)) return;

        toast.promise(statusMutation.mutateAsync({ id: staff.id }), {
            loading: `${actionStr.charAt(0).toUpperCase() + actionStr.slice(1)}ing staff...`,
            success: `Staff member ${actionStr}d successfully`,
            error: `Failed to ${actionStr} staff`
        });
    };

    const hasSalaryColumn = staffMembers.some(s => s.salary !== undefined);
    const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];

    return (
        <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Staff Management</h1>
                    <p className="text-slate-500 mt-1">Manage staff details and view department-wise distribution.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add New Staff
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Filters */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col gap-6">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                        <Filter className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-gray-800">Advanced Filters</h3>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Department</label>
                        <select
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none bg-slate-50"
                        >
                            <option value="">All Departments</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Designation</label>
                        <select
                            value={filterDesignation}
                            onChange={(e) => setFilterDesignation(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none bg-slate-50"
                        >
                            <option value="">All Designations</option>
                            {DESIGNATIONS.map(d => <option key={d} value={d}>{DESIGNATION_LABELS[d]}</option>)}
                        </select>
                    </div>
                </div>

                {/* Chart Card */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col min-h-[300px]">
                    <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Dept-wise Staff Strength</h3>
                    <div className="flex-1 w-full mt-2 h-[250px]">
                        {analytics?.staffByDeptRole?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.staffByDeptRole} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                    <RechartsTooltip
                                        cursor={{ fill: '#F1F5F9' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, marginTop: 10 }} />
                                    {DESIGNATIONS.map((desig, idx) => (
                                        <Bar key={desig} dataKey={desig} stackId="a" fill={colors[idx]} radius={idx === DESIGNATIONS.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-slate-400">
                                No staff trend data available
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-3">
                {staffLoading && staffMembers.length === 0 ? (
                    <TableSkeleton rows={8} cols={6} />
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-800">Staff Records ({staffMembers.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Designation</th>
                                        {hasSalaryColumn && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Salary</th>}
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {staffMembers.length === 0 ? (
                                        <tr><td colSpan="9" className="px-6 py-12 text-center">
                                            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-bold text-slate-700">No staff records match</h3>
                                            <p className="text-sm text-slate-400 mt-2">Try adjusting your filters.</p>
                                        </td></tr>
                                    ) : (
                                        staffMembers.map((staff) => (
                                            <tr key={staff.id} onClick={(e) => {
                                                if(e.target.closest('button')) return;
                                                // navigate(`/hr/staff/${staff.id}`); // Placeholder for detail view
                                            }} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">{staff.id}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-800 whitespace-nowrap">{staff.name}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{staff.department}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell whitespace-nowrap">{staff.designation || '-'}</td>
                                                {hasSalaryColumn && (
                                                    <td className="px-6 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                                                        {staff.salary ? `$${staff.salary.toLocaleString()}` : '-'}
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${staff.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                        {staff.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleToggleStatus(staff)}
                                                        className={`p-2 rounded-lg transition-colors ${staff.status === 'Active' ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                                        title={staff.status === 'Active' ? 'Deactivate staff' : 'Activate staff'}
                                                    >
                                                        {staff.status === 'Active' ? <UserX className="w-4 h-4" /> : <CheckCircle className="w-4 h-4 text-emerald-600" />}
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(staff)}
                                                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                        title="Edit staff"
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

            {/* Add Staff Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50 shrink-0">
                            <h2 className="text-xl font-bold text-gray-800">Add New Staff</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="add-staff-form" onSubmit={handleAddStaff} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Jane Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="jane.doe@univ.edu" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID</label>
                                        <input type="text" name="staffId" value={formData.staffId} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="EMP-001" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                        <select name="deptId" value={formData.deptId} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                                            {departments.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Functional Tags (Staff Role)</label>
                                        <div className="flex flex-wrap gap-4 bg-white p-3 border border-gray-300 rounded-lg">
                                            {DESIGNATIONS.map(d => (
                                                <label key={d} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                                                    <input 
                                                        type="checkbox" 
                                                        value={d} 
                                                        checked={formData.functionalTags.includes(d)}
                                                        onChange={(e) => {
                                                            const tags = e.target.checked 
                                                                ? [...formData.functionalTags, d] 
                                                                : formData.functionalTags.filter(t => t !== d);
                                                            setFormData({...formData, functionalTags: tags});
                                                        }}
                                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                    />
                                                    {DESIGNATION_LABELS[d]}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Salary (Optional)</label>
                                        <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="e.g. 50000" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Password will be defaulted to <strong>Welcome@123</strong></p>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 font-medium rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button type="submit" form="add-staff-form" disabled={submitting} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2">
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Staff'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Staff Modal */}
            {isEditModalOpen && editingStaff && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Edit Staff Member</h2>
                                <p className="text-sm text-slate-500">ID: {editingStaff.id}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="edit-staff-form" onSubmit={handleEditStaff} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                        <select
                                            value={editForm.deptId}
                                            onChange={(e) => setEditForm({ ...editForm, deptId: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        >
                                            {departments.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Functional Tags (Staff Role)</label>
                                        <div className="flex flex-wrap gap-4 bg-white p-3 border border-gray-300 rounded-lg">
                                            {DESIGNATIONS.map(d => (
                                                <label key={d} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                                                    <input 
                                                        type="checkbox" 
                                                        value={d} 
                                                        checked={editForm.functionalTags.includes(d)}
                                                        onChange={(e) => {
                                                            const tags = e.target.checked 
                                                                ? [...editForm.functionalTags, d] 
                                                                : editForm.functionalTags.filter(t => t !== d);
                                                            setEditForm({...editForm, functionalTags: tags});
                                                        }}
                                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                    />
                                                    {DESIGNATION_LABELS[d]}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Salary (Optional)</label>
                                        <input
                                            type="number"
                                            value={editForm.salary}
                                            onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                            placeholder="e.g. 50000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                                        <input
                                            type="tel"
                                            value={editForm.phone}
                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 font-medium rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button type="submit" form="edit-staff-form" disabled={editSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2">
                                {editSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
