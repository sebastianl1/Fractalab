import { RESOURCES } from '../content/resources.js';
import { i18n } from '../core/i18n.js';
import type { Lang } from '../core/i18n.js';

/** Renders the "Recursos" tab: bibliography and references. */
export class ResourcesView {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(lang: Lang): void {
    const items = RESOURCES.map((r) => {
      const link = r.url
        ? `<a class="resource-link" href="${r.url}" target="_blank" rel="noopener noreferrer">↗ ${lang === 'es' ? 'Ver fuente' : 'View source'}</a>`
        : '';
      const note = r.note ? `<p class="resource-note">${this.esc(r.note[lang])}</p>` : '';
      return `
        <article class="resource-entry" data-kind="${r.kind}">
          <span class="resource-kind">${this.kindLabel(r.kind, lang)}</span>
          <p class="resource-citation">${this.esc(r.citation[lang])}</p>
          ${note}
          ${link}
        </article>
      `;
    }).join('');

    const readMore =
      lang === 'es'
        ? 'Para iniciarte, se recomienda el texto de Strogatz; el artículo de May (1976) es la lectura obligada que inspiró este laboratorio.'
        : 'To get started, Strogatz’s textbook is recommended; May’s 1976 paper is the essential reading that inspired this laboratory.';

    this.container.innerHTML = `
      <div class="resources-hero">
        <h2>📖 ${i18n.t('resources.title')}</h2>
        <p>${i18n.t('resources.subtitle')}</p>
        <p class="resources-read-more">${readMore}</p>
      </div>
      <div class="resources-list">${items}</div>
    `;
  }

  private kindLabel(kind: string, lang: Lang): string {
    if (kind === 'book') return lang === 'es' ? '📕 Libro' : '📕 Book';
    if (kind === 'classic') return lang === 'es' ? '⭐ Clásico' : '⭐ Classic';
    return lang === 'es' ? '📄 Artículo' : '📄 Paper';
  }

  private esc(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
