// MaterialFlow AI — Project Persistence Layer
// localStorage-based save/load/fork/export

const STORAGE_KEY = 'materialflow_projects';
const SETTINGS_KEY = 'materialflow_settings';

export function createProject(name = 'Untitled Project') {
  return {
    id: generateId(),
    name,
    messages: [],
    html: '',
    code: '',
    platform: 'web',
    model: 'claude-sonnet-4',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function saveProjects(projects) {
  try {
    const data = projects.map(p => ({
      ...p,
      updatedAt: Date.now(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save projects:', e);
  }
}

export function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load projects:', e);
    return [];
  }
}

export function forkProject(project) {
  return {
    ...JSON.parse(JSON.stringify(project)),
    id: generateId(),
    name: `${project.name} (Fork)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function exportProjectAsHTML(project) {
  if (!project.html) return;
  const blob = new Blob([project.html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugify(project.name)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return getDefaultSettings();
    return { ...getDefaultSettings(), ...JSON.parse(raw) };
  } catch (e) {
    return getDefaultSettings();
  }
}

export function getDefaultSettings() {
  return {
    apiKeys: [],
    appearance: {
      theme: 'dark',
      fontSize: 14,
      editorTheme: 'default',
    },
    notifications: {
      buildComplete: true,
      deployComplete: true,
      errorAlerts: true,
    },
    credits: 100,
    profile: {
      name: 'Developer',
      email: '',
      avatar: '',
    },
  };
}

function generateId() {
  return `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
