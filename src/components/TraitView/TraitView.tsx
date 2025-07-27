import { type FC, useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  type TraitViewProps, 
  type TraitNode, 
  type TraitNodeState,
  type TraitEdge,
  AdoptedTraitCategory,
  EnvironmentalTraitCategory 
} from './types';

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
      .attr("stroke-opacity", 0.6);

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
      
      if (d.trait.isEnvironmental) {
        // Diamond shape for environmental traits
        nodeGroup.append("polygon")
          .attr("points", "0,-15 15,0 0,15 -15,0")
          .attr("fill", getNodeFill(d.state, color))
          .attr("stroke", getNodeStroke(d.state, color))
          .attr("stroke-width", getNodeStrokeWidth(d.state));
      } else {
        // Circle for species traits
        nodeGroup.append("circle")
          .attr("r", 15)
          .attr("fill", getNodeFill(d.state, color))
          .attr("stroke", getNodeStroke(d.state, color))
          .attr("stroke-width", getNodeStrokeWidth(d.state));
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
        .attr("fill", "#000")
        .attr("pointer-events", "none")
        .text(d.trait.name.length > 8 ? d.trait.name.substring(0, 8) + "..." : d.trait.name);
    });

    // Add event handlers
    node
      .on("click", (_, d) => {
        onTraitClick(d.id);
      })
      .on("mouseenter", (_, d) => {
        onTraitHover(d.id);
        // Highlight connected nodes and edges
        highlightConnections(d.id, g, edges);
      })
      .on("mouseleave", () => {
        onTraitHover(null);
        // Remove highlights
        clearHighlights(g);
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
    <div className="trait-view">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ border: '1px solid #ccc', background: '#fafafa' }}
        data-testid="trait-view-svg"
      />
    </div>
  );
};

function getNodeFill(state: TraitNodeState, categoryColor: string): string {
  switch (state) {
    case "not-discovered":
      return "rgba(128, 128, 128, 0.2)";
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
      return "rgba(128, 128, 128, 0.4)";
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