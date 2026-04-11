'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useApp } from '@/lib/app-context';
import { 
  Camera, 
  MessageCircle, 
  Store, // Changed from ShoppingBag
  ShieldCheck, // Changed from Shield
  BarChart3, // Changed from TrendingUp 
  Sun,
  Droplets,
  Wind,
  Bell,
  ChevronRight,
  Leaf,
  AlertTriangle,
  CloudSun,
  Sparkles,
  ArrowUpRight,
  Cloud,
  CloudRain,
  CloudLightning,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Screen } from '@/lib/types';

const quickActions: { id: Screen; icon: typeof Camera; label: string; labelHi: string; gradient: string; iconBg: string }[] = [
  { id: 'cropdoctor', icon: Camera, label: 'Scan Crop', labelHi: 'फसल स्कैन', gradient: 'from-emerald-500 to-green-600', iconBg: 'bg-emerald-400/30' },
  { id: 'marketplace', icon: Store, label: 'Sell Produce', labelHi: 'उपज बेचें', gradient: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-400/30' },
  { id: 'fairmandi', icon: BarChart3, label: 'Mandi Prices', labelHi: 'मंडी भाव', gradient: 'from-sky-500 to-blue-600', iconBg: 'bg-sky-400/30' },
  { id: 'autoclaim', icon: ShieldCheck, label: 'Insurance', labelHi: 'बीमा', gradient: 'from-rose-500 to-pink-600', iconBg: 'bg-rose-400/30' },
];

export function HomeScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { preferences, setCurrentScreen, t } = useApp();
  
  // Real weather integration state
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    // Fetch live weather data for the home screen widget
    fetch('/api/weather?lat=30.3165&lon=78.0322')
      .then(res => res.json())
      .then(data => {
        setWeatherData(data);
        setWeatherLoading(false);
      })
      .catch(err => {
        console.error('Failed to load weather for home widget:', err);
        setWeatherLoading(false);
      });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        '.header-content',
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );

      // Weather card animation with 3D effect
      gsap.fromTo(
        '.weather-card-main',
        { opacity: 0, scale: 0.9, rotateX: -15 },
        { opacity: 1, scale: 1, rotateX: 0, duration: 0.7, ease: 'power3.out', delay: 0.2 }
      );

      // Quick actions stagger animation
      gsap.fromTo(
        '.quick-action',
        { opacity: 0, y: 40, scale: 0.8 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.5, 
          stagger: 0.1, 
          ease: 'back.out(1.7)', 
          delay: 0.3 
        }
      );

      // Cards slide up animation
      gsap.fromTo(
        '.home-card',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.5 }
      );

      // Floating animation for decorative elements
      gsap.to('.float-decoration', {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.3,
      });

      // Bell notification pulse
      gsap.to('.bell-icon', {
        scale: 1.1,
        duration: 0.3,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
        repeatDelay: 3,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleActionClick = (screen: Screen) => {
    const element = document.querySelector(`.action-${screen}`);
    gsap.timeline()
      .to(element, {
        scale: 0.9,
        duration: 0.1,
        ease: 'power2.in',
      })
      .to(element, {
        scale: 1.05,
        duration: 0.15,
        ease: 'power2.out',
      })
      .to(element, {
        scale: 1,
        duration: 0.1,
        onComplete: () => setCurrentScreen(screen),
      });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (preferences.language === 'hi') {
      if (hour < 12) return 'सुप्रभात';
      if (hour < 17) return 'नमस्ते';
      return 'शुभ संध्या';
    }
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getTimeEmoji = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return '🌙';
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀️';
    if (hour < 20) return '🌇';
    return '🌙';
  };

  // Helper for rendering a dynamic icon based on live condition
  const DynamicWeatherIcon = () => {
    if (!weatherData) return <Sun className="w-9 h-9 text-amber-300 animate-spin-slow" style={{ animationDuration: '10s' }} />;
    const cond = weatherData.current.condition.toLowerCase();
    if (cond.includes('rain') || cond.includes('showers') || cond.includes('drizzle')) return <CloudRain className="w-9 h-9 text-sky-200" />;
    if (cond.includes('storm')) return <CloudLightning className="w-9 h-9 text-blue-300" />;
    if (cond.includes('cloud')) return <Cloud className="w-9 h-9 text-gray-200" />;
    return <Sun className="w-9 h-9 text-amber-300 animate-spin-slow" style={{ animationDuration: '15s' }} />;
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background pb-28 overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 px-6 pt-14 pb-10 rounded-b-[2.5rem] relative overflow-hidden shadow-xl">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/10 blur-2xl float-decoration" />
        <div className="absolute bottom-0 -left-10 w-32 h-32 rounded-full bg-white/10 blur-xl float-decoration" />
        <div className="absolute top-10 right-20 w-20 h-20 rounded-full bg-yellow-400/20 blur-xl float-decoration" />
        
        <div className="header-content relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{getTimeEmoji()}</span>
                <p className="text-white/90 text-sm font-medium">
                  {getGreeting()}
                </p>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">
                {preferences.farmerName || 'Farmer'}
              </h1>
              <p className="text-white/80 text-sm mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                <Leaf className="w-4 h-4 text-green-300" />
                {preferences.location || 'Dehradun, India'}
              </p>
            </div>
            <button 
              onClick={() => setCurrentScreen('profile')}
              className="relative w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all active:scale-95 border border-white/10"
            >
              <Bell className="bell-icon w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-[10px] font-bold text-amber-900 flex items-center justify-center shadow-lg">
                3
              </span>
            </button>
          </div>

          {/* Weather Summary Card */}
          <Card 
            className="weather-card-main mt-6 p-5 bg-white/20 backdrop-blur-md border border-white/20 shadow-xl cursor-pointer hover:bg-white/25 transition-all active:scale-[0.98]"
            onClick={() => setCurrentScreen('weather')}
          >
            {weatherLoading ? (
               <div className="flex flex-col items-center justify-center py-4 space-y-2">
                  <Loader2 className="w-8 h-8 text-white/80 animate-spin" />
                  <p className="text-white/80 text-sm">Loading Live Weather...</p>
               </div>
            ) : weatherData ? (
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-amber-400/30 flex items-center justify-center border border-amber-300/30">
                        <DynamicWeatherIcon />
                    </div>
                    {(weatherData.current.condition.toLowerCase().includes('cloud') || weatherData.current.condition.toLowerCase().includes('partly')) && (
                        <CloudSun className="absolute -bottom-1 -right-1 w-6 h-6 text-white/90" />
                    )}
                    </div>
                    <div>
                    <p className="text-white/80 text-sm font-medium">
                        {preferences.language === 'hi' ? 'आज का मौसम' : "Today's Weather"}
                    </p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-white text-4xl font-bold tracking-tight drop-shadow-sm">{weatherData.current.temp}</p>
                        <span className="text-white/80 text-lg">°C</span>
                    </div>
                    <p className="text-white/70 text-xs mt-1">
                        {preferences.language === 'hi' ? weatherData.current.conditionHi : weatherData.current.condition}
                    </p>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 bg-white/15 rounded-lg px-3 py-1.5 border border-white/10">
                    <Droplets className="w-4 h-4 text-sky-300" />
                    <span className="text-sm font-medium text-white">{weatherData.current.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/15 rounded-lg px-3 py-1.5 border border-white/10">
                    <Wind className="w-4 h-4 text-cyan-300" />
                    <span className="text-sm font-medium text-white">{weatherData.current.windSpeed} km/h</span>
                    </div>
                </div>
                </div>
            ) : (
                <div className="text-center py-4">
                  <p className="text-white/80">Weather currently unavailable</p>
                </div>
            )}
            
            <div className="flex items-center justify-end mt-3 text-white/70 text-xs">
              <span>{preferences.language === 'hi' ? 'विस्तार देखें' : 'View Details'}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 -mt-5 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map(({ id, icon: Icon, label, labelHi, gradient, iconBg }) => (
            <button
              key={id}
              onClick={() => handleActionClick(id)}
              className={`quick-action action-${id} p-5 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-xl active:scale-95 transition-all relative overflow-hidden group`}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              
              <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center mb-3`}>
                <Icon className="w-7 h-7" />
              </div>
              <p className="font-bold text-lg text-left leading-tight">
                {preferences.language === 'hi' ? labelHi : label}
              </p>
              <ArrowUpRight className="absolute top-4 right-4 w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* Today's Tip */}
      <div className="px-6 mt-6">
        <Card className="home-card p-5 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <div className="flex items-start gap-4 relative">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg glow-sm">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground text-lg">{t('todaysTip') || 'Today\'s Tip'}</p>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                {preferences.language === 'hi' 
                  ? 'मौसम अनुसार: आज सुबह 6-8 बजे के बीच सिंचाई करें। तापमान बढ़ने से पहले पानी देने से फसल को अधिक लाभ होगा।'
                  : weatherData?.current.precipitation > 0 
                  ? 'Rain is expected today! No need to run your irrigation systems. Save water.'
                  : 'Water your crops between 6-8 AM today. Early morning irrigation helps plants absorb water better before temperatures rise.'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts Section */}
      <div className="px-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">
            {preferences.language === 'hi' ? 'महत्वपूर्ण सूचनाएं' : 'Important Alerts'}
          </h2>
          <button className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline active:scale-95 transition-transform">
            {preferences.language === 'hi' ? 'सभी देखें' : 'View All'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {weatherData?.alerts && weatherData.alerts.length > 0 ? (
            <Card className="home-card p-4 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/5 to-transparent hover:from-amber-500/10 transition-colors cursor-pointer active:scale-[0.99]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {preferences.language === 'hi' ? 'मौसम चेतावनी' : 'Weather Alert'}
                  </p>
                  <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                    {preferences.language === 'hi' 
                      ? weatherData.alerts[0].messageHi 
                      : weatherData.alerts[0].message}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">Now</span>
              </div>
            </Card>
          ) : null}

          <Card className="home-card p-4 border-l-4 border-l-green-500 bg-gradient-to-r from-green-500/5 to-transparent hover:from-green-500/10 transition-colors cursor-pointer active:scale-[0.99]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {preferences.language === 'hi' ? 'गेहूं के भाव बढ़े' : 'Wheat Prices Up'}
                </p>
                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                  {preferences.language === 'hi' 
                    ? 'गेहूं के भाव ₹200/क्विंटल बढ़े हैं। बेचने का अच्छा समय।'
                    : 'Wheat prices increased by ₹200/quintal. Good time to sell.'}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">5h</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Chat with AI */}
      <div className="px-6 mt-6">
        <button
          onClick={() => setCurrentScreen('khetsense')}
          className="home-card w-full p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 border-2 border-primary/20 flex items-center gap-4 hover:border-primary/40 transition-all active:scale-[0.98] group"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg glow-sm group-hover:glow transition-all">
              <MessageCircle className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-foreground text-lg">
              {preferences.language === 'hi' ? 'AI साथी से बात करें' : 'Chat with AI Companion'}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {preferences.language === 'hi' 
                ? 'खेती की कोई समस्या पूछें'
                : 'Ask any farming question'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <ChevronRight className="w-6 h-6 text-primary" />
          </div>
        </button>
      </div>
    </div>
  );
}
