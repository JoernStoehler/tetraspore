import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { TreeNode } from '../../types/tree'
import { mockTreeData } from '../../data/mockTreeData'
import { mockTreeDataLarge } from '../../data/mockTreeDataLarge'
import { useGameStore } from '../../stores/gameStore'

interface TreeOfLifeProps {
  width?: number
  height?: number
  useTestData?: boolean
}

interface D3TreeNode extends d3.HierarchyPointNode<TreeNode> {
  _children?: d3.HierarchyPointNode<TreeNode>[]
}

export const TreeOfLife: React.FC<TreeOfLifeProps> = ({ 
  width = 1200, 
  height = 800,
  useTestData = false 
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null)
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [matchingNodes, setMatchingNodes] = useState<Set<string>>(new Set())
  const [showMinimap, setShowMinimap] = useState<boolean>(true)
  const currentTurn = useGameStore(state => state.currentTurn)
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>()
  const minimapRef = useRef<SVGSVGElement>(null)
  const currentTransform = useRef<d3.ZoomTransform>(d3.zoomIdentity)
  
  // Use test data if specified
  const treeData = useTestData ? mockTreeDataLarge : mockTreeData

  // Handle search
  useEffect(() => {
    if (!searchQuery) {
      setMatchingNodes(new Set())
      return
    }

    const matches = new Set<string>()
    const searchLower = searchQuery.toLowerCase()
    
    const searchTree = (node: TreeNode) => {
      if (node.feature.name.toLowerCase().includes(searchLower) ||
          node.feature.description.toLowerCase().includes(searchLower) ||
          node.category.toLowerCase().includes(searchLower)) {
        matches.add(node.id)
      }
      node.children.forEach(searchTree)
    }
    
    searchTree(treeData.root)
    setMatchingNodes(matches)
  }, [searchQuery, treeData])

  useEffect(() => {
    if (!svgRef.current) return

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    // Create SVG groups
    const svg = d3.select(svgRef.current)
    const g = svg.append('g')

    // Create zoom behavior with touch support
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
        currentTransform.current = event.transform
        updateMinimap()
      })
      // Enable touch gestures
      .filter(() => {
        // Allow all events including touch
        return true
      })

    svg.call(zoom)
    
    // Add touch event handlers for better mobile experience
    svg.on('touchstart', function(event) {
      event.preventDefault() // Prevent default touch behavior
    }, { passive: false })
    
    // Double tap to zoom
    let lastTap = 0
    svg.on('touchend', function(event) {
      const currentTime = new Date().getTime()
      const tapLength = currentTime - lastTap
      
      if (tapLength < 300 && tapLength > 0) {
        // Double tap detected
        event.preventDefault()
        const touch = event.changedTouches[0]
        const point = [touch.clientX, touch.clientY]
        
        // Zoom in at touch point
        const currentScale = currentTransform.current.k
        const targetScale = currentScale >= 2 ? 0.5 : currentScale * 2
        
        svg.transition()
          .duration(300)
          .call(
            zoom.transform,
            d3.zoomIdentity
              .translate(point[0], point[1])
              .scale(targetScale)
              .translate(-point[0], -point[1])
          )
      }
      lastTap = currentTime
    })
    zoomRef.current = zoom

    // Create tree layout
    const treeLayout = d3.tree<TreeNode>()
      .size([width * 0.8, height * 0.8])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)

    // Create hierarchy and handle collapsed state
    const root = d3.hierarchy(treeData.root) as D3TreeNode
    
    // Apply collapsed state
    root.each((node: D3TreeNode) => {
      if (collapsedNodes.has(node.data.id)) {
        if (node.children) {
          node._children = node.children
          node.children = undefined
        }
      }
    })

    const layoutData = treeLayout(root)

    // Create curved link generator
    const linkGenerator = d3.linkVertical<d3.HierarchyPointLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
      .x(d => d.x)
      .y(d => d.y)

    // Add links
    g.selectAll('.link')
      .data(layoutData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', linkGenerator)
      .attr('fill', 'none')
      .attr('stroke', d => {
        const targetNode = d.target.data as TreeNode
        return treeData.categories[targetNode.category] || '#999'
      })
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.4)

    // Add nodes
    const nodes = g.selectAll('.node')
      .data(layoutData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)

    // Add circles for nodes
    const circles = nodes.append('circle')
      .attr('r', d => {
        const node = d.data as TreeNode
        return matchingNodes.has(node.id) ? 10 : 8
      })
      .attr('fill', d => {
        const node = d.data as TreeNode
        const isUnlocked = !node.unlockTurn || node.unlockTurn <= currentTurn
        return isUnlocked 
          ? treeData.categories[node.category] 
          : '#e5e7eb'
      })
      .attr('fill-opacity', d => {
        const node = d.data as TreeNode
        const isUnlocked = !node.unlockTurn || node.unlockTurn <= currentTurn
        return isUnlocked ? 1 : 0.5
      })
      .attr('stroke', d => {
        const node = d.data as TreeNode
        const dNode = d as D3TreeNode
        if (matchingNodes.has(node.id)) return '#f59e0b'
        return dNode._children ? '#333' : '#fff'
      })
      .attr('stroke-width', d => {
        const node = d.data as TreeNode
        const dNode = d as D3TreeNode
        if (matchingNodes.has(node.id)) return 4
        return dNode._children ? 3 : 2
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation()
        const dNode = d as D3TreeNode
        
        // Toggle collapse on shift+click or if has children
        if (event.shiftKey || (dNode.children || dNode._children)) {
          const nodeId = dNode.data.id
          setCollapsedNodes(prev => {
            const newSet = new Set(prev)
            if (newSet.has(nodeId)) {
              newSet.delete(nodeId)
            } else {
              newSet.add(nodeId)
            }
            return newSet
          })
        } else {
          // Show details on regular click
          setSelectedNode(d.data as TreeNode)
        }
      })
      .on('mouseenter', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 12)
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8)
      })

    // Add labels
    nodes.append('text')
      .attr('dy', -15)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', d => {
        const node = d.data as TreeNode
        const isUnlocked = !node.unlockTurn || node.unlockTurn <= currentTurn
        return isUnlocked ? '#1f2937' : '#9ca3af'
      })
      .text(d => (d.data as TreeNode).feature.name)

    // Center the tree
    const bounds = g.node()?.getBBox()
    if (bounds) {
      const fullWidth = bounds.width
      const fullHeight = bounds.height
      const midX = bounds.x + fullWidth / 2
      const midY = bounds.y + fullHeight / 2

      const scale = 0.9 * Math.min(width / fullWidth, height / fullHeight)
      const translate = [width / 2 - midX * scale, height / 2 - midY * scale]
      
      svg.call(
        zoom.transform,
        d3.zoomIdentity
          .translate(translate[0], translate[1])
          .scale(scale)
      )
    }

    // Add expand/collapse indicators
    nodes.filter(d => {
      const dNode = d as D3TreeNode
      return !!(dNode.children || dNode._children)
    })
      .append('text')
      .attr('class', 'collapse-indicator')
      .attr('x', 0)
      .attr('y', 4)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', '#666')
      .style('pointer-events', 'none')
      .text((d: D3TreeNode) => d._children ? '+' : '-')

    // Animate newly unlocked features
    circles.each(function(d) {
      const node = d.data as TreeNode
      const circle = d3.select(this)
      
      // Check if this feature just became unlocked
      if (node.unlockTurn === currentTurn) {
        // Pulse animation for newly unlocked features
        circle
          .attr('r', 4)
          .attr('fill-opacity', 0)
          .transition()
          .duration(500)
          .attr('r', 12)
          .attr('fill-opacity', 1)
          .transition()
          .duration(300)
          .attr('r', matchingNodes.has(node.id) ? 10 : 8)
          
        // Add a temporary glow effect
        if (this.parentNode) {
          d3.select(this.parentNode as SVGGElement)
            .insert('circle', ':first-child')
            .attr('r', 8)
            .attr('fill', treeData.categories[node.category])
            .attr('fill-opacity', 0.8)
            .transition()
            .duration(1000)
            .attr('r', 20)
            .attr('fill-opacity', 0)
            .remove()
        }
      }
    })

  }, [currentTurn, width, height, collapsedNodes, matchingNodes, treeData, updateMinimap])

  // Update minimap viewport indicator
  const updateMinimap = useCallback(() => {
    if (!minimapRef.current || !showMinimap) return
    
    const minimapSvg = d3.select(minimapRef.current)
    const viewport = minimapSvg.select('.minimap-viewport')
    
    if (!viewport.empty()) {
      const scale = currentTransform.current.k
      const tx = currentTransform.current.x
      const ty = currentTransform.current.y
      
      // Calculate viewport dimensions in minimap scale
      const minimapScale = 0.1
      const viewportWidth = width / scale * minimapScale
      const viewportHeight = height / scale * minimapScale
      const viewportX = -tx / scale * minimapScale
      const viewportY = -ty / scale * minimapScale
      
      viewport
        .attr('x', viewportX)
        .attr('y', viewportY)
        .attr('width', viewportWidth)
        .attr('height', viewportHeight)
    }
  }, [showMinimap, width, height])

  // Zoom to fit matching nodes
  const zoomToMatches = () => {
    if (!svgRef.current || !zoomRef.current || matchingNodes.size === 0) return

    const svg = d3.select(svgRef.current)
    const g = svg.select('g')
    
    // Find bounds of matching nodes
    let minX = Infinity, minY = Infinity
    let maxX = -Infinity, maxY = -Infinity
    
    g.selectAll('.node').each(function(d) {
      const node = d.data as TreeNode
      if (matchingNodes.has(node.id)) {
        minX = Math.min(minX, d.x)
        maxX = Math.max(maxX, d.x)
        minY = Math.min(minY, d.y)
        maxY = Math.max(maxY, d.y)
      }
    })

    if (minX === Infinity) return

    // Add padding
    const padding = 100
    minX -= padding
    minY -= padding
    maxX += padding
    maxY += padding

    const fullWidth = maxX - minX
    const fullHeight = maxY - minY
    const midX = minX + fullWidth / 2
    const midY = minY + fullHeight / 2

    const scale = 0.9 * Math.min(width / fullWidth, height / fullHeight)
    const translate = [width / 2 - midX * scale, height / 2 - midY * scale]
    
    svg.transition()
      .duration(750)
      .call(
        zoomRef.current.transform,
        d3.zoomIdentity
          .translate(translate[0], translate[1])
          .scale(scale)
      )
  }

  // Create minimap
  useEffect(() => {
    if (!minimapRef.current || !showMinimap) return

    const minimapSvg = d3.select(minimapRef.current)
    minimapSvg.selectAll('*').remove()

    const minimapG = minimapSvg.append('g')
      .attr('transform', 'scale(0.1)')

    // Copy tree structure to minimap
    const svg = d3.select(svgRef.current)
    const mainG = svg.select('g')
    
    if (!mainG.empty()) {
      // Copy links
      mainG.selectAll('.link').each(function() {
        const link = d3.select(this)
        minimapG.append('path')
          .attr('d', link.attr('d'))
          .attr('fill', 'none')
          .attr('stroke', '#999')
          .attr('stroke-width', 10)
          .attr('stroke-opacity', 0.2)
      })

      // Copy nodes
      mainG.selectAll('.node').each(function() {
        const node = d3.select(this)
        const transform = node.attr('transform')
        
        minimapG.append('circle')
          .attr('transform', transform)
          .attr('r', 40)
          .attr('fill', '#666')
          .attr('fill-opacity', 0.5)
      })
    }

    // Add viewport indicator
    minimapSvg.append('rect')
      .attr('class', 'minimap-viewport')
      .attr('fill', 'none')
      .attr('stroke', '#2563eb')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.8)

    updateMinimap()
  }, [width, height, showMinimap, collapsedNodes, currentTurn, updateMinimap])

  return (
    <div className="relative w-full h-full bg-gray-50 rounded-lg overflow-hidden">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full"
      />
      
      {/* Instructions and Search */}
      <div className="absolute top-4 left-4 flex flex-col gap-3 max-w-xs">
        <div className="bg-white/90 p-3 rounded-lg shadow-sm text-xs text-gray-600">
          <p>• {window.ontouchstart !== undefined ? 'Tap' : 'Click'} node for details</p>
          <p>• {window.ontouchstart !== undefined ? 'Tap' : 'Click'} parent nodes to collapse/expand</p>
          <p>• {window.ontouchstart !== undefined ? 'Pinch to zoom, drag to pan' : 'Drag to pan, scroll to zoom'}</p>
          {window.ontouchstart !== undefined && <p>• Double tap to zoom in/out</p>}
        </div>
        
        {/* Search Box */}
        <div className="bg-white/90 p-3 rounded-lg shadow-sm">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-0"
              style={{ fontSize: '16px' }} // Prevent zoom on iOS
            />
            {matchingNodes.size > 0 && (
              <button
                onClick={zoomToMatches}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Show {matchingNodes.size}
              </button>
            )}
          </div>
          {searchQuery && matchingNodes.size === 0 && (
            <p className="text-xs text-gray-500 mt-1">No matches found</p>
          )}
        </div>
      </div>
      
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-xs">
          <h3 className="font-bold text-lg mb-2">{selectedNode.feature.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{selectedNode.feature.description}</p>
          <div className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: treeData.categories[selectedNode.category] }}
            />
            <span className="text-sm capitalize">{selectedNode.category}</span>
          </div>
          {selectedNode.unlockTurn && (
            <p className="text-xs text-gray-500 mt-2">
              {selectedNode.unlockTurn <= currentTurn 
                ? 'Unlocked' 
                : `Unlocks at turn ${selectedNode.unlockTurn}`}
            </p>
          )}
          <button
            className="mt-3 text-xs text-gray-500 hover:text-gray-700"
            onClick={() => setSelectedNode(null)}
          >
            Close
          </button>
        </div>
      )}
      
      {/* Minimap */}
      {showMinimap && (
        <div className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-600">Overview</span>
            <button
              onClick={() => setShowMinimap(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <svg
            ref={minimapRef}
            width={200}
            height={150}
            className="border border-gray-300 rounded bg-gray-50"
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              if (!zoomRef.current || !svgRef.current) return
              
              const rect = e.currentTarget.getBoundingClientRect()
              const x = (e.clientX - rect.left) / 0.1
              const y = (e.clientY - rect.top) / 0.1
              
              const svg = d3.select(svgRef.current)
              svg.transition()
                .duration(750)
                .call(
                  zoomRef.current.transform,
                  d3.zoomIdentity
                    .translate(width / 2 - x, height / 2 - y)
                    .scale(1)
                )
            }}
          />
        </div>
      )}
      
      {/* Toggle minimap button */}
      {!showMinimap && (
        <button
          onClick={() => setShowMinimap(true)}
          className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-lg shadow-sm text-xs text-gray-600 hover:bg-white transition-colors"
        >
          Show Overview
        </button>
      )}
    </div>
  )
}