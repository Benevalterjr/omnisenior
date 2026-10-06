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
  Calendar
} from 'lucide-react';
import { seedFirestoreDatabase } from '@/lib/firebaseService';
import { useNtpClock } from '@/lib/ntpService';

interface NavbarProps {
  activeTab: 'plantao' | 'rotina' | 'agenda' | 'residentes' | 'estoque';
  setActiveTab: (tab: 'plantao' | 'rotina' | 'agenda' | 'residentes' | 'estoque') => void;
  onOpenNewResident: () => void;
  onOpenQuickRoutine: () => void;
}

export function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenNewResident, 
  onOpenQuickRoutine 
}: NavbarProps) {
  const { currentUser, role, switchUser, switchRole, shift, availableUsers, canManageResidents } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Relógio Atômico Oficial sincronizado com NTP.br (NIC.br / Observatório Nacional)
  const { timeStr, dateStr, isMounted, isSynced, isSyncing, source, offsetMs, resync: resyncNtp } = useNtpClock();

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

          {/* Right Actions: Seed Firestore & User Switcher */}
          <div className="flex items-center space-x-3">
            
            {/* Sync / Seed button */}
            <button
              onClick={handleSyncData}
              disabled={syncing}
              title="Sincronizar base inicial de demonstração no Firebase"
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center space-x-1 transition disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-teal-600' : ''}`} />
              <span className="hidden lg:inline">{syncing ? 'Sincronizando...' : 'Sincronizar Firestore'}</span>
            </button>

            {/* Quick Role Switcher Pill */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <label htmlFor="user-select" className="sr-only">Trocar Perfil</label>
              <select
                id="user-select"
                value={currentUser.id}
                onChange={(e) => switchUser(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1 pl-1 py-1"
              >
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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

      {/* Navigation Sub-bar */}
      <div className="bg-slate-50/80 border-t border-slate-200 px-4 sm:px-6 lg:px-8">
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-3">
          <div className={`p-2.5 rounded-lg text-xs font-medium border flex items-center justify-between ${shiftInfo.color}`}>
            <span className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4" />
              <span>{shiftInfo.label}</span>
            </span>
          </div>

          <div className="flex flex-col space-y-2">
            <button
              onClick={() => { onOpenQuickRoutine(); setMobileMenuOpen(false); }}
              className="w-full bg-emerald-600 text-white py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Registro de Rotina Rápido</span>
            </button>

            {canManageResidents && (
              <button
                onClick={() => { onOpenNewResident(); setMobileMenuOpen(false); }}
                className="w-full bg-slate-800 text-white py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Cadastrar Novo Residente</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
