import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { JsonLd } from './JsonLd';

/**
 * El JSON-LD tiene que llegar al HTML inicial: Googlebot lo lee del documento
 * servido, no del DOM después de hidratar. Por eso el componente no es client y
 * por eso estos tests miran el `<script>` renderizado, no un objeto.
 */
describe('JsonLd', () => {
  it('renderiza un script con el type que Google busca', () => {
    const { container } = render(<JsonLd data={{ '@context': 'https://schema.org' }} />);

    const script = container.querySelector('script[type="application/ld+json"]');

    expect(script).not.toBeNull();
  });

  it('serializa los datos recibidos', () => {
    const data = { '@context': 'https://schema.org', '@type': 'Organization', name: 'Auguria' };

    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(JSON.parse(script?.textContent ?? '{}')).toEqual(data);
  });

  it('⚠️ escapa el cierre de etiqueta: un "</script>" en los datos rompería el documento', () => {
    const { container } = render(<JsonLd data={{ name: 'roto</script><script>alert(1)' }} />);
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(script?.textContent).not.toContain('</script>');
    expect(container.querySelectorAll('script')).toHaveLength(1);
  });

  it('acepta un id para distinguir varios bloques en la misma página', () => {
    const { container } = render(<JsonLd id="organization-jsonld" data={{ name: 'Auguria' }} />);

    expect(container.querySelector('#organization-jsonld')).not.toBeNull();
  });
});
