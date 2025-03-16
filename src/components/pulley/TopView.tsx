
import React from "react";
import { DrawingViewProps } from "./types";

export const drawTopView = (
  svg: SVGSVGElement, 
  centerX: number,
  centerY: number,
  scaledDiameter: number,
  scaledBoreDiameter: number,
  originalParams: { diameter: number; boreDiameter: number; unit: string },
  scaleFactor: number,
  isDarkMode: boolean
): void => {
  const svgNS = "http://www.w3.org/2000/svg";
  const radius = scaledDiameter / 2;
  const boreRadius = scaledBoreDiameter / 2;
  const { unit } = originalParams;
  const strokeColor = isDarkMode ? "#ddd" : "#333";
  const textColor = isDarkMode ? "#fff" : "#333";
  const fillColor = isDarkMode ? "#333" : "white";
  
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
