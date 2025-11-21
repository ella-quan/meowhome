import React, { useState } from 'react';
import { FamilyMember } from '../types';
import { Translation } from '../utils/i18n';
import { Cat, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onComplete: (member: FamilyMember) => void;
  t: Translation;
}

const AVATAR_OPTIONS = [
  '🐱', '🐶', '🐼', '🐨', '🦊', '🐯', '🦁', '🐮',
  '🐷', '🐸', '🐙', '🦋', '🌸', '🌟', '🌈', '💫'
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, t }) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    const newMember: FamilyMember = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      avatar: selectedAvatar
    };

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    onComplete(newMember);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-amber-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] shadow-soft border-4 border-white p-8 md:p-12">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-tr from-primary-300 to-primary-400 rounded-full mb-4 flex items-center justify-center text-white shadow-lg shadow-primary-200 transform rotate-3">
              <Cat className="fill-current" size={40} />
            </div>
            <h1 className="font-black text-3xl text-gray-700 mb-2 tracking-tight">
              Welcome to MeowHome
            </h1>
            <p className="text-gray-400 text-center">
              Let's get you set up with your family!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-3">
                What's your name?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-primary-300 focus:outline-none text-gray-700 font-medium transition-all"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-3">
                Choose your avatar
              </label>
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedAvatar(emoji)}
                    className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ${
                      selectedAvatar === emoji
                        ? 'bg-primary-100 border-2 border-primary-300 scale-110 shadow-sm'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="w-full bg-gradient-to-r from-primary-300 to-primary-400 text-white font-black py-4 rounded-2xl shadow-lg shadow-primary-200 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating your profile...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Get Started
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
