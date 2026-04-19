import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Image, ArrowUp, Copy, ThumbsUp, ThumbsDown, RefreshCw, Sparkles, LayoutDashboard, ShoppingBag, MessageSquare, BarChart3, ListTodo, Music, Dumbbell, CloudSun, Bot, CreditCard } from 'lucide-react';
import ModelSelector from './ModelSelector';
import AgentStatus from './AgentStatus';

const TEMPLATES = [
  { icon: Dumbbell, title: 'Gym Tracker', desc: 'Workout logging & progress', prompt: 'Build a gym tracker app with workout logging, progress charts, and dark mode UI', color: '#818CF8' },
  { icon: ShoppingBag, title: 'E-commerce Store', desc: 'Product catalog & checkout', prompt: 'Build an e-commerce store with product listings, shopping cart, and checkout flow', color: '#FBBF24' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Data visualization & charts', prompt: 'Create a modern analytics dashboard with charts, metrics cards, and data tables', color: '#34D399' },
  { icon: MessageSquare, title: 'Chat App', desc: 'Real-time messaging', prompt: 'Build a chat application with conversations, message bubbles, and online status', color: '#60A5FA' },
  { icon: ListTodo, title: 'Task Manager', desc: 'Kanban boards & tasks', prompt: 'Build a project management app with kanban boards, task cards, and categories', color: '#F87171' },
  { icon: CloudSun, title: 'Weather App', desc: 'Forecasts & conditions', prompt: 'Create a weather app with current conditions, hourly forecast, and 7-day outlook', color: '#38BDF8' },
];

export default function ChatPanel({
  messages, agentStatus, agentAction, onSend, onTemplateClick, mode, platform, width,
  selectedModel, onModelClick, showModelSelector, models, onModelSelect, credits
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, agentStatus]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isWorking = agentStatus === 'thinking' || agentStatus === 'writing' || agentStatus === 'running' || agentStatus === 'streaming';

  return (
    <div className="chat-panel" style={{ width }}>
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-icon">
              <Sparkles size={28} color="white" />
            </div>
            <h2 className="welcome-title">What shall we build?</h2>
            <p className="welcome-sub">
              Describe your {platform === 'mobile' ? 'mobile' : 'web'} app idea and I'll generate
              the full codebase with a live preview instantly.
            </p>
            <div className="template-grid">
              {TEMPLATES.map((t, i) => (
                <div
                  key={i}
                  className="template-card animate-in"
                  onClick={() => onTemplateClick(t)}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="template-card-icon" style={{ color: t.color }}>
                    <t.icon size={20} />
                  </div>
                  <div className="template-card-title">{t.title}</div>
                  <div className="template-card-desc">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={msg.id} className="message animate-in" style={{ animationDelay: `${Math.min(i, 2) * 40}ms` }}>
                <div className={`message-avatar ${msg.role === 'assistant' ? 'ai' : 'user'}`}>
                  {msg.role === 'assistant' ? <Bot size={15} /> : 'Y'}
                </div>
                <div className="message-content">
                  <div className="message-name">
                    {msg.role === 'assistant' ? 'MaterialFlow AI' : 'You'}
                    {msg.role === 'assistant' && <span className="model-tag">{msg.model || selectedModel.name}</span>}
                  </div>
                  <div className="message-text">{renderMarkdown(msg.content)}</div>
                  {msg.artifact && (
                    <div className="artifact-card">
                      <div className="artifact-header">
                        <span className="material-symbols-outlined artifact-icon" style={{ fontSize: 16 }}>deployed_code</span>
                        <span className="artifact-title">{msg.artifact.title}</span>
                        <span className={`artifact-badge ${msg.artifact.status}`}>
                          {msg.artifact.status === 'running' ? 'Live' : msg.artifact.status}
                        </span>
                      </div>
                      <div className="artifact-files">
                        {msg.artifact.files.map((f, fi) => (
                          <div key={fi} className="artifact-file">
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: getFileColor(f) }}>
                              {getFileIcon(f)}
                            </span>
                            {f.name || f}
                          </div>
                        ))}
                      </div>
                      {msg.tokenUsage && (
                        <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border1)', display: 'flex', gap: 12, fontSize: 10, color: 'var(--text4)' }}>
                          <span>In: {msg.tokenUsage.input?.toLocaleString()} tokens</span>
                          <span>Out: {msg.tokenUsage.output?.toLocaleString()} tokens</span>
                          <span style={{ color: 'var(--accent1)', fontWeight: 600 }}>-{msg.tokenUsage.creditsUsed} credits</span>
                        </div>
                      )}
                    </div>
                  )}
                  {msg.role === 'assistant' && (
                    <div className="message-actions">
                      {[
                        { Icon: Copy, title: 'Copy' },
                        { Icon: ThumbsUp, title: 'Good' },
                        { Icon: ThumbsDown, title: 'Bad' },
                        { Icon: RefreshCw, title: 'Retry' },
                      ].map(({ Icon, title }, ai) => (
                        <button key={ai} className="icon-btn" title={title} style={{ width: 28, height: 28 }}>
                          <Icon size={13} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isWorking && (
              <div className="message animate-in">
                <div className="message-avatar ai"><Bot size={15} /></div>
                <div className="message-content">
                  <div className="message-name">
                    MaterialFlow AI <span className="model-tag">{selectedModel.name}</span>
                  </div>
                  <AgentStatus status={agentStatus} action={agentAction} />
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="shimmer-line" style={{ width: '90%' }} />
                    <div className="shimmer-line" style={{ width: '72%' }} />
                    <div className="shimmer-line" style={{ width: '55%' }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input-box">
          <button className="icon-btn" title="Attach file" style={{ width: 30, height: 30 }}>
            <Paperclip size={16} />
          </button>
          <button className="icon-btn" title="Upload image" style={{ width: 30, height: 30 }}>
            <Image size={16} />
          </button>
          <textarea
            className="chat-input"
            placeholder={
              credits <= 0 ? 'No credits remaining...' :
              mode === 'build' ? `Build a ${platform === 'mobile' ? 'mobile' : 'web'} app that...` :
              mode === 'plan' ? 'Plan an implementation for...' :
              'Ask a question...'
            }
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={credits <= 0}
          />
          <div className="chat-input-actions">
            <button className="icon-btn" title="Enhance prompt" style={{ width: 30, height: 30 }}>
              <Sparkles size={16} className="icon-gradient" />
            </button>
            <button
              className="send-btn"
              onClick={handleSubmit}
              disabled={!input.trim() || isWorking || credits <= 0}
              title="Send"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
        <div className="chat-input-hint">
          <span className="chat-input-hint-text">
            {mode === 'build' ? 'Build — generates & runs code' :
             mode === 'plan' ? 'Plan — plans without modifying' :
             'Discuss — conversation only'}
            {credits <= 10 && credits > 0 && <span style={{ color: 'var(--orange)', marginLeft: 8 }}>{credits} credits left</span>}
            {credits <= 0 && <span style={{ color: 'var(--red)', marginLeft: 8 }}>No credits</span>}
          </span>
          <div style={{ position: 'relative' }}>
            <div className="model-selector" onClick={onModelClick}>
              <Bot size={11} />
              {selectedModel?.name}
              <ChevronDownIcon />
            </div>
            {showModelSelector && <ModelSelector models={models} selected={selectedModel} onSelect={onModelSelect} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronDownIcon() {
  return <span className="material-symbols-outlined" style={{ fontSize: 12 }}>keyboard_arrow_down</span>;
}

function getFileIcon(f) {
  const name = typeof f === 'string' ? f : (f?.name || '');
  if (name.endsWith('.tsx') || name.endsWith('.jsx')) return 'code';
  if (name.endsWith('.ts') || name.endsWith('.js')) return 'javascript';
  if (name.endsWith('.css')) return 'palette';
  if (name.endsWith('.json')) return 'data_object';
  if (name.endsWith('.html')) return 'html';
  if (name.endsWith('.sql')) return 'database';
  return 'insert_drive_file';
}
function getFileColor(f) {
  const name = typeof f === 'string' ? f : (f?.name || '');
  if (name.endsWith('.tsx') || name.endsWith('.jsx')) return '#61dafb';
  if (name.endsWith('.ts') || name.endsWith('.js')) return '#f7df1e';
  if (name.endsWith('.css')) return '#ec4899';
  if (name.endsWith('.json')) return '#fbbf24';
  if (name.endsWith('.html')) return '#e44d26';
  if (name.endsWith('.sql')) return '#336791';
  return 'var(--accent)';
}

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
    else if (line.startsWith('- ')) {
      flush();
      elements.push(
        <div key={`li-${i}`} style={{ display: 'flex', gap: 8, paddingLeft: 4, marginBottom: 4 }}>
          <span style={{ color: 'var(--accent)', flexShrink: 0 }}>-</span>
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
      return <code key={i}>{part.slice(1, -1)}</code>;
    return part;
  });
}
