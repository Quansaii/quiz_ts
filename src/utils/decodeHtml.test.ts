import { describe, expect, it } from 'vitest';
import { decodeHtml } from './decodeHtml';

describe('decodeHtml', () => {
  it('returns text without entities unchanged', () => {
    expect(decodeHtml('Hello, world!')).toBe('Hello, world!');
  });

  it('returns an empty string for an empty string', () => {
    expect(decodeHtml('')).toBe('');
  });

  it.each([
    ['&quot;', '"'],
    ['&#039;', "'"],
    ['&#x27;', "'"],
    ['&amp;', '&'],
    ['&lt;', '<'],
    ['&gt;', '>'],
    ['&eacute;', 'é'],
    ['&Eacute;', 'É'],
    ['&rsquo;', '’'],
    ['&ldquo;', '“'],
    ['&deg;', '°'],
    ['&hellip;', '…'],
    ['&pi;', 'π'],
  ])('decodes the named entity %s', (entity, expected) => {
    expect(decodeHtml(entity)).toBe(expected);
  });

  it('decodes decimal numeric entities', () => {
    expect(decodeHtml('&#65;&#66;')).toBe('AB');
  });

  it('decodes hexadecimal numeric entities (lower and upper case x)', () => {
    expect(decodeHtml('&#x41;&#X42;')).toBe('AB');
  });

  it('decodes characters outside the basic plane', () => {
    expect(decodeHtml('&#x1F600;')).toBe('\u{1F600}');
  });

  it('decodes every occurrence in a sentence', () => {
    expect(decodeHtml('&quot;Tom &amp; Jerry&quot; isn&#039;t &quot;new&quot;')).toBe(
      '"Tom & Jerry" isn\'t "new"',
    );
  });

  it('does not decode twice', () => {
    expect(decodeHtml('&amp;quot;')).toBe('&quot;');
    expect(decodeHtml('&amp;#039;')).toBe('&#039;');
    expect(decodeHtml('&#38;amp;')).toBe('&amp;');
  });

  it('leaves unknown named entities as they are', () => {
    expect(decodeHtml('&unknownentity;')).toBe('&unknownentity;');
  });

  it('leaves numeric entities outside the Unicode range as they are', () => {
    expect(decodeHtml('&#99999999;')).toBe('&#99999999;');
  });

  it('leaves a bare ampersand as it is', () => {
    expect(decodeHtml('AT&T and Tom & Jerry')).toBe('AT&T and Tom & Jerry');
  });
});
