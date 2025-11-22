import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBg8AzCB6Qv1ZJnSzv2YPnucDIO6i15fg4",
  authDomain: "ourhome-f5f1b.firebaseapp.com",
  projectId: "ourhome-f5f1b",
  storageBucket: "ourhome-f5f1b.firebasestorage.app",
  messagingSenderId: "578947415534",
  appId: "1:578947415534:web:efc0ff836b2d014b9ae2ff"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'ourhome'); // Connect to the 'ourhome' database

const FAMILY_ID = 'demo-family';

// Define your preset profiles here
const presetProfiles = [
  {
    id: 'user_ella',
    name: 'Ella',
    avatar: '🌟'
  },
  {
    id: 'user_mom',
    name: 'Mom',
    avatar: '🐑'
  },
  {
    id: 'user_dad',
    name: 'Dad',
    avatar: '🐼'
  },

];

// Upload profiles to Firebase
async function seedProfiles() {
  console.log('🚀 Starting to upload profiles to Firebase...\n');

  for (const profile of presetProfiles) {
    try {
      const memberRef = doc(db, 'families', FAMILY_ID, 'members', profile.id);
      await setDoc(memberRef, profile);
      console.log(`✅ Added: ${profile.avatar} ${profile.name} (${profile.id})`);
    } catch (error) {
      console.error(`❌ Failed to add ${profile.name}:`, error);
    }
  }

  console.log('\n✨ Done! Check your Firebase Console to verify.');
  console.log(`📍 Path: families/${FAMILY_ID}/members`);
  process.exit(0);
}

seedProfiles();
