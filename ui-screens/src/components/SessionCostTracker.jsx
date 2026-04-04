import { useMemo } from 'react';
import { useLlmStore } from '../stores/llmStore';
import { getSessionCosts, getSessionCostsByModel, formatCost, formatCostPrecise } from '../lib/costEstimator';
import { BarChart3 } from 'lucide-react';

/**
 * SessionCostTracker Component
 *
 * Displays cumulative session costs and breakdown by model.
 * Shows:
 * - Total session cost
 * - Breakdown by model
 * - Token usage summary
 */
export default function SessionCostTracker({ variant = 'compact' }) {
  const usageHistory = useLlmStore(s => s.usageHistory);

  const costSummary = useMemo(() => {
    const totalCost = getSessionCosts(usageHistory);
    const byModel = getSessionCostsByModel(usageHistory);
    const totalInputTokens = usageHistory.reduce((sum, e) => sum + (e.inputTokens || 0), 0);
    const totalOutputTokens = usageHistory.reduce((sum, e) => sum + (e.outputTokens || 0), 0);
    const totalCalls = usageHistory.length;

    return {
      totalCost,
      byModel,
      totalInputTokens,
      totalOutputTokens,
      totalCalls,
    };
  }, [usageHistory]);

  if (usageHistory.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
      }}>
        <BarChart3 size={14} />
        <span>No API usage yet</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: '0.8rem',
      }}>
        <BarChart3 size={14} color="var(--accent)" />
        <span style={{ color: 'var(--text-secondary)' }}>Session cost:</span>
        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
          {formatCost(costSummary.totalCost)}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          ({costSummary.totalCalls} calls)
        </span>
      </div>
    );
  }

  // Full variant
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: 16,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        fontSize: '0.9rem',
        fontWeight: 600,
      }}>
        <BarChart3 size={16} color="var(--accent)" />
        <span>Session Cost Tracking</span>
      </div>

      {/* Total cost summary */}
      <div style={{
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-sm)',
        padding: 12,
        marginBottom: 12,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}>
          <div>
            <div style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: '0.05em',
              marginBottom: 4,
            }}>
              Total Cost
            </div>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--accent)',
            }}>
              {formatCost(costSummary.totalCost)}
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: '0.05em',
              marginBottom: 4,
            }}>
              API Calls
            </div>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
            }}>
              {costSummary.totalCalls}
            </div>
          </div>
        </div>
      </div>

      {/* Token usage summary */}
      <div style={{
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-sm)',
        padding: 12,
        marginBottom: 12,
        fontSize: '0.8rem',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}>
          <div>
            <div style={{
              color: 'var(--text-muted)',
              fontSize: '0.7rem',
              marginBottom: 2,
            }}>
              Input Tokens
            </div>
            <div style={{
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}>
              {(costSummary.totalInputTokens / 1000).toFixed(1)}k
            </div>
          </div>
          <div>
            <div style={{
              color: 'var(--text-muted)',
              fontSize: '0.7rem',
              marginBottom: 2,
            }}>
              Output Tokens
            </div>
            <div style={{
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}>
              {(costSummary.totalOutputTokens / 1000).toFixed(1)}k
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown by model */}
      {Object.keys(costSummary.byModel).length > 0 && (
        <div>
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            fontWeight: 600,
            letterSpacing: '0.05em',
            marginBottom: 8,
          }}>
            By Model
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.values(costSummary.byModel).map((model) => (
              <div
                key={model.model}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-secondary)',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                }}
              >
                <div>
                  <div style={{
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 2,
                  }}>
                    {model.model}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                    {model.callCount} call{model.callCount !== 1 ? 's' : ''}
                    {' - '}
                    {(model.inputTokens / 1000).toFixed(1)}k + {(model.outputTokens / 1000).toFixed(1)}k tokens
                  </div>
                </div>
                <div style={{
                  fontWeight: 700,
                  color: 'var(--accent)',
                  textAlign: 'right',
                }}>
                  {formatCostPrecise(model.totalCost, 3)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
        marginTop: 12,
        paddingTop: 12,
        borderTop: '1px solid var(--border)',
        fontStyle: 'italic',
      }}>
        Costs are estimates based on your configured model pricing. Enable cost tracking in Settings to see this data.
      </div>
    </div>
  );
}
