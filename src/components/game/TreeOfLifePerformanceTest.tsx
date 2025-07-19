import React, { useState, useEffect } from 'react'
import { TreeOfLife } from './TreeOfLife'

// We'll temporarily modify TreeOfLife to accept custom data
export const TreeOfLifePerformanceTest: React.FC = () => {
  const [renderTime, setRenderTime] = useState<number>(0)
  const [nodeCount, setNodeCount] = useState<number>(0)
  const [fps, setFps] = useState<number>(0)
  
  useEffect(() => {
    // Performance monitoring
    const startTime = performance.now()
    
    // Count nodes after component mounts
    const countTimeout = setTimeout(() => {
      const endTime = performance.now()
      setRenderTime(endTime - startTime)
      
      // Count rendered nodes
      const nodes = document.querySelectorAll('.node')
      setNodeCount(nodes.length)
    }, 100)
    
    // FPS monitoring
    let frameCount = 0
    let lastTime = performance.now()
    
    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        setFps(frameCount)
        frameCount = 0
        lastTime = currentTime
      }
      
      requestAnimationFrame(measureFPS)
    }
    
    const animationId = requestAnimationFrame(measureFPS)
    
    return () => {
      clearTimeout(countTimeout)
      cancelAnimationFrame(animationId)
    }
  }, [])
  
  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 right-4 bg-black/80 text-white p-4 rounded-lg z-50">
        <h3 className="font-bold mb-2">Performance Metrics</h3>
        <p className="text-sm">Initial Render: {renderTime.toFixed(2)}ms</p>
        <p className="text-sm">Node Count: {nodeCount}</p>
        <p className="text-sm">FPS: {fps}</p>
        <p className="text-xs mt-2 text-gray-300">
          Pan and zoom to test performance
        </p>
      </div>
      <TreeOfLife width={1200} height={800} useTestData={true} />
    </div>
  )
}