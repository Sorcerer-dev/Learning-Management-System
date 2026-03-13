import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/ThemeContext';
import { UploadCloud, Download, AlertCircle, Loader2, FileSpreadsheet, Trash2, UserPlus, Users, Filter, LayoutPanelLeft } from 'lucide-react';
import * as xlsx from 'xlsx';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL;

const StudentBulkUpload = () => {
    const { token } = useAuth();

    // UI State
    const [activeTab, setActiveTab] = useState('bulk'); // 'bulk' | 'manual' | 'explorer'

    // Bulk Upload State
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

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

    // Analytics State for Chart
    const [analytics, setAnalytics] = useState(null);

    // Manual Add State
    const [manualForm, setManualForm] = useState({
        name: '', email: '', regNo: '', batchId: '', deptId: 'CSE', admissionType: 'Counseling'
    });
    const [manualSubmitting, setManualSubmitting] = useState(false);

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
        fetchStudents();
    }, [filterBatch, filterDept]);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const handleDeleteStudent = async (id) => {
        if (!window.confirm("Are you sure you want to deactivate this student?")) return;

        try {
            const res = await fetch(`${API_URL}/api/hr/students/${id}/status`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Student deactivated successfully');
                fetchStudents();
            } else {
                toast.error('Failed to deactivate student');
            }
        } catch (err) {
            toast.error('Error deactivating student');
        }
    };

    const handleFileChange = (e) => {
        setError('');
        setResult(null);
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            if (!selectedFile.name.endsWith('.xlsx')) {
                setError('Please upload a valid .xlsx file.');
                setFile(null);
                return;
            }
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File size exceeds the 5MB limit.');
                setFile(null);
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation();
        const droppedFile = e.dataTransfer.files[0];
        if (fileInputRef.current) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(droppedFile);
            fileInputRef.current.files = dataTransfer.files;
            handleFileChange({ target: { files: dataTransfer.files } });
        }
    };

    const downloadTemplate = () => {
        const ws = xlsx.utils.json_to_sheet([
            { Name: 'John Doe', Email: 'john.doe@univ.com', RegNo: 'REG-2024-002', Batch: 'CSE-2024', Department: 'CSE', AdmissionType: 'Counseling' },
            { Name: 'Jane Smith', Email: 'jane.smith@univ.com', RegNo: 'REG-2024-003', Batch: 'ECE-2024', Department: 'ECE', AdmissionType: 'Management' }
        ]);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Template");
        xlsx.writeFile(wb, "Student_Bulk_Template.xlsx");
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError('');
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_URL}/api/hr/bulk-upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Failed to upload file');

            toast.success('Upload complete!', { description: data.message });

            setResult(data);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchStudents();
            fetchAnalytics(); // refresh chart
        } catch (err) {
            setError(err.message);
            toast.error('Upload failed', { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleManualInputChange = (e) => {
        setManualForm({ ...manualForm, [e.target.name]: e.target.value });
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setManualSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/hr/students/manual`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(manualForm)
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Student added successfully!');
                setManualForm({ name: '', email: '', regNo: '', batchId: '', deptId: 'CSE', admissionType: 'Counseling' });
                fetchStudents();
                fetchAnalytics(); // refresh chart
            } else {
                toast.error(data.error || 'Failed to add student');
            }
        } catch (err) {
            toast.error('Network error. Failed to add student.');
        } finally {
            setManualSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-300">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary mb-2">Student Onboarding & Management</h1>
                <p className="text-slate-500">Add new students via bulk upload or manage existing students in the Data Explorer.</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit mb-8 shadow-inner border border-slate-200">
                <button
                    onClick={() => setActiveTab('bulk')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'bulk' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    <UploadCloud className="w-4 h-4" /> Bulk Upload
                </button>
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'manual' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    <UserPlus className="w-4 h-4" /> Manual Add
                </button>
                <button
                    onClick={() => setActiveTab('explorer')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'explorer' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    <Users className="w-4 h-4" /> Data Explorer
                </button>
            </div>

            {activeTab === 'bulk' && (
                <div className="animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl border border-border shadow-sm mb-8 gap-4">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">Use the standard template</h3>
                            <p className="text-sm text-slate-500">Download the required column format before uploading.</p>
                        </div>
                        <button
                            onClick={downloadTemplate}
                            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-lg transition-colors w-full sm:w-auto justify-center"
                        >
                            <Download className="w-4 h-4" /> Download Template
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    {result && result.errors && result.errors.length > 0 && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-5 overflow-hidden shadow-sm animate-in slide-in-from-top-2">
                            <h3 className="font-bold text-lg text-red-800 mb-2">Upload Details</h3>
                            <p className="text-red-700 font-medium mb-4">{result.message}</p>
                            <div className="bg-white/60 rounded-lg p-4 text-sm border border-red-100 max-h-40 overflow-y-auto">
                                <p className="font-bold text-red-600 mb-2 border-b border-red-100 pb-2">Issues Log ({result.errors.length}):</p>
                                <ul className="list-disc pl-5 text-red-500 space-y-1">
                                    {result.errors.map((errObj, idx) => (
                                        <li key={idx}><strong>RegNo:</strong> {errObj.regNo} — {errObj.error}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative max-w-5xl mx-auto
                            ${file ? 'bg-primary/5 border-primary shadow-inner shadow-primary/10' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'}
                        `}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx" className="hidden" />

                        {file ? (
                            <div className="animate-in zoom-in-95 duration-200 flex flex-col items-center">
                                <div className="bg-white p-4 rounded-full shadow-md mb-4 border border-primary/20">
                                    <FileSpreadsheet className="w-12 h-12 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-1">{file.name}</h3>
                                <p className="text-sm font-semibold text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <p className="mt-6 text-sm text-primary font-medium hover:underline">Click to change file</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white p-4 rounded-full shadow-sm mb-4 border border-slate-100 text-slate-400">
                                    <UploadCloud className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">Drag & Drop your file here</h3>
                                <p className="text-slate-500 mb-6">or click to browse from your computer</p>
                                <p className="text-xs font-semibold text-slate-400">Supported formats: .XLSX (Max 5MB)</p>
                            </>
                        )}
                    </div>

                    <div className="mt-8 flex justify-end max-w-5xl mx-auto">
                        <button
                            onClick={handleUpload}
                            disabled={!file || loading}
                            className={`
                                font-bold py-3.5 px-10 rounded-xl shadow-md transition-all sm:w-auto w-full flex items-center justify-center gap-2
                                ${(!file || loading) ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-primary hover:bg-primary/90 text-primary-foreground hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0'}
                            `}
                        >
                            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <><UploadCloud className="w-5 h-5" /> Upload & Import</>}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'manual' && (
                <div className="bg-white rounded-xl shadow-sm border border-border p-6 sm:p-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Manual Student Entry</h2>
                    <form onSubmit={handleManualSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                <input type="text" name="name" value={manualForm.name} onChange={handleManualInputChange} required className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                <input type="email" name="email" value={manualForm.email} onChange={handleManualInputChange} required className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="john.doe@univ.edu" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Registration No</label>
                                <input type="text" name="regNo" value={manualForm.regNo} onChange={handleManualInputChange} required className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="REG-2024-001" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Batch ID</label>
                                <input type="text" name="batchId" value={manualForm.batchId} onChange={handleManualInputChange} required className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="CSE-2024" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Department</label>
                                <select name="deptId" value={manualForm.deptId} onChange={handleManualInputChange} className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                                    <option value="CSE">CSE</option>
                                    <option value="ECE">ECE</option>
                                    <option value="EEE">EEE</option>
                                    <option value="MECH">MECH</option>
                                    <option value="IT">IT</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Admission Type</label>
                                <select name="admissionType" value={manualForm.admissionType} onChange={handleManualInputChange} className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                                    <option value="Counseling">Counseling</option>
                                    <option value="Management">Management</option>
                                </select>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-sm text-slate-500">Default password will be set to: <strong className="text-slate-700">Welcome@123</strong></p>
                            <button type="submit" disabled={manualSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2">
                                {manualSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Student Record'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'explorer' && (
                <div className="animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Filters Card */}
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

                        {/* Chart Card */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col">
                            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Batch Enrollment Trends</h3>
                            <div className="flex-1 min-h-[250px] w-full mt-2">
                                {analytics?.batchTrends?.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.batchTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                            <RechartsTooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Bar dataKey="students" radius={[4, 4, 0, 0]}>
                                                {analytics.batchTrends.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill="#0D9488" />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-sm text-slate-400">
                                        No trend data available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
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
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reg No</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Batch</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dept</th>
                                        {showEmail && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>}
                                        {showAdmission && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Admission</th>}
                                        {showParentContact && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Parent Contact</th>}
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
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
                                            <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-700">{student.id}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-800">{student.name}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{student.batch}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{student.department}</td>
                                                {showEmail && <td className="px-6 py-4 text-sm text-slate-600">{student.email}</td>}
                                                {showAdmission && <td className="px-6 py-4 text-sm text-slate-600">{student.admissionType || '-'}</td>}
                                                {showParentContact && <td className="px-6 py-4 text-sm text-slate-600">-</td>}
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${student.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                        {student.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleDeleteStudent(student.id)} disabled={student.status === 'Inactive'} className={`p-2 rounded-lg transition-colors flex items-center justify-end ml-auto gap-1 ${student.status === 'Inactive' ? 'text-slate-400 cursor-not-allowed hidden' : 'text-red-600 hover:bg-red-50'}`}>
                                                        <Trash2 className="w-4 h-4" /> <span className="text-xs font-medium">Delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentBulkUpload;
