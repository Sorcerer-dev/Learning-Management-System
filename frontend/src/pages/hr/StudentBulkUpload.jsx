import React from 'react';
import { UploadCloud, Download } from 'lucide-react';

const StudentBulkUpload = () => {
    return (
        <div className="p-6 max-w-4xl mx-auto animate-in fade-in duration-300">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary mb-2">Student Bulk Upload</h1>
                <p className="text-slate-500">Upload an excel or CSV file to import multiple students into the system at once.</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl border border-border shadow-sm mb-8 gap-4">
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Use the standard template</h3>
                    <p className="text-sm text-slate-500">Download the required column format before uploading.</p>
                </div>
                <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-lg transition-colors w-full sm:w-auto justify-center">
                    <Download className="w-4 h-4" />
                    Download Template
                </button>
            </div>

            <div className="border-2 border-dashed border-primary/40 bg-primary/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:bg-primary/10 hover:border-primary/60 transition-all cursor-pointer">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <UploadCloud className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Drag & Drop your file here</h3>
                <p className="text-slate-500 mb-6">or click to browse from your computer</p>

                <p className="text-xs font-semibold text-slate-400">Supported formats: .CSV, .XLSX (Max 5MB)</p>
            </div>

            <div className="mt-8 flex justify-end">
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-xl shadow-md transition-all sm:w-auto w-full">
                    Process Upload
                </button>
            </div>
        </div>
    );
};

export default StudentBulkUpload;
