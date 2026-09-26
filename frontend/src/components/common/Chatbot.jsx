import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  RotateCcw, 
  ChevronDown,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

// Helper to clean Markdown and symbols for natural voice synthesis
const cleanForSpeech = (str) => {
  if (!str) return '';
  return str
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace [link text](url) with link text
    .replace(/[*_#`~]/g, '')                     // Remove markdown formatting
    .replace(/₹\s*([0-9.,]+)/g, '$1 rupees')     // Convert ₹80 to "80 rupees"
    .replace(/[•\-\+]\s+/g, '. ')              // Replace bullet points with pause
    .replace(/\n+/g, '. ')                        // Newlines to pause
    .replace(/\s+/g, ' ')
    .trim();
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // Voice Recognition (Speech-to-Text) state
  const [isListening, setIsListening] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Voice Assist (Text-to-Speech) state
  const [voiceAssistEnabled, setVoiceAssistEnabled] = useState(true);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState(null);

  const { user, isAuthenticated, getAxios } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const userRole = isAuthenticated && user ? user.role : 'CUSTOMER';

  // Role details config
  const roleConfig = {
    ADMIN: {
      title: 'Admin Intelligence',
      badge: '🛡️ System Admin AI',
      color: '#7c3aed',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
      welcome: "👋 Hello " + (user?.name ? "**" + user.name + "**" : "Administrator") + "! I am your administrative data analyst. Ask me by voice or text: **how many users were created today**, platform sales revenue, student vs staff metrics, or counter settings.",
      defaultSuggestions: [
        'How many users are created in today',
        'Show overall store sales revenue',
        'How many orders placed today?',
        'How to create retailer staff?'
      ],
      placeholder: 'Type or speak: How many users created today...'
    },
    RETAILER: {
      title: 'Store Operations AI',
      badge: '🏪 Store Manager AI',
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
      welcome: "👋 Hello " + (user?.name ? "**" + user.name + "**" : "Store Manager") + "! I am your real-time store copilot. Ask me by voice or text: **how many orders are placed today**, today's sales revenue, low stock alerts, or pending packing queues.",
      defaultSuggestions: [
        'How many orders are placed in today',
        'What is today’s total sales revenue?',
        'Which items are low on stock?',
        'List pending orders to prepare'
      ],
      placeholder: 'Type or speak: How many orders placed today...'
    },
    CUSTOMER: {
      title: 'NEC Store Assistant',
      badge: isAuthenticated ? '🎓 Student Copilot' : '🛍️ Campus Store AI',
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
      welcome: "👋 Hello" + (user?.name ? " **" + user.name + "**" : "") + "! Looking for books, supplies, or lab gear? Ask me by voice or text if an item is available in stock (e.g. *\"is the book available or not\"*), store pickup timings, or order status!",
      defaultSuggestions: [
        'Is the book available or not',
        'What are today’s store hours?',
        'Where is the pickup store?',
        'Track my recent order'
      ],
      placeholder: 'Type or speak: Is the book available...'
    }
  };

  const activeConfig = roleConfig[userRole] || roleConfig.CUSTOMER;

  // Initialize Speech Recognition on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechRecognitionSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Default to Indian English / English

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputValue(transcript);
        
        // Auto-send if finalized
        if (event.results[0].isFinal && transcript.trim()) {
          handleSendMessage(transcript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition status:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-To-Speech (Voice Assist) Handler
  const speakText = (text, messageId = null) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (!voiceAssistEnabled) {
      setCurrentlySpeakingId(null);
      return;
    }

    const cleanText = cleanForSpeech(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick best natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.lang.startsWith('en')) && !v.name.includes('Bad'));
    if (naturalVoice) utterance.voice = naturalVoice;

    if (messageId) setCurrentlySpeakingId(messageId);

    utterance.onend = () => {
      setCurrentlySpeakingId(null);
    };

    utterance.onerror = () => {
      setCurrentlySpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceAssist = () => {
    if (voiceAssistEnabled) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      setVoiceAssistEnabled(false);
    } else {
      setVoiceAssistEnabled(true);
    }
  };

  // Toggle Microphone Speech Recognition
  const toggleListening = () => {
    if (!speechRecognitionSupported) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome, Edge, or a WebSpeech-enabled browser.');
      return;
    }

    // Stop speaking if bot is currently speaking
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setCurrentlySpeakingId(null);

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Recognition start error:', e);
        recognitionRef.current?.stop();
      }
    }
  };

  // Initialize or reset chat conversation
  const initializeChat = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setCurrentlySpeakingId(null);

    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: activeConfig.welcome,
        suggestions: activeConfig.defaultSuggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Re-initialize when role changes
  useEffect(() => {
    initializeChat();
  }, [userRole, user?.id]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
      setHasUnread(false);
      setShowTooltip(false);
    } else {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
      }
    }
  }, [isOpen, messages]);

  // Send message to backend
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    // Stop any ongoing voice listening or playback
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setCurrentlySpeakingId(null);

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const axiosClient = getAxios();
      const res = await axiosClient.post('/chatbot/message', { message: query });

      if (res.data && res.data.success) {
        const botMsgId = (Date.now() + 1).toString();
        const botMessage = {
          id: botMsgId,
          sender: 'bot',
          text: res.data.reply,
          suggestions: res.data.suggestions || [],
          data: res.data.data,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMessage]);
        if (!isOpen) setHasUnread(true);

        // Voice Assistance: Speak bot reply out loud if enabled!
        if (voiceAssistEnabled) {
          setTimeout(() => speakText(res.data.reply, botMsgId), 250);
        }
      } else {
        throw new Error(res.data?.message || 'Failed to get response');
      }
    } catch (err) {
      console.error('Chatbot request error:', err);
      const errMsgId = (Date.now() + 1).toString();
      const errReply = '⚠️ I encountered a temporary connection issue. Please check that the server is running and try again.';
      const errorMessage = {
        id: errMsgId,
        sender: 'bot',
        text: errReply,
        suggestions: activeConfig.defaultSuggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);

      if (voiceAssistEnabled) {
        setTimeout(() => speakText(errReply, errMsgId), 250);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper to format text with bolding and markdown links
  const renderFormattedText = (content) => {
    if (!content) return '';
    
    // Split into paragraphs / lines
    const lines = content.split('\n');
    return lines.map((line, lineIdx) => {
      // Parse markdown links [text](url)
      const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        const linkText = match[1];
        const linkUrl = match[2];
        parts.push(
          <a
            key={match.index}
            href={linkUrl}
            onClick={(e) => {
              e.preventDefault();
              navigate(linkUrl);
              if (window.innerWidth < 640) setIsOpen(false);
            }}
            style={{
              color: '#2563eb',
              textDecoration: 'underline',
              fontWeight: 600,
              cursor: 'pointer',
              wordBreak: 'break-word'
            }}
          >
            {linkText}
          </a>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      // Now handle bolding **text** in string parts
      const processedParts = parts.map((part, pIdx) => {
        if (typeof part !== 'string') return part;
        const boldSplit = part.split(/\*\*(.*?)\*\*/g);
        return boldSplit.map((chunk, cIdx) => {
          if (cIdx % 2 === 1) {
            return <strong key={cIdx} style={{ color: 'var(--text-main, #1e293b)' }}>{chunk}</strong>;
          }
          return chunk;
        });
      });

      return (
        <span key={lineIdx} style={{ display: 'block', minHeight: line.trim() ? 'auto' : '8px' }}>
          {processedParts}
        </span>
      );
    });
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON (BOTTOM RIGHT) */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          pointerEvents: 'auto'
        }}
      >
        {/* Onboarding Tooltip banner */}
        {showTooltip && !isOpen && (
          <div
            style={{
              marginBottom: '12px',
              padding: '8px 14px',
              borderRadius: '14px',
              background: 'var(--card-bg, #ffffff)',
              color: 'var(--text-main, #1e293b)',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: 'var(--neu-extruded-sm, 0 8px 24px rgba(0,0,0,0.12))',
              border: '1px solid var(--neu-border, rgba(255,255,255,0.7))',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              animation: 'fadeInUp 0.3s ease-out',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ fontSize: '15px' }}>🎙️</span>
            <span>
              {userRole === 'ADMIN'
                ? 'Speak or Ask: Users created today?'
                : userRole === 'RETAILER'
                ? 'Speak or Ask: Orders placed today?'
                : 'Need books? Speak or Ask AI!'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted, #64748b)',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Main Launcher Button */}
        <button
          id="nec-chatbot-launcher"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle NEC Store AI Chatbot"
          style={{
            position: 'relative',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: activeConfig.gradient,
            color: '#ffffff',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            boxShadow: isOpen 
              ? '0 6px 16px rgba(0,0,0,0.25)' 
              : '0 10px 28px rgba(37, 99, 235, 0.45), 0 0 0 4px rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: isOpen ? 'rotate(90deg) scale(0.95)' : 'scale(1)',
          }}
          onMouseEnter={(e) => {
            if (!isOpen) e.currentTarget.style.transform = 'scale(1.08) translateY(-3px)';
          }}
          onMouseLeave={(e) => {
            if (!isOpen) e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isOpen ? (
            <X size={26} strokeWidth={2.5} />
          ) : (
            <>
              <Bot size={28} strokeWidth={2.2} />
              {/* Online Green Pulsing Indicator */}
              <span
                style={{
                  position: 'absolute',
                  top: '1px',
                  right: '1px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  border: '2.5px solid #ffffff',
                  boxShadow: '0 0 8px rgba(34, 197, 94, 0.8)'
                }}
              />
              {/* Unread indicator */}
              {hasUnread && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    left: '-4px',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff',
                    animation: 'bounce 1s infinite'
                  }}
                >
                  1
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* POPUP CHAT WINDOW MODAL */}
      {isOpen && (
        <div
          id="nec-chatbot-window"
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '410px',
            maxWidth: 'calc(100vw - 32px)',
            height: '590px',
            maxHeight: 'calc(100vh - 120px)',
            zIndex: 99999,
            borderRadius: '24px',
            background: 'var(--card-bg, #ffffff)',
            boxShadow: '0 20px 48px -10px rgba(0, 0, 0, 0.28), 0 0 0 1px var(--neu-border, rgba(255,255,255,0.8))',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid var(--neu-border-subtle, rgba(226, 232, 240, 0.8))',
            animation: 'chatPopUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              background: activeConfig.gradient,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '13px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  position: 'relative'
                }}
              >
                <Bot size={22} color="#ffffff" />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    border: '2px solid #ffffff'
                  }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '15.5px',
                      fontWeight: 700,
                      letterSpacing: '-0.3px',
                      color: '#ffffff'
                    }}
                  >
                    {activeConfig.title}
                  </h3>
                  <Sparkles size={13} color="#fef08a" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span
                    style={{
                      fontSize: '10.5px',
                      padding: '2px 7px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.22)',
                      fontWeight: 600,
                      letterSpacing: '0.2px'
                    }}
                  >
                    {activeConfig.badge}
                  </span>
                  <span style={{ fontSize: '10.5px', opacity: 0.9 }}>• Voice Assist</span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Voice Assist (TTS) On/Off Toggle Button */}
              <button
                onClick={toggleVoiceAssist}
                title={voiceAssistEnabled ? "Voice Assist Active (Click to Mute)" : "Voice Assist Muted (Click to Unmute)"}
                style={{
                  background: voiceAssistEnabled ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.12)',
                  border: voiceAssistEnabled ? '1px solid rgba(255, 255, 255, 0.5)' : 'none',
                  borderRadius: '10px',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                {voiceAssistEnabled ? <Volume2 size={16} /> : <VolumeX size={16} opacity={0.65} />}
                {voiceAssistEnabled && currentlySpeakingId && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#38bdf8',
                      animation: 'pulse 1s infinite'
                    }}
                  />
                )}
              </button>

              {/* Reset Chat Button */}
              <button
                onClick={initializeChat}
                title="Restart Chat Conversation"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  borderRadius: '10px',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
              >
                <RotateCcw size={15} />
              </button>

              {/* Minimize / Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  borderRadius: '10px',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              background: 'var(--bg-color, #f8fafc)'
            }}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isThisSpeaking = currentlySpeakingId === msg.id;

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '100%',
                    animation: 'fadeIn 0.25s ease-out'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'flex-start',
                      maxWidth: isUser ? '85%' : '92%',
                      flexDirection: isUser ? 'row-reverse' : 'row'
                    }}
                  >
                    {!isUser && (
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: activeConfig.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                        }}
                      >
                        <Bot size={16} color="#ffffff" />
                      </div>
                    )}

                    <div
                      style={{
                        padding: '12px 15px',
                        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: isUser
                          ? activeConfig.gradient
                          : 'var(--card-bg, #ffffff)',
                        color: isUser ? '#ffffff' : 'var(--text-main, #1e293b)',
                        boxShadow: isUser
                          ? '0 4px 12px rgba(37, 99, 235, 0.25)'
                          : isThisSpeaking
                          ? '0 0 0 2px #2563eb, var(--neu-extruded-sm, 0 4px 12px rgba(0,0,0,0.06))'
                          : 'var(--neu-extruded-sm, 0 4px 12px rgba(0,0,0,0.06))',
                        border: isUser
                          ? 'none'
                          : '1px solid var(--neu-border-subtle, rgba(226, 232, 240, 0.7))',
                        fontSize: '13.5px',
                        lineHeight: 1.55,
                        wordBreak: 'break-word',
                        position: 'relative'
                      }}
                    >
                      {renderFormattedText(msg.text)}

                      {/* Mini Speaker button on bot bubbles to replay voice */}
                      {!isUser && (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: '6px'
                          }}
                        >
                          <button
                            onClick={() => {
                              if (isThisSpeaking) {
                                window.speechSynthesis.cancel();
                                setCurrentlySpeakingId(null);
                              } else {
                                speakText(msg.text, msg.id);
                              }
                            }}
                            title={isThisSpeaking ? "Stop speaking" : "Listen aloud"}
                            style={{
                              background: isThisSpeaking ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                              border: 'none',
                              color: isThisSpeaking ? '#2563eb' : 'var(--text-muted, #94a3b8)',
                              cursor: 'pointer',
                              padding: '3px 6px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 600,
                              transition: 'all 0.15s'
                            }}
                          >
                            <Volume2 size={13} />
                            <span>{isThisSpeaking ? 'Speaking...' : 'Listen'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '10px',
                      color: 'var(--text-muted, #94a3b8)',
                      marginTop: '4px',
                      paddingLeft: isUser ? '0' : '36px',
                      paddingRight: isUser ? '8px' : '0'
                    }}
                  >
                    {msg.timestamp}
                  </span>

                  {/* Suggestion Chips */}
                  {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        marginTop: '8px',
                        paddingLeft: '36px'
                      }}
                    >
                      {msg.suggestions.map((suggestion, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendMessage(suggestion)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '12px',
                            background: 'var(--card-bg, #ffffff)',
                            border: '1px solid var(--primary-blue, #2563eb)',
                            color: 'var(--primary-blue, #2563eb)',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease-in-out',
                            boxShadow: '0 2px 5px rgba(37,99,235,0.08)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--primary-blue, #2563eb)';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--card-bg, #ffffff)';
                            e.currentTarget.style.color = 'var(--primary-blue, #2563eb)';
                          }}
                        >
                          <span>{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  paddingLeft: '4px'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: activeConfig.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Bot size={16} color="#ffffff" />
                </div>
                <div
                  style={{
                    padding: '10px 16px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'var(--card-bg, #ffffff)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid var(--neu-border-subtle, rgba(226, 232, 240, 0.7))',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb', display: 'inline-block', animation: 'typingBounce 1.2s infinite ease-in-out' }} />
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb', display: 'inline-block', animation: 'typingBounce 1.2s infinite ease-in-out 0.2s' }} />
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb', display: 'inline-block', animation: 'typingBounce 1.2s infinite ease-in-out 0.4s' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Listening Active Banner (shown when microphone is listening) */}
          {isListening && (
            <div
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                fontWeight: 600,
                boxShadow: '0 -2px 10px rgba(239, 68, 68, 0.25)',
                animation: 'pulse 1.5s infinite'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffffff', animation: 'ping 1s infinite' }} />
                <span>Listening to your voice... Speak now!</span>
              </div>
              <button
                onClick={toggleListening}
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          )}

          {/* Input Box */}
          <div
            style={{
              padding: '12px 14px',
              background: 'var(--card-bg, #ffffff)',
              borderTop: '1px solid var(--neu-border-subtle, rgba(226, 232, 240, 0.8))',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {/* Voice Recognition Microphone Button */}
            <button
              type="button"
              onClick={toggleListening}
              title={isListening ? "Stop listening" : "Click to speak (Voice Recognition)"}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '13px',
                background: isListening 
                  ? '#ef4444' 
                  : 'var(--bg-color, #f1f5f9)',
                color: isListening ? '#ffffff' : 'var(--text-main, #1e293b)',
                border: isListening ? '2px solid #fecaca' : '1px solid var(--neu-border-subtle, #cbd5e1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isListening 
                  ? '0 0 16px rgba(239, 68, 68, 0.6)' 
                  : 'var(--neu-extruded-sm, 0 2px 6px rgba(0,0,0,0.06))',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                position: 'relative'
              }}
            >
              {isListening ? (
                <MicOff size={19} className="animate-spin" />
              ) : (
                <Mic size={19} color="#2563eb" />
              )}
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening... Speak your question" : activeConfig.placeholder}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '11px 14px',
                borderRadius: '16px',
                border: isListening ? '1.5px solid #ef4444' : '1px solid var(--neu-border-subtle, #cbd5e1)',
                background: isListening ? '#fff1f2' : 'var(--bg-color, #f1f5f9)',
                color: 'var(--text-main, #1e293b)',
                fontSize: '13.5px',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--neu-pressed, inset 2px 2px 5px rgba(0,0,0,0.05))'
              }}
              onFocus={(e) => {
                if (!isListening) {
                  e.target.style.borderColor = 'var(--primary-blue, #2563eb)';
                  e.target.style.background = 'var(--card-bg, #ffffff)';
                }
              }}
              onBlur={(e) => {
                if (!isListening) {
                  e.target.style.borderColor = 'var(--neu-border-subtle, #cbd5e1)';
                  e.target.style.background = 'var(--bg-color, #f1f5f9)';
                }
              }}
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '13px',
                background: inputValue.trim() && !isLoading ? activeConfig.gradient : 'var(--text-subtle, #94a3b8)',
                color: '#ffffff',
                border: 'none',
                cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: inputValue.trim() && !isLoading ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                if (inputValue.trim() && !isLoading) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Send size={17} style={{ transform: 'translateX(1px)' }} />
            </button>
          </div>
        </div>
      )}

      {/* Global Chatbot Animations CSS */}
      <style>{`
        @keyframes chatPopUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.92);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes typingBounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.35;
          }
          40% {
            transform: translateY(-5px);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
