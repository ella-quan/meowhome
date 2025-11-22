
import React, { useState } from 'react';
import { AppData, ViewState, Language, FamilyMember, TodoItem, Priority } from '../types';
import { Translation } from '../utils/i18n';
import { Calendar, Footprints, Clock, Image as ImageIcon, ChevronRight, Cat, Coffee, Moon, X, Plus } from 'lucide-react';
import { isToday } from '../utils/dateUtils';
import { addMember, addTodo } from '../services/storageService';

interface DashboardProps {
  data: AppData;
  onChangeView: (view: ViewState) => void;
  t: Translation;
  lang: Language;
}

const AVATAR_OPTIONS = [
  '🐱', '🐶', '🐼', '🐨', '🦊', '🐯', '🦁', '🐮',
  '🐷', '🐸', '🐙', '🦋', '🌸', '🌟', '🌈', '💫'
];

const Dashboard: React.FC<DashboardProps> = ({ data, onChangeView, t, lang }) => {
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAvatar, setNewMemberAvatar] = useState(AVATAR_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAddTodoModal, setShowAddTodoModal] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<Priority>(Priority.Medium);
  const [newTodoAssignedTo, setNewTodoAssignedTo] = useState<string>('');

  const todayEvents = data.events.filter(e => isToday(e.startTime));
  const activeTodos = data.todos.filter(t => !t.completed);
  const highPriorityTodos = activeTodos.filter(t => t.priority === 'high');

  // Get next upcoming event
  const now = Date.now();
  const upcomingEvents = data.events
    .filter(e => e.startTime > now)
    .sort((a, b) => a.startTime - b.startTime);
  const nextEvent = upcomingEvents[0];

  // Helper to get member by ID
  const getMember = (id?: string) => data.members.find(m => m.id === id);

  const recentPhotos = [...(data.photos || [])].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: t.dashboard.greeting.morning, icon: <Coffee className="w-8 h-8 text-accent-400" /> };
    if (hour < 18) return { text: t.dashboard.greeting.afternoon, icon: <Cat className="w-8 h-8 text-primary-400" /> };
    return { text: t.dashboard.greeting.evening, icon: <Moon className="w-8 h-8 text-secondary-400" /> };
  };

  const { text: greetingText, icon: greetingIcon } = getGreeting();
  const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: lang === 'en' };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    setIsSubmitting(true);

    const newMember: FamilyMember = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newMemberName.trim(),
      avatar: newMemberAvatar
    };

    try {
      await addMember(newMember);
      setShowAddMemberModal(false);
      setNewMemberName('');
      setNewMemberAvatar(AVATAR_OPTIONS[0]);
    } catch (error) {
      console.error('Failed to add member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    setIsSubmitting(true);

    const newTodo: TodoItem = {
      id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: newTodoTitle.trim(),
      completed: false,
      priority: newTodoPriority,
      assignedTo: newTodoAssignedTo || undefined,
      createdAt: Date.now()
    };

    try {
      await addTodo(newTodo);
      setShowAddTodoModal(false);
      setNewTodoTitle('');
      setNewTodoPriority(Priority.Medium);
      setNewTodoAssignedTo('');
    } catch (error) {
      console.error('Failed to add todo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Upcoming Events
            </h2>
            {upcomingEvents.length > 0 && (
              <span className="bg-white text-primary-500 px-4 py-2 rounded-[1rem] text-sm font-black shadow-sm">
                {upcomingEvents.length}
              </span>
            )}
          </div>

          <div className="space-y-3 relative z-10">
            {upcomingEvents.length > 0 ? upcomingEvents.slice(0, 3).map(event => (
              <div key={event.id} className="bg-white/60 backdrop-blur-sm p-4 rounded-[1.5rem] border border-white/50 hover:bg-white/80 transition-colors">
                <div className="font-bold text-lg text-primary-800">{event.title}</div>
                <div className="text-primary-600 text-sm flex items-center gap-1.5 font-bold mt-1">
                  <Clock className="w-4 h-4" />
                  {event.isAllDay ? t.calendar.allDay : new Date(event.startTime).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: lang === 'en'
                  })}
                </div>
                {event.assignedTo && getMember(event.assignedTo) && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="text-xl">{getMember(event.assignedTo)?.avatar}</div>
                    <span className="text-xs font-bold text-primary-700">{getMember(event.assignedTo)?.name}</span>
                  </div>
                )}
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
            <div className="flex items-center gap-2">
              <span className="bg-white text-mint-500 px-4 py-2 rounded-[1rem] text-sm font-black shadow-sm">
                {activeTodos.length}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddTodoModal(true);
                }}
                className="p-2 bg-white text-mint-500 rounded-xl hover:bg-mint-200 transition-all hover:scale-110 shadow-sm"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
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
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-5xl border-[6px] border-white shadow-lg group-hover:scale-110 transition-transform relative">
                {member.avatar}
                {/* Cat Ears on avatar hover */}
                <div className="absolute -top-3 left-0 right-0 flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-gray-300 -rotate-12"></div>
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-gray-300 rotate-12"></div>
                </div>
              </div>
              <span className="text-sm font-black text-gray-500">{member.name}</span>
            </div>
          ))}
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="w-20 h-20 rounded-full bg-secondary-50 border-4 border-dashed border-secondary-200 flex items-center justify-center text-secondary-300 hover:border-secondary-300 hover:text-secondary-400 transition-all flex-shrink-0 hover:scale-105"
          >
            <span className="text-4xl font-light pb-1">+</span>
          </button>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowAddMemberModal(false)}>
          <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-white p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-700">Add Family Member</h2>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-3">
                  Name
                </label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-primary-300 focus:outline-none text-gray-700 font-medium transition-all"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-3">
                  Choose avatar
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewMemberAvatar(emoji)}
                      className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ${
                        newMemberAvatar === emoji
                          ? 'bg-primary-100 border-2 border-primary-300 scale-110 shadow-sm'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newMemberName.trim() || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-primary-300 to-primary-400 text-white font-black py-4 rounded-2xl shadow-lg shadow-primary-200 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
                >
                  {isSubmitting ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Todo Modal */}
      {showAddTodoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowAddTodoModal(false)}>
          <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-white p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-700">Add Task</h2>
              <button
                onClick={() => setShowAddTodoModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddTodo} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-3">
                  Task
                </label>
                <input
                  type="text"
                  value={newTodoTitle}
                  onChange={(e) => setNewTodoTitle(e.target.value)}
                  placeholder="Enter task description"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-mint-300 focus:outline-none text-gray-700 font-medium transition-all"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-3">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewTodoPriority(Priority.Low)}
                    className={`px-4 py-3 rounded-xl font-bold transition-all ${
                      newTodoPriority === Priority.Low
                        ? 'bg-secondary-200 text-secondary-800 border-2 border-secondary-400 scale-105'
                        : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    {t.tasks.priority.low}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTodoPriority(Priority.Medium)}
                    className={`px-4 py-3 rounded-xl font-bold transition-all ${
                      newTodoPriority === Priority.Medium
                        ? 'bg-accent-200 text-accent-800 border-2 border-accent-400 scale-105'
                        : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    {t.tasks.priority.medium}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTodoPriority(Priority.High)}
                    className={`px-4 py-3 rounded-xl font-bold transition-all ${
                      newTodoPriority === Priority.High
                        ? 'bg-primary-200 text-primary-800 border-2 border-primary-400 scale-105'
                        : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    {t.tasks.priority.high}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-3">
                  Assign to
                </label>
                <select
                  value={newTodoAssignedTo}
                  onChange={(e) => setNewTodoAssignedTo(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-mint-300 focus:outline-none text-gray-700 font-medium transition-all"
                >
                  <option value="">{t.tasks.unassigned}</option>
                  {data.members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.avatar} {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddTodoModal(false)}
                  className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTodoTitle.trim() || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-mint-400 to-mint-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-mint-200 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
                >
                  {isSubmitting ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
