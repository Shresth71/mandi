'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useApp } from '@/lib/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  ChevronLeft, 
  Send, 
  Mic, 
  Sparkles,
  Leaf,
  Cloud,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import type { ChatMessage } from '@/lib/types';

const suggestedQuestions = {
  en: [
    'When should I water my wheat crop?',
    'How to control aphids naturally?',
    'Best fertilizer for tomatoes?',
    'Is it good time to sell rice?',
  ],
  hi: [
    'गेहूं में पानी कब दें?',
    'एफिड कीट को प्राकृतिक तरीके से कैसे रोकें?',
    'टमाटर के लिए सबसे अच्छी खाद?',
    'क्या चावल बेचने का अच्छा समय है?',
  ],
};



export function KhetSenseScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { preferences, setCurrentScreen } = useApp();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.chat-content',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }, containerRef);

    // Initial greeting
    setTimeout(() => {
      const greeting: ChatMessage = {
        id: '1',
        role: 'assistant',
        content: preferences.language === 'hi' 
          ? `नमस्ते ${preferences.farmerName}! मैं आपका AI कृषि सहायक हूं। खेती से जुड़ा कोई भी सवाल पूछें - मौसम, फसल, कीट, या बाजार भाव।`
          : `Hello ${preferences.farmerName}! I'm your AI farming assistant. Ask me anything about weather, crops, pests, or market prices.`,
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }, 500);

    return () => ctx.revert();
  }, [preferences.farmerName, preferences.language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      gsap.fromTo(
        '.message-bubble:last-child',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          language: preferences.language,
        }),
      });
      const data = await res.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "Sorry, I had trouble processing that.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (e) {
      console.error(e);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Network error fetching AI response.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <div ref={containerRef} className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex-shrink-0 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentScreen('home')}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {preferences.language === 'hi' ? 'खेत सेंस' : 'KhetSense'}
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {preferences.language === 'hi' ? 'ऑनलाइन' : 'Online'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 chat-content scrollbar-hide">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <p className="text-muted-foreground">
                {preferences.language === 'hi' ? 'अपना सवाल पूछें...' : 'Ask your question...'}
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-bubble flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-card border border-border rounded-bl-md'
              }`}
            >
              <p className={`text-sm leading-relaxed ${message.role === 'user' ? 'text-primary-foreground' : 'text-foreground'}`}>
                {message.content}
              </p>
              <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="flex-shrink-0 px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2">
            {preferences.language === 'hi' ? 'जल्दी पूछें:' : 'Quick questions:'}
          </p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {((suggestedQuestions as any)[preferences.language] || suggestedQuestions.en).map((q: string, i: number) => (
              <button
                key={i}
                onClick={() => handleQuickQuestion(q)}
                className="flex-shrink-0 px-3 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 bg-background border-t border-border safe-bottom">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={preferences.language === 'hi' ? 'अपना सवाल लिखें...' : 'Type your question...'}
              className="h-12 pr-12 rounded-xl bg-muted border-0"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Mic className="w-4 h-4 text-primary" />
            </button>
          </div>
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="w-12 h-12 rounded-xl gradient-primary text-primary-foreground p-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
