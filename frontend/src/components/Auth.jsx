import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, User, FileSearch, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);
  
  const { login, register, isLoading, error, setError } = useContext(AuthContext);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError(null);
    setError(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    const { name, email, password } = formData;

    if (!email || !password) {
      setLocalError('Please fill in all credentials.');
      return;
    }

    if (!isLogin && !name) {
      setLocalError('Please fill in your name.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (isLogin) {
      const res = await login(email, password);
      if (!res.success) {
        setLocalError(res.message);
      }
    } else {
      const res = await register(name, email, password);
      if (!res.success) {
        setLocalError(res.message);
      }
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '' });
    setLocalError(null);
    setError(null);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Dynamic Animated Glass Gradients Background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-500 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse-slow"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md p-8 m-4 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex p-3 bg-primary-500/10 border border-primary-500/20 rounded-2xl text-primary-400 mb-3 hover:scale-105 transition-transform duration-300">
            <FileSearch className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-400 via-violet-300 to-indigo-300 bg-clip-text text-transparent">
            ResumeAI
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Unlock your full ATS potential with intelligent AI feedback
          </p>
        </div>

        {/* Premium Glassmorphic Form Card */}
        <div className="bg-slate-950/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          {/* Subtle upper glow line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-60"></div>
          
          <h2 className="text-xl font-semibold mb-6 text-slate-200">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          {(localError || error) && (
            <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2 animate-bounce-slow">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></div>
              <span>{localError || error}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Name</label>
                <div className="relative group/input">
                  <User className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500 group-focus-within/input:text-primary-400 transition-colors duration-200" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800/80 focus:border-primary-500/80 rounded-xl outline-none text-sm transition-all duration-200 placeholder-slate-600 focus:ring-2 focus:ring-primary-500/10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Email Address</label>
              <div className="relative group/input">
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500 group-focus-within/input:text-primary-400 transition-colors duration-200" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@company.com"
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800/80 focus:border-primary-500/80 rounded-xl outline-none text-sm transition-all duration-200 placeholder-slate-600 focus:ring-2 focus:ring-primary-500/10"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Password</label>
              <div className="relative group/input">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500 group-focus-within/input:text-primary-400 transition-colors duration-200" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full pl-11 pr-11 py-3 bg-slate-900/60 border border-slate-800/80 focus:border-primary-500/80 rounded-xl outline-none text-sm transition-all duration-200 placeholder-slate-600 focus:ring-2 focus:ring-primary-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-500/15 hover:shadow-primary-500/25 active:scale-98 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Button */}
          <div className="mt-6 text-center text-xs text-slate-400">
            <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>{' '}
            <button
              onClick={toggleAuthMode}
              disabled={isLoading}
              className="text-primary-400 hover:text-primary-300 font-semibold underline underline-offset-4 focus:outline-none"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
