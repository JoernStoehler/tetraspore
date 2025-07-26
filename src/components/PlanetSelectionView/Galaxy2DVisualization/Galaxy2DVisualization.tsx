import { type FC, useRef, useEffect, useState } from 'react';
import { 
  generateDensityWaveGalaxy, 
  DEFAULT_GALAXY_PARAMS,
  type DensityWaveGalaxyParams 
} from '../../../utils/densityWaveGalaxyGenerator';
import styles from './Galaxy2DVisualization.module.css';

interface Galaxy2DVisualizationProps {
  params?: Partial<DensityWaveGalaxyParams>;
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  projection?: 'top' | 'side';
}

export const Galaxy2DVisualization: FC<Galaxy2DVisualizationProps> = ({
  params = {},
  width = 800,
  height = 800,
  showGrid = true,
  showLabels = true,
  projection = 'top'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState({
    totalStars: 0,
    bulgeStars: 0,
    discStars: 0,
    haloStars: 0,
    renderTime: 0
  });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const startTime = performance.now();
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    // Generate galaxy
    const galaxyParams: DensityWaveGalaxyParams = {
      ...DEFAULT_GALAXY_PARAMS,
      ...params
    };
    const stars = generateDensityWaveGalaxy(galaxyParams);
    
    // Calculate bounds
    const maxRadius = galaxyParams.discRadius * 1.6;
    const scale = Math.min(width, height) / (maxRadius * 2) * 0.9;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      // Radial circles
      for (let r = 0.5; r <= maxRadius; r += 0.5) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r * scale, 0, 2 * Math.PI);
        ctx.stroke();
      }
      
      // Axes
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, height);
      ctx.stroke();
    }
    
    // Draw region boundaries
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    
    // Bulge boundary
    ctx.beginPath();
    ctx.arc(centerX, centerY, galaxyParams.bulgeRadius * scale, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Disc boundary
    ctx.beginPath();
    ctx.arc(centerX, centerY, galaxyParams.discRadius * scale, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Sort stars by brightness (dimmer first for proper layering)
    const sortedStars = [...stars].sort((a, b) => a.brightness - b.brightness);
    
    // Draw stars
    sortedStars.forEach(star => {
      let x: number, y: number;
      
      if (projection === 'top') {
        x = centerX + star.position[0] * scale;
        y = centerY - star.position[2] * scale; // Negative for standard coordinate system
      } else {
        x = centerX + star.position[0] * scale;
        y = centerY - star.position[1] * scale; // Side view shows Y axis
      }
      
      // Star color from temperature
      const [r, g, b] = star.color;
      const alpha = star.brightness * 0.8 + 0.2;
      
      // Draw star
      ctx.fillStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${alpha})`;
      ctx.beginPath();
      const radius = star.size * scale * 0.5;
      ctx.arc(x, y, Math.max(0.5, radius), 0, 2 * Math.PI);
      ctx.fill();
      
      // Add glow for bright stars
      if (star.brightness > 0.7) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
        gradient.addColorStop(0, `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${alpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius * 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
    
    // Draw labels
    if (showLabels) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      
      // Bulge label
      ctx.fillText('Bulge', centerX, centerY - galaxyParams.bulgeRadius * scale - 10);
      
      // Disc label
      ctx.fillText('Disc', centerX, centerY - galaxyParams.discRadius * scale - 10);
      
      // Axis labels
      ctx.textAlign = 'left';
      ctx.fillText('X', width - 20, centerY - 5);
      ctx.textAlign = 'center';
      ctx.fillText(projection === 'top' ? 'Z' : 'Y', centerX + 5, 20);
      
      // Scale indicator
      ctx.textAlign = 'left';
      ctx.fillText(`1 unit = ${(1 / scale * 100).toFixed(0)}px`, 10, height - 10);
    }
    
    // Update stats
    const renderTime = performance.now() - startTime;
    setStats({
      totalStars: stars.length,
      bulgeStars: stars.filter(s => s.region === 'bulge').length,
      discStars: stars.filter(s => s.region === 'disc').length,
      haloStars: stars.filter(s => s.region === 'halo').length,
      renderTime
    });
  }, [params, width, height, showGrid, showLabels, projection]);
  
  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={styles.canvas}
      />
      <div className={styles.stats}>
        <h3>Galaxy Statistics</h3>
        <dl>
          <dt>Total Stars:</dt>
          <dd>{stats.totalStars}</dd>
          <dt>Bulge Stars:</dt>
          <dd>{stats.bulgeStars}</dd>
          <dt>Disc Stars:</dt>
          <dd>{stats.discStars}</dd>
          <dt>Halo Stars:</dt>
          <dd>{stats.haloStars}</dd>
          <dt>Render Time:</dt>
          <dd>{stats.renderTime.toFixed(2)}ms</dd>
        </dl>
      </div>
    </div>
  );
};