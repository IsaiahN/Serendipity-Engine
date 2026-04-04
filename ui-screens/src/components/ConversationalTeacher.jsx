import { useState, useRef, useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useLlmStore } from '../stores/llmStore';

export default function ConversationalTeacher({ context, topic }) {
  const settings = useSettingsStore.getState();
  if (!settings.conversationalTeacher) return null;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-generate initial teaching tip when context changes
  useEffect(() => {
    if (topic && messages.length === 0 && isOpen) {
      askTeacher(`I'm working on ${topic}. What should I know?`);
    }
  }, [topic, isOpen]);

  const askTeacher = async (question) => {
    if (!question?.trim() || isThinking) return;
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setInput('');
    setIsThinking(true);

    try {
      const sendMessage = useLlmStore.getState().sendMessage;
      const result = await sendMessage({
        messages: [
          { role: 'system', content: `You are a warm, knowledgeable writing mentor. You teach through conversation, not lectures. Your style is encouraging but honest — you celebrate what works and gently redirect what doesn't. Keep responses to 2-3 sentences. Use examples from well-known literature when helpful. Never be condescending. ${context ? `Context about the student's current work:\n${context}` : ''}` },
          ...messages.slice(-8).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
          { role: 'user', content: question },
        ],
        role: 'chat',
        maxTokens: 250,
      });

      if (result.success) {
        setMessages(prev => [...prev, { role: 'assistant', text: result.content }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Let me gather my thoughts... try asking again.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} title="Writing Mentor" style={{
        position: 'fixed', bottom: 76, right: 20, width: 40, height: 40,
        borderRadius: '50%', background: '#8b5cf6', border: 'none',
        color: '#fff', fontSize: '1rem', cursor: 'pointer', zIndex: 99,
        boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        📖
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 76, right: 20, width: 320,
      maxHeight: 400, display: 'flex', flexDirection: 'column',
      background: 'var(--bg-card)', border: '1px solid #8b5cf644',
      borderRadius: 'var(--radius-lg)', zIndex: 99,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)', overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 14px', background: '#8b5cf611',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#8b5cf6' }}>Writing Mentor</div>
        <button onClick={() => setIsOpen(false)} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem',
        }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 10, minHeight: 150, maxHeight: 260 }}>
        {messages.length === 0 && (
          <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            Ask me anything about writing craft, story structure, or your current scene.
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            marginBottom: 8, padding: '8px 12px', borderRadius: 'var(--radius-sm)',
            background: msg.role === 'user' ? '#8b5cf615' : 'var(--bg-tertiary)',
            fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.5,
            marginLeft: msg.role === 'user' ? 40 : 0, marginRight: msg.role === 'user' ? 0 : 40,
          }}>{msg.text}</div>
        ))}
        {isThinking && (
          <div style={{ padding: '8px 12px', fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', animation: 'pulse 1.5s ease-in-out infinite' }}>
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border)', display: 'flex', gap: 6 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askTeacher(input); } }}
          placeholder="Ask your mentor..."
          style={{
            flex: 1, padding: '7px 10px', background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none',
          }}
          disabled={isThinking}
        />
        <button onClick={() => askTeacher(input)} disabled={isThinking || !input.trim()} style={{
          padding: '6px 12px', borderRadius: 'var(--radius-sm)',
          background: !isThinking && input.trim() ? '#8b5cf6' : 'var(--bg-tertiary)',
          border: 'none', color: !isThinking && input.trim() ? '#fff' : 'var(--text-muted)',
          fontSize: '0.75rem', fontWeight: 600, cursor: !isThinking && input.trim() ? 'pointer' : 'default',
        }}>Ask</button>
      </div>
    </div>
  );
}
