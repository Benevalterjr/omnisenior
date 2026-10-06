'use client';

import React, { useState, useEffect } from 'react';
import { 
  Resident, 
  MedicationLog, 
  MedicationLogStatus, 
  UserRole 
} from '@/types/ilpi';
import { useAuth } from '@/contexts/AuthContext';
import { 
  subscribeResidents, 
  subscribeResidentMedicationLogs, 
  checkMedication 
} from '@/lib/firebaseService';
import { Navbar } from '@/components/Navbar';
import { DutyBoard } from '@/components/DutyBoard';
import { ResidentesListView } from '@/components/ResidentesListView';
import { EstoqueView } from '@/components/EstoqueView';
import { ResidentDetailModal } from '@/components/ResidentDetailModal';
import { RegistroRotinaModal } from '@/components/RegistroRotinaModal';
import { NovoResidenteModal } from '@/components/NovoResidenteModal';
import { CheckMedicationModal } from '@/components/CheckMedicationModal';
import { EscalasGeriatricasModal } from '@/components/EscalasGeriatricasModal';
import { CalendarView } from '@/components/Calendar/CalendarView';
import { AdminDashboardView } from '@/components/Admin/AdminDashboardView';
import { LoginView } from '@/components/Auth/LoginView';
import { HeartHandshake } from 'lucide-react';

export default function HomePage() {
  const { currentUser, isAuthenticated, isAuthReady } = useAuth();
  
  // Navigation
  const [activeTab, setActiveTab] = useState<'plantao' | 'rotina' | 'agenda' | 'residentes' | 'estoque' | 'admin'>('plantao');

  // Main State
  const [residents, setResidents] = useState<Resident[]>([]);
  const [medicationLogsMap, setMedicationLogsMap] = useState<Record<string, MedicationLog[]>>({});

  // Modals state
  const [selectedResidentForModal, setSelectedResidentForModal] = useState<Resident | null>(null);
  const [selectedResidentForScales, setSelectedResidentForScales] = useState<Resident | null>(null);
  const [isNewResidentModalOpen, setIsNewResidentModalOpen] = useState(false);
  const [isQuickRoutineModalOpen, setIsQuickRoutineModalOpen] = useState(false);
  const [quickRoutineResidentId, setQuickRoutineResidentId] = useState<string | undefined>(undefined);
  
  // Separate CheckMedicationModal state if opened from ResidentDetailModal
  const [checkMedContext, setCheckMedContext] = useState<{
    resident: Resident;
    log: MedicationLog;
  } | null>(null);

  // Subscribe to Residents in real-time
  useEffect(() => {
    const unsubscribe = subscribeResidents((data) => {
      setResidents(data);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Medication Logs for all residents
  useEffect(() => {
    if (residents.length === 0) return;

    const unsubscribes: Array<() => void> = [];

    residents.forEach((resident) => {
      const unsub = subscribeResidentMedicationLogs(resident.id, (logs) => {
        setMedicationLogsMap((prev) => ({
          ...prev,
          [resident.id]: logs
        }));
      });
      unsubscribes.push(unsub);
    });

    return () => {
      unsubscribes.forEach((u) => u());
    };
  }, [residents]);

  // Handler for Checking Medication
  const handleCheckMedication = async (
    residentId: string,
    logId: string,
    user: { uid: string; name: string; role?: UserRole },
    status: MedicationLogStatus,
    notes?: string
  ): Promise<boolean> => {
    // Optimistic UI update
    setMedicationLogsMap((prev) => {
      const currentLogs = prev[residentId] || [];
      const updatedLogs = currentLogs.map((l) => {
        if (l.id === logId) {
          return {
            ...l,
            status,
            administeredAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            administeredBy: user as any,
            notes: notes || l.notes
          };
        }
        return l;
      });
      return { ...prev, [residentId]: updatedLogs };
    });

    return await checkMedication(residentId, logId, user, status, notes);
  };

  const handleOpenQuickRoutine = (resId?: string) => {
    setQuickRoutineResidentId(resId);
    setIsQuickRoutineModalOpen(true);
  };

  // Se a autenticação estiver carregando sessão anterior do localStorage
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-400"></div>
        <p className="text-xs text-slate-400 font-medium">Iniciando OmniSenior ILPI...</p>
      </div>
    );
  }

  // Ninguém pode acessar o aplicativo sem usuário e senha válidos
  if (!isAuthenticated || !currentUser) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewResident={() => setIsNewResidentModalOpen(true)}
        onOpenQuickRoutine={() => handleOpenQuickRoutine()}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        
        {/* TAB 1: Quadro de Plantão (Medicação & Alertas) */}
        {activeTab === 'plantao' && (
          <DutyBoard
            residents={residents}
            medicationLogsMap={medicationLogsMap}
            onCheckMedication={handleCheckMedication}
            onOpenResidentModal={(resident) => setSelectedResidentForModal(resident)}
            onOpenQuickRoutine={handleOpenQuickRoutine}
          />
        )}

        {/* TAB 2: Registro de Rotina (Cuidador em Quarto) */}
        {activeTab === 'rotina' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                  <HeartHandshake className="w-5 h-5 text-teal-600" />
                  <span>Fluxo Rápido de Cuidados de Rotina</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Selecione um residente abaixo para preencher o banho, alimentação, evacuação e hidratação em menos de 1 minuto.
                </p>
              </div>

              <button
                onClick={() => handleOpenQuickRoutine()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-xs shrink-0 self-start sm:self-auto"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Preencher Rotina Agora</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {residents.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-emerald-300 transition flex flex-col justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={r.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=0d9488&color=fff`}
                      alt={r.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{r.name}</h4>
                      <p className="text-xs text-slate-500">Quarto {r.room} • Leito {r.bed}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Dieta: {r.dietType}</span>
                    <button
                      onClick={() => handleOpenQuickRoutine(r.id)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 transition flex items-center space-x-1"
                    >
                      <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Registrar (&lt; 1 min)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Agenda & Calendário (Google Calendar Style) */}
        {activeTab === 'agenda' && (
          <CalendarView residents={residents} />
        )}

        {/* TAB 4: Residentes & Prontuários */}
        {activeTab === 'residentes' && (
          <ResidentesListView
            residents={residents}
            onOpenResidentModal={(resident) => setSelectedResidentForModal(resident)}
            onOpenQuickRoutine={handleOpenQuickRoutine}
            onOpenNewResident={() => setIsNewResidentModalOpen(true)}
            onOpenScalesModal={(resident) => setSelectedResidentForScales(resident)}
          />
        )}

        {/* TAB 5: Estoque Individual */}
        {activeTab === 'estoque' && (
          <EstoqueView residents={residents} />
        )}

        {/* TAB 6: Diretoria & Acessos (Administração ILPI & RBAC) */}
        {activeTab === 'admin' && (
          <AdminDashboardView />
        )}
      </main>

      {/* Floating Action Button for Mobile Caregivers */}
      <button
        onClick={() => handleOpenQuickRoutine()}
        className="sm:hidden fixed bottom-6 right-6 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-2xl z-30 flex items-center justify-center transition"
        title="Registrar Rotina do Residente"
      >
        <HeartHandshake className="w-6 h-6" />
      </button>

      {/* MODAL 1: Ficha / Prontuário do Residente */}
      {selectedResidentForModal && (
        <ResidentDetailModal
          resident={selectedResidentForModal}
          medicationLogs={medicationLogsMap[selectedResidentForModal.id] || []}
          isOpen={true}
          onClose={() => setSelectedResidentForModal(null)}
          onCheckMedicationClick={(resident, log) => {
            setCheckMedContext({ resident, log });
          }}
        />
      )}

      {/* MODAL 2: Registro Rápido de Rotina (< 1 min) */}
      <RegistroRotinaModal
        residents={residents}
        initialResidentId={quickRoutineResidentId}
        isOpen={isQuickRoutineModalOpen}
        onClose={() => {
          setIsQuickRoutineModalOpen(false);
          setQuickRoutineResidentId(undefined);
        }}
        onSuccess={() => {
          // Trigger any refresh if needed
        }}
      />

      {/* MODAL 3: Cadastro de Novo Residente */}
      <NovoResidenteModal
        isOpen={isNewResidentModalOpen}
        onClose={() => setIsNewResidentModalOpen(false)}
        onSuccess={(newResident) => {
          setResidents((prev) => [newResident, ...prev]);
        }}
      />

      {/* MODAL 4: Checagem de Medicamento (invocado a partir do Prontuário) */}
      {checkMedContext && (
        <CheckMedicationModal
          resident={checkMedContext.resident}
          log={checkMedContext.log}
          isOpen={true}
          onClose={() => setCheckMedContext(null)}
          onConfirm={async (resId, logId, status, notes) => {
            await handleCheckMedication(
              resId, 
              logId, 
              { uid: currentUser.id, name: currentUser.name, role: currentUser.role }, 
              status, 
              notes
            );
          }}
        />
      )}

      {/* MODAL 5: Escalas Geriátricas Automatizadas */}
      {selectedResidentForScales && (
        <EscalasGeriatricasModal
          resident={selectedResidentForScales}
          isOpen={true}
          onClose={() => setSelectedResidentForScales(null)}
          onSaved={() => {
            // refresh data if needed
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} OmniSenior — Sistema Especializado para ILPI. Integrado com Next.js, Firebase Firestore e Netlify.</p>
        </div>
      </footer>
    </div>
  );
}
