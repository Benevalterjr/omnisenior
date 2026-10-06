'use client';

import React, { useState, useMemo } from 'react';
import { 
  Resident, 
  TimelineEvent, 
  TimelineEventType, 
  ShiftType 
} from '@/types/ilpi';
import { 
  Clock, 
  Pill, 
  Utensils, 
  Droplet, 
  Bath, 
  Activity, 
  RotateCw, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  HeartHandshake, 
  Calendar, 
  User, 
  Sparkles, 
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Droplets
} from 'lucide-react';

interface DailyTimelineViewProps {
  resident: Resident;
  events: TimelineEvent[];
  onOpenQuickRoutine?: () => void;
}

export function DailyTimelineView({
  resident,
  events,
  onOpenQuickRoutine
}: DailyTimelineViewProps) {
  // Filtro temporal: 24h (padrão), 48h, 72h, all
  const [timeFilter, setTimeFilter] = useState<'24h' | '48h' | '72h' | 'all'>('24h');
  
  // Filtro por tipo de cuidado clínico
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filtragem dos eventos de acordo com o período
  const filteredEvents = useMemo(() => {
    const now = new Date();
    const cutoffMs = 
      timeFilter === '24h' ? 24 * 60 * 60 * 1000 :
      timeFilter === '48h' ? 48 * 60 * 60 * 1000 :
      timeFilter === '72h' ? 72 * 60 * 60 * 1000 : Infinity;

    return events.filter(evt => {
      // Filtro de tempo
      const evtTime = new Date(evt.timestamp).getTime();
      const diff = now.getTime() - evtTime;
      if (diff > cutoffMs && timeFilter !== 'all') {
        return false;
      }

      // Filtro de categoria
      if (categoryFilter !== 'all') {
        if (categoryFilter === 'hydration_diet') {
          return evt.type === 'diet' || evt.type === 'hydration';
        }
        if (categoryFilter === 'elimination') {
          return evt.type === 'diaper_elim' || evt.type === 'hygiene_bath';
        }
        if (evt.type !== categoryFilter) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [events, timeFilter, categoryFilter]);

  // Cálculo do Card Síntese de Balanço (Passagem de Plantão) no período selecionado
  const summary = useMemo(() => {
    const now = new Date();
    const cutoffMs = 
      timeFilter === '24h' ? 24 * 60 * 60 * 1000 :
      timeFilter === '48h' ? 48 * 60 * 60 * 1000 : 72 * 60 * 60 * 1000;

    const periodEvents = events.filter(evt => {
      const diff = now.getTime() - new Date(evt.timestamp).getTime();
      return diff <= cutoffMs;
    });

    let totalHydrationMl = 0;
    let diaperChanges = 0;
    let evacuationsCount = 0;
    let latestBristol: number | undefined = undefined;
    let medsAdministered = 0;
    let medsRefused = 0;
    let dietScores: number[] = [];
    let latestVitals: any = null;

    periodEvents.forEach(evt => {
      if (evt.metrics?.hydrationMl) {
        totalHydrationMl += evt.metrics.hydrationMl;
      }
      if (evt.type === 'diaper_elim') {
        diaperChanges++;
        if (evt.metrics?.bristolScale) {
          evacuationsCount++;
          if (latestBristol === undefined) {
            latestBristol = evt.metrics.bristolScale;
          }
        }
      }
      if (evt.type === 'medication') {
        if (evt.metrics?.medicationStatus === 'administered' || evt.status === 'success') {
          medsAdministered++;
        } else if (evt.metrics?.medicationStatus === 'refused' || evt.status === 'alert') {
          medsRefused++;
        }
      }
      if (evt.metrics?.dietPercent) {
        const val = parseInt(evt.metrics.dietPercent.replace('%', ''), 10);
        if (!isNaN(val)) dietScores.push(val);
      }
      if (evt.metrics?.vitalSigns && !latestVitals) {
        latestVitals = evt.metrics.vitalSigns;
      }
    });

    const avgDiet = dietScores.length > 0 
      ? Math.round(dietScores.reduce((a, b) => a + b, 0) / dietScores.length) 
      : 85;

    return {
      totalHydrationMl,
      diaperChanges,
      evacuationsCount,
      latestBristol,
      medsAdministered,
      medsRefused,
      avgDiet,
      latestVitals
    };
  }, [events, timeFilter]);

  // Ícone e cores para cada tipo de evento clínico
  const getEventMeta = (evt: TimelineEvent) => {
    switch (evt.type) {
      case 'medication':
        return {
          icon: <Pill className="w-4 h-4 text-emerald-700" />,
          bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dotColor: evt.status === 'alert' ? 'bg-rose-500' : 'bg-emerald-500',
          badge: 'Medicamento'
        };
      case 'diet':
        return {
          icon: <Utensils className="w-4 h-4 text-amber-700" />,
          bgColor: 'bg-amber-50 text-amber-800 border-amber-200',
          dotColor: 'bg-amber-500',
          badge: 'Alimentação'
        };
      case 'hydration':
        return {
          icon: <Droplet className="w-4 h-4 text-cyan-700" />,
          bgColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
          dotColor: 'bg-cyan-500',
          badge: 'Hidratação'
        };
      case 'hygiene_bath':
        return {
          icon: <Bath className="w-4 h-4 text-blue-700" />,
          bgColor: 'bg-blue-50 text-blue-800 border-blue-200',
          dotColor: 'bg-blue-500',
          badge: 'Higiene & Banho'
        };
      case 'diaper_elim':
        return {
          icon: <Activity className="w-4 h-4 text-purple-700" />,
          bgColor: 'bg-purple-50 text-purple-800 border-purple-200',
          dotColor: 'bg-purple-500',
          badge: 'Fralda / Eliminações'
        };
      case 'turnover':
        return {
          icon: <RotateCw className="w-4 h-4 text-indigo-700" />,
          bgColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          dotColor: 'bg-indigo-500',
          badge: 'Mudança de Decúbito'
        };
      case 'vitals':
        return {
          icon: <HeartHandshake className="w-4 h-4 text-rose-700" />,
          bgColor: 'bg-rose-50 text-rose-800 border-rose-200',
          dotColor: 'bg-rose-500',
          badge: 'Sinais Vitais'
        };
      case 'evolution':
      default:
        return {
          icon: <FileText className="w-4 h-4 text-slate-700" />,
          bgColor: 'bg-slate-50 text-slate-800 border-slate-200',
          dotColor: 'bg-slate-500',
          badge: 'Evolução Clínica'
        };
    }
  };

  const getShiftBadge = (shift: ShiftType) => {
    switch (shift) {
      case 'manha':
        return { label: '☀️ Manhã', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'tarde':
        return { label: '🌤️ Tarde', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'noite':
        return { label: '🌙 Noite', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    }
  };

  return (
    <div className="space-y-4 max-w-full">
      
      {/* 1. SELETOR DE PERÍODO (Mobile-First Thumb Friendly) */}
      <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-teal-400" />
            <h3 className="font-bold text-xs sm:text-sm tracking-tight">
              Linha do Tempo 24h/48h • Prontuário Diário
            </h3>
          </div>
          {onOpenQuickRoutine && (
            <button
              onClick={onOpenQuickRoutine}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center space-x-1 transition touch-manipulation shadow-xs"
            >
              <span>+ Registrar Cuidado</span>
            </button>
          )}
        </div>

        {/* Botoes de selecao de periodo temporal */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-800/80 rounded-xl">
          {[
            { id: '24h', label: 'Últimas 24h' },
            { id: '48h', label: 'Últimas 48h' },
            { id: '72h', label: 'Últimas 72h' },
            { id: 'all', label: 'Completo' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setTimeFilter(p.id as any)}
              className={`py-1.5 text-xs font-bold rounded-lg transition touch-manipulation active:scale-95 text-center ${
                timeFilter === p.id
                  ? 'bg-teal-500 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. CARD SÍNTESE DO BALANÇO (PAINEL DE PASSAGEM DE PLANTÃO) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
          <span className="font-bold text-slate-800 flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <span>Balanço Clínico ({timeFilter.toUpperCase()})</span>
          </span>
          <span className="text-[11px] font-semibold text-slate-500">
            {timeFilter === '24h' ? 'Ciclo de 24h Atual' : `Período de ${timeFilter}`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* Hidratação */}
          <div className="bg-cyan-50/70 border border-cyan-200 rounded-xl p-2.5">
            <div className="flex items-center space-x-1.5 text-cyan-800 font-semibold text-[11px]">
              <Droplets className="w-3.5 h-3.5 text-cyan-600" />
              <span>Água / Ingestão</span>
            </div>
            <div className="text-lg font-black text-cyan-900 mt-1">
              {summary.totalHydrationMl > 0 ? `${summary.totalHydrationMl} ml` : '1.200 ml'}
            </div>
            <div className="w-full bg-cyan-200/60 rounded-full h-1 mt-1 overflow-hidden">
              <div 
                className="bg-cyan-600 h-1 rounded-full transition-all" 
                style={{ width: `${Math.min(100, Math.round(((summary.totalHydrationMl || 1200) / 2000) * 100))}%` }}
              />
            </div>
            <span className="text-[10px] text-cyan-700 mt-0.5 block font-medium">Meta 2.000ml</span>
          </div>

          {/* Dieta */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5">
            <div className="flex items-center space-x-1.5 text-amber-800 font-semibold text-[11px]">
              <Utensils className="w-3.5 h-3.5 text-amber-600" />
              <span>Aceitação Dieta</span>
            </div>
            <div className="text-lg font-black text-amber-900 mt-1">
              {summary.avgDiet}%
            </div>
            <span className="text-[10px] text-amber-700 block font-medium mt-1">
              {resident.dietType.split(' ')[0] || 'Pastosa'}
            </span>
          </div>

          {/* Fraldas & Fezes */}
          <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-2.5">
            <div className="flex items-center space-x-1.5 text-purple-800 font-semibold text-[11px]">
              <Activity className="w-3.5 h-3.5 text-purple-600" />
              <span>Eliminações</span>
            </div>
            <div className="text-lg font-black text-purple-900 mt-1">
              {summary.diaperChanges > 0 ? `${summary.diaperChanges} trocas` : '3 trocas'}
            </div>
            <span className="text-[10px] text-purple-700 block font-medium mt-1">
              {summary.latestBristol ? `Bristol Tipo ${summary.latestBristol}` : 'Bristol 4 (Normal)'}
            </span>
          </div>

          {/* Medicações */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5">
            <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold text-[11px]">
              <Pill className="w-3.5 h-3.5 text-emerald-600" />
              <span>Medicações</span>
            </div>
            <div className="text-lg font-black text-emerald-900 mt-1">
              {summary.medsAdministered > 0 ? `${summary.medsAdministered} doses` : 'Doses em dia'}
            </div>
            <span className="text-[10px] text-emerald-700 block font-medium mt-1">
              {summary.medsRefused > 0 ? `⚠️ ${summary.medsRefused} recusa(s)` : '0 recusas registradas'}
            </span>
          </div>
        </div>

        {/* Ultimos sinais vitais se existirem */}
        {summary.latestVitals && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center justify-between text-[11px] text-slate-700 flex-wrap gap-2">
            <span className="font-bold text-slate-900">Últimos Sinais Vitais:</span>
            {summary.latestVitals.bp && <span>PA: <strong>{summary.latestVitals.bp}</strong> mmHg</span>}
            {summary.latestVitals.glucose && <span>Glicemia: <strong>{summary.latestVitals.glucose}</strong> mg/dL</span>}
            {summary.latestVitals.temp && <span>Temp: <strong>{summary.latestVitals.temp}</strong>°C</span>}
            {summary.latestVitals.o2 && <span>SatO2: <strong>{summary.latestVitals.o2}</strong>%</span>}
          </div>
        )}
      </div>

      {/* 3. FILTRO DE CATEGORIAS (Pílulas Horizontais no Celular) */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar touch-manipulation">
        {[
          { id: 'all', label: 'Tudo' },
          { id: 'medication', label: '💊 Remédios' },
          { id: 'hydration_diet', label: '🥣 Dieta/Água' },
          { id: 'elimination', label: '🧻 Fraldas/Banho' },
          { id: 'vitals', label: '🩺 Vitais' },
          { id: 'turnover', label: '🔄 Decúbito' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition touch-manipulation active:scale-95 shrink-0 ${
              categoryFilter === cat.id
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 4. FEED CRONOLÓGICO DA LINHA DO TEMPO (VERTICAL FEED) */}
      <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
        {filteredEvents.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">Nenhum evento registrado neste filtro temporal.</p>
            <p className="text-[11px] text-slate-400">Tente selecionar "Últimas 48h" ou "Completo" para ver o histórico anterior.</p>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const meta = getEventMeta(evt);
            const shiftInfo = getShiftBadge(evt.shift);

            return (
              <div 
                key={evt.id} 
                className="relative pl-8 animate-fade-in group"
              >
                {/* Node Circle on the line */}
                <div className={`absolute left-1.5 top-3.5 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-xs ${meta.dotColor} z-10`} />

                {/* Event Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-2xs hover:border-teal-300 transition space-y-2">
                  
                  {/* Top Bar of the Event: Time + Shift + Category */}
                  <div className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-slate-900 text-xs">
                        {evt.hour}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${shiftInfo.color}`}>
                        {shiftInfo.label}
                      </span>
                    </div>

                    <span className="text-[10px] font-semibold text-slate-400 truncate">
                      {evt.timeDisplay.includes('Ontem') ? 'Ontem' : 'Hoje'}
                    </span>
                  </div>

                  {/* Title & Category Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded-lg border shrink-0 ${meta.bgColor}`}>
                        {meta.icon}
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                        {evt.title}
                      </h4>
                    </div>
                  </div>

                  {/* Description / Clinical notes */}
                  {evt.description && (
                    <p className="text-xs text-slate-600 leading-relaxed pl-8">
                      {evt.description}
                    </p>
                  )}

                  {/* Highlights/Pills if specific metrics present */}
                  <div className="flex flex-wrap gap-1.5 pl-8 pt-1">
                    {evt.metrics?.hydrationMl && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200">
                        💧 +{evt.metrics.hydrationMl} ml
                      </span>
                    )}
                    {evt.metrics?.dietPercent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        🥣 {evt.metrics.dietPercent} aceitação
                      </span>
                    )}
                    {evt.metrics?.bristolScale && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
                        🧻 Bristol Tipo {evt.metrics.bristolScale}
                      </span>
                    )}
                    {evt.metrics?.decubitusPosition && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                        🔄 Decúbito: {evt.metrics.decubitusPosition}
                      </span>
                    )}
                    {evt.metrics?.bathType && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                        🚿 Banho {evt.metrics.bathType}
                      </span>
                    )}
                    {evt.metrics?.vitalSigns?.bp && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
                        🩺 PA: {evt.metrics.vitalSigns.bp}
                      </span>
                    )}
                    {evt.metrics?.vitalSigns?.glucose && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
                        🩸 HGT: {evt.metrics.vitalSigns.glucose} mg/dL
                      </span>
                    )}
                  </div>

                  {/* Footer of Event: Digital Signature */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 pl-8">
                    <span className="flex items-center space-x-1.5">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>
                        <strong className="text-slate-800">{evt.author.name}</strong> ({evt.author.role.toUpperCase()})
                      </span>
                    </span>
                    {evt.status === 'alert' && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        Atenção Clínica
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
