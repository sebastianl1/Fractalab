/**
 * LaTeX Rendering Helper Utility using KaTeX or HTML Fallback
 */
export function renderLatex(elementOrId, latexString, displayMode = false) {
  const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
  if (!el) return;

  if (window.katex) {
    try {
      window.katex.render(latexString, el, {
        displayMode: displayMode,
        throwOnError: false
      });
      return;
    } catch (err) {
      console.warn('KaTeX rendering error:', err);
    }
  }

  // Fallback to text if KaTeX is not loaded yet
  el.textContent = latexString;
}
