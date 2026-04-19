import React, { useState, useCallback } from 'react';
import { Map, Layers, Database, Server, FileCode, ArrowRight, Loader2, Sparkles, Box, Globe, Smartphone } from 'lucide-react';

export default function PlanPanel({ onSend, agentStatus }) {
  const [prompt, setPrompt] = useState('');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const generatePlan = useCallback(() => {
    if (!prompt.trim()) return;
    // In template mode, generate a local plan
    setLoading(true);
    setTimeout(() => {
      setPlan(buildLocalPlan(prompt));
      setLoading(false);
    }, 1500);
  }, [prompt]);

  if (loading) {
    return (
      <div className="plan-panel">
        <div className="plan-loading">
          <Loader2 size={32} className="spin" />
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 12 }}>Analyzing architecture...</div>
          <div style={{ fontSize: 12, color: 'var(--text4)', marginTop: 4 }}>Building component tree, data flow, and API design</div>
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
          <button className="pill-btn ghost" style={{ marginLeft: 'auto', fontSize: 11 }} onClick={() => setPlan(null)}>
            New Plan
          </button>
          <button className="pill-btn primary" style={{ fontSize: 11 }} onClick={() => onSend(`Build this app: ${prompt}`)}>
            <ArrowRight size={13} /> Build This
          </button>
        </div>
        <div className="plan-content">
          <div className="plan-section">
            <div className="plan-section-title"><Layers size={14} /> Components</div>
            <div className="plan-cards">
              {plan.components.map((c, i) => (
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
              {Object.entries(plan.techStack).map(([key, val]) => (
                <div key={key} className="plan-stack-item">
                  <span className="plan-stack-label">{key}</span>
                  <span className="plan-stack-value">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {plan.apis.length > 0 && (
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
              {plan.estimatedFiles.map((f, i) => (
                <div key={i} className="plan-file">
                  <FileCode size={12} style={{ color: 'var(--accent1)', flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
          </div>
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
  };
}
