import DOMPurify from 'isomorphic-dompurify';

/**
 * Allowed HTML tags for rich text content.
 * Only allows safe formatting tags that Quill uses.
 */
const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'blockquote',
  'pre',
  'code',
  'ul',
  'ol',
  'li',
  'a',
  'span',
];

/**
 * Allowed HTML attributes for rich text content.
 */
const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

/**
 * Maximum allowed length for contentHtml (in characters).
 * Set higher than content limit to account for HTML tags.
 */
const MAX_HTML_LENGTH = 50000;

/**
 * Sanitizes HTML content from the rich text editor.
 * Removes potentially dangerous tags and attributes.
 *
 * @param html - The HTML content to sanitize
 * @returns Sanitized HTML string or null if input is empty/invalid
 */
export function sanitizeHtml(html: string | undefined | null): string | null {
  if (!html || typeof html !== 'string') {
    return null;
  }

  // Check length before processing
  if (html.length > MAX_HTML_LENGTH) {
    return null;
  }

  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    // Add rel="noopener noreferrer" to links for security
    ADD_ATTR: ['target'],
  });

  // Return null for empty results (after removing all dangerous content)
  if (!clean || clean.trim() === '') {
    return null;
  }

  return clean;
}
