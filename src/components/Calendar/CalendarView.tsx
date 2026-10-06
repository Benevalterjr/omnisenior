'use client';

import React, { useState, useMemo } from 'react';
import { 
  CalendarEvent, 
  CalendarCategory, 
  CalendarCategoryConfig 
} from '@/types/calendar';
import { CALENDAR_CATEGORIES, INITIAL_CALENDAR_EVENTS } from '@/lib/calendarMockData';
import { Resident } from '@/types/ilpi';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  AlignLeft, 
  Users, 
  X, 
  Check, 
  Trash2, 
  Menu, 
  Settings, 
  HelpCircle, 
  ChevronDown, 
  CheckSquare, 
  Square,
  Sparkles,
  Video
} from 'lucide-react';
import { getNtpDate } from '@/lib/ntpService';

interface CalendarViewProps {
  residents: Resident[];
}

export function CalendarView({ residents }: CalendarViewProps) {
  // Navigation State (Sincronizado com relógio oficial NTP.br)
  const [currentDate, setCurrentDate] = useState<Date>(getNtpDate());
  const [viewMode, setViewMode] = useState<'semana' | 'dia' | 'mes'>('semana');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Events & Filter State
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [selectedCategories, setSelectedCategories] = useState<Record<CalendarCategory, boolean>>({
    consulta: true,
    medicamento: true,
    visita: true,
    terapia: true,
    aniversario: true,
    tarefa: true,
  });
  const [searchPerson, setSearchPerson] = useState('');

  // Creation Popover Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [popoverSlot, setPopoverSlot] = useState<{
    date: string;
    hour: number;
  }>({ date: '2026-10-06', hour: 10 });

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'evento' | 'tarefa' | 'agendamento'>('evento');
  const [newCategory, setNewCategory] = useState<CalendarCategory>('consulta');
  const [newStartTime, setNewStartTime] = useState('10:00');
  const [newEndTime, setNewEndTime] = useState('11:00');
  const [newResidentId, setNewResidentId] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Selected Event Details Modal
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Helper date calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed (9 = Outubro)

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const monthTitle = `${monthNames[month]} de ${year}`;

  // Get current week's 7 days (Sunday to Saturday)
  const weekDays = useMemo(() => {
    const currentDayOfWeek = currentDate.getDay(); // 0 = Sunday
    const sunday = new Date(currentDate);
    sunday.setDate(currentDate.getDate() - currentDayOfWeek);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  // Mini Calendar grid (Month view for sidebar)
  const miniCalendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 to 6
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{ day: number; isCurrentMonth: boolean; date: Date }> = [];

    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push({ day, isCurrentMonth: false, date: new Date(year, month - 1, day) });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = 35 - days.length;
    for (let i = 1; i <= (remaining > 0 ? remaining : 42 - days.length); i++) {
      days.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
    }

    return days;
  }, [year, month]);

  // Navigate dates
  const handlePrev = () => {
    if (viewMode === 'semana') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else if (viewMode === 'dia') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setMonth(d.getMonth() - 1);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (viewMode === 'semana') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else if (viewMode === 'dia') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setMonth(d.getMonth() + 1);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    setCurrentDate(getNtpDate());
  };

  // Toggle Category Checkbox
  const toggleCategory = (cat: CalendarCategory) => {
    setSelectedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      if (!selectedCategories[evt.category]) return false;
      if (searchPerson) {
        const matchesTitle = evt.title.toLowerCase().includes(searchPerson.toLowerCase());
        const matchesResident = evt.residentName?.toLowerCase().includes(searchPerson.toLowerCase());
        const matchesLocation = evt.location?.toLowerCase().includes(searchPerson.toLowerCase());
        if (!matchesTitle && !matchesResident && !matchesLocation) return false;
      }
      return true;
    });
  }, [events, selectedCategories, searchPerson]);

  // Open Quick Create for a specific cell slot
  const handleCellClick = (dateStr: string, hour: number) => {
    const formattedHour = hour.toString().padStart(2, '0');
    const nextHour = ((hour + 1) % 24).toString().padStart(2, '0');

    setPopoverSlot({ date: dateStr, hour });
    setNewStartTime(`${formattedHour}:00`);
    setNewEndTime(`${nextHour}:00`);
    setNewTitle('');
    setNewResidentId('');
    setNewLocation('');
    setNewDescription('');
    setIsCreateModalOpen(true);
  };

  // Save new event
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const residentObj = residents.find(r => r.id === newResidentId);
    const categoryConfig = CALENDAR_CATEGORIES.find(c => c.id === newCategory);

    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      date: popoverSlot.date,
      startTime: newStartTime,
      endTime: newEndTime,
      residentId: newResidentId || undefined,
      residentName: residentObj ? residentObj.name : undefined,
      location: newLocation.trim() || undefined,
      description: newDescription.trim() || undefined,
      color: categoryConfig?.color || '#0284c7'
    };

    setEvents(prev => [...prev, newEvt]);
    setIsCreateModalOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setSelectedEvent(null);
  };

  // Hours array 00:00 to 23:00 (Padrão 24h do Brasil)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Formato de hora padrão Brasil: 24h (ex: 08:00, 14:00, 20:00)
  const formatHourLabel = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  // Format date helper: YYYY-MM-DD
  const toDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Formato brasileiro de data: DD/MM/AAAA
  const formatDatePtBr = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Formato brasileiro completo com dia da semana: "Terça-feira, 6 de outubro de 2026"
  const formatDateFullPtBr = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const yearNum = parseInt(parts[0], 10);
      const monthNum = parseInt(parts[1], 10) - 1;
      const dayNum = parseInt(parts[2], 10);
      const dateObj = new Date(yearNum, monthNum, dayNum);
      const dayNames = [
        'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
        'Quinta-feira', 'Sexta-feira', 'Sábado'
      ];
      return `${dayNames[dateObj.getDay()]}, ${dayNum} de ${monthNames[monthNum]} de ${yearNum}`;
    }
    return dateStr;
  };

  const dayNamesPt = ['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SÁB.'];

  const isToday = (d: Date) => {
    const today = getNtpDate();
    return d.getFullYear() === today.getFullYear() && 
           d.getMonth() === today.getMonth() && 
           d.getDate() === today.getDate();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[85vh]">
      
      {/* 1. TOP GOOGLE CALENDAR BAR */}
      <div className="h-16 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 bg-white">
        
        {/* Left: Hamburger, App Logo & Title, Today button, Arrows, Month */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition"
            title="Alternar menu lateral"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Google Calendar Logo Badge */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex flex-col items-center justify-center text-white shadow-xs">
              <span className="text-[10px] font-bold uppercase leading-none">OUT</span>
              <span className="text-base font-black leading-none mt-0.5">6</span>
            </div>
            <span className="text-xl font-medium text-slate-700 hidden sm:inline tracking-tight">
              Agenda
            </span>
          </div>

          {/* "Hoje" Button */}
          <button
            onClick={handleToday}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-full transition shadow-2xs"
          >
            Hoje
          </button>

          {/* Chevron Navigation */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrev}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-full transition"
              title="Período anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-full transition"
              title="Próximo período"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Month / Year Title */}
          <h2 className="text-base sm:text-lg font-medium text-slate-800 ml-1">
            {monthTitle}
          </h2>
        </div>

        {/* Right: Search, Help, Settings, View Selector Dropdown */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => {}}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition hidden md:inline-flex"
            title="Pesquisar"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => {}}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition hidden md:inline-flex"
            title="Suporte"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          <button
            onClick={() => {}}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition hidden md:inline-flex"
            title="Configurações"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* View Mode Dropdown (Semana, Dia, Mês) */}
          <div className="relative">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="text-xs font-semibold px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 cursor-pointer hover:bg-slate-50 focus:outline-none pr-8"
            >
              <option value="semana">Semana</option>
              <option value="dia">Dia</option>
              <option value="mes">Mês</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. BODY CONTENT: SIDEBAR + MAIN CALENDAR GRID */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT SIDEBAR (Collapsible) */}
        {sidebarOpen && (
          <aside className="w-64 border-r border-slate-200 p-4 shrink-0 flex flex-col space-y-6 overflow-y-auto bg-white transition-all">
            
            {/* "+ Criar" Large Pill Button */}
            <div>
              <button
                onClick={() => {
                  setPopoverSlot({ date: toDateString(currentDate), hour: 10 });
                  setIsCreateModalOpen(true);
                }}
                className="w-36 py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 shadow-md hover:shadow-lg rounded-full text-xs font-bold text-slate-700 flex items-center justify-between transition-all"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl leading-none text-blue-600 font-black">+</span>
                  <span className="text-sm">Criar</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* MINI MONTH CALENDAR PICKER */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                <span>{monthTitle}</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      const d = new Date(currentDate);
                      d.setMonth(d.getMonth() - 1);
                      setCurrentDate(d);
                    }}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-500"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      const d = new Date(currentDate);
                      d.setMonth(d.getMonth() + 1);
                      setCurrentDate(d);
                    }}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-500"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Day initials D S T Q Q S S */}
              <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400">
                <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
              </div>

              {/* Mini day numbers */}
              <div className="grid grid-cols-7 text-center text-xs">
                {miniCalendarDays.map((item, idx) => {
                  const isCur = item.date.getDate() === currentDate.getDate() &&
                                item.date.getMonth() === currentDate.getMonth() &&
                                item.date.getFullYear() === currentDate.getFullYear();
                  const isTodayCell = isToday(item.date);

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentDate(item.date)}
                      className={`h-7 w-7 mx-auto rounded-full flex items-center justify-center transition text-[11px] font-medium ${
                        isTodayCell
                          ? 'bg-blue-600 text-white font-bold'
                          : isCur
                          ? 'bg-blue-100 text-blue-800 font-bold'
                          : item.isCurrentMonth
                          ? 'text-slate-700 hover:bg-slate-100'
                          : 'text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SEARCH PEOPLE / RESIDENTS */}
            <div className="space-y-1">
              <div className="relative">
                <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar residentes / eventos"
                  value={searchPerson}
                  onChange={(e) => setSearchPerson(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-teal-500"
                />
              </div>
            </div>

            {/* MINHAS AGENDAS / CATEGORIAS CHECKBOXES */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Minhas agendas (ILPI)</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="space-y-1.5">
                {CALENDAR_CATEGORIES.map((cat) => {
                  const isChecked = selectedCategories[cat.id];

                  return (
                    <label
                      key={cat.id}
                      className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCategory(cat.id)}
                        className="rounded cursor-pointer"
                        style={{ accentColor: cat.color }}
                      />
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                      <span className="truncate">{cat.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

          </aside>
        )}

        {/* MAIN CALENDAR GRID */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          
          {/* SEMANA VIEW */}
          {viewMode === 'semana' && (
            <div className="flex-1 flex flex-col overflow-y-auto">
              
              {/* Header row with Days of the week */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-200 sticky top-0 bg-white z-20">
                {/* Timezone label (Padrão Brasília GMT-03) */}
                <div className="p-2 text-[10px] text-slate-500 font-bold border-r border-slate-200 flex flex-col items-center justify-end text-center leading-tight">
                  <span className="text-[9px] text-slate-400">BRT</span>
                  <span>GMT-03</span>
                </div>

                {/* 7 Days Columns */}
                {weekDays.map((dayDate, idx) => {
                  const isTodayCol = isToday(dayDate);
                  const isSelectedCol = dayDate.getDate() === currentDate.getDate();
                  const dayMonthStr = `${dayDate.getDate().toString().padStart(2, '0')}/${(dayDate.getMonth() + 1).toString().padStart(2, '0')}`;

                  return (
                    <div
                      key={idx}
                      className="py-2.5 text-center border-r border-slate-200 last:border-r-0"
                    >
                      <div className={`text-[11px] font-bold uppercase tracking-wider ${
                        isTodayCol ? 'text-blue-600' : 'text-slate-500'
                      }`}>
                        {dayNamesPt[dayDate.getDay()]}
                      </div>
                      <div className="mt-1 flex justify-center">
                        <button
                          onClick={() => setCurrentDate(dayDate)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-normal transition ${
                            isTodayCol
                              ? 'bg-blue-600 text-white font-bold shadow-xs'
                              : isSelectedCol
                              ? 'bg-slate-100 text-slate-800 font-semibold'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {dayDate.getDate()}
                        </button>
                      </div>
                      <div className={`text-[10px] font-medium mt-0.5 ${
                        isTodayCol ? 'text-blue-600 font-bold' : 'text-slate-400'
                      }`}>
                        {dayMonthStr}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 24 Hours Grid */}
              <div className="flex-1 divide-y divide-slate-100">
                {hours.map((hour) => {
                  return (
                    <div
                      key={hour}
                      className="grid grid-cols-[60px_repeat(7,1fr)] min-h-[50px] relative group"
                    >
                      {/* Left Hour Label */}
                      <div className="text-[10px] font-semibold text-slate-400 text-right pr-2 pt-1 border-r border-slate-200 select-none">
                        {formatHourLabel(hour)}
                      </div>

                      {/* 7 Day Slots for this Hour */}
                      {weekDays.map((dayDate, dayIdx) => {
                        const dateStr = toDateString(dayDate);
                        const isTodayCol = isToday(dayDate);

                        // Find events scheduled in this day & hour
                        const slotEvents = filteredEvents.filter(e => {
                          if (e.date !== dateStr) return false;
                          const startH = parseInt(e.startTime.split(':')[0], 10);
                          return startH === hour;
                        });

                        return (
                          <div
                            key={dayIdx}
                            onClick={() => handleCellClick(dateStr, hour)}
                            className="border-r border-slate-100 last:border-r-0 hover:bg-blue-50/20 transition cursor-pointer relative p-0.5"
                          >
                            {/* Render Event Chips */}
                            {slotEvents.map(evt => {
                              const catConfig = CALENDAR_CATEGORIES.find(c => c.id === evt.category);

                              return (
                                <div
                                  key={evt.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEvent(evt);
                                  }}
                                  className={`rounded-lg px-2 py-1 mb-1 text-[11px] font-semibold shadow-xs border transition truncate cursor-pointer z-10 ${
                                    catConfig?.bgClass || 'bg-blue-100 text-blue-900 border-blue-300'
                                  }`}
                                  title={`${evt.startTime} - ${evt.title}`}
                                >
                                  <div className="flex items-center space-x-1">
                                    <span className="font-bold">{evt.startTime}</span>
                                    <span className="truncate">{evt.title}</span>
                                  </div>
                                  {evt.residentName && (
                                    <div className="text-[9px] opacity-80 truncate">
                                      {evt.residentName}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* DIA VIEW */}
          {viewMode === 'dia' && (
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {formatDateFullPtBr(toDateString(currentDate))}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {formatDatePtBr(toDateString(currentDate))} • Horário Padrão de Brasília (GMT-03)
                  </p>
                </div>
              </div>

              <div className="flex-1 divide-y divide-slate-100">
                {hours.map((hour) => {
                  const dateStr = toDateString(currentDate);
                  const dayEvents = filteredEvents.filter(e => {
                    if (e.date !== dateStr) return false;
                    const startH = parseInt(e.startTime.split(':')[0], 10);
                    return startH === hour;
                  });

                  return (
                    <div
                      key={hour}
                      onClick={() => handleCellClick(dateStr, hour)}
                      className="grid grid-cols-[70px_1fr] min-h-[56px] hover:bg-blue-50/20 cursor-pointer p-1"
                    >
                      <div className="text-xs font-semibold text-slate-400 text-right pr-3 pt-1 border-r border-slate-200">
                        {formatHourLabel(hour)}
                      </div>

                      <div className="pl-3 space-y-1">
                        {dayEvents.map(evt => {
                          const catConfig = CALENDAR_CATEGORIES.find(c => c.id === evt.category);

                          return (
                            <div
                              key={evt.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(evt);
                              }}
                              className={`p-2.5 rounded-xl border text-xs font-semibold max-w-lg shadow-xs ${
                                catConfig?.bgClass || 'bg-blue-100 text-blue-900 border-blue-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-sm">{evt.title}</span>
                                <span className="text-[11px]">{evt.startTime} - {evt.endTime}</span>
                              </div>
                              {evt.residentName && (
                                <div className="text-xs text-slate-600 mt-0.5">
                                  Residente: <strong>{evt.residentName}</strong>
                                </div>
                              )}
                              {evt.location && (
                                <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{evt.location}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MÊS VIEW */}
          {viewMode === 'mes' && (
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2 text-xs font-bold text-slate-600">
                <span>DOMINGO</span><span>SEGUNDA</span><span>TERÇA</span><span>QUARTA</span><span>QUINTA</span><span>SEXTA</span><span>SÁBADO</span>
              </div>

              <div className="grid grid-cols-7 flex-1 divide-x divide-y divide-slate-100">
                {miniCalendarDays.map((item, idx) => {
                  const dateStr = toDateString(item.date);
                  const isCur = item.date.getDate() === currentDate.getDate();
                  const isTodayCell = isToday(item.date);
                  const dayEvents = filteredEvents.filter(e => e.date === dateStr);

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setCurrentDate(item.date);
                        setViewMode('dia');
                      }}
                      className={`min-h-[90px] p-1.5 hover:bg-slate-50 transition cursor-pointer flex flex-col justify-between ${
                        item.isCurrentMonth ? 'bg-white' : 'bg-slate-50/50 text-slate-400'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center ${
                          isTodayCell
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-700'
                        }`}>
                          {item.day}
                        </span>
                      </div>

                      <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                        {dayEvents.slice(0, 3).map(evt => (
                          <div
                            key={evt.id}
                            className="text-[10px] truncate px-1.5 py-0.5 rounded-md font-medium text-white"
                            style={{ backgroundColor: evt.color || '#0284c7' }}
                          >
                            {evt.startTime} {evt.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[9px] text-slate-400 font-bold px-1">
                            +{dayEvents.length - 3} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 3. QUICK EVENT CREATOR POPOVER (EXACT REPLICA OF SCREENSHOT 2) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
            
            {/* Top Toolbar: Drag Handle & Close */}
            <div className="px-6 pt-4 pb-2 flex items-center justify-between text-slate-400">
              <div className="flex space-x-1 cursor-grab">
                <span className="w-4 h-0.5 bg-slate-300 rounded block"></span>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEvent} className="px-6 pb-6 space-y-4">
              
              {/* Title Input with Underline */}
              <div>
                <input
                  type="text"
                  placeholder="Adicionar título"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xl font-medium text-slate-900 border-b-2 border-blue-600 focus:outline-none pb-1.5 placeholder-slate-400"
                  autoFocus
                  required
                />
              </div>

              {/* Type Pills [Evento] [Tarefa] [Agendamento de horários] */}
              <div className="flex items-center space-x-2 pt-1">
                {[
                  { id: 'evento', label: 'Evento' },
                  { id: 'tarefa', label: 'Tarefa' },
                  { id: 'agendamento', label: 'Agendamento de horários' }
                ].map((typeItem) => (
                  <button
                    key={typeItem.id}
                    type="button"
                    onClick={() => setNewType(typeItem.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      newType === typeItem.id
                        ? 'bg-sky-100 text-sky-800 font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {typeItem.label}
                  </button>
                ))}
              </div>

              {/* Date & Time Row with Clock Icon (Padrão Brasil & Brasília) */}
              <div className="flex items-start space-x-3 text-xs text-slate-700 pt-2">
                <Clock className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                <div className="space-y-1.5 w-full">
                  <div className="font-semibold text-slate-900 text-sm">
                    {formatDateFullPtBr(popoverSlot.date)}
                  </div>
                  <div className="text-xs text-slate-600 font-medium flex items-center space-x-2">
                    <span>{newStartTime} às {newEndTime}</span>
                    <span className="text-slate-300">•</span>
                    <span>{formatDatePtBr(popoverSlot.date)}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Fuso horário: Horário Padrão de Brasília (GMT-03) • Não se repete
                  </div>
                  <div className="flex items-center space-x-2 pt-1 flex-wrap gap-y-1">
                    <div className="flex items-center space-x-1">
                      <label className="text-[10px] text-slate-500 font-semibold">Data:</label>
                      <input
                        type="date"
                        value={popoverSlot.date}
                        onChange={(e) => setPopoverSlot(prev => ({ ...prev, date: e.target.value }))}
                        className="p-1 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                      />
                    </div>
                    <div className="flex items-center space-x-1">
                      <label className="text-[10px] text-slate-500 font-semibold">Início:</label>
                      <input
                        type="time"
                        value={newStartTime}
                        onChange={(e) => setNewStartTime(e.target.value)}
                        className="p-1 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                      />
                    </div>
                    <span className="text-slate-400 text-xs">até</span>
                    <div className="flex items-center space-x-1">
                      <label className="text-[10px] text-slate-500 font-semibold">Fim:</label>
                      <input
                        type="time"
                        value={newEndTime}
                        onChange={(e) => setNewEndTime(e.target.value)}
                        className="p-1 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Resident / Guests with Users Icon */}
              <div className="flex items-center space-x-3 text-xs">
                <Users className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={newResidentId}
                  onChange={(e) => setNewResidentId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-medium focus:outline-blue-500"
                >
                  <option value="">Associar a um Residente (Opcional)</option>
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Quarto {r.room} - Leito {r.bed})
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Meet / Video Conference */}
              <div className="flex items-center space-x-3 text-xs text-slate-600">
                <Video className="w-4 h-4 text-amber-500 shrink-0" />
                <button
                  type="button"
                  onClick={() => alert('Link de teleconsulta criado com sucesso!')}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Adicionar videoconferência / Teleconsulta
                </button>
              </div>

              {/* Add Location with MapPin Icon */}
              <div className="flex items-center space-x-3 text-xs">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Adicionar local (ex: Consultório 1, Jardim, Quarto 102)"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:outline-blue-500"
                />
              </div>

              {/* Add Description with AlignLeft Icon */}
              <div className="flex items-start space-x-3 text-xs">
                <AlignLeft className="w-4 h-4 text-slate-400 mt-2 shrink-0" />
                <textarea
                  rows={2}
                  placeholder="Adicionar descrição, cuidados especiais ou preparo prévio"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl focus:outline-blue-500"
                />
              </div>

              {/* Select Category / Calendar with Color Dot */}
              <div className="flex items-center space-x-3 text-xs pt-1">
                <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex items-center space-x-2 w-full">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold focus:outline-blue-500 flex-1"
                  >
                    {CALENDAR_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bottom Actions: "Mais opções" and "Salvar" */}
              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl transition"
                >
                  Mais opções
                </button>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md transition"
                >
                  Salvar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 4. EVENT DETAILS MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Detalhes do Agendamento
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-slate-100"
                  title="Excluir evento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <span className="w-4 h-4 rounded-full mt-1 shrink-0" style={{ backgroundColor: selectedEvent.color || '#0284c7' }}></span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {selectedEvent.title}
                  </h3>
                  <div className="text-xs text-slate-700 mt-1">
                    <strong>{formatDateFullPtBr(selectedEvent.date)}</strong>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {selectedEvent.startTime} às {selectedEvent.endTime} (Horário Padrão de Brasília, GMT-03) • {formatDatePtBr(selectedEvent.date)}
                  </div>
                </div>
              </div>

              {selectedEvent.residentName && (
                <div className="flex items-center space-x-3 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span>Residente Vinculado: <strong>{selectedEvent.residentName}</strong></span>
                </div>
              )}

              {selectedEvent.location && (
                <div className="flex items-center space-x-3 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Local: <strong>{selectedEvent.location}</strong></span>
                </div>
              )}

              {selectedEvent.description && (
                <div className="flex items-start space-x-3 text-xs text-slate-600">
                  <AlignLeft className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <p className="leading-relaxed">{selectedEvent.description}</p>
                </div>
              )}

              {selectedEvent.assignedTo && (
                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  Responsável: {selectedEvent.assignedTo}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
