
import React, { useState, useEffect } from 'react';
import { CalendarEvent, Language } from '../types';
import { Translation } from '../utils/i18n';
import { getDaysInMonth, getFirstDayOfMonth, isSameDay } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight, MapPin, Clock, Calendar as CalendarIcon, LayoutGrid, Plus, X, Save, Trash2 } from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
  onUpdateEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  t: Translation;
  lang: Language;
}

type CalendarViewMode = 'month' | 'week';

const CalendarView: React.FC<CalendarViewProps> = ({ events, onAddEvent, onUpdateEvent, onDeleteEvent, t, lang }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [newEventDate, setNewEventDate] = useState<Date | null>(null); 

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // --- Helpers ---

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'appointment': return 'bg-secondary-100 text-secondary-600 border-secondary-200';
      case 'activity': return 'bg-primary-100 text-primary-600 border-primary-200';
      case 'celebration': return 'bg-accent-100 text-accent-600 border-accent-200';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  const getEventTypeDot = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'appointment': return 'bg-secondary-300';
      case 'activity': return 'bg-primary-300';
      case 'celebration': return 'bg-accent-300';
      default: return 'bg-gray-300';
    }
  };

  // --- Interaction Handlers ---
  
  const handleOpenAddModal = (date: Date = selectedDate) => {
    setNewEventDate(date);
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setNewEventDate(null);
  };

  // --- Navigation ---

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  // --- Data Preparation ---

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthDays = [];
  for (let i = 0; i < firstDay; i++) {
    monthDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    monthDays.push(new Date(year, month, i));
  }

  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day; 
    start.setDate(diff);
    
    const days = [];
    for(let i=0; i<7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push(d);
    }
    return days;
  };
  const weekDays = getWeekDays(currentDate);

  const selectedDayEvents = events.filter(e => isSameDay(new Date(e.startTime), selectedDate)).sort((a, b) => a.startTime - b.startTime);
  
  const weekDayNames = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2024, 8, 29 + i); // A Sunday
    return date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'short' });
  });
  
  const currentTitle = viewMode === 'month' 
    ? currentDate.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', year: 'numeric' })
    : `${weekDays[0].toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })} - ${weekDays[6].toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: lang === 'en' };

  const HOURS = Array.from({length: 24}, (_, i) => i);
  const PIXELS_PER_HOUR = 60;
  const getEventStyle = (event: CalendarEvent) => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      const startMinutes = start.getHours() * 60 + start.getMinutes();
      let durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      if (durationMinutes < 30) durationMinutes = 30; 

      return {
          top: `${(startMinutes / 60) * PIXELS_PER_HOUR}px`,
          height: `${(durationMinutes / 60) * PIXELS_PER_HOUR}px`
      };
  };

  return (
    <>
    <div className="grid lg:grid-cols-3 gap-8 h-full">
      {/* Main Calendar Area */}
      <div className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-[3rem] shadow-soft border-4 border-white p-6 flex flex-col h-[calc(100vh-140px)] lg:h-auto lg:min-h-[600px]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 flex-shrink-0">
          <div className="flex gap-2 items-center">
            <div className="flex gap-2 bg-secondary-50 p-1.5 rounded-2xl border border-white">
              <button onClick={handlePrev} className="p-2 hover:bg-white rounded-xl text-gray-600 transition-all shadow-sm">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={handleNext} className="p-2 hover:bg-white rounded-xl text-gray-600 transition-all shadow-sm">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-gray-700 capitalize ml-2 tracking-tight">
              {currentTitle}
            </h2>
          </div>

          <div className="flex gap-1 bg-gray-50 p-1.5 rounded-2xl w-full md:w-auto border border-gray-100">
            <button 
              onClick={() => setViewMode('month')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-[1rem] text-sm font-bold transition-all flex items-center justify-center gap-2 ${viewMode === 'month' ? 'bg-white shadow-sm text-primary-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <CalendarIcon className="w-4 h-4" />
              {t.calendar.views.month}
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-[1rem] text-sm font-bold transition-all flex items-center justify-center gap-2 ${viewMode === 'week' ? 'bg-white shadow-sm text-primary-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              {t.calendar.views.week}
            </button>
          </div>
        </div>

        {/* Month View Grid */}
        {viewMode === 'month' && (
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-7 mb-4 text-center">
              {weekDayNames.map(d => (
                <div key={d} className="text-sm font-black text-gray-300 uppercase tracking-widest py-2">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-3">
              {monthDays.map((date, idx) => {
                if (!date) return <div key={`empty-${idx}`} className="aspect-square bg-transparent" />;
                
                const dayEvents = events.filter(e => isSameDay(new Date(e.startTime), date));
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());

                return (
                  <div 
                    key={date.toISOString()}
                    onClick={() => {
                      setSelectedDate(date);
                      setCurrentDate(date); 
                    }}
                    className={`aspect-square p-1 rounded-[1.5rem] border-2 transition-all cursor-pointer flex flex-col items-center justify-center relative group hover:shadow-md hover:-translate-y-1 ${
                      isSelected 
                        ? 'border-primary-300 bg-primary-50 shadow-inner' 
                        : isToday 
                            ? 'border-accent-200 bg-accent-50' 
                            : 'border-white bg-white/50 hover:border-gray-100'
                    }`}
                  >
                    <span className={`text-sm font-black w-8 h-8 flex items-center justify-center rounded-full transition-all mb-1 ${
                      isSelected ? 'bg-primary-300 text-white scale-110 shadow-md' : 
                      isToday ? 'bg-accent-300 text-white shadow-sm' : 'text-gray-600'
                    }`}>
                      {date.getDate()}
                    </span>
                    
                    <div className="flex gap-1 mt-1 justify-center flex-wrap max-w-[80%]">
                      {dayEvents.slice(0, 4).map(ev => (
                        <div key={ev.id} className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full border border-white ${getEventTypeDot(ev.type)}`} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Week View Grid */}
        {viewMode === 'week' && (
          <div className="flex flex-col flex-1 overflow-hidden border-4 border-gray-50 rounded-[2rem]">
             <div className="flex border-b-2 border-gray-50 bg-white">
               <div className="w-12 md:w-16 flex-shrink-0 border-r-2 border-gray-50 bg-gray-50/50"></div> 
               {weekDays.map((date, idx) => {
                   const isToday = isSameDay(date, new Date());
                   const isSelected = isSameDay(date, selectedDate);
                   return (
                       <div 
                        key={idx} 
                        className={`flex-1 py-3 text-center cursor-pointer transition-colors hover:bg-gray-50 ${isSelected ? 'bg-primary-50/50' : ''}`}
                        onClick={() => setSelectedDate(date)}
                       >
                           <div className={`text-xs font-black uppercase tracking-wider mb-1 ${isToday ? 'text-accent-400' : 'text-gray-300'}`}>
                               {weekDayNames[idx]}
                           </div>
                           <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-black ${isToday ? 'bg-accent-300 text-white shadow-md' : 'text-gray-600'}`}>
                               {date.getDate()}
                           </div>
                       </div>
                   );
               })}
             </div>

             <div className="flex-1 overflow-y-auto relative bg-white custom-scrollbar">
                <div className="flex" style={{ height: `${24 * PIXELS_PER_HOUR}px` }}>
                    <div className="w-12 md:w-16 flex-shrink-0 border-r-2 border-gray-50 bg-gray-50/30 text-xs font-bold text-gray-300">
                        {HOURS.map(hour => (
                            <div key={hour} className="relative" style={{ height: `${PIXELS_PER_HOUR}px` }}>
                                <span className="absolute -top-2.5 right-2">
                                   {hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour - 12}p`}
                                </span>
                            </div>
                        ))}
                    </div>
                    
                    {weekDays.map((date, dayIdx) => {
                        const dayEvents = events.filter(e => isSameDay(new Date(e.startTime), date) && !e.isAllDay);
                        const allDayEvents = events.filter(e => isSameDay(new Date(e.startTime), date) && e.isAllDay);
                        const isSelected = isSameDay(date, selectedDate);

                        return (
                            <div 
                                key={dayIdx} 
                                className={`flex-1 relative border-r border-gray-50 last:border-r-0 ${isSelected ? 'bg-primary-50/20' : ''}`}
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const y = e.clientY - rect.top;
                                    const hour = Math.floor(y / PIXELS_PER_HOUR);
                                    
                                    const newEventDate = new Date(date);
                                    newEventDate.setHours(hour);
                                    newEventDate.setMinutes(0);
                                    
                                    setSelectedDate(date);
                                    handleOpenAddModal(newEventDate);
                                }}
                            >
                                {HOURS.map(h => (
                                    <div key={h} className="border-b border-gray-50/50 absolute w-full" style={{ top: `${h * PIXELS_PER_HOUR}px` }}></div>
                                ))}

                                <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm w-full flex flex-col gap-1 p-1 border-b border-gray-50 min-h-[0px]">
                                    {allDayEvents.map(ev => (
                                        <div 
                                          key={ev.id} 
                                          onClick={(e) => { e.stopPropagation(); handleOpenEditModal(ev); }}
                                          className={`text-[10px] px-2 py-1 rounded-lg font-black truncate cursor-pointer hover:opacity-80 border ${getEventTypeColor(ev.type)}`}
                                        >
                                            {ev.title}
                                        </div>
                                    ))}
                                </div>

                                {dayEvents.map(ev => {
                                    const style = getEventStyle(ev);
                                    return (
                                        <div
                                            key={ev.id}
                                            className={`absolute left-0.5 right-1.5 rounded-xl px-2 py-1 text-xs font-bold border-2 shadow-sm overflow-hidden hover:z-30 transition-all hover:scale-105 cursor-pointer ${getEventTypeColor(ev.type)}`}
                                            style={style}
                                            title={`${ev.title}`}
                                            onClick={(e) => {
                                                e.stopPropagation(); 
                                                handleOpenEditModal(ev);
                                            }}
                                        >
                                            <div className="truncate">{ev.title}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
             </div>
          </div>
        )}

      </div>

      {/* Selected Day Agenda */}
      <div className="bg-white/80 backdrop-blur-md rounded-[3rem] shadow-soft border-4 border-white p-8 h-fit min-h-[500px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-100/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-50 relative z-10">
             <h3 className="text-xl font-black text-gray-700 capitalize">
                {selectedDate.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </h3>
            <button 
                onClick={() => handleOpenAddModal()}
                className="bg-primary-400 text-white p-3 rounded-2xl shadow-lg shadow-primary-200 hover:bg-primary-500 hover:scale-110 transition-all"
            >
                <Plus className="w-6 h-6" />
            </button>
        </div>

        <div className="space-y-4 relative z-10 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
          {selectedDayEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-300 flex flex-col items-center">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border-4 border-white">
                  <Clock className="w-8 h-8 opacity-20" />
               </div>
              <p className="font-bold">{t.calendar.noEvents}</p>
            </div>
          ) : (
            selectedDayEvents.map(event => (
              <div key={event.id} className="group relative cursor-pointer" onClick={() => handleOpenEditModal(event)}>
                <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border-2 border-gray-50 hover:border-primary-200 transition-all hover:-translate-y-1 hover:shadow-md">
                   <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${getEventTypeDot(event.type)}`}></div>
                        <h4 className="font-bold text-gray-700 line-clamp-2">{event.title}</h4>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteEvent(event.id); }}
                        className="text-gray-300 hover:text-primary-400 transition-colors p-1 hover:bg-primary-50 rounded-lg"
                      >
                         &times;
                      </button>
                   </div>
                   
                   <div className="flex items-center gap-2 text-sm text-gray-400 font-bold ml-5">
                     <Clock className="w-3.5 h-3.5" />
                     {event.isAllDay 
                       ? t.calendar.allDay
                       : `${new Date(event.startTime).toLocaleTimeString(lang === 'zh' ? 'zh-CN' : 'en-US', timeOptions)}`
                     }
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>

    {/* Add/Edit Event Modal with Cat Ears */}
    {isModalOpen && (
        <EventModal 
            isOpen={isModalOpen} 
            onClose={handleCloseModal} 
            onSave={(event) => {
                if (editingEvent) {
                    onUpdateEvent(event);
                } else {
                    onAddEvent(event);
                }
            }}
            onDelete={onDeleteEvent}
            eventToEdit={editingEvent}
            initialDate={newEventDate || selectedDate}
            t={t}
        />
    )}
    </>
  );
};

// --- Event Modal Component ---

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: CalendarEvent) => void;
    onDelete: (id: string) => void;
    eventToEdit: CalendarEvent | null;
    initialDate: Date;
    t: Translation;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, onDelete, eventToEdit, initialDate, t }) => {
    const [title, setTitle] = useState(eventToEdit?.title || '');
    const [location, setLocation] = useState(eventToEdit?.location || '');
    const [type, setType] = useState<CalendarEvent['type']>(eventToEdit?.type || 'general');
    const [isAllDay, setIsAllDay] = useState(eventToEdit?.isAllDay || false);
    
    const defaultStart = eventToEdit ? new Date(eventToEdit.startTime) : initialDate;
    const defaultEnd = eventToEdit ? new Date(eventToEdit.endTime) : new Date(initialDate.getTime() + 60 * 60 * 1000);

    const formatDateForInput = (d: Date) => {
        const pad = (n: number) => n < 10 ? `0${n}` : n;
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const [startDateStr, setStartDateStr] = useState(formatDateForInput(defaultStart));
    const [endDateStr, setEndDateStr] = useState(formatDateForInput(defaultEnd));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title.trim()) return;

        const start = new Date(startDateStr).getTime();
        const end = new Date(endDateStr).getTime();

        const newEvent: CalendarEvent = {
            id: eventToEdit?.id || Date.now().toString(),
            title,
            location,
            type,
            isAllDay,
            startTime: start,
            endTime: end,
            description: eventToEdit?.description 
        };
        
        onSave(newEvent);
        onClose();
    };

    const handleDelete = () => {
        if (eventToEdit && window.confirm(t.calendar.form.confirmDelete)) {
            onDelete(eventToEdit.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-200/30 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border-4 border-white relative cat-ears-top mt-6">
                 <button onClick={onClose} className="absolute top-6 right-6 text-gray-300 hover:text-gray-600 transition-colors">
                    <X className="w-6 h-6" />
                 </button>

                 <h2 className="text-2xl font-black text-gray-700 mb-6 text-center">
                     {eventToEdit ? t.calendar.editEvent : t.calendar.addEvent}
                 </h2>

                 <form onSubmit={handleSubmit} className="space-y-5">
                     <div>
                         <input 
                            type="text" 
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-700 focus:border-primary-300 focus:ring-0 transition-colors text-lg"
                            placeholder={t.calendar.form.title}
                         />
                     </div>

                     <div className="flex flex-wrap gap-2 justify-center">
                            {(['appointment', 'activity', 'celebration', 'general'] as const).map(tType => (
                                <button
                                    key={tType}
                                    type="button"
                                    onClick={() => setType(tType)}
                                    className={`px-3 py-1.5 rounded-xl text-sm font-black border-2 transition-all ${
                                        type === tType 
                                            ? 'bg-primary-50 border-primary-300 text-primary-500 shadow-sm' 
                                            : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                                    }`}
                                >
                                    {t.calendar.form.types[tType]}
                                </button>
                            ))}
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="block text-xs font-black text-gray-300 uppercase tracking-wider mb-1 ml-2">{t.calendar.form.starts}</label>
                             <input 
                                type="datetime-local" 
                                value={startDateStr}
                                onChange={e => setStartDateStr(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-3 py-3 font-bold text-gray-700 text-sm"
                             />
                         </div>
                         <div>
                             <label className="block text-xs font-black text-gray-300 uppercase tracking-wider mb-1 ml-2">{t.calendar.form.ends}</label>
                             <input 
                                type="datetime-local" 
                                value={endDateStr}
                                onChange={e => setEndDateStr(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-3 py-3 font-bold text-gray-700 text-sm"
                             />
                         </div>
                     </div>

                     <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                         <div 
                            onClick={() => setIsAllDay(!isAllDay)}
                            className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer flex items-center ${isAllDay ? 'bg-primary-300' : 'bg-gray-200'}`}
                         >
                             <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isAllDay ? 'translate-x-5' : 'translate-x-0'}`}></div>
                         </div>
                         <span className="font-bold text-gray-500 text-sm">{t.calendar.form.allDay}</span>
                     </div>

                     <div>
                         <div className="relative">
                            <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
                            <input 
                                type="text" 
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-11 pr-4 py-3 font-bold text-gray-700 focus:border-primary-300 focus:ring-0 transition-colors"
                                placeholder={t.calendar.form.location}
                            />
                         </div>
                     </div>

                     <div className="flex gap-3 pt-4">
                         {eventToEdit && (
                             <button 
                                type="button" 
                                onClick={handleDelete}
                                className="p-4 rounded-2xl bg-red-50 text-red-400 font-bold hover:bg-red-100 transition-colors"
                             >
                                 <Trash2 className="w-6 h-6" />
                             </button>
                         )}
                         <button 
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-primary-400 to-primary-500 text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-primary-200 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                         >
                             <Save className="w-5 h-5" />
                             {t.calendar.form.save}
                         </button>
                     </div>
                 </form>
            </div>
        </div>
    );
};

export default CalendarView;
