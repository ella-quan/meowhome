
import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, X, Cat } from 'lucide-react';
import { parseNaturalLanguage } from '../services/geminiService';
import { TodoItem, CalendarEvent, Priority, FamilyMember } from '../types';
import { Translation } from '../utils/i18n';

interface MagicInputProps {
  onAddTodo: (todo: TodoItem) => void;
  onAddEvent: (event: CalendarEvent) => void;
  members: FamilyMember[];
  t: Translation;
}

const MagicInput: React.FC<MagicInputProps> = ({ onAddTodo, onAddEvent, members, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await parseNaturalLanguage(input, members);

      if (!result) {
        throw new Error("Could not understand that.");
      }

      if (result.type === 'todo') {
        const newTodo: TodoItem = {
          id: Date.now().toString(),
          title: result.data.title,
          completed: false,
          priority: (result.data.priority as Priority) || Priority.Medium,
          createdAt: Date.now(),
          ...(result.data.assignedTo && { assignedTo: result.data.assignedTo })
        };
        onAddTodo(newTodo);
      } else if (result.type === 'event') {
        const newEvent: CalendarEvent = {
          id: Date.now().toString(),
          title: result.data.title,
          startTime: result.data.startTime ? new Date(result.data.startTime).getTime() : Date.now(),
          endTime: result.data.endTime ? new Date(result.data.endTime).getTime() : Date.now() + 3600000,
          isAllDay: result.data.isAllDay || false,
          ...(result.data.location && { location: result.data.location }),
          type: result.data.eventType || 'general'
        };
        onAddEvent(newEvent);
      }

      setInput('');
      setIsOpen(false);
    } catch (err) {
      setError(t.magic.error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 md:bottom-10 right-6 bg-gradient-to-br from-primary-400 to-primary-500 text-white p-5 rounded-full shadow-lg shadow-primary-300/50 hover:shadow-xl hover:scale-110 transition-all duration-300 z-50 flex items-center gap-3 group border-4 border-white animate-soft-bounce"
      >
        <div className="relative">
             <Cat className="w-8 h-8" />
             <Sparkles className="w-4 h-4 absolute -top-2 -right-2 text-yellow-200 animate-spin-slow" />
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-black text-lg">
          {t.magic.button}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-primary-900/20 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-8 mb-6 md:mb-0 transform transition-all animate-in fade-in slide-in-from-bottom-10 border-4 border-white relative cat-ears-top mt-6">
        
        {/* Decorative Background Blobs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center gap-3 text-primary-500">
            <div className="p-3 bg-primary-50 rounded-2xl">
              <Cat className="w-8 h-8" />
            </div>
            <h3 className="font-black text-2xl text-gray-700">{t.magic.title}</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-2 rounded-full transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        <p className="text-gray-500 font-bold mb-6 relative z-10 ml-2">
          {t.magic.hint}
        </p>

        <form onSubmit={handleSubmit} className="relative z-10">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.magic.placeholder}
              className="w-full bg-gray-50 border-2 border-gray-100 text-gray-700 text-xl font-bold rounded-[2rem] focus:ring-4 focus:ring-primary-100 focus:border-primary-300 block p-6 pr-16 shadow-inner transition-all placeholder-gray-300"
              autoFocus
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing || !input.trim()}
              className="absolute right-3 top-3 bottom-3 bg-primary-400 hover:bg-primary-500 text-white aspect-square rounded-[1.5rem] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:scale-105"
            >
              {isProcessing ? <Loader2 className="w-7 h-7 animate-spin" /> : <ArrowRight className="w-7 h-7" />}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-400 rounded-2xl text-center font-black animate-pulse relative z-10">
            {error}
          </div>
        )}
        
        {!process.env.API_KEY && (
             <p className="text-xs text-center text-amber-500 mt-4 bg-amber-50 p-3 rounded-2xl font-bold relative z-10">
                Note: Gemini API Key is required for Magic features.
             </p>
        )}
      </div>
    </div>
  );
};

export default MagicInput;
