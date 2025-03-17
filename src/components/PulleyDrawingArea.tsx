import React, { useRef, useEffect, useState } from "react";

interface PulleyParameters {
  diameter: number;
  thickness: number;
  boreDiameter: number;
  grooveDepth: number;
  grooveWidth: number;
  keyWayWidth: number;
  keyWayDepth: number;
  unit: "mm" | "cm" | "m" | "in";
}

interface PulleyDrawingAreaProps {
  parameters: PulleyParameters;
  view: "top" | "side";
  className?: string;
}

const drawDimension = (
  svg: SVGSVGElement,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  text: string,
  offset: number = 0,
  isVertical: boolean = false,
  strokeColor: string
) => {
  const svgNS = "http://www.w3.org/2000/svg";
  const g = document.createElementNS(svgNS, "g");

  // Extension lines
  const ext1 = document.createElementNS(svgNS, "line");
  const ext2 = document.createElementNS(svgNS, "line");
  ext1.setAttribute("x1", x1.toString());
  ext1.setAttribute("y1", y1.toString());
  ext1.setAttribute("x2", x1.toString());
  ext1.setAttribute("y2", (y1 + offset).toString());
  ext2.setAttribute("x1", x2.toString());
  ext2.setAttribute("y1", y2.toString());
  ext2.setAttribute("x2", x2.toString());
  ext2.setAttribute("y2", (y2 + offset).toString());
  ext1.setAttribute("stroke", strokeColor);
  ext2.setAttribute("stroke", strokeColor);
  ext1.setAttribute("stroke-width", "0.5");
  ext2.setAttribute("stroke-width", "0.5");

  // Dimension line
  const dim = document.createElementNS(svgNS, "line");
  dim.setAttribute("x1", x1.toString());
  dim.setAttribute("y1", (y1 + offset).toString());
  dim.setAttribute("x2", x2.toString());
  dim.setAttribute("y2", (y2 + offset).toString());
  dim.setAttribute("stroke", strokeColor);
  dim.setAttribute("stroke-width", "0.5");

  // Arrows
  const arrowSize = 3;
  const arrow1 = document.createElementNS(svgNS, "path");
  const arrow2 = document.createElementNS(svgNS, "path");
  arrow1.setAttribute("d", `M ${x1} ${y1 + offset - arrowSize} L ${x1 + arrowSize} ${y1 + offset} L ${x1} ${y1 + offset + arrowSize}`);
  arrow2.setAttribute("d", `M ${x2} ${y2 + offset - arrowSize} L ${x2 - arrowSize} ${y2 + offset} L ${x2} ${y2 + offset + arrowSize}`);
  arrow1.setAttribute("fill", "none");
  arrow2.setAttribute("fill", "none");
  arrow1.setAttribute("stroke", strokeColor);
  arrow2.setAttribute("stroke", strokeColor);

  // Text
  const textElem = document.createElementNS(svgNS, "text");
  const textX = (x1 + x2) / 2;
  const textY = y1 + offset + (isVertical ? -5 : 15);
  textElem.setAttribute("x", textX.toString());
  textElem.setAttribute("y", textY.toString());
  textElem.setAttribute("text-anchor", "middle");
  textElem.setAttribute("font-family", "Arial");
  textElem.setAttribute("font-size", "12");
  textElem.setAttribute("fill", strokeColor);
  if (isVertical) {
    textElem.setAttribute("transform", `rotate(-90 ${textX} ${textY})`);
  }
  textElem.textContent = text;

  g.appendChild(ext1);
  g.appendChild(ext2);
  g.appendChild(dim);
  g.appendChild(arrow1);
  g.appendChild(arrow2);
  g.appendChild(textElem);

  svg.appendChild(g);
};

const drawTopView = (
  svg: SVGSVGElement,
  centerX: number,
  centerY: number,
  scaledDiameter: number,
  scaledBoreDiameter: number,
  params: PulleyParameters,
  dimensionSpacing: number,
  scaleFactor: number,
  strokeColor: string
) => {
  const svgNS = "http://www.w3.org/2000/svg";
  const radius = scaledDiameter / 2;
  const boreRadius = scaledBoreDiameter / 2;

  // Main circle
  const circle = document.createElementNS(svgNS, "circle");
  circle.setAttribute("cx", centerX.toString());
  circle.setAttribute("cy", centerY.toString());
  circle.setAttribute("r", radius.toString());
  circle.setAttribute("fill", "none");
  circle.setAttribute("stroke", strokeColor);
  circle.setAttribute("stroke-width", "1");
  svg.appendChild(circle);

  // Center lines
  [-1, 1].forEach(dir => {
    ["horizontal", "vertical"].forEach(orientation => {
      const line = document.createElementNS(svgNS, "line");
      if (orientation === "horizontal") {
        line.setAttribute("x1", (centerX - radius * 1.2).toString());
        line.setAttribute("y1", centerY.toString());
        line.setAttribute("x2", (centerX + radius * 1.2).toString());
        line.setAttribute("y2", centerY.toString());
      } else {
        line.setAttribute("x1", centerX.toString());
        line.setAttribute("y1", (centerY - radius * 1.2).toString());
        line.setAttribute("x2", centerX.toString());
        line.setAttribute("y2", (centerY + radius * 1.2).toString());
      }
      line.setAttribute("stroke", strokeColor);
      line.setAttribute("stroke-width", "0.25");
      line.setAttribute("stroke-dasharray", "5,3");
      svg.appendChild(line);
    });
  });

  // Bore circle
  const bore = document.createElementNS(svgNS, "circle");
  bore.setAttribute("cx", centerX.toString());
  bore.setAttribute("cy", centerY.toString());
  bore.setAttribute("r", boreRadius.toString());
  bore.setAttribute("fill", "none");
  bore.setAttribute("stroke", strokeColor);
  bore.setAttribute("stroke-width", "1");
  svg.appendChild(bore);

  // Keyway
  const keyWayHalfWidth = params.keyWayWidth * scaleFactor / 2;
  const keyWayDepth = params.keyWayDepth * scaleFactor;
  const keyway = document.createElementNS(svgNS, "path");
  keyway.setAttribute("d", `
    M ${centerX - keyWayHalfWidth} ${centerY - boreRadius - keyWayDepth}
    L ${centerX + keyWayHalfWidth} ${centerY - boreRadius - keyWayDepth}
    L ${centerX + keyWayHalfWidth} ${centerY - boreRadius}
    L ${centerX - keyWayHalfWidth} ${centerY - boreRadius}
    Z
  `);
  keyway.setAttribute("fill", "none");
  keyway.setAttribute("stroke", strokeColor);
  keyway.setAttribute("stroke-width", "1");
  svg.appendChild(keyway);

  // Dimensions
  // Outer diameter
  drawDimension(
    svg,
    centerX - radius,
    centerY + radius + dimensionSpacing,
    centerX + radius,
    centerY + radius + dimensionSpacing,
    `Ø${params.diameter} ${params.unit}`,
    dimensionSpacing,
    false,
    strokeColor
  );

  // Bore diameter
  drawDimension(
    svg,
    centerX + boreRadius,
    centerY,
    centerX + radius + dimensionSpacing * 2,
    centerY,
    `Ø${params.boreDiameter} ${params.unit}`,
    0,
    false,
    strokeColor
  );

  // Keyway dimensions
  drawDimension(
    svg,
    centerX - keyWayHalfWidth,
    centerY - boreRadius - keyWayDepth,
    centerX + keyWayHalfWidth,
    centerY - boreRadius - keyWayDepth,
    `${params.keyWayWidth} ${params.unit}`,
    -dimensionSpacing,
    false,
    strokeColor
  );
};

const drawSideView = (
  svg: SVGSVGElement,
  centerX: number,
  centerY: number,
  scaledDiameter: number,
  scaledThickness: number,
  scaledBoreDiameter: number,
  params: PulleyParameters,
  dimensionSpacing: number,
  scaleFactor: number,
  strokeColor: string
) => {
  const svgNS = "http://www.w3.org/2000/svg";
  const radius = scaledDiameter / 2;
  const boreRadius = scaledBoreDiameter / 2;
  const halfThickness = scaledThickness / 2;

  // Main outline
  const outline = document.createElementNS(svgNS, "path");
  outline.setAttribute("d", `
    M ${centerX - halfThickness} ${centerY - radius}
    L ${centerX + halfThickness} ${centerY - radius}
    L ${centerX + halfThickness} ${centerY + radius}
    L ${centerX - halfThickness} ${centerY + radius}
    Z
  `);
  outline.setAttribute("fill", "none");
  outline.setAttribute("stroke", strokeColor);
  outline.setAttribute("stroke-width", "1");
  svg.appendChild(outline);

  // Center line
  const centerLine = document.createElementNS(svgNS, "line");
  centerLine.setAttribute("x1", (centerX - halfThickness * 1.2).toString());
  centerLine.setAttribute("y1", centerY.toString());
  centerLine.setAttribute("x2", (centerX + halfThickness * 1.2).toString());
  centerLine.setAttribute("y2", centerY.toString());
  centerLine.setAttribute("stroke", strokeColor);
  centerLine.setAttribute("stroke-width", "0.25");
  centerLine.setAttribute("stroke-dasharray", "5,3");
  svg.appendChild(centerLine);

  // V-grooves
  const grooveDepth = params.grooveDepth * scaleFactor;
  ["top", "bottom"].forEach(pos => {
    const y = pos === "top" ? centerY - radius : centerY + radius;
    const groove = document.createElementNS(svgNS, "path");
    groove.setAttribute("d", `
      M ${centerX - halfThickness} ${y}
      L ${centerX} ${y + (pos === "top" ? grooveDepth : -grooveDepth)}
      L ${centerX + halfThickness} ${y}
    `);
    groove.setAttribute("fill", "none");
    groove.setAttribute("stroke", strokeColor);
    groove.setAttribute("stroke-width", "1");
    svg.appendChild(groove);
  });

  // Dimensions
  // Height
  drawDimension(
    svg,
    centerX - halfThickness - dimensionSpacing * 2,
    centerY - radius,
    centerX - halfThickness - dimensionSpacing * 2,
    centerY + radius,
    `${params.diameter} ${params.unit}`,
    0,
    true,
    strokeColor
  );

  // Thickness
  drawDimension(
    svg,
    centerX - halfThickness,
    centerY - radius - dimensionSpacing * 2,
    centerX + halfThickness,
    centerY - radius - dimensionSpacing * 2,
    `${params.thickness} ${params.unit}`,
    0,
    false,
    strokeColor
  );

  // V-groove depth
  drawDimension(
    svg,
    centerX,
    centerY - radius,
    centerX,
    centerY - radius + grooveDepth,
    `${params.grooveDepth} ${params.unit}`,
    dimensionSpacing,
    true,
    strokeColor
  );
};

const PulleyDrawingArea: React.FC<PulleyDrawingAreaProps> = ({ parameters, view, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const isDarkMode = document.documentElement.classList.contains('dark');
  const strokeColor = isDarkMode ? "#aaa" : "#333";
  
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!containerRef.current || containerSize.width === 0) return;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", containerSize.width.toString());
    svg.setAttribute("height", containerSize.height.toString());
    svg.style.overflow = "visible";
    
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(svg);

    const { diameter, thickness } = parameters;
    const padding = 100;
    const dimensionSpacing = 40;
    
    const maxDimension = Math.max(diameter, view === "side" ? thickness : diameter);
    const scaleFactor = Math.min(
      (containerSize.width - 2 * padding) / maxDimension,
      (containerSize.height - 2 * padding) / maxDimension
    ) * 0.8;
    
    const scaledDiameter = diameter * scaleFactor;
    const scaledThickness = thickness * scaleFactor;
    const scaledBoreDiameter = parameters.boreDiameter * scaleFactor;
    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;
    
    if (view === "top") {
      drawTopView(svg, centerX, centerY, scaledDiameter, scaledBoreDiameter, parameters, dimensionSpacing, scaleFactor, strokeColor);
    } else {
      drawSideView(svg, centerX, centerY, scaledDiameter, scaledThickness, scaledBoreDiameter, parameters, dimensionSpacing, scaleFactor, strokeColor);
    }

    // ISO grid
    const gridSize = 10 * scaleFactor;
    const gridPattern = document.createElementNS(svgNS, "pattern");
    gridPattern.setAttribute("id", "isoGrid");
    gridPattern.setAttribute("width", gridSize.toString());
    gridPattern.setAttribute("height", gridSize.toString());
    gridPattern.setAttribute("patternUnits", "userSpaceOnUse");

    const gridLine = document.createElementNS(svgNS, "path");
    gridLine.setAttribute("d", `M ${gridSize} 0 L 0 0 0 ${gridSize}`);
    gridLine.setAttribute("fill", "none");
    gridLine.setAttribute("stroke", isDarkMode ? "#333" : "#eee");
    gridLine.setAttribute("stroke-width", "0.5");
    
    gridPattern.appendChild(gridLine);
    svg.appendChild(gridPattern);

    const gridBackground = document.createElementNS(svgNS, "rect");
    gridBackground.setAttribute("width", "100%");
    gridBackground.setAttribute("height", "100%");
    gridBackground.setAttribute("fill", "url(#isoGrid)");
    svg.insertBefore(gridBackground, svg.firstChild);

  }, [parameters, containerSize, view, isDarkMode, strokeColor]);

  return (
    <div 
      ref={containerRef} 
      className={`min-h-[500px] drawing-container ${className}`}
      style={{ transition: "all 0.3s ease" }}
    />
  );
};

export default PulleyDrawingArea;