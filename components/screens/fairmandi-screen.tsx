'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useApp } from '@/lib/app-context';
import { Card } from '@/components/ui/card';
import {
  ChevronLeft,
  TrendingUp,
  Search,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface CommodityPrice {
  id: string;
  name: string;
  nameHi: string;
  price: number;
  priceChange: number;
  unit: string;
  market: string;
  prediction: 'SELL' | 'HOLD' | 'BUY';
  history: { day: string; price: number }[];
}

export function FairMandiScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityPrice | null>(null);
  const { preferences, setCurrentScreen } = useApp();

  const [prices, setPrices] = useState<CommodityPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 800);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setLoading(true);
    let url = `/api/mandi?location=${encodeURIComponent(preferences.location || 'Dehradun')}`;
    if (debouncedSearch.trim() !== '') {
      url += `&crops=${encodeURIComponent(debouncedSearch.trim())}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPrices(data);
        } else {
          console.error("Mandi API Error: expected array.", data);
          setError(true);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, [preferences.location, debouncedSearch]);

  useEffect(() => {
    if (!loading && prices.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.mandi-card',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, prices]);

  useEffect(() => {
    if (selectedCommodity) {
      gsap.fromTo(
        '.detail-panel',
        { y: '100%' },
        { y: 0, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, [selectedCommodity]);

  const getPredictionStyle = (prediction: string) => {
    switch (prediction) {
      case 'SELL':
        return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'HOLD':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'BUY':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPredictionText = (prediction: string) => {
    if (preferences.language === 'hi') {
      switch (prediction) {
        case 'SELL': return 'बेचें';
        case 'HOLD': return 'रुकें';
        case 'BUY': return 'खरीदें';
        default: return prediction;
      }
    }
    return prediction;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground">
          {preferences.language === 'hi' ? 'मंडी के भाव प्राप्त कर रहे हैं...' : 'Consulting Live Mandi Markets...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground">Failed to dynamically retrieve Mandi prices.</p>
        <button onClick={() => setCurrentScreen('home')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">Go Back</button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setCurrentScreen('home')}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {preferences.language === 'hi' ? 'फेयर मंडी' : 'FairMandi'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {preferences.language === 'hi' ? 'आज के मंडी भाव' : 'Live market prices'}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={preferences.language === 'hi' ? 'फसल खोजें...' : 'Search commodity...'}
            className="pl-12 h-12 rounded-xl bg-muted border-0"
          />
        </div>
      </div>

      {/* Price Cards */}
      <div className="px-6 pt-4 space-y-3">
        {prices.map((commodity) => (
          <Card
            key={commodity.id}
            onClick={() => setSelectedCommodity(commodity)}
            className="mandi-card p-4 cursor-pointer hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground text-lg">
                    {preferences.language === 'hi' ? commodity.nameHi : commodity.name}
                  </h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getPredictionStyle(commodity.prediction)}`}>
                    {getPredictionText(commodity.prediction)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{commodity.market}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-foreground">
                  ₹{commodity.price.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">{commodity.unit}</span>
                </p>
                <div className={`flex items-center justify-end gap-1 text-sm ${commodity.priceChange > 0 ? 'text-green-500' :
                    commodity.priceChange < 0 ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                  {commodity.priceChange > 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : commodity.priceChange < 0 ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : (
                    <Minus className="w-4 h-4" />
                  )}
                  <span>{Math.abs(commodity.priceChange)}%</span>
                </div>
              </div>
            </div>

            {/* Mini Chart */}
            <div className="mt-3 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={commodity.history}>
                  <defs>
                    <linearGradient id={`gradient-${commodity.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={commodity.priceChange >= 0 ? '#22c55e' : '#ef4444'}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor={commodity.priceChange >= 0 ? '#22c55e' : '#ef4444'}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={commodity.priceChange >= 0 ? '#22c55e' : '#ef4444'}
                    fill={`url(#gradient-${commodity.id})`}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ))}
      </div>

      {/* Detail Panel */}
      {selectedCommodity && (
        <div className="fixed inset-0 z-50 bg-foreground/50" onClick={() => setSelectedCommodity(null)}>
          <div
            className="detail-panel absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full bg-muted mx-auto mb-6" />

            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {preferences.language === 'hi' ? selectedCommodity.nameHi : selectedCommodity.name}
                </h2>
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {selectedCommodity.market} Mandi
                </p>
              </div>
              <div className={`px-4 py-2 rounded-xl border text-lg font-bold ${getPredictionStyle(selectedCommodity.prediction)}`}>
                {getPredictionText(selectedCommodity.prediction)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="p-4 bg-primary/5 border-primary/20">
                <p className="text-sm text-muted-foreground">
                  {preferences.language === 'hi' ? 'वर्तमान भाव' : 'Current Price'}
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  ₹{selectedCommodity.price.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">{selectedCommodity.unit}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">
                  {preferences.language === 'hi' ? 'परिवर्तन' : 'Change'}
                </p>
                <p className={`text-2xl font-bold mt-1 ${selectedCommodity.priceChange > 0 ? 'text-green-500' :
                    selectedCommodity.priceChange < 0 ? 'text-red-500' : 'text-foreground'
                  }`}>
                  {selectedCommodity.priceChange > 0 ? '+' : ''}{selectedCommodity.priceChange}%
                </p>
                <p className="text-sm text-muted-foreground">
                  {preferences.language === 'hi' ? 'इस हफ्ते' : 'This week'}
                </p>
              </Card>
            </div>

            {/* Price Chart */}
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-3">
                {preferences.language === 'hi' ? '5 दिन का चार्ट' : '5-Day Price Trend'}
              </h3>
              <div className="h-48 bg-muted/30 rounded-xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedCommodity.history}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#22c55e"
                      fill="url(#colorPrice)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Recommendation */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {preferences.language === 'hi' ? 'AI सलाह' : 'AI Recommendation'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {selectedCommodity.prediction === 'SELL'
                      ? (preferences.language === 'hi'
                        ? 'भाव अच्छे हैं और अगले 3 दिनों में गिरने की संभावना है। बेचने का अच्छा समय है।'
                        : 'Prices are favorable and expected to drop in the next 3 days. Good time to sell.')
                      : selectedCommodity.prediction === 'HOLD'
                        ? (preferences.language === 'hi'
                          ? 'भाव स्थिर हैं। अगले हफ्ते तक रुकें, बेहतर भाव मिल सकते हैं।'
                          : 'Prices are stable. Hold for another week for potentially better prices.')
                        : (preferences.language === 'hi'
                          ? 'भाव बढ़ने की उम्मीद है। अभी खरीदारी का अच्छा मौका है।'
                          : 'Prices expected to rise. Good opportunity to buy now.')}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
