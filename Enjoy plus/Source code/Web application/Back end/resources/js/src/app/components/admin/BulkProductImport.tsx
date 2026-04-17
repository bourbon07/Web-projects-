import React, { useState, useRef } from 'react';
import axiosConfig from '../../../api/axiosConfig';
import { FileUp, Loader2, CheckCircle, AlertCircle, UploadCloud } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function BulkProductImport({ onImportSuccess }: { onImportSuccess: () => void }) {
  const { lang } = useApp();
  const isRTL = lang === "ar";
  const t = (ar: string, en: string) => (isRTL ? ar : en);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    setFile(selectedFile);
    setErrors([]);
    setSuccessMsg(null);
  };

  const uploadFile = async () => {
    if (!file) return;

    setIsUploading(true);
    setErrors([]);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axiosConfig.post("/admin/import-products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMsg(`Success! ${response.data.total} products added.`);
      setFile(null); // Clear file
      if (fileInputRef.current) {
         fileInputRef.current.value = "";
      }
      onImportSuccess();
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.error) {
        setErrors([`Exception: ${err.response.data.error}`]);
      } else {
        setErrors([err.response?.data?.message || err.message || "Upload failed."]);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200" dir="ltr">
      <h3 className="font-bold text-gray-800 text-sm">Bulk Import Products</h3>
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${file ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-400 bg-white'}`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".csv, .xls, .xlsx, .pdf" 
          className="hidden" 
        />
        <UploadCloud className={`w-8 h-8 mb-2 ${file ? 'text-red-500' : 'text-gray-400'}`} />
        <p className="text-sm text-gray-600 text-center">
          {file ? (
            <span className="font-semibold text-red-600">{file.name}</span>
          ) : (
             "Drag & drop file here or click to browse (.csv, .xls, .xlsx, .pdf)"
          )}
        </p>
      </div>

      {file && (
        <button 
          onClick={uploadFile}
          disabled={isUploading}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50 transition-colors"
        >
          {isUploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
          ) : (
            <><FileUp className="w-4 h-4" /> Upload File</>
          )}
        </button>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 text-green-700 bg-green-100 p-3 rounded-lg text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-2">
            <AlertCircle className="w-4 h-4" />
            <span>Validation Errors:</span>
          </div>
          <ul className="text-sm text-red-600 list-disc list-inside max-h-32 overflow-y-auto">
            {errors.map((error, idx) => (
               <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
