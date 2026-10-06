'use client';

import React, { useState } from 'react';
import { Resident, MedicationLog, MedicationLogStatus } from '@/types/ilpi';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Pill, 
  X, 
  User, 
  ShieldAlert 
} from 'lucide-react';
import { getNtpDate } from '@/lib/ntpService';

interface CheckMedicationModalProps {
  resident: Resident;
  log: MedicationLog;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    residentId: string, 
    logId: string, 
    status: MedicationLogStatus, 
    notes?: string
  ) => Promise<void>;
}

export function CheckMedicationModal({
  resident,
  log,
  isOpen,
  onClose,
  onConfirm
}: CheckMedicationModalProps) {
  const { currentUser } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<MedicationLogStatus>('administered');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm(resident.id, log.id, selectedStatus, notes);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-500/20 text-teal-300 rounded-lg">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">Checagem de Medicamento</h3>
              <p className="text-xs text-slate-400">Registro de Aprazamento & Baixa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Resident Details Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Residente</div>
              <div className="font-bold text-slate-800 text-sm">{resident.name}</div>
              <div className="text-xs text-slate-600">Quarto {resident.room} • Leito {resident.bed}</div>
            </div>
            <div className="text-right">
              <span className="text-xs px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-semibold">
                Horário: {log.scheduledTime}
              </span>
            </div>
          </div>

          {/* Allergy Alert Warning (Essential Safety) */}
          {resident.allergies && resident.allergies.length > 0 && resident.allergies[0] !== 'Nenhuma conhecida' && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start space-x-2.5 text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold">Alergias Registradas: </span>
                <span className="font-medium text-rose-800">{resident.allergies.join(', ')}</span>
                <p className="text-[11px] text-rose-700 mt-0.5">Certifique-se de que a prescrição não contém compostos alergênicos.</p>
              </div>
            </div>
          )}

          {/* Medication Info Card */}
          <div className="border border-teal-200 bg-teal-50/40 rounded-xl p-4">
            <div className="text-xs text-teal-800 font-semibold uppercase tracking-wider">Medicamento a Administrar</div>
            <div className="text-lg font-bold text-slate-900 mt-1">{log.medicationName}</div>
            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-700">
              <div><span className="font-semibold">Dosagem:</span> {log.dosage || 'Conforme prescrição'}</div>
              <div><span className="font-semibold">Via:</span> {log.route ? log.route.toUpperCase() : 'ORAL'}</div>
            </div>
          </div>

          {/* Status Selection Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Ação / Resultado da Administração
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedStatus('administered')}
                className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center space-y-1 transition border ${
                  selectedStatus === 'administered'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Administrado</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('delayed')}
                className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center space-y-1 transition border ${
                  selectedStatus === 'delayed'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>Adiar / Aguardar</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('refused')}
                className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center space-y-1 transition border ${
                  selectedStatus === 'refused'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:border-rose-300'
                }`}
              >
                <XCircle className="w-5 h-5" />
                <span>Recusou / Suspenso</span>
              </button>
            </div>
          </div>

          {/* Observations */}
          <div className="space-y-1">
            <label htmlFor="notes" className="text-xs font-semibold text-slate-700">
              Observações / Justificativa {selectedStatus === 'refused' && <span className="text-rose-500">* (Obrigatório)</span>}
            </label>
            <textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                selectedStatus === 'refused'
                  ? 'Ex: Residente alegou enjoo matinal e não aceitou o comprimido...'
                  : selectedStatus === 'delayed'
                  ? 'Ex: Residente estava dormindo, aprazado para 30 minutos após acordar...'
                  : 'Ex: Administrado com água sem queixas ou intercorrências...'
              }
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required={selectedStatus === 'refused'}
            />
          </div>

          {/* Caregiver Signature Stamp */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>Assinatura Digital: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.role.toUpperCase()})</span>
            </div>
            <span suppressHydrationWarning className="text-slate-500 text-[11px] font-medium">
              {getNtpDate().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })} (Hora Legal NTP.br)
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md transition disabled:opacity-50 flex items-center space-x-1.5"
            >
              {loading ? (
                <span>Salvando no Firestore...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Checagem</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
