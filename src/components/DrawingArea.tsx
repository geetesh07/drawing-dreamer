
import React, { useRef, useEffect, useState } from "react";
import { 
  DrawingDimensions, 
  calculateScaleFactor, 
  getScaledDimensions,
  formatWithUnit,
  ViewType,
  validateCornerRadius,
  generateRoundedRectPath
} from "@/utils/drawingUtils";

interface DrawingAreaProps {
  dimensions: DrawingDimensions;
  activeView: ViewType;
  className?: string;
}

const DrawingArea: React.FC<DrawingAreaProps> = ({ 
  dimensions, 
  activeView,
  className 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<SVGSVGElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Get container size on mount and window resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Create or update SVG drawing
  useEffect(() => {
    if (!containerRef.current || containerSize.width === 0) return;

    // Clear previous drawing
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Create new SVG element
    const svgNS = "http://www.w3.org/2000/svg";
    const newSvg = document.createElementNS(svgNS, "svg");
    newSvg.setAttribute("width", containerSize.width.toString());
    newSvg.setAttribute("height", containerSize.height.toString());
    newSvg.style.overflow = "visible";
    
    containerRef.current.appendChild(newSvg);
    setSvg(newSvg);

    // Calculate scale factor based on container size
    const { width, height, depth = 50, cornerRadius, unit } = dimensions;
    
    // Validate corner radius
    const validRadius = validateCornerRadius(width, height, cornerRadius);
    
    // Calculate scale factor
    const padding = 60; // Padding for dimensions and labels
    const scaleFactor = calculateScaleFactor(
      dimensions,
      containerSize.width,
      containerSize.height,
      padding
    );
    
    // Get scaled dimensions
    const scaled = getScaledDimensions(
      { ...dimensions, cornerRadius: validRadius },
      scaleFactor
    );
    
    // Position drawing in center of container
    scaled.x = (containerSize.width - scaled.width) / 2;
    scaled.y = (containerSize.height - scaled.height) / 2;
    
    // Draw based on active view
    if (activeView === "top") {
      drawTopView(newSvg, scaled, dimensions);
    } else {
      drawSideView(newSvg, scaled, dimensions);
    }
    
    // Add grid background
    addGridBackground(newSvg, containerSize);
    
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [dimensions, containerSize, activeView]);

  // Draw top view
  const drawTopView = (
    svg: SVGSVGElement, 
    scaled: ReturnType<typeof getScaledDimensions>,
    originalDims: DrawingDimensions
  ) => {
    const svgNS = "http://www.w3.org/2000/svg";
    const { x, y, width, height, cornerRadius } = scaled;
    const { unit } = originalDims;
    
    // Create defs for shadows
    const defs = document.createElementNS(svgNS, "defs");
    svg.appendChild(defs);
    
    const filter = document.createElementNS(svgNS, "filter");
    filter.setAttribute("id", "shadow");
    filter.setAttribute("x", "-20%");
    filter.setAttribute("y", "-20%");
    filter.setAttribute("width", "140%");
    filter.setAttribute("height", "140%");
    defs.appendChild(filter);
    
    const feGaussianBlur = document.createElementNS(svgNS, "feGaussianBlur");
    feGaussianBlur.setAttribute("in", "SourceAlpha");
    feGaussianBlur.setAttribute("stdDeviation", "3");
    filter.appendChild(feGaussianBlur);
    
    const feOffset = document.createElementNS(svgNS, "feOffset");
    feOffset.setAttribute("dx", "0");
    feOffset.setAttribute("dy", "2");
    feOffset.setAttribute("result", "offsetblur");
    filter.appendChild(feOffset);
    
    const feComponentTransfer = document.createElementNS(svgNS, "feComponentTransfer");
    filter.appendChild(feComponentTransfer);
    
    const feFuncA = document.createElementNS(svgNS, "feFuncA");
    feFuncA.setAttribute("type", "linear");
    feFuncA.setAttribute("slope", "0.2");
    feComponentTransfer.appendChild(feFuncA);
    
    const feMerge = document.createElementNS(svgNS, "feMerge");
    filter.appendChild(feMerge);
    
    const feMergeNode1 = document.createElementNS(svgNS, "feMergeNode");
    feMerge.appendChild(feMergeNode1);
    
    const feMergeNode2 = document.createElementNS(svgNS, "feMergeNode");
    feMergeNode2.setAttribute("in", "SourceGraphic");
    feMerge.appendChild(feMergeNode2);
    
    // Create rounded rectangle
    const rect = document.createElementNS(svgNS, "path");
    const path = generateRoundedRectPath(x, y, width, height, cornerRadius);
    rect.setAttribute("d", path);
    rect.setAttribute("fill", "white");
    rect.setAttribute("stroke", "#333");
    rect.setAttribute("stroke-width", "1.5");
    rect.setAttribute("filter", "url(#shadow)");
    svg.appendChild(rect);
    
    // Draw horizontal dimension line
    const horDimY = y + height + 40;
    
    // Dimension line
    const horDimLine = document.createElementNS(svgNS, "line");
    horDimLine.setAttribute("x1", x.toString());
    horDimLine.setAttribute("y1", horDimY.toString());
    horDimLine.setAttribute("x2", (x + width).toString());
    horDimLine.setAttribute("y2", horDimY.toString());
    horDimLine.setAttribute("stroke", "#333");
    horDimLine.setAttribute("stroke-width", "1");
    svg.appendChild(horDimLine);
    
    // Extension lines
    const extLine1 = document.createElementNS(svgNS, "line");
    extLine1.setAttribute("x1", x.toString());
    extLine1.setAttribute("y1", (y + height).toString());
    extLine1.setAttribute("x2", x.toString());
    extLine1.setAttribute("y2", horDimY.toString());
    extLine1.setAttribute("stroke", "#333");
    extLine1.setAttribute("stroke-width", "0.75");
    extLine1.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(extLine1);
    
    const extLine2 = document.createElementNS(svgNS, "line");
    extLine2.setAttribute("x1", (x + width).toString());
    extLine2.setAttribute("y1", (y + height).toString());
    extLine2.setAttribute("x2", (x + width).toString());
    extLine2.setAttribute("y2", horDimY.toString());
    extLine2.setAttribute("stroke", "#333");
    extLine2.setAttribute("stroke-width", "0.75");
    extLine2.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(extLine2);
    
    // Dimension value
    const horDimText = document.createElementNS(svgNS, "text");
    horDimText.setAttribute("x", (x + width / 2).toString());
    horDimText.setAttribute("y", (horDimY - 10).toString());
    horDimText.setAttribute("text-anchor", "middle");
    horDimText.setAttribute("font-family", "Inter, system-ui, sans-serif");
    horDimText.setAttribute("font-size", "12");
    horDimText.setAttribute("fill", "#333");
    horDimText.textContent = formatWithUnit(originalDims.width, unit);
    svg.appendChild(horDimText);
    
    // Draw vertical dimension line
    const vertDimX = x - 40;
    
    // Dimension line
    const vertDimLine = document.createElementNS(svgNS, "line");
    vertDimLine.setAttribute("x1", vertDimX.toString());
    vertDimLine.setAttribute("y1", y.toString());
    vertDimLine.setAttribute("x2", vertDimX.toString());
    vertDimLine.setAttribute("y2", (y + height).toString());
    vertDimLine.setAttribute("stroke", "#333");
    vertDimLine.setAttribute("stroke-width", "1");
    svg.appendChild(vertDimLine);
    
    // Extension lines
    const vertExtLine1 = document.createElementNS(svgNS, "line");
    vertExtLine1.setAttribute("x1", x.toString());
    vertExtLine1.setAttribute("y1", y.toString());
    vertExtLine1.setAttribute("x2", vertDimX.toString());
    vertExtLine1.setAttribute("y2", y.toString());
    vertExtLine1.setAttribute("stroke", "#333");
    vertExtLine1.setAttribute("stroke-width", "0.75");
    vertExtLine1.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(vertExtLine1);
    
    const vertExtLine2 = document.createElementNS(svgNS, "line");
    vertExtLine2.setAttribute("x1", x.toString());
    vertExtLine2.setAttribute("y1", (y + height).toString());
    vertExtLine2.setAttribute("x2", vertDimX.toString());
    vertExtLine2.setAttribute("y2", (y + height).toString());
    vertExtLine2.setAttribute("stroke", "#333");
    vertExtLine2.setAttribute("stroke-width", "0.75");
    vertExtLine2.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(vertExtLine2);
    
    // Dimension value
    const vertDimText = document.createElementNS(svgNS, "text");
    vertDimText.setAttribute("x", (vertDimX - 10).toString());
    vertDimText.setAttribute("y", (y + height / 2).toString());
    vertDimText.setAttribute("text-anchor", "middle");
    vertDimText.setAttribute("font-family", "Inter, system-ui, sans-serif");
    vertDimText.setAttribute("font-size", "12");
    vertDimText.setAttribute("fill", "#333");
    vertDimText.setAttribute("transform", `rotate(-90 ${vertDimX - 10} ${y + height / 2})`);
    vertDimText.textContent = formatWithUnit(originalDims.height, unit);
    svg.appendChild(vertDimText);
    
    // Add corner radius dimension if > 0
    if (cornerRadius > 0) {
      const radiusX = x + cornerRadius;
      const radiusY = y + cornerRadius;
      
      // Draw radius arc
      const radiusArc = document.createElementNS(svgNS, "path");
      radiusArc.setAttribute(
        "d",
        `M ${x} ${radiusY} A ${cornerRadius} ${cornerRadius} 0 0 1 ${radiusX} ${y}`
      );
      radiusArc.setAttribute("fill", "none");
      radiusArc.setAttribute("stroke", "#333");
      radiusArc.setAttribute("stroke-width", "0.75");
      radiusArc.setAttribute("stroke-dasharray", "4 2");
      svg.appendChild(radiusArc);
      
      // Draw radius line
      const radiusLine = document.createElementNS(svgNS, "line");
      radiusLine.setAttribute("x1", x.toString());
      radiusLine.setAttribute("y1", radiusY.toString());
      radiusLine.setAttribute("x2", radiusX.toString());
      radiusLine.setAttribute("y2", y.toString());
      radiusLine.setAttribute("stroke", "#333");
      radiusLine.setAttribute("stroke-width", "0.75");
      radiusLine.setAttribute("stroke-dasharray", "4 2");
      svg.appendChild(radiusLine);
      
      // Add radius value
      const radiusText = document.createElementNS(svgNS, "text");
      radiusText.setAttribute("x", (x + cornerRadius/2 - 5).toString());
      radiusText.setAttribute("y", (y + cornerRadius/2 - 5).toString());
      radiusText.setAttribute("font-family", "Inter, system-ui, sans-serif");
      radiusText.setAttribute("font-size", "12");
      radiusText.setAttribute("fill", "#333");
      
      // Add white background for text
      const radiusTextBg = document.createElementNS(svgNS, "rect");
      radiusTextBg.setAttribute("width", "40");
      radiusTextBg.setAttribute("height", "16");
      radiusTextBg.setAttribute("x", (x + cornerRadius/2 - 20).toString());
      radiusTextBg.setAttribute("y", (y + cornerRadius/2 - 17).toString());
      radiusTextBg.setAttribute("fill", "white");
      radiusTextBg.setAttribute("fill-opacity", "0.8");
      radiusTextBg.setAttribute("rx", "2");
      radiusTextBg.setAttribute("ry", "2");
      svg.appendChild(radiusTextBg);
      
      radiusText.textContent = `R${originalDims.cornerRadius}`;
      svg.appendChild(radiusText);
    }
  };

  // Draw side view
  const drawSideView = (
    svg: SVGSVGElement, 
    scaled: ReturnType<typeof getScaledDimensions>,
    originalDims: DrawingDimensions
  ) => {
    const svgNS = "http://www.w3.org/2000/svg";
    const { x, y, height, depth } = scaled;
    const { unit } = originalDims;
    
    // Create rectangle for side view (no corner radius in profile)
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", x.toString());
    rect.setAttribute("y", y.toString());
    rect.setAttribute("width", depth.toString());
    rect.setAttribute("height", height.toString());
    rect.setAttribute("fill", "white");
    rect.setAttribute("stroke", "#333");
    rect.setAttribute("stroke-width", "1.5");
    svg.appendChild(rect);
    
    // Draw horizontal dimension (depth)
    const horDimY = y + height + 40;
    
    // Dimension line
    const horDimLine = document.createElementNS(svgNS, "line");
    horDimLine.setAttribute("x1", x.toString());
    horDimLine.setAttribute("y1", horDimY.toString());
    horDimLine.setAttribute("x2", (x + depth).toString());
    horDimLine.setAttribute("y2", horDimY.toString());
    horDimLine.setAttribute("stroke", "#333");
    horDimLine.setAttribute("stroke-width", "1");
    svg.appendChild(horDimLine);
    
    // Extension lines
    const extLine1 = document.createElementNS(svgNS, "line");
    extLine1.setAttribute("x1", x.toString());
    extLine1.setAttribute("y1", (y + height).toString());
    extLine1.setAttribute("x2", x.toString());
    extLine1.setAttribute("y2", horDimY.toString());
    extLine1.setAttribute("stroke", "#333");
    extLine1.setAttribute("stroke-width", "0.75");
    extLine1.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(extLine1);
    
    const extLine2 = document.createElementNS(svgNS, "line");
    extLine2.setAttribute("x1", (x + depth).toString());
    extLine2.setAttribute("y1", (y + height).toString());
    extLine2.setAttribute("x2", (x + depth).toString());
    extLine2.setAttribute("y2", horDimY.toString());
    extLine2.setAttribute("stroke", "#333");
    extLine2.setAttribute("stroke-width", "0.75");
    extLine2.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(extLine2);
    
    // Dimension value
    const horDimText = document.createElementNS(svgNS, "text");
    horDimText.setAttribute("x", (x + depth / 2).toString());
    horDimText.setAttribute("y", (horDimY - 10).toString());
    horDimText.setAttribute("text-anchor", "middle");
    horDimText.setAttribute("font-family", "Inter, system-ui, sans-serif");
    horDimText.setAttribute("font-size", "12");
    horDimText.setAttribute("fill", "#333");
    horDimText.textContent = formatWithUnit(originalDims.depth || 0, unit);
    svg.appendChild(horDimText);
    
    // Draw vertical dimension line
    const vertDimX = x - 40;
    
    // Dimension line
    const vertDimLine = document.createElementNS(svgNS, "line");
    vertDimLine.setAttribute("x1", vertDimX.toString());
    vertDimLine.setAttribute("y1", y.toString());
    vertDimLine.setAttribute("x2", vertDimX.toString());
    vertDimLine.setAttribute("y2", (y + height).toString());
    vertDimLine.setAttribute("stroke", "#333");
    vertDimLine.setAttribute("stroke-width", "1");
    svg.appendChild(vertDimLine);
    
    // Extension lines
    const vertExtLine1 = document.createElementNS(svgNS, "line");
    vertExtLine1.setAttribute("x1", x.toString());
    vertExtLine1.setAttribute("y1", y.toString());
    vertExtLine1.setAttribute("x2", vertDimX.toString());
    vertExtLine1.setAttribute("y2", y.toString());
    vertExtLine1.setAttribute("stroke", "#333");
    vertExtLine1.setAttribute("stroke-width", "0.75");
    vertExtLine1.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(vertExtLine1);
    
    const vertExtLine2 = document.createElementNS(svgNS, "line");
    vertExtLine2.setAttribute("x1", x.toString());
    vertExtLine2.setAttribute("y1", (y + height).toString());
    vertExtLine2.setAttribute("x2", vertDimX.toString());
    vertExtLine2.setAttribute("y2", (y + height).toString());
    vertExtLine2.setAttribute("stroke", "#333");
    vertExtLine2.setAttribute("stroke-width", "0.75");
    vertExtLine2.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(vertExtLine2);
    
    // Dimension value
    const vertDimText = document.createElementNS(svgNS, "text");
    vertDimText.setAttribute("x", (vertDimX - 10).toString());
    vertDimText.setAttribute("y", (y + height / 2).toString());
    vertDimText.setAttribute("text-anchor", "middle");
    vertDimText.setAttribute("font-family", "Inter, system-ui, sans-serif");
    vertDimText.setAttribute("font-size", "12");
    vertDimText.setAttribute("fill", "#333");
    vertDimText.setAttribute("transform", `rotate(-90 ${vertDimX - 10} ${y + height / 2})`);
    vertDimText.textContent = formatWithUnit(originalDims.height, unit);
    svg.appendChild(vertDimText);
  };

  // Add grid background to drawing
  const addGridBackground = (svg: SVGSVGElement, containerSize: { width: number; height: number }) => {
    const svgNS = "http://www.w3.org/2000/svg";
    
    // Create pattern definition for grid
    const defs = document.createElementNS(svgNS, "defs");
    svg.appendChild(defs);
    
    const pattern = document.createElementNS(svgNS, "pattern");
    pattern.setAttribute("id", "grid");
    pattern.setAttribute("width", "20");
    pattern.setAttribute("height", "20");
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    defs.appendChild(pattern);
    
    // Horizontal line
    const hLine = document.createElementNS(svgNS, "line");
    hLine.setAttribute("x1", "0");
    hLine.setAttribute("y1", "20");
    hLine.setAttribute("x2", "20");
    hLine.setAttribute("y2", "20");
    hLine.setAttribute("stroke", "#f0f0f0");
    hLine.setAttribute("stroke-width", "0.5");
    pattern.appendChild(hLine);
    
    // Vertical line
    const vLine = document.createElementNS(svgNS, "line");
    vLine.setAttribute("x1", "20");
    vLine.setAttribute("y1", "0");
    vLine.setAttribute("x2", "20");
    vLine.setAttribute("y2", "20");
    vLine.setAttribute("stroke", "#f0f0f0");
    vLine.setAttribute("stroke-width", "0.5");
    pattern.appendChild(vLine);
    
    // Apply grid pattern as background
    const gridBg = document.createElementNS(svgNS, "rect");
    gridBg.setAttribute("width", containerSize.width.toString());
    gridBg.setAttribute("height", containerSize.height.toString());
    gridBg.setAttribute("fill", "url(#grid)");
    
    // Insert at beginning to be behind other elements
    svg.insertBefore(gridBg, svg.firstChild);
  };

  return (
    <div 
      ref={containerRef} 
      className={`min-h-[500px] bg-white drawing-container ${className}`}
      style={{ transition: "all 0.3s ease" }}
    />
  );
};

export default DrawingArea;
