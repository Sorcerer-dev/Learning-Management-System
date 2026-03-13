import React, { useState, useEffect } from 'react';
import { Pencil, UserX, Loader2, Inbox, Plus, X, Filter } from 'lucide-react';
import { useAuth } from '../../context/ThemeContext';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL;

const StaffManagement = () => {
    const { token, role } = useAuth();
    const [staffMembers, setStaffMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Filter state
    const [filterDept, setFilterDept] = useState('');
    const [filterDesignation, setFilterDesignation] = useState('');
    const [analytics, setAnalytics] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        staffId: '',
        deptId: 'CSE',
        designation: 'Advisor',
        salary: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const query = new URLSearchParams();
            if (filterDept) query.append('dept', filterDept);
            if (filterDesignation) query.append('designation', filterDesignation);

            const res = await fetch(`${API_URL}/api/hr/staff?${query.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setStaffMembers(data);
            }
        } catch (err) {
            toast.error('Failed to fetch staff');
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await fetch(`${API_URL}/api/hr/analytics`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setAnalytics(await res.json());
            }
        } catch (err) {
            console.error('Failed to fetch analytics', err);
        }
    };

    useEffect(() => {
        if (token) {
            fetchStaff();
        }
    }, [token, filterDept, filterDesignation]);

    useEffect(() => {
        if (token) {
            fetchAnalytics();
        }
    }, [token]);

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
                setFormData({
                    name: '', email: '', staffId: '', deptId: 'CSE', designation: 'Advisor', salary: ''
                });
                fetchStaff();
                fetchAnalytics(); // refresh chart
            } else {
                toast.error(data.error || 'Failed to add staff');
            }
        } catch (err) {
            toast.error('Network error. Failed to add staff.');
        } finally {
            setSubmitting(false);
        }
    };

    const hasSalaryColumn = staffMembers.some(s => s.salary !== undefined);

    const designations = ['HOD', 'Advisor', 'Mentor', 'HR'];
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
                            <option value="CSE">CSE</option>
                            <option value="ECE">ECE</option>
                            <option value="EEE">EEE</option>
                            <option value="MECH">MECH</option>
                            <option value="IT">IT</option>
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
                            <option value="HOD">HOD</option>
                            <option value="Advisor">Advisor</option>
                            <option value="Mentor">Mentor</option>
                            <option value="HR">HR</option>
                        </select>
                    </div>
                </div>

                {/* Chart Card */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col">
                    <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Dept-wise Staff Strength</h3>
                    <div className="flex-1 min-h-[250px] w-full mt-2">
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
                                    {designations.map((desig, idx) => (
                                        <Bar key={desig} dataKey={desig} stackId="a" fill={colors[idx]} radius={idx === designations.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
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

            <div className="bg-white rounded-xl shadow-sm border border-border overflow-x-auto">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">Staff Records ({staffMembers.length})</h2>
                    <button onClick={fetchStaff} className="text-sm font-medium text-primary hover:underline">
                        Refresh List
                    </button>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : staffMembers.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                        <Inbox className="w-14 h-14 text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">No staff records match</h3>
                        <p className="text-sm text-slate-400 mt-2 max-w-md">Try adjusting your filters.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Designation</th>
                                {hasSalaryColumn && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Salary</th>}
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {staffMembers.map((staff) => (
                                <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">{staff.id}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-800 whitespace-nowrap">{staff.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{staff.department}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell whitespace-nowrap">{staff.designation}</td>
                                    {hasSalaryColumn && (
                                        <td className="px-6 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                                            {staff.salary ? `$${staff.salary.toLocaleString()}` : '-'}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${staff.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {staff.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Deactivate">
                                                <UserX className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Data</label>
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
                                            <option value="CSE">CSE</option>
                                            <option value="ECE">ECE</option>
                                            <option value="EEE">EEE</option>
                                            <option value="MECH">MECH</option>
                                            <option value="IT">IT</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation / Role</label>
                                        <select name="designation" value={formData.designation} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                                            <option value="HOD">Head of Department</option>
                                            <option value="Advisor">Advisor</option>
                                            <option value="Mentor">Mentor</option>
                                            <option value="HR">HR Officer</option>
                                        </select>
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
        </div>
    );
};

export default StaffManagement;
