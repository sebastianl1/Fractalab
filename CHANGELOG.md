# Changelog

Todos los cambios notables del proyecto se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.1.0/)
y el proyecto usa [Conventional Commits](https://www.conventionalcommits.org/).

## [En desarrollo]

### Añadido — Pestañas y contenido educativo
- Navegación **multi-pestaña** por hash: Laboratorio, Aprende, Ejemplos,
  Videos y Recursos.
- **Pestaña Aprende**: 6 módulos curriculares y 19 lecciones bilingües con
  bloques LaTeX, ideas clave, demos interactivas y autoevaluación, más un
  glosario de 14 términos.
- **Pestaña Ejemplos**: galería de 15 casos curados con apertura en el
  laboratorio con parámetros precargados.
- **Pestaña Videos**: reproductor embebido + playlist + schema VideoObject.
- **Pestaña Recursos**: bibliografía académica del caos.
- i18n **ES/EN** con selector de idioma y detección por navegador.
- Paneles nuevos de **Serie Temporal** e **Histograma** de la órbita.
- **Exportación PNG** de cualquier panel de canvas.
- Estado del laboratorio compartible por URL (`#/lab?model=&r=&palette=`).

### Refactor — Fundación técnica
- Migración a **TypeScript estricto** en toda la base de código.
- **Vite 8** (Rolldown): se eliminan las vulnerabilidades esbuild/vite ≤ 6.
- Tooling: **ESLint**, **Prettier**, **Vitest** (19 tests del núcleo matemático).
- CI/CD: GitHub Actions con `typecheck`, `lint`, `test`, `build` y deploy a Pages.
- Higiene del repo: `node_modules/` y `docs/` fuera de git, LICENSE y
  CONTRIBUTING añadidos.
- Rendimiento: diagrama de bifurcación y fallback de Mandelbrot en **Web
  Workers**, caché del diagrama y curva de Lyapunov precomputada.

## [1.3.0] — 2026-07-22
- Estructura inicial del diagrama de bifurcación con sobremuestreo y heatmap.
- Vistas paralelas Bifurcación ↔ Mandelbrot con conector isomórfico en tiempo real.
- Panel 3D de espacio de fases (Three.js) y diagrama de telaraña.
- Casos de ingeniería, ejercicios guiados y sonificación básica.
