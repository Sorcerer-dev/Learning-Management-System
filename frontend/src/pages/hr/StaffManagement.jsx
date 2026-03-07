import React from 'react';
import { Pencil, UserX } from 'lucide-react';

const StaffManagement = () => {
    const staffMembers = [
        { id: 'STF001', name: 'John Doe', department: 'Computer Science', role: 'Professor', status: 'Active' },
        { id: 'STF002', name: 'Jane Smith', department: 'Mechanical', role: 'Associate Professor', status: 'Active' },
        { id: 'STF003', name: 'Robert Johnson', department: 'Electrical', role: 'Assistant Professor', status: 'Active' },
        { id: 'STF004', name: 'Emily Davis', department: 'Civil Engineering', role: 'Lecturer', status: 'Active' },
        { id: 'STF005', name: 'Michael Wilson', department: 'Electronics', role: 'Professor', status: 'Inactive' },
    ];

    return (
        <div className="p-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-primary">Staff Management</h1>
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg font-bold shadow-sm transition-colors">
                    Add New Staff
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-border overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">ID</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Department</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 hidden md:table-cell">Role</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Status</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {staffMembers.map((staff) => (
                            <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">{staff.id}</td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-800 whitespace-nowrap">{staff.name}</td>
                                <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{staff.department}</td>
                                <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell whitespace-nowrap">{staff.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${staff.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                        }`}>
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
            </div>
        </div>
    );
};

export default StaffManagement;
