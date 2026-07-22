# ⚡ ChaosLab STEM: Bifurcaciones ↔ Mandelbrot Explorer

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![Canvas API](https://img.shields.io/badge/HTML5-Canvas_2D-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/API/Canvas_API)
[![Web Audio API](https://img.shields.io/badge/Web_Audio-API-9B51E0?style=for-the-badge)](https://developer.mozilla.org/es/docs/Web/API/Web_Audio_API)
[![License](https://img.shields.io/badge/License-MIT-green.style=for-the-badge)](LICENSE)

**ChaosLab STEM** es un **Laboratorio Virtual Interactivo** de dinamica no lineal, teoría del caos e isomorfismo con el Conjunto de Mandelbrot diseñado para educación superior e ingeniería.

---

## 🌟 Características Principales

- **🧮 Catálogo de 5 Modelos Matemáticos Seleccionables**:
  - **Mapa Logístico**: $x_{n+1} = r \cdot x \cdot (1 - x)$
  - **Mapa Seno**: $x_{n+1} = r \cdot \sin(\pi x)$
  - **Mapa Cuadrático**: $x_{n+1} = r - x^2$
  - **Mapa Exponencial**: $x_{n+1} = r \cdot e^{-x}$
  - **Polinómico Generativo**: $x_{n+1} = r \cdot x \cdot (1 - x^k)$ *(con selector de grado $k \in \{2, 3, 4, 5\}$)*

- **🖥️ Vista Paralela Dual & Conector Isomórfico**:
  - Diagrama de Bifurcación a la izquierda ($r$ vs $x$) con trazado de Exponente de Lyapunov ($\lambda$).
  - Corte real del Conjunto de Mandelbrot a la derecha ($c \in [-2.0, 0.25]$).
  - Tarjeta e indicador visual dinámico en tiempo real conectando ambos espacios:
    $$c = \frac{2r - r^2}{4} \quad \iff \quad r = 1 + \sqrt{1 - 4c}$$

- **🏭 Panel de Aplicaciones Reales en Ingeniería**:
  - **⚡ Eléctrica**: Convertidores DC-DC Buck/Boost y rizado caótico en circuitos RLC.
  - **🧪 Procesos**: Reacciones químicas autocatalíticas y estabilidad de reactores (CSTR).
  - **⚙️ Mecánica**: Vibraciones caóticas en estructuras y oscilador Duffing.
  - **🌱 Ambiental**: Modelos poblacionales de Ricker y riesgo de colapso ecológico.
  - **💻 Informática**: Criptografía caótica (PRNGs), compresión fractal y gráficos procedurales GPU.
  - **📡 Telecomunicaciones**: Óptica no lineal y modulación de fase en láseres.

- **🎯 Ejercicios Guiados para Estudiantes (Talleres de Laboratorio)**:
  - 4 Retos interactivos paso a paso con verificación instantánea de parámetros, pistas y preguntas conceptuales de opción múltiple.

- **🔊 Sonificación de Órbitas (Web Audio API)**:
  - Convierte las órbitas $x_n$ en tonos sonoros para *escuchar la diferencia* entre la armonía de atractores estables y el ruido del caos determinista.

- **📖 2 Principios Pedagógicos Clave**:
  1. *El Caos es Universal*: Se manifiesta en múltiples familias de funciones bajo la misma constante universal de Feigenbaum ($\delta \approx 4.6692$).
  2. *Mandelbrot es un Atlas*: Cartografía topológica completa de todas las bifurcaciones y ciclos límite cuadráticos.

---

## 🚀 Instalación y Ejecución Local

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/bifurcation-mandelbrot-explorer.git
cd bifurcation-mandelbrot-explorer

# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Compilar producción
npm run build
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia [MIT](LICENSE).
