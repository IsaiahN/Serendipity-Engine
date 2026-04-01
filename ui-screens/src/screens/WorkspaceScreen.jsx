import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import PhaseProgress from '../components/PhaseProgress';
import CastRoster from '../components/CastRoster';
import HealthBar from '../components/HealthBar';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import {
  FileText, FolderTree, ChevronRight, ChevronDown,
  Compass, Edit3, BookOpen, GitCompare, Network, MessageSquare,
  Clock, Palette, Settings, Download, Volume2, Search,
  Lightbulb, AlertTriangle, Pencil, ChevronUp,
} from 'lucide-react';

const centerStageModes = [
  { key: 'guided', icon: Compass, label: 'Guided Flow' },
  { key: 'editor', icon: Edit3, label: 'Editor' },
  { key: 'reader', icon: BookOpen, label: 'Reader' },
  { key: 'comparison', icon: GitCompare, label: 'Comparison' },
  { key: 'graph', icon: Network, label: 'Relationships' },
  { key: 'chat', icon: MessageSquare, label: 'Story Assistant' },
  { key: 'timeline', icon: Clock, label: 'Timeline' },
  { key: 'board', icon: Palette, label: 'Drawing Board' },
];

const fileTree = [
  { name: 'author.md', exists: true },
  { name: 'narrator.md', exists: true },
  { name: 'abstract.md', exists: true },
  { name: 'outline.md', exists: true },
  { name: 'characters/', exists: true, children: ['elena.md', 'marcus.md', 'priya.md', 'thomas.md'] },
  { name: 'relationships/', exists: true, children: ['relationship-graph.csv'] },
  { name: 'world/', exists: true, children: ['world-building.md', 'hallmarks.md'] },
  { name: 'story/', exists: true, children: ['arc.md', 'chapter-1.md', 'chapter-2.md'] },
  { name: 'feedback/', exists: true, children: ['editor-v1.md'] },
  { name: 'drawing-board/', exists: true, children: ['notes.md'] },
  { name: 'media/', exists: true, children: ['characters/', 'hallmarks/', 'locations/'] },
];

const healthDimensions = [
  { name: 'Author Depth', rating: 5 },
  { name: 'Narrator Clarity', rating: 4 },
  { name: 'World Integrity', rating: 3, flag: 'Seven Deaths audit: 2 unresolved' },
  { name: 'Character Depth', rating: 2, flag: 'Two characters share same wound' },
  { name: 'Relationship Arch.', rating: 3 },
  { name: 'Story Structure', rating: 4 },
  { name: 'Theoretical Alignment', rating: 3 },
  { name: 'Voice Consistency', rating: 4 },
  { name: 'Conflict Depth', rating: 3 },
  { name: 'Theme Resonance', rating: 5 },
];

/* ─── Center Stage Content ─── */
function GuidedFlow() {
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px', animation: 'fadeIn 0.3s ease' }}>
      <Badge variant="muted" style={{ marginBottom: 12 }}>Phase 3 — World / Question 4 of 8</Badge>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 12 }}>
        What are the hallmarks of this world?
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem', lineHeight: 1.7 }}>
        Hallmarks are the objects, symbols, places, and recurring elements that make your story world recognizable. Think of them as the visual and cultural DNA — what would someone see in a movie poster?
      </p>
      <div style={{
        background: 'var(--accent-subtle)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 16,
        marginBottom: 24,
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
      }}>
        <Lightbulb size={14} color="var(--accent)" style={{ marginRight: 6 }} />
        Example: In a Mennonite thriller, hallmarks might include prayer caps, horse-drawn buggies, gas lamps, the community kitchen, the shunning chair, and the county line.
      </div>
      <textarea
        placeholder="Describe the hallmarks of your story's world..."
        style={{
          width: '100%', minHeight: 120, padding: 16,
          background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)', fontSize: '0.9rem', resize: 'vertical',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <Button variant="ghost">← Previous</Button>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary">Roll for Me</Button>
          <Button variant="primary">Continue →</Button>
        </div>
      </div>
    </div>
  );
}

function EditorMode() {
  return (
    <div style={{ padding: 24, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Editor Review — Chapter 5</h2>
        <Badge variant="accent">Pass 2</Badge>
      </div>
      <div style={{
        background: '#1a1410',
        border: '1px solid #3d2e1a',
        borderRadius: 'var(--radius-md)',
        padding: 24,
        minHeight: 300,
      }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Badge style={{ background: '#f9731622', color: '#f97316' }}>3 Issues</Badge>
          <Badge style={{ background: '#fbbf2422', color: '#fbbf24' }}>5 Suggestions</Badge>
          <Badge style={{ background: '#4ade8022', color: '#4ade80' }}>2 Strengths</Badge>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#d4a574', lineHeight: 1.8 }}>
          <p style={{ marginBottom: 12 }}>
            <strong style={{ color: '#f97316' }}>Issue:</strong> Marcus's dialogue in the confrontation scene (lines 34-41) sounds too formal for someone in emotional crisis. His register should drop — shorter sentences, fragments, raw vocabulary.
          </p>
          <p style={{ marginBottom: 12 }}>
            <strong style={{ color: '#fbbf24' }}>Suggestion:</strong> The physical description of the hallway before Elena opens the door is doing important tension work. Consider extending it — the reader needs to feel her hesitation before the reveal.
          </p>
          <p>
            <strong style={{ color: '#4ade80' }}>Strength:</strong> The emotional trajectory from dread → shock → fury → quiet grief is perfectly paced. The fury is brief and cathartic — the grief that replaces it is the real payload. Don't change this.
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <Button variant="primary">Accept All</Button>
        <Button variant="secondary">Review One by One</Button>
        <Button variant="ghost">Dismiss</Button>
      </div>
    </div>
  );
}

function ReaderMode() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Chapter 5 — The Reckoning</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Volume2 size={16} /></button>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Settings size={16} /></button>
        </div>
      </div>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.05rem', lineHeight: 2, color: 'var(--text-primary)' }}>
        <p style={{ marginBottom: 20, textIndent: '2em' }}>
          Elena stood in the hallway for what felt like hours, though the clock above the doorframe said it had been eleven seconds. Her hand hovered over the brass handle — cool, she knew, because she'd touched it a thousand times before, in a life that now felt borrowed.
        </p>
        <p style={{ marginBottom: 20, textIndent: '2em' }}>
          Behind the door, Marcus was waiting. Not pacing — he never paced. He would be sitting in the chair by the window, the one with the cracked leather arm, watching the street below as if the answer to everything might walk past.
        </p>
        <p style={{ textIndent: '2em', color: 'var(--text-secondary)' }}>
          She opened the door.
        </p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 40 }}>
        <Button variant="ghost">← Chapter 4</Button>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', alignSelf: 'center' }}>Page 1 of 8</span>
        <Button variant="ghost">Chapter 6 →</Button>
      </div>
    </div>
  );
}

function ChatMode() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Badge variant="accent">Story Assistant</Badge>
        <Badge variant="muted">The Editor</Badge>
        <Badge variant="muted">Talk to Elena</Badge>
        <Badge variant="muted">Talk to Marcus</Badge>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        <div style={{ alignSelf: 'flex-end', maxWidth: '70%', background: 'var(--accent-glow)', border: '1px solid var(--border)', borderRadius: '16px 16px 4px 16px', padding: '10px 16px', fontSize: '0.85rem' }}>
          What if Marcus knew the truth all along? How would that change the confrontation in Chapter 5?
        </div>
        <div style={{ alignSelf: 'flex-start', maxWidth: '70%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          That's a fascinating what-if. If Marcus already knew, the confrontation shifts from revelation to reckoning — Elena isn't delivering news, she's forcing him to stop pretending. His emotional arc in that scene would change from shock → anger to quiet admission → shame. The wound dynamics would be completely different...
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Ask about your story, brainstorm ideas, or request changes..."
          style={{
            flex: 1, padding: '10px 16px',
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)', fontSize: '0.85rem',
          }}
        />
        <Button variant="primary">Send</Button>
      </div>
    </div>
  );
}

/* ─── Timeline Data ─── */
const timelineCharacters = [
  // ── Main Characters ──
  {
    name: 'Elena', color: '#2dd4bf', gradient: 'linear-gradient(135deg, #2dd4bf, #f472b6)', tier: 'main',
    arc: [3, 4, 6, 5, 8, 9, 7, 10, 6, 4, 5, 3],
    beats: ['Ordinary life', 'Discovers letter', 'Confronts Marcus', 'Investigates past', 'Betrayal revealed', 'Confrontation', 'Grief & doubt', 'Final reckoning', 'Quiet resolve', 'Rebuilding', 'New normal', 'Epilogue'],
    interactions: { Marcus: [0,1,0,1,0,1,1,1,1,0,0,1], Priya: [1,1,0,0,1,0,0,0,1,1,0,0], Thomas: [0,0,0,1,0,0,1,0,0,0,0,0], Ruth: [1,0,0,0,0,0,0,0,1,1,0,0], 'Bishop Lapp': [0,0,0,0,0,1,0,1,0,0,0,0] },
  },
  {
    name: 'Marcus', color: '#818cf8', gradient: 'linear-gradient(135deg, #818cf8, #f97316)', tier: 'main',
    arc: [5, 3, 4, 6, 7, 9, 10, 8, 5, 3, 4, 2],
    beats: ['Keeping secrets', 'Avoidance', 'Deflection', 'Cracking facade', 'Exposed', 'Rage', 'Rock bottom', 'Admission', 'Penance', 'Withdrawal', 'Tentative return', 'Open wound'],
    interactions: { Elena: [0,1,0,1,0,1,1,1,1,0,0,1], Priya: [0,0,1,0,1,0,0,1,0,0,1,0], Thomas: [1,0,0,0,0,1,0,0,0,1,0,0], Ruth: [0,0,0,0,0,0,0,0,0,0,0,0], 'Bishop Lapp': [0,0,0,0,1,0,0,0,0,0,0,0] },
  },
  {
    name: 'Priya', color: '#a78bfa', gradient: 'linear-gradient(135deg, #fbbf24, #a78bfa)', tier: 'main',
    arc: [2, 3, 3, 4, 6, 5, 7, 6, 8, 7, 5, 4],
    beats: ['Background ally', 'Concerned friend', 'Overhears', 'Starts digging', 'Caught in middle', 'Picks a side', 'Confronts Elena', 'Bridge builder', 'Own revelation', 'Taking charge', 'Mediator', 'New path'],
    interactions: { Elena: [1,1,0,0,1,0,0,0,1,1,0,0], Marcus: [0,0,1,0,1,0,0,1,0,0,1,0], Thomas: [0,0,0,0,0,0,1,0,0,1,1,0], Ruth: [0,1,0,0,0,0,0,0,0,0,0,0], 'Bishop Lapp': [0,0,0,0,0,0,0,0,0,0,0,0] },
  },
  // ── Minor Characters ──
  {
    name: 'Thomas', color: '#6ee7b7', gradient: 'linear-gradient(135deg, #6ee7b7, #60a5fa)', tier: 'minor',
    arc: [1, 1, 2, 3, 2, 4, 5, 3, 2, 3, 2, 1],
    beats: ['Peripheral', 'Mentioned', 'Brief scene', 'Key info', 'Absent', 'Catalyst', 'Complication', 'Fades', 'Minor role', 'Small return', 'Background', 'Coda'],
    interactions: { Elena: [0,0,0,1,0,0,1,0,0,0,0,0], Marcus: [1,0,0,0,0,1,0,0,0,1,0,0], Priya: [0,0,0,0,0,0,1,0,0,1,1,0] },
  },
  {
    name: 'Ruth', color: '#f9a8d4', gradient: 'linear-gradient(135deg, #f9a8d4, #818cf8)', tier: 'minor',
    arc: [2, 1, 0, 0, 0, 0, 0, 0, 3, 4, 2, 1],
    beats: ['Present', 'Fades', '—', '—', '—', '—', '—', '—', 'Returns', 'Key scene', 'Support', 'Coda'],
    interactions: { Elena: [1,0,0,0,0,0,0,0,1,1,0,0], Priya: [0,1,0,0,0,0,0,0,0,0,0,0] },
  },
  {
    name: 'Bishop Lapp', color: '#94a3b8', gradient: 'linear-gradient(135deg, #94a3b8, #475569)', tier: 'minor',
    arc: [0, 0, 0, 1, 2, 4, 1, 3, 0, 0, 0, 0],
    beats: ['—', '—', '—', 'Mentioned', 'Warning', 'Judgment', 'Recedes', 'Final word', '—', '—', '—', '—'],
    interactions: { Elena: [0,0,0,0,0,1,0,1,0,0,0,0], Marcus: [0,0,0,0,1,0,0,0,0,0,0,0] },
  },
];

// The main plot spine (fate/time thread)
const plotSpine = [4, 4, 5, 5, 7, 8, 9, 10, 7, 5, 4, 3];

// Act structure — three-act breakdown
const acts = [
  { label: 'Act 1 — Setup', start: 0, end: 3, color: 'rgba(96, 165, 250, 0.05)', borderColor: 'rgba(96, 165, 250, 0.15)', labelColor: '#60a5fa' },
  { label: 'Act 2 — Confrontation', start: 3, end: 9, color: 'rgba(249, 115, 22, 0.05)', borderColor: 'rgba(249, 115, 22, 0.12)', labelColor: '#f97316' },
  { label: 'Act 3 — Resolution', start: 9, end: 12, color: 'rgba(74, 222, 128, 0.05)', borderColor: 'rgba(74, 222, 128, 0.15)', labelColor: '#4ade80' },
];

// SVG helper: build a smooth curve path through points
function buildPath(points, width, height, maxVal = 10, smooth = true) {
  const stepX = width / (points.length - 1);
  const coords = points.map((v, i) => ({ x: i * stepX, y: height - (v / maxVal) * height }));
  if (!smooth) {
    return coords.map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`)).join(' ');
  }
  // Catmull-Rom to Bezier for smooth curves
  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(i - 1, 0)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(i + 2, coords.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/* ─── Interwoven Threads View (Overview) ─── */
function ThreadsOverview({ onSelectChar, journeyMode, visibleChars }) {
  const W = 900, H = 300, PAD = { top: 30, bottom: 30, left: 10, right: 10 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const chapters = 12;
  const stepX = plotW / (chapters - 1);

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={W} height={H} style={{ display: 'block' }}>
        {/* Act background regions */}
        {acts.map((act) => {
          const x1 = PAD.left + (act.start === 0 ? -5 : (act.start - 0.5) * stepX);
          const x2 = PAD.left + (act.end === 12 ? plotW + 5 : (act.end - 0.5) * stepX);
          return (
            <g key={act.label}>
              <rect
                x={x1} y={PAD.top - 16}
                width={x2 - x1} height={plotH + 18}
                fill={act.color}
                rx={4}
              />
              <line x1={x1} y1={PAD.top - 16} x2={x1} y2={PAD.top + plotH + 2} stroke={act.borderColor} strokeWidth={1} strokeDasharray="3 3" />
              <text
                x={(x1 + x2) / 2} y={PAD.top - 6}
                textAnchor="middle" fill={act.labelColor} fontSize={9} fontWeight={600} opacity={0.7}
              >
                {act.label}
              </text>
            </g>
          );
        })}

        {/* Chapter grid lines */}
        {Array.from({ length: chapters }, (_, i) => {
          const x = PAD.left + i * stepX;
          return (
            <g key={i}>
              <line x1={x} y1={PAD.top} x2={x} y2={H - PAD.bottom} stroke="rgba(100,116,139,0.1)" strokeWidth={1} />
              <text x={x} y={H - 8} textAnchor="middle" fill="var(--text-muted)" fontSize={10}>Ch {i + 1}</text>
            </g>
          );
        })}

        {/* Plot spine — the thread of fate (thick, translucent) */}
        <path
          d={buildPath(plotSpine, plotW, plotH, 10, !journeyMode)}
          fill="none"
          stroke="rgba(251,191,36,0.25)"
          strokeWidth={journeyMode ? 6 : 4}
          strokeLinecap="round"
          transform={`translate(${PAD.left}, ${PAD.top})`}
        />

        {/* Character threads — interwoven around the spine */}
        {visibleChars.map((char) => {
          const isMinor = char.tier === 'minor';
          return (
            <g key={char.name}>
              {/* Glow */}
              <path
                d={buildPath(char.arc, plotW, plotH, 10, !journeyMode)}
                fill="none"
                stroke={char.color}
                strokeWidth={isMinor ? 2 : 4}
                strokeLinecap="round"
                opacity={isMinor ? 0.08 : 0.15}
                transform={`translate(${PAD.left}, ${PAD.top})`}
              />
              {/* Main line */}
              <path
                d={buildPath(char.arc, plotW, plotH, 10, !journeyMode)}
                fill="none"
                stroke={char.color}
                strokeWidth={isMinor ? 1.2 : 2}
                strokeLinecap="round"
                strokeDasharray={isMinor ? '6 3' : 'none'}
                opacity={isMinor ? 0.6 : 0.85}
                transform={`translate(${PAD.left}, ${PAD.top})`}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectChar(char.name)}
              />
              {/* Data points */}
              {char.arc.map((v, i) => {
                if (isMinor && v === 0) return null; // skip empty chapters for minors
                const cx = PAD.left + i * stepX;
                const cy = PAD.top + plotH - (v / 10) * plotH;
                return (
                  <circle
                    key={i}
                    cx={cx} cy={cy} r={isMinor ? (i < 6 ? 2.5 : 2) : (i < 6 ? 4 : 2.5)}
                    fill={i < 6 ? char.color : 'var(--bg-tertiary)'}
                    stroke={char.color}
                    strokeWidth={isMinor ? 1 : 1.5}
                    opacity={i < 6 ? (isMinor ? 0.7 : 1) : 0.4}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectChar(char.name)}
                  />
                );
              })}
            </g>
          );
        })}

        {/* Y-axis label */}
        <text x={4} y={PAD.top + 4} fill="var(--text-muted)" fontSize={8} textAnchor="start">High</text>
        <text x={4} y={H - PAD.bottom - 2} fill="var(--text-muted)" fontSize={8} textAnchor="start">Low</text>
      </svg>

      {/* Character legend — clickable, grouped */}
      <div style={{ display: 'flex', gap: 12, padding: '8px 0', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'rgba(251,191,36,0.6)' }}>
          <span style={{ width: 16, height: 3, background: 'rgba(251,191,36,0.4)', borderRadius: 2, display: 'inline-block' }} />
          Plot Spine
        </span>
        <span style={{ width: 1, height: 12, background: 'var(--border)' }} />
        {visibleChars.filter(c => c.tier === 'main').map((c) => (
          <span
            key={c.name}
            onClick={() => onSelectChar(c.name)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: c.color, cursor: 'pointer', fontWeight: 600 }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, display: 'inline-block' }} />
            {c.name}
          </span>
        ))}
        {visibleChars.some(c => c.tier === 'minor') && (
          <>
            <span style={{ width: 1, height: 12, background: 'var(--border)' }} />
            {visibleChars.filter(c => c.tier === 'minor').map((c) => (
              <span
                key={c.name}
                onClick={() => onSelectChar(c.name)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', color: c.color, cursor: 'pointer', fontWeight: 400, opacity: 0.8 }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, display: 'inline-block', border: `1px dashed ${c.color}` }} />
                {c.name}
              </span>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Single Character Arc Detail ─── */
function CharacterArcDetail({ charName, onBack, onSelectChar, journeyMode }) {
  const char = timelineCharacters.find(c => c.name === charName);
  if (!char) return null;
  const others = timelineCharacters.filter(c => c.name !== charName);

  const W = 900, H = 240, PAD = { top: 20, bottom: 30, left: 10, right: 10 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const chapters = 12;
  const stepX = plotW / (chapters - 1);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>← All Characters</button>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: char.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000' }}>{char.name[0]}</div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: char.color }}>{char.name}'s Arc</h3>
        <div style={{ flex: 1 }} />
        {others.map((o) => (
          <span
            key={o.name}
            onClick={() => onSelectChar(o.name)}
            style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.7rem', color: o.color, cursor: 'pointer', padding: '3px 8px', borderRadius: 100, border: `1px solid ${o.color}33` }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: o.color }} />
            {o.name}
          </span>
        ))}
      </div>

      {/* Main arc chart */}
      <div style={{ overflowX: 'auto' }}>
        <svg width={W} height={H} style={{ display: 'block' }}>
          {/* Grid */}
          {Array.from({ length: chapters }, (_, i) => {
            const x = PAD.left + i * stepX;
            return (
              <g key={i}>
                <line x1={x} y1={PAD.top} x2={x} y2={H - PAD.bottom} stroke="rgba(100,116,139,0.1)" strokeWidth={1} />
                <text x={x} y={H - 8} textAnchor="middle" fill="var(--text-muted)" fontSize={10}>Ch {i + 1}</text>
              </g>
            );
          })}

          {/* Ghost lines for other characters (dimmed) */}
          {others.map((o) => (
            <path
              key={o.name}
              d={buildPath(o.arc, plotW, plotH, 10, !journeyMode)}
              fill="none"
              stroke={o.color}
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.2}
              transform={`translate(${PAD.left}, ${PAD.top})`}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectChar(o.name)}
            />
          ))}

          {/* Interaction markers */}
          {others.map((o) => {
            const interactions = char.interactions[o.name] || [];
            return interactions.map((val, i) => {
              if (!val) return null;
              const cx = PAD.left + i * stepX;
              const cy = PAD.top + plotH - (char.arc[i] / 10) * plotH;
              return (
                <g key={`${o.name}-${i}`}>
                  <line
                    x1={cx} y1={cy}
                    x2={cx} y2={PAD.top + plotH - (o.arc[i] / 10) * plotH}
                    stroke={o.color} strokeWidth={1} strokeDasharray="2 2" opacity={0.3}
                  />
                  <circle cx={cx} cy={cy} r={6} fill="none" stroke={o.color} strokeWidth={1.5} opacity={0.5} />
                </g>
              );
            });
          })}

          {/* Fill area under main arc */}
          <path
            d={buildPath(char.arc, plotW, plotH, 10, !journeyMode) + ` L ${plotW} ${plotH} L 0 ${plotH} Z`}
            fill={char.color}
            opacity={0.06}
            transform={`translate(${PAD.left}, ${PAD.top})`}
          />

          {/* Main arc — thick, glowing */}
          <path
            d={buildPath(char.arc, plotW, plotH, 10, !journeyMode)}
            fill="none"
            stroke={char.color}
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.2}
            transform={`translate(${PAD.left}, ${PAD.top})`}
          />
          <path
            d={buildPath(char.arc, plotW, plotH, 10, !journeyMode)}
            fill="none"
            stroke={char.color}
            strokeWidth={2.5}
            strokeLinecap="round"
            transform={`translate(${PAD.left}, ${PAD.top})`}
          />

          {/* Data points with beat labels */}
          {char.arc.map((v, i) => {
            const cx = PAD.left + i * stepX;
            const cy = PAD.top + plotH - (v / 10) * plotH;
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={5} fill={char.color} stroke="var(--bg-primary)" strokeWidth={2} />
                <text
                  x={cx}
                  y={cy - 10}
                  textAnchor="middle"
                  fill={char.color}
                  fontSize={8}
                  fontWeight={500}
                  opacity={0.8}
                >
                  {char.beats[i]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interaction grid for this character */}
      <div style={{ marginTop: 16 }}>
        <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
          Interactions
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 2, paddingLeft: 80, marginBottom: 4 }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} style={{ width: 60, textAlign: 'center', fontSize: '0.6rem', color: 'var(--text-muted)' }}>Ch {i + 1}</div>
            ))}
          </div>
          {others.map((o) => {
            const interactions = char.interactions[o.name] || [];
            return (
              <div key={o.name} style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                <span
                  onClick={() => onSelectChar(o.name)}
                  style={{ width: 80, fontSize: '0.7rem', color: o.color, textAlign: 'right', paddingRight: 8, cursor: 'pointer', fontWeight: 500, flexShrink: 0 }}
                >
                  {o.name}
                </span>
                <div style={{ display: 'flex', gap: 2 }}>
                  {interactions.map((val, i) => (
                    <div key={i} style={{
                      width: 60, height: 20, borderRadius: 3,
                      background: val ? `${o.color}33` : 'var(--bg-tertiary)',
                      border: val ? `1px solid ${o.color}55` : '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {val ? <span style={{ width: 6, height: 6, borderRadius: '50%', background: o.color }} /> : null}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Timeline Mode (Redesigned) ─── */
function TimelineMode() {
  const [view, setView] = useState('overview'); // 'overview' | 'character'
  const [selectedChar, setSelectedChar] = useState(null);
  const [journeyMode, setJourneyMode] = useState(true);
  const [showMain, setShowMain] = useState(true);
  const [showMinor, setShowMinor] = useState(true);

  const visibleChars = timelineCharacters.filter(c =>
    (c.tier === 'main' && showMain) || (c.tier === 'minor' && showMinor)
  );

  const handleSelectChar = (name) => {
    setSelectedChar(name);
    setView('character');
  };

  return (
    <div style={{ padding: 20, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Story Timeline</h2>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Character group toggles */}
          <button
            onClick={() => setShowMain(!showMain)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', borderRadius: 100, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer',
              background: showMain ? 'rgba(240,160,80,0.15)' : 'transparent',
              border: showMain ? '1px solid var(--accent)' : '1px solid var(--border)',
              color: showMain ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            Main ({timelineCharacters.filter(c => c.tier === 'main').length})
          </button>
          <button
            onClick={() => setShowMinor(!showMinor)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', borderRadius: 100, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer',
              background: showMinor ? 'rgba(148,163,184,0.15)' : 'transparent',
              border: showMinor ? '1px solid #94a3b8' : '1px solid var(--border)',
              color: showMinor ? '#94a3b8' : 'var(--text-muted)',
            }}
          >
            Minor ({timelineCharacters.filter(c => c.tier === 'minor').length})
          </button>
          <span style={{ width: 1, height: 16, background: 'var(--border)' }} />
          {/* View mode */}
          <Badge
            variant={journeyMode ? 'accent' : 'muted'}
            style={{ cursor: 'pointer' }}
            onClick={() => setJourneyMode(true)}
          >
            Journey
          </Badge>
          <Badge
            variant={!journeyMode ? 'accent' : 'muted'}
            style={{ cursor: 'pointer' }}
            onClick={() => setJourneyMode(false)}
          >
            Linear
          </Badge>
          <span style={{ width: 1, height: 16, background: 'var(--border)' }} />
          <Badge variant="muted">Plan</Badge>
          <Badge variant="muted">Reality</Badge>
          <Badge variant="accent">Both</Badge>
        </div>
      </div>

      {view === 'overview' && (
        <ThreadsOverview onSelectChar={handleSelectChar} journeyMode={journeyMode} visibleChars={visibleChars} />
      )}
      {view === 'character' && selectedChar && (
        <CharacterArcDetail
          charName={selectedChar}
          onBack={() => setView('overview')}
          onSelectChar={handleSelectChar}
          journeyMode={journeyMode}
        />
      )}

      {/* Drafted vs planned indicator */}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-secondary)', display: 'inline-block' }} />
          Solid dots = drafted chapters
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', border: '1px solid var(--text-muted)', display: 'inline-block' }} />
          Hollow dots = planned
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 0, borderTop: '1px dashed var(--text-muted)', display: 'inline-block' }} />
          Dashed = interaction link
        </span>
      </div>
    </div>
  );
}

function DrawingBoard() {
  const items = [
    { type: 'note', text: '"What if the detective is lying too?"', used: false },
    { type: 'image', label: 'Fog bridge reference', used: 'hallmarks/bridge' },
    { type: 'note', text: 'Marcus backstory — grew up in foster care, first arrest at 16', used: 'characters/marcus.md' },
    { type: 'draft', text: 'Ch.3 opening alternate version', used: false },
    { type: 'note', text: 'Mennonite funeral customs — check wiki', used: 'world/hallmarks' },
    { type: 'image', label: 'Council hall interior ref', used: 'hallmarks/council-hall' },
  ];

  return (
    <div style={{ padding: 20, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>The Drawing Board</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Badge variant="accent">Board</Badge>
          <Badge variant="muted">List</Badge>
          <Badge variant="muted">Gallery</Badge>
          <Badge variant="muted">Unlinked</Badge>
          <Button size="sm" variant="secondary">+ Add</Button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {items.map((item, i) => (
          <Card key={i} style={{ padding: 14 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              {item.type === 'note' ? '📝 Note' : item.type === 'image' ? '🖼 Image' : '📄 Draft'}
            </div>
            <div style={{ fontSize: '0.8rem', marginBottom: 8, lineHeight: 1.5 }}>
              {item.text || item.label}
            </div>
            {item.type === 'image' && (
              <div style={{
                height: 60, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
                marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', fontSize: '0.7rem',
              }}>
                [image preview]
              </div>
            )}
            <div style={{ fontSize: '0.7rem' }}>
              {item.used ? (
                <span style={{ color: 'var(--health-exceptional)' }}>Used in: → {item.used}</span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Not yet used</span>
              )}
            </div>
          </Card>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Groups: </span>
        {['Characters', 'World Research', 'Alternate Ideas', 'Unsorted'].map((g) => (
          <Badge key={g} variant="muted" style={{ marginRight: 4, cursor: 'pointer' }}>{g}</Badge>
        ))}
      </div>
    </div>
  );
}

function PlaceholderMode({ name }) {
  return (
    <div style={{ padding: 40, textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>{name}</h2>
      <p style={{ color: 'var(--text-muted)' }}>This mode will be built out with full interactivity.</p>
    </div>
  );
}

/* ─── Phase Colors ─── */
const phaseColors = {
  1: '#818cf8', // Author — indigo
  2: '#a78bfa', // Narrator — violet
  3: '#2dd4bf', // World — teal
  4: '#f472b6', // Characters — pink
  5: '#f9a8d4', // Relationships — rose
  6: '#fbbf24', // Story Foundation — amber
  7: '#60a5fa', // MetaFiles Review — blue
  8: '#f97316', // Chapter Execution — orange
  9: '#4ade80', // Editor — green
  10: '#e879f9', // Polish — fuchsia
};

const phaseNames = {
  1: 'Phase 1 — Author',
  2: 'Phase 2 — Narrator',
  3: 'Phase 3 — World',
  4: 'Phase 4 — Characters',
  5: 'Phase 5 — Relationships',
  6: 'Phase 6 — Story Foundation',
  7: 'Phase 7 — MetaFiles Review',
  8: 'Phase 8 — Chapter Execution',
  9: 'Phase 9 — Editor',
  10: 'Phase 10 — Polish',
};

function BottomStatusBar({ currentPhase, wordCount, wordLimit, onPhaseClick, onOverLimitClick }) {
  const isOver = wordCount > wordLimit;
  const pColor = phaseColors[currentPhase] || 'var(--text-muted)';
  const pName = phaseNames[currentPhase] || `Phase ${currentPhase}`;

  const fmtCount = wordCount.toLocaleString();
  const fmtLimit = wordLimit.toLocaleString();

  return (
    <div style={{
      height: 32,
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      fontSize: '0.7rem',
      color: 'var(--text-muted)',
      gap: 16,
    }}>
      {/* Phase — clickable, colored per phase */}
      <span
        onClick={onPhaseClick}
        style={{ color: pColor, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
        title="Go to phase list"
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: pColor, display: 'inline-block' }} />
        {pName}
      </span>

      <span style={{ color: 'var(--border)' }}>|</span>

      {/* Word Count — turns red when over limit */}
      {isOver ? (
        <span
          onClick={onOverLimitClick}
          style={{ color: '#ef4444', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
          title="Over word limit — click for help trimming"
        >
          <AlertTriangle size={11} />
          {fmtCount} / {fmtLimit} words (+{(wordCount - wordLimit).toLocaleString()} over)
        </span>
      ) : (
        <span>{fmtCount} / {fmtLimit} words</span>
      )}

      <span style={{ color: 'var(--border)' }}>|</span>
      <span>Auto-saved</span>
      <div style={{ flex: 1 }} />
      <span>Novel (Adult) · Literary Fiction + Thriller</span>
    </div>
  );
}

/* ─── Persistent Quick Chat ─── */
function QuickChat({ expanded, onToggle, onOpenFull, onSetMode }) {
  const [msg, setMsg] = useState('');
  const [focused, setFocused] = useState(false);

  const bgStyle = {
    background: 'linear-gradient(135deg, #1a1028 0%, #0f1a2e 50%, #0f1117 100%)',
    borderTop: '1px solid rgba(167, 139, 250, 0.2)',
  };

  // Collapsed: a single-line input pill
  if (!expanded) {
    return (
      <div style={{ ...bgStyle, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          onClick={onToggle}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            background: 'rgba(167, 139, 250, 0.08)',
            border: '1px solid rgba(167, 139, 250, 0.25)',
            borderRadius: 100,
            cursor: 'text',
            transition: 'all 0.2s ease',
          }}
        >
          <MessageSquare size={14} color="#a78bfa" />
          <span style={{ fontSize: '0.8rem', color: 'rgba(167, 139, 250, 0.7)', fontWeight: 400 }}>
            Ask about your story, brainstorm ideas, or request changes...
          </span>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: 'rgba(167, 139, 250, 0.1)',
            border: '1px solid rgba(167, 139, 250, 0.2)',
            borderRadius: 100,
            color: '#a78bfa',
            cursor: 'pointer',
            padding: '5px 8px',
            display: 'flex', alignItems: 'center',
          }}
          title="Expand chat"
        >
          <ChevronUp size={14} />
        </button>
      </div>
    );
  }

  // Expanded: full chat input area with same treatment
  return (
    <div style={{
      ...bgStyle,
      padding: '10px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <MessageSquare size={13} color="#a78bfa" />
        <span style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 600 }}>Quick Chat</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => { onSetMode('chat'); onToggle(); }}
          style={{
            background: 'rgba(167, 139, 250, 0.1)',
            border: '1px solid rgba(167, 139, 250, 0.2)',
            borderRadius: 100,
            color: '#a78bfa',
            cursor: 'pointer',
            padding: '3px 10px',
            fontSize: '0.68rem',
            fontWeight: 500,
          }}
        >
          Open Full Story Assistant
        </button>
        <button
          onClick={onToggle}
          style={{
            background: 'rgba(167, 139, 250, 0.1)',
            border: '1px solid rgba(167, 139, 250, 0.2)',
            borderRadius: 100,
            color: '#a78bfa',
            cursor: 'pointer',
            padding: '5px 8px',
            display: 'flex', alignItems: 'center',
          }}
        >
          <ChevronDown size={13} />
        </button>
      </div>
      {/* Input area */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Ask about your story, brainstorm ideas, or request changes..."
          rows={2}
          style={{
            flex: 1, padding: '10px 16px',
            background: 'rgba(167, 139, 250, 0.06)',
            border: focused ? '1px solid rgba(167, 139, 250, 0.4)' : '1px solid rgba(167, 139, 250, 0.15)',
            borderRadius: 16, color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)', fontSize: '0.8rem', resize: 'vertical',
            minHeight: 44, maxHeight: 160,
            outline: 'none',
            transition: 'border-color 0.2s ease',
          }}
        />
        <button
          style={{
            background: '#a78bfa',
            border: 'none',
            borderRadius: 100,
            color: '#000',
            cursor: 'pointer',
            padding: '8px 16px',
            fontSize: '0.78rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

/* ─── Main Workspace ─── */
export default function WorkspaceScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || 'guided';
  const [activeMode, setActiveMode] = useState(initialMode);
  const [leftTab, setLeftTab] = useState('phases');
  const [expandedDim, setExpandedDim] = useState(null);
  const [quickChatOpen, setQuickChatOpen] = useState(false);
  const [overLimitPrompt, setOverLimitPrompt] = useState(false);

  // Word count state — in production this comes from the actual manuscript files
  const wordCount = 72450;
  const wordLimit = 70000;

  const renderCenter = () => {
    switch (activeMode) {
      case 'guided': return <GuidedFlow />;
      case 'editor': return <EditorMode />;
      case 'reader': return <ReaderMode />;
      case 'chat': return <ChatMode />;
      case 'timeline': return <TimelineMode />;
      case 'board': return <DrawingBoard />;
      default: return <PlaceholderMode name={centerStageModes.find(m => m.key === activeMode)?.label || activeMode} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar
        projectName="The Shunning Season"
        healthRating={4}
        onHealthClick={() => {
          const el = document.getElementById('project-health-section');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ─── Thread List (far left) ─── */}
        <div style={{
          width: 52,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 8,
          gap: 4,
        }}>
          <div onClick={() => navigate('/hub')} style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, #818cf8, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', border: '2px solid var(--accent)' }} title="The Shunning Season">TS</div>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, #2dd4bf, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', opacity: 0.5 }} title="Orbital Decay">OD</div>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, #fbbf24, #f472b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', opacity: 0.5 }} title="Gatsby">GD</div>
          <div style={{ flex: 1 }} />
          <div onClick={() => navigate('/wizard')} style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)', marginBottom: 8 }} title="New Story">+</div>
        </div>

        {/* ─── Left Nav ─── */}
        <div style={{
          width: 240,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {[
              { key: 'phases', label: 'Phases' },
              { key: 'cast', label: 'Cast' },
              { key: 'files', label: 'Files' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setLeftTab(t.key)}
                style={{
                  flex: 1, padding: '8px 0', border: 'none', fontSize: '0.75rem', cursor: 'pointer',
                  background: leftTab === t.key ? 'var(--accent-glow)' : 'transparent',
                  color: leftTab === t.key ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight: leftTab === t.key ? 600 : 400,
                  borderBottom: leftTab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {leftTab === 'phases' && <PhaseProgress currentPhase={3} />}
            {leftTab === 'cast' && <CastRoster />}
            {leftTab === 'files' && (
              <div style={{ fontSize: '0.8rem' }}>
                {fileTree.map((f) => (
                  <div key={f.name}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', cursor: 'pointer', color: f.exists ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                      {f.children ? <FolderTree size={13} /> : <FileText size={13} />}
                      <span>{f.name}</span>
                    </div>
                    {f.children && f.children.map((c) => (
                      <div key={c} style={{ paddingLeft: 24, fontSize: '0.75rem', color: 'var(--text-muted)', padding: '2px 0 2px 24px', cursor: 'pointer' }}>
                        {c}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Download */}
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
            <Button variant="ghost" size="sm" style={{ width: '100%', justifyContent: 'center' }}>
              <Download size={13} /> Export Project
            </Button>
          </div>
        </div>

        {/* ─── Center Stage ─── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Mode Tabs */}
          <div style={{
            display: 'flex',
            gap: 2,
            padding: '4px 8px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
            overflowX: 'auto',
          }}>
            {centerStageModes.map((m) => {
              const Icon = m.icon;
              const isActive = activeMode === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setActiveMode(m.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap',
                    background: isActive ? 'var(--accent-glow)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <Icon size={13} />
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-primary)' }}>
            {renderCenter()}
          </div>
        </div>

        {/* ─── Right Sidebar ─── */}
        <div style={{
          width: 280,
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {/* Section 1: Next Steps */}
            <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
              Next Steps
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
              {[
                'Answer hallmarks questions (3 remaining)',
                'Run Seven Deaths audit',
                'Review world diagnostic',
                'Begin Phase 4 — Characters',
              ].map((step, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 8px', fontSize: '0.8rem', color: 'var(--text-secondary)',
                  cursor: 'pointer', borderRadius: 'var(--radius-sm)',
                }}>
                  <span style={{ color: 'var(--accent)' }}>→</span>
                  {step}
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />

            {/* Section 2: Project Health */}
            <h4 id="project-health-section" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
              Project Health
            </h4>
            <HealthBar rating={4} style={{ marginBottom: 12 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
              {healthDimensions.map((d) => (
                <div key={d.name}>
                  <div
                    onClick={() => setExpandedDim(expandedDim === d.name ? null : d.name)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', cursor: 'pointer' }}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                    <HealthBar rating={d.rating} showLabel={false} size="sm" style={{ width: 60 }} />
                  </div>
                  {d.flag && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--health-developing)', paddingLeft: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={10} /> {d.flag}
                    </div>
                  )}
                  {expandedDim === d.name && (
                    <div style={{ padding: '8px 8px 8px 12px', fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', margin: '4px 0' }}>
                      Click to view full breakdown with sub-factors and suggestions.
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Needs Attention */}
            <div style={{
              background: 'rgba(249, 115, 22, 0.06)',
              border: '1px solid rgba(249, 115, 22, 0.15)',
              borderRadius: 'var(--radius-sm)',
              padding: 10,
              marginBottom: 16,
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--health-needs-work)', marginBottom: 6 }}>
                Needs Your Attention
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                → Character Depth: Developing (2 issues)<br />
                → World Integrity: Seven Deaths audit incomplete
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />

            {/* Section 3: Teaching Tip */}
            <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
              Teaching Tip
            </h4>
            <Card style={{ padding: 12, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <Lightbulb size={13} color="var(--accent)" style={{ marginBottom: 4 }} />
              <p>Hallmarks are the physical texture of your world. The reader won't remember your theme statement — they'll remember the prayer cap, the gas lamp, the county line. Make them specific enough to photograph.</p>
            </Card>
          </div>
        </div>
      </div>

      {/* ─── Persistent Quick Chat ─── */}
      {activeMode !== 'chat' && (
        <QuickChat
          expanded={quickChatOpen}
          onToggle={() => setQuickChatOpen(!quickChatOpen)}
          onSetMode={setActiveMode}
        />
      )}

      {/* ─── Bottom Bar ─── */}
      <BottomStatusBar
        currentPhase={3}
        wordCount={wordCount}
        wordLimit={wordLimit}
        onPhaseClick={() => setLeftTab('phases')}
        onOverLimitClick={() => { setActiveMode('chat'); setOverLimitPrompt(true); }}
      />
    </div>
  );
}
