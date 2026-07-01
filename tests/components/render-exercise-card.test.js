import { describe, expect, it } from 'vitest';
import { renderExerciseCard } from '../../src/components/exercise-card/render-exercise-card.js';

describe('renderExerciseCard', () => {
  it('renders name, meta, rating and the start button id', () => {
    const html = renderExerciseCard({
      _id: 'abc123',
      name: 'Air bike',
      rating: 4,
      burnedCalories: 312,
      bodyPart: 'waist',
      target: 'abs',
    });

    expect(html).toContain('data-id="abc123"');
    expect(html).toContain('>Air bike<');
    expect(html).toContain('4.0');
    expect(html).toContain('312 / 3 min');
    expect(html).toContain('waist');
    expect(html).toContain('abs');
    expect(html).toContain('WORKOUT');
  });

  it('formats rating to one decimal and tolerates missing values', () => {
    const html = renderExerciseCard({ _id: '1', name: 'x' });

    expect(html).toContain('0.0');
    expect(html).toContain('—');
  });

  it('escapes HTML-special characters to prevent XSS', () => {
    const html = renderExerciseCard({
      _id: '"><img src=x onerror=alert(1)>',
      name: '<script>alert(1)</script>',
      bodyPart: '"&<>',
      target: 'abs',
    });

    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
