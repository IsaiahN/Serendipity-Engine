import { useState, useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useSettingsStore } from '../stores/settingsStore';
import { analyzeTextMetrics, getAggregatedProfile } from '../services/writingAssessment';
import db from '../lib/db';
import { RefreshCw, TrendingUp, ZoomIn, ZoomOut, BarChart3 } from 'lucide-react';
import Button from './Button';

/**
 * Color-coded gauge for metrics
 * Green: good (70-100), Yellow: moderate (40-69), Red: needs work (0-39)
 */
function MetricGauge({ label, value, unit = '%', max = 100, description = '' }) {
  let color = 'var(--text-muted)';
  if (value >= 70) color = '#22c55e'; // green
  else if (value >= 40) color = '#f59e0b'; // amber
  else color = '#ef4444'; // red

  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            {label}
          </div>
          {description && (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {description}
            </div>
          )}
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color, minWidth: 50, textAlign: 'right' }}>
          {value.toFixed(1)}{unit}
        </div>
      </div>
      <div style={{
        width: '100%', height: 6, background: 'var(--bg-tertiary)',
        borderRadius: 100, overflow: 'hidden', border: '1px solid var(--border)',
      }}>
        <div style={{
          width: `${percentage}%`, height: '100%', background: color,
          transition: 'width 0.3s ease', borderRadius: 100,
        }} />
      </div>
    </div>
  );
}

/**
 * Metric card for expanded view
 */
function MetricCard({ label, value, unit = '', icon: Icon, description = '' }) {
  return (
    <div style={{
      background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: 16, flex: 1, minWidth: 150,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {Icon && <Icon size={16} color="var(--accent)" />}
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
          {label}
        </div>
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
        {typeof value === 'number' ? value.toFixed(1) : value}
        {unit && <span style={{ fontSize: '0.9rem', marginLeft: 4 }}>{unit}</span>}
      </div>
      {description && (
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.4 }}>
          {description}
        </div>
      )}
    </div>
  );
}

/**
 * WritingProfile Component
 * Shows aggregated writing metrics with visual indicators
 */
export default function WritingProfile({ projectId = null, compact = false, showAnalyzeButton = true }) {
  const [profile, setProfile] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const files = useProjectStore(s => s.files);
  const fileCount = Object.keys(files || {}).length;
  const silentAssessment = useSettingsStore(s => s.silentAssessment);

  // Load profile on mount and when projectId changes
  // Use fileCount instead of files object to avoid infinite re-render loop
  useEffect(() => {
    loadProfile();
  }, [projectId, fileCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProfile = async () => {
    setLoading(true);
    try {
      const aggProfile = await getAggregatedProfile(projectId);
      setProfile(aggProfile);
    } catch (err) {
      console.warn('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeNow = async () => {
    setAnalyzing(true);
    try {
      // Analyze all markdown files in the project
      let totalAssessments = 0;

      for (const [path, content] of Object.entries(files)) {
        if (path.endsWith('.md') && content.length > 200) {
          const metrics = analyzeTextMetrics(content);
          if (metrics) {
            const id = projectId ? `${projectId}-${path}` : `global-${path}`;
            await db.writingProfile.put({
              id,
              projectId: projectId || 'global',
              path,
              metrics,
              timestamp: Date.now(),
            });
            totalAssessments++;
          }
        }
      }

      // Reload profile
      await loadProfile();
    } catch (err) {
      console.error('Failed to analyze:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: 24, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)', textAlign: 'center',
      }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading writing profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{
        padding: 24, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
      }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
            No Writing Data Yet
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {silentAssessment
              ? 'Your writing will be analyzed automatically as you write.'
              : 'Enable Silent Assessment in settings to get started.'}
          </div>
        </div>
        {showAnalyzeButton && silentAssessment && (
          <Button
            size="sm"
            onClick={handleAnalyzeNow}
            disabled={analyzing || Object.keys(files).length === 0}
            style={{ width: '100%' }}
          >
            <RefreshCw size={12} style={{ marginRight: 4, ...(analyzing ? { animation: 'spin 1s linear infinite' } : {}) }} />
            {analyzing ? 'Analyzing...' : 'Analyze Now'}
          </Button>
        )}
      </div>
    );
  }

  // Compact view (sidebar/card)
  if (compact && !expanded) {
    return (
      <div
        onClick={() => setExpanded(true)}
        style={{
          padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)', cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-secondary)';
          e.currentTarget.style.borderColor = 'var(--accent-border)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--bg-tertiary)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={16} color="var(--accent)" />
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Writing Profile
            </div>
          </div>
          <ZoomIn size={14} color="var(--text-muted)" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2 }}>Words Analyzed</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>
              {profile.totalWords.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2 }}>Samples</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>
              {profile.samplesAnalyzed}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2 }}>Reading Level</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>
              Grade {profile.readabilityGrade}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2 }}>Vocabulary</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>
              {profile.vocabularyRichness}%
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          Click to expand details
        </div>
      </div>
    );
  }

  // Expanded view (full page or modal)
  return (
    <div>
      {compact && expanded && (
        <button
          onClick={() => setExpanded(false)}
          style={{
            marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 8px', background: 'transparent', border: 'none',
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem',
          }}
        >
          <ZoomOut size={14} /> Collapse
        </button>
      )}

      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              Writing Analysis
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Based on {profile.samplesAnalyzed} writing sample{profile.samplesAnalyzed !== 1 ? 's' : ''} ({profile.totalWords.toLocaleString()} words)
            </p>
          </div>
          {showAnalyzeButton && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAnalyzeNow}
              disabled={analyzing}
            >
              <RefreshCw size={12} style={{ marginRight: 4, ...(analyzing ? { animation: 'spin 1s linear infinite' } : {}) }} />
              {analyzing ? 'Analyzing...' : 'Refresh'}
            </Button>
          )}
        </div>
      </div>

      {/* Metric Gauges - Compact View */}
      <div style={{ marginBottom: 32 }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
          Style Indicators
        </h4>

        <MetricGauge
          label="Vocabulary Richness"
          value={profile.vocabularyRichness}
          description="Unique words vs. total words (50%+ is strong)"
        />

        <MetricGauge
          label="Average Sentence Length"
          value={profile.avgSentenceLength}
          max={30}
          unit=" words"
          description="Shorter is punchier, longer is more complex"
        />

        <MetricGauge
          label="Dialogue Ratio"
          value={profile.dialogueRatio}
          description="% of words in quotes (higher in fiction)"
        />

        <MetricGauge
          label="Adverb Usage"
          value={profile.adverbUsage}
          description="Words ending in -ly (moderate use recommended)"
        />

        <MetricGauge
          label="Passive Voice"
          value={profile.passiveVoice}
          description="Lower is better for active, engaging prose"
        />
      </div>

      {/* Summary Cards */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
          Summary
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <MetricCard
            label="Total Words"
            value={profile.totalWords.toLocaleString()}
            icon={TrendingUp}
          />

          <MetricCard
            label="Avg Word Length"
            value={profile.avgWordLength}
            unit="chars"
            description="Balance between simple and complex"
          />

          <MetricCard
            label="Reading Level"
            value={`Grade ${profile.readabilityGrade}`}
            description="Flesch-Kincaid readability score"
          />

          <MetricCard
            label="Samples Analyzed"
            value={profile.samplesAnalyzed}
            description="Number of documents analyzed"
          />
        </div>
      </div>

      {/* Last Updated */}
      <div style={{
        fontSize: '0.75rem', color: 'var(--text-muted)',
        padding: 12, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
      }}>
        Last updated: {new Date(profile.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}
