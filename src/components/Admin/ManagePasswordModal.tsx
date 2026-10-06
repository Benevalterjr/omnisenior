'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/types/ilpi';
import { ROLE_LABELS } from '@/lib/permissionsService';
import { 
  X, 
  KeyRound, 
  ShieldCheck, 
  Check, 
  Copy, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Sparkles,
  Lock,
  Send
} from 'lucide-react';

interface ManagePasswordModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSavePassword: (userId: string, newPassword: string) => void;
}

export function ManagePasswordModal({
  user,
  isOpen,
  onClose,
  onSavePassword
}: ManagePasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !user) return null;

  const roleInfo = ROLE_LABELS[user.role] || ROLE_LABELS.cuidador;
  const currentPassword = user.password || 'admin123';

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    const prefixes = ['Senior', 'Omni', 'Cuidado', 'Saude', 'Vida'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(1000 + Math.random() * 9000);
    const symbols = ['!', '@', '#', '$'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const generated = `${prefix}#${number}${symbol}`;
    setPassword(generated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    onSavePassword(user.id, password.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  const handleCopyCredentials = () => {
    const passToUse = password.trim() || currentPassword;
    const text = `🏥 *OmniSenior ILPI — Acesso ao Sistema*\n` +
      `👤 *Colaborador:* ${user.name} (${roleInfo.title})\n` +
      `📧 *Login/E-mail:* ${user.email}\n` +
      `🔑 *Senha de Acesso:* ${passToUse}\n` +
      `🌐 *Acesse o app com usuário e senha.*`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-purple-300">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Gerenciar Senha de Acesso</h3>
              <p className="text-xs text-purple-200/80">Painel do Administrador Master</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          
          {/* User Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center space-x-3">
            <img
              src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7c3aed&color=fff`}
              alt={user.name}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-slate-800 truncate">{user.name}</h4>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
              <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${roleInfo.color}`}>
                {roleInfo.badge} • {roleInfo.title}
              </span>
            </div>
          </div>

          {/* Current Password Info */}
          <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-purple-900 font-bold block">Senha Atual Registrada:</span>
              <span className="font-mono font-bold text-slate-700">{currentPassword}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyCredentials}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition flex items-center space-x-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          {/* Reset Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Nova Senha de Acesso
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-xs text-purple-700 font-bold hover:underline flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>Gerar Senha Forte</span>
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a nova senha para o colaborador"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition font-mono"
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

            {savedSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Senha atualizada com sucesso pelo Admin Master!</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Fechar
              </button>
              <button
                type="submit"
                disabled={!password.trim()}
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Salvar Nova Senha</span>
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
