'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useApp } from '@/lib/app-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  Shield, 
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Satellite,
  CloudRain,
  IndianRupee,
  Zap,
  MessageCircle,
  Phone,
  Download,
  Upload,
  Calendar,
  Wallet,
  TrendingUp,
  Users,
  MapPin,
  Camera
} from 'lucide-react';

interface Claim {
  id: string;
  type: 'weather' | 'satellite' | 'manual';
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  amount: number;
  date: string;
  description: string;
  descriptionHi: string;
  timeline: { date: string; status: string; statusHi: string }[];
}

const mockClaims: Claim[] = [
  {
    id: '1',
    type: 'weather',
    status: 'approved',
    amount: 15000,
    date: '2024-01-15',
    description: 'Heavy rainfall damage - Wheat crop',
    descriptionHi: 'भारी बारिश से नुकसान - गेहूं की फसल',
    timeline: [
      { date: 'Jan 10', status: 'Claim Filed', statusHi: 'दावा दर्ज' },
      { date: 'Jan 12', status: 'Under Review', statusHi: 'समीक्षाधीन' },
      { date: 'Jan 14', status: 'Verified', statusHi: 'सत्यापित' },
      { date: 'Jan 15', status: 'Approved', statusHi: 'स्वीकृत' },
    ],
  },
  {
    id: '2',
    type: 'satellite',
    status: 'processing',
    amount: 8500,
    date: '2024-02-01',
    description: 'Drought detection - Mustard crop',
    descriptionHi: 'सूखे का पता - सरसों की फसल',
    timeline: [
      { date: 'Feb 1', status: 'Auto-detected', statusHi: 'स्वतः पता चला' },
      { date: 'Feb 2', status: 'Processing', statusHi: 'प्रक्रियाधीन' },
    ],
  },
];

const mockInsurance = {
  policyNumber: 'KK-2024-78542',
  cropInsured: 'Wheat, Mustard, Vegetables',
  coverageAmount: 200000,
  premiumPaid: 4500,
  validTill: 'March 2025',
  claimsThisYear: 2,
  totalClaimAmount: 23500,
  nextPremiumDate: '15 Apr 2024',
  areaInsured: '5 Acres',
};

const insuranceStats = [
  { label: 'Total Coverage', labelHi: 'कुल कवरेज', value: '₹2,00,000', icon: Shield },
  { label: 'Claims Paid', labelHi: 'भुगतान किया', value: '₹23,500', icon: Wallet },
  { label: 'Success Rate', labelHi: 'सफलता दर', value: '95%', icon: TrendingUp },
  { label: 'Farmers Helped', labelHi: 'किसान मदद', value: '50,000+', icon: Users },
];

export function AutoClaimScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showNewClaim, setShowNewClaim] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const { preferences, setCurrentScreen } = useApp();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.claim-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'processing':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'pending':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'rejected':
        return 'bg-red-500/10 text-red-600 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    if (preferences.language === 'hi') {
      switch (status) {
        case 'approved': return 'स्वीकृत';
        case 'processing': return 'प्रक्रियाधीन';
        case 'pending': return 'लंबित';
        case 'rejected': return 'अस्वीकृत';
        default: return status;
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weather':
        return <CloudRain className="w-5 h-5" />;
      case 'satellite':
        return <Satellite className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const handleWhatsAppConnect = () => {
    const phone = '+919876543210';
    const message = preferences.language === 'hi' 
      ? 'नमस्ते! मैं किसान कवच से बीमा अलर्ट प्राप्त करना चाहता/चाहती हूं।'
      : 'Hello! I want to receive insurance alerts from Kisaan Kavach.';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
    setWhatsappEnabled(true);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentScreen('home')}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">
              {preferences.language === 'hi' ? 'स्मार्ट बीमा' : 'Smart Insurance'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {preferences.language === 'hi' ? 'AI-संचालित दावे' : 'AI-powered claims'}
            </p>
          </div>
          <button 
            onClick={() => setShowNewClaim(true)}
            className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center"
          >
            <Upload className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </div>

      <div className="px-6 pt-6 space-y-5">
        {/* Insurance Overview */}
        <Card className="claim-card p-5 gradient-primary text-primary-foreground overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <p className="text-primary-foreground/70 text-sm">Policy No.</p>
                <p className="font-bold text-lg">{mockInsurance.policyNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-primary-foreground/70 text-xs">
                  {preferences.language === 'hi' ? 'कवरेज राशि' : 'Coverage'}
                </p>
                <p className="text-2xl font-bold">₹{mockInsurance.coverageAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-primary-foreground/70 text-xs">
                  {preferences.language === 'hi' ? 'बीमित क्षेत्र' : 'Area Insured'}
                </p>
                <p className="text-2xl font-bold">{mockInsurance.areaInsured}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-primary-foreground/20">
              <div className="flex-1">
                <p className="text-primary-foreground/70 text-xs">
                  {preferences.language === 'hi' ? 'अगला प्रीमियम' : 'Next Premium'}
                </p>
                <p className="font-semibold flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {mockInsurance.nextPremiumDate}
                </p>
              </div>
              <Button 
                size="sm" 
                variant="secondary" 
                className="rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"
              >
                <Download className="w-4 h-4 mr-1" />
                {preferences.language === 'hi' ? 'विवरण' : 'Details'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {insuranceStats.map((stat, i) => (
            <Card key={i} className="claim-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">
                {preferences.language === 'hi' ? stat.labelHi : stat.label}
              </p>
            </Card>
          ))}
        </div>

        {/* WhatsApp Integration */}
        <Card className="claim-card p-4 bg-[#25D366]/5 border-[#25D366]/30">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                {preferences.language === 'hi' ? 'व्हाट्सएप अलर्ट' : 'WhatsApp Alerts'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {preferences.language === 'hi' 
                  ? 'बीमा अपडेट सीधे व्हाट्सएप पर पाएं'
                  : 'Get insurance updates directly on WhatsApp'}
              </p>
              <div className="flex items-center gap-3 mt-3">
                {whatsappEnabled ? (
                  <div className="flex items-center gap-2 text-[#25D366]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {preferences.language === 'hi' ? 'सक्रिय' : 'Active'}
                    </span>
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={handleWhatsAppConnect}
                    className="rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                  >
                    {preferences.language === 'hi' ? 'जोड़ें' : 'Connect'}
                  </Button>
                )}
              </div>
            </div>
            <button 
              onClick={() => setWhatsappEnabled(!whatsappEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                whatsappEnabled ? 'bg-[#25D366]' : 'bg-muted'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                whatsappEnabled ? 'right-1' : 'left-1'
              }`} />
            </button>
          </div>
          
          {whatsappEnabled && (
            <div className="mt-4 pt-4 border-t border-[#25D366]/20">
              <p className="text-xs text-muted-foreground mb-2">
                {preferences.language === 'hi' ? 'आपको सूचनाएं मिलेंगी:' : 'You will receive alerts for:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  preferences.language === 'hi' ? 'दावा अपडेट' : 'Claim Updates',
                  preferences.language === 'hi' ? 'मौसम चेतावनी' : 'Weather Alerts',
                  preferences.language === 'hi' ? 'प्रीमियम रिमाइंडर' : 'Premium Reminders',
                  preferences.language === 'hi' ? 'फसल सलाह' : 'Crop Advisory',
                ].map((item, i) => (
                  <span key={i} className="text-xs bg-[#25D366]/10 text-[#25D366] px-2 py-1 rounded-full">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Auto-Detection Feature */}
        <Card className="claim-card p-4 bg-accent/10 border-accent/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">
                  {preferences.language === 'hi' ? 'ऑटो-डिटेक्शन' : 'Auto-Detection'}
                </p>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {preferences.language === 'hi' 
                  ? 'उपग्रह और मौसम डेटा से स्वचालित दावा'
                  : 'Auto claims via satellite & weather monitoring'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { icon: Satellite, label: preferences.language === 'hi' ? 'उपग्रह' : 'Satellite', active: true },
              { icon: CloudRain, label: preferences.language === 'hi' ? 'मौसम' : 'Weather', active: true },
              { icon: MapPin, label: preferences.language === 'hi' ? 'GPS' : 'GPS', active: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-background">
                <item.icon className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">{item.label}</span>
                {item.active && <div className="w-1.5 h-1.5 rounded-full bg-green-500 ml-auto" />}
              </div>
            ))}
          </div>
        </Card>

        {/* Claims Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {preferences.language === 'hi' ? 'आपके दावे' : 'Your Claims'}
            </h2>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full"
              onClick={() => setShowNewClaim(true)}
            >
              {preferences.language === 'hi' ? 'नया दावा' : 'New Claim'}
            </Button>
          </div>

          <div className="space-y-3">
            {mockClaims.map((claim) => (
              <Card
                key={claim.id}
                onClick={() => setSelectedClaim(claim)}
                className="claim-card p-4 cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      claim.type === 'weather' ? 'bg-blue-500/10 text-blue-500' :
                      claim.type === 'satellite' ? 'bg-purple-500/10 text-purple-500' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {getTypeIcon(claim.type)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {preferences.language === 'hi' ? claim.descriptionHi : claim.description}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{claim.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">₹{claim.amount.toLocaleString()}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border mt-1 ${getStatusStyle(claim.status)}`}>
                      {getStatusIcon(claim.status)}
                      {getStatusText(claim.status)}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <Card className="claim-card p-5">
          <h3 className="font-semibold text-foreground mb-4">
            {preferences.language === 'hi' ? 'यह कैसे काम करता है' : 'How It Works'}
          </h3>
          <div className="space-y-4">
            {[
              { 
                icon: Satellite, 
                title: preferences.language === 'hi' ? 'उपग्रह निगरानी' : 'Satellite Monitoring',
                desc: preferences.language === 'hi' ? 'आपकी फसल की 24/7 निगरानी' : '24/7 monitoring of your crops'
              },
              { 
                icon: CloudRain, 
                title: preferences.language === 'hi' ? 'मौसम विश्लेषण' : 'Weather Analysis',
                desc: preferences.language === 'hi' ? 'प्राकृतिक आपदाओं का स्वचालित पता' : 'Auto-detect natural disasters'
              },
              { 
                icon: Zap, 
                title: preferences.language === 'hi' ? 'त्वरित दावा' : 'Instant Claims',
                desc: preferences.language === 'hi' ? 'नुकसान होने पर स्वचालित दावा' : 'Auto-triggered when damage detected'
              },
              { 
                icon: MessageCircle, 
                title: preferences.language === 'hi' ? 'व्हाट्सएप अपडेट' : 'WhatsApp Updates',
                desc: preferences.language === 'hi' ? 'हर अपडेट सीधे व्हाट्सएप पर' : 'Every update directly on WhatsApp'
              },
              { 
                icon: IndianRupee, 
                title: preferences.language === 'hi' ? 'तेज भुगतान' : 'Fast Payout',
                desc: preferences.language === 'hi' ? '48 घंटे में खाते में पैसे' : 'Money in account within 48 hours'
              },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Support */}
        <Card className="claim-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {preferences.language === 'hi' ? 'सहायता चाहिए?' : 'Need Help?'}
              </p>
              <p className="text-sm text-muted-foreground">
                {preferences.language === 'hi' ? 'हमें कॉल करें' : 'Call our support'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-full">
            1800-XXX-XXXX
          </Button>
        </Card>
      </div>

      {/* Claim Detail Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 bg-foreground/50" onClick={() => setSelectedClaim(null)}>
          <div 
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full bg-muted mx-auto mb-6" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedClaim.type === 'weather' ? 'bg-blue-500/10 text-blue-500' :
                  'bg-purple-500/10 text-purple-500'
                }`}>
                  {getTypeIcon(selectedClaim.type)}
                </div>
                <div>
                  <p className="font-bold text-foreground">
                    {preferences.language === 'hi' ? selectedClaim.descriptionHi : selectedClaim.description}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedClaim.date}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(selectedClaim.status)}`}>
                {getStatusText(selectedClaim.status)}
              </span>
            </div>

            <Card className="p-4 bg-primary/5 border-primary/20 mb-6">
              <p className="text-sm text-muted-foreground">
                {preferences.language === 'hi' ? 'दावा राशि' : 'Claim Amount'}
              </p>
              <p className="text-3xl font-bold text-foreground">₹{selectedClaim.amount.toLocaleString()}</p>
            </Card>

            <h3 className="font-semibold text-foreground mb-4">
              {preferences.language === 'hi' ? 'दावा टाइमलाइन' : 'Claim Timeline'}
            </h3>
            <div className="space-y-4">
              {selectedClaim.timeline.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      i === selectedClaim.timeline.length - 1 ? 'bg-primary' : 'bg-muted'
                    }`} />
                    {i < selectedClaim.timeline.length - 1 && (
                      <div className="w-0.5 h-8 bg-muted" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-foreground">
                      {preferences.language === 'hi' ? item.statusHi : item.status}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => window.open('tel:1800XXXXXXX')}
              >
                <Phone className="w-4 h-4 mr-2" />
                {preferences.language === 'hi' ? 'कॉल करें' : 'Call'}
              </Button>
              <Button
                className="flex-1 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white"
                onClick={() => window.open(`https://wa.me/919876543210?text=${encodeURIComponent(`Claim ID: ${selectedClaim.id}`)}`)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Claim Modal */}
      {showNewClaim && (
        <div className="fixed inset-0 z-50 bg-foreground/50" onClick={() => setShowNewClaim(false)}>
          <div 
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full bg-muted mx-auto mb-4" />
            
            <h2 className="text-xl font-bold text-foreground mb-6">
              {preferences.language === 'hi' ? 'नया दावा दर्ज करें' : 'File New Claim'}
            </h2>

            <div className="space-y-4">
              {/* Upload Photo */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {preferences.language === 'hi' ? 'नुकसान की फोटो' : 'Damage Photo'}
                </label>
                <button className="w-full h-32 rounded-2xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {preferences.language === 'hi' ? 'फोटो अपलोड करें' : 'Upload Photo'}
                  </p>
                </button>
              </div>

              {/* Damage Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {preferences.language === 'hi' ? 'नुकसान का प्रकार' : 'Damage Type'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '🌧️', label: preferences.language === 'hi' ? 'बाढ़/बारिश' : 'Flood/Rain' },
                    { icon: '🔥', label: preferences.language === 'hi' ? 'सूखा' : 'Drought' },
                    { icon: '🐛', label: preferences.language === 'hi' ? 'कीट' : 'Pest' },
                    { icon: '🌪️', label: preferences.language === 'hi' ? 'तूफान' : 'Storm' },
                  ].map((item, i) => (
                    <button key={i} className="p-4 rounded-xl bg-muted hover:bg-primary/10 transition-colors text-left">
                      <span className="text-2xl mb-2 block">{item.icon}</span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Affected Area */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {preferences.language === 'hi' ? 'प्रभावित क्षेत्र (एकड़)' : 'Affected Area (Acres)'}
                </label>
                <input 
                  type="number" 
                  className="w-full h-12 px-4 rounded-xl bg-muted border-0" 
                  placeholder="2"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {preferences.language === 'hi' ? 'विवरण' : 'Description'}
                </label>
                <textarea 
                  className="w-full h-24 px-4 py-3 rounded-xl bg-muted border-0 resize-none"
                  placeholder={preferences.language === 'hi' ? 'नुकसान का विवरण दें...' : 'Describe the damage...'}
                />
              </div>
            </div>

            <Button className="w-full mt-6 h-14 rounded-xl gradient-primary text-primary-foreground text-lg font-semibold">
              {preferences.language === 'hi' ? 'दावा सबमिट करें' : 'Submit Claim'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
