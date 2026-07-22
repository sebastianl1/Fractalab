# 🧠 Documento de Contexto y Arquitectura Técnica: ChaosLab STEM Suite

Este documento contiene la **arquitectura técnica completa**, los modelos matemáticos desacoplados, los componentes UI y los módulos pedagógicos del proyecto **ChaosLab STEM: Bifurcación ↔ Mandelbrot Explorer**.

---

## 🧮 Modelos Matemáticos Implementados (`src/math/models/`)

1. **`LogisticModel.js`**:
   $$x_{n+1} = r \cdot x_n \cdot (1 - x_n) \quad | \quad f'(x) = r(1 - 2x)$$
2. **`SineModel.js`**:
   $$x_{n+1} = r \cdot \sin(\pi \cdot x_n) \quad | \quad f'(x) = r \pi \cos(\pi x)$$
3. **`QuadraticModel.js`**:
   $$x_{n+1} = r - x_n^2 \quad | \quad f'(x) = -2x_n$$
4. **`ExponentialModel.js`**:
   $$x_{n+1} = r \cdot e^{-x_n} \quad | \quad f'(x) = -r e^{-x_n}$$
5. **`PolynomialModel.js`**:
   $$x_{n+1} = r \cdot x_n \cdot (1 - x_n^k) \quad | \quad f'(x) = r(1 - (k+1)x^k)$$

---

## 🏗️ Estructura del Código

```text
src/
├── math/
│   ├── models/
│   │   ├── ModelInterface.js     # Interfaz/Base común para modelos
│   │   ├── LogisticModel.js     # Mapa Logístico
│   │   ├── SineModel.js         # Mapa Seno
│   │   ├── QuadraticModel.js    # Mapa Cuadrático
│   │   ├── ExponentialModel.js  # Mapa Exponencial
│   │   ├── PolynomialModel.js   # Mapa Polinómico
│   │   └── ModelRegistry.js     # Gestor y registro de modelos
│   ├── engineeringCases.js      # Datos y generador de señales de ingeniería
│   ├── guidedExercises.js       # Retos de laboratorio para estudiantes
│   ├── feigenbaum.js            # Hitos y constantes universales
│   └── mandelbrot.js            # Motor complejo de Mandelbrot
├── components/
│   ├── BifurcationCanvas.js     # Renderizador de Bifurcación + Lyapunov
│   ├── MandelbrotCanvas.js      # Renderizador de Mandelbrot + Eje real
│   ├── CobwebCanvas.js          # Diagrama de telaraña adaptable
│   ├── InspectorPanel.js        # Inspector dinámico de métricas
│   ├── EngineeringCasePanel.js  # Panel de casos en ingeniería + mini-canvas
│   ├── GuidedExercisesPanel.js  # Gestor de talleres y validador de ejercicios
│   └── Sonifier.js             # Motor de Audio Web Audio API
└── main.js                      # Orquestador global y manejador de estado
```

---

## 💡 Principios Pedagógicos Integrados

1. **Universalidad del Caos**: El surgimiento del caos determinista y la duplicación de periodo sigue la constante de Feigenbaum $\delta \approx 4.6692$ sin importar si la función es logística, seno o exponencial.
2. **Mandelbrot como Atlas**: El corte en el eje real de Mandelbrot ($c \in [-2, 0.25]$) sirve como mapa topológico exacto para todas las bifurcaciones cuadráticas.
