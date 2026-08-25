import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, Bot, User, Zap, TrendingUp, Calculator, HelpCircle } from 'lucide-react';
import { useFinancialData } from '../data/DataContext';
import { sendChatMessage, detectQueryType } from '../services/chatService';
import type { ChatMessage, QueryType } from '@fintech/shared';
import { formatINR, calculateNetWorth } from '../lib/financial';

const QUICK_ACTIONS: { label: string; message: string; icon: React.ReactNode; queryType: QueryType }[] = [
  { label: 'Portfolio Analysis', message: 'Give me a detailed analysis of my investment portfolio', icon: <TrendingUp size={14} />, queryType: 'complex_analysis' },
  { label: 'Can I get a home loan?', message: 'Can I afford a home loan of ₹50 lakhs?', icon: <Calculator size={14} />, queryType: 'loan' },
  { label: 'Quick financial tip', message: 'Give me a quick financial tip based on my profile', icon: <Zap size={14} />, queryType: 'quick_advice' },
  { label: 'Net worth breakdown', message: 'Explain my net worth and what I should improve', icon: <HelpCircle size={14} />, queryType: 'general' },
];

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', padding: '0 0.25rem' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-amethyst), var(--accent-rose))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Bot size={14} color="#fff" />
      </div>
      <div className="bubble-ai" style={{ display: 'flex', gap: '5px', alignItems: 'center', padding: '0.75rem 1rem' }}>
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  const time = msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        gap: '0.25rem',
        animation: 'slideUp 0.35s ease both',
      }}
    >
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexDirection: isUser ? 'row-reverse' : 'row' }}>
        {/* Avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: isUser
            ? 'linear-gradient(135deg, var(--accent-gold-muted), var(--accent-gold))'
            : 'linear-gradient(135deg, var(--accent-amethyst), var(--accent-rose))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isUser ? <User size={14} color="#0C0A0F" /> : <Bot size={14} color="#fff" />}
        </div>

        {/* Bubble */}
        <div className={isUser ? 'bubble-user' : 'bubble-ai'}>
          {!isUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <Sparkles size={11} style={{ color: 'var(--accent-ui)' }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--accent-ui)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                FinPilot AI
              </span>
              {msg.queryType && (
                <span className="badge badge-amethyst" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
                  {msg.queryType.replace('_', ' ')}
                </span>
              )}
            </div>
          )}
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>{msg.content}</p>
        </div>
      </div>
      <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', paddingLeft: isUser ? 0 : '3rem', paddingRight: isUser ? '3rem' : 0 }}>
        {time}
      </span>
    </div>
  );
}

const WELCOME_MSG: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Hello Arjun! 👋 I'm your AI financial co-pilot. I can analyze your portfolio, evaluate loan eligibility, track your net worth, and give you personalized financial advice.\n\nWhat would you like to explore today?",
  timestamp: new Date(),
  queryType: 'general',
};

export default function AIChat() {
  const { profile } = useFinancialData();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { total } = calculateNetWorth(profile);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (text: string, qType?: QueryType) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const queryType = qType ?? detectQueryType(trimmed);
      const response = await sendChatMessage({
        message: trimmed,
        queryType,
        context: profile,
      });

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        queryType: response.queryType,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I ran into an issue. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, profile]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', maxHeight: 820 }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }} className="animate-fade-in">
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>
            AI Chat
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Your personal finance AI — powered by your profile data
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div className="badge badge-gold animate-pulse-gold">
            <Bot size={10} />
            AI Active
          </div>
          <div className="badge badge-success numeric">
            NW: {formatINR(total, true)}
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div
        className="card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--bg-surface)',
        }}
      >
        {/* Quick Actions */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.label}
              onClick={() => sendMessage(qa.message, qa.queryType)}
              disabled={isTyping}
              className="btn-ghost"
              style={{
                padding: '0.4rem 0.875rem',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                opacity: isTyping ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {qa.icon}
              {qa.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div
          className="scroll-fade-mask"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                ref={inputRef}
                id="chat-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your finances... (Enter to send)"
                className="input-base"
                style={{
                  resize: 'none',
                  minHeight: 48,
                  maxHeight: 120,
                  lineHeight: 1.5,
                  paddingRight: '3rem',
                  overflowY: 'auto',
                }}
                rows={1}
                disabled={isTyping}
              />
            </div>
            <button
              id="chat-send"
              onClick={() => sendMessage(inputValue)}
              disabled={isTyping || !inputValue.trim()}
              className="btn-gold"
              style={{
                padding: '0.75rem',
                minWidth: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isTyping || !inputValue.trim() ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginTop: '0.5rem', textAlign: 'center' }}>
            FinPilot AI uses your financial profile to generate personalized insights. Shift+Enter for new line.
          </p>
        </div>
      </div>
    </div>
  );
}
