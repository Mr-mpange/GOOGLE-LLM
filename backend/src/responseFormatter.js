import { z } from 'zod';

/**
 * Schema for structured AI responses
 */
const ResponseSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string().optional(),
      content: z.string(),
      type: z.enum(['paragraph', 'list', 'code', 'heading']).default('paragraph')
    })
  ),
  summary: z.string().optional(),
  metadata: z
    .object({
      confidence: z.number().min(0).max(1).optional(),
      sources: z.array(z.string()).optional()
    })
    .optional()
});

/**
 * Format raw AI response into structured sections
 */
export function formatResponse(rawText) {
  const sections = [];
  const lines = rawText.split('\n').filter((line) => line.trim());

  let currentSection = null;
  let listItems = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect headings (lines starting with ** or #)
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }
      if (listItems.length > 0) {
        sections.push({
          type: 'list',
          content: listItems.join('\n')
        });
        listItems = [];
      }

      currentSection = {
        type: 'heading',
        title: trimmed.replace(/\*\*/g, '').trim(),
        content: ''
      };
    }
    // Detect list items
    else if (trimmed.match(/^[\*\-\•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
      if (currentSection && currentSection.content) {
        sections.push(currentSection);
        currentSection = null;
      }
      listItems.push(trimmed);
    }
    // Detect code blocks
    else if (trimmed.startsWith('```')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      if (listItems.length > 0) {
        sections.push({
          type: 'list',
          content: listItems.join('\n')
        });
        listItems = [];
      }
      currentSection = {
        type: 'code',
        content: ''
      };
    }
    // Regular paragraph
    else {
      if (listItems.length > 0) {
        sections.push({
          type: 'list',
          content: listItems.join('\n')
        });
        listItems = [];
      }

      if (!currentSection || currentSection.type === 'heading') {
        if (currentSection && currentSection.type === 'heading') {
          sections.push(currentSection);
        }
        currentSection = {
          type: 'paragraph',
          content: trimmed
        };
      } else {
        currentSection.content += ' ' + trimmed;
      }
    }
  }

  // Add remaining section
  if (currentSection) {
    sections.push(currentSection);
  }
  if (listItems.length > 0) {
    sections.push({
      type: 'list',
      content: listItems.join('\n')
    });
  }

  return {
    sections: sections.filter((s) => s.content || s.title),
    formatted: true
  };
}

/**
 * Convert structured response to HTML
 */
export function toHTML(structuredResponse) {
  let html = '<div class="ai-response">';

  for (const section of structuredResponse.sections) {
    switch (section.type) {
      case 'heading':
        html += `<h3 class="response-heading">${escapeHtml(section.title || section.content)}</h3>`;
        break;

      case 'list':
        html += '<ul class="response-list">';
        const items = section.content.split('\n');
        for (const item of items) {
          const cleaned = item.replace(/^[\*\-\•]\s+/, '').replace(/^\d+\.\s+/, '');
          html += `<li>${escapeHtml(cleaned)}</li>`;
        }
        html += '</ul>';
        break;

      case 'code':
        html += `<pre class="response-code"><code>${escapeHtml(section.content)}</code></pre>`;
        break;

      case 'paragraph':
      default:
        html += `<p class="response-paragraph">${escapeHtml(section.content)}</p>`;
        break;
    }
  }

  html += '</div>';
  return html;
}

/**
 * Convert structured response to Markdown
 */
export function toMarkdown(structuredResponse) {
  let markdown = '';

  for (const section of structuredResponse.sections) {
    switch (section.type) {
      case 'heading':
        markdown += `### ${section.title || section.content}\n\n`;
        break;

      case 'list':
        markdown += section.content + '\n\n';
        break;

      case 'code':
        markdown += '```\n' + section.content + '\n```\n\n';
        break;

      case 'paragraph':
      default:
        markdown += section.content + '\n\n';
        break;
    }
  }

  return markdown.trim();
}

/**
 * Process markdown formatting in text
 */
function processMarkdown(text) {
  // First escape HTML
  let processed = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Convert **bold** to <strong>
  processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Convert *italic* to <em>
  processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Convert `code` to <code>
  processed = processed.replace(/`(.+?)`/g, '<code class="inline-code">$1</code>');
  
  return processed;
}

/**
 * Escape HTML special characters (deprecated - use processMarkdown)
 */
function escapeHtml(text) {
  return processMarkdown(text);
}

export default {
  formatResponse,
  toHTML,
  toMarkdown,
  ResponseSchema
};
