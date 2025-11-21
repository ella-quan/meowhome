
import { AppData, FamilyMember, TodoItem, CalendarEvent, Photo, Priority } from '../types';
import { db, storage } from './firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy,
  addDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Constants
const FAMILY_ID = 'demo-family'; // In a real app, this would be dynamic based on login
const LOCAL_USER_KEY = 'ourhome_current_user_id';

// Initial empty state
export const INITIAL_DATA: AppData = {
  members: [],
  todos: [],
  events: [],
  photos: []
};

// --- Local User Management ---

export const getLocalUserId = (): string | null => {
  return localStorage.getItem(LOCAL_USER_KEY);
};

export const setLocalUserId = (id: string) => {
  localStorage.setItem(LOCAL_USER_KEY, id);
};

// --- Real-time Subscriptions ---

export const subscribeToFamilyData = (
  onUpdate: (data: Partial<AppData>) => void
) => {
  const familyRef = doc(db, 'families', FAMILY_ID);

  // Listen to Members
  const unsubMembers = onSnapshot(collection(familyRef, 'members'), (snapshot) => {
    const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FamilyMember));
    onUpdate({ members });
  });

  // Listen to Todos
  const unsubTodos = onSnapshot(query(collection(familyRef, 'todos'), orderBy('createdAt', 'desc')), (snapshot) => {
    const todos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TodoItem));
    onUpdate({ todos });
  });

  // Listen to Events
  const unsubEvents = onSnapshot(query(collection(familyRef, 'events')), (snapshot) => {
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent));
    onUpdate({ events });
  });

  // Listen to Photos
  const unsubPhotos = onSnapshot(query(collection(familyRef, 'photos'), orderBy('timestamp', 'desc')), (snapshot) => {
    const photos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
    onUpdate({ photos });
  });

  // Return unsubscribe function
  return () => {
    unsubMembers();
    unsubTodos();
    unsubEvents();
    unsubPhotos();
  };
};

// --- CRUD Operations ---

export const addMember = async (member: FamilyMember) => {
  const ref = doc(db, 'families', FAMILY_ID, 'members', member.id);
  await setDoc(ref, member);
};

export const addTodo = async (todo: TodoItem) => {
  const ref = doc(db, 'families', FAMILY_ID, 'todos', todo.id);
  await setDoc(ref, todo);
};

export const updateTodo = async (todo: TodoItem) => {
  const ref = doc(db, 'families', FAMILY_ID, 'todos', todo.id);
  await updateDoc(ref, { ...todo });
};

export const deleteTodo = async (id: string) => {
  const ref = doc(db, 'families', FAMILY_ID, 'todos', id);
  await deleteDoc(ref);
};

export const addEvent = async (event: CalendarEvent) => {
  const ref = doc(db, 'families', FAMILY_ID, 'events', event.id);
  await setDoc(ref, event);
};

export const updateEvent = async (event: CalendarEvent) => {
  const ref = doc(db, 'families', FAMILY_ID, 'events', event.id);
  await updateDoc(ref, { ...event });
};

export const deleteEvent = async (id: string) => {
  const ref = doc(db, 'families', FAMILY_ID, 'events', id);
  await deleteDoc(ref);
};

// --- Photo Management (Firebase Storage) ---

export const uploadPhoto = async (file: File): Promise<string> => {
  const storageRef = ref(storage, `photos/${FAMILY_ID}/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};

export const addPhoto = async (photo: Photo) => {
  const ref = doc(db, 'families', FAMILY_ID, 'photos', photo.id);
  await setDoc(ref, photo);
};

export const deletePhoto = async (photo: Photo) => {
  // Delete from Firestore
  const docRef = doc(db, 'families', FAMILY_ID, 'photos', photo.id);
  await deleteDoc(docRef);

  // Delete from Storage
  // Note: This assumes the URL is a direct Firebase Storage URL. 
  // If external URLs are allowed, we should check before deleting.
  try {
    const storageRef = ref(storage, photo.url);
    await deleteObject(storageRef);
  } catch (e) {
    console.warn("Could not delete file from storage (might be external or already deleted)", e);
  }
};
