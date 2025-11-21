
export type ViewState = 'dashboard' | 'calendar' | 'todos' | 'gallery';
export type Language = 'en' | 'zh';

export enum Priority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string; // Color code or initial
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string; // Member ID
  priority: Priority;
  createdAt: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: number; // Timestamp
  endTime: number; // Timestamp
  location?: string;
  isAllDay: boolean;
  type: 'appointment' | 'activity' | 'celebration' | 'general';
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
  uploadedBy: string; // Member ID
  timestamp: number;
}

export interface AppData {
  todos: TodoItem[];
  events: CalendarEvent[];
  members: FamilyMember[];
  photos: Photo[];
}

export interface ParsedInput {
  type: 'todo' | 'event';
  data: any;
  confidence: number;
}
