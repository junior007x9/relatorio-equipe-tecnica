// components/Auth/LoginForm.tsx
'use client';

import { useState } from 'react';

interface LoginFormProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  loading: boolean;
}

export default function LoginForm({ onLogin, loading }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      
      {/* Círculos decorativos vibrantes ao fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-10 rounded-3xl w-full max-w-md shadow-2xl relative z-10 transition-all">
          <div className="flex justify-center mb-8">
              <div className="h-24 w-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-4xl shadow-lg shadow-indigo-300/50">
                🧠
              </div>
          </div>
          <h1 className="text-3xl font-black text-center text-slate-800 mb-2 tracking-tight">Equipa Técnica</h1>
          <p className="text-center text-slate-500 mb-8 font-medium">CSIPRC - Acesso ao Sistema</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
              <div className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider transition-colors group-focus-within:text-indigo-600">E-mail Institucional</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900 transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm" 
                    placeholder="tecnico@csiprc.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
              </div>
              <div className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider transition-colors group-focus-within:text-indigo-600">Palavra-passe</label>
                  <input 
                    type="password" 
                    required 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900 transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
              </div>
              
              <button 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-indigo-500/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex justify-center items-center gap-2 mt-4"
              >
                  {loading ? (
                    <><span className="animate-spin text-xl">⏳</span> A Autenticar...</>
                  ) : (
                    <>Entrar no Sistema <span>➔</span></>
                  )}
              </button>
          </form>
      </div>
    </div>
  );
}