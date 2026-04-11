'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useApp } from '@/lib/app-context';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Shield, 
  Leaf, 
  ChevronRight, 
  Sparkles,
  Check,
  RefreshCw,
  ArrowLeft,
  Sun,
  Cloud,
  Droplets
} from 'lucide-react';

export function LoginScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { setCurrentScreen, preferences, t } = useApp();

  // Animate on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate background elements
      gsap.to('.login-blob-1', {
        x: 30,
        y: -30,
        scale: 1.1,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      gsap.to('.login-blob-2', {
        x: -40,
        y: 20,
        scale: 0.9,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      gsap.to('.login-blob-3', {
        x: 20,
        y: 35,
        scale: 1.15,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Floating icons animation
      gsap.to('.float-icon', {
        y: -15,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.3,
      });

      // Content animation
      const tl = gsap.timeline();
      tl.fromTo('.login-logo', 
        { scale: 0, rotation: -180, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 1, ease: 'back.out(1.7)' }
      )
      .fromTo('.login-ring',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
        '-=0.5'
      )
      .fromTo('.login-title',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      )
      .fromTo('.login-subtitle',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
        '-=0.2'
      )
      .fromTo('.login-form',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
        '-=0.2'
      )
      .fromTo('.feature-badge',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'back.out(2)' },
        '-=0.3'
      );

      // Floating particles
      gsap.to('.login-particle', {
        y: -100,
        opacity: 0,
        duration: 3,
        stagger: 0.15,
        repeat: -1,
        ease: 'power1.out',
      });

      // Pulsing glow effect
      gsap.to('.logo-glow', {
        scale: 1.2,
        opacity: 0.3,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Step transition animation
  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current,
        { x: step === 'otp' ? 60 : -60, opacity: 0, scale: 0.95 },
        { x: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [step]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
    setError('');
  };

  const handleSendOTP = async () => {
    if (phoneNumber.length !== 10) {
      setError(preferences.language === 'hi' ? 'कृपया 10 अंकों का नंबर दर्ज करें' : 'Please enter a 10-digit number');
      gsap.to('.phone-input-container', { x: [-8, 8, -8, 8, 0], duration: 0.4 });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setStep('otp');
    setResendTimer(30);
    
    // Focus first OTP input
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Animate filled input
    if (value) {
      gsap.fromTo(otpRefs.current[index],
        { scale: 1.3 },
        { scale: 1, duration: 0.25, ease: 'back.out(3)' }
      );
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError(preferences.language === 'hi' ? 'कृपया पूरा OTP दर्ज करें' : 'Please enter complete OTP');
      return;
    }

    setIsLoading(true);
    
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demo, accept any 6-digit OTP
    if (otpValue.length === 6) {
      // Success animation
      gsap.to('.otp-success-icon', {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: 'back.out(2)',
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentScreen('onboarding');
    } else {
      setError(t('invalidOTP'));
      gsap.to('.otp-inputs', { x: [-8, 8, -8, 8, 0], duration: 0.4 });
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    }
    
    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setResendTimer(30);
    setOtp(['', '', '', '', '', '']);
    otpRefs.current[0]?.focus();
  };

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-muted">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="login-blob-1 absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-primary/25 to-primary/5 blur-3xl" />
        <div className="login-blob-2 absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-accent/25 to-accent/5 blur-3xl" />
        <div className="login-blob-3 absolute -bottom-32 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 blur-3xl" />
      </div>

      {/* Floating Icons - Decorative */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="float-icon absolute top-20 left-8 w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Sun className="w-6 h-6 text-accent" />
        </div>
        <div className="float-icon absolute top-32 right-10 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Cloud className="w-5 h-5 text-primary" />
        </div>
        <div className="float-icon absolute bottom-40 left-6 w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center">
          <Droplets className="w-5 h-5 text-blue-500" />
        </div>
        <div className="float-icon absolute bottom-60 right-8 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Leaf className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="login-particle absolute w-2 h-2 rounded-full bg-primary/40"
            style={{
              left: `${8 + (i * 6)}%`,
              top: `${65 + Math.random() * 25}%`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* Pattern Overlay */}
      <div className="absolute inset-0 pattern-dots opacity-[0.02]" />

      <div className="relative min-h-screen flex flex-col px-6 py-10 safe-top safe-bottom">
        {/* Back Button (OTP step) */}
        {step === 'otp' && (
          <button
            onClick={() => setStep('phone')}
            className="absolute top-8 left-6 z-10 w-11 h-11 rounded-full bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-muted transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Logo & Header */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Logo */}
          <div className="login-logo relative mb-10">
            {/* Glow effect */}
            <div className="logo-glow absolute inset-0 -m-8 rounded-full bg-primary/20 blur-2xl" />
            
            {/* Outer rings */}
            <div className="login-ring absolute inset-0 -m-5 rounded-full border-2 border-primary/20 animate-spin-slow" style={{ animationDuration: '20s' }} />
            <div className="login-ring absolute inset-0 -m-10 rounded-full border border-primary/10 animate-spin-slow" style={{ animationDuration: '30s', animationDirection: 'reverse' }} />
            <div className="login-ring absolute inset-0 -m-16 rounded-full border border-dashed border-primary/5" />
            
            {/* Main logo container */}
            <div className="relative w-32 h-32 rounded-[2rem] gradient-primary shadow-2xl glow flex items-center justify-center transform hover:scale-105 transition-transform">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/25 to-transparent" />
              <div className="relative flex items-center justify-center">
                <Shield className="w-16 h-16 text-primary-foreground" strokeWidth={1.5} />
                <Leaf className="absolute w-8 h-8 text-primary-foreground animate-pulse" strokeWidth={2} />
              </div>
            </div>

            {/* Sparkle accents */}
            <Sparkles className="absolute -top-4 -right-4 w-7 h-7 text-accent animate-pulse" />
            <Sparkles className="absolute -bottom-3 -left-5 w-6 h-6 text-accent/70 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <Sparkles className="absolute top-1/2 -right-8 w-4 h-4 text-primary/50 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Title */}
          <h1 className="login-title text-4xl font-bold text-foreground text-center mb-3 tracking-tight">
            {preferences.language === 'hi' ? 'किसान कवच' : 'Kisaan Kavach'}
          </h1>
          <p className="login-subtitle text-muted-foreground text-center text-lg mb-4">
            {t('loginSubtitle')}
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[
              { icon: '🌾', label: preferences.language === 'hi' ? 'फसल स्कैन' : 'Crop Scan' },
              { icon: '📊', label: preferences.language === 'hi' ? 'मंडी भाव' : 'Mandi Prices' },
              { icon: '🌤️', label: preferences.language === 'hi' ? 'मौसम' : 'Weather' },
            ].map((feature, i) => (
              <div 
                key={i}
                className="feature-badge px-4 py-2 rounded-full bg-card border border-border shadow-sm flex items-center gap-2"
              >
                <span className="text-base">{feature.icon}</span>
                <span className="text-sm font-medium text-foreground">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <div ref={formRef} className="login-form w-full max-w-sm">
            {step === 'phone' ? (
              <div className="space-y-6">
                {/* Phone Input */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    {t('phoneLabel')}
                  </label>
                  <div className="phone-input-container">
                    <div className="phone-input-wrapper shadow-lg">
                      {/* Country Code */}
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card border-r border-border">
                        <span className="text-2xl">🇮🇳</span>
                        <span className="font-bold text-foreground">+91</span>
                      </div>
                      
                      {/* Phone Input */}
                      <div className="relative flex-1">
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder={preferences.language === 'hi' ? '98765 43210' : '98765 43210'}
                          className="w-full px-4 py-4 text-lg font-semibold bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none tracking-wider"
                          maxLength={10}
                        />
                      </div>

                      {/* Checkmark when valid */}
                      {phoneNumber.length === 10 && (
                        <div className="pr-3">
                          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center animate-bounce-in shadow-lg">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Error */}
                  {error && (
                    <p className="text-destructive text-sm font-medium animate-shake flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                      {error}
                    </p>
                  )}
                </div>

                {/* Send OTP Button */}
                <Button
                  onClick={handleSendOTP}
                  disabled={isLoading || phoneNumber.length !== 10}
                  className="w-full h-14 text-lg font-bold rounded-2xl gradient-primary text-primary-foreground hover:opacity-90 transition-all btn-press disabled:opacity-50 disabled:cursor-not-allowed glow shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="loading-dot w-2 h-2 rounded-full bg-primary-foreground" />
                        <div className="loading-dot w-2 h-2 rounded-full bg-primary-foreground" />
                        <div className="loading-dot w-2 h-2 rounded-full bg-primary-foreground" />
                      </div>
                      <span>{preferences.language === 'hi' ? 'भेज रहे हैं...' : 'Sending...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{t('sendOTP')}</span>
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* OTP Sent Message */}
                <div className="text-center space-y-2 bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border">
                  <p className="text-muted-foreground text-sm">
                    {t('otpSent')}
                  </p>
                  <p className="font-bold text-foreground text-xl tracking-wider">
                    +91 {phoneNumber.slice(0, 5)} {phoneNumber.slice(5)}
                  </p>
                </div>

                {/* OTP Inputs */}
                <div className="otp-inputs flex justify-center gap-2.5 relative">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`otp-input shadow-lg ${digit ? 'filled' : ''}`}
                      maxLength={1}
                    />
                  ))}
                  
                  {/* Success checkmark overlay */}
                  <div className="otp-success-icon absolute inset-0 flex items-center justify-center scale-0 opacity-0 pointer-events-none">
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-2xl glow">
                      <Check className="w-10 h-10 text-primary-foreground" />
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <p className="text-destructive text-sm text-center font-medium animate-shake">{error}</p>
                )}

                {/* Verify Button */}
                <Button
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otp.join('').length !== 6}
                  className="w-full h-14 text-lg font-bold rounded-2xl gradient-primary text-primary-foreground hover:opacity-90 transition-all btn-press disabled:opacity-50 disabled:cursor-not-allowed glow shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="loading-dot w-2 h-2 rounded-full bg-primary-foreground" />
                        <div className="loading-dot w-2 h-2 rounded-full bg-primary-foreground" />
                        <div className="loading-dot w-2 h-2 rounded-full bg-primary-foreground" />
                      </div>
                      <span>{preferences.language === 'hi' ? 'सत्यापित कर रहे हैं...' : 'Verifying...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{t('verifyOTP')}</span>
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  )}
                </Button>

                {/* Resend OTP */}
                <div className="text-center pt-2">
                  {resendTimer > 0 ? (
                    <p className="text-muted-foreground text-sm">
                      {preferences.language === 'hi' 
                        ? `${resendTimer} सेकंड में पुनः भेजें` 
                        : `Resend in ${resendTimer}s`}
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-primary font-semibold text-sm flex items-center gap-2 mx-auto hover:underline active:scale-95 transition-transform"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {t('resendOTP')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4 pt-6">
          <p className="text-xs text-muted-foreground">
            {preferences.language === 'hi' 
              ? 'जारी रखकर, आप हमारी सेवा शर्तों से सहमत हैं'
              : 'By continuing, you agree to our Terms of Service'
            }
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            <span className="hover:text-foreground cursor-pointer transition-colors">Help</span>
          </div>
        </div>
      </div>
    </div>
  );
}
