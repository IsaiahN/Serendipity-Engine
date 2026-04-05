/**
 * Serendipity Engine - File Audit Service
 *
 * Scans a project's file inventory after decomposition, paradigm shift,
 * or generation to verify all expected files are present and non-empty.
 * Surfaces missing/empty files with recovery suggestions and pre-selects
 * what needs regeneration.
 *
 * Runs automatically after major operations AND on demand via UI button.
 */

import db from '../lib/db';

// -----------------------------------------------------------------------
//  Expected file manifest per phase
// -----------------------------------------------------------------------

/**
 * REQUIRED files: must exist AND have non-empty content for the phase
 * to be considered healthy.
 *
 * OPTIONAL files: nice to have; absence triggers a low-priority suggestion
 * rather than a warning.
 */
const PHASE_FILES = {
  author: {
    required: ['author.md'],
    optional: [],
    label: 'Phase 1 - Author',
  },
  narrator: {
    required: ['narrator.md'],
    optional: [],
    label: 'Phase 2 - Narrator',
  },
  world: {
    required: ['world/world-building.md'],
    optional: ['world/questions-answered.md', 'world/hallmarks.md'],
    label: 'Phase 3 - World',
  },
  characters: {
    // At least one character file (dynamic check below)
    required: [],
    optional: ['characters/questions-answered.md'],
    label: 'Phase 4 - Characters',
    dynamicCheck: 'characters',
  },
  relationships: {
    required: ['relationships/questions-answered.md'],
    optional: ['relationships/relationship-graph.json'],
    label: 'Phase 5 - Relationships',
  },
  story: {
    required: ['outline.md', 'story/arc.md', 'abstract.md'],
    optional: ['story/questions-answered.md'],
    label: 'Phase 6 - Story Foundation',
  },
  review: {
    required: ['dry-run-audit.md'],
    optional: [],
    label: 'Phase 7 - Review',
  },
  execution: {
    // Chapters are created during writing; only flag if project is
    // past phase 7 and has zero chapters.
    required: [],
    optional: ['story/chapter-checklist.md', 'story/metafiles-review.md'],
    label: 'Phase 8 - Execution',
    dynamicCheck: 'chapters',
  },
};

// Decomposition-specific extra files that should exist after a decompose run
const DECOMPOSE_EXTRAS = [
  'world/hallmarks.md',
  'relationships/relationship-graph.json',
];

// -----------------------------------------------------------------------
//  Severity levels
// -----------------------------------------------------------------------
const SEV = {
  CRITICAL: 'critical', // Blocks pipeline progress
  HIGH: 'high',         // Major gap, easy to regenerate
  MEDIUM: 'medium',     // Missing optional file
  LOW: 'low',           // Cosmetic / nice-to-have
};

// -----------------------------------------------------------------------
//  Recovery method labels
// -----------------------------------------------------------------------
const RECOVERY = {
  REGENERATE_ANALYSIS: 'regenerate-analysis',
  ADD_MISSING_DETAILS: 'add-missing-details',
  REDECOMPOSE_STEP: 'redecompose-step',
  CREATE_PLACEHOLDER: 'create-placeholder',
  MANUAL: 'manual',
};

// Map file paths to the decomposition step key that produces them
const FILE_TO_DECOMPOSE_STEP = {
  'author.md': 'author',
  'narrator.md': 'narrator',
  'world/world-building.md': 'world',
  'world/hallmarks.md': 'world-detail',
  'world/questions-answered.md': 'world-detail',
  'characters/questions-answered.md': 'characters-detail',
  'relationships/questions-answered.md': 'relationships',
  'relationships/relationship-graph.json': 'relationships-detail',
  'outline.md': 'structure',
  'story/arc.md': 'structure',
  'story/questions-answered.md': 'story-detail',
  'abstract.md': 'story-detail',
  'dry-run-audit.md': 'review',
};

// Map file paths to the paradigm shift generation step that produces them
const FILE_TO_PARADIGM_STEP = {
  'narrator.md': 'gen-narrator',
  'abstract.md': 'gen-abstract',
  'outline.md': 'gen-outline',
  'story/arc.md': 'gen-arc',
  'world/world-building.md': 'gen-world',
};

// -----------------------------------------------------------------------
//  Core audit function
// -----------------------------------------------------------------------

/**
 * Audit a project's file inventory and return a structured report.
 *
 * @param {Object} files        - Map of path -> content from the store
 * @param {Object} project      - The project record (from DB or store)
 * @param {Object} [options]    - { afterOperation: 'decompose'|'paradigm-shift'|'generation'|null }
 * @returns {AuditReport}
 */
export function auditProject(files, project, options = {}) {
  const { afterOperation = null } = options;
  const isDecomposed = project?.isDecomposed || project?.metadata?.mode === 'decompose';
  const currentPhase = project?.currentPhase || 1;

  const findings = [];
  const phaseHealth = {};

  // ---- Per-phase validation ----
  for (const [phaseKey, spec] of Object.entries(PHASE_FILES)) {
    const phaseResult = { key: phaseKey, label: spec.label, healthy: true, issues: [] };

    // Required files
    for (const file of spec.required) {
      const content = files[file];
      if (!content || !content.trim()) {
        const finding = buildFinding(file, phaseKey, SEV.CRITICAL, isDecomposed, afterOperation);
        findings.push(finding);
        phaseResult.issues.push(finding);
        phaseResult.healthy = false;
      }
    }

    // Optional files
    for (const file of spec.optional) {
      const content = files[file];
      if (!content || !content.trim()) {
        const finding = buildFinding(file, phaseKey, SEV.MEDIUM, isDecomposed, afterOperation);
        findings.push(finding);
        phaseResult.issues.push(finding);
      }
    }

    // Dynamic checks
    if (spec.dynamicCheck === 'characters') {
      const charFiles = Object.keys(files).filter(
        f => f.startsWith('characters/') && f.endsWith('.md') && f !== 'characters/questions-answered.md'
      );
      const charFilesWithContent = charFiles.filter(f => files[f]?.trim());
      if (charFilesWithContent.length === 0) {
        const finding = {
          file: 'characters/*.md',
          phase: phaseKey,
          severity: SEV.CRITICAL,
          message: 'No character profile files found. At least one character is required.',
          recovery: isDecomposed ? RECOVERY.REDECOMPOSE_STEP : RECOVERY.MANUAL,
          decomposeStep: 'characters',
          preselected: true,
        };
        findings.push(finding);
        phaseResult.issues.push(finding);
        phaseResult.healthy = false;
      }
      // Check for empty character files (file exists but no content)
      for (const cf of charFiles) {
        if (!files[cf]?.trim()) {
          findings.push({
            file: cf,
            phase: phaseKey,
            severity: SEV.HIGH,
            message: `Character file "${cf}" exists but is empty.`,
            recovery: isDecomposed ? RECOVERY.REDECOMPOSE_STEP : RECOVERY.ADD_MISSING_DETAILS,
            decomposeStep: 'characters',
            enrichGroup: 'characters',
            preselected: true,
          });
          phaseResult.issues.push(findings[findings.length - 1]);
          phaseResult.healthy = false;
        }
      }
    }

    if (spec.dynamicCheck === 'chapters' && currentPhase >= 8) {
      const chapters = Object.keys(files).filter(f => /^story\/(chapter|act|scene|episode|passage|section)-\d+\.md$/.test(f));
      if (chapters.length === 0) {
        findings.push({
          file: 'story/chapter-*.md',
          phase: phaseKey,
          severity: SEV.HIGH,
          message: 'Project is at execution phase but has no chapter files yet.',
          recovery: RECOVERY.MANUAL,
          preselected: false,
        });
      }
    }

    phaseHealth[phaseKey] = phaseResult;
  }

  // ---- Decomposition-specific extras ----
  if (isDecomposed) {
    for (const file of DECOMPOSE_EXTRAS) {
      const content = files[file];
      if (!content || !content.trim()) {
        // Only add if not already captured by phase checks
        if (!findings.some(f => f.file === file)) {
          const finding = buildFinding(file, null, SEV.MEDIUM, true, afterOperation);
          findings.push(finding);
        }
      }
    }
  }

  // ---- Content quality checks (empty files that exist) ----
  for (const [path, content] of Object.entries(files)) {
    if (path.endsWith('/') || path === null) continue;
    // Skip directories, drawing-board, feedback (user-optional areas)
    if (path.startsWith('drawing-board/') || path.startsWith('feedback/')) continue;
    if (content !== undefined && content !== null && !content.trim()) {
      // File record exists but content is empty
      if (!findings.some(f => f.file === path)) {
        findings.push({
          file: path,
          phase: guessPhaseForFile(path),
          severity: SEV.LOW,
          message: `File "${path}" exists but has no content.`,
          recovery: RECOVERY.CREATE_PLACEHOLDER,
          preselected: false,
        });
      }
    }
  }

  // ---- Compute summary ----
  const critical = findings.filter(f => f.severity === SEV.CRITICAL);
  const high = findings.filter(f => f.severity === SEV.HIGH);
  const medium = findings.filter(f => f.severity === SEV.MEDIUM);
  const preselected = findings.filter(f => f.preselected);

  // Determine overall status
  let status = 'healthy'; // green
  if (medium.length > 0) status = 'warnings';   // yellow
  if (high.length > 0) status = 'incomplete';    // orange
  if (critical.length > 0) status = 'critical';  // red

  return {
    projectId: project?.id,
    timestamp: Date.now(),
    status,
    isDecomposed,
    afterOperation,
    findings,
    phaseHealth,
    summary: {
      total: findings.length,
      critical: critical.length,
      high: high.length,
      medium: medium.length,
      low: findings.filter(f => f.severity === SEV.LOW).length,
    },
    preselected,
    // Grouped recovery actions for the UI
    recoveryActions: buildRecoveryActions(findings, isDecomposed),
  };
}

// -----------------------------------------------------------------------
//  Helpers
// -----------------------------------------------------------------------

function buildFinding(file, phase, severity, isDecomposed, afterOperation) {
  const decomposeStep = FILE_TO_DECOMPOSE_STEP[file];
  const paradigmStep = FILE_TO_PARADIGM_STEP[file];

  let recovery = RECOVERY.MANUAL;
  let enrichGroup = null;

  if (isDecomposed && decomposeStep) {
    recovery = RECOVERY.REDECOMPOSE_STEP;
  } else if (afterOperation === 'paradigm-shift' && paradigmStep) {
    recovery = RECOVERY.REGENERATE_ANALYSIS;
  } else if (severity === SEV.MEDIUM) {
    recovery = RECOVERY.ADD_MISSING_DETAILS;
    // Map to enrich groups
    if (file.startsWith('world/')) enrichGroup = 'hallmarks';
    if (file.startsWith('characters/')) enrichGroup = 'characters';
    if (file.startsWith('relationships/')) enrichGroup = 'relationships';
    if (file.startsWith('story/')) enrichGroup = 'storyDna';
  }

  return {
    file,
    phase: phase || guessPhaseForFile(file),
    severity,
    message: `Missing or empty: ${file}`,
    recovery,
    decomposeStep: decomposeStep || null,
    paradigmStep: paradigmStep || null,
    enrichGroup,
    preselected: severity === SEV.CRITICAL || severity === SEV.HIGH,
  };
}

function guessPhaseForFile(file) {
  if (file === 'author.md') return 'author';
  if (file === 'narrator.md') return 'narrator';
  if (file.startsWith('world/')) return 'world';
  if (file.startsWith('characters/')) return 'characters';
  if (file.startsWith('relationships/')) return 'relationships';
  if (file === 'outline.md' || file === 'abstract.md' || file.startsWith('story/arc')) return 'story';
  if (file === 'dry-run-audit.md') return 'review';
  if (file.startsWith('story/chapter') || file.startsWith('story/act') || file.startsWith('story/scene')) return 'execution';
  return null;
}

/**
 * Group findings into actionable recovery buckets the UI can render
 * as buttons: "Redecompose 3 steps", "Add Missing Details (2 groups)", etc.
 */
function buildRecoveryActions(findings, isDecomposed) {
  const actions = [];

  // Group redecompose steps
  const decomposeSteps = [...new Set(
    findings
      .filter(f => f.recovery === RECOVERY.REDECOMPOSE_STEP && f.decomposeStep)
      .map(f => f.decomposeStep)
  )];
  if (decomposeSteps.length > 0) {
    actions.push({
      type: RECOVERY.REDECOMPOSE_STEP,
      label: `Re-analyze ${decomposeSteps.length} step${decomposeSteps.length > 1 ? 's' : ''}`,
      description: `Re-run decomposition for: ${decomposeSteps.join(', ')}`,
      steps: decomposeSteps,
      fileCount: findings.filter(f => f.recovery === RECOVERY.REDECOMPOSE_STEP).length,
    });
  }

  // Group enrich/add-missing-details groups
  const enrichGroups = [...new Set(
    findings
      .filter(f => f.recovery === RECOVERY.ADD_MISSING_DETAILS && f.enrichGroup)
      .map(f => f.enrichGroup)
  )];
  if (enrichGroups.length > 0) {
    actions.push({
      type: RECOVERY.ADD_MISSING_DETAILS,
      label: `Add missing details (${enrichGroups.length} area${enrichGroups.length > 1 ? 's' : ''})`,
      description: `Fill in: ${enrichGroups.join(', ')}`,
      groups: enrichGroups,
      fileCount: findings.filter(f => f.recovery === RECOVERY.ADD_MISSING_DETAILS).length,
    });
  }

  // Regenerate analysis (paradigm shift leftovers)
  const paradigmFiles = findings.filter(f => f.recovery === RECOVERY.REGENERATE_ANALYSIS);
  if (paradigmFiles.length > 0) {
    actions.push({
      type: RECOVERY.REGENERATE_ANALYSIS,
      label: `Regenerate ${paradigmFiles.length} file${paradigmFiles.length > 1 ? 's' : ''}`,
      description: 'Re-run analysis to fill gaps from paradigm shift',
      files: paradigmFiles.map(f => f.file),
      fileCount: paradigmFiles.length,
    });
  }

  return actions;
}

// -----------------------------------------------------------------------
//  Convenience: run audit from project ID (async, hits DB)
// -----------------------------------------------------------------------

/**
 * Load project + files from DB and run a full audit.
 * Useful when called outside of React (e.g., from decomposition pipeline).
 */
export async function auditProjectById(projectId, options = {}) {
  const project = await db.projects.get(projectId);
  if (!project) return null;

  const fileRecords = await db.projectFiles
    .where('projectId').equals(projectId)
    .toArray();

  const files = {};
  for (const f of fileRecords) {
    files[f.path] = f.content;
  }

  return auditProject(files, project, options);
}

// -----------------------------------------------------------------------
//  Exports
// -----------------------------------------------------------------------

export { SEV, RECOVERY, PHASE_FILES };
