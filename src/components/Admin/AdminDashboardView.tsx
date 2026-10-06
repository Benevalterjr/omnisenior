'use client';

import React, { useState } from 'react';
import { 
  UserProfile, 
  UserRole, 
  UserPermissions, 
  ClinicSettings, 
  ClinicRoomBed 
} from '@/types/ilpi';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ROLE_LABELS, 
  DEFAULT_ROLE_PERMISSIONS, 
  INITIAL_CLINIC_SETTINGS, 
  INITIAL_ROOM_BEDS,
  getUserPermissions 
} from '@/lib/permissionsService';
import { NovoProfissionalModal } from './NovoProfissionalModal';
import { 
  ShieldCheck, 
  Users, 
  KeyRound, 
  Building2, 
  BedDouble, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Phone, 
  Mail, 
  Clock, 
  FileText, 
  Edit3, 
  Trash2, 
  Power, 
  Check, 
  X,
  Sparkles,
  Lock,
  ArrowRight,
  Save,
  BadgeCheck
} from 'lucide-react';

export function AdminDashboardView() {
  const { 
    currentUser, 
    users, 
    addUser, 
    updateUser, 
    toggleUserStatus, 
    deleteUser, 
    switchUser 
  } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<'equipe' | 'permissoes' | 'hotelaria' | 'instituicao'>('equipe');
  
  // Modals & Search State
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');

  // Clinic Settings state
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>(INITIAL_CLINIC_SETTINGS);
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  // Beds & Hotelaria state
  const [beds, setBeds] = useState<ClinicRoomBed[]>(INITIAL_ROOM_BEDS);
  const [newBedRoom, setNewBedRoom] = useState('106');
  const [newBedLetter, setNewBedLetter] = useState('A');
  const [newBedType, setNewBedType] = useState<'individual' | 'duplo'>('duplo');
  const [showAddBedForm, setShowAddBedForm] = useState(false);

  // Selected User for Permissions Edit
  const [editingPermissionsUser, setEditingPermissionsUser] = useState<UserProfile | null>(null);

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (u.registry && u.registry.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
      (u.specialty && u.specialty.toLowerCase().includes(userSearchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'todos' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Bed stats
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === 'ocupado').length;
  const availableBeds = beds.filter(b => b.status === 'disponivel').length;
  const maintenanceBeds = beds.filter(b => b.status === 'manutencao').length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const handleSaveClinicSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 3000);
  };

  const handleAddBed = (e: React.FormEvent) => {
    e.preventDefault();
    const newBed: ClinicRoomBed = {
      id: `bed-${newBedRoom.toLowerCase()}-${newBedLetter.toLowerCase()}-${Date.now()}`,
      roomNumber: newBedRoom,
      bedLetter: newBedLetter,
      type: newBedType,
      status: 'disponivel',
      dailyRate: 280
    };
    setBeds(prev => [...prev, newBed]);
    setShowAddBedForm(false);
  };

  const handleToggleBedStatus = (bedId: string) => {
    setBeds(prev => prev.map(b => {
      if (b.id === bedId) {
        if (b.status === 'disponivel') return { ...b, status: 'manutencao' };
        if (b.status === 'manutencao') return { ...b, status: 'disponivel' };
        return b;
      }
      return b;
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Director Administrative Hub */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-purple-600/10 to-transparent pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Área Restrita da Diretoria</span>
              </span>
              <span className="text-xs text-purple-200/80">
                {clinicSettings.sanitaryLicense.split('(')[0]}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 text-white">
              Painel de Gestão & Governança da ILPI
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl mt-1">
              Gerencie toda a equipe médica, de enfermagem e cuidadores, configure permissões granulares de acesso, hotelaria de leitos e parâmetros da instituição.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setEditingPermissionsUser(null);
                setIsNewUserModalOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg transition flex items-center space-x-2 shrink-0 border border-purple-400/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Profissional</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
            <span className="text-[11px] font-bold text-purple-200 block uppercase">Equipe Ativa</span>
            <span className="text-2xl font-black text-white mt-0.5 block">
              {users.filter(u => u.status === 'active').length}
            </span>
            <span className="text-[10px] text-purple-200/80 block mt-0.5">
              Médicos, enfermeiros e cuidadores
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
            <span className="text-[11px] font-bold text-teal-200 block uppercase">Taxa de Ocupação</span>
            <span className="text-2xl font-black text-white mt-0.5 block">
              {occupancyRate}%
            </span>
            <span className="text-[10px] text-teal-200/80 block mt-0.5">
              {occupiedBeds} de {totalBeds} leitos ocupados
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
            <span className="text-[11px] font-bold text-amber-200 block uppercase">Leitos Livres</span>
            <span className="text-2xl font-black text-white mt-0.5 block">
              {availableBeds}
            </span>
            <span className="text-[10px] text-amber-200/80 block mt-0.5">
              Prontos para admissão
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
            <span className="text-[11px] font-bold text-indigo-200 block uppercase">Conformidade VISA</span>
            <span className="text-sm font-black text-emerald-400 mt-2 block flex items-center space-x-1">
              <BadgeCheck className="w-4 h-4" />
              <span>RDC 502/2021 OK</span>
            </span>
            <span className="text-[10px] text-indigo-200/80 block mt-0.5">
              Dimensionamento regular
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTab('equipe')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'equipe'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Equipe & Colaboradores ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('permissoes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'permissoes'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Matriz de Permissões (RBAC)</span>
        </button>

        <button
          onClick={() => setActiveTab('hotelaria')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'hotelaria'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BedDouble className="w-4 h-4" />
          <span>Hotelaria & Leitos ({beds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('instituicao')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'instituicao'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Instituição & Alvarás</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: EQUIPE & COLABORADORES */}
      {/* ========================================================= */}
      {activeTab === 'equipe' && (
        <div className="space-y-4">
          
          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Buscar colaborador por nome, CRM/COREN ou cargo..."
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Role Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setRoleFilter('todos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  roleFilter === 'todos'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Todos ({users.length})
              </button>
              {(['medico', 'enfermeiro', 'cuidador', 'fisioterapeuta', 'nutricionista'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    roleFilter === r
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {ROLE_LABELS[r]?.badge} ({users.filter(u => u.role === r).length})
                </button>
              ))}
            </div>
          </div>

          {/* Collaborators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => {
              const roleInfo = ROLE_LABELS[user.role] || ROLE_LABELS.cuidador;
              const perms = getUserPermissions(user);
              const isCurrent = currentUser.id === user.id;

              return (
                <div
                  key={user.id}
                  className={`bg-white rounded-2xl border transition duration-150 p-5 shadow-xs flex flex-col justify-between ${
                    user.status === 'inactive'
                      ? 'border-slate-200 bg-slate-50/60 opacity-75'
                      : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <div>
                    {/* User Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7c3aed&color=fff`}
                          alt={user.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 leading-tight">{user.name}</h4>
                          <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${roleInfo.color}`}>
                            {roleInfo.badge} • {user.specialty || roleInfo.title}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} title={user.status === 'active' ? 'Ativo' : 'Inativo'}></span>
                      </div>
                    </div>

                    {/* Registry & Contacts */}
                    <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      {user.registry && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Registro Profissional:</span>
                          <span className="font-bold text-slate-800">{user.registry}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">E-mail:</span>
                        <span className="text-slate-700 truncate max-w-[160px]">{user.email}</span>
                      </div>

                      {user.phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Telefone:</span>
                          <span className="text-slate-700 font-medium">{user.phone}</span>
                        </div>
                      )}

                      {user.shiftPreference && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Escala:</span>
                          <span className="font-semibold text-purple-700 capitalize">
                            {user.shiftPreference.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Permissions Mini Badges */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1">
                      {perms.canPrescribe && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          Prescreve
                        </span>
                      )}
                      {perms.canTranscribe && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 border border-teal-200">
                          Transcreve
                        </span>
                      )}
                      {perms.canAdministerMedication && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Checa Remédios
                        </span>
                      )}
                      {perms.canApplyScales && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Escalas Geriátricas
                        </span>
                      )}
                      {perms.canViewConfidential && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          Prontuário Sigiloso
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => switchUser(user.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1 ${
                        isCurrent
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : 'bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-800'
                      }`}
                      title="Simular e navegar no sistema como este usuário"
                    >
                      <ArrowRight className="w-3 h-3" />
                      <span>{isCurrent ? 'Perfil Atual' : 'Acessar como'}</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setEditingPermissionsUser(user);
                          setIsNewUserModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition flex items-center space-x-1"
                        title="Editar dados cadastrais, cargo e permissões"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`p-1.5 rounded-xl border text-xs transition ${
                          user.status === 'active'
                            ? 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                            : 'text-slate-400 hover:bg-slate-100 border-slate-200'
                        }`}
                        title={user.status === 'active' ? 'Desativar acesso' : 'Reativar acesso'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      {user.id !== 'user-admin' && (
                        <button
                          onClick={() => {
                            if (confirm(`Deseja remover o acesso de ${user.name}?`)) {
                              deleteUser(user.id);
                            }
                          }}
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Excluir profissional"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MATRIZ DE PERMISSÕES (RBAC) */}
      {/* ========================================================= */}
      {activeTab === 'permissoes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-purple-600" />
                <span>Matriz de Controle de Acesso por Cargo (RBAC)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Regras de segurança e segregação de funções conforme RDC 502/2021 e Conselhos de Classe (CFM, COREN, CREFITO).
              </p>
            </div>
            <span className="text-xs font-bold text-purple-800 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
              8 Perfis Mapeados
            </span>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-4 font-bold text-slate-700">Módulo / Permissão de Acesso</th>
                  <th className="py-3 px-3 font-bold text-purple-900 text-center">Diretoria</th>
                  <th className="py-3 px-3 font-bold text-blue-900 text-center">Médico</th>
                  <th className="py-3 px-3 font-bold text-teal-900 text-center">Enfermeiro</th>
                  <th className="py-3 px-3 font-bold text-emerald-900 text-center">Cuidador</th>
                  <th className="py-3 px-3 font-bold text-amber-900 text-center">Fisioterapeuta</th>
                  <th className="py-3 px-3 font-bold text-green-900 text-center">Nutricionista</th>
                  <th className="py-3 px-3 font-bold text-indigo-900 text-center">Psicólogo</th>
                  <th className="py-3 px-3 font-bold text-slate-700 text-center">Familiar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  {
                    name: 'Prescrever Medicamentos',
                    desc: 'Criação e suspensão de receitas com dosagem e aprazamento',
                    roles: ['admin', 'medico']
                  },
                  {
                    name: 'Transcrever Receitas Externas',
                    desc: 'Passar receitas do médico assistente de fora para o sistema',
                    roles: ['admin', 'medico', 'enfermeiro']
                  },
                  {
                    name: 'Checar Medicamentos no Leito',
                    desc: 'Baixa de administração com 1 clique no Quadro de Plantão',
                    roles: ['admin', 'medico', 'enfermeiro', 'cuidador']
                  },
                  {
                    name: 'Registro de Rotina (< 1 min)',
                    desc: 'Banho, aceitação da dieta, evacuação e hidratação',
                    roles: ['admin', 'enfermeiro', 'cuidador', 'fisioterapeuta', 'nutricionista']
                  },
                  {
                    name: 'Escalas Geriátricas (Braden, Morse, Katz)',
                    desc: 'Cálculo de risco de queda, LPP e grau de dependência ANVISA',
                    roles: ['admin', 'medico', 'enfermeiro', 'fisioterapeuta', 'nutricionista', 'psicologo']
                  },
                  {
                    name: 'Acesso a Prontuário Sigiloso',
                    desc: 'Anotações médicas e psicológicas confidenciais (LGPD)',
                    roles: ['admin', 'medico', 'enfermeiro', 'psicologo']
                  },
                  {
                    name: 'Controle de Estoque e Suprimentos',
                    desc: 'Movimentar fraldas, dietas e notificar família no WhatsApp',
                    roles: ['admin', 'enfermeiro', 'cuidador', 'nutricionista']
                  },
                  {
                    name: 'Admissão e Cadastro de Residentes',
                    desc: 'Entrada de novos idosos, anamnese e alocação de quarto/leito',
                    roles: ['admin', 'medico', 'enfermeiro']
                  },
                  {
                    name: 'Gestão de Usuários & Acessos',
                    desc: 'Cadastrar novos profissionais e alterar permissões',
                    roles: ['admin']
                  },
                  {
                    name: 'Configurações da Clínica & Leitos',
                    desc: 'Alvarás, hotelaria de quartos e capacidade instalada',
                    roles: ['admin']
                  }
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block">{item.name}</span>
                      <span className="text-[11px] text-slate-400 block">{item.desc}</span>
                    </td>

                    {(['admin', 'medico', 'enfermeiro', 'cuidador', 'fisioterapeuta', 'nutricionista', 'psicologo', 'familiar'] as UserRole[]).map((r) => {
                      const hasAccess = item.roles.includes(r);
                      return (
                        <td key={r} className="py-3 px-3 text-center">
                          {hasAccess ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-300">
                              <X className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Custom Permissions per User list */}
          <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Ajuste Individual de Permissões por Profissional</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conceda ou restrinja permissões específicas para cada colaborador além do padrão de seu cargo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {users.map((u) => {
                const hasCustom = !!u.customPermissions;
                const roleInfo = ROLE_LABELS[u.role] || ROLE_LABELS.cuidador;
                return (
                  <div key={u.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:border-purple-300 transition">
                    <div className="flex items-center space-x-3">
                      <img
                        src={u.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=7c3aed&color=fff`}
                        alt={u.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h5 className="font-bold text-xs text-slate-800 leading-tight">{u.name}</h5>
                        <div className="flex items-center space-x-1.5 mt-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${roleInfo.color}`}>
                            {roleInfo.badge}
                          </span>
                          {hasCustom && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200">
                              Customizado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setEditingPermissionsUser(u);
                        setIsNewUserModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-purple-300 bg-white hover:bg-purple-50 text-purple-700 text-xs font-bold transition flex items-center space-x-1 shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                      <span>Editar</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: HOTELARIA & GESTÃO DE LEITOS */}
      {/* ========================================================= */}
      {activeTab === 'hotelaria' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <BedDouble className="w-5 h-5 text-purple-600" />
                <span>Mapa de Hotelaria & Ocupação de Leitos</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Capacidade instalada de {totalBeds} leitos • {occupiedBeds} ocupados • {availableBeds} disponíveis para acolhimento.
              </p>
            </div>

            <button
              onClick={() => setShowAddBedForm(!showAddBedForm)}
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-xs shrink-0 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Adicionar Leito / Quarto</span>
            </button>
          </div>

          {/* Quick Add Bed Form */}
          {showAddBedForm && (
            <form onSubmit={handleAddBed} className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[11px] font-bold text-purple-900 block mb-1">Nº Quarto</label>
                <input
                  type="text"
                  required
                  value={newBedRoom}
                  onChange={(e) => setNewBedRoom(e.target.value)}
                  placeholder="Ex: 106"
                  className="text-xs p-2 rounded-lg border border-purple-300 bg-white w-24"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-purple-900 block mb-1">Identificador Leito</label>
                <input
                  type="text"
                  required
                  value={newBedLetter}
                  onChange={(e) => setNewBedLetter(e.target.value)}
                  placeholder="Ex: A"
                  className="text-xs p-2 rounded-lg border border-purple-300 bg-white w-20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-purple-900 block mb-1">Tipo de Acomodação</label>
                <select
                  value={newBedType}
                  onChange={(e) => setNewBedType(e.target.value as any)}
                  className="text-xs p-2 rounded-lg border border-purple-300 bg-white"
                >
                  <option value="individual">Individual</option>
                  <option value="duplo">Duplo</option>
                  <option value="triplo">Triplo</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <button
                  type="submit"
                  className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                >
                  Salvar Leito
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBedForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 px-2 py-2"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Beds Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {beds.map((bed) => {
              const isOccupied = bed.status === 'ocupado';
              const isMaintenance = bed.status === 'manutencao';

              return (
                <div
                  key={bed.id}
                  className={`rounded-2xl border p-4 transition shadow-xs flex flex-col justify-between ${
                    isOccupied
                      ? 'bg-white border-blue-200'
                      : isMaintenance
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-emerald-50/40 border-emerald-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-800">
                        Quarto {bed.roomNumber} • Leito {bed.bedLetter}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isOccupied
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : isMaintenance
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        {bed.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 capitalize">
                      Acomodação {bed.type}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-100">
                      {bed.residentName ? (
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Residente Ocupante:</span>
                          <span className="text-xs font-bold text-slate-800 block truncate">{bed.residentName}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-400 italic">Leito Desocupado</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleToggleBedStatus(bed.id)}
                      disabled={isOccupied}
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40"
                    >
                      {isMaintenance ? 'Finalizar Manutenção' : 'Pôr em Manutenção'}
                    </button>
                    <span className="text-[11px] text-slate-400 font-mono">
                      R$ {bed.dailyRate || 280}/dia
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: INSTITUIÇÃO & ALVARÁS */}
      {/* ========================================================= */}
      {activeTab === 'instituicao' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <span>Dados Institucionais & Conformidade Sanitária</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Informações para cabeçalhos de prontuários, receitas digitais e relatórios da Vigilância Sanitária (VISA).
              </p>
            </div>

            {savedSettingsNotice && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center space-x-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Dados atualizados com sucesso!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveClinicSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nome Fantasia da ILPI</label>
                <input
                  type="text"
                  value={clinicSettings.name}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Razão Social</label>
                <input
                  type="text"
                  value={clinicSettings.tradingName}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, tradingName: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">CNPJ</label>
                <input
                  type="text"
                  value={clinicSettings.cnpj}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, cnpj: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Alvará Sanitário (Vigilância Sanitária)</label>
                <input
                  type="text"
                  value={clinicSettings.sanitaryLicense}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, sanitaryLicense: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Diretor Clínico / RT Médico</label>
                <input
                  type="text"
                  value={clinicSettings.technicalDirectorMedical}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, technicalDirectorMedical: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Responsável Técnica (RT) de Enfermagem</label>
                <input
                  type="text"
                  value={clinicSettings.technicalDirectorNursing}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, technicalDirectorNursing: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={clinicSettings.address}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, address: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Telefone / Contato Oficial</label>
                <input
                  type="text"
                  value={clinicSettings.phone}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, phone: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 block">Horários dos Turnos de Plantão:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Turno Manhã:</span>
                  <span className="font-semibold text-slate-700">{clinicSettings.shiftHours.manha}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Turno Tarde:</span>
                  <span className="font-semibold text-slate-700">{clinicSettings.shiftHours.tarde}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Turno Noite:</span>
                  <span className="font-semibold text-slate-700">{clinicSettings.shiftHours.noite}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configurações da Instituição</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal de Cadastro e Edição de Profissional */}
      <NovoProfissionalModal
        isOpen={isNewUserModalOpen}
        onClose={() => {
          setIsNewUserModalOpen(false);
          setEditingPermissionsUser(null);
        }}
        onSave={(userData, idToEdit) => {
          if (idToEdit) {
            updateUser(idToEdit, userData);
          } else {
            addUser(userData);
          }
          setIsNewUserModalOpen(false);
          setEditingPermissionsUser(null);
        }}
        userToEdit={editingPermissionsUser}
      />

    </div>
  );
}
