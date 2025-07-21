/**
 * Utility functions for the Living River Ecosystem TreeViewSonnet
 */

export * from './ecosystemLayout';
export * from './particleSystem';

/**
 * Color utilities for the ecosystem visualization
 */
export const ColorUtils = {
  /**
   * Blend two colors with given ratio
   */
  blendColors(color1: string, color2: string, ratio: number): string {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  },

  /**
   * Generate gradient CSS for stream rendering
   */
  createStreamGradient(startColor: string, endColor: string, opacity: number = 1): string {
    return `linear-gradient(to bottom, ${startColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}, ${endColor}${Math.round(opacity * 128).toString(16).padStart(2, '0')})`;
  },

  /**
   * Adjust color brightness for health/population indicators
   */
  adjustBrightness(color: string, factor: number): string {
    const r = Math.max(0, Math.min(255, parseInt(color.slice(1, 3), 16) * factor));
    const g = Math.max(0, Math.min(255, parseInt(color.slice(3, 5), 16) * factor));
    const b = Math.max(0, Math.min(255, parseInt(color.slice(5, 7), 16) * factor));
    
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  }
};

/**
 * Animation utilities
 */
export const AnimationUtils = {
  /**
   * Easing functions for smooth animations
   */
  easing: {
    linear: (t: number) => t,
    easeInOut: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    bounce: (t: number) => {
      const n1 = 7.5625;
      const d1 = 2.75;
      
      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    }
  },

  /**
   * Smooth interpolation between two values
   */
  lerp(start: number, end: number, progress: number): number {
    return start + (end - start) * progress;
  },

  /**
   * Interpolate between two positions
   */
  lerpPosition(
    start: { x: number; y: number },
    end: { x: number; y: number },
    progress: number
  ): { x: number; y: number } {
    return {
      x: this.lerp(start.x, end.x, progress),
      y: this.lerp(start.y, end.y, progress)
    };
  }
};

/**
 * Performance utilities
 */
export const PerformanceUtils = {
  /**
   * Throttle function execution
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function(this: any, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Calculate FPS from frame times
   */
  calculateFPS(frameTimes: number[]): number {
    if (frameTimes.length < 2) return 0;
    
    const averageFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
    return Math.round(1000 / averageFrameTime);
  },

  /**
   * Memory usage estimation for particle counts
   */
  estimateMemoryUsage(particleCount: number): number {
    // Rough estimate: ~200 bytes per particle
    return particleCount * 200;
  }
};

/**
 * Sound utilities for the ecosystem
 */
export const SoundUtils = {
  /**
   * Generate frequency for species based on characteristics
   */
  generateSpeciesFrequency(species: { size: number; biome: string }): number {
    // Larger species = lower frequencies
    const baseFequency = Math.max(50, 500 / species.size);
    
    // Biome modifies frequency
    const biomeModifiers: Record<string, number> = {
      'deep-ocean': 0.3,      // Very low, whale-like
      'shallow-seas': 0.7,    // Medium-low
      'coral-reefs': 1.2,     // Bright, tropical
      'freshwater-rivers': 1.0 // Natural baseline
    };
    
    const modifier = biomeModifiers[species.biome] || 1.0;
    return baseFequency * modifier;
  },

  /**
   * Create audio context for procedural sound generation
   */
  createAudioContext(): AudioContext | null {
    try {
      return new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Audio not supported');
      return null;
    }
  }
};