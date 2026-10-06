'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  HeartHandshake, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  KeyRound,
  Sparkles,
  Clock,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { useNtpClock } from '@/lib/ntpService';

export function LoginView() {
  const { login, users } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Relógio Atômico Oficial NTP.br
  const { timeStr, dateStr, isMounted, isSynced } = useNtpClock();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      if (!res.success) {
        setError(res.error || 'Credenciais inválidas. Verifique seu usuário e senha.');
        setLoading(false);
      }
    }, 300);
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);
    setTimeout(() => {
      login(demoEmail, demoPass);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Header / Brand */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white shadow-xl shadow-teal-500/20 ring-4 ring-white/10">
            <HeartHandshake className="h-9 w-9" />
          </div>

          <div>
            <div className="flex items-center justify-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">OmniSenior</h1>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                ILPI Care
              </span>
            </div>
            <p className="text-xs sm:text-sm text-purple-200/80 mt-1">
              Sistema Especializado de Gestão Clínica & Cuidado Humanizado
            </p>
          </div>

          {/* NTP.br Clock Pill */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[11px]">
            <span className={`w-2 h-2 rounded-full ${isSynced ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className="font-mono font-bold text-white">
              {isMounted ? `${dateStr} • ${timeStr}` : '--/--/---- • --:--:--'}
            </span>
            <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-1 py-0.2 rounded border border-emerald-400/30">
              NTP.br
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 space-y-5">
          
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Autenticação Obrigatória</h2>
              <p className="text-xs text-slate-500">Entre com as credenciais criadas pelo Admin Master</p>
            </div>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                E-mail ou Usuário de Acesso
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@omnisenior.com.br"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Senha de Acesso
                </label>
                <span className="text-[10px] text-slate-400">Fornecida pelo Diretor</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha cadastrada"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 text-white font-bold text-xs py-3 rounded-xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Validando credenciais...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Acessar o Sistema com Senha</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Access Demo Accounts */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>Acessos Rápidos de Demonstração</span>
              </span>
              <span className="text-[10px] text-slate-400">Clique para entrar</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleQuickLogin('diretoria@omnisenior.com.br', 'admin123')}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-950 transition flex flex-col justify-between"
              >
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                  <span className="text-[11px] font-bold leading-tight">Admin Master</span>
                </div>
                <span className="text-[10px] text-purple-700 mt-1 font-mono">Dra. Camila (Diretoria)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('medico@omnisenior.com.br', 'medico123')}
                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-950 transition flex flex-col justify-between"
              >
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  <span className="text-[11px] font-bold leading-tight">Médico Prescritor</span>
                </div>
                <span className="text-[10px] text-blue-700 mt-1 font-mono">Dr. Roberto (CRM)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('enfermagem@omnisenior.com.br', 'enfermeiro123')}
                className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100/80 border border-teal-200 text-teal-950 transition flex flex-col justify-between"
              >
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                  <span className="text-[11px] font-bold leading-tight">Enfermeira RT</span>
                </div>
                <span className="text-[10px] text-teal-700 mt-1 font-mono">Enf. Juliana (COREN)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('cuidador@omnisenior.com.br', 'cuidador123')}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-950 transition flex flex-col justify-between"
              >
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span className="text-[11px] font-bold leading-tight">Cuidadora Plantão</span>
                </div>
                <span className="text-[10px] text-emerald-700 mt-1 font-mono">Maria Silva (12x36)</span>
              </button>
            </div>
          </div>

          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-400">
              Não tem login? O <strong>Admin Master da sua ILPI</strong> cria e fornece sua conta no painel de Diretoria.
            </p>
          </div>

        </div>

        {/* Footer Security Badges */}
        <div className="text-center text-[11px] text-purple-200/60 space-y-1">
          <p className="flex items-center justify-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
            <span>Conformidade RDC 502/2021 ANVISA • Sigilo LGPD em Saúde</span>
          </p>
          <p>© {new Date().getFullYear()} OmniSenior ILPI. Todos os direitos reservados.</p>
        </div>

      </div>
    </div>
  );
}
