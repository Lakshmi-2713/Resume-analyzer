import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import API from '../services/api';
import ResumeUpload from './ResumeUpload';
import AnalysisResults from './AnalysisResults';
import ResumeChat from './ResumeChat';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  LogOut, 
  Sun, 
  Moon, 
  User, 
  Plus, 
  Trash2,
  Calendar,
  Sparkles,
  TrendingUp,
  Award,
  ChevronRight,
  Briefcase
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme, isDark } = useContext(ThemeContext);

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'upload', 'results', 'chat'
  const [history, setHistory] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Fetch upload history
  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await API.get('/resumes');
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load history:', error.message);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleUploadSuccess = (newResume) => {
    setHistory(prev => [newResume, ...prev]);
    setSelectedResume(newResume);
    setActiveTab('results');
  };

  const handleDeleteResume = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resume analysis from your history?')) return;

    try {
      const response = await API.delete(`/resumes/${id}`);
      if (response.data.success) {
        setHistory(prev => prev.filter(item => item._id !== id));
        if (selectedResume?._id === id) {
          setSelectedResume(null);
          setActiveTab('dashboard');
        }
      }
    } catch (err) {
      console.error('Error deleting resume:', err.message);
    }
  };

  const handleSelectResume = (resume) => {
    setSelectedResume(resume);
    setActiveTab('results');
  };

  // Dashboard Stats Calculations
  const totalUploads = history.length;
  const averageATS = totalUploads > 0 
    ? Math.round(history.reduce((sum, r) => sum + r.atsScore, 0) / totalUploads) 
    : 0;
  const highestMatch = totalUploads > 0 
    ? Math.max(...history.map(r => r.matchPercentage)) 
    : 0;
  const targetRole = totalUploads > 0 && history[0].matchingSkills.length > 0 
    ? history[0].matchingSkills[0] + ' Engineer' 
    : 'Full-Stack Developer';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800/80 p-6 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="p-2.5 bg-primary-600 rounded-2xl text-white shadow-lg shadow-primary-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-300 bg-clip-text text-transparent">
              ResumeAI
            </span>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-primary-500/10 border-l-4 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setSelectedResume(null);
                setActiveTab('upload');
              }}
              className={`w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                activeTab === 'upload'
                  ? 'bg-primary-500/10 border-l-4 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Analyze New</span>
            </button>

            {selectedResume && (
              <>
                <button
                  onClick={() => setActiveTab('results')}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                    activeTab === 'results'
                      ? 'bg-primary-500/10 border-l-4 border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <FileText className="w-4.5 h-4.5" />
                  <span>Latest Analysis</span>
                </button>

                <button
                  onClick={() => setActiveTab('chat')}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                    activeTab === 'chat'
                      ? 'bg-primary-500/10 border-l-4 border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <MessageSquare className="w-4.5 h-4.5" />
                  <span>RAG AI Chat</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* User Card & Actions */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/40 border border-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                {user?.name}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[120px]">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 rounded-xl transition-all"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            <button
              onClick={logout}
              className="flex-1 py-2.5 px-3 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 text-rose-500 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Area */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-h-screen">
        {/* Dynamic Navigation Tabs */}
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header Title */}
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Welcome Back, {user?.name}!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Check out your resume scores, improvement stats, and recent upload logs.</p>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Uploaded</span>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-2">{totalUploads}</h3>
                </div>
                <div className="p-3.5 bg-primary-500/10 border border-primary-500/20 rounded-2xl text-primary-500">
                  <FileText className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average ATS Score</span>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-2">{averageATS}<span className="text-sm text-slate-400">/100</span></h3>
                </div>
                <div className="p-3.5 bg-violet-500/10 border border-violet-500/20 rounded-2xl text-violet-500">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Highest JD Match</span>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-2">{highestMatch}%</h3>
                </div>
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Target Core Role</span>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-3 truncate max-w-[130px]">{targetRole}</h3>
                </div>
                <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-500">
                  <Briefcase className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Visual Charts Timeline and History List */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Score Chart Column */}
              <div className="lg:col-span-3 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary-500" />
                  <span>ATS Score Growth Timeline</span>
                </h4>
                
                {history.length > 0 ? (
                  <div className="flex-1 flex flex-col justify-end min-h-[220px]">
                    {/* SVG Line Graph */}
                    <div className="relative w-full h-[180px]">
                      <svg viewBox="0 0 400 180" className="w-full h-full">
                        {/* Define Gradients */}
                        <defs>
                          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Horizontal Grid Lines */}
                        <line x1="0" y1="45" x2="400" y2="45" stroke="#f1f5f9" className="dark:stroke-slate-800/50" strokeWidth="1" />
                        <line x1="0" y1="90" x2="400" y2="90" stroke="#f1f5f9" className="dark:stroke-slate-800/50" strokeWidth="1" />
                        <line x1="0" y1="135" x2="400" y2="135" stroke="#f1f5f9" className="dark:stroke-slate-800/50" strokeWidth="1" />
                        
                        {/* Vector Calculations */}
                        {(() => {
                          const points = history.slice().reverse().map((item, idx) => {
                            const x = (idx / Math.max(1, history.length - 1)) * 360 + 20;
                            // scale score (0-100) to height (180 to 20 px)
                            const y = 160 - (item.atsScore / 100) * 140;
                            return { x, y, score: item.atsScore };
                          });

                          const dPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                          const dArea = points.length > 0 
                            ? `${dPath} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z` 
                            : '';

                          return (
                            <>
                              {/* Filled glowing background */}
                              {dArea && <path d={dArea} fill="url(#chartGlow)" />}
                              
                              {/* Glowing Wave Line */}
                              {dPath && (
                                <path 
                                  d={dPath} 
                                  fill="none" 
                                  stroke="#8b5cf6" 
                                  strokeWidth="3.5" 
                                  strokeLinecap="round"
                                  className="drop-shadow-[0_2px_8px_rgba(139,92,246,0.3)]"
                                />
                              )}
                              
                              {/* Glowing interactive nodes */}
                              {points.map((p, idx) => (
                                <g key={idx} className="group/node cursor-pointer">
                                  <circle cx={p.x} cy={p.y} r="5" fill="#8b5cf6" className="stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
                                  <circle cx={p.x} cy={p.y} r="9" fill="#8b5cf6" className="opacity-0 group-hover/node:opacity-20 transition-opacity" />
                                  {/* Floating tip */}
                                  <text x={p.x} y={p.y - 12} textAnchor="middle" className="text-[10px] font-black fill-primary-600 dark:fill-primary-400 opacity-0 group-hover/node:opacity-100 transition-opacity">
                                    {p.score}
                                  </text>
                                </g>
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-4">
                      <span>Oldest Evaluation</span>
                      <span>Latest Update</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 text-xs text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                    <span>No scores available. Analyze resumes to view trends!</span>
                  </div>
                )}
              </div>

              {/* History Upload Logs Column */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center justify-between">
                  <span>Upload History logs</span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-full text-slate-500 font-medium">{history.length} items</span>
                </h4>

                {isLoadingHistory ? (
                  <div className="flex-1 flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                  </div>
                ) : history.length > 0 ? (
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[220px]">
                    {history.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleSelectResume(item)}
                        className="p-3.5 bg-slate-50/40 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-800 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 group-hover:text-primary-500 transition-colors shrink-0">
                            <FileText className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-500 transition-colors">
                              {item.fileName}
                            </p>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-black bg-primary-500/10 text-primary-600 dark:text-primary-400 px-2 py-1 rounded-lg">
                            {item.atsScore}
                          </span>
                          <button
                            onClick={(e) => handleDeleteResume(item._id, e)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            title="Remove log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 text-xs text-center border border-dashed border-slate-250 dark:border-slate-800 rounded-3xl">
                    <p>Your analysis log is empty.</p>
                    <button 
                      onClick={() => setActiveTab('upload')}
                      className="text-primary-500 hover:text-primary-400 font-semibold underline mt-2 text-[11px]"
                    >
                      Start uploading now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Upload & Analyze Resume</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Paste your target job description and drag-and-drop your resume in PDF format.</p>
            </div>
            <ResumeUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {/* Analysis Results Tab */}
        {activeTab === 'results' && selectedResume && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 truncate max-w-[400px]">
                  Analysis: {selectedResume.fileName}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Detailed evaluation guidelines, matching checks, and score reviews.</p>
              </div>
              <button
                onClick={() => setActiveTab('chat')}
                className="px-5 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/10 active:scale-98 transition-all shrink-0"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Conversational RAG Chat</span>
              </button>
            </div>
            <AnalysisResults 
              resumeData={selectedResume} 
              onAskAIClick={() => setActiveTab('chat')} 
            />
          </div>
        )}

        {/* AI Chat Tab */}
        {activeTab === 'chat' && selectedResume && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">RAG AI Chatbot</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Ask specific questions about the candidate's resume (e.g. role suitability, core gaps, technical experience).
              </p>
            </div>
            <ResumeChat resumeId={selectedResume._id} />
          </div>
        )}
      </main>
    </div>
  );
}
