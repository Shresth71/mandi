'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useApp } from '@/lib/app-context';
import { Leaf, Shield, Sparkles, Sun, Cloud, Droplets } from 'lucide-react';

export function SplashScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const { setCurrentScreen, preferences } = useApp();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            scale: 1.1,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.in',
            onComplete: () => {
              setCurrentScreen(preferences.onboardingComplete ? 'home' : 'login');
            },
          });
        },
      });

      // Background morphing blobs
      gsap.to('.splash-blob', {
        scale: 1.2,
        x: '+=30',
        y: '+=20',
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.5,
      });

      // Particles float up with varied timing
      gsap.to('.splash-particle', {
        y: -120,
        opacity: 0,
        scale: 0,
        duration: 2.5,
        stagger: 0.08,
        repeat: -1,
        ease: 'power1.out',
      });

      // Floating icons
      gsap.to('.float-icon', {
        y: -20,
        rotation: 15,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.3,
      });

      // Logo animation sequence
      tl.fromTo(
        logoRef.current,
        { scale: 0, rotation: -360, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 1.2, ease: 'back.out(1.5)' }
      )
        .fromTo(
          '.logo-glow',
          { scale: 0, opacity: 0 },
          { scale: 1.5, opacity: 0.5, duration: 0.8, ease: 'power2.out' },
          '-=0.8'
        )
        .fromTo(
          '.logo-ring',
          { scale: 0, opacity: 0, rotation: -90 },
          { scale: 1, opacity: 1, rotation: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out' },
          '-=0.5'
        )
        .fromTo(
          textRef.current,
          { y: 50, opacity: 0, scale: 0.8 },
          { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.7)' },
          '-=0.3'
        )
        .fromTo(
          taglineRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
          '-=0.2'
        )
        .fromTo(
          '.feature-icon',
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'back.out(2)' },
          '-=0.3'
        )
        .to({}, { duration: 1.2 }); // Hold for a moment

      // Pulsing glow effect
      gsap.to('.logo-pulse', {
        scale: 1.3,
        opacity: 0,
        duration: 1.5,
        repeat: -1,
        ease: 'power2.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, [setCurrentScreen, preferences.onboardingComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 gradient-animated flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Morphing background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="splash-blob absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-morph" />
        <div className="splash-blob absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-accent/20 blur-3xl animate-morph" style={{ animationDelay: '-3s' }} />
        <div className="splash-blob absolute -bottom-20 left-1/4 w-72 h-72 rounded-full bg-white/5 blur-3xl animate-morph" style={{ animationDelay: '-5s' }} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="splash-particle absolute rounded-full bg-primary-foreground/30"
            style={{
              left: `${5 + Math.random() * 90}%`,
              top: `${60 + Math.random() * 35}%`,
              width: `${4 + Math.random() * 6}px`,
              height: `${4 + Math.random() * 6}px`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Floating decorative icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="float-icon absolute top-24 left-8">
          <Sun className="w-8 h-8 text-accent/50" />
        </div>
        <div className="float-icon absolute top-32 right-12" style={{ animationDelay: '0.5s' }}>
          <Cloud className="w-10 h-10 text-white/30" />
        </div>
        <div className="float-icon absolute bottom-40 left-10" style={{ animationDelay: '1s' }}>
          <Droplets className="w-7 h-7 text-white/40" />
        </div>
        <div className="float-icon absolute bottom-48 right-8" style={{ animationDelay: '1.5s' }}>
          <Leaf className="w-8 h-8 text-white/35" />
        </div>
      </div>

      {/* Logo container */}
      <div ref={logoRef} className="relative mb-10">
        {/* Pulsing glow */}
        <div className="logo-pulse absolute inset-0 -m-8 rounded-full bg-accent/30 blur-xl" />
        <div className="logo-glow absolute inset-0 -m-12 rounded-full bg-white/20 blur-2xl" />
        
        {/* Outer rings with rotation */}
        <div className="logo-ring absolute inset-0 -m-6 rounded-full border-2 border-primary-foreground/15 animate-spin-slow" style={{ animationDuration: '15s' }} />
        <div className="logo-ring absolute inset-0 -m-12 rounded-full border border-primary-foreground/10 animate-spin-slow" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />
        <div className="logo-ring absolute inset-0 -m-20 rounded-full border border-dashed border-primary-foreground/5 animate-spin-slow" style={{ animationDuration: '35s' }} />
        
        {/* Main logo */}
        <div className="relative w-36 h-36 rounded-[2rem] bg-white/15 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/20">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/30 to-transparent" />
          <div className="relative flex items-center justify-center">
            <Shield className="w-20 h-20 text-primary-foreground" strokeWidth={1.5} />
            <Leaf className="absolute w-10 h-10 text-primary-foreground animate-pulse" strokeWidth={2} />
          </div>
        </div>

        {/* Sparkle accents */}
        <Sparkles className="absolute -top-5 -right-5 w-8 h-8 text-accent animate-pulse" />
        <Sparkles className="absolute -bottom-3 -left-7 w-7 h-7 text-accent/70 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <Sparkles className="absolute top-1/2 -right-10 w-5 h-5 text-white/50 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* App name */}
      <div ref={textRef} className="text-center">
        <h1 className="text-5xl font-bold text-primary-foreground tracking-tight">
          Kisaan Kavach
        </h1>
      </div>

      {/* Tagline */}
      <div ref={taglineRef} className="mt-4">
        <p className="text-primary-foreground/80 text-xl font-light tracking-wide">
          Your Intelligent Farming Companion
        </p>
      </div>

      {/* Feature icons */}
      <div className="flex items-center gap-6 mt-10">
        {[
          { icon: '🌾', label: 'Crops' },
          { icon: '📊', label: 'Market' },
          { icon: '🌤️', label: 'Weather' },
          { icon: '🛡️', label: 'Insurance' },
        ].map((feature, i) => (
          <div 
            key={i} 
            className="feature-icon flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-2xl border border-white/20">
              {feature.icon}
            </div>
            <span className="text-primary-foreground/60 text-xs font-medium">{feature.label}</span>
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      <div className="absolute bottom-24 flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="loading-dot w-3 h-3 rounded-full bg-primary-foreground/60"
              style={{ animationDelay: `${i * 0.16}s` }}
            />
          ))}
        </div>
        <p className="text-primary-foreground/50 text-sm">Loading...</p>
      </div>
    </div>
  );
}
