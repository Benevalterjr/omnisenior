export type CalendarCategory = 
  | 'medicamento' 
  | 'consulta' 
  | 'visita' 
  | 'terapia' 
  | 'aniversario' 
  | 'tarefa';

export interface CalendarEvent {
  id: string;
  title: string;
  category: CalendarCategory;
  residentId?: string;
  residentName?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (ex: "09:00")
  endTime: string; // HH:mm (ex: "10:00")
  location?: string;
  description?: string;
  assignedTo?: string; // Profissional responsável
  color?: string; // hex ou tailwind class
  completed?: boolean;
  meetLink?: string;
}

export interface CalendarCategoryConfig {
  id: CalendarCategory;
  label: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}
