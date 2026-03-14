import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/ThemeContext';
import { Users, Filter, LayoutPanelLeft, Loader2, Trash2, Pencil, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;
const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'MECH', 'IT'];

const StudentManagement = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    // List & Filter State
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [filterBatch, setFilterBatch] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [batches, setBatches] = useState([]);

    // Field Selector State
    const [showEmail, setShowEmail] = useState(true);
    const [showAdmission, setShowAdmission] = useState(false);
    const [showParentContact, setShowParentContact] = useState(false);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', department: 'CSE', batch: '', admissionType: 'Counseling', parentContact: '' });
    const [editSubmitting, setEditSubmitting] = useState(false);

    const fetchStudents = async () => {
        try {
            setStudentsLoading(true);
            const query = new URLSearchParams();
            if (filterBatch) query.append('batch', filterBatch);
            if (filterDept) query.append('dept', filterDept);

            const res = await fetch(`${API_URL}/api/hr/students?${query.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setStudents(data);
                // Extract unique batches if not filtering by batch (to populate dropdown)
                if (!filterBatch) {
                    const uniqueBatches = [...new Set(data.map(s => s.batch))].filter(Boolean);
                    setBatches(uniqueBatches.sort());
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setStudentsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchStudents();
        }
    }, [token, filterBatch, filterDept]);

    const handleToggleStatus = async (id, name, currentStatus) => {
        const actionStr = currentStatus === 'Active' ? 'deactivate' : 'activate';
        if (!window.confirm(`Are you sure you want to ${actionStr} ${name}?`)) return;

        try {
            const res = await fetch(`${API_URL}/api/hr/students/${id}/status`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success(`Student ${actionStr}d successfully`);
                fetchStudents();
            } else {
                toast.error(`Failed to ${actionStr} student`);
            }
        } catch (err) {
            toast.error(`Error trying to ${actionStr} student`);
        }
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
                fetchStudents();
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
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col gap-6">
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
                            <option value="CSE">CSE</option>
                            <option value="ECE">ECE</option>
                            <option value="EEE">EEE</option>
                            <option value="MECH">MECH</option>
                            <option value="IT">IT</option>
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
                            {batches.map(b => <option key={b} value={b}>{b}</option>)}
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
                <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                        <h2 className="text-xl font-bold text-slate-800">Student Directory ({students.length})</h2>
                        <button onClick={fetchStudents} className="text-sm font-medium text-primary hover:underline">
                            Refresh List
                        </button>
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
                                {studentsLoading ? (
                                    <tr><td colSpan="9" className="px-6 py-8 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</td></tr>
                                ) : students.length === 0 ? (
                                    <tr><td colSpan="9" className="px-6 py-8 text-center text-slate-500">No students match your filters.</td></tr>
                                ) : (
                                    students.map((student) => (
                                        <tr key={student.id} onClick={(e) => {
                                            // Prevent click if clicking a button
                                            if(e.target.closest('button')) return;
                                            navigate(`/hr/student/${student.id}`);
                                        }} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-slate-800">{student.name}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{student.id}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-slate-700">{student.department}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{student.batch}</div>
                                            </td>
                                            {showEmail && <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[150px]">{student.email}</td>}
                                            {showAdmission && <td className="px-6 py-4 text-sm text-slate-600">{student.admissionType || '-'}</td>}
                                            {showParentContact && <td className="px-6 py-4 text-sm text-slate-600">{student.parentContact || <span className="text-slate-400 italic text-xs">Not provided</span>}</td>}
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleToggleStatus(student.id, student.name, student.status)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${student.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                                    title={`Toggle status (currently ${student.status})`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${student.status === 'Active' ? 'translate-x-6' : 'translate-x-1'}`} />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(student)}
                                                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                        title="Edit student"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Student Modal */}
            {isEditModalOpen && editingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Edit Student</h2>
                                <p className="text-sm text-slate-500">Reg No: {editingStudent.id}</p>
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
                                        <input
                                            type="text"
                                            value={editForm.batch}
                                            onChange={(e) => setEditForm({ ...editForm, batch: e.target.value })}
                                            required
                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none"
                                        />
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
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Contact</label>
                                        <input
                                            type="tel"
                                            value={editForm.parentContact}
                                            onChange={(e) => setEditForm({ ...editForm, parentContact: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="Contact number"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 font-medium rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button type="submit" form="edit-student-form" disabled={editSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2">
                                {editSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentManagement;
