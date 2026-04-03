/**
 * Serendipity Engine — Export Engine
 *
 * Handles exporting projects in various formats:
 * - Markdown (.md)
 * - JSON (.json) — full project data
 * - ZIP (.zip) — complete project archive
 *
 * Note: DOCX, PDF, EPUB, and Fountain export require
 * additional libraries and will be implemented in Phase D.
 */

/**
 * Export a single file as a download
 */
export function downloadFile(filename, content, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export project as clean markdown (story chapters only)
 */
export function exportAsMarkdown(files, projectTitle) {
  const chapters = Object.entries(files)
    .filter(([path]) => path.match(/^story\/chapter-\d+\.md$/))
    .sort(([a], [b]) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });

  let content = `# ${projectTitle}\n\n`;

  for (const [path, text] of chapters) {
    const num = path.match(/\d+/)[0];
    content += `## Chapter ${num}\n\n${text}\n\n---\n\n`;
  }

  downloadFile(`${slugify(projectTitle)}.md`, content);
}

/**
 * Export project as JSON (full data for import/restore)
 */
export function exportAsJSON(projectData) {
  const json = JSON.stringify(projectData, null, 2);
  downloadFile(
    `${slugify(projectData.project?.title || 'project')}-export.json`,
    json,
    'application/json'
  );
}

/**
 * Export project as a ZIP archive
 * Uses JSZip if available, falls back to JSON bundle
 */
export async function exportAsZip(projectData) {
  // Check if JSZip is available
  if (typeof window.JSZip !== 'undefined') {
    const zip = new window.JSZip();
    const folder = zip.folder(slugify(projectData.project?.title || 'project'));

    // Add each file
    for (const file of projectData.files || []) {
      folder.file(file.path, file.content || '');
    }

    // Add metadata
    folder.file('_project-meta.json', JSON.stringify({
      title: projectData.project?.title,
      medium: projectData.project?.medium,
      genre: projectData.project?.genre,
      seed: projectData.project?.seed,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }, null, 2));

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(projectData.project?.title || 'project')}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    // Fallback: export as JSON
    exportAsJSON(projectData);
  }
}

/**
 * Import a project from JSON file
 */
export function readImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (err) {
        reject(new Error('Invalid project file format'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Count words in text
 */
export function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Count total words across all chapter files
 */
export function countProjectWords(files) {
  return Object.entries(files)
    .filter(([path]) => path.match(/^story\/chapter-\d+\.md$/))
    .reduce((total, [_, content]) => total + countWords(content), 0);
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project';
}
