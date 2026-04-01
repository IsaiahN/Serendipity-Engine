import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

export default function TermsScreen() {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    }}>
      <div style={{ maxWidth: 640, width: '100%', animation: 'fadeIn 0.4s ease forwards' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>✦</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>Serendipity Engine</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>Before we begin</p>
        </div>

        {/* Terms Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 32,
          maxHeight: 480,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Scrollable Content */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8, marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>License — The Serendipity Engine</h2>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <p style={{ marginBottom: 12 }}>
                The Serendipity Engine is free for personal creative use. Stories created using the engine belong entirely to you — the engine makes no ownership claims on your creative output.
              </p>
              <p style={{ marginBottom: 12 }}>
                Commercial use of the engine itself (building products on top of it) requires a commercial license. Attribution is appreciated but not required for stories you produce.
              </p>

              <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />

              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Terms of Use — Acceptable Use Policy</h2>

              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--health-exceptional)', marginBottom: 8 }}>This tool is designed for:</h3>
              <ul style={{ paddingLeft: 20, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Writers who want to improve their prose craft</li>
                <li>Authors working on novels, screenplays, short stories, and other creative works</li>
                <li>Storytellers who want to finally finish that project they've been sitting on</li>
                <li>Students of narrative who want to understand why great stories work</li>
                <li>Anyone who wants to learn the structural principles behind compelling fiction</li>
              </ul>

              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f87171', marginBottom: 8 }}>This tool is NOT for:</h3>
              <ul style={{ paddingLeft: 20, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Academic dishonesty — generating essays, homework, or assignments to submit as your own schoolwork</li>
                <li>Plagiarism — passing off generated content as entirely human-written where that distinction matters</li>
                <li>Any use that violates the content rating system's intent</li>
              </ul>

              <div style={{
                background: 'var(--accent-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
                marginTop: 8,
              }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                  The principle: The Serendipity Engine is a creative partner, not a cheating tool. It's the difference between hiring an editor to improve your novel and hiring someone to write your term paper.
                </p>
              </div>
            </div>
          </div>

          {/* Acceptance */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              marginBottom: 16,
            }}>
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--accent)' }}
              />
              <span style={{ fontSize: '0.85rem' }}>
                I agree to the Terms of Use and License Agreement
              </span>
            </label>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
              <a href="#" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>
                Download full legal text (PDF)
              </a>
              <Button
                variant="primary"
                size="lg"
                disabled={!accepted}
                onClick={() => navigate('/setup')}
              >
                Accept and Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
