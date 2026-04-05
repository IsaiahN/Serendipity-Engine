/**
 * Serendipity Engine — Project Store (Zustand)
 *
 * Manages project CRUD, file operations, and phase progress.
 * Persists to IndexedDB via Dexie.
 */
import { create } from 'zustand';
import db from '../lib/db';
import { v4 as uuid } from 'uuid';
import { PROJECT_FILE_TEMPLATE, PHASES, STORY_MEDIUMS } from '../lib/constants';

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
  sessionLog: [],
  loading: false,
  isDirty: false, // Tracks unsaved changes in editor

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
    series = null,
    seed = null,
    metadata = {},
  } = {}) => {
    // Derive default word goal from the medium's upper word range
    const mediumDef = STORY_MEDIUMS.find(m => m.key === medium);
    const defaultWordGoal = mediumDef ? mediumDef.wordRange[1] : 80000;

    const project = {
      id: uuid(),
      slug: slugify(title),
      title,
      medium,
      genre,
      series,
      seriesOrder: null,
      seriesRole: null,
      seed: seed ? seed.toString() : null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentPhase: 1,
      phaseAnswers: {},
      healthDimensions: {},
      health: 0,
      wordCount: 0,
      wordGoal: defaultWordGoal,
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
   * Set dirty state (unsaved changes)
   */
  setDirty: (isDirty) => {
    set({ isDirty });
  },

  /**
   * Mark project as clean (all changes saved)
   */
  markClean: () => {
    set({ isDirty: false });
  },

  /**
   * Open / set active project
   */
  setActiveProject: async (projectId) => {
    const project = await db.projects.get(projectId);
    if (!project) return null;

    set({ activeProjectId: projectId, activeProject: project });
    // Mark clean when switching projects (all previous changes should be saved)
    set({ isDirty: false });
    await get().loadProjectFiles(projectId);
    await get().loadSessionLog(projectId);
    return project;
  },

  /**
   * Load session log entries for a project from IndexedDB
   */
  loadSessionLog: async (projectId) => {
    try {
      const logs = await db.sessionLogs
        .where('projectId')
        .equals(projectId)
        .reverse()
        .sortBy('timestamp');
      set({ sessionLog: logs || [] });
    } catch (err) {
      console.warn('Failed to load session logs:', err);
      set({ sessionLog: [] });
    }
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

      const previousContent = existing?.content || null;
      const isCreate = !existing;

      if (existing) {
        await db.projectFiles.update(existing.id, { content, updatedAt: Date.now() });
      } else {
        await db.projectFiles.add({ projectId, path, content, updatedAt: Date.now() });
      }

      // Update local state and mark as dirty
      set(state => {
        const newFiles = { ...state.files, [path]: content };
        const project = state.activeProject;
        const progress = computePhaseProgress(newFiles, project?.phaseAnswers);
        return { files: newFiles, phaseProgress: progress, isDirty: true };
      });

      // Update project timestamp
      await db.projects.update(projectId, { updatedAt: Date.now() });

      // ── Auto-log file edit to session log for Version History ──
      const countWords = (text) => text ? text.split(/\s+/).filter(Boolean).length : 0;
      const wordsBefore = countWords(previousContent);
      const wordsAfter = countWords(content);
      const filename = path; // Store full path as the filename key
      const logEntry = {
        projectId,
        timestamp: Date.now(),
        type: isCreate ? 'file-create' : 'file-edit',
        filename,
        path,
        wordsBefore,
        wordsAfter,
        delta: wordsAfter - wordsBefore,
        content,
        previousContent,
      };

      try {
        await db.sessionLogs.add(logEntry);
        // Append to in-memory sessionLog so VersionHistory updates reactively
        set(state => ({ sessionLog: [logEntry, ...state.sessionLog] }));
      } catch (logErr) {
        console.warn('Failed to log file edit:', logErr);
      }

      // ── Silent Writing Assessment ──
      // After file save, analyze writing if enabled
      if (path.endsWith('.md') && content.length > 200) {
        try {
          const { useSettingsStore } = await import('./settingsStore');
          const { analyzeTextMetrics } = await import('../services/writingAssessment');
          const settings = useSettingsStore.getState();

          if (settings.silentAssessment) {
            const metrics = analyzeTextMetrics(content);
            if (metrics) {
              const assessmentId = `${projectId}-${path}`;
              await db.writingProfile.put({
                id: assessmentId,
                projectId,
                path,
                metrics,
                timestamp: Date.now(),
              });
            }
          }
        } catch (err) {
          // Silent fail — don't interrupt user workflow
          console.warn('Writing assessment failed (silent):', err);
        }
      }
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
   * Delete specific files from the active project by path patterns
   * @param {string[]} paths - Array of exact paths or patterns (startsWith matching if ends with *)
   */
  deleteFiles: async (paths) => {
    const projectId = get().activeProjectId;
    if (!projectId || !paths?.length) return;

    try {
      for (const pathPattern of paths) {
        if (pathPattern.endsWith('*')) {
          // Prefix match — delete all files starting with prefix
          const prefix = pathPattern.slice(0, -1);
          const matches = await db.projectFiles
            .where('projectId').equals(projectId)
            .filter(f => f.path.startsWith(prefix))
            .toArray();
          for (const m of matches) {
            await db.projectFiles.delete(m.id);
          }
        } else {
          // Exact match
          const record = await db.projectFiles
            .where('[projectId+path]')
            .equals([projectId, pathPattern])
            .first();
          if (record) await db.projectFiles.delete(record.id);
        }
      }

      // Reload files to sync state
      await get().loadProjectFiles(projectId);
    } catch (err) {
      console.warn('Failed to delete files:', err);
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

    const logEntry = {
      projectId,
      timestamp: Date.now(),
      ...entry,
    };
    await db.sessionLogs.add(logEntry);
    // Also update in-memory log so VersionHistory updates reactively
    set(state => ({ sessionLog: [logEntry, ...state.sessionLog] }));
  },

  /**
   * Fork a project (create a deep copy for experimentation)
   */
  forkProject: async (projectId, { title, forkType = 'sandbox' } = {}) => {
    const sourceProject = await db.projects.get(projectId);
    if (!sourceProject) throw new Error('Project not found');

    const sourceFiles = await db.projectFiles.where('projectId').equals(projectId).toArray();

    const newProjectId = uuid();
    const newTitle = title || `${sourceProject.title} (${forkType === 'sandbox' ? 'Sandbox' : 'Fork'})`;

    // Append short timestamp to slug to avoid uniqueness constraint collisions
    const baseSlug = slugify(newTitle);
    const uniqueSuffix = Date.now().toString(36).slice(-4);
    const forkedProject = {
      ...sourceProject,
      id: newProjectId,
      slug: `${baseSlug}-${uniqueSuffix}`,
      title: newTitle,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      forkParent: projectId,
      forkType,
      forkCreatedAt: Date.now(),
    };

    const forkedFiles = sourceFiles.map(f => ({
      projectId: newProjectId,
      path: f.path,
      content: f.content,
      updatedAt: Date.now(),
    }));

    try {
      await db.projects.add(forkedProject);
      await db.projectFiles.bulkAdd(forkedFiles);

      set(state => ({
        projects: [forkedProject, ...state.projects],
      }));

      return forkedProject;
    } catch (err) {
      console.error('Failed to fork project:', err);
      throw err;
    }
  },

  /**
   * List all forks of a project
   */
  listForks: async (projectId) => {
    try {
      const forks = await db.projects.where('forkParent').equals(projectId).toArray();
      return forks;
    } catch (err) {
      console.warn('Failed to list forks:', err);
      return [];
    }
  },

  /**
   * Update series order and role for all projects in a series
   */
  updateSeriesOrder: async (seriesName, orderedEntries) => {
    try {
      for (const entry of orderedEntries) {
        await db.projects.update(entry.projectId, {
          seriesOrder: entry.order,
          seriesRole: entry.role,
          updatedAt: Date.now(),
        });
      }
      // Refresh the projects list
      const allProjects = await db.projects.toArray();
      set({ projects: allProjects });
      return true;
    } catch (err) {
      console.error('Failed to update series order:', err);
      throw err;
    }
  },

  /**
   * Promote a single file from a fork to its parent project
   */
  promoteFromFork: async (forkId, filePath) => {
    const fork = await db.projects.get(forkId);
    if (!fork || !fork.forkParent) throw new Error('Not a valid fork');

    const parentId = fork.forkParent;
    const forkFile = await db.projectFiles
      .where('[projectId+path]')
      .equals([forkId, filePath])
      .first();

    if (!forkFile) throw new Error('File not found in fork');

    try {
      const existing = await db.projectFiles
        .where('[projectId+path]')
        .equals([parentId, filePath])
        .first();

      const previousContent = existing?.content || null;

      if (existing) {
        await db.projectFiles.update(existing.id, {
          content: forkFile.content,
          updatedAt: Date.now(),
        });
      } else {
        await db.projectFiles.add({
          projectId: parentId,
          path: filePath,
          content: forkFile.content,
          updatedAt: Date.now(),
        });
      }

      // Update parent project timestamp
      await db.projects.update(parentId, { updatedAt: Date.now() });

      // Refresh parent project if it's currently active
      if (get().activeProjectId === parentId) {
        await get().loadProjectFiles(parentId);
      }

      return { filePath, previousContent, newContent: forkFile.content };
    } catch (err) {
      console.error('Failed to promote file from fork:', err);
      throw err;
    }
  },

  /**
   * Promote entire fork: replace all parent files with fork files, then delete fork
   */
  promoteFork: async (forkId) => {
    const fork = await db.projects.get(forkId);
    if (!fork || !fork.forkParent) throw new Error('Not a valid fork');

    const parentId = fork.forkParent;
    const forkFiles = await db.projectFiles.where('projectId').equals(forkId).toArray();

    try {
      // Delete all files from parent with these paths and recreate with fork versions
      for (const forkFile of forkFiles) {
        const existing = await db.projectFiles
          .where('[projectId+path]')
          .equals([parentId, forkFile.path])
          .first();

        if (existing) {
          await db.projectFiles.update(existing.id, {
            content: forkFile.content,
            updatedAt: Date.now(),
          });
        } else {
          await db.projectFiles.add({
            projectId: parentId,
            path: forkFile.path,
            content: forkFile.content,
            updatedAt: Date.now(),
          });
        }
      }

      // Update parent project timestamp
      await db.projects.update(parentId, { updatedAt: Date.now() });

      // Delete the fork entirely
      await db.projectFiles.where('projectId').equals(forkId).delete();
      await db.sessionLogs.where('projectId').equals(forkId).delete();
      await db.fileHistory.where('projectId').equals(forkId).delete();
      await db.projects.delete(forkId);

      set(state => ({
        projects: state.projects.filter(p => p.id !== forkId),
      }));

      // Refresh parent if it's currently active
      if (get().activeProjectId === parentId) {
        await get().loadProjectFiles(parentId);
      }

      return true;
    } catch (err) {
      console.error('Failed to promote fork:', err);
      throw err;
    }
  },

  /**
   * Discard a fork (delete it entirely)
   */
  discardFork: async (forkId) => {
    try {
      await db.projectFiles.where('projectId').equals(forkId).delete();
      await db.sessionLogs.where('projectId').equals(forkId).delete();
      await db.fileHistory.where('projectId').equals(forkId).delete();
      await db.projects.delete(forkId);

      set(state => ({
        projects: state.projects.filter(p => p.id !== forkId),
      }));

      return true;
    } catch (err) {
      console.error('Failed to discard fork:', err);
      throw err;
    }
  },
}));
