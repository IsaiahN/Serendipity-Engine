/**
 * Serendipity | StoryWeaver — Export Engine
 *
 * Handles exporting projects in various formats:
 * - Markdown (.md)
 * - JSON (.json) — full project data
 * - ZIP (.zip) — complete project archive
 * - DOCX (.docx) — professional Word document
 * - PDF (.pdf) — portable document format
 * - EPUB (.epub) — e-book format
 * - Fountain (.fountain) — screenplay format
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak, Footer, PageNumber, NumberFormat } from 'docx';
import JSZip from 'jszip';

/**
 * Export a single file as a download
 */
export function downloadFile(content, filename, type = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
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

  downloadFile(content, `${slugify(projectTitle)}.md`);
}

/**
 * Export project as JSON (full data for import/restore)
 */
export function exportAsJSON(projectData) {
  const json = JSON.stringify(projectData, null, 2);
  downloadFile(
    json,
    `${slugify(projectData.project?.title || 'project')}-export.json`,
    'application/json'
  );
}

/**
 * Export project as a ZIP archive using jszip npm package
 */
export async function exportAsZip(projectData) {
  const zip = new JSZip();
  const projectName = slugify(projectData.project?.title || 'project');
  const folder = zip.folder(projectName);

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
    version: '1.1',
    characterFormat: '2.0',
  }, null, 2));

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export project as DOCX (Word document)
 * Creates a professional document with title page, TOC, and formatted chapters
 */
export async function exportAsDocx(files, projectTitle, options = {}) {
  const { authorName = 'Serendipity | StoryWeaver', includeMetadata = true } = options;

  // Get chapters sorted by number
  const chapters = Object.entries(files)
    .filter(([path]) => path.match(/^story\/chapter-\d+\.md$/))
    .sort(([a], [b]) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });

  const sections = [];

  // Title page
  const titlePageSection = {
    properties: {},
    children: [
      new Paragraph({
        text: projectTitle,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        run: new TextRun({ size: 48, bold: true, font: 'Times New Roman' }),
      }),
      new Paragraph({
        text: '',
        spacing: { after: 600 },
      }),
      new Paragraph({
        text: `by ${authorName}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        run: new TextRun({ size: 24, font: 'Times New Roman' }),
      }),
      new Paragraph({
        text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        alignment: AlignmentType.CENTER,
        run: new TextRun({ size: 24, font: 'Times New Roman' }),
      }),
      new PageBreak(),
    ],
  };

  sections.push(titlePageSection);

  // Table of Contents
  const tocChildren = [
    new Paragraph({
      text: 'Table of Contents',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 400 },
    }),
  ];

  for (const [path] of chapters) {
    const num = path.match(/\d+/)[0];
    tocChildren.push(
      new Paragraph({
        text: `Chapter ${num}`,
        spacing: { after: 200 },
      })
    );
  }

  tocChildren.push(new PageBreak());

  sections.push({
    properties: {},
    children: tocChildren,
  });

  // Content sections
  for (const [path, text] of chapters) {
    const num = path.match(/\d+/)[0];
    const contentChildren = [];

    // Chapter heading
    contentChildren.push(
      new Paragraph({
        text: `Chapter ${num}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400, line: 480 },
        run: new TextRun({ size: 24, bold: true, font: 'Times New Roman' }),
      })
    );

    // Process chapter text
    const paragraphs = text.split('\n\n');
    let isFirstParagraph = true;

    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      // Check for scene break (looks like ***)
      if (trimmed === '***' || trimmed === '* * *') {
        contentChildren.push(
          new Paragraph({
            text: '***',
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
          })
        );
      } else {
        // Regular body paragraph
        contentChildren.push(
          new Paragraph({
            text: trimmed,
            spacing: { line: 480, after: 200 },
            indent: isFirstParagraph ? { firstLine: 0 } : { firstLine: 720 }, // 0.5in indent
            run: new TextRun({ size: 24, font: 'Times New Roman' }),
          })
        );
        isFirstParagraph = false;
      }
    }

    contentChildren.push(new PageBreak());

    sections.push({
      properties: {},
      children: contentChildren,
    });
  }

  // Remove last page break
  if (sections[sections.length - 1].children.length > 0) {
    const lastSection = sections[sections.length - 1];
    if (lastSection.children[lastSection.children.length - 1] instanceof PageBreak) {
      lastSection.children.pop();
    }
  }

  // Create document with footer containing page numbers
  const doc = new Document({
    sections: sections.map((section) => ({
      ...section,
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new PageNumber(),
              ],
            }),
          ],
        }),
      },
    })),
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugify(projectTitle)}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export project as PDF using jsPDF
 */
export async function exportAsPdf(files, projectTitle, options = {}) {
  const { authorName = 'Serendipity | StoryWeaver' } = options;

  // Get chapters sorted by number
  const chapters = Object.entries(files)
    .filter(([path]) => path.match(/^story\/chapter-\d+\.md$/))
    .sort(([a], [b]) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });

  // Minimal PDF builder (no external dependencies)
  // PDF coordinate system: 72 units per inch, origin at bottom-left
  const PAGE_W = 612; // 8.5 inches
  const PAGE_H = 792; // 11 inches
  const MARGIN = 72;  // 1 inch
  const LINE_HEIGHT = 18; // ~12pt double spaced
  const TEXT_W = PAGE_W - 2 * MARGIN;
  const CHARS_PER_LINE = Math.floor(TEXT_W / 6); // ~6pt per char in Helvetica 12pt

  function escPdf(str) {
    return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  function wordWrap(text, maxChars) {
    const words = text.split(/\s+/);
    const lines = [];
    let current = '';
    for (const word of words) {
      if (current.length + word.length + 1 > maxChars && current.length > 0) {
        lines.push(current);
        current = word;
      } else {
        current = current ? current + ' ' + word : word;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  // Build pages as arrays of text commands
  const pages = [];
  let currentPage = [];
  let y = PAGE_H - MARGIN;

  function newPage() {
    if (currentPage.length > 0) pages.push(currentPage);
    currentPage = [];
    y = PAGE_H - MARGIN;
  }

  function addText(text, fontSize = 12, bold = false, centered = false) {
    const font = bold ? '/F2' : '/F1';
    const wrapped = wordWrap(text, Math.floor(CHARS_PER_LINE * (12 / fontSize)));
    for (const line of wrapped) {
      if (y - fontSize < MARGIN) newPage();
      const x = centered ? (PAGE_W / 2 - (line.length * fontSize * 0.3)) : MARGIN;
      currentPage.push(`BT ${font} ${fontSize} Tf ${x} ${y} Td (${escPdf(line)}) Tj ET`);
      y -= LINE_HEIGHT * (fontSize / 12);
    }
  }

  function addSpace(pts = LINE_HEIGHT) {
    y -= pts;
    if (y < MARGIN) newPage();
  }

  // Title page
  addSpace(200);
  addText(projectTitle, 24, true, true);
  addSpace(60);
  addText(`by ${authorName}`, 14, false, true);
  addSpace(20);
  addText(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 11, false, true);

  // Chapters
  for (const [path, text] of chapters) {
    const num = path.match(/\d+/)[0];
    newPage();
    addSpace(40);
    addText(`Chapter ${num}`, 18, true, true);
    addSpace(30);

    const paragraphs = text.split('\n\n');
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('#')) {
        addSpace(10);
        addText(trimmed.replace(/^#+\s*/, ''), 14, true, false);
        addSpace(6);
      } else if (trimmed === '***' || trimmed === '* * *') {
        addSpace(10);
        addText('* * *', 12, false, true);
        addSpace(10);
      } else {
        addText(trimmed, 12, false, false);
        addSpace(8);
      }
    }
  }

  // Flush last page
  if (currentPage.length > 0) pages.push(currentPage);

  // If no chapters, still produce the title page
  if (pages.length === 0) pages.push([]);

  // Assemble raw PDF
  let objects = [];
  let xrefs = [];
  let pdf = '%PDF-1.4\n';

  function addObj(content) {
    const num = objects.length + 1;
    xrefs.push(pdf.length);
    pdf += `${num} 0 obj\n${content}\nendobj\n`;
    objects.push(num);
    return num;
  }

  // Catalog
  const catalogRef = addObj('<< /Type /Catalog /Pages 2 0 R >>');
  // Pages (placeholder, will be rebuilt)
  const pagesRef = addObj('PAGES_PLACEHOLDER');

  // Fonts
  const fontRef = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const fontBoldRef = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  // Page objects
  const pageObjRefs = [];
  const streamObjRefs = [];
  for (let i = 0; i < pages.length; i++) {
    const streamContent = pages[i].join('\n');
    const streamRef = addObj(`<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream`);
    streamObjRefs.push(streamRef);

    const pageRef = addObj(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
      `/Contents ${streamRef} 0 R /Resources << /Font << /F1 ${fontRef} 0 R /F2 ${fontBoldRef} 0 R >> >> >>`
    );
    pageObjRefs.push(pageRef);
  }

  // Rebuild pages object with correct kids
  const kidsStr = pageObjRefs.map(r => `${r} 0 R`).join(' ');
  const pagesContent = `<< /Type /Pages /Kids [${kidsStr}] /Count ${pages.length} >>`;
  // Patch the pages object in the PDF string
  pdf = pdf.replace('PAGES_PLACEHOLDER', pagesContent);
  // Recalculate xref offsets after patching
  const pdfLines = pdf.split('\n');
  xrefs = [];
  let offset = 0;
  for (const line of pdfLines) {
    const match = line.match(/^(\d+) 0 obj$/);
    if (match) {
      const objNum = parseInt(match[1]);
      while (xrefs.length < objNum) xrefs.push(0);
      xrefs[objNum - 1] = offset;
    }
    offset += line.length + 1;
  }

  // Cross-reference table
  const xrefOffset = pdf.length;
  pdf += 'xref\n';
  pdf += `0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (const off of xrefs) {
    pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  }

  // Trailer
  pdf += 'trailer\n';
  pdf += `<< /Size ${objects.length + 1} /Root ${catalogRef} 0 R >>\n`;
  pdf += 'startxref\n';
  pdf += `${xrefOffset}\n`;
  pdf += '%%EOF\n';

  // Return as blob
  return new Blob([pdf], { type: 'application/pdf' });
}

/**
 * Export project as EPUB (e-book format)
 * EPUB is a ZIP file with a specific structure
 */
export async function exportAsEpub(files, projectTitle, options = {}) {
  const { authorName = 'Serendipity | StoryWeaver' } = options;
  const projectSlug = slugify(projectTitle);
  const uuid = `urn:uuid:${generateUUID()}`;

  // Get chapters sorted by number
  const chapters = Object.entries(files)
    .filter(([path]) => path.match(/^story\/chapter-\d+\.md$/))
    .sort(([a], [b]) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });

  const zip = new JSZip();

  // 1. mimetype file (must be first, uncompressed)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml" />
  </rootfiles>
</container>`;
  zip.folder('META-INF').file('container.xml', containerXml);

  // 3. Build manifest and spine for content.opf
  let manifestItems = '';
  let spineItems = '';

  for (let i = 0; i < chapters.length; i++) {
    const chapterId = `chapter-${i + 1}`;
    manifestItems += `    <item id="${chapterId}" href="${chapterId}.xhtml" media-type="application/xhtml+xml" />\n`;
    spineItems += `    <itemref idref="${chapterId}" />\n`;
  }

  // 4. OEBPS/content.opf (package document)
  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uuid_id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${escapeXml(projectTitle)}</dc:title>
    <dc:creator>${escapeXml(authorName)}</dc:creator>
    <dc:date>${new Date().toISOString().split('T')[0]}</dc:date>
    <dc:identifier id="uuid_id">${uuid}</dc:identifier>
    <dc:language>en</dc:language>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" />
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav" />
    <item id="css" href="stylesheet.css" media-type="text/css" />
    <item id="title" href="title.xhtml" media-type="application/xhtml+xml" />
${manifestItems}  </manifest>
  <spine toc="ncx">
    <itemref idref="title" />
${spineItems}  </spine>
</package>`;
  zip.folder('OEBPS').file('content.opf', contentOpf);

  // 5. OEBPS/toc.ncx (navigation)
  let ncxItems = '';
  for (let i = 0; i < chapters.length; i++) {
    ncxItems += `    <navPoint id="chapter-${i + 1}" playOrder="${i + 2}">
      <navLabel>
        <text>Chapter ${i + 1}</text>
      </navLabel>
      <content src="chapter-${i + 1}.xhtml" />
    </navPoint>\n`;
  }

  const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${uuid}" />
    <meta name="dtb:depth" content="1" />
    <meta name="dtb:totalPageCount" content="0" />
    <meta name="dtb:maxPageNumber" content="0" />
  </head>
  <docTitle>
    <text>${escapeXml(projectTitle)}</text>
  </docTitle>
  <navMap>
    <navPoint id="title" playOrder="1">
      <navLabel>
        <text>Title Page</text>
      </navLabel>
      <content src="title.xhtml" />
    </navPoint>
${ncxItems}  </navMap>
</ncx>`;
  zip.folder('OEBPS').file('toc.ncx', tocNcx);

  // 6. OEBPS/nav.xhtml (EPUB3 nav)
  let navItems = '';
  for (let i = 0; i < chapters.length; i++) {
    navItems += `        <li><a href="chapter-${i + 1}.xhtml">Chapter ${i + 1}</a></li>\n`;
  }

  const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Navigation</title>
  <link rel="stylesheet" type="text/css" href="stylesheet.css" />
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
      <li><a href="title.xhtml">Title Page</a></li>
${navItems}    </ol>
  </nav>
</body>
</html>`;
  zip.folder('OEBPS').file('nav.xhtml', navXhtml);

  // 7. OEBPS/title.xhtml (title page)
  const titleXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${escapeXml(projectTitle)}</title>
  <link rel="stylesheet" type="text/css" href="stylesheet.css" />
</head>
<body>
  <div class="title-page">
    <h1 class="title">${escapeXml(projectTitle)}</h1>
    <p class="author">by ${escapeXml(authorName)}</p>
    <p class="date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>
</body>
</html>`;
  zip.folder('OEBPS').file('title.xhtml', titleXhtml);

  // 8. Create chapter XHTML files from markdown
  for (let i = 0; i < chapters.length; i++) {
    const [path, text] = chapters[i];
    const num = path.match(/\d+/)[0];

    // Convert markdown to simple HTML
    const htmlContent = markdownToHtml(text);

    const chapterXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Chapter ${num}</title>
  <link rel="stylesheet" type="text/css" href="stylesheet.css" />
</head>
<body>
  <div class="chapter">
    <h1>Chapter ${num}</h1>
${htmlContent}  </div>
</body>
</html>`;
    zip.folder('OEBPS').file(`chapter-${i + 1}.xhtml`, chapterXhtml);
  }

  // 9. OEBPS/stylesheet.css
  const css = `body {
  font-family: Georgia, serif;
  font-size: 1.2em;
  line-height: 1.5;
  margin: 1em;
}

h1 {
  font-size: 1.8em;
  font-weight: bold;
  margin-bottom: 0.5em;
  text-align: center;
}

p {
  margin-bottom: 0.5em;
  text-align: justify;
}

.title-page {
  text-align: center;
  padding: 3em 0;
}

.title-page .title {
  font-size: 2em;
  margin-bottom: 1em;
  font-weight: bold;
}

.title-page .author {
  font-size: 1.2em;
  margin: 0.5em 0;
}

.title-page .date {
  font-size: 1em;
  margin-top: 2em;
  color: #666;
}

.chapter {
  margin: 0;
}

.scene-break {
  text-align: center;
  margin: 1em 0;
  font-weight: bold;
}

a {
  color: #0066cc;
  text-decoration: none;
}

a:visited {
  color: #660066;
}

blockquote {
  margin-left: 1em;
  padding-left: 1em;
  border-left: 2px solid #ccc;
  font-style: italic;
}`;
  zip.folder('OEBPS').file('stylesheet.css', css);

  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectSlug}.epub`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export project as Fountain screenplay format
 */
export function exportAsFountain(files, projectTitle, options = {}) {
  const { authorName = 'Serendipity | StoryWeaver' } = options;

  // Get chapters sorted by number
  const chapters = Object.entries(files)
    .filter(([path]) => path.match(/^story\/chapter-\d+\.md$/))
    .sort(([a], [b]) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });

  let content = '';

  // Title page block
  content += `Title: ${projectTitle}\n`;
  content += `Author: ${authorName}\n`;
  content += `Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n`;
  content += '\n';

  // Process chapters as acts and scenes
  for (const [path, text] of chapters) {
    const num = path.match(/\d+/)[0];

    // Chapter as ACT heading
    content += `# ACT ${num}\n\n`;

    // Parse the chapter text for dialogue and action
    const paragraphs = text.split('\n\n');

    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      // Check for scene break
      if (trimmed === '***' || trimmed === '* * *') {
        content += '\n***\n\n';
      }
      // Check if it looks like dialogue (quoted text or character: dialogue pattern)
      else if (trimmed.match(/^["'].*["']$/m) || trimmed.match(/^[A-Z\s]+:\s+/)) {
        // Try to format as dialogue
        if (trimmed.match(/^["']/)) {
          // Quoted dialogue - treat as character dialogue
          const dialogueContent = trimmed.replace(/^["']|["']$/g, '');
          content += dialogueContent + '\n\n';
        } else {
          // Character: dialogue format
          content += trimmed + '\n\n';
        }
      } else {
        // Regular action/prose
        content += trimmed + '\n\n';
      }
    }

    content += '\n';
  }

  downloadFile(content, `${slugify(projectTitle)}.fountain`);
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

/**
 * Helper: Convert text to URL-safe slug
 */
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project';
}

/**
 * Helper: Escape XML special characters
 */
function escapeXml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Helper: Generate a UUID v4
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Helper: Convert markdown to simple HTML for EPUB
 */
function markdownToHtml(markdown) {
  let html = '';
  const paragraphs = markdown.split('\n\n');

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Check for scene break
    if (trimmed === '***' || trimmed === '* * *') {
      html += '    <p class="scene-break">***</p>\n';
    }
    // Check for headings
    else if (trimmed.match(/^#+\s/)) {
      const level = trimmed.match(/^(#+)/)[1].length;
      const content = trimmed.replace(/^#+\s/, '');
      html += `    <h${level}>${escapeXml(content)}</h${level}>\n`;
    }
    // Regular paragraph
    else {
      html += `    <p>${escapeXml(trimmed)}</p>\n`;
    }
  }

  return html;
}
