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
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-gray-100 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-purple-600" />
                        Admin Summary
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Manage administrative users with full portal access.</p>
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
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 flex items-center gap-4">
                    <div className="p-4 bg-teal-100/50 dark:bg-teal-500/10 rounded-xl text-teal-600 dark:text-teal-400">
                        <Shield className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Total HRs & Leaders</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-gray-100">
                            {loading && admins.length === 0 ? "..." : totalHRs}
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 flex items-center gap-4">
                    <div className="p-4 bg-amber-100/50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                        <Shield className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Executive Admins</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-gray-100">
                            {loading && admins.length === 0 ? "..." : totalAdmins}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-border dark:border-slate-800 overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">Administrator Records ({loading && admins.length === 0 ? '...' : admins.length})</h2>
                    <button onClick={() => refetch()} className="text-sm font-medium text-primary hover:underline">
                        Refresh List
                    </button>
                </div>
                
                {loading && admins.length === 0 ? (
                    <TableSkeleton rows={5} cols={6} />
                ) : admins.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                        <Shield className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-700 dark:text-gray-100">No admin records found</h3>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Specific Role (Designation)</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Access Level</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    {/* Using action layout identical to others */}
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                {admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-gray-100">{admin.name || 'Admin'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-800 dark:text-gray-200 font-medium">{admin.designation || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{admin.email}</td>
                                        <td className="px-6 py-4">
                                            {admin.tagAccess?.includes('Admin') ? (
                                                <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 shadow-sm border border-amber-200 dark:border-amber-500/20 flex items-center gap-1 w-max">
                                                    <Shield className="w-3 h-3" /> Full Access
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 text-xs font-bold rounded-full bg-teal-100 dark:bg-teal-500/10 text-teal-800 dark:text-teal-400 shadow-sm border border-teal-200 dark:border-teal-500/20 flex items-center gap-1 w-max">
                                                    <Shield className="w-3 h-3" /> Management Access
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${admin.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                                                {admin.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleToggleAdminStatus(admin)}
                                                className={`p-2 rounded-lg transition-colors ${admin.status === 'Active' ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                                                title={admin.status === 'Active' ? 'Deactivate admin' : 'Activate admin'}
                                            >
                                                {admin.status === 'Active' ? <UserX className="w-4 h-4" /> : <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-purple-600" /> Add Admin User
                            </h2>
                            <button onClick={() => setIsAdminModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500 dark:text-slate-400">
                                ✖
                            </button>
                        </div>
                        <div className="p-6">
                            <form id="admin-form" onSubmit={handleAdminSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={adminForm.name}
                                        onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                                        required
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                        placeholder="Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={adminForm.email}
                                        onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                                        required
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                        placeholder="admin@univ.edu"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Access Level (Role)</label>
                                    <select
                                        value={adminForm.role}
                                        onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
                                    >
                                        <option value="Admin">Full Access (Admin)</option>
                                        <option value="HR">Management Access (HR)</option>
                                    </select>
                                </div>
                                {adminForm.role === 'Admin' && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Specific Role (e.g. Dean, Principal)</label>
                                        <input
                                            type="text"
                                            value={adminForm.designation}
                                            onChange={(e) => setAdminForm({ ...adminForm, designation: e.target.value })}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none transition-all"
                                            placeholder="Registrar"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                                    <input
                                        type="text"
                                        value={adminForm.password}
                                        onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3 shrink-0">
                            <button type="button" onClick={() => setIsAdminModalOpen(false)} className="px-5 py-2.5 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 font-medium rounded-lg transition-colors">
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
