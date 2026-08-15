/**
 * Curated bibliography and references for the "Recursos" tab.
 */
export interface ResourceEntry {
  id: string;
  kind: 'paper' | 'book' | 'classic';
  citation: { es: string; en: string };
  note?: { es: string; en: string };
  url?: string;
}

export const RESOURCES: ResourceEntry[] = [
  {
    id: 'r-may',
    kind: 'classic',
    citation: {
      es: 'May, R. M. (1976). "Simple mathematical models with very complicated dynamics." Nature, 261, 459–467.',
      en: 'May, R. M. (1976). "Simple mathematical models with very complicated dynamics." Nature, 261, 459–467.',
    },
    note: {
      es: 'El artículo fundacional que mostró cómo el logístico pasa a caos.',
      en: 'The founding paper showing how the logistic map goes chaotic.',
    },
    url: 'https://doi.org/10.1038/261459a0',
  },
  {
    id: 'r-feigenbaum',
    kind: 'classic',
    citation: {
      es: 'Feigenbaum, M. J. (1978). "Quantitative universality for a class of nonlinear transformations." J. Stat. Phys., 19, 25–52.',
      en: 'Feigenbaum, M. J. (1978). "Quantitative universality for a class of nonlinear transformations." J. Stat. Phys., 19, 25–52.',
    },
    note: {
      es: 'Descubrimiento de la constante universal δ y la universalidad de la duplicación de periodo.',
      en: 'Discovery of the universal constant δ and the universality of period doubling.',
    },
    url: 'https://doi.org/10.1007/BF01020332',
  },
  {
    id: 'r-liyorke',
    kind: 'classic',
    citation: {
      es: 'Li, T.-Y. & Yorke, J. A. (1975). "Period Three Implies Chaos." Amer. Math. Monthly, 82, 985–992.',
      en: 'Li, T.-Y. & Yorke, J. A. (1975). "Period Three Implies Chaos." Amer. Math. Monthly, 82, 985–992.',
    },
    note: {
      es: 'El teorema que bautizó el término "caos" y ligó el periodo 3 con todos los periodos.',
      en: 'The theorem that coined "chaos" and linked period 3 with every period.',
    },
    url: 'https://doi.org/10.1080/00029890.1975.11993953',
  },
  {
    id: 'r-lorenz',
    kind: 'classic',
    citation: {
      es: 'Lorenz, E. N. (1963). "Deterministic Nonperiodic Flow." J. Atmos. Sci., 20, 130–141.',
      en: 'Lorenz, E. N. (1963). "Deterministic Nonperiodic Flow." J. Atmos. Sci., 20, 130–141.',
    },
    note: {
      es: 'El efecto mariposa: atractores extraños y predictibilidad del clima.',
      en: 'The butterfly effect: strange attractors and weather predictability.',
    },
    url: 'https://doi.org/10.1175/1520-0469(1963)020<0130:DNF>2.0.CO;2',
  },
  {
    id: 'r-ricker',
    kind: 'paper',
    citation: {
      es: 'Ricker, W. E. (1954). "Stock and recruitment." J. Fish. Res. Board Can., 11, 559–623.',
      en: 'Ricker, W. E. (1954). "Stock and recruitment." J. Fish. Res. Board Can., 11, 559–623.',
    },
    note: {
      es: 'Origen del mapa de Ricker, modelo poblacional con dinámicas complejas.',
      en: 'Origin of the Ricker map, a population model with complex dynamics.',
    },
  },
  {
    id: 'r-strogatz',
    kind: 'book',
    citation: {
      es: 'Strogatz, S. H. (2015). Nonlinear Dynamics and Chaos. 2.ª ed., Westview Press.',
      en: 'Strogatz, S. H. (2015). Nonlinear Dynamics and Chaos. 2nd ed., Westview Press.',
    },
    note: {
      es: 'El texto de referencia para el tema, con rigor y claridad pedagógica.',
      en: 'The reference textbook on the subject, rigorous and pedagogically clear.',
    },
  },
  {
    id: 'r-ott',
    kind: 'book',
    citation: {
      es: 'Ott, E. (2002). Chaos in Dynamical Systems. 2.ª ed., Cambridge University Press.',
      en: 'Ott, E. (2002). Chaos in Dynamical Systems. 2nd ed., Cambridge University Press.',
    },
    note: {
      es: 'Enfoque físico completo del caos y sus aplicaciones.',
      en: 'A complete physical treatment of chaos and its applications.',
    },
  },
  {
    id: 'r-peitgen',
    kind: 'book',
    citation: {
      es: 'Peitgen, H.-O., Jürgens, H. & Saupe, D. (2004). Chaos and Fractals. Springer.',
      en: 'Peitgen, H.-O., Jürgens, H. & Saupe, D. (2004). Chaos and Fractals. Springer.',
    },
    note: {
      es: 'El texto clásico que conecta fractales, Mandelbrot y caos de forma visual.',
      en: 'The classic text linking fractals, Mandelbrot and chaos visually.',
    },
  },
  {
    id: 'r-lorenz-book',
    kind: 'book',
    citation: {
      es: 'Lorenz, E. N. (1993). The Essence of Chaos. University of Washington Press.',
      en: 'Lorenz, E. N. (1993). The Essence of Chaos. University of Washington Press.',
    },
    note: {
      es: 'La divulgación del propio descubridor del efecto mariposa.',
      en: 'The popular account by the discoverer of the butterfly effect.',
    },
  },
  {
    id: 'r-gleick',
    kind: 'book',
    citation: {
      es: 'Gleick, J. (1987). Chaos: Making a New Science. Viking.',
      en: 'Gleick, J. (1987). Chaos: Making a New Science. Viking.',
    },
    note: {
      es: 'La historia periodística que popularizó la teoría del caos.',
      en: 'The journalistic history that popularized chaos theory.',
    },
  },
];
