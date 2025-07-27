import { type FC, useRef, useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { 
  type TraitViewProps, 
  type TraitNode, 
  type TraitNodeState,
  type TraitEdge,
  type Trait,
  AdoptedTraitCategory,
  EnvironmentalTraitCategory 
} from './types';
import { TraitTooltip, EdgeTooltip } from './TraitTooltip';
import { TraitDetailPanel } from './TraitDetailPanel';

const CATEGORY_COLORS = {
  // Adopted trait categories
  [AdoptedTraitCategory.Biological]: '#4ade80', // Green
  [AdoptedTraitCategory.Behavioral]: '#3b82f6', // Blue
  [AdoptedTraitCategory.Social]: '#eab308', // Yellow
  [AdoptedTraitCategory.Technological]: '#f97316', // Orange
  
  // Environmental trait categories
  [EnvironmentalTraitCategory.Geological]: '#a3a3a3', // Brown-gray
  [EnvironmentalTraitCategory.Ecological]: '#06b6d4', // Teal
  [EnvironmentalTraitCategory.Industrial]: '#6b7280', // Gray
} as const;

export const TraitView: FC<TraitViewProps> = ({
  traits,
  edges,
  playerState,
  visibleTraits,
  onTraitClick,
  onTraitHover,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const width = 800;
  const height = 600;
  
  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    type: 'trait' | 'edge';
    data: TraitNode | TraitEdge;
    x: number;
    y: number;
    visible: boolean;
  } | null>(null);

  // Detail panel state
  const [detailPanel, setDetailPanel] = useState<{
    trait: TraitNode;
    visible: boolean;
  } | null>(null);

  // Determine node states based on player state
  const traitNodes: TraitNode[] = useMemo(() => {
    return traits
      .filter(trait => visibleTraits.has(trait.id))
      .map(trait => {
        let state: TraitNodeState;
        
        if (trait.isEnvironmental) {
          state = "environmental";
        } else if (playerState.adoptedTraits.has(trait.id)) {
          // Check if this trait is losable
          const isLosable = playerState.losableChoices?.some(choice =>
            choice.options.includes(trait.id)
          ) ?? false;
          state = isLosable ? "losable" : "adopted";
        } else if (playerState.discoveredTraits.has(trait.id)) {
          // Check if this trait is adoptable
          const isAdoptable = playerState.adoptableChoices?.some(choice =>
            choice.options.includes(trait.id)
          ) ?? false;
          state = isAdoptable ? "adoptable" : "discovered";
        } else {
          state = "not-discovered";
        }

        return {
          id: trait.id,
          trait,
          state,
          x: 0,
          y: 0,
        };
      });
  }, [traits, playerState, visibleTraits]);

  // Convert edges to D3 link format with node references
  const visibleLinks = useMemo(() => {
    const nodeMap = new Map(traitNodes.map(node => [node.id, node]));
    return edges
      .filter(edge => visibleTraits.has(edge.from) && visibleTraits.has(edge.to))
      .map(edge => ({
        ...edge,
        source: nodeMap.get(edge.from)!,
        target: nodeMap.get(edge.to)!,
      }));
  }, [edges, visibleTraits, traitNodes]);

  // Calculate connected traits for detail panel
  const getConnectedTraits = useMemo(() => {
    return (traitId: string) => {
      const connections: Array<{ trait: Trait; relationship: string }> = [];
      const traitMap = new Map(traits.map(t => [t.id, t]));
      
      edges.forEach(edge => {
        if (edge.from === traitId && visibleTraits.has(edge.to)) {
          const connectedTrait = traitMap.get(edge.to);
          if (connectedTrait) {
            connections.push({
              trait: connectedTrait,
              relationship: edge.description,
            });
          }
        } else if (edge.to === traitId && visibleTraits.has(edge.from)) {
          const connectedTrait = traitMap.get(edge.from);
          if (connectedTrait) {
            connections.push({
              trait: connectedTrait,
              relationship: edge.description,
            });
          }
        }
      });
      
      return connections;
    };
  }, [edges, traits, visibleTraits]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svg.node()) return;

    // Clear previous content
    svg.selectAll("*").remove();

    // Create main group for pan/zoom
    const g = svg.append("g").attr("class", "main-group");

    // Set up zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    // Apply zoom to SVG
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    svg.call(zoom as any);

    // Create simulation
    const simulation = d3.forceSimulation(traitNodes)
      .force("link", d3.forceLink(visibleLinks)
        .distance(80)
        .strength(0.1)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(25));

    // Create links
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(visibleLinks)
      .enter().append("line")
      .attr("stroke", "#666")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.6)
      .style("cursor", "pointer")
      .on("mouseenter", (event, d) => {
        const svgRect = svgRef.current?.getBoundingClientRect();
        if (svgRect) {
          setTooltip({
            type: 'edge',
            data: d as TraitEdge,
            x: event.pageX - svgRect.left,
            y: event.pageY - svgRect.top,
            visible: true,
          });
        }
      })
      .on("mouseleave", () => {
        setTooltip(null);
      });

    // Create nodes
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(traitNodes)
      .enter().append("g")
      .attr("class", "trait-node")
      .style("cursor", "pointer");

    // Add node shapes based on type
    node.each(function(d) {
      const nodeGroup = d3.select(this);
      const color = CATEGORY_COLORS[d.trait.category];
      const opacity = d.state === "not-discovered" ? 0.3 : 1.0;
      
      if (d.trait.isEnvironmental) {
        // Diamond shape for environmental traits
        nodeGroup.append("polygon")
          .attr("points", "0,-15 15,0 0,15 -15,0")
          .attr("fill", getNodeFill(d.state, color))
          .attr("stroke", getNodeStroke(d.state, color))
          .attr("stroke-width", getNodeStrokeWidth(d.state))
          .style("opacity", opacity);
      } else {
        // Circle for species traits
        nodeGroup.append("circle")
          .attr("r", 15)
          .attr("fill", getNodeFill(d.state, color))
          .attr("stroke", getNodeStroke(d.state, color))
          .attr("stroke-width", getNodeStrokeWidth(d.state))
          .style("opacity", opacity);
      }

      // Add sparkle effect for choice nodes
      if (d.state === "adoptable" || d.state === "losable") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        addSparkleEffect(nodeGroup as any);
      }

      // Add text label
      nodeGroup.append("text")
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", d.state === "not-discovered" ? "#9ca3af" : "#000")
        .attr("pointer-events", "none")
        .style("opacity", opacity)
        .text(d.trait.name.length > 8 ? d.trait.name.substring(0, 8) + "..." : d.trait.name);
    });

    // Add event handlers
    node
      .on("click", (_, d) => {
        onTraitClick(d.id);
        // Show detail panel
        setDetailPanel({
          trait: d,
          visible: true,
        });
      })
      .on("mouseenter", (event, d) => {
        onTraitHover(d.id);
        // Add hover effects
        addHoverEffects(d.id, g);
        // Highlight connected nodes and edges
        highlightConnections(d.id, g, edges);
        // Show tooltip
        const svgRect = svgRef.current?.getBoundingClientRect();
        if (svgRect) {
          setTooltip({
            type: 'trait',
            data: d,
            x: event.pageX - svgRect.left,
            y: event.pageY - svgRect.top,
            visible: true,
          });
        }
      })
      .on("mouseleave", () => {
        onTraitHover(null);
        // Remove hover effects
        removeHoverEffects(g);
        // Remove highlights
        clearHighlights(g);
        // Hide tooltip
        setTooltip(null);
      });

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .attr("x1", (d: any) => (d.source as TraitNode).x || 0)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .attr("y1", (d: any) => (d.source as TraitNode).y || 0)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .attr("x2", (d: any) => (d.target as TraitNode).x || 0)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .attr("y2", (d: any) => (d.target as TraitNode).y || 0);

      node
        .attr("transform", (d: TraitNode) => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [traitNodes, visibleLinks, onTraitClick, onTraitHover, edges]);

  return (
    <div className="trait-view" style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ border: '1px solid #ccc', background: '#fafafa' }}
        data-testid="trait-view-svg"
      />
      {tooltip && tooltip.type === 'trait' && (
        <TraitTooltip
          trait={(tooltip.data as TraitNode).trait}
          state={(tooltip.data as TraitNode).state}
          x={tooltip.x}
          y={tooltip.y}
          visible={tooltip.visible}
        />
      )}
      {tooltip && tooltip.type === 'edge' && (
        <EdgeTooltip
          edge={tooltip.data as TraitEdge}
          x={tooltip.x}
          y={tooltip.y}
          visible={tooltip.visible}
        />
      )}
      {detailPanel && (
        <TraitDetailPanel
          trait={detailPanel.trait.trait}
          state={detailPanel.trait.state}
          connectedTraits={getConnectedTraits(detailPanel.trait.id)}
          onClose={() => setDetailPanel(null)}
          visible={detailPanel.visible}
        />
      )}
    </div>
  );
};

function getNodeFill(state: TraitNodeState, categoryColor: string): string {
  switch (state) {
    case "not-discovered":
      return "rgba(128, 128, 128, 0.1)"; // Even more ghosted
    case "discovered":
      return "none";
    case "adoptable":
    case "losable":
    case "adopted":
    case "environmental":
      return categoryColor;
    default:
      return "#ccc";
  }
}

function getNodeStroke(state: TraitNodeState, categoryColor: string): string {
  switch (state) {
    case "not-discovered":
      return "rgba(128, 128, 128, 0.2)"; // More ghosted
    case "discovered":
      return categoryColor;
    case "adoptable":
    case "losable":
      return "#ffd700"; // Golden color for choices
    case "adopted":
    case "environmental":
      return categoryColor;
    default:
      return "#ccc";
  }
}

function getNodeStrokeWidth(state: TraitNodeState): number {
  switch (state) {
    case "adoptable":
    case "losable":
      return 3; // Thicker border for choices
    case "discovered":
      return 2;
    default:
      return 1;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addSparkleEffect(nodeGroup: any): void {
  // Simple sparkle effect - add small circles around the node
  const sparkles = [
    { x: -20, y: -10, delay: 0 },
    { x: 20, y: -10, delay: 300 },
    { x: -15, y: 15, delay: 600 },
    { x: 15, y: 15, delay: 900 },
  ];

  sparkles.forEach(sparkle => {
    nodeGroup.append("circle")
      .attr("class", "sparkle")
      .attr("cx", sparkle.x)
      .attr("cy", sparkle.y)
      .attr("r", 0)
      .attr("fill", "#ffd700")
      .attr("opacity", 0)
      .transition()
      .delay(sparkle.delay)
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("r", 3)
      .attr("opacity", 1)
      .transition()
      .duration(500)
      .attr("r", 0)
      .attr("opacity", 0)
      .on("end", function restartAnimation(this: SVGCircleElement) {
        // Restart the animation
        d3.select(this)
          .transition()
          .delay(sparkle.delay)
          .duration(1000)
          .ease(d3.easeLinear)
          .attr("r", 3)
          .attr("opacity", 1)
          .transition()
          .duration(500)
          .attr("r", 0)
          .attr("opacity", 0)
          .on("end", restartAnimation);
      });
  });
}

function highlightConnections(traitId: string, g: d3.Selection<SVGGElement, unknown, null, undefined>, edges: TraitEdge[]): void {
  // Highlight connected edges
  g.selectAll("line")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .style("stroke", (d: any) => {
      const edge = d as TraitEdge;
      return (edge.from === traitId || edge.to === traitId) ? "#ff6b6b" : "#666";
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .style("stroke-width", (d: any) => {
      const edge = d as TraitEdge;
      return (edge.from === traitId || edge.to === traitId) ? 3 : 1.5;
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .style("stroke-opacity", (d: any) => {
      const edge = d as TraitEdge;
      return (edge.from === traitId || edge.to === traitId) ? 1 : 0.3;
    });

  // Get connected node IDs
  const connectedNodes = new Set<string>();
  edges.forEach(edge => {
    if (edge.from === traitId) connectedNodes.add(edge.to);
    if (edge.to === traitId) connectedNodes.add(edge.from);
  });

  // Highlight connected nodes
  g.selectAll(".trait-node")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .style("opacity", (d: any) => {
      const node = d as TraitNode;
      return (node.id === traitId || connectedNodes.has(node.id)) ? 1 : 0.3;
    });
}

function clearHighlights(g: d3.Selection<SVGGElement, unknown, null, undefined>): void {
  g.selectAll("line")
    .style("stroke", "#666")
    .style("stroke-width", 1.5)
    .style("stroke-opacity", 0.6);

  g.selectAll(".trait-node")
    .style("opacity", 1);
}

function addHoverEffects(traitId: string, g: d3.Selection<SVGGElement, unknown, null, undefined>): void {
  g.selectAll(".trait-node")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((d: any) => (d as TraitNode).id === traitId)
    .select("circle, polygon")
    .transition()
    .duration(200)
    .attr("transform", "scale(1.2)")
    .style("filter", "url(#glow)");

  // Add glow filter if it doesn't exist
  if (g.select("#glow").empty()) {
    const defs = g.append("defs");
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");
    
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");
  }
}

function removeHoverEffects(g: d3.Selection<SVGGElement, unknown, null, undefined>): void {
  g.selectAll(".trait-node")
    .select("circle, polygon")
    .transition()
    .duration(200)
    .attr("transform", "scale(1)")
    .style("filter", null);
}