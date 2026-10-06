'use client';

import React, { useState, useEffect } from 'react';
import { 
  Resident, 
  GeriatricAssessment, 
  BradenScale, 
  MorseScale, 
  KatzScale 
} from '@/types/ilpi';
import { useAuth } from '@/contexts/AuthContext';
import { 
  X, 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  FileCheck, 
  Calendar, 
  UserCheck, 
  Sparkles, 
  Printer, 
  History, 
  ArrowRight,
  Shield,
  Layers,
  Heart
} from 'lucide-react';
import { 
  BRADEN_OPTIONS, 
  MORSE_OPTIONS, 
  KATZ_OPTIONS, 
  calculateBraden, 
  calculateMorse, 
  calculateKatz 
} from '@/lib/geriatricScales';
import { 
  saveGeriatricAssessment, 
  subscribeResidentAssessments 
} from '@/lib/firebaseService';

interface EscalasGeriatricasModalProps {
  resident: Resident;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function EscalasGeriatricasModal({
  resident,
  isOpen,
  onClose,
  onSaved
}: EscalasGeriatricasModalProps) {
  const { currentUser, canManagePrescriptions } = useAuth();

  // Active view: 'nova' or 'historico'
  const [viewMode, setViewMode] = useState<'nova' | 'historico'>('nova');
  const [activeScaleTab, setActiveScaleTab] = useState<'todas' | 'braden' | 'morse' | 'katz'>('todas');

  // Assessments History
  const [assessments, setAssessments] = useState<GeriatricAssessment[]>([]);
  const [selectedHistoricalAssessment, setSelectedHistoricalAssessment] = useState<GeriatricAssessment | null>(null);

  // Form State - BRADEN
  const [bradenSensory, setBradenSensory] = useState<1 | 2 | 3 | 4>(3);
  const [bradenMoisture, setBradenMoisture] = useState<1 | 2 | 3 | 4>(3);
  const [bradenActivity, setBradenActivity] = useState<1 | 2 | 3 | 4>(3);
  const [bradenMobility, setBradenMobility] = useState<1 | 2 | 3 | 4>(3);
  const [bradenNutrition, setBradenNutrition] = useState<1 | 2 | 3 | 4>(3);
  const [bradenFriction, setBradenFriction] = useState<1 | 2 | 3>(2);

  // Form State - MORSE
  const [morseHistory, setMorseHistory] = useState<0 | 25>(0);
  const [morseSecondary, setMorseSecondary] = useState<0 | 15>(15);
  const [morseAid, setMorseAid] = useState<0 | 15 | 30>(0);
  const [morseIv, setMorseIv] = useState<0 | 20>(0);
  const [morseGait, setMorseGait] = useState<0 | 10 | 20>(0);
  const [morseMental, setMorseMental] = useState<0 | 15>(0);

  // Form State - KATZ
  const [katzBathing, setKatzBathing] = useState<0 | 1>(1);
  const [katzDressing, setKatzDressing] = useState<0 | 1>(1);
  const [katzToileting, setKatzToileting] = useState<0 | 1>(1);
  const [katzTransferring, setKatzTransferring] = useState<0 | 1>(1);
  const [katzContinence, setKatzContinence] = useState<0 | 1>(1);
  const [katzFeeding, setKatzFeeding] = useState<0 | 1>(1);

  // Notes
  const [clinicalSummary, setClinicalSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Subscribe to historical assessments
  useEffect(() => {
    if (!resident.id) return;
    const unsubscribe = subscribeResidentAssessments(resident.id, (list) => {
      setAssessments(list);
      if (list.length > 0) {
        setSelectedHistoricalAssessment(list[0]);
      }
    });
    return () => unsubscribe();
  }, [resident.id]);

  if (!isOpen) return null;

  // Real-time calculations
  const bradenResult = calculateBraden({
    sensoryPerception: bradenSensory,
    moisture: bradenMoisture,
    activity: bradenActivity,
    mobility: bradenMobility,
    nutrition: bradenNutrition,
    frictionShear: bradenFriction
  });

  const morseResult = calculateMorse({
    fallHistory: morseHistory,
    secondaryDiagnosis: morseSecondary,
    ambulatoryAid: morseAid,
    ivTherapy: morseIv,
    gait: morseGait,
    mentalStatus: morseMental
  });

  const katzResult = calculateKatz({
    bathing: katzBathing,
    dressing: katzDressing,
    toileting: katzToileting,
    transferring: katzTransferring,
    continence: katzContinence,
    feeding: katzFeeding
  });

  const getBradenBadge = (risk: BradenScale['riskLevel']) => {
    switch (risk) {
      case 'muito_alto':
        return { label: 'Risco Muito Alto / Gravíssimo', bg: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-600' };
      case 'alto':
        return { label: 'Risco Alto', bg: 'bg-orange-100 text-orange-800 border-orange-300', dot: 'bg-orange-600' };
      case 'moderado':
        return { label: 'Risco Moderado', bg: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-600' };
      case 'baixo':
        return { label: 'Risco Baixo', bg: 'bg-blue-100 text-blue-800 border-blue-300', dot: 'bg-blue-600' };
      case 'sem_risco':
        return { label: 'Sem Risco Aparente', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-600' };
    }
  };

  const getMorseBadge = (risk: MorseScale['riskLevel']) => {
    switch (risk) {
      case 'alto':
        return { label: 'Alto Risco de Queda', bg: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-600' };
      case 'moderado':
        return { label: 'Risco Moderado', bg: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-600' };
      case 'baixo':
        return { label: 'Baixo Risco de Queda', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-600' };
    }
  };

  const getKatzBadge = (degree: KatzScale['dependencyDegree']) => {
    switch (degree) {
      case 'grau_1':
        return { label: 'Grau I (Independente)', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'grau_2':
        return { label: 'Grau II (Dependência Moderada)', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'grau_3':
        return { label: 'Grau III (Dependência Grave/Total)', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
    }
  };

  const handleSaveAssessment = async () => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    try {
      const nowStr = `${new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} ${new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })}`;
      
      await saveGeriatricAssessment(resident.id, {
        residentId: resident.id,
        residentName: resident.name,
        date: nowStr,
        evaluatedBy: {
          uid: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          registry: currentUser.registry
        },
        braden: bradenResult,
        morse: morseResult,
        katz: katzResult,
        clinicalSummary: clinicalSummary.trim() || 'Avaliação geriátrica periódica realizada sem intercorrências.'
      });

      setSuccessMessage('Avaliação geriátrica registrada e integrada com sucesso ao prontuário do residente!');
      setTimeout(() => {
        setSuccessMessage(null);
        setViewMode('historico');
        if (onSaved) onSaved();
      }, 1500);
    } catch (err) {
      console.error('Erro ao salvar avaliação:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const bradenBadge = getBradenBadge(bradenResult.riskLevel);
  const morseBadge = getMorseBadge(morseResult.riskLevel);
  const katzBadge = getKatzBadge(katzResult.dependencyDegree);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-teal-300">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold tracking-tight">Escalas Geriátricas Automatizadas</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  ANVISA RDC 502/2021
                </span>
              </div>
              <p className="text-xs text-teal-200/80 mt-0.5">
                {resident.name} • Quarto {resident.room} (Leito {resident.bed}) • Avaliador: {currentUser.name} ({currentUser.registry || currentUser.role})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition border border-white/15"
              title="Imprimir relatório da avaliação"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Bar & Live Scores Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          {/* Tabs */}
          <div className="flex items-center space-x-1 bg-slate-200/80 p-1 rounded-xl w-fit">
            <button
              onClick={() => setViewMode('nova')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                viewMode === 'nova'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Nova Avaliação</span>
            </button>
            <button
              onClick={() => setViewMode('historico')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                viewMode === 'historico'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5 text-teal-600" />
              <span>Histórico ({assessments.length})</span>
            </button>
          </div>

          {/* Quick Score Gauges in Nova mode */}
          {viewMode === 'nova' && (
            <div className="flex items-center flex-wrap gap-2">
              <div className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center space-x-1.5 ${bradenBadge.bg}`}>
                <span className={`w-2 h-2 rounded-full ${bradenBadge.dot}`}></span>
                <span>Braden: {bradenResult.totalScore} pts</span>
                <span className="text-[10px] opacity-80">({bradenBadge.label})</span>
              </div>

              <div className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center space-x-1.5 ${morseBadge.bg}`}>
                <span className={`w-2 h-2 rounded-full ${morseBadge.dot}`}></span>
                <span>Morse: {morseResult.totalScore} pts</span>
                <span className="text-[10px] opacity-80">({morseBadge.label})</span>
              </div>

              <div className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center space-x-1.5 ${katzBadge.bg}`}>
                <span>Katz: {katzResult.totalScore}/6</span>
                <span className="text-[10px] opacity-80">({katzBadge.label})</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center space-x-3 text-sm font-semibold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {viewMode === 'nova' ? (
            <div className="space-y-8">
              
              {/* Quick Scale Selector Tabs */}
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
                <button
                  onClick={() => setActiveScaleTab('todas')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeScaleTab === 'todas'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Visão Integrada Completa
                </button>
                <button
                  onClick={() => setActiveScaleTab('braden')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeScaleTab === 'braden'
                      ? 'bg-teal-700 text-white'
                      : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                  }`}
                >
                  1. Escala de Braden (LPP)
                </button>
                <button
                  onClick={() => setActiveScaleTab('morse')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeScaleTab === 'morse'
                      ? 'bg-amber-700 text-white'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  2. Escala de Morse (Quedas)
                </button>
                <button
                  onClick={() => setActiveScaleTab('katz')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeScaleTab === 'katz'
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  3. Índice de Katz (Grau ANVISA)
                </button>
              </div>

              {/* SECTION 1: ESCALA DE BRADEN */}
              {(activeScaleTab === 'todas' || activeScaleTab === 'braden') && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="h-6 w-6 rounded-lg bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">1</span>
                        <h4 className="font-bold text-slate-800 text-base">Escala de Braden — Risco de Lesão por Pressão (LPP)</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Avalia a vulnerabilidade tecidual cutânea. Pontuação de 6 a 23 pontos (quanto menor a pontuação, maior o risco).
                      </p>
                    </div>

                    <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-2 shrink-0 ${bradenBadge.bg}`}>
                      <span className={`w-2 h-2 rounded-full ${bradenBadge.dot}`}></span>
                      <span>Total: {bradenResult.totalScore} pts</span>
                      <span>— {bradenBadge.label}</span>
                    </div>
                  </div>

                  {/* Braden Items Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* 1. Percepção Sensorial */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                      <label className="text-xs font-bold text-slate-700 block mb-2">Percepção Sensorial</label>
                      <div className="space-y-1.5">
                        {BRADEN_OPTIONS.sensoryPerception.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setBradenSensory(opt.value as any)}
                            className={`w-full text-left p-2 rounded-lg text-xs transition border ${
                              bradenSensory === opt.value
                                ? 'bg-teal-600 text-white border-teal-600 font-semibold shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                            }`}
                          >
                            <span className="block font-medium">{opt.label}</span>
                            <span className={`text-[11px] block mt-0.5 ${bradenSensory === opt.value ? 'text-teal-100' : 'text-slate-400'}`}>
                              {opt.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Umidade */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                      <label className="text-xs font-bold text-slate-700 block mb-2">Umidade da Pele</label>
                      <div className="space-y-1.5">
                        {BRADEN_OPTIONS.moisture.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setBradenMoisture(opt.value as any)}
                            className={`w-full text-left p-2 rounded-lg text-xs transition border ${
                              bradenMoisture === opt.value
                                ? 'bg-teal-600 text-white border-teal-600 font-semibold shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                            }`}
                          >
                            <span className="block font-medium">{opt.label}</span>
                            <span className={`text-[11px] block mt-0.5 ${bradenMoisture === opt.value ? 'text-teal-100' : 'text-slate-400'}`}>
                              {opt.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Atividade */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                      <label className="text-xs font-bold text-slate-700 block mb-2">Nível de Atividade</label>
                      <div className="space-y-1.5">
                        {BRADEN_OPTIONS.activity.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setBradenActivity(opt.value as any)}
                            className={`w-full text-left p-2 rounded-lg text-xs transition border ${
                              bradenActivity === opt.value
                                ? 'bg-teal-600 text-white border-teal-600 font-semibold shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                            }`}
                          >
                            <span className="block font-medium">{opt.label}</span>
                            <span className={`text-[11px] block mt-0.5 ${bradenActivity === opt.value ? 'text-teal-100' : 'text-slate-400'}`}>
                              {opt.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 4. Mobilidade */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                      <label className="text-xs font-bold text-slate-700 block mb-2">Mobilidade / Troca de Posição</label>
                      <div className="space-y-1.5">
                        {BRADEN_OPTIONS.mobility.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setBradenMobility(opt.value as any)}
                            className={`w-full text-left p-2 rounded-lg text-xs transition border ${
                              bradenMobility === opt.value
                                ? 'bg-teal-600 text-white border-teal-600 font-semibold shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                            }`}
                          >
                            <span className="block font-medium">{opt.label}</span>
                            <span className={`text-[11px] block mt-0.5 ${bradenMobility === opt.value ? 'text-teal-100' : 'text-slate-400'}`}>
                              {opt.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 5. Nutrição */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                      <label className="text-xs font-bold text-slate-700 block mb-2">Padrão Nutricional</label>
                      <div className="space-y-1.5">
                        {BRADEN_OPTIONS.nutrition.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setBradenNutrition(opt.value as any)}
                            className={`w-full text-left p-2 rounded-lg text-xs transition border ${
                              bradenNutrition === opt.value
                                ? 'bg-teal-600 text-white border-teal-600 font-semibold shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                            }`}
                          >
                            <span className="block font-medium">{opt.label}</span>
                            <span className={`text-[11px] block mt-0.5 ${bradenNutrition === opt.value ? 'text-teal-100' : 'text-slate-400'}`}>
                              {opt.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 6. Fricção e Cisalhamento */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                      <label className="text-xs font-bold text-slate-700 block mb-2">Fricção e Cisalhamento</label>
                      <div className="space-y-1.5">
                        {BRADEN_OPTIONS.frictionShear.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setBradenFriction(opt.value as any)}
                            className={`w-full text-left p-2 rounded-lg text-xs transition border ${
                              bradenFriction === opt.value
                                ? 'bg-teal-600 text-white border-teal-600 font-semibold shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                            }`}
                          >
                            <span className="block font-medium">{opt.label}</span>
                            <span className={`text-[11px] block mt-0.5 ${bradenFriction === opt.value ? 'text-teal-100' : 'text-slate-400'}`}>
                              {opt.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recomendações Automáticas Braden */}
                  <div className="bg-teal-50/60 border border-teal-200 rounded-xl p-4 mt-2">
                    <h5 className="text-xs font-bold text-teal-900 flex items-center space-x-1.5 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Condutas Preventivas Geradas Automaticamente (Braden):</span>
                    </h5>
                    <ul className="text-xs text-teal-800 space-y-1 list-disc list-inside">
                      {bradenResult.recommendedActions.map((act, idx) => (
                        <li key={idx}>{act}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* SECTION 2: ESCALA DE MORSE */}
              {(activeScaleTab === 'todas' || activeScaleTab === 'morse') && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="h-6 w-6 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">2</span>
                        <h4 className="font-bold text-slate-800 text-base">Escala de Morse — Risco de Quedas</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Protocolo de segurança do paciente para identificação do risco de quedas (pontuação de 0 a 125).
                      </p>
                    </div>

                    <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-2 shrink-0 ${morseBadge.bg}`}>
                      <span className={`w-2 h-2 rounded-full ${morseBadge.dot}`}></span>
                      <span>Total: {morseResult.totalScore} pts</span>
                      <span>— {morseBadge.label}</span>
                    </div>
                  </div>

                  {/* Morse Items Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* 1. Histórico de Quedas */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                      <label className="text-xs font-bold text-slate-700 block mb-2">Histórico de Quedas (últimos 3 meses)</label>
                      <div className="space-y-1.5">
                        {MORSE_OPTIONS.fallHistory.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setMorseHistory(opt.value as any)}
                            className={`w-full text-left p-2 rounded-lg text-xs transition border ${
                              morseHistory === opt.value
                                ? 'bg-amber-600 text-white border-amber-600 font-semibold shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                            }`}
                          >
                            <span className="block font-medium">{opt.label}</span>
                            <span className={`text-[11px] block mt-0.5 ${morseHistory === opt.value ? 'text-amber-100' : 'text-slate-400'}`}>
                              {opt.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Diagnóstico Secundário */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                      <label className="text-xs font-bold text-slate-700 block mb-2">Diagnóstico Secundário</label>
                      <div className="space-y-1.5">
                        {MORSE_OPTIONS.secondaryDiagnosis.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setMorseSecondary(opt.value as any)}
                            className={`w-full text-left p-2 rounded-lg text-xs transition border ${
                              morseSecondary === opt.value
                                ? 'bg-amber-600 text-white border-amber-600 font-semibold shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                            }`}
                          >
                            <span className="block font-medium">{opt.label}</span>
                            <span className={`text-[11px] block mt-0.5 ${morseSecondary === opt.value ? 'text-amber-100' : 'text-slate-400'}`}>
                              {opt.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Auxílio na Deambulação */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                      <label className="text-xs font-bold text-slate-700 block mb-2">Auxílio na Deambulação</label>
                      <div className="space-y-1.5">
                        {MORSE_OPTIONS.ambulatoryAid.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setMorseAid(opt.value as any)}
                            className={`w-full text-left p-2 rounded-lg text-xs transition border ${
                              morseAid === opt.value
                                ? 'bg-amber-600 text-white border-amber-600 font-semibold shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                            }`}
                          >
                            <span className="block font-medium">{opt.label}</span>
                            <span className={`text-[11px] block mt-0.5 ${morseAid === opt.value ? 'text-amber-100' : 'text-slate-400'}`}>
                              {opt.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 4. Terapia Endovenosa */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                      <label className="text-xs font-bold text-slate-700 block mb-2">Terapia Endovenosa / Acesso</label>
                      <div className="space-y-1.5">
                        {MORSE_OPTIONS.ivTherapy.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setMorseIv(opt.value as any)}
                            className={`w-full text-left p-2 rounded-lg text-xs transition border ${
                              morseIv === opt.value
                                ? 'bg-amber-600 text-white border-amber-600 font-semibold shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                            }`}
                          >
                            <span className="block font-medium">{opt.label}</span>
                            <span className={`text-[11px] block mt-0.5 ${morseIv === opt.value ? 'text-amber-100' : 'text-slate-400'}`}>
                              {opt.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 5. Marcha */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                      <label className="text-xs font-bold text-slate-700 block mb-2">Padrão da Marcha</label>
                      <div className="space-y-1.5">
                        {MORSE_OPTIONS.gait.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setMorseGait(opt.value as any)}
                            className={`w-full text-left p-2 rounded-lg text-xs transition border ${
                              morseGait === opt.value
                                ? 'bg-amber-600 text-white border-amber-600 font-semibold shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                            }`}
                          >
                            <span className="block font-medium">{opt.label}</span>
                            <span className={`text-[11px] block mt-0.5 ${morseGait === opt.value ? 'text-amber-100' : 'text-slate-400'}`}>
                              {opt.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 6. Estado Mental */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                      <label className="text-xs font-bold text-slate-700 block mb-2">Estado Mental / Consciência de Risco</label>
                      <div className="space-y-1.5">
                        {MORSE_OPTIONS.mentalStatus.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setMorseMental(opt.value as any)}
                            className={`w-full text-left p-2 rounded-lg text-xs transition border ${
                              morseMental === opt.value
                                ? 'bg-amber-600 text-white border-amber-600 font-semibold shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                            }`}
                          >
                            <span className="block font-medium">{opt.label}</span>
                            <span className={`text-[11px] block mt-0.5 ${morseMental === opt.value ? 'text-amber-100' : 'text-slate-400'}`}>
                              {opt.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recomendações Automáticas Morse */}
                  <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 mt-2">
                    <h5 className="text-xs font-bold text-amber-900 flex items-center space-x-1.5 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Protocolo de Prevenção de Quedas Ativado (Morse):</span>
                    </h5>
                    <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                      {morseResult.recommendedActions.map((act, idx) => (
                        <li key={idx}>{act}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* SECTION 3: ÍNDICE DE KATZ & GRAU ANVISA */}
              {(activeScaleTab === 'todas' || activeScaleTab === 'katz') && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="h-6 w-6 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">3</span>
                        <h4 className="font-bold text-slate-800 text-base">Índice de Katz — Classificação de Grau de Dependência da ANVISA</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        RDC 502/2021: Define o dimensionamento legal obrigatório de equipe e cuidadores por residente.
                      </p>
                    </div>

                    <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-2 shrink-0 ${katzBadge.bg}`}>
                      <span>Score: {katzResult.totalScore}/6</span>
                      <span>— {katzBadge.label}</span>
                    </div>
                  </div>

                  {/* 6 ABVDs Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Banho */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">1. Banho</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${katzBathing === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {katzBathing === 1 ? 'Independente' : 'Dependente'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Lavar o corpo, entrar e sair do chuveiro sem auxílio.</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          type="button"
                          onClick={() => setKatzBathing(1)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border ${
                            katzBathing === 1 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Independente (1)
                        </button>
                        <button
                          type="button"
                          onClick={() => setKatzBathing(0)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border ${
                            katzBathing === 0 ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Dependente (0)
                        </button>
                      </div>
                    </div>

                    {/* Vestir-se */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">2. Vestir-se</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${katzDressing === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {katzDressing === 1 ? 'Independente' : 'Dependente'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Pegar roupas no armário e vestir peças íntimas e sapatos.</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          type="button"
                          onClick={() => setKatzDressing(1)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border ${
                            katzDressing === 1 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Independente (1)
                        </button>
                        <button
                          type="button"
                          onClick={() => setKatzDressing(0)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border ${
                            katzDressing === 0 ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Dependente (0)
                        </button>
                      </div>
                    </div>

                    {/* Vaso Sanitário */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">3. Vaso Sanitário</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${katzToileting === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {katzToileting === 1 ? 'Independente' : 'Dependente'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Ir ao sanitário, higienizar-se e ajeitar roupas íntimas.</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          type="button"
                          onClick={() => setKatzToileting(1)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border ${
                            katzToileting === 1 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Independente (1)
                        </button>
                        <button
                          type="button"
                          onClick={() => setKatzToileting(0)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border ${
                            katzToileting === 0 ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Dependente (0)
                        </button>
                      </div>
                    </div>

                    {/* Transferência */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">4. Transferência</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${katzTransferring === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {katzTransferring === 1 ? 'Independente' : 'Dependente'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Levantar-se e deitar-se no leito/poltrona sem suporte físico.</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          type="button"
                          onClick={() => setKatzTransferring(1)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border ${
                            katzTransferring === 1 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Independente (1)
                        </button>
                        <button
                          type="button"
                          onClick={() => setKatzTransferring(0)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border ${
                            katzTransferring === 0 ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Dependente (0)
                        </button>
                      </div>
                    </div>

                    {/* Continência */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">5. Continência</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${katzContinence === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {katzContinence === 1 ? 'Independente' : 'Dependente'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Controle fecal e urinário completo (sem escape involuntário).</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          type="button"
                          onClick={() => setKatzContinence(1)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border ${
                            katzContinence === 1 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Independente (1)
                        </button>
                        <button
                          type="button"
                          onClick={() => setKatzContinence(0)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border ${
                            katzContinence === 0 ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Dependente (0)
                        </button>
                      </div>
                    </div>

                    {/* Alimentação */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">6. Alimentação</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${katzFeeding === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {katzFeeding === 1 ? 'Independente' : 'Dependente'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Levar o alimento até a boca mastigando e engolindo só.</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          type="button"
                          onClick={() => setKatzFeeding(1)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border ${
                            katzFeeding === 1 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Independente (1)
                        </button>
                        <button
                          type="button"
                          onClick={() => setKatzFeeding(0)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border ${
                            katzFeeding === 0 ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Dependente (0)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Resumo Regulatório ANVISA */}
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 mt-2">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-blue-900">{katzResult.dependencyDescription}</h5>
                        <p className="text-xs text-blue-700 mt-1">
                          <strong>Exigência ANVISA RDC 502/2021:</strong> {katzResult.recommendedCaregiverRatio}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Parecer Clínico & Botão Salvar */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Parecer Clínico da Equipe Multidisciplinar / Enfermagem
                </label>
                <textarea
                  value={clinicalSummary}
                  onChange={(e) => setClinicalSummary(e.target.value)}
                  placeholder="Descreva observações clínicas adicionais, alterações recentes de cognição, suporte familiar ou justificativas..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-slate-500">
                    Ao salvar, o sistema atualizará o prontuário, registrará a evolução clínica e sincronizará os alertas nos quadros de plantão.
                  </span>

                  <button
                    onClick={handleSaveAssessment}
                    disabled={isSubmitting}
                    className="bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition flex items-center justify-center space-x-2 shrink-0"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>{isSubmitting ? 'Gravando no Prontuário...' : 'Gravar Avaliação & Atualizar Prontuário'}</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* HISTÓRICO DE AVALIAÇÕES */
            <div className="space-y-6">
              {assessments.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-700">Nenhuma avaliação geriátrica registrada</h4>
                  <p className="text-xs text-slate-500 mt-1">Aplique uma nova avaliação na aba ao lado para iniciar o histórico.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Lista de Avaliações */}
                  <div className="space-y-2.5 md:col-span-1">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Linha do Tempo</h4>
                    {assessments.map((a) => {
                      const isSelected = selectedHistoricalAssessment?.id === a.id;
                      const bBadge = getBradenBadge(a.braden.riskLevel);
                      const mBadge = getMorseBadge(a.morse.riskLevel);
                      const kBadge = getKatzBadge(a.katz.dependencyDegree);

                      return (
                        <button
                          key={a.id}
                          onClick={() => setSelectedHistoricalAssessment(a)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                            isSelected
                              ? 'bg-teal-50/70 border-teal-500 ring-1 ring-teal-500 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">{a.date}</span>
                            <span className="text-[10px] text-teal-700 font-semibold">{a.evaluatedBy.name}</span>
                          </div>
                          <div className="flex items-center flex-wrap gap-1.5 mt-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${bBadge.bg}`}>
                              Braden {a.braden.totalScore}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${mBadge.bg}`}>
                              Morse {a.morse.totalScore}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${kBadge.bg}`}>
                              Katz {a.katz.totalScore}/6
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Detalhe da Avaliação Selecionada */}
                  <div className="md:col-span-2 bg-slate-50/80 rounded-2xl border border-slate-200 p-5 space-y-4">
                    {selectedHistoricalAssessment ? (
                      <>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">
                              Avaliação de {selectedHistoricalAssessment.date}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Realizada por: {selectedHistoricalAssessment.evaluatedBy.name} ({selectedHistoricalAssessment.evaluatedBy.registry || selectedHistoricalAssessment.evaluatedBy.role})
                            </p>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => window.print()}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 flex items-center space-x-1"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Imprimir Ficha</span>
                            </button>
                          </div>
                        </div>

                        {/* Comparativo de Scores */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">Braden (LPP)</span>
                            <div className="flex items-baseline space-x-2 mt-1">
                              <span className="text-2xl font-black text-teal-800">{selectedHistoricalAssessment.braden.totalScore}</span>
                              <span className="text-xs text-slate-500">de 23</span>
                            </div>
                            <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBradenBadge(selectedHistoricalAssessment.braden.riskLevel).bg}`}>
                              {getBradenBadge(selectedHistoricalAssessment.braden.riskLevel).label}
                            </span>
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">Morse (Quedas)</span>
                            <div className="flex items-baseline space-x-2 mt-1">
                              <span className="text-2xl font-black text-amber-800">{selectedHistoricalAssessment.morse.totalScore}</span>
                              <span className="text-xs text-slate-500">de 125</span>
                            </div>
                            <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getMorseBadge(selectedHistoricalAssessment.morse.riskLevel).bg}`}>
                              {getMorseBadge(selectedHistoricalAssessment.morse.riskLevel).label}
                            </span>
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">Katz (ABVD)</span>
                            <div className="flex items-baseline space-x-2 mt-1">
                              <span className="text-2xl font-black text-blue-800">{selectedHistoricalAssessment.katz.totalScore}</span>
                              <span className="text-xs text-slate-500">de 6</span>
                            </div>
                            <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getKatzBadge(selectedHistoricalAssessment.katz.dependencyDegree).bg}`}>
                              {getKatzBadge(selectedHistoricalAssessment.katz.dependencyDegree).label}
                            </span>
                          </div>
                        </div>

                        {/* Recomendações e Plano Ativo */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                          <h5 className="text-xs font-bold text-slate-800">Condutas Prescritas na Avaliação:</h5>
                          
                          <div className="space-y-2">
                            <div>
                              <span className="text-[11px] font-bold text-teal-800 block">Prevenção de LPP (Braden):</span>
                              <ul className="text-xs text-slate-600 list-disc list-inside mt-0.5 space-y-0.5">
                                {selectedHistoricalAssessment.braden.recommendedActions.map((act, i) => (
                                  <li key={i}>{act}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="pt-2 border-t border-slate-100">
                              <span className="text-[11px] font-bold text-amber-800 block">Prevenção de Quedas (Morse):</span>
                              <ul className="text-xs text-slate-600 list-disc list-inside mt-0.5 space-y-0.5">
                                {selectedHistoricalAssessment.morse.recommendedActions.map((act, i) => (
                                  <li key={i}>{act}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="pt-2 border-t border-slate-100">
                              <span className="text-[11px] font-bold text-blue-800 block">Exigência ANVISA RDC 502/2021 (Katz):</span>
                              <p className="text-xs text-slate-600 mt-0.5">
                                {selectedHistoricalAssessment.katz.recommendedCaregiverRatio}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Parecer Clínico */}
                        {selectedHistoricalAssessment.clinicalSummary && (
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                            <span className="text-[11px] font-bold text-slate-700 block mb-1">Parecer Clínico Registrado:</span>
                            <p className="text-xs text-slate-600 italic">
                              "{selectedHistoricalAssessment.clinicalSummary}"
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        Selecione uma avaliação na lista para visualizar os detalhes.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
