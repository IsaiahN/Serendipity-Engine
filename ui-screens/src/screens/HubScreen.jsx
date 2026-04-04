import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import HealthBar from '../components/HealthBar';
import Badge from '../components/Badge';
import { Plus, Upload, Users, Globe, GitCompare, FolderOpen, Clock, BookOpen, Pencil, Check, X, Trash2, Download, FileText } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import { useSettingsStore } from '../stores/settingsStore';
import { PHASES } from '../lib/constants';
import { activateDemoMode, isDemoActive, getDemoProjectId } from '../services/demoMode';

const GRADIENTS = [
  'linear-gradient(135deg, #818cf8, #f97316)',
  'linear-gradient(135deg, #2dd4bf, #60a5fa)',
  'linear-gradient(135deg, #fbbf24, #f472b6)',
  'linear-gradient(135deg, #f97316, #ef4444)',
  'linear-gradient(135deg, #a78bfa, #ec4899)',
  'linear-gradient(135deg, #22c55e, #3b82f6)',
  'linear-gradient(135deg, #06b6d4, #8b5cf6)',
  'linear-gradient(135deg, #eab308, #22c55e)',
];

function getGradient(index) {
  return GRADIENTS[index % GRADIENTS.length];
}

const quickActions = [
  { icon: Upload, label: 'Import a story to decompose', path: '/wizard?mode=decompose' },
  { icon: BookOpen, label: 'Decompose a book series', path: '/wizard?mode=decompose&series=true' },
  { icon: Users, label: 'Build a character (standalone)', path: '/workspace?mode=full-cast&action=add-character' },
  { icon: Globe, label: 'Build a world (standalone)', path: '/workspace?mode=world' },
  { icon: GitCompare, label: 'Compare two stories', path: '/workspace?mode=comparison' },
  { icon: FolderOpen, label: 'Open from folder', path: '/wizard?mode=import' },
];

const quickStartPills = [
  { label: 'Deconstruct a book', path: '/wizard?mode=decompose' },
  { label: 'Compare two stories', path: '/workspace?mode=comparison' },
  { label: 'Talk to a character', path: '/workspace?mode=chat&panel=cast' },
  { label: 'Retell from another POV', path: '/wizard?mode=retell' },
  { label: 'Write a spinoff', path: '/wizard?mode=spinoff' },
  { label: 'Write a sequel', path: '/wizard?mode=sequel' },
  { label: 'Write a prequel', path: '/wizard?mode=prequel' },
  { label: 'Build a world', path: '/workspace?mode=world' },
];

export default function HubScreen() {
  const navigate = useNavigate();
  const projects = useProjectStore(s => s.projects);
  const setActiveProject = useProjectStore(s => s.setActiveProject);
  const deleteProject = useProjectStore(s => s.deleteProject);
  const updateProject = useProjectStore(s => s.updateProject);

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const renameInputRef = useRef(null);

  const selectedProject = projects[selectedIdx] || null;

  useEffect(() => {
    if (renamingId !== null) renameInputRef.current?.focus();
  }, [renamingId]);

  const startRename = (e, p) => {
    e.stopPropagation();
    setRenamingId(p.id);
    setRenameValue(p.title);
  };

  const commitRename = async (id) => {
    if (renameValue.trim()) {
      await setActiveProject(id);
      await updateProject({ title: renameValue.trim() });
    }
    setRenamingId(null);
  };

  const handleSelectProject = async (idx) => {
    setSelectedIdx(idx);
    if (projects[idx]) {
      await setActiveProject(projects[idx].id);
    }
  };

  const handleOpenProject = async () => {
    if (selectedProject) {
      await setActiveProject(selectedProject.id);
      navigate('/workspace');
    }
  };

  const handleDeleteProject = async (id) => {
    await deleteProject(id);
    setDeleteConfirmId(null);
    if (selectedIdx >= projects.length - 1) {
      setSelectedIdx(Math.max(0, projects.length - 2));
    }
  };

  const getPhaseLabel = (project) => {
    if (!project?.currentPhase) return 'Not started';
    const phase = PHASES.find(p => p.id === project.currentPhase);
    return phase ? `Phase ${phase.id} — ${phase.name}` : 'In progress';
  };

  const getLastModifiedLabel = (project) => {
    if (!project?.updatedAt) return 'Never';
    const diff = Date.now() - project.updatedAt;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Column — Project List */}
      <div style={{
        width: 280,
        borderRight: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.2rem' }}>✦</span>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent)' }}>Serendipity Engine</span>
        </div>

        {/* New Story Button */}
        <div style={{ padding: '12px 16px' }}>
          <Button
            variant="primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => navigate('/wizard')}
          >
            <Plus size={16} /> New Story
          </Button>
        </div>

        {/* Demo Mode Button */}
        <div style={{ padding: '0 16px 12px' }}>
          <Button
            variant="secondary"
            disabled={demoLoading}
            style={{
              width: '100%', justifyContent: 'center', fontSize: '0.8rem',
              color: 'var(--text-secondary)', gap: 6,
              border: '1px dashed var(--border)',
              background: 'var(--bg-secondary)',
            }}
            onClick={async () => {
              setDemoLoading(true);
              try {
                // If demo already exists, just navigate to it
                if (await isDemoActive()) {
                  const demoId = getDemoProjectId();
                  if (demoId) {
                    const store = useProjectStore.getState();
                    await store.setActiveProject(demoId);
                    navigate('/workspace');
                    return;
                  }
                }
                // Otherwise create the demo project
                const store = useProjectStore.getState();
                const demoProject = await activateDemoMode(store);
                if (demoProject) {
                  await store.loadProjects();
                  navigate('/workspace');
                }
              } catch (err) {
                console.error('Demo activation failed:', err);
              } finally {
                setDemoLoading(false);
              }
            }}
          >
            <BookOpen size={14} /> {demoLoading ? 'Loading Demo...' : 'Try Demo Project'}
          </Button>
        </div>

        {/* Project List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '8px 12px' }}>
            My Projects {projects.length > 0 && `(${projects.length})`}
          </div>

          {projects.length === 0 ? (
            <div
              onClick={() => navigate('/wizard')}
              style={{
                padding: '20px 12px', textAlign: 'center', cursor: 'pointer',
                borderRadius: 'var(--radius-sm)', transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Plus size={24} color="var(--text-muted)" style={{ marginBottom: 8, opacity: 0.5 }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No projects yet</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: 4 }}>Create your first story to get started</div>
            </div>
          ) : (
            projects.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => handleSelectProject(idx)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: selectedIdx === idx ? 'var(--accent-glow)' : 'transparent',
                  borderLeft: selectedIdx === idx ? '2px solid var(--accent)' : '2px solid transparent',
                  marginBottom: 2,
                  transition: 'var(--transition)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 4,
                    background: getGradient(idx),
                    flexShrink: 0,
                  }} />
                  {renamingId === p.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0 }} onClick={(e) => e.stopPropagation()}>
                      <input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') commitRename(p.id); if (e.key === 'Escape') setRenamingId(null); }}
                        style={{
                          flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--accent)',
                          borderRadius: 4, color: 'var(--text-primary)', fontSize: '0.85rem',
                          padding: '2px 6px', outline: 'none', minWidth: 0,
                        }}
                      />
                      <button onClick={() => commitRename(p.id)} style={{ background: 'none', border: 'none', color: 'var(--health-strong)', cursor: 'pointer', padding: 2 }} title="Save">
                        <Check size={12} />
                      </button>
                      <button onClick={() => setRenamingId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }} title="Cancel">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                        {p.title}
                      </span>
                      <button
                        onClick={(e) => startRename(e, p)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2, opacity: 0.5, flexShrink: 0 }}
                        title="Rename project"
                      >
                        <Pencil size={12} />
                      </button>
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 32 }}>
                  <HealthBar rating={p.health || 0} size="sm" showLabel={false} style={{ flex: 1 }} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {getLastModifiedLabel(p)}
                  </span>
                </div>
              </div>
            ))
          )}

          <div style={{ height: 1, background: 'var(--border)', margin: '12px 12px' }} />

          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '8px 12px' }}>
            Quick Start
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 10px' }}>
            {quickStartPills.map((item) => (
              <div
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 100,
                  border: '1px solid var(--border)',
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.color = 'var(--accent)';
                  e.currentTarget.style.background = 'var(--accent-glow)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column — Detail Panel */}
      <div style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
        <div style={{ maxWidth: 620, animation: 'fadeIn 0.3s ease forwards' }}>
          {/* Welcome Back */}
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
            Welcome Back.
          </p>

          {selectedProject ? (
            <>
              {/* Project Card */}
              <Card style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <BookOpen size={20} color="var(--accent)" />
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 600, flex: 1 }}>{selectedProject.title}</h2>
                  {deleteConfirmId === selectedProject.id ? (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <button
                        onClick={() => handleDeleteProject(selectedProject.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(selectedProject.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {selectedProject.genre && <Badge variant="accent">{selectedProject.genre}</Badge>}
                  <Badge variant="muted">{getPhaseLabel(selectedProject)}</Badge>
                  {selectedProject.medium && <Badge variant="muted">{selectedProject.medium}</Badge>}
                </div>
                <HealthBar rating={selectedProject.health || 0} style={{ marginBottom: 12 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Clock size={13} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last session: {getLastModifiedLabel(selectedProject)}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                  {selectedProject.lastAction || 'No recent activity.'}
                </p>

                {/* Session Changelog Preview */}
                <div style={{
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 14,
                  marginBottom: 20,
                  fontSize: '0.8rem',
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>Last Session Summary</div>
                  <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {selectedProject.lastAction ? (
                      <div>● {selectedProject.lastAction}</div>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No session history yet. Open this project to start building.</div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="primary" onClick={handleOpenProject}>
                    Pick Up Where I Left Off
                  </Button>
                  <Button variant="secondary" onClick={async () => { if (selectedProject) { await setActiveProject(selectedProject.id); navigate('/workspace?mode=reader'); } }}>
                    Show Full Picture
                  </Button>
                  <Button variant="ghost" onClick={async () => { if (selectedProject) { await setActiveProject(selectedProject.id); navigate('/workspace?mode=timeline'); } }}>
                    Open Story Timeline
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            /* Empty State */
            <Card style={{ padding: 40, textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: '2rem', marginBottom: 12, opacity: 0.3 }}>✦</div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>No Stories Yet</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                Create your first story, decompose an existing one, or explore the engine's features.
              </p>
              <Button variant="primary" onClick={() => navigate('/wizard')}>
                <Plus size={16} /> Create Your First Story
              </Button>
            </Card>
          )}

          {/* Quick Actions */}
          <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {quickActions.map((a) => (
              <div
                key={a.label}
                onClick={() => navigate(a.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <a.icon size={16} color="var(--text-muted)" />
                {a.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
