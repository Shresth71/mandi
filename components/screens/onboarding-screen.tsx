'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useApp } from '@/lib/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Languages, User, MapPin, ChevronRight, Sparkles, Check, ArrowLeft } from 'lucide-react';
import type { Language, CompanionGender } from '@/lib/types';

const languages: { id: Language; label: string; native: string; flag: string }[] = [
  { id: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { id: 'hi', label: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { id: 'garhwali', label: 'Garhwali', native: 'गढ़वाली', flag: '🏔️' },
];

export function OnboardingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const { setLanguage, setCompanionGender, completeOnboarding, preferences, t } = useApp();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate background blobs
      gsap.to('.onboarding-blob', {
        x: 20,
        y: -20,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 1,
      });

      // Content animation
      gsap.fromTo(
        '.onboarding-content',
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.step-item',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out', delay: 0.3 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [step]);

  const handleNext = () => {
    gsap.to('.onboarding-content', {
      opacity: 0,
      x: -50,
      scale: 0.95,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        if (step < 2) {
          setStep(step + 1);
        } else {
          completeOnboarding(name || 'Farmer', location || 'India');
        }
      },
    });
  };

  const handleBack = () => {
    gsap.to('.onboarding-content', {
      opacity: 0,
      x: 50,
      scale: 0.95,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        setStep(step - 1);
      },
    });
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    gsap.timeline()
      .to(`.lang-card-${lang}`, {
        scale: 0.95,
        duration: 0.1,
      })
      .to(`.lang-card-${lang}`, {
        scale: 1.02,
        duration: 0.15,
        ease: 'back.out(2)',
      })
      .to(`.lang-card-${lang}`, {
        scale: 1,
        duration: 0.1,
      });
  };

  const handleCompanionSelect = (gender: CompanionGender) => {
    setCompanionGender(gender);
    gsap.timeline()
      .to(`.companion-${gender}`, {
        scale: 0.95,
        duration: 0.1,
      })
      .to(`.companion-${gender}`, {
        scale: 1.05,
        duration: 0.2,
        ease: 'back.out(2)',
      })
      .to(`.companion-${gender}`, {
        scale: 1,
        duration: 0.1,
      });
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background flex flex-col relative overflow-hidden"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="onboarding-blob absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="onboarding-blob absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl" style={{ animationDelay: '-2s' }} />
        <div className="onboarding-blob absolute -bottom-32 right-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl" style={{ animationDelay: '-4s' }} />
      </div>

      {/* Header */}
      <div className="relative px-6 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 active:scale-95 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
            )}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    i < step ? 'w-4 bg-primary/50' : i === step ? 'w-10 bg-primary' : 'w-4 bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-sm text-muted-foreground font-medium">
            {step + 1}/3
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 onboarding-content relative">
        {step === 0 && (
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="w-18 h-18 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-lg glow-sm">
                <Languages className="w-9 h-9 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('selectLanguage')}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {preferences.language === 'hi' 
                  ? 'ऐप के लिए अपनी पसंदीदा भाषा चुनें'
                  : 'Choose your preferred language for the app'}
              </p>
            </div>

            <div className="space-y-3">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageSelect(lang.id)}
                  className={`step-item lang-card-${lang.id} w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 flex items-center justify-between shadow-sm hover:shadow-md ${
                    preferences.language === lang.id
                      ? 'border-primary bg-primary/5 shadow-lg'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{lang.flag}</span>
                    <div>
                      <p className="font-bold text-lg text-foreground">{lang.native}</p>
                      <p className="text-muted-foreground text-sm">{lang.label}</p>
                    </div>
                  </div>
                  {preferences.language === lang.id && (
                    <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="w-18 h-18 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-lg glow-sm">
                <Sparkles className="w-9 h-9 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('selectCompanion')}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {preferences.language === 'hi' 
                  ? 'अपना AI साथी चुनें जो आपकी मदद करेगा'
                  : 'Choose your AI companion to guide you'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(['male', 'female'] as CompanionGender[]).map((gender) => (
                <button
                  key={gender}
                  onClick={() => handleCompanionSelect(gender)}
                  className={`step-item companion-${gender} p-6 rounded-2xl border-2 text-center transition-all duration-300 relative overflow-hidden ${
                    preferences.companionGender === gender
                      ? 'border-primary bg-primary/5 shadow-lg'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-muted/30 shadow-sm hover:shadow-md'
                  }`}
                >
                  {preferences.companionGender === gender && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full gradient-primary flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center shadow-inner">
                    <span className="text-5xl">
                      {gender === 'male' ? '👨‍🌾' : '👩‍🌾'}
                    </span>
                  </div>
                  <p className="font-bold text-lg text-foreground">
                    {gender === 'male' ? t('male') : t('female')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {gender === 'male' 
                      ? (preferences.language === 'hi' ? 'किसान मित्र' : 'Kisan Mitra')
                      : (preferences.language === 'hi' ? 'किसान सखी' : 'Kisan Sakhi')}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="w-18 h-18 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-lg glow-sm">
                <User className="w-9 h-9 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                {preferences.language === 'hi' ? 'अपना परिचय दें' : 'Tell Us About You'}
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {preferences.language === 'hi' 
                  ? 'आपकी जानकारी से बेहतर सलाह मिलेगी'
                  : 'This helps us personalize your experience'}
              </p>
            </div>

            <div className="space-y-5">
              <div className="step-item space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  {preferences.language === 'hi' ? 'आपका नाम' : 'Your Name'}
                </label>
                <div className="relative">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={preferences.language === 'hi' ? 'राम कुमार' : 'Ram Kumar'}
                    className="h-14 text-lg rounded-xl border-2 focus:border-primary transition-colors pl-4"
                  />
                </div>
              </div>

              <div className="step-item space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  {preferences.language === 'hi' ? 'आपका गाँव/शहर' : 'Your Village/City'}
                </label>
                <div className="relative">
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={preferences.language === 'hi' ? 'देहरादून, उत्तराखंड' : 'Dehradun, Uttarakhand'}
                    className="h-14 text-lg rounded-xl border-2 focus:border-primary transition-colors pl-4"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative p-6 safe-bottom">
        <Button
          onClick={handleNext}
          className="w-full h-14 text-lg font-bold rounded-2xl gradient-primary text-primary-foreground hover:opacity-90 transition-all glow-sm shadow-xl active:scale-[0.98]"
        >
          {step === 2 ? t('getStarted') : t('continue')}
          <ChevronRight className="w-6 h-6 ml-2" />
        </Button>
      </div>
    </div>
  );
}
