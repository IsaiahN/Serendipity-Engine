/**
 * Tests for fileAuditService
 *
 * The audit service scans a project's file inventory and reports
 * missing, empty, or incomplete files with severity levels and
 * recovery suggestions.
 */
import { describe, it, expect } from 'vitest';
import { auditProject, SEV, RECOVERY, PHASE_FILES } from '../services/fileAuditService';

// Helper: build a minimal project object
const makeProject = (overrides = {}) => ({
  id: 'test-project-1',
  title: 'Test Project',
  currentPhase: 6,
  isDecomposed: false,
  metadata: {},
  ...overrides,
});

// Helper: build a full healthy file set (every required + optional file)
const fullHealthyFiles = () => ({
  'author.md': '# Author Profile\nWriting style...',
  'narrator.md': '# Narrator\nThird person...',
  'world/world-building.md': '# World\nThe setting...',
  'world/questions-answered.md': 'Q&A...',
  'world/hallmarks.md': 'Genre hallmarks...',
  'characters/questions-answered.md': 'Character Q&A...',
  'characters/dorothy.md': '# Dorothy\nProtagonist...',
  'characters/scarecrow.md': '# Scarecrow\nNeeds a brain...',
  'relationships/questions-answered.md': 'Relationship Q&A...',
  'relationships/relationship-graph.json': '{"nodes":[]}',
  'outline.md': '# Outline\nAct 1...',
  'story/arc.md': '# Story Arc\nSetup...',
  'abstract.md': '# Abstract\nA tale of...',
  'story/questions-answered.md': 'Story Q&A...',
  'dry-run-audit.md': '# Audit Results\nAll good.',
  // Execution phase optional files
  'story/chapter-checklist.md': '# Chapter Checklist\nAll chapters planned.',
  'story/metafiles-review.md': '# Meta Review\nAll meta files ok.',
});

// ---------------------------------------------------------------
//  Healthy project
// ---------------------------------------------------------------
describe('auditProject — healthy project', () => {
  it('returns "healthy" status when all files are present', () => {
    const report = auditProject(fullHealthyFiles(), makeProject());
    expect(report.status).toBe('healthy');
    expect(report.summary.critical).toBe(0);
    expect(report.summary.high).toBe(0);
  });

  it('has zero findings for a fully complete project', () => {
    const report = auditProject(fullHealthyFiles(), makeProject());
    expect(report.findings).toHaveLength(0);
  });

  it('marks all phases as healthy', () => {
    const report = auditProject(fullHealthyFiles(), makeProject());
    for (const [, phase] of Object.entries(report.phaseHealth)) {
      expect(phase.healthy).toBe(true);
    }
  });
});

// ---------------------------------------------------------------
//  Missing required files
// ---------------------------------------------------------------
describe('auditProject — missing required files', () => {
  it('flags missing author.md as CRITICAL', () => {
    const files = fullHealthyFiles();
    delete files['author.md'];
    const report = auditProject(files, makeProject());
    expect(report.status).toBe('critical');
    expect(report.summary.critical).toBeGreaterThanOrEqual(1);
    const authorFinding = report.findings.find(f => f.file === 'author.md');
    expect(authorFinding).toBeDefined();
    expect(authorFinding.severity).toBe(SEV.CRITICAL);
  });

  it('flags missing narrator.md as CRITICAL', () => {
    const files = fullHealthyFiles();
    delete files['narrator.md'];
    const report = auditProject(files, makeProject());
    const finding = report.findings.find(f => f.file === 'narrator.md');
    expect(finding).toBeDefined();
    expect(finding.severity).toBe(SEV.CRITICAL);
  });

  it('flags missing outline.md as CRITICAL', () => {
    const files = fullHealthyFiles();
    delete files['outline.md'];
    const report = auditProject(files, makeProject());
    const finding = report.findings.find(f => f.file === 'outline.md');
    expect(finding).toBeDefined();
    expect(finding.severity).toBe(SEV.CRITICAL);
  });

  it('treats empty-string content as missing', () => {
    const files = fullHealthyFiles();
    files['author.md'] = '';
    const report = auditProject(files, makeProject());
    const finding = report.findings.find(f => f.file === 'author.md');
    expect(finding).toBeDefined();
    expect(finding.severity).toBe(SEV.CRITICAL);
  });

  it('treats whitespace-only content as missing', () => {
    const files = fullHealthyFiles();
    files['narrator.md'] = '   \n\t  ';
    const report = auditProject(files, makeProject());
    const finding = report.findings.find(f => f.file === 'narrator.md');
    expect(finding).toBeDefined();
    expect(finding.severity).toBe(SEV.CRITICAL);
  });
});

// ---------------------------------------------------------------
//  Missing optional files
// ---------------------------------------------------------------
describe('auditProject — missing optional files', () => {
  it('flags missing optional files as MEDIUM severity', () => {
    const files = fullHealthyFiles();
    delete files['world/questions-answered.md'];
    const report = auditProject(files, makeProject());
    const finding = report.findings.find(f => f.file === 'world/questions-answered.md');
    expect(finding).toBeDefined();
    expect(finding.severity).toBe(SEV.MEDIUM);
  });

  it('reports "warnings" status when only optional files are missing', () => {
    const files = fullHealthyFiles();
    delete files['story/questions-answered.md'];
    const report = auditProject(files, makeProject());
    expect(report.status).toBe('warnings');
  });
});

// ---------------------------------------------------------------
//  Dynamic checks: characters
// ---------------------------------------------------------------
describe('auditProject — character file checks', () => {
  it('flags CRITICAL when no character profile files exist', () => {
    const files = fullHealthyFiles();
    delete files['characters/dorothy.md'];
    delete files['characters/scarecrow.md'];
    const report = auditProject(files, makeProject());
    const finding = report.findings.find(f => f.file === 'characters/*.md');
    expect(finding).toBeDefined();
    expect(finding.severity).toBe(SEV.CRITICAL);
  });

  it('does not flag when at least one character file has content', () => {
    const files = fullHealthyFiles();
    delete files['characters/scarecrow.md'];
    const report = auditProject(files, makeProject());
    const finding = report.findings.find(f => f.file === 'characters/*.md');
    expect(finding).toBeUndefined();
  });

  it('flags empty character files as HIGH severity', () => {
    const files = fullHealthyFiles();
    files['characters/dorothy.md'] = '';
    const report = auditProject(files, makeProject());
    const finding = report.findings.find(f => f.file === 'characters/dorothy.md');
    expect(finding).toBeDefined();
    expect(finding.severity).toBe(SEV.HIGH);
  });
});

// ---------------------------------------------------------------
//  Dynamic checks: chapters (phase 9+)
// ---------------------------------------------------------------
describe('auditProject — chapter checks at phase 9+', () => {
  it('flags missing chapters when project is at phase 9', () => {
    const files = fullHealthyFiles();
    const project = makeProject({ currentPhase: 9 });
    const report = auditProject(files, project);
    const finding = report.findings.find(f => f.file === 'story/chapter-*.md');
    expect(finding).toBeDefined();
    expect(finding.severity).toBe(SEV.HIGH);
  });

  it('does not flag missing chapters before phase 9', () => {
    const files = fullHealthyFiles();
    const project = makeProject({ currentPhase: 6 });
    const report = auditProject(files, project);
    const finding = report.findings.find(f => f.file === 'story/chapter-*.md');
    expect(finding).toBeUndefined();
  });

  it('passes when chapter files exist at phase 9', () => {
    const files = { ...fullHealthyFiles(), 'story/chapter-1.md': '# Chapter 1\nOnce upon...' };
    const project = makeProject({ currentPhase: 9 });
    const report = auditProject(files, project);
    const finding = report.findings.find(f => f.file === 'story/chapter-*.md');
    expect(finding).toBeUndefined();
  });
});

// ---------------------------------------------------------------
//  Decomposed projects
// ---------------------------------------------------------------
describe('auditProject — decomposed projects', () => {
  it('suggests REDECOMPOSE_STEP recovery for decomposed projects', () => {
    const files = fullHealthyFiles();
    delete files['author.md'];
    const project = makeProject({ isDecomposed: true });
    const report = auditProject(files, project);
    const finding = report.findings.find(f => f.file === 'author.md');
    expect(finding.recovery).toBe(RECOVERY.REDECOMPOSE_STEP);
    expect(finding.decomposeStep).toBe('author');
  });

  it('checks decompose extras for decomposed projects', () => {
    const files = fullHealthyFiles();
    delete files['world/hallmarks.md'];
    delete files['relationships/relationship-graph.json'];
    const project = makeProject({ isDecomposed: true });
    const report = auditProject(files, project);
    // hallmarks.md is also in optional list, so check it gets captured
    const finding = report.findings.find(f => f.file === 'world/hallmarks.md');
    expect(finding).toBeDefined();
  });
});

// ---------------------------------------------------------------
//  Paradigm shift recovery
// ---------------------------------------------------------------
describe('auditProject — paradigm shift recovery', () => {
  it('suggests REGENERATE_ANALYSIS for paradigm shift files', () => {
    const files = fullHealthyFiles();
    delete files['narrator.md'];
    const report = auditProject(files, makeProject(), { afterOperation: 'paradigm-shift' });
    const finding = report.findings.find(f => f.file === 'narrator.md');
    expect(finding.recovery).toBe(RECOVERY.REGENERATE_ANALYSIS);
    expect(finding.paradigmStep).toBe('gen-narrator');
  });
});

// ---------------------------------------------------------------
//  Recovery actions grouping
// ---------------------------------------------------------------
describe('auditProject — recovery actions', () => {
  it('groups redecompose steps into a single action', () => {
    const files = fullHealthyFiles();
    delete files['author.md'];
    delete files['narrator.md'];
    const project = makeProject({ isDecomposed: true });
    const report = auditProject(files, project);
    const redecomposeAction = report.recoveryActions.find(a => a.type === RECOVERY.REDECOMPOSE_STEP);
    expect(redecomposeAction).toBeDefined();
    expect(redecomposeAction.steps).toContain('author');
    expect(redecomposeAction.steps).toContain('narrator');
  });

  it('groups add-missing-details by enrich group', () => {
    const files = fullHealthyFiles();
    delete files['world/questions-answered.md'];
    delete files['story/questions-answered.md'];
    const report = auditProject(files, makeProject());
    const addAction = report.recoveryActions.find(a => a.type === RECOVERY.ADD_MISSING_DETAILS);
    expect(addAction).toBeDefined();
    expect(addAction.groups.length).toBeGreaterThanOrEqual(1);
  });

  it('returns empty recoveryActions for healthy project', () => {
    const report = auditProject(fullHealthyFiles(), makeProject());
    expect(report.recoveryActions).toHaveLength(0);
  });
});

// ---------------------------------------------------------------
//  Report structure
// ---------------------------------------------------------------
describe('auditProject — report structure', () => {
  it('includes all expected top-level fields', () => {
    const report = auditProject(fullHealthyFiles(), makeProject());
    expect(report).toHaveProperty('projectId');
    expect(report).toHaveProperty('timestamp');
    expect(report).toHaveProperty('status');
    expect(report).toHaveProperty('findings');
    expect(report).toHaveProperty('phaseHealth');
    expect(report).toHaveProperty('summary');
    expect(report).toHaveProperty('recoveryActions');
    expect(report).toHaveProperty('preselected');
  });

  it('summary counts are consistent with findings', () => {
    const files = fullHealthyFiles();
    delete files['author.md'];
    delete files['world/questions-answered.md'];
    const report = auditProject(files, makeProject());
    const totalFromCounts = report.summary.critical + report.summary.high + report.summary.medium + report.summary.low;
    expect(totalFromCounts).toBe(report.summary.total);
  });

  it('preselected contains only CRITICAL and HIGH findings', () => {
    const files = fullHealthyFiles();
    delete files['author.md']; // CRITICAL
    delete files['world/questions-answered.md']; // MEDIUM
    const report = auditProject(files, makeProject());
    for (const f of report.preselected) {
      expect([SEV.CRITICAL, SEV.HIGH]).toContain(f.severity);
    }
  });
});
