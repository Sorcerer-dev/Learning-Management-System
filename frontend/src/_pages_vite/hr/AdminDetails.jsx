import React, { useState } from 'react';
import { Shield, Loader2, UserX } from 'lucide-react';
import TableSkeleton from '../../components/shared/TableSkeleton';
import { useAuth } from '../../context/ThemeContext';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL;

const AdminDetails = () => {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [adminForm, setAdminForm] = useState({ name: '', email: '', password: 'Welcome@123', role: 'Admin', designation: '' });
    const [adminSubmitting, setAdminSubmitting] = useState(false);

    const { data: admins = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['admins'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/api/hr/admins`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch admin users');
            return res.json();
        },
        enabled: !!token,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });

    const handleToggleAdminStatus = async (admin) => {
        const actionStr = admin.status === 'Active' ? 'deactivate' : 'activate';
        if (!window.confirm(`Are you sure you want to ${actionStr} admin: ${admin.name}?`)) return;

        try {
            const res = await fetch(`${API_URL}/api/hr/staff/${admin.id}/status`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success(`Admin ${actionStr}d successfully`);
                queryClient.invalidateQueries({ queryKey: ['admins'] });
                queryClient.invalidateQueries({ queryKey: ['hrStats'] });
            } else {
                toast.error(`Failed to ${actionStr} admin`);
            }
        } catch (err) {
            toast.error(`Network error while ${actionStr}ing admin`);
        }
    };

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        setAdminSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/hr/admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(adminForm)
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Admin/HR user created successfully!');
                setIsAdminModalOpen(false);
                setAdminForm({ name: '', email: '', password: 'Welcome@123', role: 'Admin', designation: '' });
                queryClient.invalidateQueries({ queryKey: ['admins'] });
                queryClient.invalidateQueries({ queryKey: ['hrStats'] });
            } else {
                toast.error(data.error || 'Failed to create user');
            }
        } catch (err) {
            toast.error('Network error. Failed to add user.');
        } finally {
            setAdminSubmitting(false);
        }
    };

    const totalAdmins = admins.filter(a => a.tagAccess?.includes('Admin')).length;
    const totalHRs = admins.filter(a => a.tagAccess?.includes('HR') || a.tagAccess?.includes('Dean') || a.tagAccess?.includes('Principal')).length;

    return (
        <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-purple-600" />
                        Admin Summary
                    </h1>
                    <p className="text-slate-500 mt-2">Manage administrative users with full portal access.</p>
                </div>
                <button
                    onClick={() => setIsAdminModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2"
                >
                    <UserX className="w-5 h-5 hidden" /> {/* Just to keep the import used, we'll swap below */}
                    <Shield className="w-5 h-5" /> Quick Add Admin
                </button>
            </div>

            {/* Leadership Breakdown Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="p-4 bg-teal-100/50 rounded-xl text-teal-600">
                        <Shield className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-slate-500 font-semibold text-sm">Total HRs & Leaders</p>
                        <p className="text-2xl font-bold text-slate-800">
                            {loading && admins.length === 0 ? "..." : totalHRs}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="p-4 bg-amber-100/50 rounded-xl text-amber-600">
                        <Shield className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-slate-500 font-semibold text-sm">Executive Admins</p>
                        <p className="text-2xl font-bold text-slate-800">
                            {loading && admins.length === 0 ? "..." : totalAdmins}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">Administrator Records ({loading && admins.length === 0 ? '...' : admins.length})</h2>
                    <button onClick={() => refetch()} className="text-sm font-medium text-primary hover:underline">
                        Refresh List
                    </button>
                </div>
                
                {loading && admins.length === 0 ? (
                    <TableSkeleton rows={5} cols={6} />
                ) : admins.length === 0 ? (
                    <div className="p-12 text-center">
                        <Shield className="w-14 h-14 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">No admin records found</h3>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Specific Role (Designation)</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Access Level</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    {/* Using action layout identical to others */}
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{admin.name || 'Admin'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-800 font-medium">{admin.designation || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{admin.email}</td>
                                        <td className="px-6 py-4">
                                            {admin.tagAccess?.includes('Admin') ? (
                                                <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 shadow-sm border border-amber-200 flex items-center gap-1 w-max">
                                                    <Shield className="w-3 h-3" /> Full Access
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 text-xs font-bold rounded-full bg-teal-100 text-teal-800 shadow-sm border border-teal-200 flex items-center gap-1 w-max">
                                                    <Shield className="w-3 h-3" /> Management Access
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${admin.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {admin.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleToggleAdminStatus(admin)}
                                                className={`p-2 rounded-lg transition-colors ${admin.status === 'Active' ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                                title={admin.status === 'Active' ? 'Deactivate admin' : 'Activate admin'}
                                            >
                                                {admin.status === 'Active' ? <UserX className="w-4 h-4" /> : <Shield className="w-4 h-4 text-emerald-600" />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Admin Add Modal */}
            {isAdminModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-purple-600" /> Add Admin User
                            </h2>
                            <button onClick={() => setIsAdminModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                                ✖
                            </button>
                        </div>
                        <div className="p-6">
                            <form id="admin-form" onSubmit={handleAdminSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={adminForm.name}
                                        onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                                        required
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        placeholder="Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={adminForm.email}
                                        onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                                        required
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        placeholder="admin@univ.edu"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Access Level (Role)</label>
                                    <select
                                        value={adminForm.role}
                                        onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none text-sm"
                                    >
                                        <option value="Admin">Full Access (Admin)</option>
                                        <option value="HR">Management Access (HR)</option>
                                    </select>
                                </div>
                                {adminForm.role === 'Admin' && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Specific Role (e.g. Dean, Principal)</label>
                                        <input
                                            type="text"
                                            value={adminForm.designation}
                                            onChange={(e) => setAdminForm({ ...adminForm, designation: e.target.value })}
                                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="Registrar"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                                    <input
                                        type="text"
                                        value={adminForm.password}
                                        onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                                        required
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary bg-slate-50 outline-none"
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                            <button type="button" onClick={() => setIsAdminModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 font-medium rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button type="submit" form="admin-form" disabled={adminSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2">
                                {adminSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Admin'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDetails;
