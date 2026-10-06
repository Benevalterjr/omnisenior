import { 
  UserRole, 
  UserPermissions, 
  UserProfile, 
  ClinicSettings, 
  ClinicRoomBed 
} from '@/types/ilpi';

export const ROLE_LABELS: Record<UserRole, { title: string; badge: string; color: string }> = {
  admin: {
    title: 'Diretoria / Administrador Geral',
    badge: 'Diretoria',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  medico: {
    title: 'Médico Assistente / Geriatra',
    badge: 'Médico',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  enfermeiro: {
    title: 'Enfermeiro(a) / Resp. Técnico',
    badge: 'Enfermagem',
    color: 'bg-teal-100 text-teal-800 border-teal-200'
  },
  cuidador: {
    title: 'Cuidador de Idosos / Técnico',
    badge: 'Cuidador',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  fisioterapeuta: {
    title: 'Fisioterapeuta',
    badge: 'Fisioterapia',
    color: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  nutricionista: {
    title: 'Nutricionista Clínico',
    badge: 'Nutrição',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  psicologo: {
    title: 'Psicólogo(a)',
    badge: 'Psicologia',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  familiar: {
    title: 'Familiar / Responsável Legal',
    badge: 'Familiar',
    color: 'bg-slate-100 text-slate-800 border-slate-200'
  }
};

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canPrescribe: true,
    canTranscribe: true,
    canAdministerMedication: true,
    canLogRoutine: true,
    canApplyScales: true,
    canViewConfidential: true,
    canManageInventory: true,
    canManageResidents: true,
    canManageUsers: true,
    canManageSettings: true
  },
  medico: {
    canPrescribe: true,
    canTranscribe: true,
    canAdministerMedication: true,
    canLogRoutine: false,
    canApplyScales: true,
    canViewConfidential: true,
    canManageInventory: false,
    canManageResidents: true,
    canManageUsers: false,
    canManageSettings: false
  },
  enfermeiro: {
    canPrescribe: false,
    canTranscribe: true,
    canAdministerMedication: true,
    canLogRoutine: true,
    canApplyScales: true,
    canViewConfidential: true,
    canManageInventory: true,
    canManageResidents: true,
    canManageUsers: false,
    canManageSettings: false
  },
  cuidador: {
    canPrescribe: false,
    canTranscribe: false,
    canAdministerMedication: true,
    canLogRoutine: true,
    canApplyScales: false,
    canViewConfidential: false,
    canManageInventory: true,
    canManageResidents: false,
    canManageUsers: false,
    canManageSettings: false
  },
  fisioterapeuta: {
    canPrescribe: false,
    canTranscribe: false,
    canAdministerMedication: false,
    canLogRoutine: true,
    canApplyScales: true,
    canViewConfidential: false,
    canManageInventory: false,
    canManageResidents: false,
    canManageUsers: false,
    canManageSettings: false
  },
  nutricionista: {
    canPrescribe: false,
    canTranscribe: false,
    canAdministerMedication: false,
    canLogRoutine: true,
    canApplyScales: true,
    canViewConfidential: false,
    canManageInventory: true,
    canManageResidents: false,
    canManageUsers: false,
    canManageSettings: false
  },
  psicologo: {
    canPrescribe: false,
    canTranscribe: false,
    canAdministerMedication: false,
    canLogRoutine: false,
    canApplyScales: true,
    canViewConfidential: true,
    canManageInventory: false,
    canManageResidents: false,
    canManageUsers: false,
    canManageSettings: false
  },
  familiar: {
    canPrescribe: false,
    canTranscribe: false,
    canAdministerMedication: false,
    canLogRoutine: false,
    canApplyScales: false,
    canViewConfidential: false,
    canManageInventory: false,
    canManageResidents: false,
    canManageUsers: false,
    canManageSettings: false
  }
};

export function getUserPermissions(user?: UserProfile | null): UserPermissions {
  if (!user) {
    return DEFAULT_ROLE_PERMISSIONS.familiar;
  }
  const defaultPerms = DEFAULT_ROLE_PERMISSIONS[user.role] || DEFAULT_ROLE_PERMISSIONS.cuidador;
  return {
    ...defaultPerms,
    ...(user.customPermissions || {})
  };
}

export const INITIAL_CLINIC_SETTINGS: ClinicSettings = {
  name: 'OmniSenior Residencial Geriátrico & Longevidade',
  tradingName: 'OmniSenior Cuidados Especiais Ltda.',
  cnpj: '34.892.102/0001-44',
  sanitaryLicense: 'Alvará VISA/SP nº 2026/08942-0 (Vigência 2026-2027)',
  technicalDirectorMedical: 'Dr. Roberto Mendes (CRM/SP 123456)',
  technicalDirectorNursing: 'Enf. Juliana Ramos (COREN/SP 456789 - RT)',
  phone: '(11) 3456-7890 / WhatsApp (11) 98765-4321',
  email: 'diretoria@omnisenior.com.br',
  address: 'Alameda dos Ipês, 450 - Jardim Paulista, São Paulo - SP',
  totalBedsCapacity: 30,
  shiftHours: {
    manha: '07:00 às 13:00 (Turno Manhã)',
    tarde: '13:00 às 19:00 (Turno Tarde)',
    noite: '19:00 às 07:00 (Turno Noite / Plantão 12h)'
  }
};

export const INITIAL_ROOM_BEDS: ClinicRoomBed[] = [
  { id: 'bed-101-a', roomNumber: '101', bedLetter: 'A', type: 'duplo', residentId: 'res-1', residentName: 'Dona Sebastiana de Albuquerque', status: 'ocupado', dailyRate: 280 },
  { id: 'bed-101-b', roomNumber: '101', bedLetter: 'B', type: 'duplo', status: 'disponivel', dailyRate: 280 },
  { id: 'bed-102-a', roomNumber: '102', bedLetter: 'A', type: 'individual', status: 'disponivel', dailyRate: 380 },
  { id: 'bed-102-b', roomNumber: '102', bedLetter: 'B', type: 'duplo', residentId: 'res-2', residentName: 'Seu Benedito Santos Filho', status: 'ocupado', dailyRate: 280 },
  { id: 'bed-103-a', roomNumber: '103', bedLetter: 'A', type: 'duplo', residentId: 'res-3', residentName: 'Dona Maria de Lourdes Paiva', status: 'ocupado', dailyRate: 280 },
  { id: 'bed-103-b', roomNumber: '103', bedLetter: 'B', type: 'duplo', status: 'disponivel', dailyRate: 280 },
  { id: 'bed-104-a', roomNumber: '104', bedLetter: 'A', type: 'individual', residentId: 'res-4', residentName: 'Seu Antônio Carlos Fagundes', status: 'ocupado', dailyRate: 350 },
  { id: 'bed-105-a', roomNumber: '105', bedLetter: 'A', type: 'duplo', status: 'manutencao', dailyRate: 280 },
  { id: 'bed-105-b', roomNumber: '105', bedLetter: 'B', type: 'duplo', status: 'disponivel', dailyRate: 280 }
];
