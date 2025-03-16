
import React, { useRef, useEffect, useState } from "react";

interface PulleyParameters {
  diameter: number;
  thickness: number;
  boreDiameter: number;
  unit: "mm" | "cm" | "m" | "in";
}

interface PulleyDrawingAreaProps {
  parameters: PulleyParameters;
  view: "top" | "side";
  className?: string;
}

const PulleyDrawingArea: React.FC<PulleyDrawingAreaProps> = ({ 
  parameters, 
  view,
  className 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<SVGSVGElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const isDarkMode = document.documentElement.classList.contains('dark');
  
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

  // Update on theme change
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' && 
            containerRef.current && 
            containerSize.width > 0) {
          // Redraw when theme changes
          drawSvg();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, [containerSize, parameters, view]);

  // Format value with unit
  const formatWithUnit = (value: number, unit: string) => {
    return `${value} ${unit}`;
  };

  // Create or update SVG drawing
  const drawSvg = () => {
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
    const { diameter, thickness, boreDiameter, unit } = parameters;
    
    // Calculate scale factor
    const padding = 60; // Padding for dimensions and labels
    const availableWidth = containerSize.width - padding * 2;
    const availableHeight = containerSize.height - padding * 2;
    
    let scaleFactor: number;
    
    if (view === "top") {
      // For top view, scale based on diameter
      scaleFactor = availableWidth / diameter;
    } else {
      // For side view, scale based on both diameter and thickness
      scaleFactor = Math.min(availableHeight / diameter, availableWidth / thickness);
    }
    
    // Apply scale factor
    const scaledDiameter = diameter * scaleFactor;
    const scaledThickness = thickness * scaleFactor;
    const scaledBoreDiameter = boreDiameter * scaleFactor;
    
    // Position drawing in center of container
    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;
    
    // Draw based on active view
    if (view === "top") {
      drawTopView(newSvg, centerX, centerY, scaledDiameter, scaledBoreDiameter, parameters);
    } else {
      drawSideView(newSvg, centerX, centerY, scaledDiameter, scaledThickness, scaledBoreDiameter, parameters);
    }
    
    // Add grid background
    addGridBackground(newSvg, containerSize);
  };

  // Create or update SVG drawing
  useEffect(() => {
    drawSvg();
    
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [parameters, containerSize, view]);

  // Draw top view (circle)
  const drawTopView = (
    svg: SVGSVGElement, 
    centerX: number,
    centerY: number,
    scaledDiameter: number,
    scaledBoreDiameter: number,
    originalParams: PulleyParameters
  ) => {
    const svgNS = "http://www.w3.org/2000/svg";
    const radius = scaledDiameter / 2;
    const boreRadius = scaledBoreDiameter / 2;
    const { unit } = originalParams;
    const strokeColor = isDarkMode ? "#aaa" : "#333";
    const textColor = isDarkMode ? "#ddd" : "#333";
    const fillColor = isDarkMode ? "#222" : "white";
    
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
    
    // Create outer circle
    const outerCircle = document.createElementNS(svgNS, "circle");
    outerCircle.setAttribute("cx", centerX.toString());
    outerCircle.setAttribute("cy", centerY.toString());
    outerCircle.setAttribute("r", radius.toString());
    outerCircle.setAttribute("fill", fillColor);
    outerCircle.setAttribute("stroke", strokeColor);
    outerCircle.setAttribute("stroke-width", "1.5");
    outerCircle.setAttribute("filter", "url(#shadow)");
    svg.appendChild(outerCircle);
    
    // Create bore circle
    const boreCircle = document.createElementNS(svgNS, "circle");
    boreCircle.setAttribute("cx", centerX.toString());
    boreCircle.setAttribute("cy", centerY.toString());
    boreCircle.setAttribute("r", boreRadius.toString());
    boreCircle.setAttribute("fill", "none");
    boreCircle.setAttribute("stroke", strokeColor);
    boreCircle.setAttribute("stroke-width", "1.5");
    boreCircle.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(boreCircle);
    
    // Add diameter dimension line
    const dimLineY = centerY + radius + 40;
    
    // Horizontal dimension line
    const horDimLine = document.createElementNS(svgNS, "line");
    horDimLine.setAttribute("x1", (centerX - radius).toString());
    horDimLine.setAttribute("y1", dimLineY.toString());
    horDimLine.setAttribute("x2", (centerX + radius).toString());
    horDimLine.setAttribute("y2", dimLineY.toString());
    horDimLine.setAttribute("stroke", strokeColor);
    horDimLine.setAttribute("stroke-width", "1");
    svg.appendChild(horDimLine);
    
    // Extension lines
    const extLine1 = document.createElementNS(svgNS, "line");
    extLine1.setAttribute("x1", (centerX - radius).toString());
    extLine1.setAttribute("y1", centerY.toString());
    extLine1.setAttribute("x2", (centerX - radius).toString());
    extLine1.setAttribute("y2", dimLineY.toString());
    extLine1.setAttribute("stroke", strokeColor);
    extLine1.setAttribute("stroke-width", "0.75");
    extLine1.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(extLine1);
    
    const extLine2 = document.createElementNS(svgNS, "line");
    extLine2.setAttribute("x1", (centerX + radius).toString());
    extLine2.setAttribute("y1", centerY.toString());
    extLine2.setAttribute("x2", (centerX + radius).toString());
    extLine2.setAttribute("y2", dimLineY.toString());
    extLine2.setAttribute("stroke", strokeColor);
    extLine2.setAttribute("stroke-width", "0.75");
    extLine2.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(extLine2);
    
    // Dimension value
    const diameterText = document.createElementNS(svgNS, "text");
    diameterText.setAttribute("x", centerX.toString());
    diameterText.setAttribute("y", (dimLineY - 10).toString());
    diameterText.setAttribute("text-anchor", "middle");
    diameterText.setAttribute("font-family", "Inter, system-ui, sans-serif");
    diameterText.setAttribute("font-size", "12");
    diameterText.setAttribute("fill", textColor);
    diameterText.textContent = `Ø${originalParams.diameter} ${unit}`;
    svg.appendChild(diameterText);
    
    // Add bore dimension
    const boreText = document.createElementNS(svgNS, "text");
    boreText.setAttribute("x", centerX.toString());
    boreText.setAttribute("y", (centerY + 5).toString());
    boreText.setAttribute("text-anchor", "middle");
    boreText.setAttribute("font-family", "Inter, system-ui, sans-serif");
    boreText.setAttribute("font-size", "12");
    boreText.setAttribute("fill", textColor);
    
    // Add white background for text
    const boreTextBg = document.createElementNS(svgNS, "rect");
    const textWidth = 70;
    boreTextBg.setAttribute("width", textWidth.toString());
    boreTextBg.setAttribute("height", "16");
    boreTextBg.setAttribute("x", (centerX - textWidth/2).toString());
    boreTextBg.setAttribute("y", (centerY - 8).toString());
    boreTextBg.setAttribute("fill", fillColor);
    boreTextBg.setAttribute("fill-opacity", "0.8");
    boreTextBg.setAttribute("rx", "2");
    boreTextBg.setAttribute("ry", "2");
    svg.appendChild(boreTextBg);
    
    boreText.textContent = `Ø${originalParams.boreDiameter} ${unit}`;
    svg.appendChild(boreText);
  };

  // Draw side view (rectangle)
  const drawSideView = (
    svg: SVGSVGElement, 
    centerX: number,
    centerY: number,
    scaledDiameter: number,
    scaledThickness: number,
    scaledBoreDiameter: number,
    originalParams: PulleyParameters
  ) => {
    const svgNS = "http://www.w3.org/2000/svg";
    const radius = scaledDiameter / 2;
    const boreRadius = scaledBoreDiameter / 2;
    const { unit } = originalParams;
    const strokeColor = isDarkMode ? "#aaa" : "#333";
    const textColor = isDarkMode ? "#ddd" : "#333";
    const fillColor = isDarkMode ? "#222" : "white";
    const accentColor = "#3b82f6";
    
    // Create a v-groove pulley or idler shape
    const isIdler = window.location.pathname.includes('idler');
    
    if (isIdler) {
      // For idler: Draw a cylinder with rounded edges (no groove)
      const cylinderPath = document.createElementNS(svgNS, "path");
      
      // Draw the cylinder outer shape
      const cylinderTop = centerY - radius;
      const cylinderBottom = centerY + radius;
      const cylinderLeft = centerX - scaledThickness / 2;
      const cylinderRight = centerX + scaledThickness / 2;
      
      // Create path for cylinder with rounded ends
      const d = `
        M ${cylinderLeft + radius} ${cylinderTop}
        L ${cylinderRight - radius} ${cylinderTop}
        A ${radius} ${radius} 0 0 1 ${cylinderRight - radius} ${cylinderBottom}
        L ${cylinderLeft + radius} ${cylinderBottom}
        A ${radius} ${radius} 0 0 1 ${cylinderLeft + radius} ${cylinderTop}
        Z
      `;
      
      cylinderPath.setAttribute("d", d);
      cylinderPath.setAttribute("fill", fillColor);
      cylinderPath.setAttribute("stroke", strokeColor);
      cylinderPath.setAttribute("stroke-width", "1.5");
      svg.appendChild(cylinderPath);
      
      // Draw the bore hole (center line)
      const boreLine = document.createElementNS(svgNS, "line");
      boreLine.setAttribute("x1", centerX.toString());
      boreLine.setAttribute("y1", (centerY - boreRadius).toString());
      boreLine.setAttribute("x2", centerX.toString());
      boreLine.setAttribute("y2", (centerY + boreRadius).toString());
      boreLine.setAttribute("stroke", strokeColor);
      boreLine.setAttribute("stroke-width", "1.5");
      boreLine.setAttribute("stroke-dasharray", "4 2");
      svg.appendChild(boreLine);
      
    } else {
      // For pulley: Draw a V-groove pulley
      
      // Main body rectangle
      const rectX = centerX - scaledThickness / 2;
      const rectY = centerY - radius;
      const rectHeight = scaledDiameter;
      
      // Draw the outer shape (rectangle with rounded ends)
      const pulleyPath = document.createElementNS(svgNS, "path");
      
      // Calculate V-groove parameters
      const grooveDepth = Math.min(radius * 0.25, 15);
      const grooveWidth = Math.min(scaledThickness * 0.5, grooveDepth * 2);
      
      // Create path for pulley with V-groove
      const d = `
        M ${rectX} ${rectY + radius}
        L ${rectX} ${rectY + rectHeight - radius}
        Q ${rectX} ${rectY + rectHeight} ${rectX + radius} ${rectY + rectHeight}
        L ${rectX + scaledThickness - radius} ${rectY + rectHeight}
        Q ${rectX + scaledThickness} ${rectY + rectHeight} ${rectX + scaledThickness} ${rectY + rectHeight - radius}
        L ${rectX + scaledThickness} ${rectY + radius}
        Q ${rectX + scaledThickness} ${rectY} ${rectX + scaledThickness - radius} ${rectY}
        L ${rectX + radius} ${rectY}
        Q ${rectX} ${rectY} ${rectX} ${rectY + radius}
        Z
      `;
      
      pulleyPath.setAttribute("d", d);
      pulleyPath.setAttribute("fill", fillColor);
      pulleyPath.setAttribute("stroke", strokeColor);
      pulleyPath.setAttribute("stroke-width", "1.5");
      svg.appendChild(pulleyPath);
      
      // Add V-groove
      const groovePath = document.createElementNS(svgNS, "path");
      const grooveX = centerX;
      const grooveTopY = centerY - grooveDepth;
      const grooveBottomY = centerY + grooveDepth;
      
      const grooveD = `
        M ${grooveX - grooveWidth/2} ${grooveTopY}
        L ${grooveX} ${centerY}
        L ${grooveX + grooveWidth/2} ${grooveTopY}
      `;
      
      groovePath.setAttribute("d", grooveD);
      groovePath.setAttribute("fill", "none");
      groovePath.setAttribute("stroke", accentColor);
      groovePath.setAttribute("stroke-width", "1.5");
      svg.appendChild(groovePath);
      
      // Draw the bore hole (center line)
      const boreLine = document.createElementNS(svgNS, "line");
      boreLine.setAttribute("x1", centerX.toString());
      boreLine.setAttribute("y1", (centerY - boreRadius).toString());
      boreLine.setAttribute("x2", centerX.toString());
      boreLine.setAttribute("y2", (centerY + boreRadius).toString());
      boreLine.setAttribute("stroke", strokeColor);
      boreLine.setAttribute("stroke-width", "1.5");
      boreLine.setAttribute("stroke-dasharray", "4 2");
      svg.appendChild(boreLine);
    }
    
    // Add thickness dimension
    const thicknessLabel = document.createElementNS(svgNS, "text");
    thicknessLabel.setAttribute("x", centerX.toString());
    thicknessLabel.setAttribute("y", (centerY - radius - 15).toString());
    thicknessLabel.setAttribute("text-anchor", "middle");
    thicknessLabel.setAttribute("font-family", "Inter, system-ui, sans-serif");
    thicknessLabel.setAttribute("font-size", "12");
    thicknessLabel.setAttribute("fill", textColor);
    thicknessLabel.textContent = `${originalParams.thickness} ${unit}`;
    svg.appendChild(thicknessLabel);
    
    // Draw thickness dimension line
    const thicknessDimLine = document.createElementNS(svgNS, "line");
    thicknessDimLine.setAttribute("x1", (centerX - scaledThickness/2).toString());
    thicknessDimLine.setAttribute("y1", (centerY - radius - 5).toString());
    thicknessDimLine.setAttribute("x2", (centerX + scaledThickness/2).toString());
    thicknessDimLine.setAttribute("y2", (centerY - radius - 5).toString());
    thicknessDimLine.setAttribute("stroke", strokeColor);
    thicknessDimLine.setAttribute("stroke-width", "1");
    svg.appendChild(thicknessDimLine);
    
    // Add thickness extension lines
    const thicknessExtLine1 = document.createElementNS(svgNS, "line");
    thicknessExtLine1.setAttribute("x1", (centerX - scaledThickness/2).toString());
    thicknessExtLine1.setAttribute("y1", centerY - radius);
    thicknessExtLine1.setAttribute("x2", (centerX - scaledThickness/2).toString());
    thicknessExtLine1.setAttribute("y2", (centerY - radius - 5).toString());
    thicknessExtLine1.setAttribute("stroke", strokeColor);
    thicknessExtLine1.setAttribute("stroke-width", "0.75");
    thicknessExtLine1.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(thicknessExtLine1);
    
    const thicknessExtLine2 = document.createElementNS(svgNS, "line");
    thicknessExtLine2.setAttribute("x1", (centerX + scaledThickness/2).toString());
    thicknessExtLine2.setAttribute("y1", centerY - radius);
    thicknessExtLine2.setAttribute("x2", (centerX + scaledThickness/2).toString());
    thicknessExtLine2.setAttribute("y2", (centerY - radius - 5).toString());
    thicknessExtLine2.setAttribute("stroke", strokeColor);
    thicknessExtLine2.setAttribute("stroke-width", "0.75");
    thicknessExtLine2.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(thicknessExtLine2);
    
    // Add height dimension on the side
    const heightDimLine = document.createElementNS(svgNS, "line");
    const dimLineX = centerX - scaledThickness/2 - 20;
    heightDimLine.setAttribute("x1", dimLineX.toString());
    heightDimLine.setAttribute("y1", centerY - radius);
    heightDimLine.setAttribute("x2", dimLineX.toString());
    heightDimLine.setAttribute("y2", centerY + radius);
    heightDimLine.setAttribute("stroke", strokeColor);
    heightDimLine.setAttribute("stroke-width", "1");
    svg.appendChild(heightDimLine);
    
    // Add height extension lines
    const heightExtLine1 = document.createElementNS(svgNS, "line");
    heightExtLine1.setAttribute("x1", centerX - scaledThickness/2);
    heightExtLine1.setAttribute("y1", centerY - radius);
    heightExtLine1.setAttribute("x2", dimLineX.toString());
    heightExtLine1.setAttribute("y2", centerY - radius);
    heightExtLine1.setAttribute("stroke", strokeColor);
    heightExtLine1.setAttribute("stroke-width", "0.75");
    heightExtLine1.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(heightExtLine1);
    
    const heightExtLine2 = document.createElementNS(svgNS, "line");
    heightExtLine2.setAttribute("x1", centerX - scaledThickness/2);
    heightExtLine2.setAttribute("y1", centerY + radius);
    heightExtLine2.setAttribute("x2", dimLineX.toString());
    heightExtLine2.setAttribute("y2", centerY + radius);
    heightExtLine2.setAttribute("stroke", strokeColor);
    heightExtLine2.setAttribute("stroke-width", "0.75");
    heightExtLine2.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(heightExtLine2);
    
    // Add height dimension text
    const heightText = document.createElementNS(svgNS, "text");
    heightText.setAttribute("x", (dimLineX - 10).toString());
    heightText.setAttribute("y", centerY.toString());
    heightText.setAttribute("text-anchor", "middle");
    heightText.setAttribute("font-family", "Inter, system-ui, sans-serif");
    heightText.setAttribute("font-size", "12");
    heightText.setAttribute("fill", textColor);
    heightText.setAttribute("transform", `rotate(-90 ${dimLineX - 10} ${centerY})`);
    heightText.textContent = `Ø${originalParams.diameter} ${unit}`;
    svg.appendChild(heightText);
  };

  // Add grid background to drawing
  const addGridBackground = (svg: SVGSVGElement, containerSize: { width: number; height: number }) => {
    const svgNS = "http://www.w3.org/2000/svg";
    const isDarkMode = document.documentElement.classList.contains('dark');
    const gridColor = isDarkMode ? "rgba(50, 50, 50, 0.3)" : "rgba(240, 240, 240, 0.3)";
    
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
    hLine.setAttribute("stroke", gridColor);
    hLine.setAttribute("stroke-width", "0.5");
    pattern.appendChild(hLine);
    
    // Vertical line
    const vLine = document.createElementNS(svgNS, "line");
    vLine.setAttribute("x1", "20");
    vLine.setAttribute("y1", "0");
    vLine.setAttribute("x2", "20");
    vLine.setAttribute("y2", "20");
    vLine.setAttribute("stroke", gridColor);
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
      className={`min-h-[500px] drawing-container ${className}`}
      style={{ transition: "all 0.3s ease" }}
    />
  );
};

export default PulleyDrawingArea;
