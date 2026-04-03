/**
 * Serendipity Engine — Project Store (Zustand)
 *
 * Manages project CRUD, file operations, and phase progress.
 * Persists to IndexedDB via Dexie.
 */
import { create } from 'zustand';
import db from '../lib/db';
import { v4 as uuid } from 'uuid';
import { PROJECT_FILE_TEMPLATE, PHASES } from '../lib/constants';

/**
 * Create a slug from a title
 */
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    || 'untitled';
}

/**
 * Calculate phase progress from project files and answers
 */
function computePhaseProgress(files, phaseAnswers = {}) {
  return PHASES.map(phase => {
    const answers = phaseAnswers[phase.key] || {};
    const totalQuestions = answers._total || 0;
    const answered = Object.keys(answers).filter(k => !k.startsWith('_') && answers[k]).length;

    let pct = 0;
    if (totalQuestions > 0) {
      pct = Math.round((answered / totalQuestions) * 100);
    }

    // Check for file existence as additional progress signal
    switch (phase.key) {
      case 'author':
        if (files['author.md']?.trim()) pct = Math.max(pct, 100);
        break;
      case 'narrator':
        if (files['narrator.md']?.trim()) pct = Math.max(pct, 100);
        break;
      case 'world':
        if (files['world/world-building.md']?.trim()) pct = Math.max(pct, 50);
        break;
      case 'characters': {
        const charFiles = Object.keys(files).filter(
          f => f.startsWith('characters/') && f !== 'characters/questions-answered.md' && f.endsWith('.md')
        );
        if (charFiles.length > 0) pct = Math.max(pct, Math.min(charFiles.length * 20, 100));
        break;
      }
      case 'relationships':
        if (files['relationships/questions-answered.md']?.trim()) pct = Math.max(pct, 50);
        break;
      case 'story':
        if (files['story/arc.md']?.trim() && files['outline.md']?.trim()) pct = Math.max(pct, 80);
        else if (files['story/arc.md']?.trim() || files['outline.md']?.trim()) pct = Math.max(pct, 40);
        break;
      case 'review':
        if (files['dry-run-audit.md']?.trim()) pct = Math.max(pct, 100);
        break;
      case 'execution': {
        const chapters = Object.keys(files).filter(f => f.match(/^story\/chapter-\d+\.md$/));
        if (chapters.length > 0) pct = Math.max(pct, 10);
        break;
      }
    }

    return {
      ...phase,
      progress: Math.min(pct, 100),
      complete: pct >= 100,
    };
  });
}

/**
 * Compute overall health score (0-5) from dimensions
 */
function computeHealthScore(healthDimensions) {
  if (!healthDimensions) return 0;
  const vals = Object.values(healthDimensions).filter(v => typeof v === 'number');
  if (vals.length === 0) return 0;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

export const useProjectStore = create((set, get) => ({
  projects: [],
  activeProjectId: null,
  activeProject: null,
  files: {},
  phaseProgress: [],
  loading: false,

  /**
   * Load all projects from IndexedDB
   */
  loadProjects: async () => {
    set({ loading: true });
    try {
      const projects = await db.projects.orderBy('updatedAt').reverse().toArray();
      set({ projects, loading: false });
      return projects;
    } catch (err) {
      console.warn('Failed to load projects:', err);
      set({ loading: false });
      return [];
    }
  },

  /**
   * Create a new project
   */
  createProject: async ({
    title = 'Untitled Story',
    medium = 'novel',
    genre = '',
    seed = null,
    metadata = {},
  } = {}) => {
    const project = {
      id: uuid(),
      slug: slugify(title),
      title,
      medium,
      genre,
      seed: seed ? seed.toString() : null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentPhase: 1,
      phaseAnswers: {},
      healthDimensions: {},
      health: 0,
      wordCount: 0,
      wordGoal: 80000,
      contentRating: 'PG-13',
      lastAction: 'Project created.',
      ...metadata,
    };

    // Create default files
    const fileEntries = Object.entries(PROJECT_FILE_TEMPLATE)
      .filter(([path]) => !path.endsWith('/'))
      .map(([path, content]) => ({
        projectId: project.id,
        path,
        content: content || '',
        updatedAt: Date.now(),
      }));

    try {
      await db.projects.add(project);
      await db.projectFiles.bulkAdd(fileEntries);

      set(state => ({
        projects: [project, ...state.projects],
        activeProjectId: project.id,
        activeProject: project,
      }));

      // Load files for new project
      await get().loadProjectFiles(project.id);

      return project;
    } catch (err) {
      console.error('Failed to create project:', err);
      throw err;
    }
  },

  /**
   * Open / set active project
   */
  setActiveProject: async (projectId) => {
    const project = await db.projects.get(projectId);
    if (!project) return null;

    set({ activeProjectId: projectId, activeProject: project });
    await get().loadProjectFiles(projectId);
    return project;
  },

  /**
   * Load all files for a project
   */
  loadProjectFiles: async (projectId) => {
    try {
      const fileRecords = await db.projectFiles.where('projectId').equals(projectId).toArray();
      const files = {};
      for (const f of fileRecords) {
        files[f.path] = f.content;
      }

      const project = get().activeProject;
      const progress = computePhaseProgress(files, project?.phaseAnswers);

      // Compute current phase (first incomplete phase) and sync to project metadata
      const currentPhase = progress.find(p => p.progress < 100)?.num || progress[progress.length - 1]?.num || 1;
      const wordCount = Object.values(files).reduce((sum, content) => {
        if (typeof content === 'string') {
          return sum + content.split(/\s+/).filter(Boolean).length;
        }
        return sum;
      }, 0);

      set({ files, phaseProgress: progress });

      // Persist computed phase and word count to project metadata so Hub cards stay in sync
      if (project && (project.currentPhase !== currentPhase || project.wordCount !== wordCount)) {
        await db.projects.update(projectId, { currentPhase, wordCount, updatedAt: Date.now() });
        set(state => ({
          activeProject: { ...state.activeProject, currentPhase, wordCount },
          projects: state.projects.map(p =>
            p.id === projectId ? { ...p, currentPhase, wordCount } : p
          ),
        }));
      }
    } catch (err) {
      console.warn('Failed to load project files:', err);
    }
  },

  /**
   * Update a file within the active project
   */
  updateFile: async (path, content) => {
    const projectId = get().activeProjectId;
    if (!projectId) return;

    try {
      const existing = await db.projectFiles
        .where('[projectId+path]')
        .equals([projectId, path])
        .first();

      if (existing) {
        await db.projectFiles.update(existing.id, { content, updatedAt: Date.now() });
      } else {
        await db.projectFiles.add({ projectId, path, content, updatedAt: Date.now() });
      }

      // Update local state
      set(state => {
        const newFiles = { ...state.files, [path]: content };
        const project = state.activeProject;
        const progress = computePhaseProgress(newFiles, project?.phaseAnswers);
        return { files: newFiles, phaseProgress: progress };
      });

      // Update project timestamp
      await db.projects.update(projectId, { updatedAt: Date.now() });
    } catch (err) {
      console.warn('Failed to update file:', err);
      // Queue for background sync if the save failed (e.g., quota exceeded, corruption)
      try {
        const { queueSync } = await import('../lib/serviceWorker');
        await queueSync({ type: 'file-save', projectId, path, content });
      } catch (syncErr) {
        // Sync queue unavailable; data is still in local state
      }
    }
  },

  /**
   * Update project metadata
   */
  updateProject: async (updates) => {
    const projectId = get().activeProjectId;
    if (!projectId) return;

    const timestamped = { ...updates, updatedAt: Date.now() };

    try {
      await db.projects.update(projectId, timestamped);
      set(state => ({
        activeProject: { ...state.activeProject, ...timestamped },
        projects: state.projects.map(p =>
          p.id === projectId ? { ...p, ...timestamped } : p
        ),
      }));
    } catch (err) {
      console.warn('Failed to update project:', err);
    }
  },

  /**
   * Delete a project and all its files
   */
  deleteProject: async (projectId) => {
    try {
      await db.projectFiles.where('projectId').equals(projectId).delete();
      await db.sessionLogs.where('projectId').equals(projectId).delete();
      await db.fileHistory.where('projectId').equals(projectId).delete();
      await db.projects.delete(projectId);

      set(state => ({
        projects: state.projects.filter(p => p.id !== projectId),
        activeProjectId: state.activeProjectId === projectId ? null : state.activeProjectId,
        activeProject: state.activeProjectId === projectId ? null : state.activeProject,
        files: state.activeProjectId === projectId ? {} : state.files,
      }));
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  },

  /**
   * Export project as JSON (for ZIP packaging)
   */
  exportProject: async (projectId) => {
    const pid = projectId || get().activeProjectId;
    const project = await db.projects.get(pid);
    const files = await db.projectFiles.where('projectId').equals(pid).toArray();

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      project,
      files: files.map(f => ({ path: f.path, content: f.content })),
    };
  },

  /**
   * Import a project from exported JSON
   */
  importProject: async (data) => {
    const { project, files } = data;
    const newId = uuid();

    const newProject = {
      ...project,
      id: newId,
      slug: slugify(project.title + '-import'),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const newFiles = files.map(f => ({
      projectId: newId,
      path: f.path,
      content: f.content,
      updatedAt: Date.now(),
    }));

    await db.projects.add(newProject);
    await db.projectFiles.bulkAdd(newFiles);

    set(state => ({
      projects: [newProject, ...state.projects],
    }));

    return newProject;
  },

  /**
   * Update phase answers and recompute progress
   */
  updatePhaseAnswers: async (phaseKey, answers) => {
    const project = get().activeProject;
    if (!project) return;

    const updated = {
      ...project.phaseAnswers,
      [phaseKey]: { ...(project.phaseAnswers?.[phaseKey] || {}), ...answers },
    };

    await get().updateProject({ phaseAnswers: updated });

    // Recompute progress
    const files = get().files;
    const progress = computePhaseProgress(files, updated);
    set({ phaseProgress: progress });
  },

  /**
   * Log a session entry
   */
  logSession: async (entry) => {
    const projectId = get().activeProjectId;
    if (!projectId) return;

    await db.sessionLogs.add({
      projectId,
      timestamp: Date.now(),
      ...entry,
    });
  },
}));
