import { CalendarEvent, CalendarCategoryConfig } from '@/types/calendar';

export const CALENDAR_CATEGORIES: CalendarCategoryConfig[] = [
  {
    id: 'consulta',
    label: 'Consultas Médicas & Exames',
    color: '#0284c7', // Sky / Blue
    bgClass: 'bg-sky-100 hover:bg-sky-200 text-sky-900 border-l-4 border-sky-600',
    borderClass: 'border-sky-500',
    textClass: 'text-sky-700'
  },
  {
    id: 'medicamento',
    label: 'Aprazamento & Checagens',
    color: '#0d9488', // Teal
    bgClass: 'bg-teal-100 hover:bg-teal-200 text-teal-900 border-l-4 border-teal-600',
    borderClass: 'border-teal-500',
    textClass: 'text-teal-700'
  },
  {
    id: 'visita',
    label: 'Visitas Familiares',
    color: '#7c3aed', // Purple
    bgClass: 'bg-purple-100 hover:bg-purple-200 text-purple-900 border-l-4 border-purple-600',
    borderClass: 'border-purple-500',
    textClass: 'text-purple-700'
  },
  {
    id: 'terapia',
    label: 'Fisioterapia & Terapias',
    color: '#16a34a', // Emerald / Green
    bgClass: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-l-4 border-emerald-600',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-700'
  },
  {
    id: 'aniversario',
    label: 'Aniversários & Convivência',
    color: '#ea580c', // Orange
    bgClass: 'bg-orange-100 hover:bg-orange-200 text-orange-900 border-l-4 border-orange-600',
    borderClass: 'border-orange-500',
    textClass: 'text-orange-700'
  },
  {
    id: 'tarefa',
    label: 'Tarefas da Equipe',
    color: '#4f46e5', // Indigo
    bgClass: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border-l-4 border-indigo-600',
    borderClass: 'border-indigo-500',
    textClass: 'text-indigo-700'
  }
];

// Events around October 2026 (matching the user's screenshot dates: Oct 4 - Oct 10, 2026)
export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
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
