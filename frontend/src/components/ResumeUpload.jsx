import React, { useState, useRef } from 'react';
import API from '../services/api';
import { Upload, FileText, Briefcase, ChevronRight, AlertCircle, Cpu } from 'lucide-react';

export default function ResumeUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  
  const fileInputRef = useRef(null);

  // Cycling parsing messages for the WOW factor loading experience
  const analysisSteps = [
    'Parsing PDF text elements...',
    'Segmenting experience and skills...',
    'Retrieving keyword matrices...',
    'Generating vector database embeddings...',
    'Coordinating ATS grading engines...',
    'Finalizing skill matching scores...'
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setUploadError(null);
    if (selectedFile.type !== 'application/pdf') {
      setUploadError('Only PDF format resumes are supported.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5MB limit.');
      return;
    }
    setFile(selectedFile);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const removeSelectedFile = () => {
    setFile(null);
    setUploadError(null);
  };

  const handleAnalyzeSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a resume PDF file first.');
      return;
    }

    setIsAnalyzing(true);
    setUploadError(null);

    // Dynamic timer to cycle analysis step text
    const interval = setInterval(() => {
      setAnalysisStep((prev) => (prev < analysisSteps.length - 1 ? prev + 1 : prev));
    }, 2800);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription);

      const response = await API.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(interval);
      if (response.data.success) {
        onUploadSuccess(response.data.data);
      }
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      const msg = err.response?.data?.message || 'Error processing the file. Try again.';
      setUploadError(msg);
      setIsAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[450px] bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm animate-pulse-slow">
        {/* Animated RAG Network / Cyberpunk Core Graphics */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute w-24 h-24 border border-dashed border-primary-500/30 rounded-full animate-spin-slow"></div>
          <div className="absolute w-16 h-16 border-2 border-t-primary-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <div className="w-10 h-10 bg-primary-500/10 border border-primary-500/30 rounded-2xl flex items-center justify-center text-primary-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-500 dark:from-primary-400 dark:to-indigo-300 bg-clip-text text-transparent mb-2">
          Analyzing Resume
        </h3>
        
        {/* Cycling Text */}
        <p className="text-sm text-slate-500 dark:text-slate-400 h-6 transition-all duration-300">
          {analysisSteps[analysisStep]}
        </p>

        {/* Loading Progress Bar */}
        <div className="w-64 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-6">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 transition-all duration-1000 ease-out" 
            style={{ width: `${((analysisStep + 1) / analysisSteps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Upload Drag & Drop Column */}
      <div className="lg:col-span-2 flex flex-col">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Resume Upload</h3>
        
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={file ? undefined : triggerFileSelect}
          className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-6 cursor-pointer transition-all duration-300 ${
            isDragOver
              ? 'border-primary-500 bg-primary-500/5'
              : file
              ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-primary-500/60 dark:hover:border-primary-500/60 bg-slate-50/30 dark:bg-slate-950/10 hover:bg-primary-500/[0.01]'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />

          {file ? (
            <div className="w-full flex flex-col items-center p-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 mb-4 animate-bounce-slow">
                <FileText className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium text-slate-850 dark:text-slate-200 text-center max-w-[200px] truncate mb-1">
                {file.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={removeSelectedFile}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-rose-500/40 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 text-xs rounded-xl transition-colors duration-200"
              >
                Remove File
              </button>
            </div>
          ) : (
            <div className="text-center flex flex-col items-center">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 mb-4 group-hover:text-primary-500 transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Drag & drop your resume PDF
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Supports standard PDF files up to 5MB
              </p>
              <button
                type="button"
                className="mt-6 px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-xl font-medium transition-all"
              >
                Browse Files
              </button>
            </div>
          )}
        </div>

        {uploadError && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 rounded-xl text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Job Description Text Input Column */}
      <div className="lg:col-span-3 flex flex-col">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary-500 dark:text-primary-400" />
          <span>Job Description (Optional)</span>
        </h3>
        
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the target job description here to generate an custom ATS matching percentage, keyword gap assessments, and role compatibility recommendations..."
          className="flex-1 min-h-[180px] w-full p-4 bg-white dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 focus:border-primary-500/80 rounded-3xl outline-none text-sm transition-all duration-200 placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-primary-500/10 text-slate-800 dark:text-slate-300 resize-none font-sans"
        />

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleAnalyzeSubmit}
            disabled={!file}
            className="px-6 py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-primary-500/10 hover:shadow-primary-500/25 active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Analyze Resume</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
