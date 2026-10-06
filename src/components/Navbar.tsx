'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  HeartHandshake, 
  Clock, 
  UserCheck, 
  CloudCheck, 
  RotateCw, 
  ShieldAlert, 
  Stethoscope, 
  Users, 
  ClipboardCheck, 
  Package, 
  PlusCircle,
  Menu,
  X,
  Calendar,
  ShieldCheck,
  LogOut,
  User
} from 'lucide-react';
import { seedFirestoreDatabase } from '@/lib/firebaseService';
import { useNtpClock } from '@/lib/ntpService';
import { ROLE_LABELS } from '@/lib/permissionsService';
import { MeuPerfilModal } from './Auth/MeuPerfilModal';

interface NavbarProps {
  activeTab: 'plantao' | 'rotina' | 'agenda' | 'residentes' | 'estoque' | 'admin';
  setActiveTab: (tab: 'plantao' | 'rotina' | 'agenda' | 'residentes' | 'estoque' | 'admin') => void;
  onOpenNewResident: () => void;
  onOpenQuickRoutine: () => void;
}

export function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenNewResident, 
  onOpenQuickRoutine 
}: NavbarProps) {
  const { currentUser, role, shift, canManageResidents, canAccessAdmin, logout } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Relógio Atômico Oficial sincronizado com NTP.br (NIC.br / Observatório Nacional)
  const { timeStr, dateStr, isMounted, isSynced, isSyncing, source, offsetMs, resync: resyncNtp } = useNtpClock();

  if (!currentUser) return null;
  const roleBadge = ROLE_LABELS[currentUser.role] || ROLE_LABELS.cuidador;

  const handleSyncData = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await seedFirestoreDatabase();
      setSyncFeedback(res.message);
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err: any) {
      setSyncFeedback('Erro ao conectar ao Firestore.');
    } finally {
      setSyncing(false);
    }
  };

  const getShiftBadge = () => {
    switch (shift) {
      case 'manha':
        return { label: 'Turno Manhã (07h - 13h)', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'tarde':
        return { label: 'Turno Tarde (13h - 19h)', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'noite':
        return { label: 'Turno Noite (19h - 07h)', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    }
  };

  const shiftInfo = getShiftBadge();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      {/* Top Banner / Healthcare Brand & Quick Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">OmniSenior</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  ILPI Care
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Gestão Clínica & Aprazamento em Tempo Real
              </p>
            </div>
          </div>

          {/* Center Info: Relógio Atômico Oficial NTP.br (Hora Legal Brasileira) & Shift Badge */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={resyncNtp}
              suppressHydrationWarning
              title={`Sincronizado com ${source}. Desvio local: ${offsetMs >= 0 ? '+' : ''}${offsetMs}ms. Clique para ressincronizar com o NTP.br.`}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 flex items-center space-x-2 shadow-2xs transition group"
            >
              <div className="flex items-center space-x-1">
                <span className={`w-2 h-2 rounded-full ${isSynced ? 'bg-emerald-500' : 'bg-amber-500'} ${isSyncing ? 'animate-ping' : ''}`}></span>
              </div>
              <span suppressHydrationWarning className="font-mono font-bold tracking-tight text-slate-900">
                {isMounted ? `${dateStr} • ${timeStr}` : '--/--/---- • --:--:--'}
              </span>
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200">
                NTP.br
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-white px-1 py-0.2 rounded border border-slate-200">
                GMT-03
              </span>
            </button>

            <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1.5 ${shiftInfo.color}`}>
              <span>{shiftInfo.label}</span>
            </div>
          </div>

          {/* Mobile compact NTP.br badge */}
          <div className="flex md:hidden items-center">
            <button
              onClick={resyncNtp}
              suppressHydrationWarning
              title={`Sincronizado com ${source}. Desvio: ${offsetMs >= 0 ? '+' : ''}${offsetMs}ms. Toque para sincronizar.`}
              className="px-2 py-1 rounded-full text-[11px] font-bold bg-slate-50 border border-slate-200 flex items-center space-x-1 shadow-2xs active:scale-95 transition"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSynced ? 'bg-emerald-500' : 'bg-amber-500'} ${isSyncing ? 'animate-ping' : ''}`} />
              <span suppressHydrationWarning className="font-mono font-bold text-slate-800">
                {isMounted ? timeStr.slice(0, 5) : '--:--'}
              </span>
              <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1 rounded">
                NTP.br
              </span>
            </button>
          </div>

          {/* Right Actions: Seed Firestore & User Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Sync / Seed button (Desktop) */}
            <button
              onClick={handleSyncData}
              disabled={syncing}
              title="Sincronizar base inicial de demonstração no Firebase"
              className="hidden sm:flex text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 items-center space-x-1 transition disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-teal-600' : ''}`} />
              <span className="hidden lg:inline">{syncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>

            {/* Logged-in User Profile Badge */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center space-x-2 py-1 px-1.5 sm:px-2.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/90 border border-slate-200 transition text-left cursor-pointer group shadow-2xs active:scale-95"
              title="Meu Perfil: clique para ver suas credenciais e permissões"
            >
              <img
                src={currentUser.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=7c3aed&color=fff`}
                alt={currentUser.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-cover border border-slate-200 shadow-2xs group-hover:ring-2 group-hover:ring-purple-400 transition"
              />
              <div className="hidden sm:block">
                <span className="text-xs font-bold text-slate-800 block leading-tight max-w-[130px] truncate">
                  {currentUser.name}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border inline-block ${roleBadge.color}`}>
                  {roleBadge.badge}
                </span>
              </div>
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Encerrar sessão / Sair do sistema"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition flex items-center space-x-1 active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold hidden md:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sync feedback alert if any */}
      {syncFeedback && (
        <div className="bg-emerald-600 text-white text-xs text-center py-1.5 px-4 animate-fade-in flex items-center justify-center space-x-2">
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Navigation Sub-bar (Desktop only - hides on mobile to give full screen to clinical actions) */}
      <div className="hidden md:block bg-slate-50/80 border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('plantao')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                activeTab === 'plantao'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Quadro de Plantão</span>
            </button>

            <button
              onClick={() => setActiveTab('rotina')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                activeTab === 'rotina'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Registro de Rotina (Cuidador)</span>
            </button>

            <button
              onClick={() => setActiveTab('agenda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                activeTab === 'agenda'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Agenda & Calendário</span>
            </button>

            <button
              onClick={() => setActiveTab('residentes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                activeTab === 'residentes'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Residentes & Prontuários</span>
            </button>

            <button
              onClick={() => setActiveTab('estoque')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                activeTab === 'estoque'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Estoque Individual</span>
            </button>

            {canAccessAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                  activeTab === 'admin'
                    ? 'bg-purple-700 text-white shadow-sm'
                    : 'text-purple-700 hover:text-purple-900 hover:bg-purple-100/70 bg-purple-50/70 border border-purple-200'
                }`}
                title="Área do Diretor: Equipe, Permissões RBAC, Leitos e Instituição"
              >
                <ShieldCheck className={`w-4 h-4 ${activeTab === 'admin' ? 'text-white' : 'text-purple-600'}`} />
                <span>Diretoria & Acessos</span>
              </button>
            )}
          </nav>

          {/* Quick Action Buttons */}
          <div className="hidden sm:flex items-center space-x-2 py-2">
            <button
              onClick={onOpenQuickRoutine}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-sm transition"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Registrar Rotina (&lt; 1 min)</span>
            </button>

            {canManageResidents && (
              <button
                onClick={onOpenNewResident}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-sm transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Novo Residente</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Bottom Sheet */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div 
            className="absolute inset-0" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="relative bg-white rounded-t-3xl border-t border-slate-200 p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto pb-8">
            {/* Pull indicator */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto -mt-1 mb-2" />
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <img
                  src={currentUser.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=7c3aed&color=fff`}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <div className="font-bold text-sm text-slate-900">{currentUser.name}</div>
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border inline-block ${roleBadge.color}`}>
                      {roleBadge.badge}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      • {shiftInfo.label.split(' ')[1] || 'Turno'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Primary Actions Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => { onOpenQuickRoutine(); setMobileMenuOpen(false); }}
                className="bg-emerald-600 active:bg-emerald-700 text-white p-3 rounded-2xl text-xs font-bold flex flex-col items-center justify-center space-y-1.5 shadow-sm touch-manipulation active:scale-95 transition"
              >
                <HeartHandshake className="w-5 h-5" />
                <span>Rotina Rápida</span>
              </button>

              {canManageResidents && (
                <button
                  onClick={() => { onOpenNewResident(); setMobileMenuOpen(false); }}
                  className="bg-slate-800 active:bg-slate-900 text-white p-3 rounded-2xl text-xs font-bold flex flex-col items-center justify-center space-y-1.5 shadow-sm touch-manipulation active:scale-95 transition"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Novo Residente</span>
                </button>
              )}

              <button
                onClick={() => { setActiveTab('estoque'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-2xl text-xs font-bold flex flex-col items-center justify-center space-y-1.5 border touch-manipulation active:scale-95 transition ${
                  activeTab === 'estoque'
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <Package className="w-5 h-5" />
                <span>Estoque Individual</span>
              </button>

              {canAccessAdmin && (
                <button
                  onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                  className={`p-3 rounded-2xl text-xs font-bold flex flex-col items-center justify-center space-y-1.5 border touch-manipulation active:scale-95 transition ${
                    activeTab === 'admin'
                      ? 'bg-purple-700 text-white border-purple-700'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Diretoria & Acessos</span>
                </button>
              )}
            </div>

            {/* Secondary Options List */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => { setIsProfileModalOpen(true); setMobileMenuOpen(false); }}
                className="w-full bg-slate-50 active:bg-slate-100 text-slate-800 py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-between border border-slate-200 transition"
              >
                <span className="flex items-center space-x-2.5">
                  <User className="w-4 h-4 text-purple-600" />
                  <span>Meu Perfil & Credenciais</span>
                </span>
                <span className="text-[10px] text-slate-400">Ver permissões ›</span>
              </button>

              <button
                onClick={handleSyncData}
                disabled={syncing}
                className="w-full bg-slate-50 active:bg-slate-100 text-slate-700 py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border border-slate-200 transition disabled:opacity-50"
              >
                <span className="flex items-center space-x-2.5">
                  <RotateCw className={`w-4 h-4 ${syncing ? 'animate-spin text-teal-600' : 'text-slate-500'}`} />
                  <span>{syncing ? 'Sincronizando...' : 'Sincronizar Firestore'}</span>
                </span>
                <span className="text-[10px] text-slate-400">Dados base ›</span>
              </button>

              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full bg-rose-50 active:bg-rose-100 text-rose-800 py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border border-rose-200 transition"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Sair da Conta (Logout)</span>
              </button>
            </div>

            {/* NTP.br Clock info on drawer footer */}
            <div className="pt-2 text-center text-[10px] text-slate-400 font-mono">
              Horário Oficial: {dateStr} • {timeStr} (NTP.br)
            </div>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar (100% Mobile-First TabBar) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => { setActiveTab('plantao'); setMobileMenuOpen(false); }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition touch-manipulation active:scale-95 ${
            activeTab === 'plantao'
              ? 'text-teal-700 font-bold bg-teal-50/80'
              : 'text-slate-500 font-medium hover:text-slate-800'
          }`}
        >
          <ClipboardCheck className={`w-5 h-5 ${activeTab === 'plantao' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Plantão</span>
        </button>

        <button
          onClick={() => { setActiveTab('rotina'); setMobileMenuOpen(false); }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition touch-manipulation active:scale-95 ${
            activeTab === 'rotina'
              ? 'text-teal-700 font-bold bg-teal-50/80'
              : 'text-slate-500 font-medium hover:text-slate-800'
          }`}
        >
          <HeartHandshake className={`w-5 h-5 ${activeTab === 'rotina' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Rotina</span>
        </button>

        <button
          onClick={() => { setActiveTab('agenda'); setMobileMenuOpen(false); }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition touch-manipulation active:scale-95 ${
            activeTab === 'agenda'
              ? 'text-blue-700 font-bold bg-blue-50/80'
              : 'text-slate-500 font-medium hover:text-slate-800'
          }`}
        >
          <Calendar className={`w-5 h-5 ${activeTab === 'agenda' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Agenda</span>
        </button>

        <button
          onClick={() => { setActiveTab('residentes'); setMobileMenuOpen(false); }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition touch-manipulation active:scale-95 ${
            activeTab === 'residentes'
              ? 'text-teal-700 font-bold bg-teal-50/80'
              : 'text-slate-500 font-medium hover:text-slate-800'
          }`}
        >
          <Users className={`w-5 h-5 ${activeTab === 'residentes' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Residentes</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition touch-manipulation active:scale-95 ${
            mobileMenuOpen || activeTab === 'estoque' || activeTab === 'admin'
              ? 'text-purple-700 font-bold bg-purple-50/80'
              : 'text-slate-500 font-medium hover:text-slate-800'
          }`}
        >
          <Menu className={`w-5 h-5 ${mobileMenuOpen || activeTab === 'estoque' || activeTab === 'admin' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">
            {activeTab === 'admin' ? 'Diretoria' : activeTab === 'estoque' ? 'Estoque' : 'Mais'}
          </span>
        </button>
      </nav>

      {/* Modal Meu Perfil do Colaborador Logado */}
      <MeuPerfilModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
}
