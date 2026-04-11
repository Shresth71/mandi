'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { useApp } from '@/lib/app-context';
import { 
  Mic, 
  MicOff, 
  X, 
  Volume2,
  Home,
  Camera,
  MessageCircle,
  TrendingUp,
  Cloud,
  Shield,
  ShoppingBag
} from 'lucide-react';
import type { Screen } from '@/lib/types';

interface VoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceAssistant({ isOpen, onClose }: VoiceAssistantProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null); // Use any locally to avoid massive TS window typings missing inside Next.js scope natively.
  const { preferences, setCurrentScreen } = useApp();

  const processCommand = useCallback(async (text: string) => {
    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          language: preferences.language
        })
      });

      const data = await res.json();

      if (!data || !data.action) {
        throw new Error("Invalid response");
      }

      const responseText = data.response || (preferences.language === 'hi' 
        ? 'माफ़ कीजिए, मैं समझ नहीं पाया।' 
        : 'Sorry, I couldn\'t understand that.');

      setResponse(responseText);

      // Speak response
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(responseText);
        utterance.lang = preferences.language === 'hi' ? 'hi-IN' : 'en-IN';
        speechSynthesis.speak(utterance);
      }

      if (data.action === 'close') {
        setTimeout(onClose, 1000);
      } else if (data.action !== 'unknown') {
        setTimeout(() => {
          setCurrentScreen(data.action as Screen);
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error("Intent Processing Error:", err);
      const noMatchResponse = preferences.language === 'hi' 
        ? 'सिस्टम में त्रुटि। कृपया फिर से बोलें।'
        : 'System error. Please try again.';
      setResponse(noMatchResponse);
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(noMatchResponse);
        utterance.lang = preferences.language === 'hi' ? 'hi-IN' : 'en-IN';
        speechSynthesis.speak(utterance);
      }
    }
  }, [preferences.language, setCurrentScreen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = preferences.language === 'hi' ? 'hi-IN' : 'en-IN';
      
      recognitionRef.current.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        setTranscript(text);
        
        if (event.results[last].isFinal) {
          setIsProcessing(true);
          setTimeout(() => {
            processCommand(text).finally(() => setIsProcessing(false));
          }, 500);
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }

    // Animate in
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
    );

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      speechSynthesis.cancel();
    };
  }, [isOpen, preferences.language, processCommand]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setResponse(preferences.language === 'hi' 
        ? 'आपका ब्राउज़र वॉइस को सपोर्ट नहीं करता'
        : 'Voice recognition not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResponse('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleClose = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 0.2,
      onComplete: onClose,
    });
  };

  if (!isOpen) return null;

  const quickCommands = [
    { icon: Home, label: preferences.language === 'hi' ? 'होम' : 'Home', command: 'home' },
    { icon: Camera, label: preferences.language === 'hi' ? 'स्कैन' : 'Scan', command: 'scan crop' },
    { icon: MessageCircle, label: preferences.language === 'hi' ? 'चैट' : 'Chat', command: 'chat' },
    { icon: TrendingUp, label: preferences.language === 'hi' ? 'मंडी' : 'Mandi', command: 'mandi price' },
    { icon: Cloud, label: preferences.language === 'hi' ? 'मौसम' : 'Weather', command: 'weather' },
    { icon: Shield, label: preferences.language === 'hi' ? 'बीमा' : 'Insurance', command: 'insurance' },
    { icon: ShoppingBag, label: preferences.language === 'hi' ? 'बाज़ार' : 'Market', command: 'marketplace' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-foreground/70 flex items-end justify-center p-4">
      <div
        ref={containerRef}
        className="w-full max-w-md bg-background rounded-3xl p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">
                {preferences.language === 'hi' ? 'आवाज़ सहायक' : 'Voice Assistant'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {preferences.language === 'hi' ? 'बोलकर नियंत्रण करें' : 'Control with your voice'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mic Button */}
        <div className="flex flex-col items-center py-8">
          <button
            onClick={toggleListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isListening 
                ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/30' 
                : 'gradient-primary shadow-lg'
            }`}
          >
            {isListening ? (
              <MicOff className="w-10 h-10 text-white" />
            ) : (
              <Mic className="w-10 h-10 text-primary-foreground" />
            )}
          </button>
          
          <p className="mt-4 text-sm text-muted-foreground text-center">
            {isListening 
              ? (preferences.language === 'hi' ? 'सुन रहा हूं...' : 'Listening...')
              : (preferences.language === 'hi' ? 'बोलने के लिए टैप करें' : 'Tap to speak')
            }
          </p>

          {/* Transcript */}
          {transcript && (
            <div className="mt-4 px-4 py-2 bg-muted rounded-xl max-w-full">
              <p className="text-foreground text-center">{transcript}</p>
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="mt-4 px-4 py-2 bg-primary/10 rounded-xl max-w-full">
              <p className="text-primary text-center font-medium">{response}</p>
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>

        {/* Quick Commands */}
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-3 text-center">
            {preferences.language === 'hi' ? 'या कहें:' : 'Or say:'}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {quickCommands.map((cmd, i) => (
              <button
                key={i}
                onClick={() => {
                  setTranscript(cmd.command);
                  setIsProcessing(true);
                  processCommand(cmd.command).finally(() => setIsProcessing(false));
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm hover:bg-primary/10 transition-colors"
              >
                <cmd.icon className="w-3.5 h-3.5" />
                {cmd.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
