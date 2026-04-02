import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import HealthBar from '../components/HealthBar';
import Badge from '../components/Badge';
import { Plus, Upload, Users, Globe, GitCompare, FolderOpen, Clock, BookOpen, Pencil, Check, X } from 'lucide-react';

const projects = [
  {
    id: 1, title: 'The Shunning Season', genre: 'Literary Fiction + Thriller',
    phase: 'Phase 8 — Chapter 6 of 12', health: 4, pct: 58,
    lastModified: '3 hours ago', lastAction: 'You were editing Chapter 5.',
    gradient: 'linear-gradient(135deg, #818cf8, #f97316)',
  },
  {
    id: 2, title: 'Orbital Decay', genre: 'Sci-Fi',
    phase: 'Phase 4 — Characters', health: 3, pct: 35,
    lastModified: '2 days ago', lastAction: 'Completed world-building questions.',
    gradient: 'linear-gradient(135deg, #2dd4bf, #60a5fa)',
  },
  {
    id: 3, title: 'Gatsby Decomposition', genre: 'Literary Fiction',
    phase: 'Decomposition Complete', health: 5, pct: 100,
    lastModified: '1 week ago', lastAction: 'Finished structural analysis.',
    gradient: 'linear-gradient(135deg, #fbbf24, #f472b6)',
  },
];

const quickActions = [
  { icon: Upload, label: 'Import a story to decompose', path: '/wizard?mode=decompose' },
  { icon: Users, label: 'Build a character (standalone)', path: '/workspace?mode=full-cast&action=add-character' },
  { icon: Globe, label: 'Build a world (standalone)', path: '/workspace?mode=world' },
  { icon: GitCompare, label: 'Compare two stories', path: '/workspace?mode=comparison' },
  { icon: FolderOpen, label: 'Open from folder', path: '/wizard?mode=import' },
];

export default function HubScreen() {
  const navigate = useNavigate();
  const [projectList, setProjectList] = useState(projects);
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef(null);

  useEffect(() => {
    if (renamingId !== null) renameInputRef.current?.focus();
  }, [renamingId]);

  const startRename = (e, p) => {
    e.stopPropagation();
    setRenamingId(p.id);
    setRenameValue(p.title);
  };

  const commitRename = (id) => {
    if (renameValue.trim()) {
      setProjectList(prev => prev.map(p => p.id === id ? { ...p, title: renameValue.trim() } : p));
      if (selectedProject?.id === id) setSelectedProject(prev => ({ ...prev, title: renameValue.trim() }));
    }
    setRenamingId(null);
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

        {/* Project List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '8px 12px' }}>
            My Projects
          </div>
          {projectList.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedProject(p)}
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: selectedProject?.id === p.id ? 'var(--accent-glow)' : 'transparent',
                borderLeft: selectedProject?.id === p.id ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: 2,
                transition: 'var(--transition)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 4,
                  background: p.gradient,
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
                <HealthBar rating={p.health} size="sm" showLabel={false} style={{ flex: 1 }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {p.lastModified}
                </span>
              </div>
            </div>
          ))}

          <div style={{ height: 1, background: 'var(--border)', margin: '12px 12px' }} />

          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '8px 12px' }}>
            Quick Start
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 10px' }}>
            {[
              { label: 'Deconstruct a book', path: '/wizard?mode=decompose' },
              { label: 'Compare two stories', path: '/workspace?mode=comparison' },
              { label: 'Talk to a character', path: '/workspace?mode=chat&panel=cast' },
              { label: 'Retell from another POV', path: '/wizard?mode=retell' },
              { label: 'Write a spinoff', path: '/wizard?mode=spinoff' },
              { label: 'Write a sequel', path: '/wizard?mode=sequel' },
              { label: 'Write a prequel', path: '/wizard?mode=prequel' },
              { label: 'Build a world', path: '/workspace?mode=world' },
            ].map((item) => (
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
        {selectedProject && (
          <div style={{ maxWidth: 620, animation: 'fadeIn 0.3s ease forwards' }}>
            {/* Welcome Back */}
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
              Welcome Back, Isaiah.
            </p>

            {/* Project Card */}
            <Card style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <BookOpen size={20} color="var(--accent)" />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{selectedProject.title}</h2>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <Badge variant="accent">{selectedProject.genre}</Badge>
                <Badge variant="muted">{selectedProject.phase}</Badge>
              </div>
              <HealthBar rating={selectedProject.health} style={{ marginBottom: 12 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Clock size={13} color="var(--text-muted)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last session: {selectedProject.lastModified}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                {selectedProject.lastAction}
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
                  <div>● Edited Chapter 5 — rewrote the confrontation scene</div>
                  <div>● Resolved 1 Editor note (voice consistency)</div>
                  <div style={{ color: 'var(--health-strong)', marginTop: 4 }}>
                    ↑ Voice Consistency: Good → Strong
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="primary" onClick={() => navigate('/workspace')}>
                  Pick Up Where I Left Off
                </Button>
                <Button variant="secondary" onClick={() => navigate('/workspace?mode=reader')}>
                  Show Full Picture
                </Button>
                <Button variant="ghost" onClick={() => navigate('/workspace?mode=timeline')}>
                  Open Story Timeline
                </Button>
              </div>
            </Card>

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
        )}
      </div>
    </div>
  );
}
