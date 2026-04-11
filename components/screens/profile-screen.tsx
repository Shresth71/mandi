'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useApp } from '@/lib/app-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight,
  User,
  MapPin,
  Languages,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Leaf,
  Edit,
  Moon,
  Star
} from 'lucide-react';

export function ProfileScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { preferences, setCurrentScreen, t } = useApp();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.profile-item',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const menuItems = [
    {
      icon: User,
      label: preferences.language === 'hi' ? 'प्रोफाइल संपादित करें' : 'Edit Profile',
      action: () => {},
    },
    {
      icon: Languages,
      label: preferences.language === 'hi' ? 'भाषा बदलें' : 'Change Language',
      value: preferences.language === 'hi' ? 'हिंदी' : preferences.language === 'garhwali' ? 'गढ़वाली' : 'English',
      action: () => {},
    },
    {
      icon: Bell,
      label: preferences.language === 'hi' ? 'सूचनाएं' : 'Notifications',
      action: () => {},
    },
    {
      icon: Moon,
      label: preferences.language === 'hi' ? 'डार्क मोड' : 'Dark Mode',
      action: () => {},
    },
    {
      icon: Shield,
      label: preferences.language === 'hi' ? 'बीमा विवरण' : 'Insurance Details',
      action: () => setCurrentScreen('autoclaim'),
    },
    {
      icon: HelpCircle,
      label: preferences.language === 'hi' ? 'सहायता' : 'Help & Support',
      action: () => {},
    },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="gradient-primary px-6 pt-14 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentScreen('home')}
            className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">
            {preferences.language === 'hi' ? 'प्रोफाइल' : 'Profile'}
          </h1>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-primary-foreground/10 flex items-center justify-center text-4xl">
            {preferences.companionGender === 'male' ? '👨‍🌾' : '👩‍🌾'}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-primary-foreground">
              {preferences.farmerName || 'Farmer'}
            </h2>
            <p className="text-primary-foreground/70 flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" />
              {preferences.location || 'India'}
            </p>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 text-accent fill-accent" />
              ))}
              <span className="text-primary-foreground/70 text-sm ml-1">Premium Farmer</span>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <Edit className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </div>

      <div className="px-6 -mt-4 space-y-4">
        {/* Stats */}
        <Card className="profile-item p-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-xs text-muted-foreground">
              {preferences.language === 'hi' ? 'फसल स्कैन' : 'Crop Scans'}
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2">
              <Shield className="w-6 h-6 text-accent-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">2</p>
            <p className="text-xs text-muted-foreground">
              {preferences.language === 'hi' ? 'बीमा दावे' : 'Claims'}
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-2">
              <Star className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">4.8</p>
            <p className="text-xs text-muted-foreground">
              {preferences.language === 'hi' ? 'रेटिंग' : 'Rating'}
            </p>
          </div>
        </Card>

        {/* Menu Items */}
        <Card className="profile-item overflow-hidden">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-foreground" />
                </div>
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && (
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                )}
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </button>
          ))}
        </Card>

        {/* Logout */}
        <Button variant="outline" className="profile-item w-full h-14 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10">
          <LogOut className="w-5 h-5 mr-2" />
          {preferences.language === 'hi' ? 'लॉग आउट' : 'Logout'}
        </Button>

        {/* App Info */}
        <div className="profile-item text-center pt-4">
          <p className="text-sm text-muted-foreground">Kisaan Kavach v1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">Made with love for Indian Farmers</p>
        </div>
      </div>
    </div>
  );
}
