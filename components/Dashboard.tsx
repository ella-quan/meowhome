
import React from 'react';
import { AppData, ViewState, Language } from '../types';
import { Translation } from '../utils/i18n';
import { Calendar, Footprints, Clock, Image as ImageIcon, ChevronRight, Cat, Coffee, Moon } from 'lucide-react';
import { isToday } from '../utils/dateUtils';

interface DashboardProps {
  data: AppData;
  onChangeView: (view: ViewState) => void;
  t: Translation;
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onChangeView, t, lang }) => {
  const todayEvents = data.events.filter(e => isToday(e.startTime));
  const activeTodos = data.todos.filter(t => !t.completed);
  const highPriorityTodos = activeTodos.filter(t => t.priority === 'high');
  
  const recentPhotos = [...(data.photos || [])].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: t.dashboard.greeting.morning, icon: <Coffee className="w-8 h-8 text-accent-400" /> };
    if (hour < 18) return { text: t.dashboard.greeting.afternoon, icon: <Cat className="w-8 h-8 text-primary-400" /> };
    return { text: t.dashboard.greeting.evening, icon: <Moon className="w-8 h-8 text-secondary-400" /> };
  };

  const { text: greetingText, icon: greetingIcon } = getGreeting();
  const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: lang === 'en' };

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-5 mb-8 pl-2">
        <div className="bg-white p-5 rounded-[2rem] shadow-soft border-4 border-white transform -rotate-3">
          {greetingIcon}
        </div>
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-700 tracking-tight mb-1">
            {greetingText}!
          </h1>
          <p className="text-gray-400 font-bold text-lg">{t.dashboard.subtitle}</p>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {/* Today's Schedule Card - Pink/Rose */}
        <div 
          onClick={() => onChangeView('calendar')}
          className="bg-primary-100 rounded-[3rem] p-8 text-primary-900 shadow-card cursor-pointer transform transition-all hover:scale-[1.02] hover:-rotate-1 relative overflow-hidden group border-4 border-white"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/40 rounded-full blur-2xl"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-2xl font-black flex items-center gap-3 text-primary-600">
              <div className="p-2 bg-white/60 rounded-2xl">
                 <Calendar className="w-6 h-6" />
              </div>
              {t.nav.calendar}
            </h2>
            <span className="bg-white text-primary-500 px-4 py-2 rounded-[1rem] text-sm font-black shadow-sm">
              {todayEvents.length}
            </span>
          </div>
          
          <div className="space-y-3 relative z-10">
            {todayEvents.length > 0 ? todayEvents.slice(0, 3).map(event => (
              <div key={event.id} className="bg-white/60 backdrop-blur-sm p-4 rounded-[1.5rem] border border-white/50 hover:bg-white/80 transition-colors">
                <div className="font-bold text-lg text-primary-800">{event.title}</div>
                <div className="text-primary-600 text-sm flex items-center gap-1.5 font-bold mt-1">
                  <Clock className="w-4 h-4" />
                  {event.isAllDay ? t.calendar.allDay : new Date(event.startTime).toLocaleTimeString(lang === 'zh' ? 'zh-CN' : 'en-US', timeOptions)}
                </div>
              </div>
            )) : (
              <div className="text-primary-400/80 py-8 text-center font-bold bg-white/30 rounded-[2rem] border-2 border-dashed border-primary-200">
                  {t.dashboard.noEventsToday} 🐱
              </div>
            )}
          </div>
        </div>

        {/* Quick Tasks Card - Mint/Green */}
        <div 
          onClick={() => onChangeView('todos')}
          className="bg-mint-100 rounded-[3rem] p-8 shadow-card border-4 border-white cursor-pointer transform transition-all hover:scale-[1.02] group flex flex-col relative"
        >
           <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/40 rounded-full blur-2xl"></div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-2xl font-black text-mint-800 flex items-center gap-3">
              <div className="p-2 bg-white/60 rounded-2xl text-mint-600">
                <Footprints className="w-6 h-6" />
              </div>
              {t.nav.tasks}
            </h2>
            <span className="bg-white text-mint-500 px-4 py-2 rounded-[1rem] text-sm font-black shadow-sm">
              {activeTodos.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 relative z-10">
            {highPriorityTodos.length > 0 ? highPriorityTodos.slice(0, 3).map(todo => (
              <div key={todo.id} className="flex items-center gap-3 p-4 bg-white/60 rounded-[1.5rem] transition-colors shadow-sm">
                <div className="w-4 h-4 rounded-full bg-primary-300 border-2 border-white shadow-sm"></div>
                <span className="text-mint-900 font-bold text-sm truncate">{todo.title}</span>
              </div>
            )) : activeTodos.slice(0, 3).map(todo => (
               <div key={todo.id} className="flex items-center gap-3 p-4 bg-white/60 rounded-[1.5rem] transition-colors shadow-sm">
                <div className="w-4 h-4 rounded-full bg-secondary-300 border-2 border-white shadow-sm"></div>
                <span className="text-mint-900 font-bold text-sm truncate">{todo.title}</span>
              </div>
            ))}
            
            {activeTodos.length === 0 && (
              <div className="text-mint-400 font-bold text-center py-8 bg-white/30 rounded-[2rem] border-2 border-dashed border-mint-200 italic">
                  {t.dashboard.allCaughtUp} 🧶
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-4 flex justify-end text-mint-600 font-black text-sm group-hover:translate-x-1 transition-transform relative z-10">
            {t.dashboard.viewAll} &rarr;
          </div>
        </div>

        {/* Recent Memories Card - Lavender */}
        <div 
          onClick={() => onChangeView('gallery')}
          className="bg-lavender-100 rounded-[3rem] p-8 shadow-card border-4 border-white cursor-pointer transform transition-all hover:scale-[1.02] hover:rotate-1 group flex flex-col relative overflow-hidden"
        >
             <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-white/30 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>

           <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-2xl font-black text-lavender-800 flex items-center gap-3">
              <div className="p-2 bg-white/60 rounded-2xl text-lavender-500 shadow-sm">
                <ImageIcon className="w-6 h-6" />
              </div>
              {t.dashboard.memories}
            </h2>
            <ChevronRight className="w-6 h-6 text-lavender-400 group-hover:text-lavender-600 transition-colors" />
          </div>

          <div className="flex-1 relative z-10">
            {recentPhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 aspect-[2/1] rounded-[1.5rem] overflow-hidden relative ring-4 ring-white shadow-sm rotate-1 hover:rotate-0 transition-transform">
                   <img src={recentPhotos[0].url} alt="recent" className="w-full h-full object-cover" />
                </div>
                {recentPhotos.slice(1, 3).map((photo, i) => (
                  <div key={photo.id} className={`aspect-square rounded-[1.5rem] overflow-hidden ring-4 ring-white shadow-sm ${i === 0 ? '-rotate-2' : 'rotate-2'} hover:rotate-0 transition-transform`}>
                     <img src={photo.url} alt="recent" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-lavender-400 text-center border-2 border-dashed border-lavender-200 rounded-[2rem] p-4 bg-white/30">
                <Cat className="w-10 h-10 mb-2 opacity-40" />
                <p className="font-bold">{t.dashboard.noPhotos}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Family Members Strip */}
      <div className="bg-white/80 backdrop-blur-sm rounded-[3rem] p-8 shadow-soft border-4 border-white">
        <h3 className="text-primary-300 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
             <Footprints className="w-4 h-4" />
             {t.dashboard.familyMembers}
        </h3>
        <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
          {data.members.map(member => (
            <div key={member.id} className="flex flex-col items-center gap-3 min-w-[90px] group cursor-pointer">
              <div className={`w-20 h-20 rounded-full ${member.avatar} flex items-center justify-center text-white font-black text-3xl border-[6px] border-white shadow-lg group-hover:scale-110 transition-transform relative`}>
                {member.name[0]}
                {/* Cat Ears on avatar hover */}
                <div className="absolute -top-3 left-0 right-0 flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-gray-300 -rotate-12"></div>
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-gray-300 rotate-12"></div>
                </div>
              </div>
              <span className="text-sm font-black text-gray-500">{member.name}</span>
            </div>
          ))}
          <button className="w-20 h-20 rounded-full bg-secondary-50 border-4 border-dashed border-secondary-200 flex items-center justify-center text-secondary-300 hover:border-secondary-300 hover:text-secondary-400 transition-all flex-shrink-0 hover:scale-105">
            <span className="text-4xl font-light pb-1">+</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
