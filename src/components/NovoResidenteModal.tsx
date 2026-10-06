'use client';

import React, { useState } from 'react';
import { Resident, EmergencyContact } from '@/types/ilpi';
import { X, UserPlus, Plus, Trash2 } from 'lucide-react';
import { createResident } from '@/lib/firebaseService';

interface NovoResidenteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newResident: Resident) => void;
}

export function NovoResidenteModal({
  isOpen,
  onClose,
  onSuccess
}: NovoResidenteModalProps) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('1945-05-10');
  const [room, setRoom] = useState('');
  const [bed, setBed] = useState('A');
  const [allergiesText, setAllergiesText] = useState('Nenhuma conhecida');
  const [dietType, setDietType] = useState('Geral');
  const [notes, setNotes] = useState('');
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { name: '', phone: '', relation: 'Filho(a)' }
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddContact = () => {
    setContacts(prev => [...prev, { name: '', phone: '', relation: 'Familiar' }]);
  };

  const handleRemoveContact = (index: number) => {
    setContacts(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleContactChange = (index: number, field: keyof EmergencyContact, val: string) => {
    setContacts(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !room.trim()) return;

    setLoading(true);
    try {
      const allergies = allergiesText
        .split(',')
        .map(a => a.trim())
        .filter(Boolean);

      const validContacts = contacts.filter(c => c.name.trim() && c.phone.trim());

      const residentData: Omit<Resident, 'id'> = {
        name: name.trim(),
        birthDate,
        room: room.trim(),
        bed: bed.trim(),
        allergies: allergies.length > 0 ? allergies : ['Nenhuma conhecida'],
        dietType: dietType.trim(),
        emergencyContacts: validContacts.length > 0 ? validContacts : [
          { name: 'Responsável ILPI', phone: '(11) 99999-0000', relation: 'Instituição' }
        ],
        notes: notes.trim() || undefined,
        status: 'active'
      };

      const newId = await createResident(residentData);
      onSuccess({
        id: newId,
        ...residentData
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-500/20 text-teal-300 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Admissão de Residente</h3>
              <p className="text-xs text-slate-400">Cadastro de ficha cadastral e clínica na ILPI</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="text-xs font-semibold text-slate-700">Nome Completo do Residente *</label>
            <input
              type="text"
              placeholder="Ex: Dona Sebastiana de Albuquerque"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl mt-1 focus:outline-teal-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Data de Nascimento</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Quarto *</label>
              <input
                type="text"
                placeholder="Ex: 101"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Leito</label>
              <input
                type="text"
                placeholder="Ex: A"
                value={bed}
                onChange={(e) => setBed(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl mt-1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Alergias Conhecidas (separadas por vírgula)
              </label>
              <input
                type="text"
                placeholder="Ex: Penicilina, Dipirona, Sulfa"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Tipo de Dieta</label>
              <select
                value={dietType}
                onChange={(e) => setDietType(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl mt-1 bg-white"
              >
                <option value="Geral">Geral</option>
                <option value="Geral hipossódica">Geral hipossódica</option>
                <option value="Pastosa com espessante nível 2">Pastosa com espessante</option>
                <option value="Branda / Sem adição de sal">Branda / Pouco sal</option>
                <option value="Diabético hipoglicídica">Diabético hipoglicídica</option>
                <option value="Líquida pastosa">Líquida pastosa</option>
                <option value="Sonda Enteral">Sonda Enteral</option>
              </select>
            </div>
          </div>

          {/* Emergency Contacts Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Contatos de Emergência / Familiares
              </label>
              <button
                type="button"
                onClick={handleAddContact}
                className="text-xs text-teal-700 font-bold flex items-center space-x-1 hover:text-teal-900"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Contato</span>
              </button>
            </div>

            {contacts.map((contact, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Nome do familiar"
                  value={contact.name}
                  onChange={(e) => handleContactChange(idx, 'name', e.target.value)}
                  className="flex-1 text-xs p-2 border border-slate-300 rounded-xl"
                  required
                />
                <input
                  type="text"
                  placeholder="Telefone / Celular"
                  value={contact.phone}
                  onChange={(e) => handleContactChange(idx, 'phone', e.target.value)}
                  className="w-36 text-xs p-2 border border-slate-300 rounded-xl"
                  required
                />
                <input
                  type="text"
                  placeholder="Parentesco"
                  value={contact.relation}
                  onChange={(e) => handleContactChange(idx, 'relation', e.target.value)}
                  className="w-28 text-xs p-2 border border-slate-300 rounded-xl"
                />
                {contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveContact(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Observações Clínicas Iniciais</label>
            <textarea
              rows={2}
              placeholder="Ex: Risco de queda moderado, precisa de apoio para banho..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl mt-1"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-3">
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
              className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Residente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
