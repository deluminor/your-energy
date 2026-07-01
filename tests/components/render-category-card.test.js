import { describe, expect, it } from 'vitest';
import { renderCategoryCard } from '../../src/components/category-card/render-category-card.js';

describe('renderCategoryCard', () => {
  it('renders name, caption and data attributes', () => {
    const html = renderCategoryCard({
      name: 'biceps',
      filter: 'muscles',
      imgURL: 'https://cdn.test/biceps.jpg',
      caption: 'Muscles',
    });

    expect(html).toContain('data-name="biceps"');
    expect(html).toContain('data-filter="muscles"');
    expect(html).toContain('>biceps<');
    expect(html).toContain('>Muscles<');
    expect(html).toContain("url('https://cdn.test/biceps.jpg')");
  });

  it('escapes HTML-special characters to prevent XSS', () => {
    const html = renderCategoryCard({
      name: '<img src=x onerror=alert(1)>',
      filter: '"&<>',
      imgURL: '',
      caption: '<script>',
    });

    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('&quot;&amp;&lt;&gt;');
  });

  it('encodes the image URL and neutralises single quotes', () => {
    const html = renderCategoryCard({
      name: 'x',
      filter: 'x',
      imgURL: "https://cdn.test/a b'c.jpg",
      caption: 'x',
    });

    expect(html).toContain('%20');
    expect(html).toContain('%27');
    expect(html).not.toContain("b'c");
  });

  it('tolerates missing imgURL', () => {
    const html = renderCategoryCard({
      name: 'x',
      filter: 'x',
      // @ts-expect-error runtime guard for missing API field
      imgURL: undefined,
      caption: 'x',
    });

    expect(html).toContain("url('')");
  });
});
