import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Code, Undo, Redo, Eye, Edit3 } from 'lucide-react';

/**
 * MarkdownEditor — A WYSIWYG/source toggle editor for phase answer textboxes.
 *
 * Props:
 *   value: string — current content (plain text or markdown)
 *   onChange: (string) => void — called when content changes
 *   placeholder: string — placeholder text
 *   minHeight: number — minimum height in px (default 120)
 *   style: object — additional styles for the wrapper
 */
export default function MarkdownEditor({ value = '', onChange, placeholder = 'Your answer...', minHeight = 120, style = {} }) {
  const [mode, setMode] = useState('visual'); // 'visual' | 'source'

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: markdownToHtml(value),
    onUpdate: ({ editor }) => {
      if (onChange) {
        const md = htmlToMarkdown(editor.getHTML());
        onChange(md);
      }
    },
    editorProps: {
      attributes: {
        style: `min-height: ${minHeight - 40}px; outline: none; padding: 12px; font-size: 0.9rem; line-height: 1.7; color: var(--text-primary); font-family: var(--font-sans);`,
      },
    },
  });

  // Sync external value changes into editor (e.g. AI suggestion applied)
  useEffect(() => {
    if (editor && mode === 'visual') {
      const currentMd = htmlToMarkdown(editor.getHTML());
      if (currentMd !== value) {
        editor.commands.setContent(markdownToHtml(value), false);
      }
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSourceChange = useCallback((e) => {
    if (onChange) onChange(e.target.value);
  }, [onChange]);

  const handleModeSwitch = useCallback((newMode) => {
    if (newMode === 'visual' && editor) {
      editor.commands.setContent(markdownToHtml(value), false);
    }
    setMode(newMode);
  }, [editor, value]);

  const hasContent = value && value.trim().length > 0;

  return (
    <div style={{
      border: hasContent ? '1px solid var(--accent-border)' : '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      background: hasContent ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
      overflow: 'hidden',
      ...style,
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '4px 8px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-tertiary)',
        flexWrap: 'wrap',
      }}>
        {/* Mode toggle */}
        <div style={{
          display: 'flex',
          gap: 0,
          marginRight: 8,
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}>
          <button
            onClick={() => handleModeSwitch('visual')}
            style={{
              background: mode === 'visual' ? 'var(--accent)' : 'transparent',
              color: mode === 'visual' ? '#fff' : 'var(--text-muted)',
              border: 'none', padding: '3px 8px', fontSize: '0.65rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3,
              fontWeight: mode === 'visual' ? 600 : 400,
            }}
            title="Visual editor"
          >
            <Eye size={11} /> Visual
          </button>
          <button
            onClick={() => handleModeSwitch('source')}
            style={{
              background: mode === 'source' ? 'var(--accent)' : 'transparent',
              color: mode === 'source' ? '#fff' : 'var(--text-muted)',
              border: 'none', padding: '3px 8px', fontSize: '0.65rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3,
              fontWeight: mode === 'source' ? 600 : 400,
            }}
            title="Markdown source"
          >
            <Edit3 size={11} /> Markdown
          </button>
        </div>

        {/* Formatting buttons (visual mode only) */}
        {mode === 'visual' && editor && (
          <>
            <ToolbarBtn
              icon={<Bold size={13} />}
              active={editor.isActive('bold')}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold"
            />
            <ToolbarBtn
              icon={<Italic size={13} />}
              active={editor.isActive('italic')}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic"
            />
            <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 4px' }} />
            <ToolbarBtn
              icon={<Heading1 size={13} />}
              active={editor.isActive('heading', { level: 1 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              title="Heading 1"
            />
            <ToolbarBtn
              icon={<Heading2 size={13} />}
              active={editor.isActive('heading', { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              title="Heading 2"
            />
            <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 4px' }} />
            <ToolbarBtn
              icon={<List size={13} />}
              active={editor.isActive('bulletList')}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bullet list"
            />
            <ToolbarBtn
              icon={<ListOrdered size={13} />}
              active={editor.isActive('orderedList')}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered list"
            />
            <ToolbarBtn
              icon={<Code size={13} />}
              active={editor.isActive('codeBlock')}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              title="Code block"
            />
            <div style={{ flex: 1 }} />
            <ToolbarBtn
              icon={<Undo size={13} />}
              onClick={() => editor.chain().focus().undo().run()}
              title="Undo"
            />
            <ToolbarBtn
              icon={<Redo size={13} />}
              onClick={() => editor.chain().focus().redo().run()}
              title="Redo"
            />
          </>
        )}
      </div>

      {/* Editor content area */}
      {mode === 'visual' ? (
        <div className="tiptap-editor-wrapper" style={{ minHeight }}>
          <EditorContent editor={editor} />
        </div>
      ) : (
        <textarea
          value={value}
          onChange={handleSourceChange}
          placeholder={placeholder}
          style={{
            width: '100%',
            minHeight,
            padding: 12,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.85rem',
            resize: 'vertical',
            boxSizing: 'border-box',
            outline: 'none',
            lineHeight: 1.6,
          }}
        />
      )}

      {/* TipTap base styles */}
      <style>{`
        .tiptap-editor-wrapper .tiptap {
          min-height: ${minHeight - 40}px;
        }
        .tiptap-editor-wrapper .tiptap p {
          margin: 0 0 0.5em 0;
        }
        .tiptap-editor-wrapper .tiptap h1 {
          font-size: 1.3rem;
          font-weight: 700;
          margin: 0.8em 0 0.4em;
          color: var(--text-primary);
        }
        .tiptap-editor-wrapper .tiptap h2 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0.6em 0 0.3em;
          color: var(--text-primary);
        }
        .tiptap-editor-wrapper .tiptap h3 {
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0.5em 0 0.3em;
          color: var(--text-secondary);
        }
        .tiptap-editor-wrapper .tiptap ul,
        .tiptap-editor-wrapper .tiptap ol {
          padding-left: 1.5em;
          margin: 0.3em 0;
        }
        .tiptap-editor-wrapper .tiptap li {
          margin: 0.15em 0;
        }
        .tiptap-editor-wrapper .tiptap code {
          background: var(--bg-tertiary);
          padding: 2px 4px;
          border-radius: 3px;
          font-size: 0.85em;
        }
        .tiptap-editor-wrapper .tiptap pre {
          background: var(--bg-tertiary);
          padding: 12px;
          border-radius: var(--radius-sm);
          overflow-x: auto;
        }
        .tiptap-editor-wrapper .tiptap blockquote {
          border-left: 3px solid var(--accent);
          padding-left: 12px;
          margin: 0.5em 0;
          color: var(--text-secondary);
        }
        .tiptap-editor-wrapper .tiptap strong {
          font-weight: 700;
        }
        .tiptap-editor-wrapper .tiptap em {
          font-style: italic;
        }
        .tiptap-editor-wrapper .tiptap hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 1em 0;
        }
        .tiptap-editor-wrapper .tiptap .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--text-muted);
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

function ToolbarBtn({ icon, active, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: active ? 'rgba(240,160,80,0.15)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        padding: '4px 6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease',
      }}
    >
      {icon}
    </button>
  );
}

// ── Simple markdown↔html converters ──
// Lightweight: handles headings, bold, italic, lists, code blocks, blockquotes, hr

function markdownToHtml(md) {
  if (!md) return '';
  let html = md
    // Code blocks (must be before other transforms)
    .replace(/```[\s\S]*?```/g, (m) => {
      const code = m.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
      return `<pre><code>${escapeHtml(code)}</code></pre>`;
    })
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // HR
    .replace(/^---+$/gm, '<hr>')
    // Bold + Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Blockquotes
    .replace(/^>\s+(.+)$/gm, '<blockquote><p>$1</p></blockquote>')
    // Lists (simple)
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Wrap remaining plain text lines in <p>
  html = html.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') ||
        trimmed.startsWith('<li') || trimmed.startsWith('<pre') || trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<hr') || trimmed.startsWith('</')) {
      return trimmed;
    }
    return `<p>${trimmed}</p>`;
  }).join('');

  return html;
}

function htmlToMarkdown(html) {
  if (!html) return '';
  let md = html
    // Remove wrapper divs
    .replace(/<div>/g, '').replace(/<\/div>/g, '')
    // Code blocks
    .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, (_, code) => `\`\`\`\n${unescapeHtml(code)}\n\`\`\``)
    // Headings
    .replace(/<h1>(.*?)<\/h1>/g, '# $1')
    .replace(/<h2>(.*?)<\/h2>/g, '## $1')
    .replace(/<h3>(.*?)<\/h3>/g, '### $1')
    // HR
    .replace(/<hr\s*\/?>/g, '---')
    // Bold + Italic
    .replace(/<strong><em>(.*?)<\/em><\/strong>/g, '***$1***')
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    // Inline code
    .replace(/<code>(.*?)<\/code>/g, '`$1`')
    // Blockquotes
    .replace(/<blockquote><p>(.*?)<\/p><\/blockquote>/g, '> $1')
    // Lists
    .replace(/<ul>/g, '').replace(/<\/ul>/g, '')
    .replace(/<ol>/g, '').replace(/<\/ol>/g, '')
    .replace(/<li><p>(.*?)<\/p><\/li>/g, '- $1')
    .replace(/<li>(.*?)<\/li>/g, '- $1')
    // Paragraphs
    .replace(/<p>(.*?)<\/p>/g, '$1\n')
    // Line breaks
    .replace(/<br\s*\/?>/g, '\n')
    // Strip remaining tags
    .replace(/<[^>]+>/g, '');

  return unescapeHtml(md).trim();
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function unescapeHtml(str) {
  return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
}
