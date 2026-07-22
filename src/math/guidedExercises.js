/**
 * Guided Student Exercises / Lab Challenges Data & Validator
 */
export const GUIDED_EXERCISES = [
  {
    id: 'ex1',
    title: '🎯 Reto 1: La Primera Bifurcación (Periodo 1 ➔ 2)',
    description: 'Encuentra el valor del parámetro r donde el punto fijo pierde estabilidad y se divide en 2 estados oscilatorios eternos.',
    instruction: 'Mueve el slider del parámetro r hasta el punto exacto de la primera bifurcación.',
    modelId: 'logistic',
    targetR: 3.0,
    tolerance: 0.05,
    question: '¿A qué parámetro c en el Conjunto de Mandelbrot corresponde r = 3.0?',
    options: [
      { text: 'c = 0.25 (Punto extremo superior)', correct: false },
      { text: 'c = -0.75 (Frontera entre cardioide principal y disco izquierdo)', correct: true },
      { text: 'c = -1.25 (Disco de periodo 4)', correct: false },
      { text: 'c = -2.0 (Límite caótico extremo)', correct: false }
    ],
    hint: 'Ajusta r exactamente en 3.0000. Observa cómo la línea azul del diagrama de bifurcación se divide en dos ramas.'
  },
  {
    id: 'ex2',
    title: '⚡ Reto 2: El Límite de Feigenbaum (Inicio del Caos)',
    description: 'Localiza el punto acumulación de la cascada de duplicación de periodo donde la órbita se vuelve aperiódica.',
    instruction: 'Ajusta r justo antes de que el exponente de Lyapunov λ pase de negativo a positivo.',
    modelId: 'logistic',
    targetR: 3.5699,
    tolerance: 0.02,
    question: '¿Qué valor tiene la constante universal de Feigenbaum δ que rige esta transición?',
    options: [
      { text: 'δ ≈ 3.1415 (Número Pi)', correct: false },
      { text: 'δ ≈ 4.6692 (Tasa límite entre intervalos de bifurcación)', correct: true },
      { text: 'δ ≈ 2.7182 (Número e)', correct: false },
      { text: 'δ ≈ 1.6180 (Número Áureo)', correct: false }
    ],
    hint: 'Ubica el parámetro r cerca de 3.57. Nota cómo el exponente de Lyapunov toca la línea de cero.'
  },
  {
    id: 'ex3',
    title: '🌀 Reto 3: Orden en el Caos (Ventana de Periodo 3)',
    description: 'Descubre la ventana periódica de periodo 3 sumergida dentro del mar caótico.',
    instruction: 'Desplaza r dentro de la región caótica (r > 3.6) hasta hallar una franja clara con 3 valores estables.',
    modelId: 'logistic',
    targetR: 3.8284,
    tolerance: 0.03,
    question: 'Según el Teorema de Li-Yorke (1975), ¿qué implica la presencia de una ventana de Periodo 3?',
    options: [
      { text: 'Que el sistema regresará a periodo 1', correct: false },
      { text: 'Que el sistema se apaga inmediatamente', correct: false },
      { text: 'Periodo 3 Implica Caos (existen órbitas de todos los demás periodos)', correct: true },
      { text: 'Que la función deja de ser derivable', correct: false }
    ],
    hint: 'Prueba un valor cercano a r = 3.83. Verás 3 puntos discretos en lugar de una nube densa.'
  },
  {
    id: 'ex4',
    title: '🔗 Reto 4: Caos Universal en el Mapa Seno',
    description: 'Verifica el principio pedagógico: El caos es universal y ocurre en funciones trascendentes.',
    instruction: 'Cambia al Mapa Seno r·sin(πx) y encuentra el parámetro donde inicia la duplicación de periodo.',
    modelId: 'sine',
    targetR: 0.72,
    tolerance: 0.05,
    question: '¿Por qué el diagrama de bifurcación del Mapa Seno se parece tanto al del Mapa Logístico?',
    options: [
      { text: 'Es una coincidencia matemática sin importancia', correct: false },
      { text: 'Porque ambas son funciones cuadráticas unimodales con un único máximo suave', correct: true },
      { text: 'Porque el seno es una recta en origen', correct: false },
      { text: 'Porque utilizan la misma paleta de colores', correct: false }
    ],
    hint: 'Cambia el modelo arriba a "Mapa Seno" y observa cómo comparte la misma estructura de cascada.'
  }
];
