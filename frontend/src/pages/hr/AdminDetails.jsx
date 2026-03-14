import React, { useState, useEffect } from 'react';
import { Shield, Loader2, UserX } from 'lucide-react';
import { useAuth } from '../../context/ThemeContext';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

const AdminDetails = () => {
    const { token } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            // Fetch users with tagAccess = 'Admin'
            const res = await fetch(`${API_URL}/api/hr/staff?designation=Admin`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAdmins(data);
            }
        } catch (err) {
            toast.error('Failed to fetch admin users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchAdmins();
        }
    }, [token]);

    const handleDeactivateAdmin = async (admin) => {
        if (!window.confirm(`Are you sure you want to deactivate admin: ${admin.name}?`)) return;

        try {
            const res = await fetch(`${API_URL}/api/hr/staff/${admin.id}/status`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Admin deactivated successfully');
                fetchAdmins();
            } else {
                toast.error('Failed to deactivate admin');
            }
        } catch (err) {
            toast.error('Network error while deactivating admin');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-300">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <Shield className="w-8 h-8 text-purple-600" />
                    Admin Summary
                </h1>
                <p className="text-slate-500 mt-2">Manage administrative users with full portal access.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">Administrator Records ({admins.length})</h2>
                    <button onClick={fetchAdmins} className="text-sm font-medium text-primary hover:underline">
                        Refresh List
                    </button>
                </div>
                
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
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
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    {/* Using action layout identical to others */}
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{admin.name || 'Admin'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{admin.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${admin.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {admin.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {admin.status === 'Active' && (
                                                <button
                                                    onClick={() => handleDeactivateAdmin(admin)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Deactivate admin"
                                                >
                                                    <UserX className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDetails;
