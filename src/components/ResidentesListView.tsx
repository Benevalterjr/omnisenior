'use client';

import React, { useState } from 'react';
import { Resident } from '@/types/ilpi';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Search, 
  Eye, 
  HeartHandshake, 
  AlertTriangle, 
  Phone, 
  PlusCircle,
  Pill,
  BedDouble,
  ShieldAlert
} from 'lucide-react';

interface ResidentesListViewProps {
  residents: Resident[];
  onOpenResidentModal: (resident: Resident) => void;
  onOpenQuickRoutine: (residentId: string) => void;
  onOpenNewResident: () => void;
  onOpenScalesModal?: (resident: Resident) => void;
}

export function ResidentesListView({
  residents,
  onOpenResidentModal,
  onOpenQuickRoutine,
  onOpenNewResident,
  onOpenScalesModal
}: ResidentesListViewProps) {
  const { canManageResidents } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = residents.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.room.includes(searchTerm) ||
    r.dietType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, quarto ou dieta..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        {canManageResidents && (
          <button
            onClick={onOpenNewResident}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-xs self-end sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cadastrar Novo Residente</span>
          </button>
        )}
      </div>

      {/* Grid of Resident Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((resident) => {
          const hasAllergies = resident.allergies && resident.allergies.length > 0 && resident.allergies[0] !== 'Nenhuma conhecida';

          return (
            <div
              key={resident.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-teal-300 transition duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Header: Photo, Name, Room */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={resident.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(resident.name)}&background=0d9488&color=fff`}
                      alt={resident.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 leading-tight">{resident.name}</h4>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
                        <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                          Quarto {resident.room} • Leito {resident.bed}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Nascimento:</span>
                    <span className="font-medium text-slate-700">
                      {resident.birthDate.includes('-') ? resident.birthDate.split('-').reverse().join('/') : resident.birthDate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Dieta:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[180px]">{resident.dietType}</span>
                  </div>

                  {/* Allergies Highlight */}
                  {hasAllergies && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2 rounded-xl flex items-start space-x-1.5 mt-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="text-[11px]">
                        <strong>Alergias: </strong>{resident.allergies.join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Geriatric Scales Badges */}
                  {(resident.bradenRisk || resident.morseRisk || resident.katzDegree) && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                      {resident.bradenRisk && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          resident.bradenRisk === 'muito_alto' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                          resident.bradenRisk === 'alto' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                          resident.bradenRisk === 'moderado' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          resident.bradenRisk === 'baixo' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}>
                          Braden: {resident.bradenRisk.replace('_', ' ')}
                        </span>
                      )}

                      {resident.morseRisk && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          resident.morseRisk === 'alto' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                          resident.morseRisk === 'moderado' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}>
                          Morse: {resident.morseRisk}
                        </span>
                      )}

                      {resident.katzDegree && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          resident.katzDegree === 'grau_3' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                          resident.katzDegree === 'grau_2' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-blue-100 text-blue-800 border-blue-200'
                        }`}>
                          {resident.katzDegree === 'grau_1' ? 'Grau I ANVISA' : resident.katzDegree === 'grau_2' ? 'Grau II ANVISA' : 'Grau III ANVISA'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Emergency Contact */}
                  {resident.emergencyContacts.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Contato:</span>
                      <a
                        href={`tel:${resident.emergencyContacts[0].phone}`}
                        className="text-teal-700 font-semibold hover:underline flex items-center space-x-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{resident.emergencyContacts[0].name}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => onOpenQuickRoutine(resident.id)}
                  className="bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-semibold py-2 px-1.5 rounded-xl transition flex items-center justify-center space-x-1"
                  title="Registrar rotina em menos de 1 minuto"
                >
                  <HeartHandshake className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Rotina</span>
                </button>

                <button
                  onClick={() => onOpenScalesModal ? onOpenScalesModal(resident) : onOpenResidentModal(resident)}
                  className="bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 text-xs font-semibold py-2 px-1.5 rounded-xl transition flex items-center justify-center space-x-1"
                  title="Escalas Geriátricas Automatizadas (Braden, Morse, Katz)"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">Escalas</span>
                </button>

                <button
                  onClick={() => onOpenResidentModal(resident)}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2 px-1.5 rounded-xl transition flex items-center justify-center space-x-1 shadow-2xs"
                  title="Abrir prontuário completo"
                >
                  <Eye className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Prontuário</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
