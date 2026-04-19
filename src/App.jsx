import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProjectTabs from './components/ProjectTabs';
import ChatPanel from './components/ChatPanel';
import WorkbenchPanel from './components/WorkbenchPanel';
import StatusBar from './components/StatusBar';
import DeployFab from './components/DeployFab';
import DeployModal from './components/DeployModal';
import SettingsPanel from './components/SettingsPanel';
import NewProjectModal from './components/NewProjectModal';
import PlanPanel from './components/PlanPanel';
import DiscussPanel from './components/DiscussPanel';
import { ToastContainer, toast } from './components/Toast';
import { ConfirmDialog } from './components/ConfirmDialog';
import ErrorBoundary from './components/ErrorBoundary';
import { generateCode } from './engine/codeGenerator';
import { streamGenerate, parseFiles, buildPreviewHTML, calculateCredits, checkBackendHealth } from './engine/streamEngine';
import { createProject, saveProjects, loadProjects, forkProject, exportProjectAsHTML, loadSettings, saveSettings } from './engine/projectStore';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const MODELS = [
  { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Anthropic', badge: 'Best', speed: 'Fast' },
  { id: 'claude-opus-4', name: 'Claude Opus 4', provider: 'Anthropic', badge: 'Powerful', speed: 'Deep' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', badge: '', speed: 'Fast' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', badge: 'New', speed: 'Fastest' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', badge: 'Free', speed: 'Budget' },
  { id: 'llama-4-maverick', name: 'Llama 4 Maverick', provider: 'Meta', badge: 'Open', speed: 'Open' },
];

export default function App() {
  const [projects, setProjects] = useState(() => {
    const saved = loadProjects();
    return saved.length > 0 ? saved : [createProject('Untitled Project')];
  });
  const [activeProjectId, setActiveProjectId] = useState(() => projects[0]?.id);
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [platform, setPlatform] = useState('web');
  const [mode, setMode] = useState('build');
  const [activeWbTab, setActiveWbTab] = useState('preview');
  const [showDeploy, setShowDeploy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [chatWidth, setChatWidth] = useState(420);
  const [agentStatus, setAgentStatus] = useState('idle');
  const [agentAction, setAgentAction] = useState('');
  const [inspectMode, setInspectMode] = useState(false);
  const [inspectContext, setInspectContext] = useState(null);
  const [settings, setSettings] = useState(() => loadSettings());
  const [theme, setTheme] = useState(() => settings.appearance?.theme || 'dark');

  // Deployment state
  const [deployedUrl, setDeployedUrl] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [previewErrors, setPreviewErrors] = useState([]);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState(null);

  const resizing = useRef(false);
  const activeStreamRef = useRef(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  // Check backend on mount — only poll when backend was last seen online
  useEffect(() => {
    let interval = null;

    const check = async () => {
      const online = await checkBackendHealth();
      setBackendOnline(online);
      // If backend is online, poll every 60s; if offline, stop polling to avoid proxy error spam
      if (online && !interval) {
        interval = setInterval(async () => {
          const stillOnline = await checkBackendHealth();
          setBackendOnline(stillOnline);
          if (!stillOnline && interval) {
            clearInterval(interval);
            interval = null;
          }
        }, 60000);
      }
    };

    check();
    return () => { if (interval) clearInterval(interval); };
  }, []);

  // Theme sync to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, theme: next } }));
  }, [theme]);

  // Auto-save
  useEffect(() => {
    const t = setTimeout(() => saveProjects(projects), 500);
    return () => clearTimeout(t);
  }, [projects]);
  useEffect(() => { saveSettings(settings); }, [settings]);

  // Project helpers
  const updateProject = useCallback((id, updates) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p));
  }, []);

  const addProject = useCallback((name = 'New Project', opts = {}) => {
    const proj = createProject(name);
    if (opts.database) proj.database = true;
    if (opts.auth) proj.auth = true;
    if (opts.payments) proj.payments = true;
    if (opts.github) proj.github = opts.github;
    setProjects(prev => [...prev, proj]);
    setActiveProjectId(proj.id);
    setShowSettings(false);
    setShowNewProject(false);
  }, []);

  const closeProject = useCallback((id) => {
    setProjects(prev => {
      const next = prev.filter(p => p.id !== id);
      if (next.length === 0) {
        const np = createProject('Untitled Project');
        setActiveProjectId(np.id);
        return [np];
      }
      if (activeProjectId === id) setActiveProjectId(next[next.length - 1].id);
      return next;
    });
  }, [activeProjectId]);

  const handleFork = useCallback(() => {
    if (!activeProject) return;
    const forked = forkProject(activeProject);
    setProjects(prev => [...prev, forked]);
    setActiveProjectId(forked.id);
  }, [activeProject]);

  const handleSave = useCallback(() => {
    saveProjects(projects);
    toast('Project saved', 'success');
  }, [projects]);

  const handleExport = useCallback(async () => {
    if (!activeProject) return;
    const projectFiles = activeProject.files || {};
    const hasFiles = Object.keys(projectFiles).length > 0;

    if (hasFiles) {
      const zip = new JSZip();
      Object.entries(projectFiles).forEach(([path, content]) => {
        zip.file(path, content);
      });
      if (activeProject.html && !projectFiles['index.html']) {
        zip.file('index.html', activeProject.html);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const slug = (activeProject.name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      saveAs(blob, `${slug}.zip`);
      toast(`Exported ${Object.keys(projectFiles).length} files as ZIP`, 'success');
    } else if (activeProject.html) {
      exportProjectAsHTML(activeProject);
      toast('Exported as HTML', 'success');
    }
  }, [activeProject]);

  const handleDeleteProject = useCallback((id) => {
    setConfirmDialog({
      title: 'Delete Project',
      message: 'Delete this project? This cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: () => {
        setProjects(prev => {
          const next = prev.filter(p => p.id !== id);
          if (next.length === 0) {
            const np = createProject('Untitled Project');
            setActiveProjectId(np.id);
            return [np];
          }
          if (activeProjectId === id) setActiveProjectId(next[next.length - 1].id);
          return next;
        });
        toast('Project deleted', 'info');
        setConfirmDialog(null);
      },
    });
  }, [activeProjectId]);

  const handleRename = useCallback((newName) => {
    if (!newName.trim()) return;
    updateProject(activeProjectId, { name: newName.trim() });
  }, [activeProjectId, updateProject]);

  const handleCodeChange = useCallback((fileName, newContent) => {
    if (!activeProject) return;
    const updatedFiles = { ...(activeProject.files || {}), [fileName]: newContent };
    // Re-build preview HTML from all updated files
    const previewHtml = buildPreviewHTML(updatedFiles);
    updateProject(activeProjectId, { files: updatedFiles, html: previewHtml });
  }, [activeProject, activeProjectId, updateProject]);

  // Discuss mode state
  const [discussMessages, setDiscussMessages] = useState([]);

  // Helper: get current API key
  const getApiKey = useCallback(() => {
    const anthropicKey = settings.apiKeys?.find(k => k.provider === 'Anthropic');
    return anthropicKey?.key || '';
  }, [settings.apiKeys]);

  // Resize
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    resizing.current = true;
    const startX = e.clientX;
    const startWidth = chatWidth;
    const onMove = (ev) => { if (resizing.current) setChatWidth(Math.max(320, Math.min(700, startWidth + (ev.clientX - startX)))); };
    const onUp = () => { resizing.current = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); document.body.style.cursor = ''; document.body.style.userSelect = ''; };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [chatWidth]);

  // AI generation — real streaming with fallback to templates
  const handleSend = useCallback((text) => {
    if (!text.trim() || agentStatus === 'thinking' || agentStatus === 'writing' || agentStatus === 'streaming') return;
    if (settings.credits <= 0) return;

    const userMsg = { id: Date.now(), role: 'user', content: text };
    const msgs = [...(activeProject?.messages || []), userMsg];
    updateProject(activeProjectId, { messages: msgs });
    setPreviewErrors([]);
    setStreamingText('');

    // Get API key from settings
    const anthropicKey = settings.apiKeys?.find(k => k.provider === 'Anthropic');

    if (anthropicKey?.key && backendOnline) {
      // --- REAL STREAMING MODE ---
      setAgentStatus('thinking');
      setAgentAction('Connecting to Claude...');

      const history = msgs.map(m => ({ role: m.role, content: m.content }));

      activeStreamRef.current = streamGenerate({
        messages: history,
        apiKey: anthropicKey.key,
        model: selectedModel.id || 'claude-sonnet-4-6',
        onText: (chunk, fullText) => {
          setAgentStatus('streaming');
          setAgentAction('Generating code...');
          setStreamingText(fullText);
        },
        onDone: (result) => {
          activeStreamRef.current = null;

          const slug = (Object.keys(result.files)[0] || 'app').replace(/\.[^.]+$/, '').replace(/\//g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'app';
          const title = result.summary?.match(/built.*?\*\*(.+?)\*\*/)?.[1] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Generated App';

          const aiResponse = {
            id: Date.now() + 1,
            role: 'assistant',
            model: selectedModel.name,
            content: result.summary || `Generated ${result.fileNames.length} files: ${result.fileNames.join(', ')}`,
            artifact: {
              title,
              files: result.fileNames.map(f => ({ name: f, language: f.split('.').pop() })),
              status: 'complete',
            },
            tokenUsage: {
              input: result.inputTokens,
              output: result.outputTokens,
              creditsUsed: result.creditsUsed,
            },
          };

          updateProject(activeProjectId, {
            messages: [...msgs, aiResponse],
            html: result.html,
            name: title,
            files: result.files,
          });

          setDeployedUrl(`${slug}.materialflow.app`);
          setGithubRepo(`materialflow/${slug}`);
          setSettings(prev => ({ ...prev, credits: Math.max(0, prev.credits - result.creditsUsed) }));
          setAgentStatus('done');
          setAgentAction(`Built with ${result.inputTokens + result.outputTokens} tokens`);
          setActiveWbTab('preview');
          setStreamingText('');

          setTimeout(() => { setAgentStatus('idle'); setAgentAction(''); }, 5000);
        },
        onError: (error) => {
          activeStreamRef.current = null;
          setAgentStatus('idle');
          setAgentAction('');
          setStreamingText('');

          const errorMsg = {
            id: Date.now() + 1,
            role: 'assistant',
            model: selectedModel.name,
            content: `Build failed: ${error}\n\nFalling back to template engine...`,
          };
          updateProject(activeProjectId, { messages: [...msgs, errorMsg] });

          // Fall back to template engine
          handleTemplateFallback(text, msgs);
        },
        onStatus: (status) => {
          if (status === 'connecting') {
            setAgentStatus('thinking');
            setAgentAction('Connecting to API...');
          }
        },
      });
    } else {
      // --- TEMPLATE FALLBACK MODE ---
      handleTemplateFallback(text, msgs);
    }
  }, [agentStatus, activeProject, activeProjectId, selectedModel, platform, settings, backendOnline, updateProject]);

  // Template-based fallback (no API key or backend offline)
  const handleTemplateFallback = useCallback((text, msgs) => {
    setAgentStatus('thinking');
    setAgentAction('Analyzing prompt...');

    setTimeout(() => {
      setAgentStatus('writing');
      setAgentAction('Generating code...');

      setTimeout(() => {
        setAgentStatus('running');
        setAgentAction('Building & validating...');

        const result = generateCode(text);
        const creditCost = result.templateId === 'custom' ? 10 : 5;

        setTimeout(() => {
          const aiResponse = {
            id: Date.now() + 1,
            role: 'assistant',
            model: selectedModel.name,
            content: buildResponseText(result, platform),
            artifact: {
              title: result.title,
              files: getArtifactFiles(result.templateId, platform),
              status: 'running',
            },
          };

          const slug = result.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          updateProject(activeProjectId, {
            messages: [...msgs, aiResponse],
            html: result.html,
            name: result.title,
          });
          setDeployedUrl(`${slug}.materialflow.app`);
          setGithubRepo(`materialflow/${slug}`);

          setSettings(prev => ({ ...prev, credits: Math.max(0, prev.credits - creditCost) }));
          setAgentStatus('done');
          setAgentAction('Build complete');
          setActiveWbTab('preview');

          setTimeout(() => { setAgentStatus('idle'); setAgentAction(''); }, 3000);
        }, 800);
      }, 1500 + Math.random() * 1000);
    }, 1000 + Math.random() * 800);
  }, [activeProjectId, selectedModel, platform, updateProject]);

  const handleTemplateClick = useCallback((template) => { handleSend(template.prompt); }, [handleSend]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // Ctrl/Cmd+S — Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Ctrl/Cmd+N — New project
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowNewProject(true);
      }
      // Ctrl/Cmd+E — Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExport();
      }
      // Escape — Close modals/panels
      if (e.key === 'Escape') {
        if (confirmDialog) { setConfirmDialog(null); return; }
        if (showNewProject) { setShowNewProject(false); return; }
        if (showDeploy) { setShowDeploy(false); return; }
        if (showSettings) { setShowSettings(false); return; }
        if (showModelSelector) { setShowModelSelector(false); return; }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave, handleExport, confirmDialog, showNewProject, showDeploy, showSettings, showModelSelector]);

  return (
    <>
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        projectName={activeProject?.name || 'Untitled'}
        credits={settings.credits}
        onSave={handleSave}
        onFork={handleFork}
        onExport={handleExport}
        onSettings={() => setShowSettings(!showSettings)}
        showSettings={showSettings}
        deployedUrl={deployedUrl}
        githubRepo={githubRepo}
        theme={theme}
        onToggleTheme={toggleTheme}
        onRename={handleRename}
      />
      <ProjectTabs
        projects={projects}
        activeId={activeProjectId}
        onSelect={(id) => { setActiveProjectId(id); setShowSettings(false); }}
        onClose={closeProject}
        onAdd={() => setShowNewProject(true)}
        onDelete={handleDeleteProject}
      />
      <div className="workspace">
        <Sidebar open={sidebarOpen} projects={projects} activeId={activeProjectId} onSelectProject={setActiveProjectId} onNewProject={() => setShowNewProject(true)} />
        <div className="main-content">
          <div className="mode-bar">
            {[
              { id: 'build', icon: 'construction', label: 'Build' },
              { id: 'plan', icon: 'map', label: 'Plan' },
              { id: 'discuss', icon: 'forum', label: 'Discuss' },
            ].map(m => (
              <button key={m.id} className={`mode-tab ${mode === m.id ? 'active' : ''}`} onClick={() => setMode(m.id)}>
                <span className="material-symbols-outlined">{m.icon}</span>{m.label}
              </button>
            ))}
            <div className="mode-bar-spacer" />
            <div className="platform-toggle">
              <button className={`platform-option ${platform === 'web' ? 'active' : ''}`} onClick={() => setPlatform('web')}>
                <span className="material-symbols-outlined">monitor</span>Web
              </button>
              <button className={`platform-option ${platform === 'mobile' ? 'active' : ''}`} onClick={() => setPlatform('mobile')}>
                <span className="material-symbols-outlined">smartphone</span>Mobile
              </button>
            </div>
          </div>
          <div className="panel-split">
            {mode === 'plan' ? (
              <PlanPanel
                onSend={handleSend}
                agentStatus={agentStatus}
                apiKey={getApiKey()}
                backendOnline={backendOnline}
                selectedModel={selectedModel}
              />
            ) : mode === 'discuss' ? (
              <DiscussPanel
                messages={discussMessages}
                onSend={(text) => {}}
                selectedModel={selectedModel}
                agentStatus={agentStatus}
                apiKey={getApiKey()}
                backendOnline={backendOnline}
                onStreamingMessage={(msgs) => setDiscussMessages(msgs)}
              />
            ) : (
              <ChatPanel
                messages={activeProject?.messages || []}
                agentStatus={agentStatus}
                agentAction={agentAction}
                onSend={handleSend}
                onTemplateClick={handleTemplateClick}
                mode={mode}
                platform={platform}
                width={chatWidth}
                selectedModel={selectedModel}
                onModelClick={() => setShowModelSelector(!showModelSelector)}
                showModelSelector={showModelSelector}
                models={MODELS}
                onModelSelect={(m) => { setSelectedModel(m); setShowModelSelector(false); }}
                credits={settings.credits}
                inspectContext={inspectContext}
                onClearInspect={() => setInspectContext(null)}
              />
            )}
            <div className="resize-handle" onMouseDown={handleResizeStart} />
            {showSettings ? (
              <SettingsPanel settings={settings} onUpdate={setSettings} onClose={() => setShowSettings(false)} />
            ) : (
              <WorkbenchPanel
                activeTab={activeWbTab}
                onTabChange={setActiveWbTab}
                html={activeProject?.html || ''}
                files={activeProject?.files || {}}
                platform={platform}
                hasContent={(activeProject?.messages?.length || 0) > 0}
                agentStatus={agentStatus}
                deployedUrl={deployedUrl}
                githubRepo={githubRepo}
                previewErrors={previewErrors}
                onFixError={(err) => handleSend(`Fix this error: ${err}`)}
                streamingText={streamingText}
                onCodeChange={handleCodeChange}
                theme={theme}
                inspectMode={inspectMode}
                onToggleInspect={() => setInspectMode(!inspectMode)}
                onInspectSelect={(ctx) => { setInspectContext(ctx); setInspectMode(false); }}
              />
            )}
          </div>
        </div>
      </div>
      <StatusBar platform={platform} mode={mode} model={selectedModel} agentStatus={agentStatus} agentAction={agentAction} credits={settings.credits} deployedUrl={deployedUrl} />
      {(activeProject?.html) && <DeployFab onClick={() => setShowDeploy(true)} />}
      {showDeploy && <DeployModal onClose={() => setShowDeploy(false)} platform={platform} projectName={activeProject?.name} />}
      {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} onCreate={addProject} />}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
      <ToastContainer />
    </>
  );
}

function buildResponseText(result, platform) {
  const pl = platform === 'mobile' ? 'React Native + Expo' : 'React + Vite + TypeScript';
  return `I've built your **${result.title}** with ${pl}. Here's what's included:\n\n${getFeatureList(result.templateId)}\n\nThe app is live in the preview panel. Auto-deployed to **${result.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.materialflow.app** and committed to GitHub.`;
}

function getFeatureList(id) {
  const l = {
    gym: '- **Dashboard** with workout stats, streak counter, and calorie tracking\n- **Workout cards** with exercises, sets, and duration\n- **Bottom navigation** with Home, Workouts, Progress, Profile\n- **Floating action button** for quick workout logging\n- **Dark theme** with indigo/purple gradient accents\n- **Supabase database** auto-provisioned for data persistence\n- **Auth** with email + Google OAuth scaffolded',
    dashboard: '- **KPI cards** for revenue, users, conversion, sessions\n- **Revenue chart** with monthly bar graph\n- **Transaction table** with status badges\n- **Sidebar navigation** with icon menu\n- **Row-level security** configured for multi-tenant data\n- **Real-time subscriptions** for live dashboard updates',
    todo: '- **Kanban board** with To Do, In Progress, Done columns\n- **Task cards** with tags, descriptions, due dates\n- **Color-coded labels** for categories\n- **Drag-and-drop** reordering\n- **Database** with tasks, columns, and user tables',
    ecommerce: '- **Product grid** with images, prices, add-to-cart\n- **Shopping cart** with item count badge\n- **Stripe checkout** integration scaffolded\n- **Filter bar** with category tabs\n- **Payment webhooks** for order fulfillment\n- **Supabase storage** for product images',
    landing: '- **Hero section** with gradient headline and dual CTAs\n- **Feature cards** with icons\n- **Navigation bar** with logo and links\n- **Social proof** section\n- **Responsive** mobile-first layout',
    weather: '- **Current conditions** with temperature display\n- **Hourly forecast** with horizontal scroll\n- **7-day forecast** with highs/lows\n- **Detail cards** for humidity, wind, UV\n- **Location search** with geolocation API',
    chat: '- **Conversation list** with avatars, online status, unread counts\n- **Message thread** with sent/received bubbles\n- **Typing indicator** with animated dots\n- **Supabase Realtime** for live messaging\n- **Auth** with user profiles and presence',
    custom: '- **Responsive layout** with header and content\n- **Feature cards** in grid layout\n- **Call-to-action** with gradient styling\n- **Dark theme** with strong contrast\n- **Mobile-friendly** responsive design',
  };
  return l[id] || l.custom;
}

function getArtifactFiles(id, platform) {
  if (platform === 'mobile') return ['App.tsx', 'app.json', 'screens/HomeScreen.tsx', 'components/Card.tsx', 'styles/theme.ts', 'lib/supabase.ts'];
  const m = {
    gym: ['src/App.tsx', 'src/pages/Dashboard.tsx', 'src/components/WorkoutCard.tsx', 'src/hooks/useAuth.ts', 'src/lib/supabase.ts', 'supabase/migrations/001_init.sql'],
    dashboard: ['src/App.tsx', 'src/pages/Dashboard.tsx', 'src/components/KPICard.tsx', 'src/components/Chart.tsx', 'src/lib/supabase.ts'],
    todo: ['src/App.tsx', 'src/pages/Board.tsx', 'src/components/TaskCard.tsx', 'src/hooks/useTasks.ts', 'src/lib/supabase.ts'],
    ecommerce: ['src/App.tsx', 'src/pages/Products.tsx', 'src/components/ProductCard.tsx', 'src/hooks/useCart.ts', 'src/lib/stripe.ts', 'api/webhooks/stripe.ts'],
    landing: ['src/App.tsx', 'src/sections/Hero.tsx', 'src/sections/Features.tsx', 'src/components/Button.tsx', 'src/styles/index.css'],
    weather: ['src/App.tsx', 'src/components/CurrentWeather.tsx', 'src/components/Forecast.tsx', 'src/hooks/useWeather.ts'],
    chat: ['src/App.tsx', 'src/pages/Chat.tsx', 'src/components/MessageBubble.tsx', 'src/hooks/useMessages.ts', 'src/lib/supabase.ts'],
    custom: ['src/App.tsx', 'src/components/Layout.tsx', 'src/components/Card.tsx', 'src/styles/index.css', 'package.json'],
  };
  return m[id] || m.custom;
}
