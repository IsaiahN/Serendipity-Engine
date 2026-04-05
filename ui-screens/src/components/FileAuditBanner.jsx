/**
 * FileAuditBanner.jsx
 *
 * Dismissible banner shown at the top of the workspace when a file audit
 * detects missing or empty project files. Shows a summary, lists issues,
 * and provides one-click recovery actions (re-analyze, add missing details,
 * regenerate).
 */

import { useState, useEffect, useCallback } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { auditProject, SEV } from '../services/fileAuditService';
import {
  AlertTriangle, CheckCircle, ChevronDown, ChevronUp,
  RefreshCw, X, Shield, Sparkles, Brain,
} from 'lucide-react';
import Button from './Button';

// Severity -> color mapping
const SEV_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#6b7280',
};

const STATUS_CONFIG = {
  healthy: { color: '#22c55e', icon: CheckCircle, label: 'All files present' },
  warnings: { color: '#eab308', icon: AlertTriangle, label: 'Minor gaps detected' },
  incomplete: { color: '#f97316', icon: AlertTriangle, label: 'Missing files detected' },
  critical: { color: '#ef4444', icon: AlertTriangle, label: 'Critical files missing' },
};

export default function FileAuditBanner({
  auditReport,
  onDismiss,
  onRedecompose,
  onAddMissingDetails,
  onRegenerateAnalysis,
}) {
  const [expanded, setExpanded] = useState(false);

  if (!auditReport || auditReport.status === 'healthy') return null;

  const config = STATUS_CONFIG[auditReport.status] || STATUS_CONFIG.warnings;
  const StatusIcon = config.icon;
  const { summary, findings, recoveryActions } = auditReport;

  // Group findings by phase for the expanded view
  const findingsByPhase = {};
  for (const f of findings) {
    const key = f.phase || 'other';
    if (!findingsByPhase[key]) findingsByPhase[key] = [];
    findingsByPhase[key].push(f);
  }

  const handleRecoveryClick = (action) => {
    if (action.type === 'redecompose-step' && onRedecompose) {
      onRedecompose(action.steps);
    } else if (action.type === 'add-missing-details' && onAddMissingDetails) {
      onAddMissingDetails(action.groups);
    } else if (action.type === 'regenerate-analysis' && onRegenerateAnalysis) {
      onRegenerateAnalysis(action.files);
    }
  };

  return (
    <div style={{
      background: `${config.color}12`,
      border: `1px solid ${config.color}40`,
      borderRadius: 'var(--radius-md)',
      margin: '0 0 16px 0',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
    }}>
      {/* Summary bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <StatusIcon size={18} style={{ color: config.color, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
          <strong style={{ color: config.color }}>{config.label}</strong>
          {' '}
          <span style={{ color: 'var(--text-secondary)' }}>
            {summary.critical > 0 && `${summary.critical} critical`}
            {summary.critical > 0 && summary.high > 0 && ', '}
            {summary.high > 0 && `${summary.high} high`}
            {(summary.critical > 0 || summary.high > 0) && summary.medium > 0 && ', '}
            {summary.medium > 0 && `${summary.medium} optional`}
          </span>
        </span>

        {/* Quick action buttons inline */}
        {recoveryActions.length > 0 && !expanded && (
          <div style={{ display: 'flex', gap: 6 }}>
            {recoveryActions.slice(0, 2).map((action, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); handleRecoveryClick(action); }}
                style={{
                  padding: '4px 10px',
                  borderRadius: 100,
                  border: `1px solid ${config.color}60`,
                  background: `${config.color}20`,
                  color: config.color,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                {action.type === 'redecompose-step' && <RefreshCw size={11} style={{ marginRight: 4, verticalAlign: -1 }} />}
                {action.type === 'add-missing-details' && <Brain size={11} style={{ marginRight: 4, verticalAlign: -1 }} />}
                {action.type === 'regenerate-analysis' && <Sparkles size={11} style={{ marginRight: 4, verticalAlign: -1 }} />}
                {action.label}
              </button>
            ))}
          </div>
        )}

        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}

        <button
          onClick={(e) => { e.stopPropagation(); onDismiss?.(); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', padding: 2,
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{
          padding: '0 14px 14px',
          borderTop: `1px solid ${config.color}20`,
        }}>
          {/* Findings by phase */}
          {Object.entries(findingsByPhase).map(([phase, items]) => (
            <div key={phase} style={{ marginTop: 10 }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 4,
              }}>
                {phase === 'other' ? 'Other' : items[0]?.phase || phase}
              </div>
              {items.map((finding, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 0',
                  fontSize: '0.8rem',
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: SEV_COLORS[finding.severity],
                    flexShrink: 0,
                  }} />
                  <code style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-primary)',
                    background: 'var(--bg-surface)',
                    padding: '1px 5px',
                    borderRadius: 3,
                  }}>
                    {finding.file}
                  </code>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {finding.severity}
                  </span>
                </div>
              ))}
            </div>
          ))}

          {/* Recovery actions */}
          {recoveryActions.length > 0 && (
            <div style={{
              display: 'flex',
              gap: 8,
              marginTop: 12,
              paddingTop: 10,
              borderTop: '1px solid var(--border)',
              flexWrap: 'wrap',
            }}>
              {recoveryActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleRecoveryClick(action)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--accent)',
                    background: 'var(--accent)18',
                    color: 'var(--accent)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  title={action.description}
                >
                  {action.type === 'redecompose-step' && <RefreshCw size={13} />}
                  {action.type === 'add-missing-details' && <Brain size={13} />}
                  {action.type === 'regenerate-analysis' && <Sparkles size={13} />}
                  {action.label}
                  <span style={{
                    fontSize: '0.7rem',
                    opacity: 0.7,
                    marginLeft: 2,
                  }}>
                    ({action.fileCount} file{action.fileCount > 1 ? 's' : ''})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
