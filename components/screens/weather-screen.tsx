'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useApp } from '@/lib/app-context';
import { Card } from '@/components/ui/card';
import { 
  ChevronLeft, 
  Sun, 
  Cloud, 
  CloudRain,
  Wind,
  Droplets,
  Sunrise,
  Sunset,
  Leaf,
  AlertTriangle,
  CloudSun,
  CloudLightning,
  Thermometer,
  Eye,
  Gauge,
  Loader2
} from 'lucide-react';

const iconMap: Record<string, any> = {
  'Droplets': Droplets,
  'Leaf': Leaf,
  'Sun': Sun
};

const getWeatherIcon = (icon: string, size = 'w-6 h-6', animate = false) => {
  const icons: Record<string, any> = {
    'sun': Sun,
    'cloud': Cloud,
    'cloud-sun': CloudSun,
    'cloud-rain': CloudRain,
    'storm': CloudLightning,
  };
  const Icon = icons[icon] || Sun;
  const animationClass = animate && icon === 'sun' ? 'animate-spin-slow' : animate && icon === 'cloud' ? 'animate-cloud' : '';
  return <Icon className={`${size} ${animationClass}`} style={animate && icon === 'sun' ? { animationDuration: '20s' } : {}} />;
};

export function WeatherScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { preferences, setCurrentScreen } = useApp();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/weather?lat=30.3165&lon=78.0322')
      .then(res => res.json())
      .then(data => {
        setWeatherData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading && weatherData) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.temp-display',
          { scale: 0.5, opacity: 0, y: 30 },
          { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' }
        );

        gsap.fromTo(
          '.weather-icon-main',
          { scale: 0, rotation: -180 },
          { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2)', delay: 0.2 }
        );

        gsap.fromTo(
          '.quick-stat',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out', delay: 0.4 }
        );

        gsap.fromTo(
          '.weather-card',
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out', delay: 0.5 }
        );

        gsap.fromTo(
          '.hourly-item',
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.6 }
        );

        gsap.to('.float-weather', {
          y: -15,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          stagger: 0.5,
        });
      }, containerRef);

      return () => ctx.revert();
    }
  }, [loading, weatherData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground">
            {preferences.language === 'hi' ? 'मौसम अपडेट हो रहा है...' : 'Fetching Live Weather...'}
        </p>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground">Failed to load weather data.</p>
        <button onClick={() => setCurrentScreen('home')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">Go Back</button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-background pb-28">
      {/* Header with gradient background */}
      <div className="gradient-animated px-6 pt-14 pb-12 rounded-b-[2.5rem] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 float-weather">
          <Cloud className="w-20 h-20 text-white/10" />
        </div>
        <div className="absolute bottom-10 left-5 float-weather" style={{ animationDelay: '1s' }}>
          <Cloud className="w-14 h-14 text-white/5" />
        </div>

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setCurrentScreen('home')}
            className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-all active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 text-primary-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground">
              {preferences.language === 'hi' ? 'मौसम' : 'Weather'}
            </h1>
            <p className="text-sm text-primary-foreground/70">{preferences.location || 'Dehradun, India'}</p>
          </div>
        </div>

        {/* Current Weather */}
        <div className="text-center temp-display">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="weather-icon-main relative">
              <div className="w-24 h-24 rounded-3xl bg-accent/30 flex items-center justify-center">
                <Sun className="w-14 h-14 text-accent animate-spin-slow" style={{ animationDuration: '15s' }} />
              </div>
              <CloudSun className="absolute -bottom-2 -right-2 w-10 h-10 text-white/90 animate-cloud" />
            </div>
            <div className="text-left">
              <div className="flex items-start">
                <span className="text-7xl font-light text-primary-foreground tracking-tighter">
                  {weatherData.current.temp}
                </span>
                <span className="text-3xl text-primary-foreground/70 mt-2">°C</span>
              </div>
              <p className="text-xl text-primary-foreground/90 font-medium">
                {preferences.language === 'hi' ? weatherData.current.conditionHi : weatherData.current.condition}
              </p>
            </div>
          </div>
          <p className="text-primary-foreground/60 flex items-center justify-center gap-2">
            <Thermometer className="w-4 h-4" />
            {preferences.language === 'hi' 
              ? `महसूस होता है ${weatherData.current.feelsLike}°`
              : `Feels like ${weatherData.current.feelsLike}°`}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex justify-center gap-4 mt-8">
          {[
            { icon: Droplets, value: `${weatherData.current.humidity}%`, label: 'Humidity', labelHi: 'नमी' },
            { icon: Wind, value: `${weatherData.current.windSpeed} km/h`, label: 'Wind', labelHi: 'हवा' },
            { icon: Eye, value: `${weatherData.current.visibility} km`, label: 'Visibility', labelHi: 'दृश्यता' },
          ].map((stat, i) => (
            <div 
              key={i} 
              className="quick-stat text-center bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3"
            >
              <stat.icon className="w-5 h-5 text-primary-foreground/70 mx-auto mb-1" />
              <p className="text-primary-foreground font-bold">{stat.value}</p>
              <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">
                {preferences.language === 'hi' ? stat.labelHi : stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 -mt-5 space-y-4 relative z-10">
        {/* Alert */}
        {weatherData.alerts.length > 0 && (
          <Card className="weather-card p-4 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/10 to-transparent shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">
                  {preferences.language === 'hi' ? 'मौसम चेतावनी' : 'Weather Alert'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {preferences.language === 'hi' 
                    ? weatherData.alerts[0].messageHi 
                    : weatherData.alerts[0].message}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Hourly Forecast */}
        <Card className="weather-card p-5 shadow-lg">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full gradient-primary" />
            {preferences.language === 'hi' ? 'आज का मौसम' : 'Hourly Forecast'}
          </h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
            {weatherData.hourly.map((hour: any, i: number) => (
              <div 
                key={i} 
                className={`hourly-item flex-shrink-0 text-center p-3 rounded-2xl transition-all ${
                  i === 0 ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                }`}
              >
                <p className={`text-xs font-semibold ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                  {hour.time}
                </p>
                <div className={`my-2 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                  {getWeatherIcon(hour.icon, 'w-7 h-7', i === 0)}
                </div>
                <p className={`font-bold ${i === 0 ? 'text-primary' : 'text-foreground'}`}>{hour.temp}°</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Soil & Sun */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="weather-card p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Droplets className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-sm font-bold text-foreground">
                {preferences.language === 'hi' ? 'मिट्टी नमी' : 'Soil Moisture'}
              </span>
            </div>
            <p className="text-4xl font-bold text-foreground">{weatherData.soilMoisture}%</p>
            <div className="mt-3 h-2.5 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 animate-progress"
                style={{ '--progress': `${weatherData.soilMoisture}%`, width: `${weatherData.soilMoisture}%` } as React.CSSProperties}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {weatherData.soilMoisture < 30 ? 'Low' : weatherData.soilMoisture < 60 ? 'Optimal' : 'High'}
            </p>
          </Card>

          <Card className="weather-card p-4 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Sunrise className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">Sunrise</span>
                </div>
                <span className="font-bold text-foreground">{weatherData.current.sunrise}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Sunset className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">Sunset</span>
                </div>
                <span className="font-bold text-foreground">{weatherData.current.sunset}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Gauge className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">Pressure</span>
                </div>
                <span className="font-bold text-foreground">{weatherData.current.pressure} hPa</span>
              </div>
            </div>
          </Card>
        </div>

        {/* 5-Day Forecast */}
        <Card className="weather-card p-5 shadow-lg">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full gradient-primary" />
            {preferences.language === 'hi' ? '5 दिन का पूर्वानुमान' : '5-Day Forecast'}
          </h3>
          <div className="space-y-2">
            {weatherData.daily.map((day: any, i: number) => (
              <div 
                key={i} 
                className={`flex items-center justify-between py-3 px-3 rounded-xl transition-colors ${
                  i === 0 ? 'bg-primary/5 border border-primary/10' : 'hover:bg-muted/50'
                }`}
              >
                <span className={`font-semibold w-14 ${i === 0 ? 'text-primary' : 'text-foreground'}`}>
                  {day.day}
                </span>
                <div className={`${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                  {getWeatherIcon(day.icon, 'w-6 h-6')}
                </div>
                <span className="text-sm text-muted-foreground flex-1 text-center">
                  {preferences.language === 'hi' ? day.conditionHi : day.condition}
                </span>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-bold text-foreground">{day.high}°</span>
                  <span className="text-muted-foreground">{day.low}°</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Farming Insights */}
        <Card className="weather-card p-5 bg-gradient-to-br from-primary/5 to-transparent border-primary/20 shadow-lg">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            {preferences.language === 'hi' ? 'खेती सलाह' : 'Farming Insights'}
          </h3>
          <div className="space-y-3">
            {weatherData.farmingInsights.map((insight: any, i: number) => {
              const InsightIcon = iconMap[insight.iconName] || Sun;
              return (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${insight.bg} flex items-center justify-center`}>
                      <InsightIcon className={`w-5 h-5 ${insight.color}`} />
                    </div>
                    <span className="text-foreground font-medium">
                      {preferences.language === 'hi' ? insight.titleHi : insight.title}
                    </span>
                  </div>
                  <span className="font-bold text-foreground">
                    {preferences.language === 'hi' && insight.valueHi ? insight.valueHi : insight.value}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
