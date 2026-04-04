import { useState, useEffect, useRef } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useLlmStore } from '../stores/llmStore';

export default function CharacterGuide({ currentFile, currentContent }) {
  const projectFiles = useProjectStore(s => s.files);
  const guideCharacterName = useSettingsStore(s => s.guideCharacter);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load character data
  const characterFiles = Object.entries(projectFiles || {})
    .filter(([k]) => k.startsWith('characters/') && k.endsWith('.md') && !k.includes('questions'));

  const characters = characterFiles.map(([path, content]) => {
    const slug = path.replace('characters/', '').replace('.md', '');
    const name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return { name, path, content };
  });

  const guideCharacter = characters.find(c =>
    c.name.toLowerCase() === guideCharacterName?.toLowerCase()
  );

  // Character selector if no guide is set
  if (!guideCharacterName || !guideCharacter) {
    return (
      <div style={{
        position: 'fixed', bottom: 20, right: 20, width: 320,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: 16, zIndex: 100,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>
          Select Your Guide Character
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
          Choose a character to be your writing companion. They'll offer observations from their perspective.
        </div>
        {characters.length === 0 ? (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No characters found. Create characters first.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {characters.map(c => (
              <button
                key={c.path}
                onClick={() => useSettingsStore.getState().updateSettings({ guideCharacter: c.name })}
                style={{
                  padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left',
                  fontSize: '0.8rem',
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const askGuide = async (question) => {
    if (!question.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setInput('');
    setIsThinking(true);

    try {
      const sendMessage = useLlmStore.getState().sendMessage;
      const result = await sendMessage({
        messages: [
          { role: 'system', content: `You are ${guideCharacter.name}, a character in a story. Respond in character, using their voice and perspective. Here is your character sheet:\n\n${guideCharacter.content}\n\nThe author is currently working on: ${currentFile || 'the story'}. Provide guidance, observations, and reactions as this character would. Keep responses concise (2-4 sentences). Never break character.` },
          ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
          { role: 'user', content: question },
        ],
        role: 'chat',
        maxTokens: 300,
      });

      if (result.success) {
        setMessages(prev => [...prev, { role: 'assistant', text: result.content }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: '*sighs* Something went wrong. Try again.' }]);
      }
    } catch (err) {
      console.error('Error asking guide:', err);
      setMessages(prev => [...prev, { role: 'assistant', text: '*sighs* Something went wrong. Try again.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  // Minimized state
  if (isMinimized) {
    return (
      <button onClick={() => setIsMinimized(false)} style={{
        position: 'fixed', bottom: 20, right: 20, width: 48, height: 48,
        borderRadius: '50%', background: 'var(--accent)', border: 'none',
        color: '#000', fontSize: '1.2rem', cursor: 'pointer', zIndex: 100,
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        👤
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, width: 340,
      maxHeight: 480, display: 'flex', flexDirection: 'column',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', zIndex: 100,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px', background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.1rem' }}>👤</span>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{guideCharacter.name}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Character Guide</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setIsMinimized(true)} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem',
          }}>_</button>
          <button onClick={() => useSettingsStore.getState().updateSettings({ guideCharacter: null })} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem',
          }}>✕</button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, minHeight: 200, maxHeight: 320 }}>
        {messages.length === 0 && (
          <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Ask {guideCharacter.name} anything about the story, their motivations, or for writing advice.
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            marginBottom: 8, padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            background: msg.role === 'user' ? 'var(--accent)22' : 'var(--bg-tertiary)',
            fontSize: '0.8rem', color: 'var(--text-primary)',
            marginLeft: msg.role === 'user' ? 40 : 0,
            marginRight: msg.role === 'user' ? 0 : 40,
          }}>
            {msg.text}
          </div>
        ))}
        {isThinking && (
          <div style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {guideCharacter.name} is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && askGuide(input)}
          placeholder={`Ask ${guideCharacter.name}...`}
          style={{
            flex: 1, padding: '6px 10px', background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)', fontSize: '0.8rem',
          }}
        />
        <button
          onClick={() => askGuide(input)}
          disabled={isThinking || !input.trim()}
          style={{
            padding: '6px 12px', borderRadius: 'var(--radius-sm)',
            background: 'var(--accent)', border: 'none', color: '#000',
            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
            opacity: isThinking || !input.trim() ? 0.5 : 1,
          }}
        >
          Ask
        </button>
      </div>
    </div>
  );
}
