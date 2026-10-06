'use client';

import React, { useState, useMemo } from 'react';
import { Resident, MedicationLog, MedicationLogStatus, UserRole } from '@/types/ilpi';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  Search, 
  Filter, 
  Pill, 
  Eye, 
  HeartHandshake, 
  User, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { CheckMedicationModal } from './CheckMedicationModal';

interface DutyBoardProps {
  residents: Resident[];
  medicationLogsMap: Record<string, MedicationLog[]>;
  onCheckMedication: (
    residentId: string, 
    logId: string, 
    user: { uid: string; name: string; role?: UserRole }, 
    status: MedicationLogStatus, 
    notes?: string
  ) => Promise<boolean>;
  onOpenResidentModal: (resident: Resident) => void;
  onOpenQuickRoutine: (residentId?: string) => void;
}

export function DutyBoard({
  residents,
  medicationLogsMap,
  onCheckMedication,
  onOpenResidentModal,
  onOpenQuickRoutine
}: DutyBoardProps) {
  const { currentUser, shift } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'alerts'>('all');
  
  // Modal state for checking medication
  const [selectedCheck, setSelectedCheck] = useState<{
    resident: Resident;
    log: MedicationLog;
  } | null>(null);

  // Calculate shift stats
  const stats = useMemo(() => {
    let totalLogs = 0;
    let administered = 0;
    let pending = 0;
    let refused = 0;

    Object.values(medicationLogsMap).forEach(logs => {
      logs.forEach(l => {
        totalLogs++;
        if (l.status === 'administered') administered++;
        else if (l.status === 'scheduled' || l.status === 'delayed') pending++;
        else if (l.status === 'refused') refused++;
      });
    });

    const completionRate = totalLogs > 0 ? Math.round((administered / totalLogs) * 100) : 0;

    return { totalLogs, administered, pending, refused, completionRate };
  }, [medicationLogsMap]);

  // Filter residents
  const filteredResidents = useMemo(() => {
    return residents.filter(resident => {
      const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            resident.room.includes(searchTerm);
      if (!matchesSearch) return false;

      const logs = medicationLogsMap[resident.id] || [];

      if (filterMode === 'pending') {
        return logs.some(l => l.status === 'scheduled' || l.status === 'delayed');
      }

      if (filterMode === 'alerts') {
        const hasRefusal = logs.some(l => l.status === 'refused');
        const hasAllergies = resident.allergies && resident.allergies.length > 0 && resident.allergies[0] !== 'Nenhuma conhecida';
        return hasRefusal || hasAllergies;
      }

      return true;
    });
  }, [residents, medicationLogsMap, searchTerm, filterMode]);

  const handleQuickCheck = async (resident: Resident, log: MedicationLog) => {
    await onCheckMedication(
      resident.id, 
      log.id, 
      { uid: currentUser.id, name: currentUser.name, role: currentUser.role }, 
      'administered'
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Residents Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{residents.length}</div>
            <div className="text-xs text-slate-500 font-medium">Residentes Cadastrados</div>
          </div>
        </div>

        {/* Total Meds Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{stats.totalLogs}</div>
            <div className="text-xs text-slate-500 font-medium">Doses Aprazadas (Hoje)</div>
          </div>
        </div>

        {/* Administered Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="w-full">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-700">{stats.administered}</span>
              <span className="text-xs font-bold text-emerald-600">{stats.completionRate}%</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">Checados / Administrados</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black text-amber-700">{stats.pending}</span>
              {stats.refused > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                  {stats.refused} recusa{stats.refused > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 font-medium">Pendentes no Plantão</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do residente ou número do quarto..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        {/* Mode filter tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterMode === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos ({residents.length})
          </button>

          <button
            onClick={() => setFilterMode('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1 ${
              filterMode === 'pending'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-amber-50 hover:text-amber-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Com Pendências</span>
          </button>

          <button
            onClick={() => setFilterMode('alerts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1 ${
              filterMode === 'alerts'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-rose-50 hover:text-rose-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Alertas Clínicos</span>
          </button>
        </div>
      </div>

      {/* Residents Shift Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredResidents.map((resident) => {
          const logs = medicationLogsMap[resident.id] || [];
          const hasPending = logs.some(l => l.status === 'scheduled' || l.status === 'delayed');
          const hasRefusal = logs.some(l => l.status === 'refused');

          return (
            <div
              key={resident.id}
              className={`bg-white rounded-2xl border transition duration-200 shadow-sm flex flex-col justify-between overflow-hidden ${
                hasRefusal 
                  ? 'border-rose-300 ring-1 ring-rose-200' 
                  : hasPending 
                  ? 'border-slate-200 hover:border-teal-300' 
                  : 'border-slate-200 bg-slate-50/40'
              }`}
            >
              {/* Resident Header */}
              <div className="p-4 border-b border-slate-100 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={resident.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(resident.name)}&background=0d9488&color=fff`}
                      alt={resident.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-md shadow">
                      Q.{resident.room}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight flex items-center space-x-1.5">
                      <span>{resident.name}</span>
                    </h4>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-slate-500">
                      <span>Leito {resident.bed}</span>
                      <span>•</span>
                      <span className="truncate max-w-[170px]" title={resident.dietType}>
                        {resident.dietType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-col items-end space-y-1">
                  {resident.allergies && resident.allergies.length > 0 && resident.allergies[0] !== 'Nenhuma conhecida' && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      <span>Alergia: {resident.allergies[0]}</span>
                    </span>
                  )}
                  {hasPending ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[10px]">
                      Pendente no Plantão
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                      Em Dia
                    </span>
                  )}
                </div>
              </div>

              {/* Medication Checklist for this Resident */}
              <div className="p-4 space-y-2.5 flex-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Aprazamento de Medicamentos (Hoje)</span>
                  <span className="text-slate-500 font-medium">{logs.length} medicação(ões)</span>
                </div>

                {logs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">Nenhum medicamento aprazado para hoje.</p>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log) => {
                      const isDone = log.status === 'administered';
                      const isRefused = log.status === 'refused';
                      const isDelayed = log.status === 'delayed';

                      return (
                        <div
                          key={log.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                            isDone
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : isRefused
                              ? 'bg-rose-50/60 border-rose-200'
                              : isDelayed
                              ? 'bg-amber-50/60 border-amber-200'
                              : 'bg-white border-slate-200 hover:border-teal-300'
                          }`}
                        >
                          {/* Med info */}
                          <div className="flex items-center space-x-3">
                            <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                              isDone ? 'bg-emerald-100 text-emerald-800' :
                              isRefused ? 'bg-rose-100 text-rose-800' :
                              isDelayed ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {log.scheduledTime}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                                <span>{log.medicationName}</span>
                                {log.route && (
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    ({log.route})
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {isDone ? (
                                  <span className="text-emerald-700 font-medium">
                                    ✓ Checado {log.administeredBy ? `por ${log.administeredBy.name}` : ''}
                                  </span>
                                ) : isRefused ? (
                                  <span className="text-rose-700 font-semibold">
                                    ✗ Recusado: {log.notes || 'Sem justificativa'}
                                  </span>
                                ) : isDelayed ? (
                                  <span className="text-amber-700 font-medium">
                                    ⏳ Adiado: {log.notes || 'Aguardando'}
                                  </span>
                                ) : (
                                  <span>{log.dosage || 'Dosagem padrão'}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="flex items-center space-x-1.5">
                            {log.status === 'scheduled' ? (
                              <>
                                <button
                                  onClick={() => handleQuickCheck(resident, log)}
                                  title="Checar administração com 1 clique"
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1 shadow-xs transition"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Checar</span>
                                </button>
                                <button
                                  onClick={() => setSelectedCheck({ resident, log })}
                                  title="Opções de registro (Recusar, Adiar ou Anotar)"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setSelectedCheck({ resident, log })}
                                title="Ver / Alterar registro de checagem"
                                className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                              >
                                Detalhes
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Resident Footer Actions */}
              <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onOpenQuickRoutine(resident.id)}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center space-x-1 transition"
                >
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>Rotina Rápida</span>
                </button>

                <button
                  onClick={() => onOpenResidentModal(resident)}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center space-x-1 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Prontuário Completo</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Check Medication Dialog */}
      {selectedCheck && (
        <CheckMedicationModal
          resident={selectedCheck.resident}
          log={selectedCheck.log}
          isOpen={true}
          onClose={() => setSelectedCheck(null)}
          onConfirm={async (resId, logId, status, notes) => {
            await onCheckMedication(
              resId, 
              logId, 
              { uid: currentUser.id, name: currentUser.name, role: currentUser.role }, 
              status, 
              notes
            );
          }}
        />
      )}
    </div>
  );
}
