
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

  // Add grid background (no-op placeholder)
  const addGridBackground = (svg: SVGSVGElement, containerSize: { width: number; height: number }) => {
    // Grid background implementation can be added here if needed
    return;
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
    const padding = 150; // Increased padding for better dimension visibility
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
      drawTopView(newSvg, centerX, centerY, scaledDiameter, scaledBoreDiameter, parameters, scaleFactor);
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
    originalParams: PulleyParameters,
    scaleFactor: number
  ) => {
    const svgNS = "http://www.w3.org/2000/svg";
    const radius = scaledDiameter / 2;
    const boreRadius = scaledBoreDiameter / 2;
    const { unit } = originalParams;
    const isDarkMode = document.documentElement.classList.contains('dark');
    const strokeColor = isDarkMode ? "#ddd" : "#333";
    const textColor = isDarkMode ? "#fff" : "#333";
    const fillColor = isDarkMode ? "#333" : "white";
    
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
    
    // Add keyway to the bore (properly positioned at the bore edge)
    const keyWayWidth = boreRadius * 0.5;
    const keyWayHeight = boreRadius * 0.2;
    
    // Create keyway - make it touch the bore without gap
    const keyWay = document.createElementNS(svgNS, "rect");
    keyWay.setAttribute("x", (centerX - keyWayWidth/2).toString());
    keyWay.setAttribute("y", (centerY - boreRadius).toString()); // Position exactly at bore edge
    keyWay.setAttribute("width", keyWayWidth.toString());
    keyWay.setAttribute("height", keyWayHeight.toString());
    keyWay.setAttribute("fill", fillColor);
    keyWay.setAttribute("stroke", strokeColor);
    keyWay.setAttribute("stroke-width", "1");
    svg.appendChild(keyWay);
    
    // Add diameter dimension line (horizontal) - increased spacing
    const dimLineY = centerY + radius + 80; // Increased spacing
    
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
    
    // Arrow heads for dimension line
    // Left arrow
    const leftArrow = document.createElementNS(svgNS, "polygon");
    leftArrow.setAttribute("points", `${centerX - radius},${dimLineY} ${centerX - radius + 6},${dimLineY - 3} ${centerX - radius + 6},${dimLineY + 3}`);
    leftArrow.setAttribute("fill", strokeColor);
    svg.appendChild(leftArrow);
    
    // Right arrow
    const rightArrow = document.createElementNS(svgNS, "polygon");
    rightArrow.setAttribute("points", `${centerX + radius},${dimLineY} ${centerX + radius - 6},${dimLineY - 3} ${centerX + radius - 6},${dimLineY + 3}`);
    rightArrow.setAttribute("fill", strokeColor);
    svg.appendChild(rightArrow);
    
    // Dimension value - background for better visibility
    const textBg = document.createElementNS(svgNS, "rect");
    const textWidth = 90;
    const textHeight = 18;
    textBg.setAttribute("x", (centerX - textWidth/2).toString());
    textBg.setAttribute("y", (dimLineY - textHeight - 2).toString());
    textBg.setAttribute("width", textWidth.toString());
    textBg.setAttribute("height", textHeight.toString());
    textBg.setAttribute("rx", "4");
    textBg.setAttribute("ry", "4");
    textBg.setAttribute("fill", fillColor);
    textBg.setAttribute("fill-opacity", "0.9");
    svg.appendChild(textBg);
    
    // Dimension value text
    const diameterText = document.createElementNS(svgNS, "text");
    diameterText.setAttribute("x", centerX.toString());
    diameterText.setAttribute("y", (dimLineY - 10).toString());
    diameterText.setAttribute("text-anchor", "middle");
    diameterText.setAttribute("font-family", "Inter, system-ui, sans-serif");
    diameterText.setAttribute("font-size", "12");
    diameterText.setAttribute("fill", textColor);
    diameterText.textContent = `Ø${originalParams.diameter} ${unit}`;
    svg.appendChild(diameterText);
    
    // Add bore dimension - background for better visibility
    const boreBg = document.createElementNS(svgNS, "rect");
    const boreTextWidth = 80;
    const boreTextHeight = 18;
    boreBg.setAttribute("x", (centerX - boreTextWidth/2).toString());
    boreBg.setAttribute("y", (centerY - boreTextHeight/2).toString());
    boreBg.setAttribute("width", boreTextWidth.toString());
    boreBg.setAttribute("height", boreTextHeight.toString());
    boreBg.setAttribute("rx", "4");
    boreBg.setAttribute("ry", "4");
    boreBg.setAttribute("fill", fillColor);
    boreBg.setAttribute("fill-opacity", "0.9");
    svg.appendChild(boreBg);
    
    // Bore text
    const boreText = document.createElementNS(svgNS, "text");
    boreText.setAttribute("x", centerX.toString());
    boreText.setAttribute("y", (centerY + 5).toString());
    boreText.setAttribute("text-anchor", "middle");
    boreText.setAttribute("font-family", "Inter, system-ui, sans-serif");
    boreText.setAttribute("font-size", "12");
    boreText.setAttribute("fill", textColor);
    boreText.textContent = `Ø${originalParams.boreDiameter} ${unit}`;
    svg.appendChild(boreText);
    
    // Add keyway dimension - with spacing for clarity
    const keyDimLineY = centerY - radius - 60; // Position above the pulley
    
    // Keyway dimension line
    const keyDimLine = document.createElementNS(svgNS, "line");
    keyDimLine.setAttribute("x1", (centerX - keyWayWidth/2).toString());
    keyDimLine.setAttribute("y1", keyDimLineY.toString());
    keyDimLine.setAttribute("x2", (centerX + keyWayWidth/2).toString());
    keyDimLine.setAttribute("y2", keyDimLineY.toString());
    keyDimLine.setAttribute("stroke", strokeColor);
    keyDimLine.setAttribute("stroke-width", "1");
    svg.appendChild(keyDimLine);
    
    // Keyway extension lines
    const keyExtLine1 = document.createElementNS(svgNS, "line");
    keyExtLine1.setAttribute("x1", (centerX - keyWayWidth/2).toString());
    keyExtLine1.setAttribute("y1", (centerY - boreRadius).toString());
    keyExtLine1.setAttribute("x2", (centerX - keyWayWidth/2).toString());
    keyExtLine1.setAttribute("y2", keyDimLineY.toString());
    keyExtLine1.setAttribute("stroke", strokeColor);
    keyExtLine1.setAttribute("stroke-width", "0.75");
    keyExtLine1.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(keyExtLine1);
    
    const keyExtLine2 = document.createElementNS(svgNS, "line");
    keyExtLine2.setAttribute("x1", (centerX + keyWayWidth/2).toString());
    keyExtLine2.setAttribute("y1", (centerY - boreRadius).toString());
    keyExtLine2.setAttribute("x2", (centerX + keyWayWidth/2).toString());
    keyExtLine2.setAttribute("y2", keyDimLineY.toString());
    keyExtLine2.setAttribute("stroke", strokeColor);
    keyExtLine2.setAttribute("stroke-width", "0.75");
    keyExtLine2.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(keyExtLine2);
    
    // Arrow heads for keyway dimension
    const keyLeftArrow = document.createElementNS(svgNS, "polygon");
    keyLeftArrow.setAttribute("points", `${centerX - keyWayWidth/2},${keyDimLineY} ${centerX - keyWayWidth/2 + 6},${keyDimLineY - 3} ${centerX - keyWayWidth/2 + 6},${keyDimLineY + 3}`);
    keyLeftArrow.setAttribute("fill", strokeColor);
    svg.appendChild(keyLeftArrow);
    
    const keyRightArrow = document.createElementNS(svgNS, "polygon");
    keyRightArrow.setAttribute("points", `${centerX + keyWayWidth/2},${keyDimLineY} ${centerX + keyWayWidth/2 - 6},${keyDimLineY - 3} ${centerX + keyWayWidth/2 - 6},${keyDimLineY + 3}`);
    keyRightArrow.setAttribute("fill", strokeColor);
    svg.appendChild(keyRightArrow);
    
    // Keyway dimension text background
    const keyTextBg = document.createElementNS(svgNS, "rect");
    const keyTextWidth = 60;
    const keyTextHeight = 18;
    keyTextBg.setAttribute("x", (centerX - keyTextWidth/2).toString());
    keyTextBg.setAttribute("y", (keyDimLineY - keyTextHeight - 2).toString());
    keyTextBg.setAttribute("width", keyTextWidth.toString());
    keyTextBg.setAttribute("height", keyTextHeight.toString());
    keyTextBg.setAttribute("rx", "4");
    keyTextBg.setAttribute("ry", "4");
    keyTextBg.setAttribute("fill", fillColor);
    keyTextBg.setAttribute("fill-opacity", "0.9");
    svg.appendChild(keyTextBg);
    
    // Keyway dimension text
    const keyText = document.createElementNS(svgNS, "text");
    keyText.setAttribute("x", centerX.toString());
    keyText.setAttribute("y", (keyDimLineY - 10).toString());
    keyText.setAttribute("text-anchor", "middle");
    keyText.setAttribute("font-family", "Inter, system-ui, sans-serif");
    keyText.setAttribute("font-size", "12");
    keyText.setAttribute("fill", textColor);
    keyText.textContent = `Key: ${Math.round(keyWayWidth / scaleFactor)} ${unit}`;
    svg.appendChild(keyText);
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
    const isDarkMode = document.documentElement.classList.contains('dark');
    const strokeColor = isDarkMode ? "#ddd" : "#333";
    const textColor = isDarkMode ? "#fff" : "#333";
    const fillColor = isDarkMode ? "#333" : "white";
    const accentColor = isDarkMode ? "#60a5fa" : "#3b82f6"; // Blue that works in both modes
    
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
        M ${cylinderLeft} ${cylinderTop + radius}
        Q ${cylinderLeft} ${cylinderTop}, ${cylinderLeft + radius} ${cylinderTop}
        L ${cylinderRight - radius} ${cylinderTop}
        Q ${cylinderRight} ${cylinderTop}, ${cylinderRight} ${cylinderTop + radius}
        L ${cylinderRight} ${cylinderBottom - radius}
        Q ${cylinderRight} ${cylinderBottom}, ${cylinderRight - radius} ${cylinderBottom}
        L ${cylinderLeft + radius} ${cylinderBottom}
        Q ${cylinderLeft} ${cylinderBottom}, ${cylinderLeft} ${cylinderBottom - radius}
        Z
      `;
      
      cylinderPath.setAttribute("d", d);
      cylinderPath.setAttribute("fill", fillColor);
      cylinderPath.setAttribute("stroke", strokeColor);
      cylinderPath.setAttribute("stroke-width", "1.5");
      svg.appendChild(cylinderPath);
      
      // Draw the bore hole (center line)
      const boreLine = document.createElementNS(svgNS, "line");
      boreLine.setAttribute("x1", cylinderLeft.toString());
      boreLine.setAttribute("y1", centerY.toString());
      boreLine.setAttribute("x2", cylinderRight.toString());
      boreLine.setAttribute("y2", centerY.toString());
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
      
      // Create inner diameter (where v-groove extends to)
      const innerDiameter = scaledDiameter * 0.7; // 70% of outer diameter
      const innerRadius = innerDiameter / 2;
      
      // Draw the outer shape (rectangle with rounded ends)
      const pulleyPath = document.createElementNS(svgNS, "path");
      
      // Create path for pulley with rounded corners
      const d = `
        M ${rectX} ${rectY + radius}
        Q ${rectX} ${rectY}, ${rectX + radius} ${rectY}
        L ${rectX + scaledThickness - radius} ${rectY}
        Q ${rectX + scaledThickness} ${rectY}, ${rectX + scaledThickness} ${rectY + radius}
        L ${rectX + scaledThickness} ${rectY + rectHeight - radius}
        Q ${rectX + scaledThickness} ${rectY + rectHeight}, ${rectX + scaledThickness - radius} ${rectY + rectHeight}
        L ${rectX + radius} ${rectY + rectHeight}
        Q ${rectX} ${rectY + rectHeight}, ${rectX} ${rectY + rectHeight - radius}
        Z
      `;
      
      pulleyPath.setAttribute("d", d);
      pulleyPath.setAttribute("fill", fillColor);
      pulleyPath.setAttribute("stroke", strokeColor);
      pulleyPath.setAttribute("stroke-width", "1.5");
      svg.appendChild(pulleyPath);
      
      // Add V-groove
      const grooveDepth = Math.min(radius * 0.3, 20);
      const grooveWidth = Math.min(scaledThickness * 0.6, grooveDepth * 2);
      
      // Create V-groove path
      const groovePath = document.createElementNS(svgNS, "path");
      const grooveX = centerX;
      const grooveTopY = centerY - grooveDepth;
      const grooveBottomY = centerY + grooveDepth;
      
      // Draw the V-groove (top part)
      const grooveD = `
        M ${centerX - grooveWidth/2} ${centerY - innerRadius}
        L ${centerX} ${centerY}
        L ${centerX + grooveWidth/2} ${centerY - innerRadius}
      `;
      
      groovePath.setAttribute("d", grooveD);
      groovePath.setAttribute("fill", "none");
      groovePath.setAttribute("stroke", accentColor);
      groovePath.setAttribute("stroke-width", "1.5");
      svg.appendChild(groovePath);
      
      // Draw the V-groove (bottom part)
      const groovePath2 = document.createElementNS(svgNS, "path");
      const grooveD2 = `
        M ${centerX - grooveWidth/2} ${centerY + innerRadius}
        L ${centerX} ${centerY}
        L ${centerX + grooveWidth/2} ${centerY + innerRadius}
      `;
      
      groovePath2.setAttribute("d", grooveD2);
      groovePath2.setAttribute("fill", "none");
      groovePath2.setAttribute("stroke", accentColor);
      groovePath2.setAttribute("stroke-width", "1.5");
      svg.appendChild(groovePath2);
      
      // Draw inner radius lines (dashed)
      const innerTopLine = document.createElementNS(svgNS, "line");
      innerTopLine.setAttribute("x1", rectX.toString());
      innerTopLine.setAttribute("y1", (centerY - innerRadius).toString());
      innerTopLine.setAttribute("x2", (rectX + scaledThickness).toString());
      innerTopLine.setAttribute("y2", (centerY - innerRadius).toString());
      innerTopLine.setAttribute("stroke", strokeColor);
      innerTopLine.setAttribute("stroke-width", "1");
      innerTopLine.setAttribute("stroke-dasharray", "4 2");
      svg.appendChild(innerTopLine);
      
      const innerBottomLine = document.createElementNS(svgNS, "line");
      innerBottomLine.setAttribute("x1", rectX.toString());
      innerBottomLine.setAttribute("y1", (centerY + innerRadius).toString());
      innerBottomLine.setAttribute("x2", (rectX + scaledThickness).toString());
      innerBottomLine.setAttribute("y2", (centerY + innerRadius).toString());
      innerBottomLine.setAttribute("stroke", strokeColor);
      innerBottomLine.setAttribute("stroke-width", "1");
      innerBottomLine.setAttribute("stroke-dasharray", "4 2");
      svg.appendChild(innerBottomLine);
      
      // Draw the bore hole (center line)
      const boreLine = document.createElementNS(svgNS, "line");
      boreLine.setAttribute("x1", rectX.toString());
      boreLine.setAttribute("y1", centerY.toString());
      boreLine.setAttribute("x2", (rectX + scaledThickness).toString());
      boreLine.setAttribute("y2", centerY.toString());
      boreLine.setAttribute("stroke", strokeColor);
      boreLine.setAttribute("stroke-width", "1.5");
      boreLine.setAttribute("stroke-dasharray", "4 2");
      svg.appendChild(boreLine);
      
      // Add keyway to the bore (matching the keyway in top view)
      // Keyway is shown as a small rectangle at the top of the bore line
      const keyWayWidth = scaledThickness * 0.5; // Width of keyway along the shaft
      const keyWayHeight = boreRadius * 0.2; // Height of keyway (matching top view)
      
      // Create keyway without gap - directly from the bore line
      const keyWay = document.createElementNS(svgNS, "rect");
      keyWay.setAttribute("x", (centerX - keyWayWidth/2).toString());
      keyWay.setAttribute("y", (centerY - boreRadius).toString()); // Position exactly at bore edge
      keyWay.setAttribute("width", keyWayWidth.toString());
      keyWay.setAttribute("height", keyWayHeight.toString());
      keyWay.setAttribute("fill", fillColor);
      keyWay.setAttribute("stroke", strokeColor);
      keyWay.setAttribute("stroke-width", "1");
      svg.appendChild(keyWay);
    }
    
    // Improved dimension spacing - use wider spacing to prevent overlap
    // Add thickness dimension at the top with more space
    // Background for better visibility
    const thicknessBg = document.createElementNS(svgNS, "rect");
    const thicknessTextWidth = 80;
    const thicknessTextHeight = 18;
    thicknessBg.setAttribute("x", (centerX - thicknessTextWidth/2).toString());
    thicknessBg.setAttribute("y", (centerY - radius - 50).toString()); // More space
    thicknessBg.setAttribute("width", thicknessTextWidth.toString());
    thicknessBg.setAttribute("height", thicknessTextHeight.toString());
    thicknessBg.setAttribute("rx", "4");
    thicknessBg.setAttribute("ry", "4");
    thicknessBg.setAttribute("fill", fillColor);
    thicknessBg.setAttribute("fill-opacity", "0.9");
    svg.appendChild(thicknessBg);
    
    // Thickness dimension text
    const thicknessLabel = document.createElementNS(svgNS, "text");
    thicknessLabel.setAttribute("x", centerX.toString());
    thicknessLabel.setAttribute("y", (centerY - radius - 38).toString()); // More space
    thicknessLabel.setAttribute("text-anchor", "middle");
    thicknessLabel.setAttribute("font-family", "Inter, system-ui, sans-serif");
    thicknessLabel.setAttribute("font-size", "12");
    thicknessLabel.setAttribute("fill", textColor);
    thicknessLabel.textContent = `${originalParams.thickness} ${unit}`;
    svg.appendChild(thicknessLabel);
    
    // Draw thickness dimension line
    const thicknessDimLine = document.createElementNS(svgNS, "line");
    thicknessDimLine.setAttribute("x1", (centerX - scaledThickness/2).toString());
    thicknessDimLine.setAttribute("y1", (centerY - radius - 25).toString()); // More space
    thicknessDimLine.setAttribute("x2", (centerX + scaledThickness/2).toString());
    thicknessDimLine.setAttribute("y2", (centerY - radius - 25).toString()); // More space
    thicknessDimLine.setAttribute("stroke", strokeColor);
    thicknessDimLine.setAttribute("stroke-width", "1");
    svg.appendChild(thicknessDimLine);
    
    // Arrow heads for thickness line
    // Left arrow
    const thicknessLeftArrow = document.createElementNS(svgNS, "polygon");
    thicknessLeftArrow.setAttribute("points", 
      `${centerX - scaledThickness/2},${centerY - radius - 25} ` + 
      `${centerX - scaledThickness/2 + 6},${centerY - radius - 28} ` + 
      `${centerX - scaledThickness/2 + 6},${centerY - radius - 22}`
    );
    thicknessLeftArrow.setAttribute("fill", strokeColor);
    svg.appendChild(thicknessLeftArrow);
    
    // Right arrow
    const thicknessRightArrow = document.createElementNS(svgNS, "polygon");
    thicknessRightArrow.setAttribute("points", 
      `${centerX + scaledThickness/2},${centerY - radius - 25} ` + 
      `${centerX + scaledThickness/2 - 6},${centerY - radius - 28} ` + 
      `${centerX + scaledThickness/2 - 6},${centerY - radius - 22}`
    );
    thicknessRightArrow.setAttribute("fill", strokeColor);
    svg.appendChild(thicknessRightArrow);
    
    // Add thickness extension lines
    const thicknessExtLine1 = document.createElementNS(svgNS, "line");
    thicknessExtLine1.setAttribute("x1", (centerX - scaledThickness/2).toString());
    thicknessExtLine1.setAttribute("y1", (centerY - radius).toString());
    thicknessExtLine1.setAttribute("x2", (centerX - scaledThickness/2).toString());
    thicknessExtLine1.setAttribute("y2", (centerY - radius - 25).toString()); // More space
    thicknessExtLine1.setAttribute("stroke", strokeColor);
    thicknessExtLine1.setAttribute("stroke-width", "0.75");
    thicknessExtLine1.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(thicknessExtLine1);
    
    const thicknessExtLine2 = document.createElementNS(svgNS, "line");
    thicknessExtLine2.setAttribute("x1", (centerX + scaledThickness/2).toString());
    thicknessExtLine2.setAttribute("y1", (centerY - radius).toString());
    thicknessExtLine2.setAttribute("x2", (centerX + scaledThickness/2).toString());
    thicknessExtLine2.setAttribute("y2", (centerY - radius - 25).toString()); // More space
    thicknessExtLine2.setAttribute("stroke", strokeColor);
    thicknessExtLine2.setAttribute("stroke-width", "0.75");
    thicknessExtLine2.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(thicknessExtLine2);
    
    // Add diameter dimension on right side - with MORE space to prevent overlap
    // Background for better visibility
    const diameterBg = document.createElementNS(svgNS, "rect");
    const diameterTextWidth = 80;
    const diameterTextHeight = 18;
    diameterBg.setAttribute("x", (centerX + scaledThickness/2 + 45).toString()); // Much more space
    diameterBg.setAttribute("y", (centerY - diameterTextHeight/2).toString());
    diameterBg.setAttribute("width", diameterTextWidth.toString());
    diameterBg.setAttribute("height", diameterTextHeight.toString());
    diameterBg.setAttribute("rx", "4");
    diameterBg.setAttribute("ry", "4");
    diameterBg.setAttribute("fill", fillColor);
    diameterBg.setAttribute("fill-opacity", "0.9");
    svg.appendChild(diameterBg);
    
    // Diameter dimension text
    const diameterLabel = document.createElementNS(svgNS, "text");
    diameterLabel.setAttribute("x", (centerX + scaledThickness/2 + 45 + diameterTextWidth/2).toString());
    diameterLabel.setAttribute("y", (centerY + 5).toString());
    diameterLabel.setAttribute("text-anchor", "middle");
    diameterLabel.setAttribute("font-family", "Inter, system-ui, sans-serif");
    diameterLabel.setAttribute("font-size", "12");
    diameterLabel.setAttribute("fill", textColor);
    diameterLabel.textContent = `Ø${originalParams.diameter} ${unit}`;
    svg.appendChild(diameterLabel);
    
    // Add diameter dimension line
    const diameterDimLine = document.createElementNS(svgNS, "line");
    diameterDimLine.setAttribute("x1", (centerX + scaledThickness/2 + 25).toString());
    diameterDimLine.setAttribute("y1", (centerY - radius).toString());
    diameterDimLine.setAttribute("x2", (centerX + scaledThickness/2 + 25).toString());
    diameterDimLine.setAttribute("y2", (centerY + radius).toString());
    diameterDimLine.setAttribute("stroke", strokeColor);
    diameterDimLine.setAttribute("stroke-width", "1");
    svg.appendChild(diameterDimLine);
    
    // Arrow heads for diameter line
    // Top arrow
    const diameterTopArrow = document.createElementNS(svgNS, "polygon");
    diameterTopArrow.setAttribute("points", 
      `${centerX + scaledThickness/2 + 25},${centerY - radius} ` + 
      `${centerX + scaledThickness/2 + 28},${centerY - radius + 6} ` + 
      `${centerX + scaledThickness/2 + 22},${centerY - radius + 6}`
    );
    diameterTopArrow.setAttribute("fill", strokeColor);
    svg.appendChild(diameterTopArrow);
    
    // Bottom arrow
    const diameterBottomArrow = document.createElementNS(svgNS, "polygon");
    diameterBottomArrow.setAttribute("points", 
      `${centerX + scaledThickness/2 + 25},${centerY + radius} ` + 
      `${centerX + scaledThickness/2 + 28},${centerY + radius - 6} ` + 
      `${centerX + scaledThickness/2 + 22},${centerY + radius - 6}`
    );
    diameterBottomArrow.setAttribute("fill", strokeColor);
    svg.appendChild(diameterBottomArrow);
    
    // Add diameter extension lines
    const diameterExtLine1 = document.createElementNS(svgNS, "line");
    diameterExtLine1.setAttribute("x1", (centerX + scaledThickness/2).toString());
    diameterExtLine1.setAttribute("y1", (centerY - radius).toString());
    diameterExtLine1.setAttribute("x2", (centerX + scaledThickness/2 + 25).toString());
    diameterExtLine1.setAttribute("y2", (centerY - radius).toString());
    diameterExtLine1.setAttribute("stroke", strokeColor);
    diameterExtLine1.setAttribute("stroke-width", "0.75");
    diameterExtLine1.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(diameterExtLine1);
    
    const diameterExtLine2 = document.createElementNS(svgNS, "line");
    diameterExtLine2.setAttribute("x1", (centerX + scaledThickness/2).toString());
    diameterExtLine2.setAttribute("y1", (centerY + radius).toString());
    diameterExtLine2.setAttribute("x2", (centerX + scaledThickness/2 + 25).toString());
    diameterExtLine2.setAttribute("y2", (centerY + radius).toString());
    diameterExtLine2.setAttribute("stroke", strokeColor);
    diameterExtLine2.setAttribute("stroke-width", "0.75");
    diameterExtLine2.setAttribute("stroke-dasharray", "4 2");
    svg.appendChild(diameterExtLine2);
    
    // Add bore dimension on left side with spacing
    // Background for better visibility
    const boreBg = document.createElementNS(svgNS, "rect");
    const boreTextWidth = 80;
    const boreTextHeight = 18;
    boreBg.setAttribute("x", (centerX - scaledThickness/2 - 45 - boreTextWidth).toString());
    boreBg.setAttribute("y", (centerY - boreTextHeight/2).toString());
    boreBg.setAttribute("width", boreTextWidth.toString());
    boreBg.setAttribute("height", boreTextHeight.toString());
    boreBg.setAttribute("rx", "4");
    boreBg.setAttribute("ry", "4");
    boreBg.setAttribute("fill", fillColor);
    boreBg.setAttribute("fill-opacity", "0.9");
    svg.appendChild(boreBg);
    
    // Bore dimension text
    const boreLabel = document.createElementNS(svgNS, "text");
    boreLabel.setAttribute("x", (centerX - scaledThickness/2 - 45 - boreTextWidth/2).toString());
    boreLabel.setAttribute("y", (centerY + 5).toString());
    boreLabel.setAttribute("text-anchor", "middle");
    boreLabel.setAttribute("font-family", "Inter, system-ui, sans-serif");
    boreLabel.setAttribute("font-size", "12");
    boreLabel.setAttribute("fill", textColor);
    boreLabel.textContent = `Ø${originalParams.boreDiameter} ${unit}`;
    svg.appendChild(boreLabel);
  };

  return <div ref={containerRef} className={className} style={{ width: '100%', height: '100%', minHeight: 400 }} />;
};

export default PulleyDrawingArea;
