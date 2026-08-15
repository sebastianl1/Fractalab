/**
 * Scroll-reveal helper: adds `.visible` to `.reveal` elements as they enter
 * the viewport (GPU-safe opacity/transform only). Respects reduced motion.
 */
export function initReveals(): void {
  const els = document.querySelectorAll<HTMLElement>('.reveal');

  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
  );

  els.forEach((el) => io.observe(el));
}
