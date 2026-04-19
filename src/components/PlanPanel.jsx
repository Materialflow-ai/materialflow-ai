import React, { useState, useCallback, useRef } from 'react';
import { Map, Layers, Database, Server, FileCode, ArrowRight, Loader2, Sparkles, Box, Globe, Smartphone, AlertTriangle } from 'lucide-react';
import { streamPlan } from '../engine/streamEngine.js';

export default function PlanPanel({ onSend, agentStatus, apiKey, backendOnline, selectedModel }) {
  const [prompt, setPrompt] = useState('');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState('');
  const streamRef = useRef(null);

  const generatePlan = useCallback(async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setStreamingText('');

    // If we have an API key and backend is online, use real AI
    if (apiKey && backendOnline) {
      try {
        streamRef.current = streamPlan({
          messages: [{ role: 'user', content: `Plan this app: ${prompt}` }],
          apiKey,
          model: selectedModel?.id || 'claude-sonnet-4-6',
          onText: (chunk, fullText) => {
            setStreamingText(fullText);
          },
          onDone: (result) => {
            streamRef.current = null;
            if (result.plan) {
              setPlan(result.plan);
            } else {
              // Fallback: try to use raw text as plan
              setPlan(buildLocalPlan(prompt));
            }
            setLoading(false);
            setStreamingText('');
          },
          onError: (err) => {
            streamRef.current = null;
            setError(err);
            // Fallback to local
            setPlan(buildLocalPlan(prompt));
            setLoading(false);
            setStreamingText('');
          },
          onStatus: () => {},
        });
      } catch (e) {
        setPlan(buildLocalPlan(prompt));
        setLoading(false);
      }
    } else {
      // Template fallback
      setTimeout(() => {
        setPlan(buildLocalPlan(prompt));
        setLoading(false);
      }, 1500);
    }
  }, [prompt, apiKey, backendOnline, selectedModel]);

  if (loading) {
    return (
      <div className="plan-panel">
        <div className="plan-loading">
          <Loader2 size={32} className="spin" />
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 12 }}>
            {apiKey && backendOnline ? 'Claude is analyzing your architecture...' : 'Analyzing architecture...'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text4)', marginTop: 4 }}>Building component tree, data flow, and API design</div>
          {streamingText && (
            <div style={{ marginTop: 16, maxWidth: 500, fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', maxHeight: 120, overflow: 'auto', padding: '8px 12px', background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)' }}>
              {streamingText.slice(0, 300)}...
            </div>
          )}
        </div>
      </div>
    );
  }

  if (plan) {
    return (
      <div className="plan-panel">
        <div className="plan-header">
          <Map size={16} />
          <span style={{ fontWeight: 700 }}>Architecture Plan</span>
          {apiKey && backendOnline && <span className="model-tag" style={{ marginLeft: 4 }}>AI-Generated</span>}
          <button className="pill-btn ghost" style={{ marginLeft: 'auto', fontSize: 11 }} onClick={() => { setPlan(null); setError(''); }}>
            New Plan
          </button>
          <button className="pill-btn primary" style={{ fontSize: 11 }} onClick={() => onSend(`Build this app: ${prompt}`)}>
            <ArrowRight size={13} /> Build This
          </button>
        </div>
        {error && (
          <div style={{ padding: '8px 16px', background: 'rgba(242,139,130,.08)', borderBottom: '1px solid rgba(242,139,130,.2)', fontSize: 11, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={12} /> {error} — showing template plan
          </div>
        )}
        {plan.summary && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
            {plan.summary}
          </div>
        )}
        <div className="plan-content">
          <div className="plan-section">
            <div className="plan-section-title"><Layers size={14} /> Components</div>
            <div className="plan-cards">
              {(plan.components || []).map((c, i) => (
                <div key={i} className="plan-card">
                  <div className="plan-card-name">{c.name}</div>
                  <div className="plan-card-desc">{c.purpose}</div>
                  {c.props?.length > 0 && (
                    <div className="plan-card-props">
                      {c.props.map((p, pi) => <span key={pi} className="plan-prop">{p}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="plan-section">
            <div className="plan-section-title"><Database size={14} /> Tech Stack</div>
            <div className="plan-stack">
              {Object.entries(plan.techStack || {}).map(([key, val]) => (
                <div key={key} className="plan-stack-item">
                  <span className="plan-stack-label">{key}</span>
                  <span className="plan-stack-value">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {(plan.apis || []).length > 0 && (
            <div className="plan-section">
              <div className="plan-section-title"><Server size={14} /> API Endpoints</div>
              <div className="plan-apis">
                {plan.apis.map((api, i) => (
                  <div key={i} className="plan-api">
                    <span className={`plan-method ${api.method.toLowerCase()}`}>{api.method}</span>
                    <code>{api.endpoint}</code>
                    <span className="plan-api-desc">{api.purpose}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="plan-section">
            <div className="plan-section-title"><FileCode size={14} /> Estimated Files</div>
            <div className="plan-files">
              {(plan.estimatedFiles || []).map((f, i) => (
                <div key={i} className="plan-file">
                  <FileCode size={12} style={{ color: 'var(--accent1)', flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {plan.keyFeatures && (
            <div className="plan-section">
              <div className="plan-section-title"><Sparkles size={14} /> Key Features</div>
              <div className="plan-files">
                {plan.keyFeatures.map((f, i) => (
                  <div key={i} className="plan-file" style={{ color: 'var(--green)' }}>
                    <span style={{ color: 'var(--green)' }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="plan-panel">
      <div className="plan-empty">
        <Map size={48} style={{ color: 'var(--border2)' }} />
        <div style={{ fontSize: 16, fontWeight: 700, marginTop: 16 }}>Architecture Planner</div>
        <div style={{ fontSize: 13, color: 'var(--text4)', maxWidth: 360, textAlign: 'center', lineHeight: 1.6, marginTop: 8 }}>
          Describe what you want to build and get a complete architecture plan before writing any code.
          {apiKey && backendOnline
            ? <span style={{ display: 'block', marginTop: 6, color: 'var(--green)', fontSize: 11 }}>✓ AI-powered planning active</span>
            : <span style={{ display: 'block', marginTop: 6, color: 'var(--text4)', fontSize: 11 }}>Add API key in Settings for AI-powered plans</span>
          }
        </div>
        <div className="plan-input-area">
          <input
            className="plan-input"
            placeholder="Describe your app idea..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generatePlan()}
          />
          <button className="pill-btn primary" onClick={generatePlan} disabled={!prompt.trim()}>
            <Sparkles size={14} /> Generate Plan
          </button>
        </div>
      </div>
    </div>
  );
}

function buildLocalPlan(prompt) {
  const lower = prompt.toLowerCase();
  const isWeather = lower.includes('weather');
  const isDashboard = lower.includes('dashboard') || lower.includes('analytics');
  const isEcommerce = lower.includes('store') || lower.includes('shop') || lower.includes('ecommerce');
  const isMobile = lower.includes('mobile') || lower.includes('app');

  return {
    summary: `Architecture plan for: "${prompt.slice(0, 80)}"`,
    components: [
      { name: 'App', purpose: 'Root layout with routing and global state', props: [] },
      { name: 'Header', purpose: 'Navigation bar with branding and user menu', props: ['user', 'onLogout'] },
      { name: isWeather ? 'CurrentWeather' : isDashboard ? 'KPIGrid' : 'Hero', purpose: isWeather ? 'Displays current conditions from API' : isDashboard ? 'Key metrics with trend indicators' : 'Primary landing section', props: ['data'] },
      { name: isWeather ? 'HourlyForecast' : isDashboard ? 'ChartPanel' : 'FeatureGrid', purpose: isWeather ? 'Horizontal scroll of hourly predictions' : isDashboard ? 'Interactive data visualizations' : 'Grid of feature cards', props: ['items'] },
      { name: isWeather ? 'DailyForecast' : isDashboard ? 'DataTable' : 'CTASection', purpose: isWeather ? '7-day forecast cards' : isDashboard ? 'Sortable data table' : 'Call-to-action with conversion form', props: ['data'] },
      { name: 'Footer', purpose: 'Links, social icons, copyright', props: [] },
    ],
    techStack: {
      frontend: isMobile ? 'React Native + Expo' : 'React + Vite + TypeScript',
      styling: isMobile ? 'StyleSheet' : 'Tailwind CSS',
      backend: isWeather ? 'Open-Meteo API (free)' : isDashboard ? 'REST API + PostgreSQL' : 'Node.js + Express',
      database: isWeather ? 'None (API-driven)' : 'Supabase (PostgreSQL)',
      hosting: isMobile ? 'Expo EAS + App Stores' : 'Vercel Edge Network',
    },
    apis: isWeather ? [
      { endpoint: '/v1/forecast', method: 'GET', purpose: 'Current + hourly + daily weather data' },
      { endpoint: '/v1/search', method: 'GET', purpose: 'City name geocoding' },
    ] : isDashboard ? [
      { endpoint: '/api/metrics', method: 'GET', purpose: 'Fetch KPI data with date range' },
      { endpoint: '/api/analytics', method: 'GET', purpose: 'Chart data aggregation' },
      { endpoint: '/api/export', method: 'POST', purpose: 'Export report as CSV/PDF' },
    ] : [
      { endpoint: '/api/auth/login', method: 'POST', purpose: 'User authentication' },
      { endpoint: '/api/data', method: 'GET', purpose: 'Fetch main content' },
      { endpoint: '/api/data', method: 'POST', purpose: 'Create new records' },
    ],
    estimatedFiles: [
      'src/App.tsx',
      'src/components/Header.tsx',
      isWeather ? 'src/components/CurrentWeather.tsx' : isDashboard ? 'src/components/KPIGrid.tsx' : 'src/components/Hero.tsx',
      isWeather ? 'src/components/HourlyForecast.tsx' : isDashboard ? 'src/components/ChartPanel.tsx' : 'src/components/FeatureGrid.tsx',
      isWeather ? 'src/hooks/useWeather.ts' : isDashboard ? 'src/hooks/useMetrics.ts' : 'src/hooks/useData.ts',
      'src/styles/index.css',
      'src/utils/api.ts',
      'src/types/index.ts',
    ],
    keyFeatures: [
      'Responsive layout for all screen sizes',
      'Dark/light theme support',
      'Loading states with skeleton UI',
      'Error boundaries with retry logic',
      'Type-safe data fetching',
    ],
  };
}
