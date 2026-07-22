/**
 * Mathematical operations for Bifurcation Diagrams, Logistic Map,
 * Quadratic Map, and Lyapunov Exponents.
 */

// Convert Logistic Map parameter r (1..4) to Mandelbrot parameter c (-2..0.25)
// Mathematical isomorphism: z = -r*x + r/2 => c = r/2 - r^2/4
export function rToC(r) {
  return (2 * r - r * r) / 4;
}

// Convert Mandelbrot real axis parameter c (-2..0.25) to Logistic parameter r (1..4)
export function cToR(c) {
  if (c > 0.25) return 1.0;
  return 1 + Math.sqrt(1 - 4 * c);
}

// Logistic Map iteration step: x_{n+1} = r * x_n * (1 - x_n)
export function nextLogistic(x, r) {
  return r * x * (1 - x);
}

// Real Quadratic Map iteration step: z_{n+1} = z_n^2 + c
export function nextQuadratic(z, c) {
  return z * z + c;
}

/**
 * Calculates orbit values for a given r parameter.
 * @param {number} r Parameter in range [0, 4]
 * @param {number} transientIterations Number of initial iterations to discard
 * @param {number} orbitIterations Number of orbit points to collect
 * @param {number} x0 Initial x in (0, 1)
 * @returns {Float64Array} Array of collected orbit values
 */
export function getLogisticOrbit(r, transientIterations = 300, orbitIterations = 200, x0 = 0.5) {
  let x = x0;
  for (let i = 0; i < transientIterations; i++) {
    x = r * x * (1 - x);
  }
  
  const orbit = new Float64Array(orbitIterations);
  for (let i = 0; i < orbitIterations; i++) {
    x = r * x * (1 - x);
    orbit[i] = x;
  }
  return orbit;
}

/**
 * Computes the Lyapunov Exponent lambda for a parameter r.
 * lambda = lim (1/N) * sum( ln | r * (1 - 2*x_i) | )
 * lambda < 0  => Stable period / attractor
 * lambda == 0 => Bifurcation critical point
 * lambda > 0  => Chaos
 */
export function computeLyapunovExponent(r, iterations = 800, transient = 200) {
  let x = 0.5;
  // Discard transient
  for (let i = 0; i < transient; i++) {
    x = r * x * (1 - x);
  }

  let sum = 0;
  let validCount = 0;
  for (let i = 0; i < iterations; i++) {
    x = r * x * (1 - x);
    const deriv = Math.abs(r * (1 - 2 * x));
    if (deriv > 1e-12) {
      sum += Math.log(deriv);
      validCount++;
    }
  }

  return validCount > 0 ? sum / validCount : 0;
}

/**
 * Detects the period of the orbit for parameter r.
 * Returns period length (1, 2, 4, 8, 3, etc.), or -1 if chaotic/non-periodic.
 */
export function detectPeriod(r, maxPeriod = 64, tolerance = 1e-5) {
  const orbit = getLogisticOrbit(r, 500, maxPeriod * 4);
  const lastVal = orbit[orbit.length - 1];

  for (let p = 1; p <= maxPeriod; p++) {
    const diff = Math.abs(orbit[orbit.length - 1 - p] - lastVal);
    if (diff < tolerance) {
      // Confirm cycle repeat
      let confirmed = true;
      for (let k = 1; k <= 3; k++) {
        if (Math.abs(orbit[orbit.length - 1 - k * p] - lastVal) > tolerance * 5) {
          confirmed = false;
          break;
        }
      }
      if (confirmed) return p;
    }
  }
  return -1; // Chaos / large period
}
