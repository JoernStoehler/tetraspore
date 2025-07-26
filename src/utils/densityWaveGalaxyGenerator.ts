/**
 * Density Wave Galaxy Generator
 * 
 * Implements a realistic spiral galaxy generation algorithm based on density wave theory.
 * Based on the approach described at https://beltoforion.de/en/spiral_galaxy_renderer/
 * 
 * Key concepts:
 * - Spiral arms are density waves, not fixed structures
 * - Stars follow elliptical orbits with slight angular offsets
 * - Surface brightness follows de Vaucouleurs (bulge) and exponential (disc) laws
 * - Temperature-based star coloring using black-body radiation
 */


export interface DensityWaveStarData {
  id: string;
  position: [number, number, number];
  size: number;
  brightness: number;
  temperature: number; // Kelvin
  color: [number, number, number]; // RGB
  region: 'bulge' | 'disc' | 'halo';
}

export interface DensityWaveGalaxyParams {
  numStars: number;
  numArms: number;
  armTightness: number; // How tightly wound the arms are (radians per unit radius)
  bulgeRadius: number;
  discRadius: number;
  thickness: number; // Z-axis thickness
  bulgeIntensity: number;
  discIntensity: number;
  discScaleLength: number;
  minTemperature: number; // Kelvin
  maxTemperature: number; // Kelvin
  seed?: number;
}

// Seeded random number generator for reproducibility
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
  
  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }
  
  gaussian(mean: number = 0, stdDev: number = 1): number {
    const u1 = this.next();
    const u2 = this.next();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }
}

// Convert temperature to RGB color using black-body radiation approximation
function temperatureToRGB(temperature: number): [number, number, number] {
  // Simplified black-body radiation color calculation
  // Based on Planck's law approximation for visible spectrum
  const temp = temperature / 100;
  let r: number, g: number, b: number;
  
  // Red
  if (temp <= 66) {
    r = 255;
  } else {
    r = temp - 60;
    r = 329.698727446 * Math.pow(r, -0.1332047592);
    r = Math.max(0, Math.min(255, r));
  }
  
  // Green
  if (temp <= 66) {
    g = temp;
    g = 99.4708025861 * Math.log(g) - 161.1195681661;
  } else {
    g = temp - 60;
    g = 288.1221695283 * Math.pow(g, -0.0755148492);
  }
  g = Math.max(0, Math.min(255, g));
  
  // Blue
  if (temp >= 66) {
    b = 255;
  } else if (temp <= 19) {
    b = 0;
  } else {
    b = temp - 10;
    b = 138.5177312231 * Math.log(b) - 305.0447927307;
    b = Math.max(0, Math.min(255, b));
  }
  
  return [r / 255, g / 255, b / 255];
}

// de Vaucouleurs surface brightness law for galactic bulge
function deVaucouleursBrightness(radius: number, centralIntensity: number, effectiveRadius: number): number {
  const kappa = 7.67; // de Vaucouleurs constant
  const normalizedRadius = radius / effectiveRadius;
  return centralIntensity * Math.exp(-kappa * Math.pow(normalizedRadius, 0.25));
}

// Exponential surface brightness law for galactic disc
function exponentialDiscBrightness(radius: number, centralIntensity: number, scaleLength: number): number {
  return centralIntensity * Math.exp(-radius / scaleLength);
}

// Calculate orbital eccentricity based on position
function calculateEccentricity(radius: number, bulgeRadius: number, discRadius: number): number {
  const normalizedRadius = (radius - bulgeRadius) / (discRadius - bulgeRadius);
  
  if (radius < bulgeRadius) {
    // Low eccentricity in bulge
    return 0.1 + 0.2 * (radius / bulgeRadius);
  } else if (radius < discRadius) {
    // Peak eccentricity at bulge-disc boundary, decreasing outward
    const t = Math.min(1, normalizedRadius * 2);
    return 0.3 + 0.4 * Math.sin(t * Math.PI);
  } else {
    // Low eccentricity in halo
    return 0.1;
  }
}

export function generateDensityWaveGalaxy(params: DensityWaveGalaxyParams): DensityWaveStarData[] {
  const {
    numStars,
    numArms,
    armTightness,
    bulgeRadius,
    discRadius,
    thickness,
    bulgeIntensity,
    discIntensity,
    discScaleLength,
    maxTemperature,
    seed = Date.now()
  } = params;
  
  const rng = new SeededRandom(seed);
  const stars: DensityWaveStarData[] = [];
  
  // Calculate star distribution between regions
  const bulgeFraction = 0.3; // 30% of stars in bulge
  const discFraction = 0.65; // 65% in disc
  
  const numBulgeStars = Math.floor(numStars * bulgeFraction);
  const numDiscStars = Math.floor(numStars * discFraction);
  const numHaloStars = numStars - numBulgeStars - numDiscStars;
  
  // Generate bulge stars
  for (let i = 0; i < numBulgeStars; i++) {
    // Sample radius using inverse transform sampling for de Vaucouleurs profile
    const u = rng.next();
    const radius = bulgeRadius * Math.pow(u, 4); // Approximate inverse
    const angle = rng.range(0, 2 * Math.PI);
    const z = rng.gaussian(0, thickness * 0.3);
    
    const brightness = deVaucouleursBrightness(radius, bulgeIntensity, bulgeRadius * 0.5);
    const temperature = rng.range(3500, 6000); // Older, cooler stars in bulge
    
    stars.push({
      id: `bulge-${i}`,
      position: [
        radius * Math.cos(angle),
        z,
        radius * Math.sin(angle)
      ],
      size: rng.range(0.05, 0.15),
      brightness: brightness / bulgeIntensity,
      temperature,
      color: temperatureToRGB(temperature),
      region: 'bulge'
    });
  }
  
  // Generate disc stars with spiral structure
  for (let i = 0; i < numDiscStars; i++) {
    // Sample radius using exponential distribution
    const u = rng.next();
    const radius = -discScaleLength * Math.log(1 - u * (1 - Math.exp(-discRadius / discScaleLength)));
    
    // Base angle
    let angle = rng.range(0, 2 * Math.PI);
    
    // Add spiral arm perturbation
    const armIndex = Math.floor(rng.next() * numArms);
    const armBaseAngle = (armIndex * 2 * Math.PI) / numArms;
    const spiralAngle = armBaseAngle + radius * armTightness;
    
    // Density wave effect: concentrate stars near spiral arms
    const armProximity = rng.gaussian(0, 0.3);
    angle = spiralAngle + armProximity;
    
    // Elliptical orbit perturbation
    const eccentricity = calculateEccentricity(radius, bulgeRadius, discRadius);
    const orbitAngle = rng.range(0, 2 * Math.PI);
    const ellipticalRadius = radius * (1 + eccentricity * Math.cos(orbitAngle));
    
    // Vertical distribution (thinner in disc)
    const z = rng.gaussian(0, thickness * 0.1);
    
    const brightness = exponentialDiscBrightness(radius, discIntensity, discScaleLength);
    
    // Younger, hotter stars in spiral arms
    const baseTemp = rng.range(4000, 7000);
    const armBoost = Math.exp(-armProximity * armProximity) * 2000;
    const temperature = Math.min(maxTemperature, baseTemp + armBoost);
    
    stars.push({
      id: `disc-${i}`,
      position: [
        ellipticalRadius * Math.cos(angle),
        z,
        ellipticalRadius * Math.sin(angle)
      ],
      size: rng.range(0.03, 0.1),
      brightness: brightness / discIntensity,
      temperature,
      color: temperatureToRGB(temperature),
      region: 'disc'
    });
  }
  
  // Generate halo stars (sparse, old)
  for (let i = 0; i < numHaloStars; i++) {
    const radius = rng.range(discRadius, discRadius * 1.5);
    const angle = rng.range(0, 2 * Math.PI);
    const z = rng.gaussian(0, thickness);
    
    const temperature = rng.range(3000, 4500); // Very old, cool stars
    
    stars.push({
      id: `halo-${i}`,
      position: [
        radius * Math.cos(angle),
        z,
        radius * Math.sin(angle)
      ],
      size: rng.range(0.02, 0.05),
      brightness: rng.range(0.1, 0.3),
      temperature,
      color: temperatureToRGB(temperature),
      region: 'halo'
    });
  }
  
  return stars;
}

// Default parameters for a Milky Way-like galaxy
export const DEFAULT_GALAXY_PARAMS: DensityWaveGalaxyParams = {
  numStars: 5000,
  numArms: 4,
  armTightness: 0.3,
  bulgeRadius: 0.3,
  discRadius: 2.0,
  thickness: 0.1,
  bulgeIntensity: 1.0,
  discIntensity: 0.8,
  discScaleLength: 0.5,
  minTemperature: 3000,
  maxTemperature: 9000,
  seed: 42
};