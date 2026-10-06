'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS, getUserPermissions } from '@/lib/permissionsService';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  Clock, 
  Award, 
  Check, 
  LogOut, 
  Eye, 
  EyeOff,
  AlertCircle
} from 'lucide-react';

interface MeuPerfilModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MeuPerfilModal({ isOpen, onClose }: MeuPerfilModalProps) {
  const { currentUser, resetUserPassword, logout } = useAuth();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  if (!isOpen || !currentUser) return null;

  const roleInfo = ROLE_LABELS[currentUser.role] || ROLE_LABELS.cuidador;
  const permissions = getUserPermissions(currentUser);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas digitadas não coincidem.');
      return;
    }

    resetUserPassword(currentUser.id, newPassword);
    setPasswordSuccess(true);
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setPasswordSuccess(false);
      setIsChangingPassword(false);
    }, 2000);
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-purple-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Meu Perfil de Acesso</h3>
              <p className="text-xs text-purple-200/80">Informações da sua conta profissional</p>
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
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* User Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center space-x-4">
            <img
              src={currentUser.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=7c3aed&color=fff`}
              alt={currentUser.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-xs"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-base text-slate-900 truncate">{currentUser.name}</h4>
              <p className="text-xs text-slate-500 truncate flex items-center space-x-1 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{currentUser.email}</span>
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${roleInfo.color}`}>
                  {roleInfo.badge} • {roleInfo.title}
                </span>
                {currentUser.registry && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200">
                    {currentUser.registry}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Especialidade / Setor:</span>
              <span className="font-bold text-slate-800">{currentUser.specialty || 'Clínica Geral'}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Escala de Atuação:</span>
              <span className="font-bold text-slate-800 capitalize">
                {currentUser.shiftPreference ? currentUser.shiftPreference.replace('_', ' ') : 'Turno Regular'}
              </span>
            </div>
          </div>

          {/* My Permissions */}
          <div className="border-t border-slate-100 pt-4">
            <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Suas Permissões Ativas na ILPI</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {permissions.canPrescribe && (
                <div className="flex items-center space-x-1.5 text-blue-800 bg-blue-50/60 p-2 rounded-lg border border-blue-200">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Prescrever Medicamentos</span>
                </div>
              )}
              {permissions.canTranscribe && (
                <div className="flex items-center space-x-1.5 text-teal-800 bg-teal-50/60 p-2 rounded-lg border border-teal-200">
                  <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Transcrever Receitas Externas</span>
                </div>
              )}
              {permissions.canAdministerMedication && (
                <div className="flex items-center space-x-1.5 text-emerald-800 bg-emerald-50/60 p-2 rounded-lg border border-emerald-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Checar Medicamentos no Leito</span>
                </div>
              )}
              {permissions.canLogRoutine && (
                <div className="flex items-center space-x-1.5 text-emerald-800 bg-emerald-50/60 p-2 rounded-lg border border-emerald-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Registrar Rotina Diária</span>
                </div>
              )}
              {permissions.canApplyScales && (
                <div className="flex items-center space-x-1.5 text-amber-800 bg-amber-50/60 p-2 rounded-lg border border-amber-200">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Aplicar Escalas Geriátricas</span>
                </div>
              )}
              {permissions.canViewConfidential && (
                <div className="flex items-center space-x-1.5 text-purple-800 bg-purple-50/60 p-2 rounded-lg border border-purple-200">
                  <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Acesso a Prontuário Sigiloso</span>
                </div>
              )}
              {permissions.canManageInventory && (
                <div className="flex items-center space-x-1.5 text-slate-800 bg-slate-100 p-2 rounded-lg border border-slate-200">
                  <Check className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span>Movimentar Estoque Individual</span>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Collapsible Section */}
          <div className="border-t border-slate-100 pt-4">
            {!isChangingPassword ? (
              <button
                type="button"
                onClick={() => setIsChangingPassword(true)}
                className="w-full text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100/70 p-3 rounded-xl border border-purple-200 transition flex items-center justify-center space-x-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Alterar Minha Senha de Acesso</span>
              </button>
            ) : (
              <form onSubmit={handleUpdatePassword} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h6 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                    <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                    <span>Redefinir Minha Senha</span>
                  </h6>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordError(null);
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    Cancelar
                  </button>
                </div>

                {passwordError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Sua senha foi alterada com sucesso!</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nova senha (mínimo 6 caracteres)"
                      className="w-full text-xs pr-9 pl-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a nova senha"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2 rounded-xl transition shadow-2xs"
                >
                  Salvar Nova Senha
                </button>
              </form>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl border border-rose-200 transition flex items-center space-x-1.5"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Sair da Minha Conta</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Fechar
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
