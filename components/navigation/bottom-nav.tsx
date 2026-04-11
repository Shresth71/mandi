'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useApp } from '@/lib/app-context';
import { Home, Camera, MessageCircle, TrendingUp, CloudSun } from 'lucide-react';
import type { Screen } from '@/lib/types';

const navItems: { id: Screen; icon: typeof Home; label: string; labelHi: string }[] = [
  { id: 'home', icon: Home, label: 'Home', labelHi: 'होम' },
  { id: 'cropdoctor', icon: Camera, label: 'Scan', labelHi: 'स्कैन' },
  { id: 'weather', icon: CloudSun, label: 'Weather', labelHi: 'मौसम' },
  { id: 'fairmandi', icon: TrendingUp, label: 'Mandi', labelHi: 'मंडी' },
  { id: 'khetsense', icon: MessageCircle, label: 'Chat', labelHi: 'चैट' },
];

export function BottomNav() {
  const navRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const { currentScreen, setCurrentScreen, preferences } = useApp();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        navRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
      );
    }, navRef);

    return () => ctx.revert();
  }, []);

  // Animate indicator when screen changes
  useEffect(() => {
    const activeIndex = navItems.findIndex(item => item.id === currentScreen);
    if (activeIndex !== -1 && indicatorRef.current) {
      gsap.to(indicatorRef.current, {
        x: activeIndex * 64 + 12, // 64px per item + offset
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [currentScreen]);

  const handleNavClick = (screen: Screen, index: number) => {
    if (screen === currentScreen) return;

    // Animate the clicked icon
    const iconElement = document.querySelector(`.nav-icon-${screen}`);
    gsap.timeline()
      .to(iconElement, {
        y: -8,
        scale: 1.2,
        duration: 0.15,
        ease: 'power2.out',
      })
      .to(iconElement, {
        y: 0,
        scale: 1,
        duration: 0.2,
        ease: 'bounce.out',
      });

    // Ripple effect
    const buttonElement = document.querySelector(`.nav-btn-${screen}`);
    if (buttonElement) {
      const ripple = document.createElement('span');
      ripple.className = 'absolute inset-0 bg-primary/20 rounded-xl animate-ripple';
      buttonElement.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }

    setCurrentScreen(screen);
  };

  return (
    <div
      ref={navRef}
      className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4"
    >
      <div className="relative mx-auto max-w-md rounded-2xl glass-strong shadow-2xl border border-white/20">
        {/* Active indicator */}
        <div 
          ref={indicatorRef}
          className="absolute top-2 w-12 h-12 rounded-xl gradient-primary opacity-20 blur-sm transition-transform"
          style={{ left: 0 }}
        />
        
        <nav className="relative flex items-center justify-between py-2 px-3">
          {navItems.map(({ id, icon: Icon, label, labelHi }, index) => {
            const isActive = currentScreen === id;
            return (
              <button
                key={id}
                onClick={() => handleNavClick(id, index)}
                className={`nav-btn-${id} relative flex flex-col items-center gap-0.5 w-16 py-2 rounded-xl transition-all duration-300 overflow-hidden ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-primary/10' : ''
                }`}>
                  <Icon
                    className={`nav-icon-${id} w-6 h-6 transition-all duration-300 ${
                      isActive ? 'text-primary' : ''
                    }`}
                  />
                  {isActive && (
                    <span className="absolute inset-0 rounded-xl bg-primary/20 animate-pulse" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold transition-all duration-300 ${
                    isActive ? 'text-primary opacity-100' : 'opacity-70'
                  }`}
                >
                  {preferences.language === 'hi' ? labelHi : label}
                </span>
                
                {/* Active dot indicator */}
                {isActive && (
                  <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary animate-bounce-in" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
