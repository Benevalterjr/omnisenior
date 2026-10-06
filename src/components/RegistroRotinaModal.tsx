'use client';

import React, { useState } from 'react';
import { Resident, CaregiverRoutine, VitalSigns } from '@/types/ilpi';
import { useAuth } from '@/contexts/AuthContext';
import { 
  HeartHandshake, 
  Bath, 
  Utensils, 
  Droplet, 
  Activity, 
  Check, 
  X, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { recordQuickCaregiverRoutine } from '@/lib/firebaseService';

interface RegistroRotinaModalProps {
  residents: Resident[];
  initialResidentId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RegistroRotinaModal({
  residents,
  initialResidentId,
  isOpen,
  onClose,
  onSuccess
}: RegistroRotinaModalProps) {
  const { currentUser } = useAuth();
  const [selectedResidentId, setSelectedResidentId] = useState<string>(
    initialResidentId || (residents.length > 0 ? residents[0].id : '')
  );

  // Form State
  const [bath, setBath] = useState<'aspersao' | 'leito' | 'recusou' | 'nao_previsto'>('aspersao');
  const [dietAcceptance, setDietAcceptance] = useState<'100%' | '75%' | '50%' | 'pouca' | 'recusou'>('100%');
  const [hydrationMl, setHydrationMl] = useState<number>(200);
  const [evacuation, setEvacuation] = useState<boolean>(true);
  const [bristolScale, setBristolScale] = useState<number>(4);
  const [diuresis, setDiuresis] = useState<'normal' | 'pouca' | 'ausente' | 'sonda'>('normal');

  // Vital Signs
  const [bp, setBp] = useState('');
  const [temp, setTemp] = useState('');
  const [glucose, setGlucose] = useState('');
  const [o2, setO2] = useState('');
  const [hr, setHr] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const currentResident = residents.find(r => r.id === selectedResidentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId) return;

    setLoading(true);
    try {
      const vitalSigns: VitalSigns = {};
      if (bp) vitalSigns.bp = bp;
      if (temp) vitalSigns.temp = parseFloat(temp);
      if (glucose) vitalSigns.glucose = parseInt(glucose, 10);
      if (o2) vitalSigns.o2 = parseInt(o2, 10);
      if (hr) vitalSigns.hr = parseInt(hr, 10);

      const routineData: CaregiverRoutine = {
        residentId: selectedResidentId,
        residentName: currentResident?.name,
        date: new Date().toISOString(),
        bath,
        dietAcceptance,
        hydrationMl,
        evacuation,
        bristolScale: evacuation ? bristolScale : undefined,
        diuresis,
        vitalSigns: Object.keys(vitalSigns).length > 0 ? vitalSigns : undefined,
        notes: notes.trim() || undefined,
        caregiver: {
          uid: currentUser.id,
          name: currentUser.name,
          role: currentUser.role
        }
      };

      await recordQuickCaregiverRoutine(routineData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar registro de rotina:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <HeartHandshake className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Registro Rápido de Rotina</h3>
              <p className="text-xs text-teal-100">Checklist do cuidador em quarto (&lt; 1 min)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          
          {/* Select Resident */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Selecione o Residente
            </label>
            <select
              value={selectedResidentId}
              onChange={(e) => setSelectedResidentId(e.target.value)}
              className="w-full text-xs font-semibold p-3 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            >
              {residents.map((r) => (
                <option key={r.id} value={r.id}>
                  Quarto {r.room} - Leito {r.bed}: {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section 1: Banho & Higiene */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <Bath className="w-4 h-4 text-teal-600" />
              <span>1. BANHO & HIGIENE</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'aspersao', label: 'Aspersão (Chuveiro)' },
                { id: 'leito', label: 'No Leito' },
                { id: 'recusou', label: 'Recusou Banho' },
                { id: 'nao_previsto', label: 'Não Previsto' }
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setBath(opt.id as any)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition text-center ${
                    bath === opt.id
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Alimentação & Hidratação */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <Utensils className="w-4 h-4 text-teal-600" />
              <span>2. ALIMENTAÇÃO (ACEITAÇÃO)</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {[
                { id: '100%', label: '100% (Total)' },
                { id: '75%', label: '75% (Boa)' },
                { id: '50%', label: '50% (Metade)' },
                { id: 'pouca', label: 'Pouca' },
                { id: 'recusou', label: 'Recusou' }
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setDietAcceptance(opt.id as any)}
                  className={`py-2 px-1 text-[11px] sm:text-xs font-semibold rounded-xl border transition text-center ${
                    dietAcceptance === opt.id
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Hidratação Rápida */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
                <Droplet className="w-3.5 h-3.5 text-blue-500" />
                <span>Água / Hidratação: <strong>{hydrationMl} ml</strong></span>
              </div>
              <div className="flex space-x-1">
                {[100, 200, 300, 500].map((ml) => (
                  <button
                    type="button"
                    key={ml}
                    onClick={() => setHydrationMl(ml)}
                    className={`px-2 py-1 text-[11px] font-bold rounded-lg border ${
                      hydrationMl === ml
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-blue-50'
                    }`}
                  >
                    +{ml}ml
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Eliminações Fisiológicas */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-800">
              3. ELIMINAÇÕES FISIOLÓGICAS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {/* Evacuação */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Evacuação no Turno:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEvacuation(true)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition ${
                      evacuation ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvacuation(false)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition ${
                      !evacuation ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Não
                  </button>
                </div>
                {evacuation && (
                  <div className="mt-2 text-xs">
                    <span className="text-[11px] text-slate-500">Escala de Bristol:</span>
                    <select
                      value={bristolScale}
                      onChange={(e) => setBristolScale(parseInt(e.target.value, 10))}
                      className="w-full mt-1 p-1 text-xs border border-slate-300 rounded-lg bg-white"
                    >
                      <option value={1}>Tipo 1 - Caroços duros (constipado)</option>
                      <option value={2}>Tipo 2 - Em forma de salsicha, nodoso</option>
                      <option value={3}>Tipo 3 - Salsicha com fendas na superfície</option>
                      <option value={4}>Tipo 4 - Salsicha suave e macia (Normal)</option>
                      <option value={5}>Tipo 5 - Pedaços macios com bordas nítidas</option>
                      <option value={6}>Tipo 6 - Pastoso com bordas irregulares</option>
                      <option value={7}>Tipo 7 - Totalmente líquido (diarreia)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Diurese */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Diurese:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'normal', label: 'Normal / Clara' },
                    { id: 'pouca', label: 'Pouca / Concentrada' },
                    { id: 'ausente', label: 'Ausente (Alerta)' },
                    { id: 'sonda', label: 'Sonda Demora' }
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setDiuresis(opt.id as any)}
                      className={`p-1.5 text-[11px] font-semibold rounded-lg border transition ${
                        diuresis === opt.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Sinais Vitais Rápidos (Opcional) */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <Activity className="w-4 h-4 text-rose-500" />
              <span>4. SINAIS VITAIS (AFERIÇÃO OPCIONAL)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-600">PA (mmHg)</label>
                <input
                  type="text"
                  placeholder="120/80"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600">Temp (°C)</label>
                <input
                  type="text"
                  placeholder="36.5"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600">Glicemia (mg/dL)</label>
                <input
                  type="number"
                  placeholder="98"
                  value={glucose}
                  onChange={(e) => setGlucose(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600">Sat. O2 (%)</label>
                <input
                  type="number"
                  placeholder="97"
                  value={o2}
                  onChange={(e) => setO2(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Observações Rápidas */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Observações / Queixas do Residente
            </label>
            <input
              type="text"
              placeholder="Ex: Humor tranquilo, dormiu bem após o almoço, sem queixas de dor..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-teal-500"
            />
          </div>

          {/* Footer & Submit */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition flex items-center space-x-2"
            >
              {loading ? (
                <span>Salvando no Firestore...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Gravar Rotina do Residente</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
