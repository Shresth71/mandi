'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type Language, type CompanionGender, type UserPreferences, type Screen, translations } from './types';

interface AppContextType {
  preferences: UserPreferences;
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  setLanguage: (lang: Language) => void;
  setCompanionGender: (gender: CompanionGender) => void;
  completeOnboarding: (name: string, location: string) => void;
  t: (key: keyof typeof translations.en) => string;
  showCompanion: boolean;
  setShowCompanion: (show: boolean) => void;
  companionMessage: string;
  setCompanionMessage: (msg: string) => void;
}

const defaultPreferences: UserPreferences = {
  language: 'en',
  companionGender: 'female',
  onboardingComplete: false,
  farmerName: '',
  location: '',
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [showCompanion, setShowCompanion] = useState(false);
  const [companionMessage, setCompanionMessage] = useState('');

  const setLanguage = useCallback((lang: Language) => {
    setPreferences(prev => ({ ...prev, language: lang }));
  }, []);

  const setCompanionGender = useCallback((gender: CompanionGender) => {
    setPreferences(prev => ({ ...prev, companionGender: gender }));
  }, []);

  const completeOnboarding = useCallback((name: string, location: string) => {
    setPreferences(prev => ({
      ...prev,
      onboardingComplete: true,
      farmerName: name,
      location: location,
    }));
    setCurrentScreen('home');
    setShowCompanion(true);
    setCompanionMessage(
      preferences.language === 'hi'
        ? `नमस्ते ${name}! मैं आपकी मदद के लिए यहाँ हूँ।`
        : preferences.language === 'garhwali'
        ? `नमस्कार ${name}! म्यार तुम्हरी मदद करण यां छूं।`
        : `Hello ${name}! I'm here to help you with your farming journey.`
    );
  }, [preferences.language]);

  const t = useCallback((key: keyof typeof translations.en): string => {
    return translations[preferences.language][key] || translations.en[key];
  }, [preferences.language]);

  return (
    <AppContext.Provider
      value={{
        preferences,
        currentScreen,
        setCurrentScreen,
        setLanguage,
        setCompanionGender,
        completeOnboarding,
        t,
        showCompanion,
        setShowCompanion,
        companionMessage,
        setCompanionMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
