import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am your AI Finance Assistant. 🤖\n\nYou can ask me about your spending logs and earnings. Try clicking one of the suggestions below or type your query directly!",
      time: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  const PRESETS = [
    "What is my current balance?",
    "What is my total expense today?",
    "Show weekly expense",
    "Last transaction"
  ];

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    if (!textToSend) {
      setInputText('');
    }

    // Append user message
    const userMsgId = Date.now();
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text,
      time: new Date(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    try {
      const response = await api.sendChatMessage(text);
      
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.response,
        time: new Date(),
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "⚠️ Sorry, I'm having trouble connecting to the finance ledger. Make sure the backend server is running and try again.",
        time: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const formatTime = (dateObj) => {
    return dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  // Helper to render markdown bolding in rules response simply
  const renderMessageText = (text) => {
    // Simple replacement of markdown double stars with HTML bold tags
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-extrabold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={idx} className="italic text-slate-300">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-[75vh] max-w-4xl mx-auto bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
      {/* Bot Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-white/10 rounded-xl">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-base leading-tight flex items-center space-x-1.5">
              <span>Finance Assistant</span>
              <Sparkles className="w-3.5 h-3.5 text-blue-200 fill-blue-200 animate-pulse" />
            </h2>
            <span className="text-[10px] text-blue-100 font-semibold tracking-wider uppercase">Active Live Node</span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-2`}
          >
            {msg.sender === 'bot' && (
              <div className="p-1.5 bg-blue-600 rounded-lg text-white mb-1 shadow-sm flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}
            
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-white text-slate-805 rounded-bl-none border border-slate-100'
            }`}>
              <p className="text-sm whitespace-pre-line leading-relaxed">
                {renderMessageText(msg.text)}
              </p>
              <span className={`block text-[9px] mt-1.5 text-right font-medium ${
                msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
              }`}>
                {formatTime(msg.time)}
              </span>
            </div>

            {msg.sender === 'user' && (
              <div className="p-1.5 bg-slate-700 rounded-lg text-white mb-1 shadow-sm flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex justify-start items-end space-x-2">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white mb-1 shadow-sm flex-shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white text-slate-400 rounded-2xl rounded-bl-none px-4 py-3 border border-slate-100 shadow-sm flex items-center space-x-2 text-xs font-semibold">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Analyzing ledger data...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Preset Suggestions */}
      <div className="bg-white border-t border-slate-100 px-4 py-3 flex flex-wrap gap-2 justify-center">
        {PRESETS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(preset)}
            disabled={sending}
            className="text-xs bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-bold py-1.5 px-3 rounded-full border border-slate-200 hover:border-blue-200 transition-all duration-200 disabled:opacity-50"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="bg-white p-4 border-t border-slate-100 flex items-center space-x-3">
        <input
          type="text"
          placeholder="Ask a question about your transactions..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={sending}
          className="flex-1 bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-805 font-medium px-4 py-3.5 rounded-xl border border-slate-205 focus:border-blue-605 outline-none transition-all duration-200 text-sm"
        />
        <button
          onClick={() => handleSend()}
          disabled={sending || !inputText.trim()}
          className="p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg transition-all duration-200 disabled:opacity-55 disabled:cursor-not-allowed"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
