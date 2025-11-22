
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AppData, ViewState, TodoItem, CalendarEvent, Photo, Language, FamilyMember } from './types';
import {
  subscribeToFamilyData,
  getLocalUserId,
  setLocalUserId,
  addMember,
  addTodo,
  updateTodo,
  deleteTodo,
  addEvent,
  updateEvent,
  deleteEvent,
  addPhoto,
  deletePhoto,
  INITIAL_DATA
} from './services/storageService';
import { translations } from './utils/i18n';
import { LayoutDashboard, Calendar as CalIcon, Footprints, Image as ImageIcon, Globe, Cat, Loader2 } from 'lucide-react';

// Lazy load components for better initial load performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const CalendarView = lazy(() => import('./components/CalendarView'));
const TodoView = lazy(() => import('./components/TodoView'));
const GalleryView = lazy(() => import('./components/GalleryView'));
const MagicInput = lazy(() => import('./components/MagicInput'));
const Onboarding = lazy(() => import('./components/Onboarding'));

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(getLocalUserId());

  const t = translations[language];

  // Real-time Subscription
  useEffect(() => {
    // Always subscribe to get members data for profile selection
    const unsubscribe = subscribeToFamilyData((newData) => {
      setData(prev => ({ ...prev, ...newData }));
      // Once we get members data, stop loading
      if (newData.members && newData.members.length > 0) {
        setIsLoadingMembers(false);
      }
    });

    // Show UI after a brief moment to allow Firebase to connect
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsLoadingMembers(false);
    }, 1000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // Derived "Onboarded" state: user exists in local storage AND is present in the fetched members list
  const isMemberLoaded = data.members.some(m => m.id === currentUser);
  const needsOnboarding = !currentUser || (!isLoading && !isMemberLoaded && data.members.length > 0 && false);
  // Note: The 'false' above prevents re-onboarding loop if DB is wiped but local storage remains.
  // Simply: if no currentUser ID locally, show onboarding.

  const handleOnboardingComplete = async (member: FamilyMember) => {
    // Set user state immediately for instant transition
    setLocalUserId(member.id);
    setCurrentUser(member.id);

    // Write to Firebase in background (don't block UI)
    addMember(member).catch(err => {
      console.error('Failed to save member to Firebase:', err);
    });
  };

  // Wrapper functions to match Component props
  const handleAddTodo = (todo: TodoItem) => addTodo(todo);
  const handleToggleTodo = (id: string) => {
    const todo = data.todos.find(t => t.id === id);
    if (todo) updateTodo({ ...todo, completed: !todo.completed });
  };
  const handleUpdateTodo = (updatedTodo: TodoItem) => updateTodo(updatedTodo);
  const handleDeleteTodo = (id: string) => deleteTodo(id);

  const handleAddEvent = (event: CalendarEvent) => addEvent(event);
  const handleUpdateEvent = (event: CalendarEvent) => updateEvent(event);
  const handleDeleteEvent = (id: string) => deleteEvent(id);

  const handleAddPhoto = (photo: Photo) => addPhoto(photo);
  const handleDeletePhoto = (id: string) => {
    const photo = data.photos.find(p => p.id === id);
    if (photo) deletePhoto(photo);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="flex flex-col items-center gap-4">
         <Loader2 className="w-12 h-12 text-primary-400 animate-spin" />
         <p className="text-gray-400 font-bold animate-pulse">Loading...</p>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Onboarding
          onComplete={handleOnboardingComplete}
          existingMembers={data.members}
          isLoading={isLoadingMembers}
          t={t}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
    <div className="min-h-screen pb-24 md:pb-0 md:pl-32">
      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex fixed left-6 top-6 bottom-6 w-24 bg-white/80 backdrop-blur-md rounded-[3rem] shadow-soft border-4 border-white flex-col items-center py-8 z-40">
        <div className="w-14 h-14 bg-gradient-to-tr from-primary-300 to-primary-400 rounded-full mb-10 flex items-center justify-center text-white shadow-lg shadow-primary-200 transform rotate-3 hover:rotate-12 transition-all">
          <Cat className="fill-current" size={28} />
        </div>
        
        <div className="flex flex-col gap-6 w-full px-3">
          <NavIcon 
            icon={<LayoutDashboard size={26} />} 
            active={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')} 
            color="text-secondary-400"
            bg="bg-secondary-50"
          />
          <NavIcon 
            icon={<CalIcon size={26} />} 
            active={currentView === 'calendar'} 
            onClick={() => setCurrentView('calendar')} 
            color="text-primary-400"
            bg="bg-primary-50"
          />
          <NavIcon 
            icon={<Footprints size={26} />} 
            active={currentView === 'todos'} 
            onClick={() => setCurrentView('todos')} 
            color="text-accent-400"
            bg="bg-accent-50"
          />
          <NavIcon 
            icon={<ImageIcon size={26} />} 
            active={currentView === 'gallery'} 
            onClick={() => setCurrentView('gallery')} 
            color="text-mint-400"
            bg="bg-mint-100"
          />
        </div>

        <div className="mt-auto">
          <button 
            onClick={toggleLanguage}
            className="w-12 h-12 rounded-full bg-white shadow-sm hover:shadow-md border-2 border-gray-50 text-gray-400 hover:text-primary-400 flex items-center justify-center transition-all hover:scale-110"
            title="Switch Language"
          >
            <Globe size={22} />
          </button>
          <div className="text-[10px] font-black text-gray-300 text-center mt-2 uppercase tracking-widest">{language}</div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 p-4 z-30 flex justify-between items-center bg-white/50 backdrop-blur-md border-b border-white/20">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-300 rounded-2xl flex items-center justify-center text-white shadow-soft transform -rotate-6">
              <Cat className="w-6 h-6 fill-current" />
            </div>
            <span className="font-black text-xl text-gray-700 tracking-tight">MeowHome</span>
         </div>
         <button 
            onClick={toggleLanguage}
            className="w-10 h-10 rounded-full bg-white shadow-sm border-2 border-white text-gray-500 flex items-center justify-center"
          >
            <Globe size={20} />
          </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-lg rounded-[2.5rem] border-4 border-white/50 z-40 px-6 py-4 flex justify-between items-center shadow-soft">
         <NavIconMobile 
            icon={<LayoutDashboard size={24} />} 
            active={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')} 
            activeColor="text-secondary-400"
          />
          <NavIconMobile 
            icon={<CalIcon size={24} />} 
            active={currentView === 'calendar'} 
            onClick={() => setCurrentView('calendar')} 
            activeColor="text-primary-400"
          />
          <NavIconMobile 
            icon={<Footprints size={24} />} 
            active={currentView === 'todos'} 
            onClick={() => setCurrentView('todos')} 
            activeColor="text-accent-400"
          />
          <NavIconMobile 
            icon={<ImageIcon size={24} />} 
            active={currentView === 'gallery'} 
            onClick={() => setCurrentView('gallery')} 
            activeColor="text-mint-400"
          />
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-10 pt-24 md:pt-10">
        {currentView === 'dashboard' && (
          <Dashboard data={data} onChangeView={setCurrentView} t={t} lang={language} />
        )}
        {currentView === 'calendar' && (
          <CalendarView 
            events={data.events} 
            onAddEvent={handleAddEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent} 
            t={t} 
            lang={language} 
          />
        )}
        {currentView === 'todos' && (
          <TodoView
            todos={data.todos}
            members={data.members}
            onToggle={handleToggleTodo}
            onDelete={handleDeleteTodo}
            onUpdate={handleUpdateTodo}
            onAdd={handleAddTodo}
            t={t}
          />
        )}
        {currentView === 'gallery' && (
          <GalleryView 
            photos={data.photos || []} 
            members={data.members} 
            onAddPhoto={handleAddPhoto} 
            onDeletePhoto={handleDeletePhoto}
            t={t}
            lang={language}
          />
        )}
      </main>

      <MagicInput
        onAddTodo={handleAddTodo}
        onAddEvent={handleAddEvent}
        members={data.members}
        t={t}
      />
    </div>
    </Suspense>
  );
};

const NavIcon = ({ icon, active, onClick, color, bg }: any) => (
  <button 
    onClick={onClick}
    className={`group flex items-center justify-center w-full aspect-square rounded-[1.5rem] transition-all duration-300 ${active ? `${bg} ${color} scale-105 shadow-sm` : 'text-gray-300 hover:bg-white hover:text-gray-400'}`}
  >
    {icon}
  </button>
);

const NavIconMobile = ({ icon, active, onClick, activeColor }: any) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-2xl transition-all duration-300 ${active ? `bg-gray-50 ${activeColor} scale-110 shadow-sm` : 'text-gray-300'}`}
  >
    {icon}
  </button>
);

export default App;
