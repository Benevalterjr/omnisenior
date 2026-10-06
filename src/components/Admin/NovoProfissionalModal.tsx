'use client';

import React, { useState } from 'react';
import { UserProfile, UserRole, UserPermissions } from '@/types/ilpi';
import { DEFAULT_ROLE_PERMISSIONS, ROLE_LABELS } from '@/lib/permissionsService';
import { 
  X, 
  UserPlus, 
  ShieldCheck, 
  Check, 
  AlertCircle,
  Briefcase,
  Mail,
  Phone,
  Clock,
  KeyRound
} from 'lucide-react';

interface NovoProfissionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<UserProfile, 'id'>) => void;
}

export function NovoProfissionalModal({
  isOpen,
  onClose,
  onSave
}: NovoProfissionalModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('cuidador');
  const [registry, setRegistry] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [shiftPreference, setShiftPreference] = useState<'manha' | 'tarde' | 'noite' | 'comercial' | 'escala_12x36'>('manha');
  
  // Custom permissions overrides
  const [customPermissions, setCustomPermissions] = useState<UserPermissions>(DEFAULT_ROLE_PERMISSIONS.cuidador);
  const [showPermissionsCustomizer, setShowPermissionsCustomizer] = useState(false);

  if (!isOpen) return null;

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setCustomPermissions(DEFAULT_ROLE_PERMISSIONS[newRole]);

    // Pre-fill suggested registry placeholder
    if (newRole === 'medico') setRegistry('CRM/SP ');
    else if (newRole === 'enfermeiro') setRegistry('COREN/SP ');
    else if (newRole === 'fisioterapeuta') setRegistry('CREFITO-3/ ');
    else if (newRole === 'nutricionista') setRegistry('CRN-3/ ');
    else if (newRole === 'psicologo') setRegistry('CRP-06/ ');
    else if (newRole === 'cuidador') setRegistry('Cert. Cuidador ILPI #');
    else setRegistry('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onSave({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      role,
      registry: registry.trim() || undefined,
      specialty: specialty.trim() || ROLE_LABELS[role]?.title || undefined,
      shiftPreference,
      status: 'active',
      customPermissions,
      photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=0d9488&color=fff`
    });

    onClose();
  };

  const togglePermission = (key: keyof UserPermissions) => {
    setCustomPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-purple-300">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Cadastrar Novo Colaborador</h3>
              <p className="text-xs text-purple-200/80">
                Adicione médicos, enfermeiros, cuidadores e configure seus acessos clínicos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Role Selector Grid */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Selecione o Cargo / Função Profissional *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => {
                const info = ROLE_LABELS[r];
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-600/20 text-purple-950 font-bold'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="text-xs block leading-tight">{info.title.split('/')[0]}</span>
                    <span className={`text-[10px] mt-1.5 px-1.5 py-0.2 rounded w-fit font-bold border ${info.color}`}>
                      {info.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name & Registry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Dra. Mariana Vasconcelos"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Registro de Classe (CRM, COREN, etc.)
              </label>
              <input
                type="text"
                value={registry}
                onChange={(e) => setRegistry(e.target.value)}
                placeholder="Ex: CRM/SP 145980 ou COREN/SP 789123"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                E-mail de Acesso *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="profissional@omnisenior.com.br"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Specialty & Shift Preference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Especialidade ou Setor
              </label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Ex: Geriatria, Cuidados Paliativos, Plantão Noturno..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Escala / Turno Principal
              </label>
              <select
                value={shiftPreference}
                onChange={(e) => setShiftPreference(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="manha">Turno Manhã (07h às 13h)</option>
                <option value="tarde">Turno Tarde (13h às 19h)</option>
                <option value="noite">Turno Noite / Plantão (19h às 07h)</option>
                <option value="escala_12x36">Plantão 12x36</option>
                <option value="comercial">Comercial / Administrativo (08h às 17h)</option>
              </select>
            </div>
          </div>

          {/* Granular Permissions Overrides Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                  <span>Permissões de Acesso e Visualização</span>
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Predefinidas automaticamente para o perfil <strong>{ROLE_LABELS[role]?.title}</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPermissionsCustomizer(!showPermissionsCustomizer)}
                className="text-xs text-purple-700 font-bold hover:underline"
              >
                {showPermissionsCustomizer ? 'Ocultar Detalhes' : 'Personalizar Permissões'}
              </button>
            </div>

            {showPermissionsCustomizer && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                {[
                  { key: 'canPrescribe', label: 'Prescrever Medicamentos', desc: 'Criar e suspender receitas médicas' },
                  { key: 'canTranscribe', label: 'Transcrever Receitas Externas', desc: 'Copiar prescrições físicas externas' },
                  { key: 'canAdministerMedication', label: 'Checar Medicamentos no Plantão', desc: 'Dar baixa de administração no quarto' },
                  { key: 'canLogRoutine', label: 'Registrar Rotina Diária', desc: 'Preencher banho, dieta, evacuação e hidratação' },
                  { key: 'canApplyScales', label: 'Aplicar Escalas Geriátricas', desc: 'Braden, Morse e Katz com cálculo automático' },
                  { key: 'canViewConfidential', label: 'Acessar Prontuário Sigiloso', desc: 'Evoluções médicas e psicológicas restritas' },
                  { key: 'canManageInventory', label: 'Movimentar Estoque do Idoso', desc: 'Dar baixa em fraldas e remédios' },
                  { key: 'canManageResidents', label: 'Cadastrar / Editar Residentes', desc: 'Admissão, alta e transferência de quarto' },
                  { key: 'canManageUsers', label: 'Gerenciar Equipe e Usuários', desc: 'Acesso à área de administração' },
                  { key: 'canManageSettings', label: 'Alterar Configurações e Leitos', desc: 'Alvarás, hotelaria e dados da clínica' }
                ].map(({ key, label, desc }) => {
                  const isChecked = !!customPermissions[key as keyof UserPermissions];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => togglePermission(key as keyof UserPermissions)}
                      className={`text-left p-2.5 rounded-xl border transition flex items-start space-x-2 ${
                        isChecked
                          ? 'bg-purple-50/70 border-purple-400 text-purple-900'
                          : 'bg-white border-slate-200 text-slate-500 opacity-70'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                        isChecked ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block leading-tight">{label}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Salvar & Liberar Acesso</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
