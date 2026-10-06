'use client';

import React, { useState, useEffect } from 'react';
import { 
  Resident, 
  Prescription, 
  MedicationLog, 
  Evolution, 
  IndividualInventoryItem, 
  UserRole,
  EvolutionType,
  GeriatricAssessment,
  TimelineEvent
} from '@/types/ilpi';
import { useAuth } from '@/contexts/AuthContext';
import { 
  X, 
  AlertTriangle, 
  Phone, 
  FileText, 
  Pill, 
  Calendar, 
  Activity, 
  Package, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  PlusCircle,
  ShieldAlert,
  Sparkles,
  History
} from 'lucide-react';
import { 
  subscribeResidentPrescriptions, 
  subscribeResidentEvolutions, 
  subscribeResidentInventory,
  subscribeResidentAssessments,
  subscribeResidentTimeline,
  createEvolution,
  updateInventoryQuantity,
  createPrescription
} from '@/lib/firebaseService';
import { EscalasGeriatricasModal } from './EscalasGeriatricasModal';
import { RegistroRotinaModal } from './RegistroRotinaModal';
import { DailyTimelineView } from './Timeline/DailyTimelineView';

interface ResidentDetailModalProps {
  resident: Resident;
  medicationLogs: MedicationLog[];
  isOpen: boolean;
  onClose: () => void;
  onCheckMedicationClick: (resident: Resident, log: MedicationLog) => void;
}

export function ResidentDetailModal({
  resident,
  medicationLogs,
  isOpen,
  onClose,
  onCheckMedicationClick
}: ResidentDetailModalProps) {
  const { currentUser, canManagePrescriptions, canEditInventory } = useAuth();
  const [activeTab, setActiveTab] = useState<'timeline' | 'prescricoes' | 'checagens' | 'evolucoes' | 'estoque' | 'escalas'>('timeline');

  // Subcollections state with real-time listeners
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [evolutions, setEvolutions] = useState<Evolution[]>([]);
  const [inventory, setInventory] = useState<IndividualInventoryItem[]>([]);
  const [assessments, setAssessments] = useState<GeriatricAssessment[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [isScalesModalOpen, setIsScalesModalOpen] = useState(false);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);

  // New Evolution form state
  const [newEvoType, setNewEvoType] = useState<EvolutionType>('enfermagem');
  const [newEvoText, setNewEvoText] = useState('');
  const [newBp, setNewBp] = useState('');
  const [newTemp, setNewTemp] = useState('');
  const [newGlucose, setNewGlucose] = useState('');
  const [newO2, setNewO2] = useState('');
  const [newHr, setNewHr] = useState('');
  const [savingEvo, setSavingEvo] = useState(false);

  // New Prescription Modal / form state
  const [showNewPrescModal, setShowNewPrescModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newRoute, setNewRoute] = useState<'oral' | 'sublingual' | 'topico' | 'injetavel'>('oral');
  const [newTimes, setNewTimes] = useState('08:00, 20:00');
  const [newInstructions, setNewInstructions] = useState('');
  const [savingPresc, setSavingPresc] = useState(false);

  useEffect(() => {
    if (!resident.id) return;
    const unsubPresc = subscribeResidentPrescriptions(resident.id, setPrescriptions);
    const unsubEvo = subscribeResidentEvolutions(resident.id, setEvolutions);
    const unsubInv = subscribeResidentInventory(resident.id, setInventory);
    const unsubAssess = subscribeResidentAssessments(resident.id, setAssessments);
    const unsubTimeline = subscribeResidentTimeline(resident.id, setTimelineEvents);

    return () => {
      unsubPresc();
      unsubEvo();
      unsubInv();
      unsubAssess();
      unsubTimeline();
    };
  }, [resident.id]);

  if (!isOpen) return null;

  const handleAddEvolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvoText.trim()) return;

    setSavingEvo(true);
    try {
      const vitalSigns: any = {};
      if (newBp) vitalSigns.bp = newBp;
      if (newTemp) vitalSigns.temp = parseFloat(newTemp);
      if (newGlucose) vitalSigns.glucose = parseInt(newGlucose, 10);
      if (newO2) vitalSigns.o2 = parseInt(newO2, 10);
      if (newHr) vitalSigns.hr = parseInt(newHr, 10);

      await createEvolution(resident.id, {
        author: {
          uid: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          registry: currentUser.registry
        },
        date: `${new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} às ${new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })}`,
        type: newEvoType,
        text: newEvoText.trim(),
        vitalSigns: Object.keys(vitalSigns).length > 0 ? vitalSigns : undefined
      });

      setNewEvoText('');
      setNewBp('');
      setNewTemp('');
      setNewGlucose('');
      setNewO2('');
      setNewHr('');
    } finally {
      setSavingEvo(false);
    }
  };

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newDosage.trim()) return;

    setSavingPresc(true);
    try {
      const timesArray = newTimes.split(',').map(t => t.trim()).filter(Boolean);
      await createPrescription(resident.id, {
        medicationName: newMedName.trim(),
        dosage: newDosage.trim(),
        route: newRoute,
        scheduleTimes: timesArray.length > 0 ? timesArray : ['08:00'],
        startDate: new Date().toISOString().split('T')[0],
        status: 'active',
        instructions: newInstructions.trim() || undefined,
        prescribedBy: {
          uid: currentUser.id,
          name: currentUser.name,
          registry: currentUser.registry
        }
      });
      setShowNewPrescModal(false);
      setNewMedName('');
      setNewDosage('');
      setNewInstructions('');
    } finally {
      setSavingPresc(false);
    }
  };

  const handleStockChange = async (item: IndividualInventoryItem, delta: number) => {
    const newQty = Math.max(0, item.currentQuantity + delta);
    await updateInventoryQuantity(resident.id, item.id, newQty);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[95vh] sm:max-h-[92vh] flex flex-col">
        
        {/* Mobile Pull Bar Indicator */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-500 rounded-full mx-auto my-1.5 shrink-0" />

        {/* Header Profile Bar */}
        <div className="bg-slate-900 p-4 sm:p-6 text-white shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={resident.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(resident.name)}&background=0d9488&color=fff`}
                alt={resident.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shadow-md"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg sm:text-xl font-bold leading-tight">{resident.name}</h2>
                  <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                    Quarto {resident.room} • Leito {resident.bed}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Nascimento: <strong>{resident.birthDate.includes('-') ? resident.birthDate.split('-').reverse().join('/') : resident.birthDate}</strong></span>
                  <span>Dieta: <strong>{resident.dietType}</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Emergency Contacts & Allergies in Header */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-3">
              <span className="text-slate-400">Contatos de Emergência:</span>
              {resident.emergencyContacts.map((c, idx) => (
                <a
                  key={idx}
                  href={`tel:${c.phone}`}
                  className="bg-slate-800 hover:bg-slate-700 text-teal-300 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 transition"
                >
                  <Phone className="w-3 h-3 text-teal-400" />
                  <span>{c.name}: {c.phone}</span>
                </a>
              ))}
            </div>

            {resident.allergies && resident.allergies.length > 0 && resident.allergies[0] !== 'Nenhuma conhecida' && (
              <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 px-3 py-1 rounded-lg flex items-center space-x-1.5 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Alergias: {resident.allergies.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-slate-50 px-3 sm:px-6 flex space-x-2 sm:space-x-4 shrink-0 overflow-x-auto no-scrollbar touch-manipulation">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-1 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition whitespace-nowrap shrink-0 touch-manipulation ${
              activeTab === 'timeline'
                ? 'border-teal-600 text-teal-700 bg-white sm:bg-transparent rounded-t-lg sm:rounded-none px-2 sm:px-1'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 text-teal-600" />
            <span>Linha do Tempo 48h ({timelineEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('prescricoes')}
            className={`py-3 px-1 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition whitespace-nowrap shrink-0 touch-manipulation ${
              activeTab === 'prescricoes'
                ? 'border-teal-600 text-teal-700 bg-white sm:bg-transparent rounded-t-lg sm:rounded-none px-2 sm:px-1'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Prescrições Médicas ({prescriptions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('checagens')}
            className={`py-3 px-1 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition whitespace-nowrap shrink-0 touch-manipulation ${
              activeTab === 'checagens'
                ? 'border-teal-600 text-teal-700 bg-white sm:bg-transparent rounded-t-lg sm:rounded-none px-2 sm:px-1'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Aprazamento & Checagens ({medicationLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('evolucoes')}
            className={`py-3 px-1 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition whitespace-nowrap shrink-0 touch-manipulation ${
              activeTab === 'evolucoes'
                ? 'border-teal-600 text-teal-700 bg-white sm:bg-transparent rounded-t-lg sm:rounded-none px-2 sm:px-1'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Evoluções & Sinais Vitais ({evolutions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('estoque')}
            className={`py-3 px-1 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition whitespace-nowrap shrink-0 touch-manipulation ${
              activeTab === 'estoque'
                ? 'border-teal-600 text-teal-700 bg-white sm:bg-transparent rounded-t-lg sm:rounded-none px-2 sm:px-1'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Estoque Individual ({inventory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('escalas')}
            className={`py-3 px-1 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition whitespace-nowrap shrink-0 touch-manipulation ${
              activeTab === 'escalas'
                ? 'border-teal-600 text-teal-700 bg-white sm:bg-transparent rounded-t-lg sm:rounded-none px-2 sm:px-1'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Escalas Geriátricas ({assessments.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 0: LINHA DO TEMPO 48H (PRONTUÁRIO DIÁRIO UNIFICADO) */}
          {activeTab === 'timeline' && (
            <DailyTimelineView
              resident={resident}
              events={timelineEvents}
              onOpenQuickRoutine={() => setIsRoutineModalOpen(true)}
            />
          )}

          {/* TAB 1: PRESCRIÇÕES */}
          {activeTab === 'prescricoes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Prescrições Médicas Ativas</h3>
                  <p className="text-xs text-slate-500">Horários de aprazamento e dosagens</p>
                </div>
                {canManagePrescriptions && (
                  <button
                    onClick={() => setShowNewPrescModal(true)}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Prescrição</span>
                  </button>
                )}
              </div>

              {prescriptions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhuma prescrição ativa cadastrada.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {prescriptions.map((p) => (
                    <div key={p.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white transition shadow-2xs">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-sm text-slate-800">{p.medicationName}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Dose: <strong>{p.dosage}</strong> • Via: <strong>{p.route?.toUpperCase()}</strong>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {p.status === 'active' ? 'Ativa' : 'Suspensa'}
                        </span>
                      </div>

                      <div className="mt-3">
                        <span className="text-[11px] font-semibold text-slate-500">Horários de Checagem:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {p.scheduleTimes.map((t, idx) => (
                            <span key={idx} className="bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-lg">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {p.instructions && (
                        <div className="mt-2.5 text-xs text-slate-600 italic bg-white p-2 rounded-lg border border-slate-100">
                          &ldquo;{p.instructions}&rdquo;
                        </div>
                      )}

                      {p.prescribedBy && (
                        <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-400 flex items-center justify-between">
                          <span>Prescrito por: {p.prescribedBy.name}</span>
                          <span>{p.prescribedBy.registry}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: APRAZAMENTO & CHECAGENS */}
          {activeTab === 'checagens' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Registro de Aprazamento de Hoje</h3>
                  <p className="text-xs text-slate-500">Checagem de administração de medicamentos</p>
                </div>
              </div>

              {medicationLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhum registro de checagem para hoje.</p>
              ) : (
                <div className="space-y-2.5">
                  {medicationLogs.map((log) => {
                    const isDone = log.status === 'administered';
                    const isRefused = log.status === 'refused';
                    const isDelayed = log.status === 'delayed';

                    return (
                      <div
                        key={log.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition ${
                          isDone ? 'bg-emerald-50/50 border-emerald-200' :
                          isRefused ? 'bg-rose-50/50 border-rose-200' :
                          isDelayed ? 'bg-amber-50/50 border-amber-200' :
                          'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`text-xs font-black px-2.5 py-1.5 rounded-lg ${
                            isDone ? 'bg-emerald-100 text-emerald-800' :
                            isRefused ? 'bg-rose-100 text-rose-800' :
                            isDelayed ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {log.scheduledTime}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-800">{log.medicationName}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {isDone ? (
                                <span className="text-emerald-700 font-medium">
                                  ✓ Administrado às {log.administeredAt ? String(log.administeredAt) : 'horário correto'}
                                  {log.administeredBy ? ` por ${log.administeredBy.name} (${log.administeredBy.role})` : ''}
                                </span>
                              ) : isRefused ? (
                                <span className="text-rose-700 font-semibold">
                                  ✗ Recusado pelo residente: {log.notes}
                                </span>
                              ) : isDelayed ? (
                                <span className="text-amber-700 font-semibold">
                                  ⏳ Adiado: {log.notes || 'Aguardando'}
                                </span>
                              ) : (
                                <span className="text-slate-500">Pendente de administração</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onCheckMedicationClick(resident, log)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
                        >
                          {isDone ? 'Ver / Editar' : 'Checar Agora'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EVOLUÇÕES & SINAIS VITAIS */}
          {activeTab === 'evolucoes' && (
            <div className="space-y-6">
              
              {/* Form to Add New Evolution */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <PlusCircle className="w-4 h-4 text-teal-600" />
                  <span>Nova Evolução Multiprofissional</span>
                </h4>

                <form onSubmit={handleAddEvolution} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Categoria:</label>
                      <select
                        value={newEvoType}
                        onChange={(e) => setNewEvoType(e.target.value as any)}
                        className="w-full text-xs p-2 border border-slate-300 rounded-lg mt-0.5 bg-white font-medium"
                      >
                        <option value="enfermagem">Enfermagem</option>
                        <option value="cuidador">Cuidador</option>
                        <option value="medica">Médica</option>
                        <option value="fisioterapia">Fisioterapia</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-slate-500 pt-5">
                      <span>Profissional: <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()})</span>
                    </div>
                  </div>

                  {/* Optional Vital Signs fields */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">PA (mmHg)</label>
                      <input
                        type="text"
                        placeholder="120/80"
                        value={newBp}
                        onChange={(e) => setNewBp(e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">Glicemia (mg/dL)</label>
                      <input
                        type="number"
                        placeholder="104"
                        value={newGlucose}
                        onChange={(e) => setNewGlucose(e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">Temp (°C)</label>
                      <input
                        type="text"
                        placeholder="36.5"
                        value={newTemp}
                        onChange={(e) => setNewTemp(e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">Sat. O2 (%)</label>
                      <input
                        type="number"
                        placeholder="97"
                        value={newO2}
                        onChange={(e) => setNewO2(e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">FC (bpm)</label>
                      <input
                        type="number"
                        placeholder="74"
                        value={newHr}
                        onChange={(e) => setNewHr(e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Descrição Clínica / Ocorrências:</label>
                    <textarea
                      rows={3}
                      value={newEvoText}
                      onChange={(e) => setNewEvoText(e.target.value)}
                      placeholder="Descreva o estado geral, diurese, alimentação, padrão respiratório, humor..."
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg mt-0.5 focus:outline-teal-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingEvo}
                      className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs disabled:opacity-50"
                    >
                      {savingEvo ? 'Salvando...' : 'Salvar Evolução'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Evolutions History List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Histórico de Evoluções</h4>
                {evolutions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhuma evolução registrada ainda.</p>
                ) : (
                  evolutions.map((evo) => (
                    <div key={evo.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800">{evo.author?.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                            {evo.type}
                          </span>
                          {evo.author?.registry && (
                            <span className="text-[11px] text-slate-400">{evo.author.registry}</span>
                          )}
                        </div>
                        <span className="text-slate-400 text-[11px]">{evo.date}</span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">{evo.text}</p>

                      {evo.vitalSigns && Object.keys(evo.vitalSigns).length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 text-[11px]">
                          {evo.vitalSigns.bp && (
                            <span className="bg-rose-50 text-rose-800 px-2 py-0.5 rounded-md font-medium">
                              PA: {evo.vitalSigns.bp}
                            </span>
                          )}
                          {evo.vitalSigns.glucose && (
                            <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-medium">
                              HGT: {evo.vitalSigns.glucose} mg/dL
                            </span>
                          )}
                          {evo.vitalSigns.temp && (
                            <span className="bg-orange-50 text-orange-800 px-2 py-0.5 rounded-md font-medium">
                              Temp: {evo.vitalSigns.temp}°C
                            </span>
                          )}
                          {evo.vitalSigns.o2 && (
                            <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md font-medium">
                              SatO2: {evo.vitalSigns.o2}%
                            </span>
                          )}
                          {evo.vitalSigns.hr && (
                            <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-medium">
                              FC: {evo.vitalSigns.hr} bpm
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ESTOQUE INDIVIDUAL */}
          {activeTab === 'estoque' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Estoque Individual do Residente</h3>
                  <p className="text-xs text-slate-500">Medicamentos, fraldas geriátricas e suprimentos de uso próprio</p>
                </div>
              </div>

              {inventory.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhum item em estoque para este residente.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inventory.map((item) => {
                    const isLow = item.currentQuantity <= item.minAlertQuantity;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border flex items-center justify-between transition ${
                          isLow ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50/40 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-800">{item.itemName}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Estoque mínimo de alerta: <strong>{item.minAlertQuantity} {item.unit || 'un'}</strong>
                          </div>

                          {isLow && (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full mt-1.5">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              <span>Estoque Baixo - Solicitar à Família!</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {canEditInventory && (
                            <button
                              onClick={() => handleStockChange(item, -1)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center transition shadow-2xs"
                              title="Baixar 1 unidade"
                            >
                              -
                            </button>
                          )}
                          <div className="text-center min-w-[40px]">
                            <span className={`text-base font-black ${isLow ? 'text-amber-700' : 'text-slate-800'}`}>
                              {item.currentQuantity}
                            </span>
                            <div className="text-[10px] text-slate-400">{item.unit || 'un'}</div>
                          </div>
                          {canEditInventory && (
                            <button
                              onClick={() => handleStockChange(item, 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center transition shadow-2xs"
                              title="Adicionar 1 unidade"
                            >
                              +
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ESCALAS GERIÁTRICAS */}
          {activeTab === 'escalas' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-teal-600" />
                    <span>Escalas Geriátricas Automatizadas</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Avaliação clínica integrada: Braden (LPP), Morse (Quedas) e Katz (Grau de Dependência ANVISA RDC 502/2021).
                  </p>
                </div>

                <button
                  onClick={() => setIsScalesModalOpen(true)}
                  className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-xs shrink-0 self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                  <span>Aplicar Nova Avaliação</span>
                </button>
              </div>

              {assessments.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-700">Nenhuma avaliação geriátrica registrada</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Avalie o risco de queda (Morse), risco de lesão por pressão (Braden) e grau de dependência da ANVISA (Katz).
                  </p>
                  <button
                    onClick={() => setIsScalesModalOpen(true)}
                    className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    Iniciar Primeira Avaliação
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Latest Assessment Highlights */}
                  {(() => {
                    const latest = assessments[0];
                    return (
                      <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Última Avaliação Vigente</span>
                            <h4 className="text-base font-bold text-white mt-0.5">{latest.date}</h4>
                          </div>
                          <span className="text-xs text-teal-200/80">
                            Avaliador: {latest.evaluatedBy.name} ({latest.evaluatedBy.registry || latest.evaluatedBy.role})
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15">
                            <span className="text-[10px] font-bold text-teal-300 uppercase">1. Braden (LPP)</span>
                            <div className="flex items-baseline space-x-2 mt-1">
                              <span className="text-2xl font-black text-white">{latest.braden.totalScore}</span>
                              <span className="text-xs text-white/60">/ 23 pts</span>
                            </div>
                            <span className="inline-block text-[11px] font-bold mt-1.5 px-2 py-0.5 rounded-full bg-white/20 text-white">
                              {latest.braden.riskLevel.toUpperCase().replace('_', ' ')}
                            </span>
                          </div>

                          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15">
                            <span className="text-[10px] font-bold text-amber-300 uppercase">2. Morse (Quedas)</span>
                            <div className="flex items-baseline space-x-2 mt-1">
                              <span className="text-2xl font-black text-white">{latest.morse.totalScore}</span>
                              <span className="text-xs text-white/60">/ 125 pts</span>
                            </div>
                            <span className="inline-block text-[11px] font-bold mt-1.5 px-2 py-0.5 rounded-full bg-white/20 text-white">
                              {latest.morse.riskLevel.toUpperCase()} RISCO
                            </span>
                          </div>

                          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15">
                            <span className="text-[10px] font-bold text-blue-300 uppercase">3. Katz (ANVISA)</span>
                            <div className="flex items-baseline space-x-2 mt-1">
                              <span className="text-2xl font-black text-white">{latest.katz.totalScore}</span>
                              <span className="text-xs text-white/60">/ 6 ABVDs</span>
                            </div>
                            <span className="inline-block text-[11px] font-bold mt-1.5 px-2 py-0.5 rounded-full bg-white/20 text-white">
                              {latest.katz.dependencyDegree.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Cuidados ativos */}
                        <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-2">
                          <span className="text-xs font-bold text-teal-300 block">Condutas Preventivas Recomendadas:</span>
                          <ul className="text-xs text-slate-200 list-disc list-inside space-y-0.5">
                            {latest.braden.recommendedActions.slice(0, 2).map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                            {latest.morse.recommendedActions.slice(0, 2).map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Histórico anterior */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Histórico de Aplicações ({assessments.length})</h4>
                    <div className="space-y-2">
                      {assessments.map((a) => (
                        <div key={a.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800">{a.date}</span>
                            <span className="text-xs text-slate-500 ml-2">por {a.evaluatedBy.name}</span>
                            <div className="flex items-center space-x-2 mt-1 text-[11px]">
                              <span className="font-semibold text-teal-700">Braden: {a.braden.totalScore} pts</span>
                              <span>•</span>
                              <span className="font-semibold text-amber-700">Morse: {a.morse.totalScore} pts</span>
                              <span>•</span>
                              <span className="font-semibold text-blue-700">Katz: {a.katz.totalScore}/6</span>
                            </div>
                          </div>

                          <button
                            onClick={() => setIsScalesModalOpen(true)}
                            className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition"
                          >
                            Ver Detalhes
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition"
          >
            Fechar Prontuário
          </button>
        </div>

      </div>

      {/* Embedded New Prescription Submodal */}
      {showNewPrescModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Nova Prescrição Médica</h3>
              <button onClick={() => setShowNewPrescModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPrescription} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Nome do Medicamento</label>
                <input
                  type="text"
                  placeholder="Ex: Losartana Potássica"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Dosagem</label>
                  <input
                    type="text"
                    placeholder="Ex: 50mg"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Via</label>
                  <select
                    value={newRoute}
                    onChange={(e) => setNewRoute(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="oral">Oral</option>
                    <option value="sublingual">Sublingual</option>
                    <option value="injetavel">Injetável (SC/IM/IV)</option>
                    <option value="topico">Tópico</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Horários (separados por vírgula)</label>
                <input
                  type="text"
                  placeholder="08:00, 14:00, 20:00"
                  value={newTimes}
                  onChange={(e) => setNewTimes(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Instruções de Administração</label>
                <input
                  type="text"
                  placeholder="Ex: Após desjejum, com bastante água..."
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPrescModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingPresc}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition"
                >
                  {savingPresc ? 'Salvando...' : 'Cadastrar Prescrição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Escalas Geriátricas Automatizadas */}
      <EscalasGeriatricasModal
        resident={resident}
        isOpen={isScalesModalOpen}
        onClose={() => setIsScalesModalOpen(false)}
      />

      {/* Modal de Registro de Rotina Rápido disparado a partir da Linha do Tempo */}
      {isRoutineModalOpen && (
        <RegistroRotinaModal
          residents={[resident]}
          initialResidentId={resident.id}
          isOpen={isRoutineModalOpen}
          onClose={() => setIsRoutineModalOpen(false)}
          onSuccess={() => setIsRoutineModalOpen(false)}
        />
      )}
    </div>
  );
}
