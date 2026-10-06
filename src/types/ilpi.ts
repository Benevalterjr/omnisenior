export type UserRole = 'admin' | 'medico' | 'enfermeiro' | 'cuidador' | 'familiar';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  registry?: string; // COREN, CRM, etc.
  phone?: string;
  createdAt?: any;
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

export type ShiftType = 'manha' | 'tarde' | 'noite';
