/**
 * ManualSplitter — Accordion-based section splitting UI
 *
 * When the automatic section detection can't find boundaries in the uploaded
 * manuscript, this component lets the user manually carve it into sections.
 *
 * Flow:
 * 1. User sees a message explaining auto-detect couldn't split the text
 * 2. They pick a section type (Chapter, Act, Scene, etc.) — defaults based on medium
 * 3. An accordion UI lets them:
 *    a) "Add Section" → creates a new numbered entry
 *    b) Paste or type content into each section's editor
 *    c) Optionally give each section a title
 *    d) Reorder / delete sections
 * 4. "Verify & Continue" finalizes and writes the section files
 *
 * Props:
 *   sourceText     — the full uploaded manuscript (pre-filled into first section)
 *   medium         — story medium key (e.g. 'novel', 'screenplay')
 *   onComplete     — callback({ files: { path: content }, unitLabel, unitSlug })
 *   onCancel       — callback to go back
 */

import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown, ChevronRight, Plus, Trash2, GripVertical,
  Check, AlertTriangle, Scissors, ArrowUp, ArrowDown,
} from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { getAvailableSectionTypes, getSectionUnitForMedium } from '../services/decomposition';

export default function ManualSplitter({ sourceText, medium, onComplete, onCancel }) {
  // Available section types for this medium
  const sectionTypes = getAvailableSectionTypes(medium);
  const defaultUnit = getSectionUnitForMedium(medium);

  const [unitLabel, setUnitLabel] = useState(defaultUnit.label);
  const [unitSlug, setUnitSlug] = useState(defaultUnit.slug);

  // Each section: { id, title, content, expanded }
  const [sections, setSections] = useState([
    { id: crypto.randomUUID(), title: '', content: sourceText || '', expanded: true },
  ]);

  const scrollRef = useRef(null);

  // ── Section CRUD ──────────────────────────────────────────

  const addSection = () => {
    const newSection = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      expanded: true,
    };
    setSections(prev => {
      // Collapse others
      const updated = prev.map(s => ({ ...s, expanded: false }));
      return [...updated, newSection];
    });
    // Scroll to bottom after render
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);
  };

  const removeSection = (id) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const updateSection = (id, field, value) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const toggleExpand = (id) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, expanded: !s.expanded } : s));
  };

  const moveSection = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= sections.length) return;
    setSections(prev => {
      const arr = [...prev];
      [arr[index], arr[newIdx]] = [arr[newIdx], arr[index]];
      return arr;
    });
  };

  // ── Smart Split Helper ────────────────────────────────────
  // If there's only one section with all the text, offer to
  // auto-split on blank lines / visual breaks
  const canAutoSplitOnBreaks = sections.length === 1 && sections[0].content.length > 500;

  const autoSplitOnBreaks = () => {
    const text = sections[0].content;
    // Split on double-blank-lines, dividers (***), or ---
    const parts = text.split(/\n\s*(?:\*\s*\*\s*\*|\*{3,}|-{3,}|={3,})\s*\n|\n{3,}/).filter(p => p.trim());

    if (parts.length < 2) return; // nothing to split

    const newSections = parts.map((part, i) => ({
      id: crypto.randomUUID(),
      title: '',
      content: part.trim(),
      expanded: i === 0,
    }));
    setSections(newSections);
  };

  // ── Verify & Build Files ──────────────────────────────────

  const handleComplete = () => {
    const files = {};
    const validSections = sections.filter(s => s.content.trim());

    validSections.forEach((section, i) => {
      const num = i + 1;
      const titlePart = section.title.trim() ? `: ${section.title.trim()}` : '';
      const header = `# ${unitLabel} ${num}${titlePart}`;
      files[`story/${unitSlug}-${num}.md`] = `${header}\n\n${section.content.trim()}`;
    });

    onComplete({ files, unitLabel, unitSlug });
  };

  const validCount = sections.filter(s => s.content.trim()).length;
  const totalWords = sections.reduce((sum, s) => sum + (s.content.trim().split(/\s+/).filter(Boolean).length), 0);

  // ── Section type selector ─────────────────────────────────

  const handleTypeChange = (slug) => {
    const type = sectionTypes.find(t => t.slug === slug);
    if (type) {
      setUnitLabel(type.label);
      setUnitSlug(type.slug);
    }
  };

  // ── Render ────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Scissors size={36} style={{ color: 'var(--accent)', marginBottom: 12 }} />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
          Manual Section Splitting
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 520, margin: '0 auto' }}>
          We couldn't automatically detect section boundaries in your manuscript.
          Split it manually below — add sections, give them titles, and paste the content for each.
        </p>
      </div>

      {/* Section Type Picker */}
      <Card style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Section type:
          </span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {sectionTypes.map(type => (
              <button
                key={type.slug}
                onClick={() => handleTypeChange(type.slug)}
                style={{
                  padding: '5px 14px',
                  fontSize: '0.8rem',
                  fontWeight: unitSlug === type.slug ? 600 : 400,
                  border: '1px solid',
                  borderColor: unitSlug === type.slug ? 'var(--accent)' : 'var(--border)',
                  borderRadius: 100,
                  background: unitSlug === type.slug ? 'var(--accent-glow)' : 'transparent',
                  color: unitSlug === type.slug ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Auto-split helper */}
      {canAutoSplitOnBreaks && (
        <Card style={{
          padding: '12px 16px',
          marginBottom: 16,
          background: 'var(--accent-glow)',
          border: '1px solid var(--accent)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <AlertTriangle size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flex: 1 }}>
            All your text is in one section. Want to try splitting on paragraph breaks?
          </span>
          <Button variant="secondary" onClick={autoSplitOnBreaks} style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
            Auto-split on breaks
          </Button>
        </Card>
      )}

      {/* Section Accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sections.map((section, index) => {
          const wordCount = section.content.trim().split(/\s+/).filter(Boolean).length;
          const isEmpty = !section.content.trim();

          return (
            <Card
              key={section.id}
              style={{
                overflow: 'hidden',
                border: isEmpty ? '1px dashed var(--border)' : '1px solid var(--border)',
                opacity: isEmpty && !section.expanded ? 0.6 : 1,
              }}
            >
              {/* Accordion Header */}
              <div
                onClick={() => toggleExpand(section.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  cursor: 'pointer',
                  background: section.expanded ? 'var(--bg-secondary)' : 'transparent',
                  borderBottom: section.expanded ? '1px solid var(--border)' : 'none',
                  userSelect: 'none',
                }}
              >
                {section.expanded
                  ? <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                  : <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                }

                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {unitLabel} {index + 1}
                </span>

                {section.title && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    — {section.title}
                  </span>
                )}

                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {wordCount > 0 ? `${wordCount.toLocaleString()} words` : 'empty'}
                </span>

                {/* Move / Delete controls */}
                <div
                  onClick={e => e.stopPropagation()}
                  style={{ display: 'flex', gap: 2, marginLeft: 8 }}
                >
                  <button
                    onClick={() => moveSection(index, -1)}
                    disabled={index === 0}
                    style={{
                      background: 'none', border: 'none', cursor: index > 0 ? 'pointer' : 'default',
                      padding: 2, opacity: index === 0 ? 0.3 : 0.6,
                      color: 'var(--text-muted)',
                    }}
                    title="Move up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    onClick={() => moveSection(index, 1)}
                    disabled={index === sections.length - 1}
                    style={{
                      background: 'none', border: 'none', cursor: index < sections.length - 1 ? 'pointer' : 'default',
                      padding: 2, opacity: index === sections.length - 1 ? 0.3 : 0.6,
                      color: 'var(--text-muted)',
                    }}
                    title="Move down"
                  >
                    <ArrowDown size={13} />
                  </button>
                  {sections.length > 1 && (
                    <button
                      onClick={() => removeSection(section.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: 2, color: 'var(--health-just-started, #ef4444)', opacity: 0.7,
                      }}
                      title="Remove section"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Accordion Body */}
              {section.expanded && (
                <div style={{ padding: 14 }}>
                  {/* Title input */}
                  <input
                    type="text"
                    placeholder={`${unitLabel} title (optional)`}
                    value={section.title}
                    onChange={e => updateSection(section.id, 'title', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      marginBottom: 10,
                      fontSize: '0.85rem',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm, 4px)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />

                  {/* Content textarea */}
                  <textarea
                    placeholder={`Paste the content for ${unitLabel.toLowerCase()} ${index + 1} here...`}
                    value={section.content}
                    onChange={e => updateSection(section.id, 'content', e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: 200,
                      maxHeight: 500,
                      padding: '10px 12px',
                      fontSize: '0.82rem',
                      fontFamily: 'Georgia, serif',
                      lineHeight: 1.7,
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm, 4px)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      resize: 'vertical',
                      outline: 'none',
                    }}
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add Section button */}
      <button
        onClick={addSection}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          width: '100%',
          padding: '12px 0',
          marginTop: 10,
          fontSize: '0.82rem',
          fontWeight: 500,
          color: 'var(--accent)',
          background: 'transparent',
          border: '1px dashed var(--accent)',
          borderRadius: 'var(--radius-sm, 4px)',
          cursor: 'pointer',
          opacity: 0.8,
          transition: 'opacity 0.15s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0.8}
      >
        <Plus size={15} /> Add {unitLabel}
      </button>

      {/* Footer: stats + actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 24,
        paddingTop: 16,
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {validCount} {validCount === 1 ? unitLabel.toLowerCase() : unitLabel.toLowerCase() + 's'} · {totalWords.toLocaleString()} words total
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button
            variant="primary"
            disabled={validCount < 1}
            onClick={handleComplete}
          >
            <Check size={15} style={{ marginRight: 4 }} />
            {validCount >= 2
              ? `Verify & Continue (${validCount} ${unitLabel.toLowerCase()}s)`
              : validCount === 1
                ? `Continue with 1 ${unitLabel.toLowerCase()}`
                : 'Add content to continue'
            }
          </Button>
        </div>
      </div>

      <div ref={scrollRef} />
    </div>
  );
}
