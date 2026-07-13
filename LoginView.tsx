/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Shield, Lock, User as UserIcon, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { AppUser } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: AppUser) => void;
  systemUsers: AppUser[];
}

export default function LoginView({ onLoginSuccess, systemUsers }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    // Match credential checks
    const matchedUser = systemUsers.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!matchedUser) {
      setError('Invalid username. Try using "nucore_admin", "admin", "sarah", or "markus".');
      return;
    }

    if (matchedUser.status === 'Pending Password Invite') {
      setError(`Account setup is pending! A secure activation email was simulated and sent to "${matchedUser.email}". Please open the "Access & Directory Panel" -> "Simulated Outbox" tab as an Admin to set their password.`);
      return;
    }

    if (matchedUser.password !== password) {
      setError('Incorrect password. (Try using "admin", "admin123", "sarah123" or check the quick-fill options below).');
      return;
    }

    onLoginSuccess(matchedUser);
  };

  const handleQuickFill = (user: AppUser) => {
    setUsername(user.username);
    setPassword(user.password || '');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#f4f6fe] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Abstract high-end modern decorative backgrounds */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-emerald-100/35 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center p-3.5 bg-slate-900 rounded-2xl shadow-lg mb-4 text-[#81f2eb]">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase font-sans">
          ONBOARDING SYSTEM
        </h2>
        <p className="mt-1 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
          Project Workflow & Status Engine
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 border border-slate-200 shadow-xl rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {error && (
              <div className="bg-rose-50 border border-rose-150 p-3.5 rounded-xl flex items-start gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-semibold leading-relaxed">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                Username ID
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., admin"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                Secure Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-450 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-950 text-white font-bold text-xs py-3 px-4 rounded-lg hover:bg-slate-800 transition-colors uppercase font-mono tracking-wider shadow-md text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Login</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
