'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useApp } from '@/lib/app-context';
import { SplashScreen } from './screens/splash-screen';
import { LoginScreen } from './screens/login-screen';
import { OnboardingScreen } from './screens/onboarding-screen';
import { HomeScreen } from './screens/home-screen';
import { CropDoctorScreen } from './screens/cropdoctor-screen';
import { KhetSenseScreen } from './screens/khetsense-screen';
import { FairMandiScreen } from './screens/fairmandi-screen';
import { WeatherScreen } from './screens/weather-screen';
import { AutoClaimScreen } from './screens/autoclaim-screen';
import { ProfileScreen } from './screens/profile-screen';
import { MarketplaceScreen } from './screens/marketplace-screen';
import { BottomNav } from './navigation/bottom-nav';
import { AICompanion } from './ai-companion';
import { VoiceAssistant } from './voice-assistant';
import { Mic, Sparkles } from 'lucide-react';

export function KisaanKavachApp() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const { currentScreen } = useApp();

  // Screen transition animation
  useEffect(() => {
    if (containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.screen-content',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [currentScreen]);

  const renderScreen = () => {
    const Screen = (() => {
      switch (currentScreen) {
        case 'splash':
          return SplashScreen;
        case 'login':
          return LoginScreen;
        case 'onboarding':
          return OnboardingScreen;
        case 'home':
          return HomeScreen;
        case 'cropdoctor':
          return CropDoctorScreen;
        case 'khetsense':
          return KhetSenseScreen;
        case 'fairmandi':
          return FairMandiScreen;
        case 'weather':
          return WeatherScreen;
        case 'autoclaim':
          return AutoClaimScreen;
        case 'marketplace':
          return MarketplaceScreen;
        case 'profile':
          return ProfileScreen;
        default:
          return HomeScreen;
      }
    })();
    
    return (
      <div className="screen-content">
        <Screen />
      </div>
    );
  };

  const showBottomNav = !['splash', 'login', 'onboarding', 'khetsense'].includes(currentScreen);
  const showVoiceButton = !['splash', 'login', 'onboarding'].includes(currentScreen);

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-background overflow-hidden shadow-2xl">
      {/* Phone frame effect for desktop */}
      <div className="hidden md:block absolute inset-0 rounded-[3rem] border-8 border-foreground/10 pointer-events-none z-50" />
      
      {/* Decorative corner accents */}
      <div className="hidden md:block absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/20 rounded-tl-xl pointer-events-none z-50" />
      <div className="hidden md:block absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/20 rounded-tr-xl pointer-events-none z-50" />
      <div className="hidden md:block absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/20 rounded-bl-xl pointer-events-none z-50" />
      <div className="hidden md:block absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/20 rounded-br-xl pointer-events-none z-50" />
      
      {/* Main content */}
      <div ref={containerRef} className="min-h-screen">
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      {showBottomNav && <BottomNav />}

      {/* Voice Assistant Button */}
      {showVoiceButton && (
        <button
          onClick={() => setShowVoiceAssistant(true)}
          className="fixed bottom-28 left-4 z-40 w-14 h-14 rounded-2xl gradient-primary shadow-xl flex items-center justify-center glow hover:glow-lg active:scale-95 transition-all group"
          aria-label="Voice Assistant"
        >
          <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Mic className="w-6 h-6 text-primary-foreground relative z-10" />
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-accent animate-pulse" />
        </button>
      )}

      {/* Voice Assistant Modal */}
      <VoiceAssistant 
        isOpen={showVoiceAssistant} 
        onClose={() => setShowVoiceAssistant(false)} 
      />

      {/* Floating AI Companion */}
      <AICompanion />
    </div>
  );
}
