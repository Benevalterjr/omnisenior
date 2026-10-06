export type UserRole = 
  | 'admin' 
  | 'medico' 
  | 'enfermeiro' 
  | 'cuidador' 
  | 'fisioterapeuta' 
  | 'nutricionista' 
  | 'psicologo' 
  | 'familiar';

export interface UserPermissions {
  canPrescribe: boolean;              // Prescrever medicamentos
  canTranscribe: boolean;             // Transcrever receitas externas
  canAdministerMedication: boolean;   // Baixa/checagem no quadro de plantão
  canLogRoutine: boolean;             // Registrar rotina rápida (<1 min)
  canApplyScales: boolean;            // Aplicar escalas Braden, Morse, Katz
  canViewConfidential: boolean;       // Ver prontuário sigiloso
  canManageInventory: boolean;        // Movimentar e cadastrar estoque
  canManageResidents: boolean;        // Cadastrar e editar residentes
  canManageUsers: boolean;            // Adicionar e gerenciar equipe
  canManageSettings: boolean;         // Alterar dados da clínica e leitos
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string; // Senha cadastrada pelo Admin Master
  role: UserRole;
  registry?: string; // COREN, CRM, CREFITO, CRN, CRP, etc.
  phone?: string;
  specialty?: string;
  shiftPreference?: 'manha' | 'tarde' | 'noite' | 'comercial' | 'escala_12x36';
  status?: 'active' | 'inactive';
  customPermissions?: Partial<UserPermissions>;
  photoUrl?: string;
  createdAt?: any;
}

export interface ClinicRoomBed {
  id: string;
  roomNumber: string;
  bedLetter: string; // 'A', 'B', 'C'
  type: 'individual' | 'duplo' | 'triplo';
  residentId?: string;
  residentName?: string;
  status: 'ocupado' | 'disponivel' | 'manutencao';
  dailyRate?: number;
}

export interface ClinicSettings {
  name: string;
  tradingName: string;
  cnpj: string;
  sanitaryLicense: string;
  technicalDirectorMedical: string;
  technicalDirectorNursing: string;
  phone: string;
  email: string;
  address: string;
  totalBedsCapacity: number;
  shiftHours: {
    manha: string;
    tarde: string;
    noite: string;
  };
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface Resident {
  id: string;
  name: string;
  birthDate: string; // ISO ou DD/MM/AAAA
  room: string;
  bed: string;
  allergies: string[];
  dietType: string;
  emergencyContacts: EmergencyContact[];
  photoUrl?: string;
  status?: 'active' | 'hospitalized' | 'leave';
  notes?: string;
  bradenRisk?: 'muito_alto' | 'alto' | 'moderado' | 'baixo' | 'sem_risco';
  morseRisk?: 'baixo' | 'moderado' | 'alto';
  katzDegree?: 'grau_1' | 'grau_2' | 'grau_3';
  latestAssessment?: GeriatricAssessment;
  createdAt?: any;
}

export type MedicationRoute = 'oral' | 'sublingual' | 'topico' | 'injetavel' | 'ocular' | 'inalatorio';

export interface Prescription {
  id: string;
  residentId?: string;
  medicationName: string;
  dosage: string; // ex: "50mg", "2 gotas"
  route: MedicationRoute;
  scheduleTimes: string[]; // ex: ["08:00", "14:00", "20:00"]
  startDate: string;
  endDate?: string;
  status: 'active' | 'suspended';
  prescribedBy?: {
    uid: string;
    name: string;
    registry?: string;
  };
  instructions?: string;
  createdAt?: any;
}

export type MedicationLogStatus = 'scheduled' | 'administered' | 'refused' | 'delayed';

export interface MedicationLog {
  id: string;
  prescriptionId: string;
  residentId?: string;
  medicationName: string;
  dosage?: string;
  route?: MedicationRoute | string;
  scheduledTime: string; // "08:00"
  scheduledFor: any; // Date ou Timestamp
  administeredAt?: any; // Date | Timestamp | null
  administeredBy?: {
    uid: string;
    name: string;
    role: UserRole;
  } | null;
  status: MedicationLogStatus;
  notes?: string;
}

export interface VitalSigns {
  bp?: string; // Pressão arterial ex: "120/80"
  glucose?: number; // Glicemia em mg/dL ex: 98
  hr?: number; // Frequência cardíaca em bpm ex: 72
  temp?: number; // Temperatura em °C ex: 36.5
  o2?: number; // Saturação de O2 em % ex: 97
}

export type EvolutionType = 'enfermagem' | 'cuidador' | 'fisioterapia' | 'medica';

export interface Evolution {
  id: string;
  residentId?: string;
  author: {
    uid: string;
    name: string;
    role: UserRole;
    registry?: string;
  };
  date: any;
  type: EvolutionType;
  text: string;
  vitalSigns?: VitalSigns;
  createdAt?: any;
}

export interface IndividualInventoryItem {
  id: string;
  residentId?: string;
  itemName: string; // ex: "Fralda G", "Losartana 50mg"
  category?: 'medicamento' | 'higiene' | 'alimentacao' | 'outro';
  currentQuantity: number;
  minAlertQuantity: number;
  unit?: string; // "unidades", "comprimidos", "pacotes", "frascos"
  lastUpdated: any;
}

export interface CaregiverRoutine {
  residentId: string;
  residentName?: string;
  date: string;
  bath: 'leito' | 'aspersao' | 'recusou' | 'nao_previsto';
  dietAcceptance: '100%' | '75%' | '50%' | 'pouca' | 'recusou';
  hydrationMl: number;
  evacuation: boolean;
  bristolScale?: number; // 1 a 7
  diuresis: 'normal' | 'pouca' | 'ausente' | 'sonda';
  vitalSigns?: VitalSigns;
  notes?: string;
  caregiver: {
    uid: string;
    name: string;
    role: UserRole;
  };
}

export interface BradenScale {
  sensoryPerception: 1 | 2 | 3 | 4; // 1: Totalmente limitado, 2: Muito limitado, 3: Levemente limitado, 4: Nenhuma limitação
  moisture: 1 | 2 | 3 | 4;          // 1: Constantemente úmida, 2: Muito úmida, 3: Ocasionalmente úmida, 4: Raramente úmida
  activity: 1 | 2 | 3 | 4;          // 1: Acamado, 2: Confinado à cadeira, 3: Deambula ocasionalmente, 4: Deambula frequentemente
  mobility: 1 | 2 | 3 | 4;          // 1: Totalmente imóvel, 2: Muito limitado, 3: Levemente limitado, 4: Não apresenta limitações
  nutrition: 1 | 2 | 3 | 4;         // 1: Muito pobre, 2: Provavelmente inadequada, 3: Adequada, 4: Excelente
  frictionShear: 1 | 2 | 3;         // 1: Problema, 2: Problema potencial, 3: Nenhum problema aparente
  totalScore: number;               // 6 a 23
  riskLevel: 'muito_alto' | 'alto' | 'moderado' | 'baixo' | 'sem_risco';
  recommendedActions: string[];
}

export interface MorseScale {
  fallHistory: 0 | 25;              // 0: Não, 25: Sim (últimos 3 meses)
  secondaryDiagnosis: 0 | 15;       // 0: Não, 15: Sim (mais de 1 diagnóstico)
  ambulatoryAid: 0 | 15 | 30;        // 0: Nenhuma/acamado/auxiliado por profissional, 15: Bengala/muleta/andador, 30: Apoia-se na mobília
  ivTherapy: 0 | 20;                // 0: Não, 20: Sim (acesso venoso / heparina / soroterapia)
  gait: 0 | 10 | 20;                 // 0: Normal/acamado/cadeira de rodas, 10: Fraca/passos curtos, 20: Comprometida/cambaleante
  mentalStatus: 0 | 15;             // 0: Orientado sobre suas limitações, 15: Superestima capacidade / esquece limitações
  totalScore: number;               // 0 a 125
  riskLevel: 'baixo' | 'moderado' | 'alto';
  recommendedActions: string[];
}

export interface KatzScale {
  bathing: 0 | 1;                   // 1: Independente, 0: Dependente
  dressing: 0 | 1;                  // 1: Independente, 0: Dependente
  toileting: 0 | 1;                 // 1: Independente, 0: Dependente
  transferring: 0 | 1;              // 1: Independente, 0: Dependente
  continence: 0 | 1;                // 1: Independente, 0: Dependente
  feeding: 0 | 1;                   // 1: Independente, 0: Dependente
  totalScore: number;               // 0 a 6
  dependencyDegree: 'grau_1' | 'grau_2' | 'grau_3'; // Classificação ANVISA RDC 502/2021
  dependencyDescription: string;
  recommendedCaregiverRatio: string; // Ex: "1 cuidador para cada 10 residentes"
}

export interface GeriatricAssessment {
  id: string;
  residentId: string;
  residentName?: string;
  date: string; // ISO ou DD/MM/AAAA
  evaluatedBy: {
    uid: string;
    name: string;
    role: UserRole;
    registry?: string;
  };
  braden: BradenScale;
  morse: MorseScale;
  katz: KatzScale;
  clinicalSummary: string;
  createdAt?: any;
}

export type ShiftType = 'manha' | 'tarde' | 'noite';

export type TimelineEventType = 
  | 'medication'      // 💊 Doses administradas, recusadas, adiadas
  | 'diet'            // 🥣 Alimentação / Aceitação
  | 'hydration'       // 💧 Hidratação (ml)
  | 'hygiene_bath'    // 🚿 Banho e higiene oral
  | 'diaper_elim'     // 🧻 Troca de fralda / Diurese / Evacuação (Bristol)
  | 'turnover'        // 🔄 Mudança de decúbito (Braden)
  | 'vitals'          // 🩺 Sinais vitais (PA, Glicemia, Temp, SatO2, FC)
  | 'evolution';      // 📝 Anotação clínica multiprofissional

export interface TimelineEvent {
  id: string;
  residentId: string;
  type: TimelineEventType;
  timestamp: string; // ISO string
  timeDisplay: string; // Ex: "Hoje às 14:30" ou "Ontem às 20:00"
  hour: string; // Ex: "14:30"
  dateKey: string; // Ex: "2026-10-06"
  shift: ShiftType;
  title: string;
  description?: string;
  status?: 'success' | 'warning' | 'alert' | 'info';
  author: {
    uid: string;
    name: string;
    role: UserRole;
    registry?: string;
  };
  metrics?: {
    hydrationMl?: number;
    dietPercent?: string;
    bristolScale?: number;
    bathType?: string;
    diuresis?: string;
    decubitusPosition?: string;
    vitalSigns?: VitalSigns;
    medicationStatus?: MedicationLogStatus;
    medicationName?: string;
    dosage?: string;
  };
}
