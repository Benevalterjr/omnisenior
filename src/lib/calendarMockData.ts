import { CalendarEvent, CalendarCategoryConfig } from '@/types/calendar';

export const CALENDAR_CATEGORIES: CalendarCategoryConfig[] = [
  {
    id: 'consulta',
    label: 'Consultas Médicas & Exames',
    color: '#0284c7', // Sky / Google Blue
    bgClass: 'bg-[#0284c7] hover:bg-[#0369a1] text-white',
    borderClass: 'border-[#0284c7]',
    textClass: 'text-white'
  },
  {
    id: 'medicamento',
    label: 'Aprazamento & Checagens',
    color: '#0d9488', // Teal
    bgClass: 'bg-[#0d9488] hover:bg-[#0f766e] text-white',
    borderClass: 'border-[#0d9488]',
    textClass: 'text-white'
  },
  {
    id: 'visita',
    label: 'Visitas Familiares',
    color: '#7c3aed', // Purple
    bgClass: 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white',
    borderClass: 'border-[#7c3aed]',
    textClass: 'text-white'
  },
  {
    id: 'terapia',
    label: 'Fisioterapia & Terapias',
    color: '#16a34a', // Emerald / Green
    bgClass: 'bg-[#16a34a] hover:bg-[#15803d] text-white',
    borderClass: 'border-[#16a34a]',
    textClass: 'text-white'
  },
  {
    id: 'aniversario',
    label: 'Aniversários & Convivência',
    color: '#0b8043', // Google Green (🎂 Happy birthday)
    bgClass: 'bg-[#0b8043] hover:bg-[#096a37] text-white',
    borderClass: 'border-[#0b8043]',
    textClass: 'text-white'
  },
  {
    id: 'tarefa',
    label: 'Tarefas da Equipe',
    color: '#4f46e5', // Indigo
    bgClass: 'bg-[#4f46e5] hover:bg-[#4338ca] text-white',
    borderClass: 'border-[#4f46e5]',
    textClass: 'text-white'
  }
];

// Events around October 2026 and November 2026 (matching Google Calendar screenshots)
export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-bday-seba',
    title: '🎂 Aniversário: Dona Sebastiana (84 anos)',
    category: 'aniversario',
    residentId: 'res-1',
    residentName: 'Dona Sebastiana',
    date: '2026-10-08',
    startTime: '08:00',
    endTime: '18:00',
    isAllDay: true,
    location: 'Salão Nobre da ILPI',
    description: 'Comemoração dos 84 anos com bolo diet e visita da família.',
    assignedTo: 'Equipe de Recreação',
    color: '#0b8043'
  },
  {
    id: 'evt-plantao-out',
    title: '🏥 Plantão Integral: Enf. Juliana & Equipe',
    category: 'tarefa',
    date: '2026-10-06',
    startTime: '07:00',
    endTime: '19:00',
    isAllDay: true,
    location: 'Posto de Enfermagem Central',
    description: 'Plantão diurno 12h com checagens completas e curativos.',
    assignedTo: 'Enf. Juliana Ramos',
    color: '#4f46e5'
  },
  {
    id: 'evt-bday-nov',
    title: '🎂 Happy birthday!',
    category: 'aniversario',
    date: '2026-11-12',
    startTime: '08:00',
    endTime: '18:00',
    isAllDay: true,
    location: 'Salão de Convivência',
    description: 'Comemoração especial de aniversário dos residentes de Novembro.',
    assignedTo: 'Equipe Multidisciplinar',
    color: '#0b8043'
  },
  {
    id: 'evt-1',
    title: 'Visita Familiar: Carlos c/ Dona Sebastiana',
    category: 'visita',
    residentId: 'res-1',
    residentName: 'Dona Sebastiana',
    date: '2026-10-04',
    startTime: '14:00',
    endTime: '16:00',
    location: 'Jardim / Sala de Visitas',
    description: 'Filho Carlos trará netos para visita no jardim da ILPI.',
    assignedTo: 'Maria Silva (Cuidador)',
    color: '#7c3aed'
  },
  {
    id: 'evt-2',
    title: 'Consulta Geriátrica: Dr. Roberto',
    category: 'consulta',
    residentId: 'res-2',
    residentName: 'Seu Benedito Santos',
    date: '2026-10-05',
    startTime: '09:30',
    endTime: '10:30',
    location: 'Consultório 1',
    description: 'Reavaliação de curva glicêmica e ajuste de insulina NPH.',
    assignedTo: 'Dr. Roberto Mendes',
    color: '#0284c7'
  },
  {
    id: 'evt-3',
    title: 'Fisioterapia Motora em Grupo',
    category: 'terapia',
    date: '2026-10-06',
    startTime: '10:00',
    endTime: '11:00',
    location: 'Salão de Convivência',
    description: 'Exercícios de fortalecimento de membros inferiores e prevenção de quedas.',
    assignedTo: 'Fisioterapeuta Lucas',
    color: '#16a34a'
  },
  {
    id: 'evt-4',
    title: 'Coleta de Exames de Sangue (Laboratório Fleury)',
    category: 'consulta',
    residentId: 'res-4',
    residentName: 'Seu Antônio Carlos',
    date: '2026-10-06',
    startTime: '07:00',
    endTime: '08:00',
    location: 'Quarto 104',
    description: 'Hemograma completo, coagulograma e função renal em jejum.',
    assignedTo: 'Enf. Juliana Ramos',
    color: '#0284c7'
  },
  {
    id: 'evt-5',
    title: 'Tarde de Musicoterapia & Convivência',
    category: 'aniversario',
    date: '2026-10-07',
    startTime: '15:00',
    endTime: '16:30',
    location: 'Jardim Central',
    description: 'Apresentação musical e estímulo à memória afetiva dos residentes.',
    assignedTo: 'Equipe de Recreação',
    color: '#ea580c'
  },
  {
    id: 'evt-6',
    title: 'Reunião Multidisciplinar de Plantão',
    category: 'tarefa',
    date: '2026-10-08',
    startTime: '13:30',
    endTime: '14:30',
    location: 'Posto de Enfermagem',
    description: 'Alinhamento de condutas, revisão de quedas e reposição de estoque.',
    assignedTo: 'Dra. Camila & Enf. Juliana',
    color: '#4f46e5'
  },
  {
    id: 'evt-7',
    title: 'Visita Especial: Filha Mariana (Seu Benedito)',
    category: 'visita',
    residentId: 'res-2',
    residentName: 'Seu Benedito Santos',
    date: '2026-10-09',
    startTime: '16:00',
    endTime: '17:30',
    location: 'Quarto 102',
    description: 'Trará suprimento de agulhas e fitas de glicemia.',
    assignedTo: 'Maria Silva (Cuidador)',
    color: '#7c3aed'
  },
  {
    id: 'evt-8',
    title: 'Avaliação Nutricional Semestral',
    category: 'consulta',
    residentId: 'res-3',
    residentName: 'Dona Maria de Lourdes',
    date: '2026-10-10',
    startTime: '10:30',
    endTime: '11:30',
    location: 'Quarto 103',
    description: 'Pesagem e ajuste de dieta branda hipossódica.',
    assignedTo: 'Nutricionista Fernanda',
    color: '#0284c7'
  }
];
