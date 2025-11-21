
import React, { useState, useRef, useEffect } from 'react';
import { TodoItem, Priority, FamilyMember } from '../types';
import { Translation } from '../utils/i18n';
import { Trash2, Flag, UserPlus, User, Footprints, Fish } from 'lucide-react';

interface TodoViewProps {
  todos: TodoItem[];
  members: FamilyMember[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (todo: TodoItem) => void;
  t: Translation;
}

const TodoView: React.FC<TodoViewProps> = ({ todos, members, onToggle, onDelete, onUpdate, t }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [assignMenuOpen, setAssignMenuOpen] = useState<string | null>(null); 
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAssignMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  }).sort((a, b) => {
      if (a.completed === b.completed) {
         if (a.priority === Priority.High && b.priority !== Priority.High) return -1;
         if (b.priority === Priority.High && a.priority !== Priority.High) return 1;
         return b.createdAt - a.createdAt;
      }
      return a.completed ? 1 : -1;
  });

  const getPriorityStyles = (p: Priority) => {
    switch(p) {
      case Priority.High: return 'bg-primary-100 text-primary-600 border-primary-200';
      case Priority.Medium: return 'bg-accent-100 text-accent-600 border-accent-200';
      case Priority.Low: return 'bg-secondary-100 text-secondary-600 border-secondary-200';
    }
  };
  
  const getPriorityLabel = (p: Priority) => {
     return t.tasks.priority[p as keyof typeof t.tasks.priority];
  };

  const handleAssign = (todo: TodoItem, memberId: string | undefined) => {
     onUpdate({ ...todo, assignedTo: memberId });
     setAssignMenuOpen(null);
  };

  const getAssignedMember = (id?: string) => members.find(m => m.id === id);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-[3rem] shadow-soft border-4 border-white p-6 md:p-8 min-h-[70vh] relative">
      {/* Decorative Cat Ears for the Container */}
      <div className="absolute -top-6 left-20 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[30px] border-b-white rotate-[-10deg]"></div>
      <div className="absolute -top-6 right-20 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[30px] border-b-white rotate-[10deg]"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-3xl font-black text-gray-700 flex items-center gap-3">
            <span className="bg-accent-100 p-2 rounded-2xl text-accent-500">
                <Fish className="w-6 h-6" />
            </span>
            {t.tasks.title}
        </h2>
        
        <div className="flex bg-secondary-50 p-1.5 rounded-2xl w-fit border-2 border-white shadow-sm">
             {['all', 'active', 'completed'].map((f) => (
               <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-5 py-2.5 text-sm font-black rounded-xl transition-all capitalize ${
                    filter === f ? 'bg-white text-secondary-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
               >
                 {t.tasks.filter[f as keyof typeof t.tasks.filter]}
               </button>
             ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-20 text-gray-300 flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                <Footprints className="w-12 h-12 opacity-20 rotate-12" />
            </div>
            <p className="font-bold text-lg text-gray-400">{t.tasks.empty}</p>
          </div>
        ) : (
          filteredTodos.map(todo => {
            const assigned = getAssignedMember(todo.assignedTo);
            const isMenuOpen = assignMenuOpen === todo.id;

            return (
              <div 
                key={todo.id} 
                className={`group flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-[2rem] transition-all border-4 ${
                  todo.completed 
                    ? 'bg-gray-50 border-transparent opacity-50 scale-95' 
                    : 'bg-white border-white shadow-card hover:border-primary-100 hover:shadow-md hover:-translate-y-1'
                }`}
              >
                {/* Paw Print Checkbox */}
                <button 
                  onClick={() => onToggle(todo.id)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all border-4 ${
                    todo.completed 
                      ? 'bg-mint-400 border-mint-200 text-white rotate-12' 
                      : 'bg-gray-50 border-gray-100 text-transparent hover:border-primary-200 hover:bg-primary-50 hover:text-primary-200'
                  }`}
                >
                  <Footprints className="w-6 h-6 fill-current" />
                </button>
                
                {/* Title */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-lg text-gray-700 truncate ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                    {todo.title}
                  </h3>
                </div>

                {/* Priority Badge */}
                <div className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-2 ${getPriorityStyles(todo.priority)}`}>
                  <Flag className="w-3 h-3 fill-current" />
                  <span className="hidden sm:inline">{getPriorityLabel(todo.priority)}</span>
                </div>

                {/* Assignment Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setAssignMenuOpen(isMenuOpen ? null : todo.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      assigned 
                        ? `${assigned.avatar} border-white shadow-sm` 
                        : 'bg-gray-50 border-dashed border-gray-300 text-gray-400 hover:text-secondary-500 hover:border-secondary-300'
                    }`}
                    title={assigned ? assigned.name : t.tasks.assignTo}
                  >
                    {assigned ? (
                      <span className="text-white text-xs font-black">{assigned.name[0]}</span>
                    ) : (
                      <UserPlus className="w-5 h-5" />
                    )}
                  </button>

                  {isMenuOpen && (
                    <div ref={menuRef} className="absolute right-0 mt-3 w-52 bg-white rounded-[1.5rem] shadow-xl border-4 border-secondary-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="p-2 space-y-1">
                        <div className="px-3 py-2 text-xs font-black text-gray-300 uppercase tracking-wider mb-1 text-center">
                          {t.tasks.assignTo}
                        </div>
                        {members.map(member => (
                          <button
                            key={member.id}
                            onClick={() => handleAssign(todo, member.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-secondary-50 transition-colors ${todo.assignedTo === member.id ? 'bg-secondary-100 text-secondary-600' : 'text-gray-600'}`}
                          >
                            <div className={`w-8 h-8 rounded-full ${member.avatar} flex items-center justify-center text-white text-[10px] font-black border-2 border-white shadow-sm`}>
                              {member.name[0]}
                            </div>
                            <span className="font-bold text-sm">{member.name}</span>
                            {todo.assignedTo === member.id && <Footprints className="w-4 h-4 ml-auto fill-current opacity-50" />}
                          </button>
                        ))}
                        {todo.assignedTo && (
                          <button
                            onClick={() => handleAssign(todo, undefined)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-primary-50 text-primary-400 transition-colors mt-1"
                          >
                             <div className="w-8 h-8 rounded-full border-2 border-primary-100 flex items-center justify-center bg-white">
                                <User className="w-4 h-4" />
                             </div>
                             <span className="font-bold text-sm">{t.tasks.unassigned}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Delete Button */}
                <button 
                  onClick={() => onDelete(todo.id)}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-300 hover:bg-primary-50 hover:text-primary-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TodoView;
