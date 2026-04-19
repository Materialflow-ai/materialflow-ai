import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import { streamDiscuss } from '../engine/streamEngine.js';

export default function DiscussPanel({ messages = [], onSend, selectedModel, agentStatus, apiKey, backendOnline, onStreamingMessage }) {
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState(messages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const scrollRef = useRef(null);
  const streamRef = useRef(null);

  // Sync external messages
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [localMessages, streamingText]);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isStreaming || agentStatus === 'thinking') return;

    const userMsg = { role: 'user', content: input.trim() };
    const newMsgs = [...localMessages, userMsg];
    setLocalMessages(newMsgs);
    setInput('');

    // If we have an API key and backend is online, use real AI
    if (apiKey && backendOnline) {
      setIsStreaming(true);
      setStreamingText('');

      try {
        streamRef.current = streamDiscuss({
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
          apiKey,
          model: selectedModel?.id || 'claude-sonnet-4-6',
          onText: (chunk, fullText) => {
            setStreamingText(fullText);
          },
          onDone: (result) => {
            streamRef.current = null;
            const aiResponse = {
              role: 'assistant',
              content: result.fullText,
            };
            const finalMsgs = [...newMsgs, aiResponse];
            setLocalMessages(finalMsgs);
            setIsStreaming(false);
            setStreamingText('');
            // Notify parent
            onStreamingMessage?.(finalMsgs);
          },
          onError: (err) => {
            streamRef.current = null;
            const errorMsg = {
              role: 'assistant',
              content: `I encountered an error: ${err}\n\nFalling back to local mode.`,
            };
            const finalMsgs = [...newMsgs, errorMsg];
            setLocalMessages(finalMsgs);
            setIsStreaming(false);
            setStreamingText('');
            onStreamingMessage?.(finalMsgs);
          },
          onStatus: () => {},
        });
      } catch (e) {
        // Fallback to mock
        handleMockResponse(newMsgs, input.trim());
      }
    } else {
      // Mock fallback
      handleMockResponse(newMsgs, input.trim());
    }
  }, [input, localMessages, isStreaming, agentStatus, apiKey, backendOnline, selectedModel, onStreamingMessage]);

  const handleMockResponse = (msgs, text) => {
    setIsStreaming(true);
    setTimeout(() => {
      let responseContent;
      if (text.includes('stack')) {
        responseContent = "Great question! Here\u2019s my recommendation:\n\n**Frontend:** React + Vite + TypeScript for fast development with type safety.\n\n**Backend:** Supabase gives you PostgreSQL + Auth + Storage with a generous free tier and auto-generated APIs.\n\n**Styling:** Tailwind CSS for rapid prototyping, or vanilla CSS for maximum control.\n\n**Key benefits:**\n- Real-time subscriptions out of the box\n- Row-level security for multi-tenant data\n- Edge functions for serverless compute\n\nWant me to elaborate on any specific aspect?";
      } else if (text.includes('database')) {
        responseContent = "For your database schema, I'd recommend starting with these core tables:\n\n- **users** — id, email, name, avatar, created_at\n- **projects** — id, user_id, name, status, created_at\n- **conversations** — id, project_id, messages (JSONB)\n\nUse PostgreSQL with Supabase for:\n- Auto-generated REST APIs\n- Real-time subscriptions\n- Row-level security policies\n\nWant me to design the migration files?";
      } else {
        responseContent = "That's a thoughtful question. Here's my advice:\n\n**Start with the core user flow** — the primary action your users will take. Build that end-to-end before adding secondary features.\n\n**Key principles:**\n- Validate the main value proposition first\n- Ship an MVP within 1-2 weeks\n- Use analytics to guide feature priority\n- Keep the tech stack simple initially\n\nWant me to help break this down into milestones?";
      }

      const aiResponse = { role: 'assistant', content: responseContent };
      const finalMsgs = [...msgs, aiResponse];
      setLocalMessages(finalMsgs);
      setIsStreaming(false);
      onStreamingMessage?.(finalMsgs);
    }, 1500);
  };

  const suggestions = [
    'What tech stack would you recommend for this project?',
    'How should I structure the database schema?',
    'What are the key user flows I should design first?',
    'Help me write a product requirements doc',
  ];

  return (
    <div className="discuss-panel">
      {localMessages.length === 0 && !isStreaming ? (
        <div className="discuss-empty">
          <MessageSquare size={48} style={{ color: 'var(--border2)' }} />
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 16 }}>Discussion Mode</div>
          <div style={{ fontSize: 13, color: 'var(--text4)', maxWidth: 360, textAlign: 'center', lineHeight: 1.6, marginTop: 8 }}>
            Ask questions, refine requirements, and debate approaches — without generating any code.
            {apiKey && backendOnline
              ? <span style={{ display: 'block', marginTop: 6, color: 'var(--green)', fontSize: 11 }}>✓ AI-powered discussion active</span>
              : <span style={{ display: 'block', marginTop: 6, color: 'var(--text4)', fontSize: 11 }}>Add API key in Settings for AI discussions</span>
            }
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
          {localMessages.map((msg, i) => (
            <div key={i} className={`discuss-msg ${msg.role}`}>
              <div className={`discuss-avatar ${msg.role}`}>
                {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
              </div>
              <div className="discuss-bubble">
                <div className="discuss-name">
                  {msg.role === 'assistant' ? 'MaterialFlow AI' : 'You'}
                  {msg.role === 'assistant' && (
                    <span className="model-tag" style={{ marginLeft: 6 }}>
                      {apiKey && backendOnline ? selectedModel?.name || 'Claude' : 'Advisor'}
                    </span>
                  )}
                </div>
                <div className="discuss-text">{renderMarkdown(msg.content)}</div>
              </div>
            </div>
          ))}
          {isStreaming && (
            <div className="discuss-msg assistant">
              <div className="discuss-avatar assistant"><Bot size={14} /></div>
              <div className="discuss-bubble">
                <div className="discuss-name">
                  MaterialFlow AI
                  <span className="model-tag" style={{ marginLeft: 6 }}>
                    {streamingText ? 'Streaming' : 'Thinking'}
                  </span>
                </div>
                {streamingText ? (
                  <div className="discuss-text">{renderMarkdown(streamingText)}</div>
                ) : (
                  <div className="discuss-typing"><span /><span /><span /></div>
                )}
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
        <button className="discuss-send" onClick={handleSubmit} disabled={!input.trim() || isStreaming}>
          {isStreaming ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}

// Simple markdown renderer for discuss messages
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let para = [];

  const flush = () => {
    if (para.length) {
      elements.push(<p key={elements.length}>{renderInline(para.join(' '))}</p>);
      para = [];
    }
  };

  lines.forEach((line, i) => {
    if (!line.trim()) { flush(); }
    else if (line.startsWith('- ') || line.startsWith('• ')) {
      flush();
      elements.push(
        <div key={`li-${i}`} style={{ display: 'flex', gap: 8, paddingLeft: 4, marginBottom: 4 }}>
          <span style={{ color: 'var(--accent)', flexShrink: 0 }}>•</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      );
    } else { para.push(line); }
  });
  flush();
  return elements;
}

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} style={{ color: 'var(--text)' }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9em', background: 'var(--card2)', padding: '1px 5px', borderRadius: 4, color: 'var(--accent)' }}>{part.slice(1, -1)}</code>;
    return part;
  });
}
