import { describe, it, expect } from 'vitest';
import { 
  generateDensityWaveGalaxy, 
  DEFAULT_GALAXY_PARAMS,
  type DensityWaveGalaxyParams
} from './densityWaveGalaxyGenerator';

describe('densityWaveGalaxyGenerator', () => {
  describe('generateDensityWaveGalaxy', () => {
    it('generates the correct number of stars', () => {
      const params: DensityWaveGalaxyParams = {
        ...DEFAULT_GALAXY_PARAMS,
        numStars: 1000
      };
      
      const stars = generateDensityWaveGalaxy(params);
      expect(stars).toHaveLength(1000);
    });
    
    it('distributes stars across regions correctly', () => {
      const params: DensityWaveGalaxyParams = {
        ...DEFAULT_GALAXY_PARAMS,
        numStars: 1000
      };
      
      const stars = generateDensityWaveGalaxy(params);
      
      const bulgeStars = stars.filter(s => s.region === 'bulge');
      const discStars = stars.filter(s => s.region === 'disc');
      const haloStars = stars.filter(s => s.region === 'halo');
      
      // Expected distribution: 30% bulge, 65% disc, 5% halo
      expect(bulgeStars.length).toBeGreaterThan(250);
      expect(bulgeStars.length).toBeLessThan(350);
      expect(discStars.length).toBeGreaterThan(600);
      expect(discStars.length).toBeLessThan(700);
      expect(haloStars.length).toBeGreaterThan(30);
      expect(haloStars.length).toBeLessThan(70);
    });
    
    it('generates deterministic results with the same seed', () => {
      const params: DensityWaveGalaxyParams = {
        ...DEFAULT_GALAXY_PARAMS,
        seed: 12345
      };
      
      const stars1 = generateDensityWaveGalaxy(params);
      const stars2 = generateDensityWaveGalaxy(params);
      
      expect(stars1).toHaveLength(stars2.length);
      
      // Check first few stars are identical
      for (let i = 0; i < 10; i++) {
        expect(stars1[i].position).toEqual(stars2[i].position);
        expect(stars1[i].temperature).toEqual(stars2[i].temperature);
        expect(stars1[i].color).toEqual(stars2[i].color);
      }
    });
    
    it('generates different results with different seeds', () => {
      const params1 = { ...DEFAULT_GALAXY_PARAMS, seed: 111 };
      const params2 = { ...DEFAULT_GALAXY_PARAMS, seed: 222 };
      
      const stars1 = generateDensityWaveGalaxy(params1);
      const stars2 = generateDensityWaveGalaxy(params2);
      
      // Positions should be different
      expect(stars1[0].position).not.toEqual(stars2[0].position);
    });
    
    it('respects radius constraints for each region', () => {
      const params: DensityWaveGalaxyParams = {
        ...DEFAULT_GALAXY_PARAMS,
        bulgeRadius: 0.5,
        discRadius: 2.0
      };
      
      const stars = generateDensityWaveGalaxy(params);
      
      stars.forEach(star => {
        const radius = Math.sqrt(
          star.position[0] ** 2 + star.position[2] ** 2
        );
        
        if (star.region === 'bulge') {
          expect(radius).toBeLessThanOrEqual(params.bulgeRadius * 1.5); // Allow margin for elliptical orbits
        } else if (star.region === 'disc') {
          expect(radius).toBeLessThanOrEqual(params.discRadius * 1.5); // Allow margin for elliptical orbits  
        } else if (star.region === 'halo') {
          expect(radius).toBeGreaterThan(params.discRadius * 0.8);
          expect(radius).toBeLessThan(params.discRadius * 2.0);
        }
      });
    });
    
    it('generates valid temperature values', () => {
      const params: DensityWaveGalaxyParams = {
        ...DEFAULT_GALAXY_PARAMS,
        minTemperature: 3000,
        maxTemperature: 9000
      };
      
      const stars = generateDensityWaveGalaxy(params);
      
      stars.forEach(star => {
        expect(star.temperature).toBeGreaterThanOrEqual(params.minTemperature);
        expect(star.temperature).toBeLessThanOrEqual(params.maxTemperature);
      });
    });
    
    it('generates valid RGB color values', () => {
      const stars = generateDensityWaveGalaxy(DEFAULT_GALAXY_PARAMS);
      
      stars.forEach(star => {
        expect(star.color).toHaveLength(3);
        star.color.forEach(channel => {
          expect(channel).toBeGreaterThanOrEqual(0);
          expect(channel).toBeLessThanOrEqual(1);
        });
      });
    });
    
    it('generates cooler stars in bulge and hotter stars in disc', () => {
      const stars = generateDensityWaveGalaxy(DEFAULT_GALAXY_PARAMS);
      
      const bulgeStars = stars.filter(s => s.region === 'bulge');
      const discStars = stars.filter(s => s.region === 'disc');
      
      const avgBulgeTemp = bulgeStars.reduce((sum, s) => sum + s.temperature, 0) / bulgeStars.length;
      const avgDiscTemp = discStars.reduce((sum, s) => sum + s.temperature, 0) / discStars.length;
      
      // Disc should have higher average temperature (younger stars)
      expect(avgDiscTemp).toBeGreaterThan(avgBulgeTemp);
    });
    
    it('creates spiral structure in disc stars', () => {
      const params: DensityWaveGalaxyParams = {
        ...DEFAULT_GALAXY_PARAMS,
        numArms: 2,
        armTightness: 0.5,
        numStars: 2000
      };
      
      const stars = generateDensityWaveGalaxy(params);
      const discStars = stars.filter(s => s.region === 'disc');
      
      // Group stars by angular bins to detect spiral pattern
      const angularBins: Record<number, number[]> = {};
      
      discStars.forEach(star => {
        const [x, , z] = star.position;
        const radius = Math.sqrt(x * x + z * z);
        const angle = Math.atan2(z, x);
        
        // Normalize angle to [0, 2π]
        const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
        const binIndex = Math.floor(normalizedAngle / (Math.PI / 8)); // 16 bins
        
        if (!angularBins[binIndex]) {
          angularBins[binIndex] = [];
        }
        angularBins[binIndex].push(radius);
      });
      
      // Verify that average radius varies with angle (spiral pattern)
      const avgRadii = Object.entries(angularBins).map(([, radii]) => {
        return radii.reduce((sum, r) => sum + r, 0) / radii.length;
      });
      
      // There should be variation in average radii
      const minAvg = Math.min(...avgRadii);
      const maxAvg = Math.max(...avgRadii);
      expect(maxAvg - minAvg).toBeGreaterThan(0.1);
    });
    
    it('applies thickness correctly', () => {
      const params: DensityWaveGalaxyParams = {
        ...DEFAULT_GALAXY_PARAMS,
        thickness: 0.2
      };
      
      const stars = generateDensityWaveGalaxy(params);
      
      // Check that 95% of stars are within expected bounds (2 standard deviations)
      const zValues = stars.map(star => Math.abs(star.position[1]));
      const withinBounds = zValues.filter(z => z < params.thickness * 2).length;
      const percentage = withinBounds / stars.length;
      
      expect(percentage).toBeGreaterThan(0.95);
      
      // Disc stars should be thinner
      const discStars = stars.filter(s => s.region === 'disc');
      const discZValues = discStars.map(s => Math.abs(s.position[1]));
      const avgDiscZ = discZValues.reduce((sum, z) => sum + z, 0) / discZValues.length;
      
      expect(avgDiscZ).toBeLessThan(params.thickness * 0.2);
    });
  });
  
  describe('star properties', () => {
    it('assigns unique IDs to all stars', () => {
      const stars = generateDensityWaveGalaxy(DEFAULT_GALAXY_PARAMS);
      const ids = new Set(stars.map(s => s.id));
      
      expect(ids.size).toBe(stars.length);
    });
    
    it('generates valid position arrays', () => {
      const stars = generateDensityWaveGalaxy(DEFAULT_GALAXY_PARAMS);
      
      stars.forEach(star => {
        expect(star.position).toHaveLength(3);
        star.position.forEach(coord => {
          expect(coord).toBeTypeOf('number');
          expect(isNaN(coord)).toBe(false);
        });
      });
    });
    
    it('generates valid brightness values', () => {
      const stars = generateDensityWaveGalaxy(DEFAULT_GALAXY_PARAMS);
      
      stars.forEach(star => {
        expect(star.brightness).toBeGreaterThan(0);
        expect(star.brightness).toBeLessThanOrEqual(1);
      });
    });
    
    it('generates valid size values', () => {
      const stars = generateDensityWaveGalaxy(DEFAULT_GALAXY_PARAMS);
      
      stars.forEach(star => {
        expect(star.size).toBeGreaterThan(0);
        expect(star.size).toBeLessThan(0.2);
      });
    });
  });
});