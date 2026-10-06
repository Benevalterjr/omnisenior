import { Resident, Prescription, MedicationLog, Evolution, IndividualInventoryItem, GeriatricAssessment, UserProfile, TimelineEvent } from '@/types/ilpi';
import { calculateBraden, calculateMorse, calculateKatz } from './geriatricScales';

export const INITIAL_RESIDENTS: Resident[] = [
  {
    id: 'res-1',
    name: 'Dona Sebastiana de Albuquerque',
    birthDate: '1940-03-15',
    room: '101',
    bed: 'A',
    allergies: ['Penicilina', 'Dipirona'],
    dietType: 'Pastosa com espessante nível 2',
    emergencyContacts: [
      { name: 'Carlos Albuquerque (Filho)', phone: '(11) 98765-4321', relation: 'Filho' },
      { name: 'Dra. Marina (Médica Família)', phone: '(11) 99876-1234', relation: 'Médica Externa' },
    ],
    photoUrl: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&q=80&w=250',
    status: 'active',
    bradenRisk: 'baixo',
    morseRisk: 'moderado',
    katzDegree: 'grau_2',
    notes: 'Necessita de auxílio para deambulação. Risco moderado de queda (Morse 40). Grau II ANVISA.'
  },
  {
    id: 'res-2',
    name: 'Seu Benedito Santos Filho',
    birthDate: '1945-08-22',
    room: '102',
    bed: 'B',
    allergies: ['Nenhuma conhecida'],
    dietType: 'Geral hipossódica para diabético',
    emergencyContacts: [
      { name: 'Mariana Santos (Filha)', phone: '(11) 99123-8877', relation: 'Filha' }
    ],
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=250',
    status: 'active',
    bradenRisk: 'sem_risco',
    morseRisk: 'baixo',
    katzDegree: 'grau_1',
    notes: 'Diabético tipo 2 insulino-dependente. Monitorar glicemia capilar antes das refeições. Grau I ANVISA.'
  },
  {
    id: 'res-3',
    name: 'Dona Maria de Lourdes Paiva',
    birthDate: '1933-11-04',
    room: '103',
    bed: 'A',
    allergies: ['AAS / Salicilatos', 'Frutos do Mar'],
    dietType: 'Branda com restrição de sódio',
    emergencyContacts: [
      { name: 'Beatriz Paiva (Sobrinha)', phone: '(11) 97654-3210', relation: 'Sobrinha' }
    ],
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    status: 'active',
    bradenRisk: 'moderado',
    morseRisk: 'alto',
    katzDegree: 'grau_2',
    notes: 'Quadro de demência mista (Alzheimer leve). Muito comunicativa pela manhã. Risco de Queda Alto.'
  },
  {
    id: 'res-4',
    name: 'Seu Antônio Carlos Fagundes',
    birthDate: '1937-05-19',
    room: '104',
    bed: 'A',
    allergies: ['Sulfas'],
    dietType: 'Líquida pastosa',
    emergencyContacts: [
      { name: 'Helena Fagundes (Esposa)', phone: '(11) 98888-1122', relation: 'Cônjuge' }
    ],
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250',
    status: 'active',
    bradenRisk: 'muito_alto',
    morseRisk: 'alto',
    katzDegree: 'grau_3',
    notes: 'Acamado no momento por pós-operatório de fêmur. Mudança de decúbito de 2h em 2h. Grau III ANVISA.'
  }
];

export const INITIAL_PRESCRIPTIONS: Record<string, Prescription[]> = {
  'res-1': [
    {
      id: 'presc-1-1',
      residentId: 'res-1',
      medicationName: 'Losartana Potássica',
      dosage: '50mg',
      route: 'oral',
      scheduleTimes: ['08:00', '20:00'],
      startDate: '2026-01-10',
      status: 'active',
      instructions: 'Administrar com água após desjejum e jantar.',
      prescribedBy: { uid: 'med-1', name: 'Dr. Roberto Mendes', registry: 'CRM/SP 123456' }
    },
    {
      id: 'presc-1-2',
      residentId: 'res-1',
      medicationName: 'Omeprazol',
      dosage: '20mg',
      route: 'oral',
      scheduleTimes: ['07:00'],
      startDate: '2026-01-10',
      status: 'active',
      instructions: 'Em jejum 30 minutos antes do café da manhã.',
      prescribedBy: { uid: 'med-1', name: 'Dr. Roberto Mendes', registry: 'CRM/SP 123456' }
    },
    {
      id: 'presc-1-3',
      residentId: 'res-1',
      medicationName: 'Quetiapina',
      dosage: '25mg',
      route: 'oral',
      scheduleTimes: ['21:00'],
      startDate: '2026-02-01',
      status: 'active',
      instructions: 'Para indução do sono.',
      prescribedBy: { uid: 'med-1', name: 'Dr. Roberto Mendes', registry: 'CRM/SP 123456' }
    }
  ],
  'res-2': [
    {
      id: 'presc-2-1',
      residentId: 'res-2',
      medicationName: 'Metformina',
      dosage: '850mg',
      route: 'oral',
      scheduleTimes: ['08:00', '18:00'],
      startDate: '2026-01-05',
      status: 'active',
      instructions: 'Junto com as refeições principais.',
      prescribedBy: { uid: 'med-1', name: 'Dr. Roberto Mendes', registry: 'CRM/SP 123456' }
    },
    {
      id: 'presc-2-2',
      residentId: 'res-2',
      medicationName: 'Gliclazida MR',
      dosage: '30mg',
      route: 'oral',
      scheduleTimes: ['08:00'],
      startDate: '2026-01-05',
      status: 'active',
      instructions: 'No café da manhã.',
      prescribedBy: { uid: 'med-1', name: 'Dr. Roberto Mendes', registry: 'CRM/SP 123456' }
    },
    {
      id: 'presc-2-3',
      residentId: 'res-2',
      medicationName: 'Insulina NPH',
      dosage: '14 UI',
      route: 'injetavel',
      scheduleTimes: ['07:30'],
      startDate: '2026-01-05',
      status: 'active',
      instructions: 'Subcutânea na região periumbilical. Checar HGT antes.',
      prescribedBy: { uid: 'med-1', name: 'Dr. Roberto Mendes', registry: 'CRM/SP 123456' }
    }
  ],
  'res-3': [
    {
      id: 'presc-3-1',
      residentId: 'res-3',
      medicationName: 'Memantina',
      dosage: '10mg',
      route: 'oral',
      scheduleTimes: ['08:00'],
      startDate: '2026-01-15',
      status: 'active',
      instructions: 'Pela manhã com desjejum.',
      prescribedBy: { uid: 'med-1', name: 'Dr. Roberto Mendes', registry: 'CRM/SP 123456' }
    },
    {
      id: 'presc-3-2',
      residentId: 'res-3',
      medicationName: 'Lactulose Xarope',
      dosage: '15ml',
      route: 'oral',
      scheduleTimes: ['14:00'],
      startDate: '2026-02-10',
      status: 'active',
      instructions: 'Pode ser misturado com suco de laranja.',
      prescribedBy: { uid: 'med-1', name: 'Dr. Roberto Mendes', registry: 'CRM/SP 123456' }
    },
    {
      id: 'presc-3-3',
      residentId: 'res-3',
      medicationName: 'Donepezila',
      dosage: '10mg',
      route: 'oral',
      scheduleTimes: ['20:00'],
      startDate: '2026-01-15',
      status: 'active',
      instructions: 'À noite ao deitar.',
      prescribedBy: { uid: 'med-1', name: 'Dr. Roberto Mendes', registry: 'CRM/SP 123456' }
    }
  ],
  'res-4': [
    {
      id: 'presc-4-1',
      residentId: 'res-4',
      medicationName: 'Enalapril',
      dosage: '10mg',
      route: 'oral',
      scheduleTimes: ['08:00', '20:00'],
      startDate: '2026-02-20',
      status: 'active',
      instructions: 'Controle pressórico.',
      prescribedBy: { uid: 'med-1', name: 'Dr. Roberto Mendes', registry: 'CRM/SP 123456' }
    },
    {
      id: 'presc-4-2',
      residentId: 'res-4',
      medicationName: 'AAS Infantil',
      dosage: '100mg',
      route: 'oral',
      scheduleTimes: ['12:00'],
      startDate: '2026-02-20',
      status: 'active',
      instructions: 'Após o almoço.',
      prescribedBy: { uid: 'med-1', name: 'Dr. Roberto Mendes', registry: 'CRM/SP 123456' }
    }
  ]
};

export const INITIAL_MEDICATION_LOGS: Record<string, MedicationLog[]> = {
  'res-1': [
    {
      id: 'log-1-1',
      prescriptionId: 'presc-1-2',
      residentId: 'res-1',
      medicationName: 'Omeprazol 20mg',
      dosage: '20mg',
      route: 'oral',
      scheduledTime: '07:00',
      scheduledFor: 'Hoje às 07:00',
      administeredAt: 'Hoje às 07:05',
      administeredBy: { uid: 'enf-1', name: 'Enf. Juliana Ramos', role: 'enfermeiro' },
      status: 'administered',
      notes: 'Ingerido com água sem intercorrências.'
    },
    {
      id: 'log-1-2',
      prescriptionId: 'presc-1-1',
      residentId: 'res-1',
      medicationName: 'Losartana Potássica 50mg',
      dosage: '50mg',
      route: 'oral',
      scheduledTime: '08:00',
      scheduledFor: 'Hoje às 08:00',
      administeredAt: null,
      administeredBy: null,
      status: 'scheduled',
      notes: 'Pendente de checagem no turno matutino.'
    },
    {
      id: 'log-1-3',
      prescriptionId: 'presc-1-1',
      residentId: 'res-1',
      medicationName: 'Losartana Potássica 50mg',
      dosage: '50mg',
      route: 'oral',
      scheduledTime: '20:00',
      scheduledFor: 'Hoje às 20:00',
      administeredAt: null,
      administeredBy: null,
      status: 'scheduled'
    },
    {
      id: 'log-1-4',
      prescriptionId: 'presc-1-3',
      residentId: 'res-1',
      medicationName: 'Quetiapina 25mg',
      dosage: '25mg',
      route: 'oral',
      scheduledTime: '21:00',
      scheduledFor: 'Hoje às 21:00',
      administeredAt: null,
      administeredBy: null,
      status: 'scheduled'
    }
  ],
  'res-2': [
    {
      id: 'log-2-1',
      prescriptionId: 'presc-2-3',
      residentId: 'res-2',
      medicationName: 'Insulina NPH 14 UI',
      dosage: '14 UI',
      route: 'injetavel',
      scheduledTime: '07:30',
      scheduledFor: 'Hoje às 07:30',
      administeredAt: 'Hoje às 07:32',
      administeredBy: { uid: 'enf-1', name: 'Enf. Juliana Ramos', role: 'enfermeiro' },
      status: 'administered',
      notes: 'Glicemia prévia: 118 mg/dL. Aplicada em flanco esquerdo.'
    },
    {
      id: 'log-2-2',
      prescriptionId: 'presc-2-1',
      residentId: 'res-2',
      medicationName: 'Metformina 850mg',
      dosage: '850mg',
      route: 'oral',
      scheduledTime: '08:00',
      scheduledFor: 'Hoje às 08:00',
      administeredAt: null,
      administeredBy: null,
      status: 'scheduled'
    },
    {
      id: 'log-2-3',
      prescriptionId: 'presc-2-2',
      residentId: 'res-2',
      medicationName: 'Gliclazida MR 30mg',
      dosage: '30mg',
      route: 'oral',
      scheduledTime: '08:00',
      scheduledFor: 'Hoje às 08:00',
      administeredAt: null,
      administeredBy: null,
      status: 'scheduled'
    },
    {
      id: 'log-2-4',
      prescriptionId: 'presc-2-1',
      residentId: 'res-2',
      medicationName: 'Metformina 850mg',
      dosage: '850mg',
      route: 'oral',
      scheduledTime: '18:00',
      scheduledFor: 'Hoje às 18:00',
      administeredAt: null,
      administeredBy: null,
      status: 'scheduled'
    }
  ],
  'res-3': [
    {
      id: 'log-3-1',
      prescriptionId: 'presc-3-1',
      residentId: 'res-3',
      medicationName: 'Memantina 10mg',
      dosage: '10mg',
      route: 'oral',
      scheduledTime: '08:00',
      scheduledFor: 'Hoje às 08:00',
      administeredAt: 'Hoje às 08:15',
      administeredBy: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      status: 'administered',
      notes: 'Tomou tranquilamente com leite morno.'
    },
    {
      id: 'log-3-2',
      prescriptionId: 'presc-3-2',
      residentId: 'res-3',
      medicationName: 'Lactulose Xarope 15ml',
      dosage: '15ml',
      route: 'oral',
      scheduledTime: '14:00',
      scheduledFor: 'Hoje às 14:00',
      administeredAt: null,
      administeredBy: null,
      status: 'scheduled'
    },
    {
      id: 'log-3-3',
      prescriptionId: 'presc-3-3',
      residentId: 'res-3',
      medicationName: 'Donepezila 10mg',
      dosage: '10mg',
      route: 'oral',
      scheduledTime: '20:00',
      scheduledFor: 'Hoje às 20:00',
      administeredAt: null,
      administeredBy: null,
      status: 'scheduled'
    }
  ],
  'res-4': [
    {
      id: 'log-4-1',
      prescriptionId: 'presc-4-1',
      residentId: 'res-4',
      medicationName: 'Enalapril 10mg',
      dosage: '10mg',
      route: 'oral',
      scheduledTime: '08:00',
      scheduledFor: 'Hoje às 08:00',
      administeredAt: 'Hoje às 08:25',
      administeredBy: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      status: 'refused',
      notes: 'Residente queixou-se de náusea matinal e cuspiu a água. Notificada enfermagem.'
    },
    {
      id: 'log-4-2',
      prescriptionId: 'presc-4-2',
      residentId: 'res-4',
      medicationName: 'AAS Infantil 100mg',
      dosage: '100mg',
      route: 'oral',
      scheduledTime: '12:00',
      scheduledFor: 'Hoje às 12:00',
      administeredAt: null,
      administeredBy: null,
      status: 'scheduled'
    }
  ]
};

export const INITIAL_EVOLUTIONS: Record<string, Evolution[]> = {
  'res-1': [
    {
      id: 'evo-1-1',
      residentId: 'res-1',
      author: { uid: 'enf-1', name: 'Enf. Juliana Ramos', role: 'enfermeiro', registry: 'COREN/SP 456789' },
      date: 'Hoje às 09:30',
      type: 'enfermagem',
      text: 'Paciente calma, orientada no tempo e espaço. Pele íntegra sem lesões por pressão (Braden 16). Aceitou 100% da dieta pastosa. Diurese clara e abundante.',
      vitalSigns: { bp: '125/80', glucose: 104, hr: 74, temp: 36.3, o2: 97 }
    },
    {
      id: 'evo-1-2',
      residentId: 'res-1',
      author: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      date: 'Hoje às 07:45',
      type: 'cuidador',
      text: 'Banho de aspersão realizado em cadeira de banho com auxílio de 1 cuidador. Boa higiene oral. Cabelos lavados e secos.',
      vitalSigns: { temp: 36.4 }
    }
  ],
  'res-2': [
    {
      id: 'evo-2-1',
      residentId: 'res-2',
      author: { uid: 'enf-1', name: 'Enf. Juliana Ramos', role: 'enfermeiro', registry: 'COREN/SP 456789' },
      date: 'Hoje às 08:10',
      type: 'enfermagem',
      text: 'Monitorização glicêmica em jejum: 118 mg/dL. Administrada insulina conforme prescrição. Sem sinais de hipoglicemia. Bom humor matinal.',
      vitalSigns: { bp: '130/85', glucose: 118, hr: 78, temp: 36.6, o2: 96 }
    }
  ],
  'res-3': [
    {
      id: 'evo-3-1',
      residentId: 'res-3',
      author: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      date: 'Hoje às 10:00',
      type: 'cuidador',
      text: 'Participou das atividades de estimulação cognitiva com a equipe no jardim. Hidratada com 300ml de suco de maracujá.',
      vitalSigns: { bp: '120/75', hr: 70, temp: 36.5, o2: 98 }
    }
  ],
  'res-4': [
    {
      id: 'evo-4-1',
      residentId: 'res-4',
      author: { uid: 'enf-1', name: 'Enf. Juliana Ramos', role: 'enfermeiro', registry: 'COREN/SP 456789' },
      date: 'Hoje às 08:40',
      type: 'enfermagem',
      text: 'Atenção: Residente apresentou episódio de náusea leve e recusou medicação anti-hipertensiva matinal. PA aferida em 140/90 mmHg. Mantido em repouso elevado no leito. Comunicado médico de plantão.',
      vitalSigns: { bp: '140/90', hr: 84, temp: 36.8, o2: 95 }
    }
  ]
};

export const INITIAL_INVENTORY: Record<string, IndividualInventoryItem[]> = {
  'res-1': [
    {
      id: 'inv-1-1',
      residentId: 'res-1',
      itemName: 'Fralda Geriátrica G (Pacote c/ 8)',
      category: 'higiene',
      currentQuantity: 3,
      minAlertQuantity: 6,
      unit: 'pacotes',
      lastUpdated: 'Hoje'
    },
    {
      id: 'inv-1-2',
      residentId: 'res-1',
      itemName: 'Losartana Potássica 50mg',
      category: 'medicamento',
      currentQuantity: 28,
      minAlertQuantity: 14,
      unit: 'comprimidos',
      lastUpdated: 'Ontem'
    },
    {
      id: 'inv-1-3',
      residentId: 'res-1',
      itemName: 'Espessante Alimentar Instantâneo (Lata 400g)',
      category: 'alimentacao',
      currentQuantity: 2,
      minAlertQuantity: 1,
      unit: 'latas',
      lastUpdated: 'Ontem'
    }
  ],
  'res-2': [
    {
      id: 'inv-2-1',
      residentId: 'res-2',
      itemName: 'Tiras Reagentes de Glicemia (Accu-Chek)',
      category: 'medicamento',
      currentQuantity: 8,
      minAlertQuantity: 25,
      unit: 'tiras',
      lastUpdated: 'Hoje'
    },
    {
      id: 'inv-2-2',
      residentId: 'res-2',
      itemName: 'Agulhas para Caneta de Insulina 4mm',
      category: 'medicamento',
      currentQuantity: 45,
      minAlertQuantity: 30,
      unit: 'unidades',
      lastUpdated: 'Ontem'
    },
    {
      id: 'inv-2-3',
      residentId: 'res-2',
      itemName: 'Metformina 850mg',
      category: 'medicamento',
      currentQuantity: 40,
      minAlertQuantity: 20,
      unit: 'comprimidos',
      lastUpdated: 'Ontem'
    }
  ],
  'res-3': [
    {
      id: 'inv-3-1',
      residentId: 'res-3',
      itemName: 'Fralda Geriátrica M (Pacote c/ 8)',
      category: 'higiene',
      currentQuantity: 9,
      minAlertQuantity: 5,
      unit: 'pacotes',
      lastUpdated: 'Hoje'
    },
    {
      id: 'inv-3-2',
      residentId: 'res-3',
      itemName: 'Lactulose Xarope 120ml',
      category: 'medicamento',
      currentQuantity: 1,
      minAlertQuantity: 2,
      unit: 'frascos',
      lastUpdated: 'Ontem'
    }
  ],
  'res-4': [
    {
      id: 'inv-4-1',
      residentId: 'res-4',
      itemName: 'Pomada Barreira Óxido de Zinco 100g',
      category: 'higiene',
      currentQuantity: 1,
      minAlertQuantity: 2,
      unit: 'bisnagas',
      lastUpdated: 'Hoje'
    },
    {
      id: 'inv-4-2',
      residentId: 'res-4',
      itemName: 'Fralda Noturna Geriátrica G',
      category: 'higiene',
      currentQuantity: 4,
      minAlertQuantity: 10,
      unit: 'pacotes',
      lastUpdated: 'Hoje'
    }
  ]
};

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-admin',
    name: 'Dra. Camila Nogueira',
    email: 'diretoria@omnisenior.com.br',
    password: 'admin123',
    role: 'admin',
    registry: 'CRM/SP 198273',
    phone: '(11) 98123-0001',
    specialty: 'Diretoria Geral & Geriatria',
    shiftPreference: 'comercial',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1594824813576-963d865b1d9c?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'user-med',
    name: 'Dr. Roberto Mendes',
    email: 'medico@omnisenior.com.br',
    password: 'medico123',
    role: 'medico',
    registry: 'CRM/SP 123456',
    phone: '(11) 98123-0002',
    specialty: 'Clínica Médica e Prescritor',
    shiftPreference: 'manha',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'user-enf',
    name: 'Enf. Juliana Ramos',
    email: 'enfermagem@omnisenior.com.br',
    password: 'enfermeiro123',
    role: 'enfermeiro',
    registry: 'COREN/SP 456789',
    phone: '(11) 98123-0003',
    specialty: 'Responsável Técnica (RT) de Enfermagem',
    shiftPreference: 'manha',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'user-enf-2',
    name: 'Enf. Marcos Vinícius',
    email: 'marcos.enfermagem@omnisenior.com.br',
    password: 'enfermeiro123',
    role: 'enfermeiro',
    registry: 'COREN/SP 389102',
    phone: '(11) 98123-0004',
    specialty: 'Enfermeiro Assistencial e Transcritor',
    shiftPreference: 'noite',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'user-cuid',
    name: 'Maria Silva',
    email: 'cuidador@omnisenior.com.br',
    password: 'cuidador123',
    role: 'cuidador',
    registry: 'Cert. Cuidador ILPI #892',
    phone: '(11) 98123-0005',
    specialty: 'Cuidado Geriátrico - Plantão Diurno',
    shiftPreference: 'manha',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'user-cuid-2',
    name: 'Lucas Andrade',
    email: 'lucas.cuidador@omnisenior.com.br',
    password: 'cuidador123',
    role: 'cuidador',
    registry: 'Cert. Cuidador ILPI #1044',
    phone: '(11) 98123-0006',
    specialty: 'Cuidado Geriátrico - Plantão Noturno',
    shiftPreference: 'noite',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'user-fisio',
    name: 'Dra. Patrícia Lima',
    email: 'fisioterapia@omnisenior.com.br',
    password: 'fisio123',
    role: 'fisioterapeuta',
    registry: 'CREFITO-3/98124-F',
    phone: '(11) 98123-0007',
    specialty: 'Reabilitação Motora e Respiratória',
    shiftPreference: 'tarde',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'user-nutri',
    name: 'Fernanda Castilho',
    email: 'nutricao@omnisenior.com.br',
    password: 'nutri123',
    role: 'nutricionista',
    registry: 'CRN-3/54321',
    phone: '(11) 98123-0008',
    specialty: 'Nutrição Clínica & Terapia Enteral',
    shiftPreference: 'comercial',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'user-fam',
    name: 'Carlos Albuquerque',
    email: 'familiar@omnisenior.com.br',
    password: 'familiar123',
    role: 'familiar',
    registry: 'Responsável legal res-1',
    phone: '(11) 98765-4321',
    specialty: 'Familiar Responsável',
    shiftPreference: 'comercial',
    status: 'active'
  }
];

export const INITIAL_GERIATRIC_ASSESSMENTS: Record<string, GeriatricAssessment[]> = {
  'res-1': [
    {
      id: 'assess-1-1',
      residentId: 'res-1',
      residentName: 'Dona Sebastiana de Albuquerque',
      date: '2026-10-01 10:30',
      evaluatedBy: {
        uid: 'user-enf',
        name: 'Enf. Juliana Ramos',
        role: 'enfermeiro',
        registry: 'COREN/SP 456789'
      },
      braden: calculateBraden({
        sensoryPerception: 3,
        moisture: 3,
        activity: 3,
        mobility: 3,
        nutrition: 3,
        frictionShear: 2
      }),
      morse: calculateMorse({
        fallHistory: 0,
        secondaryDiagnosis: 15,
        ambulatoryAid: 15,
        ivTherapy: 0,
        gait: 10,
        mentalStatus: 0
      }),
      katz: calculateKatz({
        bathing: 0,
        dressing: 1,
        toileting: 0,
        transferring: 1,
        continence: 1,
        feeding: 1
      }),
      clinicalSummary: 'Residente cooperativa. Deambula com andador e apoio leve. Risco moderado de quedas. Preservada continência, porém requer auxílio no banho e higiene.'
    }
  ],
  'res-2': [
    {
      id: 'assess-2-1',
      residentId: 'res-2',
      residentName: 'Seu Benedito Santos Filho',
      date: '2026-10-02 09:15',
      evaluatedBy: {
        uid: 'user-enf',
        name: 'Enf. Juliana Ramos',
        role: 'enfermeiro',
        registry: 'COREN/SP 456789'
      },
      braden: calculateBraden({
        sensoryPerception: 4,
        moisture: 4,
        activity: 4,
        mobility: 4,
        nutrition: 3,
        frictionShear: 3
      }),
      morse: calculateMorse({
        fallHistory: 0,
        secondaryDiagnosis: 15,
        ambulatoryAid: 0,
        ivTherapy: 0,
        gait: 0,
        mentalStatus: 0
      }),
      katz: calculateKatz({
        bathing: 1,
        dressing: 1,
        toileting: 1,
        transferring: 1,
        continence: 1,
        feeding: 1
      }),
      clinicalSummary: 'Residente totalmente lúcido e independente em todas as ABVDs (Grau I ANVISA). Baixo risco de quedas e sem risco para lesões por pressão.'
    }
  ],
  'res-4': [
    {
      id: 'assess-4-1',
      residentId: 'res-4',
      residentName: 'Seu Antônio Carlos Fagundes',
      date: '2026-10-04 14:00',
      evaluatedBy: {
        uid: 'user-med',
        name: 'Dr. Roberto Mendes',
        role: 'medico',
        registry: 'CRM/SP 123456'
      },
      braden: calculateBraden({
        sensoryPerception: 2,
        moisture: 2,
        activity: 1,
        mobility: 1,
        nutrition: 2,
        frictionShear: 1
      }),
      morse: calculateMorse({
        fallHistory: 25,
        secondaryDiagnosis: 15,
        ambulatoryAid: 0,
        ivTherapy: 20,
        gait: 0,
        mentalStatus: 0
      }),
      katz: calculateKatz({
        bathing: 0,
        dressing: 0,
        toileting: 0,
        transferring: 0,
        continence: 0,
        feeding: 1
      }),
      clinicalSummary: 'Pós-operatório de fratura de fêmur esquerdo. Acamado, dependência total para transferências e higiene (Grau III ANVISA). Risco Muito Alto de LPP (Braden 9) e Alto Risco de Queda.'
    }
  ]
};

// ==========================================
// LINHA DO TEMPO CLÍNICA UNIFICADA (48 HORAS)
// ==========================================
const now = new Date();
const todayDateStr = now.toISOString().split('T')[0];
const yesterday = new Date(now);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayDateStr = yesterday.toISOString().split('T')[0];

export const INITIAL_TIMELINE_EVENTS: Record<string, TimelineEvent[]> = {
  'res-1': [
    // --- HOJE (Últimas 12-24h) ---
    {
      id: 'tl-1-1',
      residentId: 'res-1',
      type: 'hydration',
      timestamp: `${todayDateStr}T16:00:00.000Z`,
      timeDisplay: 'Hoje às 16:00',
      hour: '16:00',
      dateKey: todayDateStr,
      shift: 'tarde',
      title: 'Hidratação Vespertina',
      description: 'Ingestão de 200ml de água de coco fresca com boa deglutição.',
      status: 'success',
      author: { uid: 'cuid-2', name: 'Carlos Cuidador', role: 'cuidador' },
      metrics: { hydrationMl: 200 }
    },
    {
      id: 'tl-1-2',
      residentId: 'res-1',
      type: 'diaper_elim',
      timestamp: `${todayDateStr}T15:30:00.000Z`,
      timeDisplay: 'Hoje às 15:30',
      hour: '15:30',
      dateKey: todayDateStr,
      shift: 'tarde',
      title: 'Troca de Fralda & Evacuação Positiva',
      description: 'Troca de fralda realizada. Diurese clara média. Evacuação presente classificada como Escala de Bristol Tipo 4 (normal/pastosa). Pele perianal íntegra.',
      status: 'success',
      author: { uid: 'cuid-2', name: 'Carlos Cuidador', role: 'cuidador' },
      metrics: { bristolScale: 4, diuresis: 'normal' }
    },
    {
      id: 'tl-1-3',
      residentId: 'res-1',
      type: 'turnover',
      timestamp: `${todayDateStr}T14:00:00.000Z`,
      timeDisplay: 'Hoje às 14:00',
      hour: '14:00',
      dateKey: todayDateStr,
      shift: 'tarde',
      title: 'Mudança de Decúbito (Alívio Braden)',
      description: 'Reposicionamento para Decúbito Lateral Esquerdo (DLE) com coxins de apoio em proeminências ósseas.',
      status: 'info',
      author: { uid: 'cuid-2', name: 'Carlos Cuidador', role: 'cuidador' },
      metrics: { decubitusPosition: 'DLE' }
    },
    {
      id: 'tl-1-4',
      residentId: 'res-1',
      type: 'diet',
      timestamp: `${todayDateStr}T12:15:00.000Z`,
      timeDisplay: 'Hoje às 12:15',
      hour: '12:15',
      dateKey: todayDateStr,
      shift: 'manha',
      title: 'Almoço (Dieta Pastosa)',
      description: 'Aceitação de 85% do prato principal (sopa batida com legumes e carne desfiada) + 150ml de água mineral.',
      status: 'success',
      author: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      metrics: { dietPercent: '85%', hydrationMl: 150 }
    },
    {
      id: 'tl-1-5',
      residentId: 'res-1',
      type: 'vitals',
      timestamp: `${todayDateStr}T11:30:00.000Z`,
      timeDisplay: 'Hoje às 11:30',
      hour: '11:30',
      dateKey: todayDateStr,
      shift: 'manha',
      title: 'Aferição de Sinais Vitais Basais',
      description: 'PA: 125/80 mmHg • Glicemia: 104 mg/dL • SatO2: 97% • Temp: 36.3°C • FC: 74 bpm. Parâmetros clínicos normotensos.',
      status: 'success',
      author: { uid: 'enf-1', name: 'Enf. Juliana Ramos', role: 'enfermeiro', registry: 'COREN/SP 456789' },
      metrics: { vitalSigns: { bp: '125/80', glucose: 104, o2: 97, temp: 36.3, hr: 74 } }
    },
    {
      id: 'tl-1-6',
      residentId: 'res-1',
      type: 'hydration',
      timestamp: `${todayDateStr}T10:30:00.000Z`,
      timeDisplay: 'Hoje às 10:30',
      hour: '10:30',
      dateKey: todayDateStr,
      shift: 'manha',
      title: 'Hidratação Matinal',
      description: 'Ingestão de 250ml de suco de caju diluído e levemente espessado.',
      status: 'success',
      author: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      metrics: { hydrationMl: 250 }
    },
    {
      id: 'tl-1-7',
      residentId: 'res-1',
      type: 'diaper_elim',
      timestamp: `${todayDateStr}T09:15:00.000Z`,
      timeDisplay: 'Hoje às 09:15',
      hour: '09:15',
      dateKey: todayDateStr,
      shift: 'manha',
      title: 'Troca de Fralda Matinal',
      description: 'Troca de fralda G. Diurese clara presente (aprox. 200ml). Ausência de evacuação no momento.',
      status: 'info',
      author: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      metrics: { diuresis: 'normal' }
    },
    {
      id: 'tl-1-8',
      residentId: 'res-1',
      type: 'diet',
      timestamp: `${todayDateStr}T08:30:00.000Z`,
      timeDisplay: 'Hoje às 08:30',
      hour: '08:30',
      dateKey: todayDateStr,
      shift: 'manha',
      title: 'Café da Manhã (Desjejum)',
      description: 'Aceitação de 100% da papa de aveia com banana + 200ml de chá de camomila morno.',
      status: 'success',
      author: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      metrics: { dietPercent: '100%', hydrationMl: 200 }
    },
    {
      id: 'tl-1-9',
      residentId: 'res-1',
      type: 'medication',
      timestamp: `${todayDateStr}T08:00:00.000Z`,
      timeDisplay: 'Hoje às 08:00',
      hour: '08:00',
      dateKey: todayDateStr,
      shift: 'manha',
      title: 'Losartana Potássica 50mg',
      description: '✓ Administrado via oral com água sem queixas. Prescrição matinal.',
      status: 'success',
      author: { uid: 'enf-1', name: 'Enf. Juliana Ramos', role: 'enfermeiro', registry: 'COREN/SP 456789' },
      metrics: { medicationName: 'Losartana Potássica', dosage: '50mg', medicationStatus: 'administered' }
    },
    {
      id: 'tl-1-10',
      residentId: 'res-1',
      type: 'hygiene_bath',
      timestamp: `${todayDateStr}T07:45:00.000Z`,
      timeDisplay: 'Hoje às 07:45',
      hour: '07:45',
      dateKey: todayDateStr,
      shift: 'manha',
      title: 'Banho de Aspersão & Higiene Matinal',
      description: 'Banho de aspersão realizado em cadeira de banho com auxílio de 1 cuidador. Higiene oral com clorexidina e hidratação da pele.',
      status: 'success',
      author: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      metrics: { bathType: 'aspersao' }
    },
    {
      id: 'tl-1-11',
      residentId: 'res-1',
      type: 'medication',
      timestamp: `${todayDateStr}T07:00:00.000Z`,
      timeDisplay: 'Hoje às 07:00',
      hour: '07:00',
      dateKey: todayDateStr,
      shift: 'manha',
      title: 'Omeprazol 20mg',
      description: '✓ Administrado em jejum com 50ml de água mineral.',
      status: 'success',
      author: { uid: 'enf-1', name: 'Enf. Juliana Ramos', role: 'enfermeiro', registry: 'COREN/SP 456789' },
      metrics: { medicationName: 'Omeprazol', dosage: '20mg', medicationStatus: 'administered' }
    },

    // --- ONTEM (24h a 48h anteriores) ---
    {
      id: 'tl-1-12',
      residentId: 'res-1',
      type: 'evolution',
      timestamp: `${yesterdayDateStr}T23:30:00.000Z`,
      timeDisplay: 'Ontem às 23:30',
      hour: '23:30',
      dateKey: yesterdayDateStr,
      shift: 'noite',
      title: 'Ronda Noturna de Enfermagem',
      description: 'Residente dormindo em sono fisiológico tranquilo. Respiração eupnéica em ar ambiente. Grades do leito elevadas.',
      status: 'info',
      author: { uid: 'enf-1', name: 'Enf. Juliana Ramos', role: 'enfermeiro', registry: 'COREN/SP 456789' }
    },
    {
      id: 'tl-1-13',
      residentId: 'res-1',
      type: 'medication',
      timestamp: `${yesterdayDateStr}T21:00:00.000Z`,
      timeDisplay: 'Ontem às 21:00',
      hour: '21:00',
      dateKey: yesterdayDateStr,
      shift: 'noite',
      title: 'Quetiapina 25mg',
      description: '✓ Administrado às 21:05 para indução e manutenção do sono.',
      status: 'success',
      author: { uid: 'enf-1', name: 'Enf. Juliana Ramos', role: 'enfermeiro', registry: 'COREN/SP 456789' },
      metrics: { medicationName: 'Quetiapina', dosage: '25mg', medicationStatus: 'administered' }
    },
    {
      id: 'tl-1-14',
      residentId: 'res-1',
      type: 'diaper_elim',
      timestamp: `${yesterdayDateStr}T20:30:00.000Z`,
      timeDisplay: 'Ontem às 20:30',
      hour: '20:30',
      dateKey: yesterdayDateStr,
      shift: 'noite',
      title: 'Troca de Fralda Noturna (Pré-sono)',
      description: 'Troca de fralda noturna. Diurese presente límpida. Aplicado creme de barreira.',
      status: 'info',
      author: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      metrics: { diuresis: 'normal' }
    },
    {
      id: 'tl-1-15',
      residentId: 'res-1',
      type: 'medication',
      timestamp: `${yesterdayDateStr}T20:00:00.000Z`,
      timeDisplay: 'Ontem às 20:00',
      hour: '20:00',
      dateKey: yesterdayDateStr,
      shift: 'noite',
      title: 'Losartana Potássica 50mg',
      description: '✓ Administrado via oral após o jantar.',
      status: 'success',
      author: { uid: 'enf-1', name: 'Enf. Juliana Ramos', role: 'enfermeiro', registry: 'COREN/SP 456789' },
      metrics: { medicationName: 'Losartana Potássica', dosage: '50mg', medicationStatus: 'administered' }
    },
    {
      id: 'tl-1-16',
      residentId: 'res-1',
      type: 'diet',
      timestamp: `${yesterdayDateStr}T18:30:00.000Z`,
      timeDisplay: 'Ontem às 18:30',
      hour: '18:30',
      dateKey: yesterdayDateStr,
      shift: 'tarde',
      title: 'Jantar',
      description: 'Aceitação de 80% do purê de batata com frango desfiado + 200ml de suco de maçã.',
      status: 'success',
      author: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      metrics: { dietPercent: '80%', hydrationMl: 200 }
    },
    {
      id: 'tl-1-17',
      residentId: 'res-1',
      type: 'vitals',
      timestamp: `${yesterdayDateStr}T17:00:00.000Z`,
      timeDisplay: 'Ontem às 17:00',
      hour: '17:00',
      dateKey: yesterdayDateStr,
      shift: 'tarde',
      title: 'Sinais Vitais Vespertinos',
      description: 'PA: 130/85 mmHg • Glicemia: 112 mg/dL • SatO2: 96% • Temp: 36.5°C.',
      status: 'success',
      author: { uid: 'enf-1', name: 'Enf. Juliana Ramos', role: 'enfermeiro', registry: 'COREN/SP 456789' },
      metrics: { vitalSigns: { bp: '130/85', glucose: 112, o2: 96, temp: 36.5 } }
    },
    {
      id: 'tl-1-18',
      residentId: 'res-1',
      type: 'turnover',
      timestamp: `${yesterdayDateStr}T14:00:00.000Z`,
      timeDisplay: 'Ontem às 14:00',
      hour: '14:00',
      dateKey: yesterdayDateStr,
      shift: 'tarde',
      title: 'Mudança de Decúbito (DLD)',
      description: 'Mudança de decúbito para Decúbito Lateral Direito (DLD). Alívio de calcâneos e sacro.',
      status: 'info',
      author: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      metrics: { decubitusPosition: 'DLD' }
    }
  ],

  'res-2': [
    // Seu Benedito Santos Filho (Diabético)
    {
      id: 'tl-2-1',
      residentId: 'res-2',
      type: 'vitals',
      timestamp: `${todayDateStr}T16:00:00.000Z`,
      timeDisplay: 'Hoje às 16:00',
      hour: '16:00',
      dateKey: todayDateStr,
      shift: 'tarde',
      title: 'Controle Glicêmico Pós-Prandial',
      description: 'Glicemia capilar: 132 mg/dL • PA: 128/82 mmHg. Ótimo controle glicêmico vespertino.',
      status: 'success',
      author: { uid: 'enf-1', name: 'Enf. Juliana Ramos', role: 'enfermeiro' },
      metrics: { vitalSigns: { glucose: 132, bp: '128/82' } }
    },
    {
      id: 'tl-2-2',
      residentId: 'res-2',
      type: 'hydration',
      timestamp: `${todayDateStr}T15:00:00.000Z`,
      timeDisplay: 'Hoje às 15:00',
      hour: '15:00',
      dateKey: todayDateStr,
      shift: 'tarde',
      title: 'Hidratação Vespertina',
      description: 'Ingestão espontânea de 300ml de água filtrada.',
      status: 'success',
      author: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      metrics: { hydrationMl: 300 }
    },
    {
      id: 'tl-2-3',
      residentId: 'res-2',
      type: 'diet',
      timestamp: `${todayDateStr}T12:00:00.000Z`,
      timeDisplay: 'Hoje às 12:00',
      hour: '12:00',
      dateKey: todayDateStr,
      shift: 'manha',
      title: 'Almoço (Dieta Diabético Hipossódica)',
      description: 'Aceitação de 100% da refeição. Alimento bem mastigado, boa aceitação de saladas e legumes.',
      status: 'success',
      author: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      metrics: { dietPercent: '100%', hydrationMl: 200 }
    },
    {
      id: 'tl-2-4',
      residentId: 'res-2',
      type: 'medication',
      timestamp: `${todayDateStr}T08:00:00.000Z`,
      timeDisplay: 'Hoje às 08:00',
      hour: '08:00',
      dateKey: todayDateStr,
      shift: 'manha',
      title: 'Metformina 850mg & Gliclazida 30mg',
      description: '✓ Administrados após o café da manhã. Glicemia de jejum aferida previamente: 118 mg/dL.',
      status: 'success',
      author: { uid: 'enf-1', name: 'Enf. Juliana Ramos', role: 'enfermeiro' },
      metrics: { vitalSigns: { glucose: 118 }, medicationStatus: 'administered' }
    },
    {
      id: 'tl-2-5',
      residentId: 'res-2',
      type: 'hygiene_bath',
      timestamp: `${todayDateStr}T07:30:00.000Z`,
      timeDisplay: 'Hoje às 07:30',
      hour: '07:30',
      dateKey: todayDateStr,
      shift: 'manha',
      title: 'Banho de Aspersão Independente com Supervisão',
      description: 'Residente tomou banho de chuveiro de forma independente com supervisão do cuidador. Secagem atenta interdigital dos pés.',
      status: 'success',
      author: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      metrics: { bathType: 'aspersao' }
    },
    {
      id: 'tl-2-6',
      residentId: 'res-2',
      type: 'diaper_elim',
      timestamp: `${yesterdayDateStr}T16:30:00.000Z`,
      timeDisplay: 'Ontem às 16:30',
      hour: '16:30',
      dateKey: yesterdayDateStr,
      shift: 'tarde',
      title: 'Evacuação Fisiológica',
      description: 'Evacuação em vaso sanitário com auxílio. Fezes consistentes Bristol Tipo 3. Diurese clara normal.',
      status: 'success',
      author: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      metrics: { bristolScale: 3, diuresis: 'normal' }
    }
  ],

  'res-3': [
    // Dona Maria de Lourdes Paiva (Alzheimer leve, constipação)
    {
      id: 'tl-3-1',
      residentId: 'res-3',
      type: 'hydration',
      timestamp: `${todayDateStr}T16:30:00.000Z`,
      timeDisplay: 'Hoje às 16:30',
      hour: '16:30',
      dateKey: todayDateStr,
      shift: 'tarde',
      title: 'Hidratação & Estimulação Hídrica',
      description: 'Oferecido e aceito 250ml de água com sabor de hortelã.',
      status: 'success',
      author: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      metrics: { hydrationMl: 250 }
    },
    {
      id: 'tl-3-2',
      residentId: 'res-3',
      type: 'medication',
      timestamp: `${todayDateStr}T14:00:00.000Z`,
      timeDisplay: 'Hoje às 14:00',
      hour: '14:00',
      dateKey: todayDateStr,
      shift: 'tarde',
      title: 'Lactulose Xarope 15ml',
      description: '✓ Administrado laxativo osmótico conforme prescrição médica para constipação intestinal.',
      status: 'success',
      author: { uid: 'enf-1', name: 'Enf. Juliana Ramos', role: 'enfermeiro' },
      metrics: { medicationName: 'Lactulose', dosage: '15ml', medicationStatus: 'administered' }
    },
    {
      id: 'tl-3-3',
      residentId: 'res-3',
      type: 'evolution',
      timestamp: `${todayDateStr}T10:00:00.000Z`,
      timeDisplay: 'Hoje às 10:00',
      hour: '10:00',
      dateKey: todayDateStr,
      shift: 'manha',
      title: 'Atividade de Musicoterapia & Convivência',
      description: 'Participou ativamente do coral no jardim. Sorridente, reconheceu cuidadores e interagiu com colegas.',
      status: 'info',
      author: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' }
    },
    {
      id: 'tl-3-4',
      residentId: 'res-3',
      type: 'medication',
      timestamp: `${todayDateStr}T08:00:00.000Z`,
      timeDisplay: 'Hoje às 08:00',
      hour: '08:00',
      dateKey: todayDateStr,
      shift: 'manha',
      title: 'Memantina 10mg',
      description: '✓ Administrado via oral com leite morno.',
      status: 'success',
      author: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      metrics: { medicationName: 'Memantina', dosage: '10mg', medicationStatus: 'administered' }
    },
    {
      id: 'tl-3-5',
      residentId: 'res-3',
      type: 'diaper_elim',
      timestamp: `${yesterdayDateStr}T15:00:00.000Z`,
      timeDisplay: 'Ontem às 15:00',
      hour: '15:00',
      dateKey: yesterdayDateStr,
      shift: 'tarde',
      title: 'Troca de Fralda - Fezes Ressecadas (Bristol 2)',
      description: 'Evacuação em pequeno volume, fezes duras em grumos (Bristol 2). Comunicado enfermeiro para ajuste hídrico e lactulose.',
      status: 'warning',
      author: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      metrics: { bristolScale: 2, diuresis: 'normal' }
    }
  ],

  'res-4': [
    // Seu Antônio Carlos Fagundes (Acamado, Braden 9, Pós-Op fêmur)
    {
      id: 'tl-4-1',
      residentId: 'res-4',
      type: 'turnover',
      timestamp: `${todayDateStr}T16:00:00.000Z`,
      timeDisplay: 'Hoje às 16:00',
      hour: '16:00',
      dateKey: todayDateStr,
      shift: 'tarde',
      title: 'Mudança de Decúbito de 2h/2h (DLD)',
      description: 'Posicionamento em Decúbito Lateral Direito. Inspeção de região sacra e trocânteres: pele íntegra sem hiperemia.',
      status: 'info',
      author: { uid: 'cuid-2', name: 'Carlos Cuidador', role: 'cuidador' },
      metrics: { decubitusPosition: 'DLD' }
    },
    {
      id: 'tl-4-2',
      residentId: 'res-4',
      type: 'turnover',
      timestamp: `${todayDateStr}T14:00:00.000Z`,
      timeDisplay: 'Hoje às 14:00',
      hour: '14:00',
      dateKey: todayDateStr,
      shift: 'tarde',
      title: 'Mudança de Decúbito de 2h/2h (DLE)',
      description: 'Posicionamento em Decúbito Lateral Esquerdo com travesseiro de abdução entre os membros inferiores.',
      status: 'info',
      author: { uid: 'cuid-2', name: 'Carlos Cuidador', role: 'cuidador' },
      metrics: { decubitusPosition: 'DLE' }
    },
    {
      id: 'tl-4-3',
      residentId: 'res-4',
      type: 'medication',
      timestamp: `${todayDateStr}T12:00:00.000Z`,
      timeDisplay: 'Hoje às 12:00',
      hour: '12:00',
      dateKey: todayDateStr,
      shift: 'manha',
      title: 'AAS Infantil 100mg',
      description: '✓ Administrado via oral macerado com iogurte após o almoço.',
      status: 'success',
      author: { uid: 'enf-1', name: 'Enf. Juliana Ramos', role: 'enfermeiro' },
      metrics: { medicationName: 'AAS Infantil', dosage: '100mg', medicationStatus: 'administered' }
    },
    {
      id: 'tl-4-4',
      residentId: 'res-4',
      type: 'medication',
      timestamp: `${todayDateStr}T08:25:00.000Z`,
      timeDisplay: 'Hoje às 08:25',
      hour: '08:25',
      dateKey: todayDateStr,
      shift: 'manha',
      title: 'Enalapril 10mg (Recusa Pontual)',
      description: '✗ Recusado: Residente relatou enjoo matinal e cuspiu o comprimido. Enfermagem notificada; dose remarcada após melhora do enjoo.',
      status: 'alert',
      author: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      metrics: { medicationName: 'Enalapril', dosage: '10mg', medicationStatus: 'refused' }
    },
    {
      id: 'tl-4-5',
      residentId: 'res-4',
      type: 'hygiene_bath',
      timestamp: `${todayDateStr}T07:15:00.000Z`,
      timeDisplay: 'Hoje às 07:15',
      hour: '07:15',
      dateKey: todayDateStr,
      shift: 'manha',
      title: 'Banho Completo no Leito',
      description: 'Banho no leito realizado por 2 profissionais devido à cirurgia no fêmur. Troca completa de roupa de cama e curativo de alívio.',
      status: 'success',
      author: { uid: 'cuid-1', name: 'Maria Silva', role: 'cuidador' },
      metrics: { bathType: 'leito' }
    }
  ]
};
