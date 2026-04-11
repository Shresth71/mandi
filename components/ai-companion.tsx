'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useApp } from '@/lib/app-context';
import { X, MessageCircle, Sparkles } from 'lucide-react';

export function AICompanion() {
  const companionRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    showCompanion, 
    setShowCompanion, 
    companionMessage, 
    setCompanionMessage,
    preferences,
    setCurrentScreen,
    currentScreen
  } = useApp();

  // Don't show on splash or onboarding
  const shouldShow = showCompanion && currentScreen !== 'splash' && currentScreen !== 'onboarding';

  useEffect(() => {
    if (shouldShow && companionRef.current) {
      const ctx = gsap.context(() => {
        // Bounce in animation
        gsap.fromTo(
          companionRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
        );

        // Floating animation
        gsap.to(companionRef.current, {
          y: -8,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        });
      }, companionRef);

      return () => ctx.revert();
    }
  }, [shouldShow]);

  useEffect(() => {
    if (companionMessage && bubbleRef.current) {
      setIsExpanded(true);
      gsap.fromTo(
        bubbleRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
      );

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        gsap.to(bubbleRef.current, {
          scale: 0,
          opacity: 0,
          duration: 0.2,
          onComplete: () => {
            setIsExpanded(false);
            setCompanionMessage('');
          },
        });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [companionMessage, setCompanionMessage]);

  // Contextual tips based on current screen
  useEffect(() => {
    if (!shouldShow) return;

    const tips: Record<string, { en: string; hi: string }> = {
      home: {
        en: 'Tap on any card to explore features!',
        hi: 'किसी भी कार्ड पर टैप करें!',
      },
      cropdoctor: {
        en: 'Take a clear photo of the affected leaf for best results.',
        hi: 'बेहतर परिणाम के लिए प्रभावित पत्ते की साफ फोटो लें।',
      },
      fairmandi: {
        en: 'Tap on any commodity to see detailed price trends.',
        hi: 'विस्तृत भाव देखने के लिए किसी फसल पर टैप करें।',
      },
      weather: {
        en: 'Plan your irrigation based on soil moisture levels.',
        hi: 'मिट्टी की नमी के आधार पर सिंचाई की योजना बनाएं।',
      },
    };

    // Show tip after a delay when entering a new screen
    const timer = setTimeout(() => {
      const tip = tips[currentScreen];
      if (tip && !companionMessage) {
        setCompanionMessage(preferences.language === 'hi' ? tip.hi : tip.en);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentScreen, shouldShow, preferences.language, companionMessage, setCompanionMessage]);

  if (!shouldShow) return null;

  const handleCompanionClick = () => {
    if (!isExpanded) {
      setCurrentScreen('khetsense');
    }
  };

  const dismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    gsap.to(bubbleRef.current, {
      scale: 0,
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        setIsExpanded(false);
        setCompanionMessage('');
      },
    });
  };

  return (
    <div
      ref={companionRef}
      className="fixed bottom-28 right-4 z-50"
    >
      {/* Speech Bubble */}
      {isExpanded && companionMessage && (
        <div
          ref={bubbleRef}
          className="absolute bottom-full right-0 mb-3 w-64 p-4 rounded-2xl rounded-br-md bg-card border border-border shadow-xl"
        >
          <button
            onClick={dismissBubble}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground leading-relaxed pr-4">
              {companionMessage}
            </p>
          </div>
          {/* Bubble tail */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card border-b border-r border-border rotate-45" />
        </div>
      )}

      {/* Companion Avatar */}
      <button
        onClick={handleCompanionClick}
        className="relative w-16 h-16 rounded-full gradient-primary shadow-lg shadow-primary/30 flex items-center justify-center group"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-30" />
        
        {/* Avatar */}
        <div className="relative w-14 h-14 rounded-full bg-primary-foreground/10 flex items-center justify-center text-2xl">
          {preferences.companionGender === 'male' ? '👨‍🌾' : '👩‍🌾'}
        </div>

        {/* Chat indicator */}
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center shadow-md">
          <MessageCircle className="w-3 h-3 text-accent-foreground" />
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 rounded-full bg-primary-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
}
