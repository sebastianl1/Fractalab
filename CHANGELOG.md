# Changelog

Todos los cambios notables del proyecto se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.1.0/)
y el proyecto usa [Conventional Commits](https://www.conventionalcommits.org/).

## [En desarrollo]

### Refactor — Fundación técnica
- Migración a **TypeScript estricto** (`strict`, `noUncheckedIndexedAccess`,
  `verbatimModuleSyntax`) en toda la base de código.
- **Vite 8** (Rolldown): se eliminan las vulnerabilidades de la cadena
  esbuild/vite ≤ 6 detectadas por `npm audit`.
- Tooling de calidad: **ESLint** (flat config + typescript-eslint),
  **Prettier**, **Vitest** para el núcleo matemático.
- CI/CD: **GitHub Actions** con `typecheck`, `lint`, `test` y `build` en PR,
  y **deploy automático a GitHub Pages** desde `main`.
- Higiene del repo: `node_modules/` y `docs/` fuera del control de versiones,
  `LICENSE` MIT y `CONTRIBUTING.md` añadidos.
- Scripts de calidad: `npm run typecheck`, `lint`, `format`, `test`.

## [1.3.0] — 2026-07-22
- Estructura inicial del diagrama de bifurcación con sobremuestreo y heatmap.
- Vistas paralelas Bifurcación ↔ Mandelbrot con conector isomórfico en tiempo real.
- Panel 3D de espacio de fases (Three.js) y diagrama de telaraña.
- Casos de ingeniería, ejercicios guiados y sonificación básica.
