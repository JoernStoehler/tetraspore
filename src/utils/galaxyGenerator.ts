/**
 * Galaxy Generation Algorithm
 * 
 * Generates semi-realistic spiral galaxy star positions with optional bar structure.
 * Based on logarithmic spiral arms and density wave theory.
 */

export interface StarData {
  id: string;
  position: [number, number, number];
  size: number;
  brightness: number;
}

export interface GalaxyParams {
  starCount: number;
  armCount: number;
  armSpread: number;
  coreRadius: number;
  diskRadius: number;
  diskThickness: number;
  barLength?: number;
  barWidth?: number;
  seed?: number;
}

const DEFAULT_PARAMS: GalaxyParams = {
  starCount: 1500,
  armCount: 2,
  armSpread: 0.5,
  coreRadius: 0.2,
  diskRadius: 5,
  diskThickness: 0.1,
  barLength: 1.5,
  barWidth: 0.3,
  seed: 12345
};

// Simple seedable random number generator
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

export function generateGalaxy(params: Partial<GalaxyParams> = {}): StarData[] {
  const config = { ...DEFAULT_PARAMS, ...params };
  const random = new SeededRandom(config.seed || Date.now());
  const stars: StarData[] = [];

  // Generate core stars (bulge)
  const coreStars = Math.floor(config.starCount * 0.3);
  for (let i = 0; i < coreStars; i++) {
    const r = Math.pow(random.next(), 0.5) * config.coreRadius;
    const theta = random.next() * Math.PI * 2;
    const y = (random.next() - 0.5) * config.diskThickness * 2;
    
    stars.push({
      id: `core-${i}`,
      position: [
        r * Math.cos(theta),
        y,
        r * Math.sin(theta)
      ],
      size: 0.8 + random.next() * 0.4,
      brightness: 0.7 + random.next() * 0.3
    });
  }

  // Generate bar stars (if applicable)
  if (config.barLength && config.barWidth) {
    const barStars = Math.floor(config.starCount * 0.15);
    for (let i = 0; i < barStars; i++) {
      const along = (random.next() - 0.5) * config.barLength;
      const across = (random.next() - 0.5) * config.barWidth;
      const y = (random.next() - 0.5) * config.diskThickness;
      
      // Rotate bar by 45 degrees
      const barAngle = Math.PI / 4;
      const x = along * Math.cos(barAngle) - across * Math.sin(barAngle);
      const z = along * Math.sin(barAngle) + across * Math.cos(barAngle);
      
      stars.push({
        id: `bar-${i}`,
        position: [x, y, z],
        size: 0.6 + random.next() * 0.3,
        brightness: 0.6 + random.next() * 0.4
      });
    }
  }

  // Generate spiral arm stars
  const armStars = config.starCount - stars.length;
  const starsPerArm = Math.floor(armStars / config.armCount);
  
  for (let arm = 0; arm < config.armCount; arm++) {
    const armAngle = (arm / config.armCount) * Math.PI * 2;
    
    for (let i = 0; i < starsPerArm; i++) {
      // Distance from center (exponential distribution)
      const r = config.coreRadius + Math.pow(random.next(), 0.5) * (config.diskRadius - config.coreRadius);
      
      // Spiral angle (logarithmic spiral)
      const spiralAngle = armAngle + Math.log(r / config.coreRadius) * 2;
      
      // Add spread to the arms
      const spread = (random.next() - 0.5) * config.armSpread;
      const theta = spiralAngle + spread;
      
      // Vertical position (thinner at edges)
      const thicknessFactor = 1 - (r / config.diskRadius) * 0.7;
      const y = (random.next() - 0.5) * config.diskThickness * thicknessFactor;
      
      stars.push({
        id: `arm-${arm}-${i}`,
        position: [
          r * Math.cos(theta),
          y,
          r * Math.sin(theta)
        ],
        size: 0.3 + random.next() * 0.5,
        brightness: 0.4 + random.next() * 0.6 * (1 - r / config.diskRadius)
      });
    }
  }

  // Add some random field stars for extra realism
  const remainingStars = config.starCount - stars.length;
  for (let i = 0; i < remainingStars; i++) {
    const r = random.next() * config.diskRadius * 1.2;
    const theta = random.next() * Math.PI * 2;
    const y = (random.next() - 0.5) * config.diskThickness * 3;
    
    stars.push({
      id: `field-${i}`,
      position: [
        r * Math.cos(theta),
        y,
        r * Math.sin(theta)
      ],
      size: 0.2 + random.next() * 0.3,
      brightness: 0.2 + random.next() * 0.4
    });
  }

  return stars;
}

// Export a pre-generated galaxy for consistency
export const PRESET_GALAXY = generateGalaxy();