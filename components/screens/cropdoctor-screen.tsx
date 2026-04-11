'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useApp } from '@/lib/app-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Camera, 
  Upload, 
  X, 
  CheckCircle2, 
  Leaf,
  ChevronLeft,
  Zap,
  Bug,
  Pill
} from 'lucide-react';

interface DiagnosisResult {
  diseaseName: string;
  diseaseNameHi: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  treatment: { step: string; stepHi: string }[];
  prevention: string[];
}

export function CropDoctorScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'camera' | 'scanning' | 'result'>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { preferences, setCurrentScreen } = useApp();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cropdoctor-content',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (mode === 'scanning' && scannerRef.current) {
      const ctx = gsap.context(() => {
        // Scanning line animation
        gsap.to('.scan-line', {
          y: 280,
          duration: 1.5,
          repeat: -1,
          ease: 'power1.inOut',
        });

        // Pulse corners
        gsap.to('.scan-corner', {
          opacity: 0.5,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
        });
      }, scannerRef);

      return () => ctx.revert();
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'result' && diagnosis) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.result-card',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
        );

        gsap.fromTo(
          '.confidence-fill',
          { width: 0 },
          { width: `${diagnosis.confidence}%`, duration: 1, ease: 'power2.out', delay: 0.3 }
        );
      }, containerRef);

      return () => ctx.revert();
    }
  }, [mode, diagnosis]);

  const processImage = async (base64Image: string) => {
    setCapturedImage(base64Image);
    setMode('scanning');

    try {
        const base64Data = base64Image.split(',')[1] || base64Image;
        const res = await fetch('/api/vision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64Data, language: preferences.language })
        });
        const data = await res.json();
        
        if (data && data.diseaseName) {
            setDiagnosis(data);
            setMode('result');
        } else {
            console.error("Invalid response format", data);
            alert(preferences.language === 'hi' ? "माफ़ करें, चित्र का विश्लेषण नहीं हो सका।" : "Sorry, could not analyze the image properly.");
            resetScan();
        }
    } catch(err) {
        console.error(err);
        alert(preferences.language === 'hi' ? "सर्वर से कनेक्ट करने में विफल।" : "Failed to connect to the vision API.");
        resetScan();
    }
  };

  const handleCaptureFile = () => {
    if (fileInputRef.current) {
        fileInputRef.current.removeAttribute('capture');
        fileInputRef.current.setAttribute('capture', 'environment');
        fileInputRef.current.click();
    }
  };

  const handleUploadFile = () => {
    if (fileInputRef.current) {
        fileInputRef.current.removeAttribute('capture');
        fileInputRef.current.click();
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        processImage(base64);
      };
      reader.readAsDataURL(file);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetScan = () => {
    setCapturedImage(null);
    setDiagnosis(null);
    setMode('camera');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-500 bg-green-500/10';
      case 'medium': return 'text-amber-500 bg-amber-500/10';
      case 'high': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background pb-28">
      {/* Hidden File Input */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={onFileChange} 
      />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentScreen('home')}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {preferences.language === 'hi' ? 'फसल डॉक्टर' : 'Crop Doctor'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {preferences.language === 'hi' ? 'AI से फसल रोग पहचानें' : 'AI-powered disease detection'}
            </p>
          </div>
        </div>
      </div>

      <div className="cropdoctor-content px-6 pt-6">
        {mode === 'camera' && (
          <div className="space-y-6">
            {/* Camera Preview */}
            <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-muted to-muted/50 overflow-hidden border-2 border-dashed border-border">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-primary" />
                </div>
                <p className="text-muted-foreground text-center px-8">
                  {preferences.language === 'hi' 
                    ? 'पौधे की फोटो लें या गैलरी से चुनें'
                    : 'Take a photo of your plant or choose from gallery'}
                </p>
              </div>

              {/* Corner guides */}
              <div className="absolute top-6 left-6 w-12 h-12 border-l-4 border-t-4 border-primary rounded-tl-xl" />
              <div className="absolute top-6 right-6 w-12 h-12 border-r-4 border-t-4 border-primary rounded-tr-xl" />
              <div className="absolute bottom-6 left-6 w-12 h-12 border-l-4 border-b-4 border-primary rounded-bl-xl" />
              <div className="absolute bottom-6 right-6 w-12 h-12 border-r-4 border-b-4 border-primary rounded-br-xl" />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleCaptureFile}
                className="h-14 text-lg font-semibold rounded-xl gradient-primary text-primary-foreground"
              >
                <Camera className="w-5 h-5 mr-2" />
                {preferences.language === 'hi' ? 'फोटो लें' : 'Capture'}
              </Button>
              <Button
                onClick={handleUploadFile}
                variant="outline"
                className="h-14 text-lg font-semibold rounded-xl"
              >
                <Upload className="w-5 h-5 mr-2" />
                {preferences.language === 'hi' ? 'अपलोड' : 'Upload'}
              </Button>
            </div>

            {/* Tips */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {preferences.language === 'hi' ? 'बेहतर परिणाम के लिए' : 'Tips for better results'}
                  </p>
                  <ul className="text-muted-foreground text-xs mt-2 space-y-1">
                    <li>{preferences.language === 'hi' ? '• अच्छी रोशनी में फोटो लें' : '• Take photo in good lighting'}</li>
                    <li>{preferences.language === 'hi' ? '• प्रभावित हिस्से को करीब से कैप्चर करें' : '• Capture affected area closely'}</li>
                    <li>{preferences.language === 'hi' ? '• पत्ती को साफ दिखाएं' : '• Show the leaf clearly'}</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {mode === 'scanning' && (
          <div ref={scannerRef} className="space-y-6">
            {/* Scanning Animation */}
            <div className="relative aspect-square rounded-3xl bg-foreground/5 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-emerald-900/20" />
              
              {capturedImage && (
                <img src={capturedImage} alt="Captured Crop" className="absolute inset-0 w-full h-full object-cover opacity-50" />
              )}
              
              {/* Scan line */}
              <div className="scan-line absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-lg shadow-primary/50" />
              
              {/* Corner indicators */}
              <div className="scan-corner absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary rounded-tl-lg" />
              <div className="scan-corner absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary rounded-tr-lg" />
              <div className="scan-corner absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary rounded-bl-lg" />
              <div className="scan-corner absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary rounded-br-lg" />

              {/* Center indicator */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-primary/30 flex items-center justify-center">
                  <Leaf className="w-12 h-12 text-primary animate-pulse" />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <p className="text-lg font-semibold text-foreground">
                  {preferences.language === 'hi' ? 'विश्लेषण हो रहा है...' : 'Analyzing...'}
                </p>
              </div>
              <p className="text-muted-foreground">
                {preferences.language === 'hi' 
                  ? 'AI आपकी फसल की जांच कर रहा है'
                  : 'AI is examining your crop'}
              </p>
            </div>
          </div>
        )}

        {mode === 'result' && diagnosis && (
          <div className="space-y-5">
            {/* Main Result Card */}
            <Card className="result-card p-5 border-2 border-primary/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Bug className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-foreground">
                      {preferences.language === 'hi' ? diagnosis.diseaseNameHi : diagnosis.diseaseName}
                    </p>
                    <p className={`text-sm font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${getSeverityColor(diagnosis.severity)}`}>
                      {diagnosis.severity.toUpperCase()} SEVERITY
                    </p>
                  </div>
                </div>
                <button onClick={resetScan} className="p-2 rounded-full bg-muted">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Confidence Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {preferences.language === 'hi' ? 'AI विश्वास स्तर' : 'AI Confidence'}
                  </span>
                  <span className="font-semibold text-foreground">{diagnosis.confidence}%</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div className="confidence-fill h-full rounded-full bg-gradient-to-r from-primary to-emerald-400" />
                </div>
              </div>
            </Card>

            {/* Treatment Steps */}
            <Card className="result-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Pill className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">
                  {preferences.language === 'hi' ? 'उपचार के तरीके' : 'Treatment Steps'}
                </h3>
              </div>
              <div className="space-y-3">
                {diagnosis.treatment.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">{index + 1}</span>
                    </div>
                    <p className="text-foreground text-sm leading-relaxed">
                      {preferences.language === 'hi' ? item.stepHi : item.step}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Prevention Tips */}
            <Card className="result-card p-5 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">
                  {preferences.language === 'hi' ? 'बचाव के उपाय' : 'Prevention Tips'}
                </h3>
              </div>
              <ul className="space-y-2">
                {diagnosis.prevention.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                    <Leaf className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={resetScan}
                variant="outline"
                className="h-12 rounded-xl"
              >
                {preferences.language === 'hi' ? 'फिर से स्कैन' : 'Scan Again'}
              </Button>
              <Button
                onClick={() => setCurrentScreen('khetsense')}
                className="h-12 rounded-xl gradient-primary text-primary-foreground"
              >
                {preferences.language === 'hi' ? 'AI से पूछें' : 'Ask AI'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
