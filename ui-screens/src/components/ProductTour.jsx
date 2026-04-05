/**
 * Serendipity Engine — Product Tour Component
 *
 * A step-by-step guided tour highlighting key UI areas with backdrop
 * highlights and positioned tooltips. Includes onboarding logic and
 * persistent completion state via settingsStore.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

// ── Tour Step Definitions ────────────────────────────────────────────

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Serendipity | StoryWeaver',
    description:
      'Your AI-powered creative companion for building rich, complex stories. This tour will show you the key features that make story development intuitive and rewarding.',
    target: null, // center modal
    position: 'center',
  },
  {
    id: 'phases',
    title: 'The 8-Phase Pipeline',
    description:
      'Your story unfolds through 8 phases: Author, Narrator, World, Characters, Relationships, Story Foundation, Review, and Execution. Each phase builds systematically on the previous, guiding you from vision to manuscript.',
    target: '[data-tour="phase-sidebar"]',
    position: 'right',
  },
  {
    id: 'guide-mode',
    title: 'Guided Question Flow',
    description:
      'Use the interactive guide to work through curated questions that strengthen your story\'s foundation. The engine adapts to your answers, building a comprehensive project profile.',
    target: '[data-tour="guide-area"]',
    position: 'center',
  },
  {
    id: 'chat',
    title: 'Three AI Personas',
    description:
      'Chat with the Story Assistant (brainstorm ideas), Editor (refine prose), or your characters themselves (test dialogue and behavior). Each persona brings specialized perspective.',
    target: '[data-tour="chat-panel"]',
    position: 'left',
  },
  {
    id: 'filetree',
    title: 'Project Files',
    description:
      'All your story materials—character profiles, world-building notes, outlines, chapters—organized in an intuitive file tree. Create, edit, and organize directly.',
    target: '[data-tour="file-tree"]',
    position: 'right',
  },
  {
    id: 'health',
    title: 'Health Scoring',
    description:
      'The health bar shows how well your story\'s core elements integrate: character depth, narrative coherence, thematic resonance, and more. Aim for "Strong" or "Exceptional."',
    target: '[data-tour="health-bar"]',
    position: 'top',
  },
  {
    id: 'settings',
    title: 'Customization & Settings',
    description:
      'Personalize your workspace: theme, font size, AI model preferences, export formats, and advanced options like deconstructive analysis and TTS. Your engine, your way.',
    target: '[data-tour="settings-btn"]',
    position: 'left',
  },
  {
    id: 'done',
    title: 'You\'re Ready',
    description:
      'You now understand StoryWeaver\'s core workflow. Start with the Author phase, answer honestly, and let the system guide you toward story clarity.',
    target: null, // center modal
    position: 'center',
  },
];

// ── Highlight Box Positioning ────────────────────────────────────────

function getHighlightPosition(target, position) {
  if (!target) return null;

  const el = document.querySelector(target);
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  const padding = 12;

  const positions = {
    top: {
      left: rect.left + rect.width / 2,
      top: rect.top - padding,
      translate: '-50% -100%',
    },
    bottom: {
      left: rect.left + rect.width / 2,
      top: rect.bottom + padding,
      translate: '-50% 0',
    },
    left: {
      left: rect.left - padding,
      top: rect.top + rect.height / 2,
      translate: '-100% -50%',
    },
    right: {
      left: rect.right + padding,
      top: rect.top + rect.height / 2,
      translate: '0 -50%',
    },
    center: {
      left: '50%',
      top: '50%',
      translate: '-50% -50%',
    },
  };

  return { rect, ...positions[position] };
}

// ── Product Tour Component ───────────────────────────────────────────

export default function ProductTour({ onComplete, autoShow = true }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [highlightBox, setHighlightBox] = useState(null);
  const updateSettings = useSettingsStore(s => s.updateSettings);
  const containerRef = useRef(null);

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  // ── Highlight Calculation ────────────────────────────────────────

  useEffect(() => {
    if (!isVisible || !currentStep.target) {
      setHighlightBox(null);
      return;
    }

    const updateHighlight = () => {
      const highlight = getHighlightPosition(currentStep.target, currentStep.position);
      setHighlightBox(highlight);
    };

    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    return () => window.removeEventListener('resize', updateHighlight);
  }, [isVisible, currentStep]);

  // ── Navigation ───────────────────────────────────────────────────

  const goToNext = useCallback(() => {
    if (isLastStep) {
      completeTour();
    } else {
      setCurrentStepIndex(i => i + 1);
    }
  }, [isLastStep]);

  const goToPrevious = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex(i => i - 1);
    }
  }, [isFirstStep]);

  const skip = useCallback(() => {
    completeTour();
  }, []);

  const completeTour = useCallback(() => {
    setIsVisible(false);
    updateSettings({ tourCompleted: true });
    if (onComplete) {
      onComplete();
    }
  }, [updateSettings, onComplete]);

  const showTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsVisible(true);
  }, []);

  // ── Render ───────────────────────────────────────────────────────

  if (!isVisible) {
    return null;
  }

  const hasTarget = currentStep.target !== null;
  const tooltipWidth = currentStep.id === 'welcome' || currentStep.id === 'done' ? 500 : 380;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {/* Backdrop with highlight cutout */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          pointerEvents: 'auto',
          backdropFilter: 'blur(2px)',
          mask: highlightBox && hasTarget ? createClipPath(highlightBox) : 'none',
          WebkitMask: highlightBox && hasTarget ? createClipPath(highlightBox) : 'none',
        }}
        onClick={skip}
      />

      {/* Highlight outline (optional glow) */}
      {highlightBox && hasTarget && (
        <div
          style={{
            position: 'fixed',
            left: highlightBox.rect.left,
            top: highlightBox.rect.top,
            width: highlightBox.rect.width,
            height: highlightBox.rect.height,
            border: '2px solid var(--accent-primary)',
            borderRadius: 8,
            boxShadow: '0 0 20px rgba(var(--accent-rgb), 0.4)',
            pointerEvents: 'none',
            animation: 'pulse-border 2s ease-in-out infinite',
          }}
        />
      )}

      {/* Tooltip Card */}
      <div
        style={{
          position: 'fixed',
          left: highlightBox?.left,
          top: highlightBox?.top,
          transform: `translate(${highlightBox?.translate || '-50% -50%'})`,
          width: tooltipWidth,
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-secondary)',
          borderRadius: 12,
          padding: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          pointerEvents: 'auto',
          zIndex: 10000,
          animation: highlightBox ? 'slideIn 0.3s ease-out' : 'none',
        }}
      >
        {/* Close button */}
        <button
          onClick={skip}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '20px',
            cursor: 'pointer',
            padding: 0,
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.target.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.target.style.color = 'var(--text-muted)')}
          title="Skip tour"
        >
          ✕
        </button>

        {/* Sparkle icon for first step */}
        {currentStep.id === 'welcome' && (
          <div
            style={{
              fontSize: '40px',
              marginBottom: '12px',
              textAlign: 'center',
            }}
          >
            ✨
          </div>
        )}

        {/* Celebration icon for last step */}
        {currentStep.id === 'done' && (
          <div
            style={{
              fontSize: '40px',
              marginBottom: '12px',
              textAlign: 'center',
            }}
          >
            🎉
          </div>
        )}

        {/* Title */}
        <h2
          style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          {currentStep.title}
        </h2>

        {/* Description */}
        <p
          style={{
            margin: '0 0 16px 0',
            fontSize: '14px',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
          }}
        >
          {currentStep.description}
        </p>

        {/* Step counter */}
        <div
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginBottom: '16px',
          }}
        >
          Step {currentStepIndex + 1} of {TOUR_STEPS.length}
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: '100%',
            height: 4,
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 2,
            marginBottom: '16px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%`,
              backgroundColor: 'var(--accent-primary)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={goToPrevious}
            disabled={isFirstStep}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-secondary)',
              borderRadius: 6,
              color: isFirstStep ? 'var(--text-muted)' : 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: isFirstStep ? 'not-allowed' : 'pointer',
              opacity: isFirstStep ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (!isFirstStep) {
                e.target.style.backgroundColor = 'var(--bg-hover)';
              }
            }}
            onMouseLeave={e => {
              e.target.style.backgroundColor = 'var(--bg-tertiary)';
            }}
          >
            Back
          </button>

          <button
            onClick={skip}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-secondary)',
              borderRadius: 6,
              color: 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.target.style.color = 'var(--text-primary)';
              e.target.style.backgroundColor = 'var(--bg-tertiary)';
            }}
            onMouseLeave={e => {
              e.target.style.color = 'var(--text-secondary)';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            Skip
          </button>

          <button
            onClick={goToNext}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--accent-primary)',
              border: 'none',
              borderRadius: 6,
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.target.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={e => {
              e.target.style.filter = 'brightness(1)';
            }}
          >
            {isLastStep ? 'Start Building' : 'Next'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes pulse-border {
          0%, 100% {
            box-shadow: 0 0 20px rgba(var(--accent-rgb), 0.4);
          }
          50% {
            box-shadow: 0 0 30px rgba(var(--accent-rgb), 0.6);
          }
        }
      `}</style>
    </div>
  );
}

// ── Tour Hook ────────────────────────────────────────────────────────

export function useTourTrigger() {
  const tourRef = useRef(null);
  const [showTour, setShowTour] = useState(false);

  const startTour = useCallback(() => {
    setShowTour(true);
    if (tourRef.current?.showTour) {
      tourRef.current.showTour();
    }
  }, []);

  const dismissTour = useCallback(() => {
    setShowTour(false);
  }, []);

  return {
    showTour,
    startTour,
    dismissTour,
    tourRef,
  };
}

// ── Utilities ────────────────────────────────────────────────────────

/**
 * Create an SVG clip-path that shows a highlighted box and darkens the rest
 */
function createClipPath(highlightBox) {
  const padding = 12;
  const x1 = Math.max(0, highlightBox.rect.left - padding);
  const y1 = Math.max(0, highlightBox.rect.top - padding);
  const x2 = highlightBox.rect.left + highlightBox.rect.width + padding;
  const y2 = highlightBox.rect.top + highlightBox.rect.height + padding;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  return `polygon(
    0% 0%,
    0% 100%,
    100% 100%,
    100% 0%,
    0% 0%,
    ${x1}px ${y1}px,
    ${x1}px ${y2}px,
    ${x2}px ${y2}px,
    ${x2}px ${y1}px,
    ${x1}px ${y1}px
  )`;
}
