
import React from "react";
import { DrawingViewProps } from "./types";

export const drawSideView = (
  svg: SVGSVGElement, 
  centerX: number,
  centerY: number,
  scaledDiameter: number,
  scaledThickness: number,
  scaledBoreDiameter: number,
  originalParams: { diameter: number; thickness: number; boreDiameter: number; unit: string },
  isDarkMode: boolean
): void => {
  const svgNS = "http://www.w3.org/2000/svg";
  const radius = scaledDiameter / 2;
  const boreRadius = scaledBoreDiameter / 2;
  const { unit } = originalParams;
  const strokeColor = isDarkMode ? "#ddd" : "#333";
  const textColor = isDarkMode ? "#fff" : "#333";
  const fillColor = isDarkMode ? "#333" : "white";
  const accentColor = isDarkMode ? "#60a5fa" : "#3b82f6"; // Blue that works in both modes
  
  // Check if we're on the idler page
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
