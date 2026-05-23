import React, { useState } from 'react';
import { Award, CheckCircle, XCircle, FileDown, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

export default function AnalysisResults({ resumeData, onAskAIClick }) {
  const {
    fileName,
    summary,
    atsScore,
    matchPercentage,
    matchingSkills = [],
    missingSkills = [],
    suggestedImprovements = [],
    keywordAnalysis = {},
    roleSuitability
  } = resumeData;

  const [checkedImprovements, setCheckedImprovements] = useState({});

  const toggleImprovement = (index) => {
    setCheckedImprovements(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Cosine embedding keyword tags helper
  const keywords = Object.entries(keywordAnalysis);

  // SVG Circular Gauge configurations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffsetATS = circumference - (atsScore / 100) * circumference;
  const strokeDashoffsetMatch = circumference - (matchPercentage / 100) * circumference;

  // Print-to-PDF standard handler using dynamic iframe (pure, zero-dependency vectors!)
  const handleDownloadPDF = () => {
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    
    // Print styles
    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ATS Report - ${fileName}</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1e293b;
            padding: 40px;
            line-height: 1.6;
          }
          .header {
            border-bottom: 2px solid #6d28d9;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .brand {
            font-size: 24px;
            font-weight: 800;
            color: #6d28d9;
          }
          .title {
            font-size: 20px;
            font-weight: 700;
            margin-top: 5px;
            color: #0f172a;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .stat-box {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 15px;
            text-align: center;
          }
          .stat-num {
            font-size: 32px;
            font-weight: 800;
            color: #6d28d9;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
            margin-bottom: 12px;
          }
          .skills-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .skill-item {
            font-size: 12px;
            margin-bottom: 4px;
          }
          .matching { color: #059669; }
          .missing { color: #dc2626; }
          .improvement-list {
            padding-left: 20px;
          }
          .improvement-item {
            font-size: 13px;
            margin-bottom: 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">ResumeAI</div>
          <div class="title">ATS Compatibility Evaluation Report</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 5px;">File Analyzed: ${fileName}</div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-num">${atsScore}/100</div>
            <div style="font-size: 12px; color: #475569; font-weight: 600;">ATS Optimization Score</div>
          </div>
          <div class="stat-box">
            <div class="stat-num">${matchPercentage}%</div>
            <div style="font-size: 12px; color: #475569; font-weight: 600;">Job Matching Percentage</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Candidate Executive Summary</div>
          <p style="font-size: 13px; color: #334155; margin: 0;">${summary}</p>
        </div>

        <div class="section">
          <div class="section-title">Role Suitability Assessment</div>
          <p style="font-size: 13px; color: #334155; margin: 0;">${roleSuitability}</p>
        </div>

        <div class="section">
          <div class="section-title">Skill Analysis Matrix</div>
          <div class="skills-grid">
            <div>
              <strong style="font-size: 13px; color: #059669;">Matching Skills Found:</strong>
              <div style="margin-top: 8px;">
                ${matchingSkills.length > 0 
                  ? matchingSkills.map(s => `<div class="skill-item matching">✔ ${s}</div>`).join('') 
                  : '<div style="font-size: 12px; color: #94a3b8;">None identified</div>'}
              </div>
            </div>
            <div>
              <strong style="font-size: 13px; color: #dc2626;">Missing High-Value Gaps:</strong>
              <div style="margin-top: 8px;">
                ${missingSkills.length > 0 
                  ? missingSkills.map(s => `<div class="skill-item missing">✘ ${s}</div>`).join('') 
                  : '<div style="font-size: 12px; color: #94a3b8;">None identified</div>'}
              </div>
            </div>
          </div>
        </div>

        <div class="section" style="page-break-before: auto;">
          <div class="section-title">Actionable Resume Optimization Guide</div>
          <ol class="improvement-list">
            ${suggestedImprovements.map(imp => `<li class="improvement-item">${imp}</li>`).join('')}
          </ol>
        </div>
      </body>
      </html>
    `;

    doc.open();
    doc.write(printHtml);
    doc.close();

    // Trigger printing once loaded
    printFrame.onload = () => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      // Remove frame after print dialog closes
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview Dials Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ATS Circle Gauge */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-primary-500 dark:text-primary-400" />
            <span>ATS Score</span>
          </h4>
          <div className="relative w-32 h-32 flex items-center justify-center mb-2">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r={radius} className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="8" />
              <circle 
                cx="64" cy="64" r={radius} 
                className="stroke-primary-500 fill-none transition-all duration-1000 ease-out" 
                strokeWidth="8" 
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffsetATS}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-2xl font-black text-slate-800 dark:text-slate-100">
              {atsScore}<span className="text-xs text-slate-400">/100</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] mt-2">
            Measures formatting compatibility, headers structure, and parsed text clarity.
          </p>
        </div>

        {/* Matching Circle Gauge */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-violet-500 dark:text-violet-400" />
            <span>Job Description Match</span>
          </h4>
          <div className="relative w-32 h-32 flex items-center justify-center mb-2">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r={radius} className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="8" />
              <circle 
                cx="64" cy="64" r={radius} 
                className="stroke-violet-500 fill-none transition-all duration-1000 ease-out" 
                strokeWidth="8" 
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffsetMatch}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-2xl font-black text-slate-800 dark:text-slate-100">
              {matchPercentage}<span className="text-xs text-slate-400">%</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] mt-2">
            Calculates skills match, key concepts overlaps, and experience alignments.
          </p>
        </div>

        {/* Quick Summary card */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">AI Executive Profile Summary</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
              "{summary}"
            </p>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <FileDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onAskAIClick}
              className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary-500/10 active:scale-98"
            >
              <span>Ask Chatbot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role suitability block */}
      <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary-500 dark:text-primary-400" />
          <span>Role Suitability Assessment</span>
        </h4>
        <p className="text-sm text-slate-650 dark:text-slate-300 leading-relaxed">
          {roleSuitability}
        </p>
      </div>

      {/* Skill Gaps Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matching Skills */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>Matching Skills Identified ({matchingSkills.length})</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {matchingSkills.length > 0 ? (
              matchingSkills.map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-medium hover:scale-102 transition-transform duration-200"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No explicit matching skills matching the description were found.</p>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            <span>High-Priority Skill Gaps ({missingSkills.length})</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {missingSkills.length > 0 ? (
              missingSkills.map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-medium hover:scale-102 transition-transform duration-200 animate-pulse-slow"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">Excellent match! No high-priority skills appear to be missing.</p>
            )}
          </div>
        </div>
      </div>

      {/* Keywords & Actionable Improvement Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Keywords Grid */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Keyword Densities Assessment</h4>
          <div className="space-y-3.5">
            {keywords.length > 0 ? (
              keywords.map(([key, value], idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 dark:text-slate-300">{key}</span>
                    <span className={value > 0 ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-slate-400 dark:text-slate-600'}>
                      {value} {value === 1 ? 'mention' : 'mentions'}
                    </span>
                  </div>
                  {/* Percentage Bar */}
                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${value > 0 ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-800'}`} 
                      style={{ width: `${value > 0 ? Math.min(100, value * 20) : 5}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No keyword metrics available.</p>
            )}
          </div>
        </div>

        {/* Actions Improvement Checklist */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary-500 dark:text-primary-400" />
            <span>Interactive Optimization Guide</span>
          </h4>
          
          <div className="space-y-3">
            {suggestedImprovements.map((imp, index) => (
              <div 
                key={index} 
                onClick={() => toggleImprovement(index)}
                className={`p-3.5 border rounded-2xl cursor-pointer select-none transition-all flex items-start gap-3.5 ${
                  checkedImprovements[index]
                    ? 'bg-slate-50 dark:bg-slate-950/10 border-slate-100 dark:border-slate-900 opacity-50'
                    : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800/80 hover:border-primary-500/40 dark:hover:border-primary-500/30 hover:bg-primary-500/[0.01]'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                  checkedImprovements[index] 
                    ? 'bg-primary-600 border-primary-500 text-white' 
                    : 'border-slate-350 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-400 bg-white dark:bg-slate-900'
                }`}>
                  {checkedImprovements[index] && (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={`text-xs leading-relaxed font-medium ${
                  checkedImprovements[index] 
                    ? 'line-through text-slate-400 dark:text-slate-500' 
                    : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {imp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
