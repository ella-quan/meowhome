import React, { useState } from 'react';
import { FamilyMember } from '../types';
import { Translation } from '../utils/i18n';
import { Cat, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onComplete: (member: FamilyMember) => void;
  existingMembers: FamilyMember[];
  t: Translation;
}

const AVATAR_OPTIONS = [
  '🐱', '🐶', '🐼', '🐨', '🦊', '🐯', '🦁', '🐮',
  '🐷', '🐸', '🐙', '🦋', '🌸', '🌟', '🌈', '💫'
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, existingMembers, t }) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  const handleSelectProfile = () => {
    const member = existingMembers.find(m => m.id === selectedMemberId);
    if (member) {
      onComplete(member);
    }
  };

  // If there are existing members, show profile selection screen
  if (existingMembers.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-amber-50 to-secondary-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] shadow-soft border-4 border-white p-8 md:p-12">
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-tr from-primary-300 to-primary-400 rounded-full mb-4 flex items-center justify-center text-white shadow-lg shadow-primary-200 transform rotate-3">
                <Cat className="fill-current" size={40} />
              </div>
              <h1 className="font-black text-3xl text-gray-700 mb-2 tracking-tight">
                Welcome Back!
              </h1>
              <p className="text-gray-400 text-center">
                Who are you?
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-600 mb-3">
                Select your profile
              </label>
              <div className="grid grid-cols-2 gap-3">
                {existingMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`p-6 rounded-2xl flex flex-col items-center gap-3 transition-all ${
                      selectedMemberId === member.id
                        ? 'bg-primary-100 border-2 border-primary-300 scale-105 shadow-lg'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:scale-102'
                    }`}
                  >
                    <div className="text-5xl">{member.avatar}</div>
                    <span className="font-bold text-gray-700">{member.name}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleSelectProfile}
                disabled={!selectedMemberId}
                className="w-full bg-gradient-to-r from-primary-300 to-primary-400 text-white font-black py-4 rounded-2xl shadow-lg shadow-primary-200 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all flex items-center justify-center gap-2 mt-6"
              >
                <Sparkles size={20} />
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No existing members - this code path shouldn't be reached if you've seeded profiles
  return null;
};

export default Onboarding;
