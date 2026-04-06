/**
 * Serendipity | StoryWeaver — Session Logger
 *
 * Records all significant actions for audit trail, analytics, and crash recovery.
 * Logs are stored in IndexedDB via the project store.
 *
 * Log types: 'phase-answer', 'file-edit', 'chapter-generated', 'editor-review',
 * 'chat-message', 'preflight', 'postflight', 'export', 'import', 'settings-change',
 * 'provider-connected', 'provider-disconnected', 'error'
 */

/**
 * Create a session logger bound to a specific project store
 *
 * @param {object} projectStore - The Zustand project store with logSession method
 * @returns {object} Logger with structured logging methods
 */
export function createSessionLogger(projectStore) {
  let sessionStartTime = Date.now();
  let actionCounter = 0;
  const typeCounts = {};

  /**
   * Internal log method — wraps projectStore.logSession with metadata
   */
  async function _log(type, data = {}) {
    actionCounter++;
    typeCounts[type] = (typeCounts[type] || 0) + 1;

    try {
      await projectStore.logSession({
        type,
        actionNumber: actionCounter,
        timestamp: Date.now(),
        sessionAge: Date.now() - sessionStartTime,
        ...data,
      });
    } catch (err) {
      console.warn(`Failed to log ${type}:`, err);
    }
  }

  return {
    /**
     * Log a phase answer entry
     * @param {string} phase - Phase key ('author', 'narrator', 'world', etc.)
     * @param {string} questionId - Question identifier within phase
     * @param {string} answer - The answer text
     */
    async logPhaseAnswer(phase, questionId, answer) {
      await _log('phase-answer', {
        phase,
        questionId,
        answerLength: answer?.length || 0,
        answerHash: answer ? simpleHash(answer) : null,
      });
    },

    /**
     * Log a file edit event
     * @param {string} path - File path (e.g., 'author.md', 'characters/elena.md')
     * @param {number} wordsBefore - Word count before edit
     * @param {number} wordsAfter - Word count after edit
     * @param {object} options - Additional metadata
     */
    async logFileEdit(path, wordsBefore, wordsAfter, options = {}) {
      const delta = wordsAfter - wordsBefore;
      await _log('file-edit', {
        path,
        wordsBefore,
        wordsAfter,
        delta,
        percentChange: wordsBefore > 0 ? Math.round((delta / wordsBefore) * 100) : 0,
        ...options,
      });
    },

    /**
     * Log a chapter generation event
     * @param {number} chapterNum - Chapter number
     * @param {number} wordCount - Generated word count
     * @param {string} provider - LLM provider ('anthropic', 'openai', etc.)
     * @param {string} model - Model identifier
     * @param {number} duration - Generation duration in milliseconds
     * @param {object} options - Additional metadata (success, errorMessage, etc.)
     */
    async logChapterGenerated(chapterNum, wordCount, provider, model, duration, options = {}) {
      await _log('chapter-generated', {
        chapterNum,
        wordCount,
        provider,
        model,
        durationMs: duration,
        tokensEstimated: Math.ceil(wordCount * 1.3), // rough estimate
        ...options,
      });
    },

    /**
     * Log an editor review pass (style, structure, continuity checks)
     * @param {string} file - File path being reviewed
     * @param {number} passNumber - Which pass (1, 2, etc.)
     * @param {number} issueCount - Issues found
     * @param {number} suggestionCount - Suggestions made
     * @param {number} strengthCount - Strengths noted
     * @param {object} options - Additional metadata
     */
    async logEditorReview(file, passNumber, issueCount, suggestionCount, strengthCount, options = {}) {
      await _log('editor-review', {
        file,
        passNumber,
        issueCount,
        suggestionCount,
        strengthCount,
        totalNotes: issueCount + suggestionCount + strengthCount,
        ...options,
      });
    },

    /**
     * Log a chat message in the writing assistant
     * @param {string} persona - AI persona ('analyst', 'editor', 'brainstorm', etc.)
     * @param {number} messageCount - Nth message in conversation
     * @param {object} options - metadata (roleLength, contentLength, etc.)
     */
    async logChatMessage(persona, messageCount, options = {}) {
      await _log('chat-message', {
        persona,
        messageCount,
        ...options,
      });
    },

    /**
     * Log pre-flight check execution
     * @param {number} chapterNum - Chapter being checked
     * @param {number} checkCount - Number of checks run
     * @param {number} passCount - Number passing
     * @param {number} warningCount - Number with warnings
     * @param {number} failCount - Number failing
     */
    async logPreflight(chapterNum, checkCount, passCount, warningCount, failCount) {
      await _log('preflight', {
        chapterNum,
        checkCount,
        passCount,
        warningCount,
        failCount,
        canProceed: failCount === 0,
      });
    },

    /**
     * Log post-flight check execution
     * @param {number} chapterNum - Chapter that was generated
     * @param {number} checkCount - Number of checks run
     * @param {number} passCount - Number passing
     * @param {number} issueCount - Number with issues
     */
    async logPostflight(chapterNum, checkCount, passCount, issueCount) {
      await _log('postflight', {
        chapterNum,
        checkCount,
        passCount,
        issueCount,
        healthScore: passCount / checkCount,
      });
    },

    /**
     * Log an export operation
     * @param {string} format - Export format ('docx', 'epub', 'pdf', 'markdown', etc.)
     * @param {number} fileCount - Number of files exported
     * @param {number} totalSize - Total bytes
     */
    async logExport(format, fileCount, totalSize) {
      await _log('export', {
        format,
        fileCount,
        totalSizeBytes: totalSize,
        totalSizeKb: Math.round(totalSize / 1024),
      });
    },

    /**
     * Log an import operation
     * @param {string} sourceType - Source type ('manuscript', 'decomposition', 'backup')
     * @param {number} fileCount - Number of files imported
     * @param {object} options - metadata
     */
    async logImport(sourceType, fileCount, options = {}) {
      await _log('import', {
        sourceType,
        fileCount,
        ...options,
      });
    },

    /**
     * Log a settings change
     * @param {string} setting - Setting key
     * @param {any} oldValue - Previous value
     * @param {any} newValue - New value
     */
    async logSettingsChange(setting, oldValue, newValue) {
      await _log('settings-change', {
        setting,
        oldValue: formatValue(oldValue),
        newValue: formatValue(newValue),
      });
    },

    /**
     * Log provider connection
     * @param {string} provider - Provider name ('anthropic', 'openai', etc.)
     * @param {object} metadata - Provider metadata
     */
    async logProviderConnected(provider, metadata = {}) {
      await _log('provider-connected', {
        provider,
        ...metadata,
      });
    },

    /**
     * Log provider disconnection
     * @param {string} provider - Provider name
     * @param {string} reason - Reason for disconnect
     */
    async logProviderDisconnected(provider, reason = 'user') {
      await _log('provider-disconnected', {
        provider,
        reason,
      });
    },

    /**
     * Log an error event
     * @param {string} context - Where the error occurred
     * @param {Error} error - The error object
     * @param {object} metadata - Additional context
     */
    async logError(context, error, metadata = {}) {
      await _log('error', {
        context,
        errorMessage: error?.message || String(error),
        errorStack: error?.stack?.split('\n').slice(0, 3).join(' ') || null,
        ...metadata,
      });
    },

    /**
     * Get session summary for status display
     * @returns {{ startTime, actionCount, typeCounts, sessionAge, actions }}
     */
    getSessionSummary() {
      return {
        startTime: sessionStartTime,
        startTimeFormatted: new Date(sessionStartTime).toLocaleTimeString(),
        actionCount: actionCounter,
        typeCounts: { ...typeCounts },
        sessionAgeMs: Date.now() - sessionStartTime,
        sessionAgeMinutes: Math.round((Date.now() - sessionStartTime) / 60000),
        topActions: Object.entries(typeCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([type, count]) => ({ type, count })),
      };
    },

    /**
     * Get recent log entries from the store
     * Note: This requires the project store to expose a query method
     * For now, we can return a client-side summary
     * @param {number} limit - How many recent logs to return
     * @returns {Array}
     */
    async getRecentLogs(limit = 50) {
      // This would typically query the db directly
      // For now, return a summary of the current session
      return [{
        message: `Session with ${actionCounter} actions (see analytics for details)`,
        count: actionCounter,
        limit,
      }];
    },

    /**
     * Reset session timer (for new editing sessions)
     */
    resetSessionTimer() {
      sessionStartTime = Date.now();
      actionCounter = 0;
      Object.keys(typeCounts).forEach(key => {
        delete typeCounts[key];
      });
    },
  };
}

/**
 * Singleton instance — lazily initialized when needed
 */
let _singletonLogger = null;
let _singletonStore = null;

/**
 * Initialize singleton with a project store
 */
export function initSessionLogger(projectStore) {
  _singletonStore = projectStore;
  _singletonLogger = createSessionLogger(projectStore);
  return _singletonLogger;
}

/**
 * Get the singleton instance (must be initialized first)
 */
export function getSessionLogger() {
  if (!_singletonLogger) {
    console.warn('Session logger not initialized. Call initSessionLogger first.');
    // Return a no-op logger to prevent errors
    return createSessionLogger({ logSession: async () => {} });
  }
  return _singletonLogger;
}

// ─── Helper Functions ───────────────────────────────────────────────────

/**
 * Simple string hash for content comparison
 */
function simpleHash(str) {
  if (!str) return null;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Format a value for logging (redact sensitive info)
 */
function formatValue(value) {
  if (typeof value === 'string') {
    if (value.length > 100) return `${value.substring(0, 100)}...`;
    if (value.includes('key') || value.includes('token') || value.includes('password')) {
      return '[REDACTED]';
    }
    return value;
  }
  if (typeof value === 'object') {
    return JSON.stringify(value).substring(0, 100);
  }
  return String(value);
}
