/**
 * Serendipity Engine — Series Context Service
 *
 * Builds condensed context from related projects in a series,
 * suitable for injection into LLM prompts to maintain continuity
 * across series entries.
 */

import db from '../lib/db';

/**
 * Load all projects in a series, ordered by seriesOrder.
 * Returns array of { project, files } sorted chronologically.
 */
export async function loadSeriesData(seriesName) {
  if (!seriesName) return null;

  const seriesProjects = await db.projects
    .filter(p => p.series === seriesName)
    .toArray();

  if (seriesProjects.length <= 1) return null; // No series context needed for single project

  // Sort by seriesOrder (nulls last)
  seriesProjects.sort((a, b) => (a.seriesOrder || 999) - (b.seriesOrder || 999));

  const result = [];
  for (const project of seriesProjects) {
    const fileRecords = await db.projectFiles
      .where('projectId').equals(project.id)
      .toArray();

    const files = {};
    fileRecords.forEach(f => {
      files[f.path] = f.content;
    });

    result.push({
      project,
      files,
    });
  }

  return result;
}

/**
 * Truncate text to a maximum character length
 */
function truncate(text, maxChars) {
  if (!text || text.length <= maxChars) return text || '';
  return text.slice(0, maxChars) + '... [truncated]';
}

/**
 * Build a condensed series context string for LLM injection.
 * Focuses on: timeline position, character evolution, world state, key plot points.
 * Budget: ~2000 tokens per sibling project, more for adjacent entries.
 */
export function buildSeriesContext(seriesData, currentProjectId) {
  if (!seriesData || seriesData.length <= 1) return '';

  const currentIndex = seriesData.findIndex(d => d.project.id === currentProjectId);

  let context = `## SERIES CONTEXT: "${seriesData[0].project.series}"\n`;
  context += `This story is part of a ${seriesData.length}-book series. `;
  context += `The current project is entry #${currentIndex + 1} in the chronological timeline.\n\n`;
  context += `### Series Timeline (Chronological Order):\n`;

  for (let i = 0; i < seriesData.length; i++) {
    const { project, files } = seriesData[i];
    const isCurrent = project.id === currentProjectId;
    const isAdjacent = Math.abs(i - currentIndex) === 1;

    context += `\n#### ${i + 1}. "${project.title}" [${project.seriesRole || 'mainline'}]${isCurrent ? ' ← CURRENT PROJECT' : ''}\n`;
    context += `Genre: ${project.genre || 'unset'} | Medium: ${project.medium || 'unset'} | Words: ${project.wordCount || 0}\n`;

    if (isCurrent) {
      context += `(Full context provided separately in the main prompt.)\n`;
      continue;
    }

    // For adjacent books, provide more detail
    const charLimit = isAdjacent ? 3000 : 1200;

    // Characters summary
    const charFiles = Object.entries(files)
      .filter(([path]) => path.startsWith('characters/') && path !== 'characters/questions-answered.md')
      .map(([path, content]) => content)
      .join('\n---\n');
    if (charFiles) {
      context += `**Characters:**\n${truncate(charFiles, isAdjacent ? 1000 : 400)}\n`;
    }

    // Outline/arc
    const outline = files['outline.md'];
    if (outline) {
      context += `**Outline:**\n${truncate(outline, isAdjacent ? 800 : 300)}\n`;
    }

    // World building
    const world = files['world/world-building.md'];
    if (world) {
      context += `**World:**\n${truncate(world, isAdjacent ? 600 : 200)}\n`;
    }

    // Arc
    const arc = files['story/arc.md'];
    if (arc) {
      context += `**Story Arc:**\n${truncate(arc, isAdjacent ? 600 : 300)}\n`;
    }
  }

  context += `\n### SERIES CONTINUITY NOTES:\n`;
  context += `- Characters may appear across books at different ages/stages of development\n`;
  context += `- World-building elements established in earlier entries should be respected\n`;
  context += `- The current project's position in the timeline determines which events have "already happened" vs "haven't occurred yet"\n`;
  context += `- Prequels should not reference events from later timeline entries\n`;
  context += `- Spinoffs may share world and some characters but have their own central cast\n`;

  return context;
}
