import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '../sanitize';

describe('sanitizeHtml', () => {
  describe('valid input handling', () => {
    it('preserves allowed formatting tags', () => {
      const html = '<p><strong>Bold</strong> and <em>italic</em></p>';
      const result = sanitizeHtml(html);

      expect(result).toContain('<strong>Bold</strong>');
      expect(result).toContain('<em>italic</em>');
    });

    it('preserves underline and strikethrough', () => {
      const html = '<u>underline</u> and <s>strikethrough</s>';
      const result = sanitizeHtml(html);

      expect(result).toContain('<u>underline</u>');
      expect(result).toContain('<s>strikethrough</s>');
    });

    it('preserves blockquote and code blocks', () => {
      const html = '<blockquote>Quote</blockquote><pre><code>code</code></pre>';
      const result = sanitizeHtml(html);

      expect(result).toContain('<blockquote>Quote</blockquote>');
      expect(result).toContain('<pre><code>code</code></pre>');
    });

    it('preserves list elements', () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = sanitizeHtml(html);

      expect(result).toContain('<ul>');
      expect(result).toContain('<li>Item 1</li>');
    });

    it('preserves ordered lists', () => {
      const html = '<ol><li>First</li><li>Second</li></ol>';
      const result = sanitizeHtml(html);

      expect(result).toContain('<ol>');
      expect(result).toContain('<li>First</li>');
    });

    it('preserves links with href', () => {
      const html = '<a href="https://example.com">Link</a>';
      const result = sanitizeHtml(html);

      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('>Link</a>');
    });

    it('preserves br tags', () => {
      const html = 'Line 1<br>Line 2';
      const result = sanitizeHtml(html);

      expect(result).toContain('<br>');
    });

    it('preserves span tags', () => {
      const html = '<span>Span content</span>';
      const result = sanitizeHtml(html);

      expect(result).toContain('<span>Span content</span>');
    });
  });

  describe('mention attributes', () => {
    it('preserves data-mention-type attribute', () => {
      const html = '<span data-mention-type="USER">@user</span>';
      const result = sanitizeHtml(html);

      expect(result).toContain('data-mention-type="USER"');
    });

    it('preserves data-mention-id attribute', () => {
      const html = '<span data-mention-id="123">@user</span>';
      const result = sanitizeHtml(html);

      expect(result).toContain('data-mention-id="123"');
    });

    it('preserves data-mention-label attribute', () => {
      const html = '<span data-mention-label="johndoe">@user</span>';
      const result = sanitizeHtml(html);

      expect(result).toContain('data-mention-label="johndoe"');
    });

    it('preserves all mention attributes together', () => {
      const html = '<span data-mention-type="USER" data-mention-id="123" data-mention-label="johndoe">@johndoe</span>';
      const result = sanitizeHtml(html);

      expect(result).toContain('data-mention-type="USER"');
      expect(result).toContain('data-mention-id="123"');
      expect(result).toContain('data-mention-label="johndoe"');
    });

    it('preserves data-type, data-id, data-label attributes', () => {
      const html = '<span data-type="mention" data-id="456" data-label="test">content</span>';
      const result = sanitizeHtml(html);

      expect(result).toContain('data-type="mention"');
      expect(result).toContain('data-id="456"');
      expect(result).toContain('data-label="test"');
    });
  });

  describe('link attributes', () => {
    it('preserves href attribute', () => {
      const html = '<a href="https://example.com">Link</a>';
      const result = sanitizeHtml(html);

      expect(result).toContain('href="https://example.com"');
    });

    it('preserves target attribute', () => {
      const html = '<a href="#" target="_blank">Link</a>';
      const result = sanitizeHtml(html);

      expect(result).toContain('target="_blank"');
    });

    it('preserves rel attribute', () => {
      const html = '<a href="#" rel="noopener noreferrer">Link</a>';
      const result = sanitizeHtml(html);

      expect(result).toContain('rel="noopener noreferrer"');
    });

    it('preserves class attribute', () => {
      const html = '<span class="mention">@user</span>';
      const result = sanitizeHtml(html);

      expect(result).toContain('class="mention"');
    });
  });

  describe('XSS prevention', () => {
    it('removes script tags', () => {
      const html = '<p>Hello</p><script>alert("xss")</script>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('removes onerror attributes', () => {
      // img is not in allowed list, so the whole tag is removed
      const html = '<img src="x" onerror="alert(\'xss\')">';
      const result = sanitizeHtml(html);

      // Since img is not allowed, entire content is stripped, returning null
      expect(result).toBeNull();
    });

    it('removes onclick attributes', () => {
      const html = '<a href="#" onclick="evil()">Click</a>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('onclick');
    });

    it('removes iframe tags', () => {
      const html = '<iframe src="https://evil.com"></iframe>';
      const result = sanitizeHtml(html);

      // iframe is not allowed, entire content is stripped, returning null
      expect(result).toBeNull();
    });

    it('removes object and embed tags', () => {
      const html = '<object data="evil.swf"></object><embed src="evil.swf">';
      const result = sanitizeHtml(html);

      // object and embed are not allowed, entire content is stripped, returning null
      expect(result).toBeNull();
    });

    it('removes style tags', () => {
      const html = '<style>body { display: none; }</style><p>Content</p>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('<style>');
    });

    it('removes javascript: URLs', () => {
      const html = '<a href="javascript:alert(1)">Click</a>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('javascript:');
    });

    it('removes data: URLs in links', () => {
      const html = '<a href="data:text/html,<script>alert(1)</script>">Click</a>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('data:text/html');
    });

    it('removes img tags (not in allowed list)', () => {
      const html = '<img src="https://example.com/image.jpg">';
      const result = sanitizeHtml(html);

      // img is not allowed, entire content is stripped, returning null
      expect(result).toBeNull();
    });

    it('removes disallowed data attributes', () => {
      const html = '<span data-custom="malicious">content</span>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('data-custom');
    });
  });

  describe('null/empty handling', () => {
    it('returns null for null input', () => {
      expect(sanitizeHtml(null)).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(sanitizeHtml(undefined)).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(sanitizeHtml('')).toBeNull();
    });

    it('returns null for whitespace-only string', () => {
      expect(sanitizeHtml('   ')).toBeNull();
    });

    it('returns null for string with only stripped tags', () => {
      const html = '<script>alert(1)</script>';
      expect(sanitizeHtml(html)).toBeNull();
    });
  });

  describe('length limits', () => {
    it('returns null for content exceeding max length', () => {
      const longHtml = '<p>' + 'a'.repeat(50001) + '</p>';
      expect(sanitizeHtml(longHtml)).toBeNull();
    });

    it('accepts content at exactly max length', () => {
      const html = 'a'.repeat(50000);
      const result = sanitizeHtml(html);

      expect(result).not.toBeNull();
    });

    it('accepts content under max length', () => {
      const html = '<p>' + 'a'.repeat(1000) + '</p>';
      const result = sanitizeHtml(html);

      expect(result).not.toBeNull();
    });
  });

  describe('edge cases', () => {
    it('handles nested tags correctly', () => {
      const html = '<p><strong><em>Nested</em></strong></p>';
      const result = sanitizeHtml(html);

      expect(result).toContain('<strong><em>Nested</em></strong>');
    });

    it('handles complex HTML structure', () => {
      const html = `
        <p>Hello <strong>world</strong></p>
        <ul>
          <li>Item with <a href="https://example.com">link</a></li>
        </ul>
        <blockquote>A quote</blockquote>
      `;
      const result = sanitizeHtml(html);

      expect(result).toContain('<strong>world</strong>');
      expect(result).toContain('<li>');
      expect(result).toContain('<blockquote>');
    });

    it('preserves plain text', () => {
      const html = 'Just plain text without tags';
      const result = sanitizeHtml(html);

      expect(result).toBe('Just plain text without tags');
    });
  });
});
