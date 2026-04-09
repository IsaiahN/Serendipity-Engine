import { useState, useMemo } from 'react';
import { estimateTokens } from '../services/contextBuilder';
import { estimateCost, formatCost, getModelPricing } from '../lib/costEstimator';

/**
 * TokenEstimate Component
 *
 * Displays pre-send token count and cost estimation for chapter generation.
 * Shows:
 * - Estimated input tokens (from context files)
 * - Estimated output tokens (typical chapter)
 * - Total estimated cost
 */
export default function TokenEstimate({ files, chapterNum, model = 'claude-sonnet-4-5-20250514', showDetails = false }) {
  const [expanded, setExpanded] = useState(true);

  // Calculate estimated input tokens from project files
  const estimatedInputTokens = useMemo(() => {
    if (!files) return 0;

    let total = 0;

    // Always included files
    const neverTrim = [
      'author.md',
      'narrator.md',
      'outline.md',
      'story/arc.md',
      'world/world-building.md',
      'relationships/questions-answered.md',
    ];

    for (const path of neverTrim) {
      if (files[path]?.trim()) {
        total += estimateTokens(files[path]);
      }
    }

    // All character files
    for (const [path, content] of Object.entries(files)) {
      if (path.startsWith('characters/') && path.endsWith('.md') && content?.trim()) {
        total += estimateTokens(content);
      }
    }

    // Previous chapters (last 2 full, rest summarized)
    for (let i = 1; i < chapterNum; i++) {
      const chapterPath = `story/chapter-${i}.md`;
      if (i >= chapterNum - 2) {
        // Full text for N-1 and N-2
        if (files[chapterPath]?.trim()) {
          total += estimateTokens(files[chapterPath]);
        }
      } else {
        // Summary for earlier chapters
        const summaryPath = `story/chapter-${i}-summary.md`;
        if (files[summaryPath]?.trim()) {
          total += estimateTokens(files[summaryPath]);
        }
      }
    }

    // Chapter notes
    const notesPath = `story/chapter-${chapterNum}-notes.md`;
    if (files[notesPath]?.trim()) {
      total += estimateTokens(files[notesPath]);
    }

    // Feedback files
    for (const [path, content] of Object.entries(files)) {
      if (path.startsWith('feedback/') && content?.trim()) {
        total += estimateTokens(content);
      }
    }

    // Add golden rules and system prompt (rough estimate)
    total += 500;

    return total;
  }, [files, chapterNum]);

  // Estimate output tokens for a typical chapter (rough average: 4000 tokens)
  const estimatedOutputTokens = 4000;

  // Calculate total estimated cost
  const costEstimate = useMemo(() => {
    return estimateCost(estimatedInputTokens, estimatedOutputTokens, model);
  }, [estimatedInputTokens, model]);

  const pricing = useMemo(() => {
    return getModelPricing(model);
  }, [model]);

  return (
    <div
      style={{
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: 12,
        marginBottom: 12,
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        cursor: showDetails ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      }}
      onClick={() => showDetails && setExpanded(!expanded)}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}>
        <div>
          <span style={{ fontWeight: 500, marginRight: 6 }}>Estimated cost:</span>
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
            {formatCost(costEstimate.totalCost)}
          </span>
          <span style={{ marginLeft: 12, marginRight: 6 }}>
            (input: {Math.round(estimatedInputTokens / 1000)}k tokens
          </span>
          <span>output: {Math.round(estimatedOutputTokens / 1000)}k tokens)</span>
        </div>
        {showDetails && (
          <span style={{
            fontSize: '0.7rem',
            color: 'var(--text-secondary)',
            marginLeft: 'auto',
          }}>
            {expanded ? '−' : '+'}
          </span>
        )}
      </div>

      {/* Expanded details */}
      {expanded && showDetails && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid var(--border)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Input Tokens</div>
              <div style={{ color: 'var(--text-muted)' }}>
                {estimatedInputTokens.toLocaleString()}
                <div style={{ fontSize: '0.7rem', marginTop: 2 }}>
                  ≈ ${(estimatedInputTokens / 1_000_000 * pricing.input).toFixed(4)}
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Output Tokens</div>
              <div style={{ color: 'var(--text-muted)' }}>
                {estimatedOutputTokens.toLocaleString()}
                <div style={{ fontSize: '0.7rem', marginTop: 2 }}>
                  ≈ ${(estimatedOutputTokens / 1_000_000 * pricing.output).toFixed(4)}
                </div>
              </div>
            </div>
          </div>
          <div style={{
            background: 'var(--bg-secondary)',
            padding: 8,
            borderRadius: 'var(--radius-sm)',
            marginTop: 8,
          }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Total Estimated Cost</div>
            <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem' }}>
              {formatCost(costEstimate.totalCost)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Using {model}
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Estimates based on word-count tokenization. Actual costs may vary slightly.
          </div>
        </div>
      )}
    </div>
  );
}
