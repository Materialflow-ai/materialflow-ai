import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageSquare, Sparkles } from 'lucide-react';

export default function DiscussPanel({ messages = [], onSend, selectedModel, agentStatus }) {
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSubmit = () => {
    if (!input.trim() || agentStatus === 'thinking') return;
    onSend(input.trim());
    setInput('');
  };

  const suggestions = [
    'What tech stack would you recommend for this project?',
    'How should I structure the database schema?',
    'What are the key user flows I should design first?',
    'Help me write a product requirements doc',
  ];

  return (
    <div className="discuss-panel">
      {messages.length === 0 ? (
        <div className="discuss-empty">
          <MessageSquare size={48} style={{ color: 'var(--border2)' }} />
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 16 }}>Discussion Mode</div>
          <div style={{ fontSize: 13, color: 'var(--text4)', maxWidth: 360, textAlign: 'center', lineHeight: 1.6, marginTop: 8 }}>
            Ask questions, refine requirements, and debate approaches — without generating any code.
          </div>
          <div className="discuss-suggestions">
            {suggestions.map((s, i) => (
              <button key={i} className="discuss-suggestion" onClick={() => { setInput(s); }}>
                <Sparkles size={12} /> {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="discuss-messages" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`discuss-msg ${msg.role}`}>
              <div className={`discuss-avatar ${msg.role}`}>
                {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
              </div>
              <div className="discuss-bubble">
                <div className="discuss-name">
                  {msg.role === 'assistant' ? 'MaterialFlow AI' : 'You'}
                  {msg.role === 'assistant' && <span className="model-tag" style={{ marginLeft: 6 }}>Advisor</span>}
                </div>
                <div className="discuss-text">{msg.content}</div>
              </div>
            </div>
          ))}
          {agentStatus === 'thinking' && (
            <div className="discuss-msg assistant">
              <div className="discuss-avatar assistant"><Bot size={14} /></div>
              <div className="discuss-bubble">
                <div className="discuss-typing"><span /><span /><span /></div>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="discuss-input-area">
        <input
          className="discuss-input"
          placeholder="Ask a question about your project..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button className="discuss-send" onClick={handleSubmit} disabled={!input.trim() || agentStatus === 'thinking'}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
