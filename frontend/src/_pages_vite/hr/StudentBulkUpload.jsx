import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/ThemeContext';
import { UploadCloud, Download, AlertCircle, Loader2, FileSpreadsheet, Trash2, UserPlus, Users, Filter, LayoutPanelLeft } from 'lucide-react';
import * as xlsx from 'xlsx';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL;

const StudentBulkUpload = () => {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    // UI State
    const [activeTab, setActiveTab] = useState('bulk'); // 'bulk' | 'manual' | 'explorer'

    // Bulk Upload State
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);



    // Analytics State for Chart
    const [analytics, setAnalytics] = useState(null);

    // Manual Add State
    const [manualForm, setManualForm] = useState({
        name: '', email: '', regNo: '', batchId: '', deptId: 'CSE', admissionType: 'Counseling',
        parentName: '', parentContact: ''
    });
    const [manualSubmitting, setManualSubmitting] = useState(false);
    const [batches, setBatches] = useState([]);
    const [departments, setDepartments] = useState([]);

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

    const fetchBatches = async () => {
        try {
            const res = await fetch(`${API_URL}/api/hr/batches`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setBatches(await res.json());
            }
        } catch (err) {
            console.error('Failed to fetch batches', err);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await fetch(`${API_URL}/api/hr/departments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDepartments(data);
                if (data.length > 0 && !manualForm.deptId) {
                    setManualForm(prev => ({ ...prev, deptId: data[0].id }));
                }
            }
        } catch (err) {
            console.error('Failed to fetch departments', err);
        }
    };

    useEffect(() => {
        fetchAnalytics();
        fetchBatches();
        fetchDepartments();
    }, []);

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
            { Name: 'John Doe', Email: 'john.doe@univ.com', RegNo: 'REG-2024-002', Batch: 'CSE-2024', Department: 'CSE', AdmissionType: 'Counseling', ParentName: 'Robert Doe', ParentContact: '9876543210' },
            { Name: 'Jane Smith', Email: 'jane.smith@univ.com', RegNo: 'REG-2024-003', Batch: 'ECE-2024', Department: 'ECE', AdmissionType: 'Management', ParentName: 'Lisa Smith', ParentContact: '9123456789' }
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
            fetchAnalytics(); // refresh chart
            
            // Invalidate queries so dashboard and management pages get latest data
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['hrStats'] });
            queryClient.invalidateQueries({ queryKey: ['hrAnalytics'] });
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
                setManualForm({ name: '', email: '', regNo: '', batchId: '', deptId: departments.length > 0 ? departments[0].id : '', admissionType: 'Counseling', parentName: '', parentContact: '' });
                // Note: fetchStudents is not defined in this file, removing it
                fetchAnalytics(); // refresh chart
                
                // Invalidate queries so dashboard and management pages get latest data
                queryClient.invalidateQueries({ queryKey: ['students'] });
                queryClient.invalidateQueries({ queryKey: ['hrStats'] });
                queryClient.invalidateQueries({ queryKey: ['hrAnalytics'] });
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
                                <label className="block text-sm font-bold text-slate-700 mb-2">Select Batch</label>
                                <select 
                                    name="batchId" 
                                    value={manualForm.batchId} 
                                    onChange={handleManualInputChange} 
                                    required 
                                    className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                >
                                    <option value="">Choose Batch</option>
                                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Department</label>
                                <select name="deptId" value={manualForm.deptId} onChange={handleManualInputChange} className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-700 font-medium">
                                    <option value="">Choose Dept</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Admission Type</label>
                                <select name="admissionType" value={manualForm.admissionType} onChange={handleManualInputChange} className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                                    <option value="Counseling">Counseling</option>
                                    <option value="Management">Management</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Parent / Guardian Name <span className="text-slate-400 font-normal">(Optional)</span></label>
                                <input type="text" name="parentName" value={manualForm.parentName} onChange={handleManualInputChange} className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="e.g. Robert Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Parent / Guardian Contact <span className="text-slate-400 font-normal">(Optional)</span></label>
                                <input type="tel" name="parentContact" value={manualForm.parentContact} onChange={handleManualInputChange} className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="e.g. 9876543210" />
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
        </div>
    );
};

export default StudentBulkUpload;
