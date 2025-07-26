import { describe, it, expect } from 'vitest';
import { generateGalaxy, type GalaxyParams } from './galaxyGenerator';

describe('galaxyGenerator', () => {
  it('generates the correct number of stars', () => {
    const params: Partial<GalaxyParams> = { starCount: 100 };
    const stars = generateGalaxy(params);
    expect(stars).toHaveLength(100);
  });

  it('generates consistent results with the same seed', () => {
    const params: Partial<GalaxyParams> = { starCount: 50, seed: 42 };
    const stars1 = generateGalaxy(params);
    const stars2 = generateGalaxy(params);
    
    expect(stars1).toEqual(stars2);
  });

  it('generates different results with different seeds', () => {
    const params1: Partial<GalaxyParams> = { starCount: 50, seed: 42 };
    const params2: Partial<GalaxyParams> = { starCount: 50, seed: 43 };
    const stars1 = generateGalaxy(params1);
    const stars2 = generateGalaxy(params2);
    
    expect(stars1[0].position).not.toEqual(stars2[0].position);
  });

  it('keeps stars within expected bounds', () => {
    const params: Partial<GalaxyParams> = { 
      starCount: 500, 
      diskRadius: 5,
      diskThickness: 0.1 
    };
    const stars = generateGalaxy(params);
    
    stars.forEach(star => {
      const [x, y, z] = star.position;
      const r = Math.sqrt(x * x + z * z);
      
      // Most stars should be within disk radius (allow some field stars)
      expect(r).toBeLessThan(params.diskRadius! * 1.3);
      
      // Vertical distribution should be reasonable
      expect(Math.abs(y)).toBeLessThan(params.diskThickness! * 3);
    });
  });

  it('generates appropriate star properties', () => {
    const stars = generateGalaxy({ starCount: 100 });
    
    stars.forEach(star => {
      expect(star.id).toBeTruthy();
      expect(star.size).toBeGreaterThan(0);
      expect(star.size).toBeLessThanOrEqual(1.3);
      expect(star.brightness).toBeGreaterThan(0);
      expect(star.brightness).toBeLessThanOrEqual(1);
    });
  });

  it('creates spiral structure', () => {
    const params: Partial<GalaxyParams> = { 
      starCount: 1000,
      armCount: 2,
      seed: 12345
    };
    const stars = generateGalaxy(params);
    
    // Check that arm stars exist
    const armStars = stars.filter(s => s.id.startsWith('arm-'));
    expect(armStars.length).toBeGreaterThan(0);
    
    // Verify arm distribution
    const arm0Stars = stars.filter(s => s.id.startsWith('arm-0-'));
    const arm1Stars = stars.filter(s => s.id.startsWith('arm-1-'));
    
    expect(arm0Stars.length).toBeGreaterThan(0);
    expect(arm1Stars.length).toBeGreaterThan(0);
    expect(Math.abs(arm0Stars.length - arm1Stars.length)).toBeLessThan(10);
  });

  it('generates bar structure when specified', () => {
    const params: Partial<GalaxyParams> = { 
      starCount: 500,
      barLength: 1.5,
      barWidth: 0.3
    };
    const stars = generateGalaxy(params);
    
    const barStars = stars.filter(s => s.id.startsWith('bar-'));
    expect(barStars.length).toBeGreaterThan(0);
    expect(barStars.length).toBeLessThan(stars.length * 0.3);
  });

  it('generates core bulge', () => {
    const params: Partial<GalaxyParams> = { 
      starCount: 500,
      coreRadius: 0.5
    };
    const stars = generateGalaxy(params);
    
    const coreStars = stars.filter(s => s.id.startsWith('core-'));
    expect(coreStars.length).toBeGreaterThan(0);
    
    // Core stars should be concentrated near center
    const avgCoreDistance = coreStars.reduce((sum, star) => {
      const [x, , z] = star.position;
      return sum + Math.sqrt(x * x + z * z);
    }, 0) / coreStars.length;
    
    expect(avgCoreDistance).toBeLessThan(params.coreRadius!);
  });
});