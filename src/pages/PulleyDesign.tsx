import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Define the pulley parameters type
export interface PulleyParameters {
  diameter: number;
  thickness: number;
  boreDiameter: number;
  innerDiameter: number; // V-groove diameter
  grooveDepth: number;
  grooveWidth: number;
  keyWayWidth: number;
  keyWayDepth: number;
  unit: "mm" | "cm" | "m" | "in";
}

// Default pulley parameters
const DEFAULT_PARAMETERS: PulleyParameters = {
  diameter: 100,
  thickness: 20,
  boreDiameter: 25, 
  innerDiameter: 70, 
  grooveDepth: 5,
  grooveWidth: 10,
  keyWayWidth: 6,
  keyWayDepth: 3,
  unit: "mm",
};

// Enhanced pulley drawing component
export const EnhancedPulleyDrawing: React.FC<{
  parameters: PulleyParameters;
  view: "top" | "side";
  className?: string;
}> = ({ parameters, view, className }) => {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  
  useEffect(() => {
    if (svgContainerRef.current) {
      // Clear any previous content
      svgContainerRef.current.innerHTML = '';
      
      try {
        // Draw based on view type
        if (view === "top") {
          drawTopView(svgContainerRef.current, parameters);
        } else {
          drawSideView(svgContainerRef.current, parameters);
        }
      } catch (error) {
        console.error(`Error rendering ${view} view:`, error);
        // Fallback to a simple message if drawing fails
        svgContainerRef.current.innerHTML = `<div style="display: flex; height: 100%; align-items: center; justify-content: center; color: #666;">
          <p>Drawing engine error: ${(error as Error).message || "Unknown error"}</p>
        </div>`;
      }
    }
  }, [parameters, view, isDarkMode]);
  
  function drawTopView(container: HTMLDivElement, params: PulleyParameters) {
    // Set up SVG properties
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    const strokeColor = isDarkMode ? "#aaa" : "#333";
    const hiddenLineColor = isDarkMode ? "#777" : "#999";
    const centerLineColor = isDarkMode ? "#88f" : "#00f";
    const dimensionColor = isDarkMode ? "#aaa" : "#555";
    const textColor = isDarkMode ? "#eee" : "#333";
    const fillColor = isDarkMode ? "#333" : "#fff";
    
    // Calculate dimensions and scaling
    const outerDiameter = params.diameter;
    const innerDiameter = params.innerDiameter;
    const boreDiameter = params.boreDiameter;
    const keyWayWidth = params.keyWayWidth;
    const keyWayDepth = params.keyWayDepth;
    
    // Calculate max dimension for viewport scaling
    const maxDimension = Math.max(outerDiameter, keyWayDepth + boreDiameter);
    
    // Increase size by reducing padding and using more viewport space
    const viewBoxSize = maxDimension * 2;
    const viewBoxCenter = viewBoxSize / 2;
    
    // Set SVG attributes with proper viewBox for automatic scaling
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${viewBoxSize} ${viewBoxSize}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.overflow = "visible";
    
    // Create a group to center all elements
    const mainGroup = document.createElementNS(svgNS, "g");
    mainGroup.setAttribute("transform", `translate(${viewBoxCenter}, ${viewBoxCenter})`);
    svg.appendChild(mainGroup);
    
    // Add defs for styling elements
    const defs = document.createElementNS(svgNS, "defs");
    
    // Hidden line pattern
    const hiddenLinePattern = document.createElementNS(svgNS, "pattern");
    hiddenLinePattern.setAttribute("id", "hiddenLine");
    hiddenLinePattern.setAttribute("patternUnits", "userSpaceOnUse");
    hiddenLinePattern.setAttribute("width", "10");
    hiddenLinePattern.setAttribute("height", "4");
    hiddenLinePattern.setAttribute("patternTransform", "rotate(0)");
    
    const hiddenLineRect = document.createElementNS(svgNS, "line");
    hiddenLineRect.setAttribute("x1", "0");
    hiddenLineRect.setAttribute("y1", "2");
    hiddenLineRect.setAttribute("x2", "5");
    hiddenLineRect.setAttribute("y2", "2");
    hiddenLineRect.setAttribute("stroke", hiddenLineColor);
    hiddenLineRect.setAttribute("stroke-width", "1");
    
    hiddenLinePattern.appendChild(hiddenLineRect);
    defs.appendChild(hiddenLinePattern);
    
    // Center line pattern
    const centerLinePattern = document.createElementNS(svgNS, "pattern");
    centerLinePattern.setAttribute("id", "centerLine");
    centerLinePattern.setAttribute("patternUnits", "userSpaceOnUse");
    centerLinePattern.setAttribute("width", "10");
    centerLinePattern.setAttribute("height", "4");
    
    const centerLineRect = document.createElementNS(svgNS, "line");
    centerLineRect.setAttribute("x1", "0");
    centerLineRect.setAttribute("y1", "2");
    centerLineRect.setAttribute("x2", "6");
    centerLineRect.setAttribute("y2", "2");
    centerLineRect.setAttribute("stroke", centerLineColor);
    centerLineRect.setAttribute("stroke-width", "1");
    
    centerLinePattern.appendChild(centerLineRect);
    defs.appendChild(centerLinePattern);
    
    svg.appendChild(defs);
    
    // Draw outer circle
    const outerCircle = document.createElementNS(svgNS, "circle");
    outerCircle.setAttribute("cx", "0");
    outerCircle.setAttribute("cy", "0");
    outerCircle.setAttribute("r", (outerDiameter / 2).toString());
    outerCircle.setAttribute("fill", fillColor);
    outerCircle.setAttribute("stroke", strokeColor);
    outerCircle.setAttribute("stroke-width", "1.5");
    mainGroup.appendChild(outerCircle);
    
    // Draw inner circle (groove)
    const innerCircle = document.createElementNS(svgNS, "circle");
    innerCircle.setAttribute("cx", "0");
    innerCircle.setAttribute("cy", "0");
    innerCircle.setAttribute("r", (innerDiameter / 2).toString());
    innerCircle.setAttribute("fill", "none");
    innerCircle.setAttribute("stroke", strokeColor);
    innerCircle.setAttribute("stroke-width", "1");
    innerCircle.setAttribute("stroke-dasharray", "5,3");
    mainGroup.appendChild(innerCircle);
    
    // Draw bore circle
    const boreCircle = document.createElementNS(svgNS, "circle");
    boreCircle.setAttribute("cx", "0");
    boreCircle.setAttribute("cy", "0");
    boreCircle.setAttribute("r", (boreDiameter / 2).toString());
    boreCircle.setAttribute("fill", "none");
    boreCircle.setAttribute("stroke", strokeColor);
    boreCircle.setAttribute("stroke-width", "1.5");
    mainGroup.appendChild(boreCircle);
    
    // Draw keyway
    const keyWayHalfWidth = keyWayWidth / 2;
    const boreRadius = boreDiameter / 2;
    
    const keyway = document.createElementNS(svgNS, "rect");
    keyway.setAttribute("x", (-keyWayHalfWidth).toString());
    keyway.setAttribute("y", (-(boreRadius + keyWayDepth)).toString());
    keyway.setAttribute("width", keyWayWidth.toString());
    keyway.setAttribute("height", keyWayDepth.toString());
    keyway.setAttribute("fill", "none");
    keyway.setAttribute("stroke", strokeColor);
    keyway.setAttribute("stroke-width", "1.5");
    mainGroup.appendChild(keyway);
    
    // Add center lines (cross)
    const centerLineHorizontal = document.createElementNS(svgNS, "line");
    centerLineHorizontal.setAttribute("x1", (-outerDiameter * 0.7).toString());
    centerLineHorizontal.setAttribute("y1", "0");
    centerLineHorizontal.setAttribute("x2", (outerDiameter * 0.7).toString());
    centerLineHorizontal.setAttribute("y2", "0");
    centerLineHorizontal.setAttribute("stroke", centerLineColor);
    centerLineHorizontal.setAttribute("stroke-width", "0.75");
    centerLineHorizontal.setAttribute("stroke-dasharray", "8,3");
    mainGroup.appendChild(centerLineHorizontal);
    
    const centerLineVertical = document.createElementNS(svgNS, "line");
    centerLineVertical.setAttribute("x1", "0");
    centerLineVertical.setAttribute("y1", (-outerDiameter * 0.7).toString());
    centerLineVertical.setAttribute("x2", "0");
    centerLineVertical.setAttribute("y2", (outerDiameter * 0.7).toString());
    centerLineVertical.setAttribute("stroke", centerLineColor);
    centerLineVertical.setAttribute("stroke-width", "0.75");
    centerLineVertical.setAttribute("stroke-dasharray", "8,3");
    mainGroup.appendChild(centerLineVertical);
    
    // Add dimensions - Improved positions and spacing
    // Outer diameter dimension - Place at the bottom
    const outerDiameterDimGroup = document.createElementNS(svgNS, "g");
    
    const outerDiamRadius = outerDiameter / 2;
    const outerDimOffset = outerDiamRadius * 1.3; // Position at bottom
    
    // Dimension line with arrows
    const outerDimLine = document.createElementNS(svgNS, "line");
    outerDimLine.setAttribute("x1", (-outerDiamRadius).toString());
    outerDimLine.setAttribute("y1", outerDimOffset.toString());
    outerDimLine.setAttribute("x2", outerDiamRadius.toString());
    outerDimLine.setAttribute("y2", outerDimOffset.toString());
    outerDimLine.setAttribute("stroke", dimensionColor);
    outerDimLine.setAttribute("stroke-width", "0.75");
    outerDiameterDimGroup.appendChild(outerDimLine);
    
    // Left extension line
    const leftExtLine = document.createElementNS(svgNS, "line");
    leftExtLine.setAttribute("x1", (-outerDiamRadius).toString());
    leftExtLine.setAttribute("y1", (outerDiamRadius).toString());
    leftExtLine.setAttribute("x2", (-outerDiamRadius).toString());
    leftExtLine.setAttribute("y2", outerDimOffset.toString());
    leftExtLine.setAttribute("stroke", dimensionColor);
    leftExtLine.setAttribute("stroke-width", "0.5");
    leftExtLine.setAttribute("stroke-dasharray", "3,2");
    outerDiameterDimGroup.appendChild(leftExtLine);
    
    // Right extension line
    const rightExtLine = document.createElementNS(svgNS, "line");
    rightExtLine.setAttribute("x1", outerDiamRadius.toString());
    rightExtLine.setAttribute("y1", (outerDiamRadius).toString());
    rightExtLine.setAttribute("x2", outerDiamRadius.toString());
    rightExtLine.setAttribute("y2", outerDimOffset.toString());
    rightExtLine.setAttribute("stroke", dimensionColor);
    rightExtLine.setAttribute("stroke-width", "0.5");
    rightExtLine.setAttribute("stroke-dasharray", "3,2");
    outerDiameterDimGroup.appendChild(rightExtLine);
    
    // Left arrow
    const leftArrow = document.createElementNS(svgNS, "path");
    leftArrow.setAttribute("d", `M ${-outerDiamRadius - 3} ${outerDimOffset} L ${-outerDiamRadius} ${outerDimOffset - 2} L ${-outerDiamRadius} ${outerDimOffset + 2} Z`);
    leftArrow.setAttribute("fill", dimensionColor);
    outerDiameterDimGroup.appendChild(leftArrow);
    
    // Right arrow
    const rightArrow = document.createElementNS(svgNS, "path");
    rightArrow.setAttribute("d", `M ${outerDiamRadius + 3} ${outerDimOffset} L ${outerDiamRadius} ${outerDimOffset - 2} L ${outerDiamRadius} ${outerDimOffset + 2} Z`);
    rightArrow.setAttribute("fill", dimensionColor);
    outerDiameterDimGroup.appendChild(rightArrow);
    
    // Dimension text - No background
    const outerDimText = document.createElementNS(svgNS, "text");
    outerDimText.setAttribute("x", "0");
    outerDimText.setAttribute("y", (outerDimOffset + 12).toString());
    outerDimText.setAttribute("text-anchor", "middle");
    outerDimText.setAttribute("font-size", "11");
    outerDimText.setAttribute("font-family", "monospace");
    outerDimText.setAttribute("fill", textColor);
    outerDimText.textContent = `Ø${outerDiameter}`;
    outerDiameterDimGroup.appendChild(outerDimText);
    
    mainGroup.appendChild(outerDiameterDimGroup);
    
    // Bore diameter dimension - Place on right side
    const boreDiameterDimGroup = document.createElementNS(svgNS, "g");
    
    const boreDimRadius = boreDiameter / 2;
    const boreDimOffset = outerDiamRadius * 0.9; // Position it on right side
    
    // Dimension line with arrows
    const boreDimLine = document.createElementNS(svgNS, "line");
    boreDimLine.setAttribute("x1", boreDimOffset.toString());
    boreDimLine.setAttribute("y1", (-boreDimRadius).toString());
    boreDimLine.setAttribute("x2", boreDimOffset.toString());
    boreDimLine.setAttribute("y2", boreDimRadius.toString());
    boreDimLine.setAttribute("stroke", dimensionColor);
    boreDimLine.setAttribute("stroke-width", "0.75");
    boreDiameterDimGroup.appendChild(boreDimLine);
    
    // Top extension line
    const boreTopExtLine = document.createElementNS(svgNS, "line");
    boreTopExtLine.setAttribute("x1", boreDimRadius.toString());
    boreTopExtLine.setAttribute("y1", (-boreDimRadius).toString());
    boreTopExtLine.setAttribute("x2", boreDimOffset.toString());
    boreTopExtLine.setAttribute("y2", (-boreDimRadius).toString());
    boreTopExtLine.setAttribute("stroke", dimensionColor);
    boreTopExtLine.setAttribute("stroke-width", "0.5");
    boreTopExtLine.setAttribute("stroke-dasharray", "3,2");
    boreDiameterDimGroup.appendChild(boreTopExtLine);
    
    // Bottom extension line
    const boreBottomExtLine = document.createElementNS(svgNS, "line");
    boreBottomExtLine.setAttribute("x1", boreDimRadius.toString());
    boreBottomExtLine.setAttribute("y1", boreDimRadius.toString());
    boreBottomExtLine.setAttribute("x2", boreDimOffset.toString());
    boreBottomExtLine.setAttribute("y2", boreDimRadius.toString());
    boreBottomExtLine.setAttribute("stroke", dimensionColor);
    boreBottomExtLine.setAttribute("stroke-width", "0.5");
    boreBottomExtLine.setAttribute("stroke-dasharray", "3,2");
    boreDiameterDimGroup.appendChild(boreBottomExtLine);
    
    // Arrows for bore dimension
    const boreTopArrow = document.createElementNS(svgNS, "path");
    boreTopArrow.setAttribute("d", `M ${boreDimOffset} ${-boreDimRadius - 3} L ${boreDimOffset - 2} ${-boreDimRadius} L ${boreDimOffset + 2} ${-boreDimRadius} Z`);
    boreTopArrow.setAttribute("fill", dimensionColor);
    boreDiameterDimGroup.appendChild(boreTopArrow);
    
    const boreBottomArrow = document.createElementNS(svgNS, "path");
    boreBottomArrow.setAttribute("d", `M ${boreDimOffset} ${boreDimRadius + 3} L ${boreDimOffset - 2} ${boreDimRadius} L ${boreDimOffset + 2} ${boreDimRadius} Z`);
    boreBottomArrow.setAttribute("fill", dimensionColor);
    boreDiameterDimGroup.appendChild(boreBottomArrow);
    
    // Dimension text - No background
    const boreDimText = document.createElementNS(svgNS, "text");
    boreDimText.setAttribute("x", (boreDimOffset + 15).toString());
    boreDimText.setAttribute("y", "0");
    boreDimText.setAttribute("text-anchor", "start");
    boreDimText.setAttribute("font-size", "11");
    boreDimText.setAttribute("font-family", "monospace");
    boreDimText.setAttribute("fill", textColor);
    boreDimText.textContent = `Ø${boreDiameter}`;
    boreDiameterDimGroup.appendChild(boreDimText);
    
    mainGroup.appendChild(boreDiameterDimGroup);
    
    // Keyway dimensions - Position on top with better spacing
    const keyWayDimGroup = document.createElementNS(svgNS, "g");
    
    // Keyway width dimension - Move higher up
    const keyWayOffset = -(boreRadius + keyWayDepth + 15);
    
    const keyWayWidthDimLine = document.createElementNS(svgNS, "line");
    keyWayWidthDimLine.setAttribute("x1", (-keyWayHalfWidth).toString());
    keyWayWidthDimLine.setAttribute("y1", keyWayOffset.toString());
    keyWayWidthDimLine.setAttribute("x2", keyWayHalfWidth.toString());
    keyWayWidthDimLine.setAttribute("y2", keyWayOffset.toString());
    keyWayWidthDimLine.setAttribute("stroke", dimensionColor);
    keyWayWidthDimLine.setAttribute("stroke-width", "0.75");
    keyWayDimGroup.appendChild(keyWayWidthDimLine);
    
    // Left extension line
    const keyLeftExtLine = document.createElementNS(svgNS, "line");
    keyLeftExtLine.setAttribute("x1", (-keyWayHalfWidth).toString());
    keyLeftExtLine.setAttribute("y1", (-(boreRadius + keyWayDepth)).toString());
    keyLeftExtLine.setAttribute("x2", (-keyWayHalfWidth).toString());
    keyLeftExtLine.setAttribute("y2", keyWayOffset.toString());
    keyLeftExtLine.setAttribute("stroke", dimensionColor);
    keyLeftExtLine.setAttribute("stroke-width", "0.5");
    keyLeftExtLine.setAttribute("stroke-dasharray", "3,2");
    keyWayDimGroup.appendChild(keyLeftExtLine);
    
    // Right extension line
    const keyRightExtLine = document.createElementNS(svgNS, "line");
    keyRightExtLine.setAttribute("x1", keyWayHalfWidth.toString());
    keyRightExtLine.setAttribute("y1", (-(boreRadius + keyWayDepth)).toString());
    keyRightExtLine.setAttribute("x2", keyWayHalfWidth.toString());
    keyRightExtLine.setAttribute("y2", keyWayOffset.toString());
    keyRightExtLine.setAttribute("stroke", dimensionColor);
    keyRightExtLine.setAttribute("stroke-width", "0.5");
    keyRightExtLine.setAttribute("stroke-dasharray", "3,2");
    keyWayDimGroup.appendChild(keyRightExtLine);
    
    // Arrows for keyway width
    const keyLeftArrow = document.createElementNS(svgNS, "path");
    keyLeftArrow.setAttribute("d", `M ${-keyWayHalfWidth - 3} ${keyWayOffset} L ${-keyWayHalfWidth} ${keyWayOffset - 2} L ${-keyWayHalfWidth} ${keyWayOffset + 2} Z`);
    keyLeftArrow.setAttribute("fill", dimensionColor);
    keyWayDimGroup.appendChild(keyLeftArrow);
    
    const keyRightArrow = document.createElementNS(svgNS, "path");
    keyRightArrow.setAttribute("d", `M ${keyWayHalfWidth + 3} ${keyWayOffset} L ${keyWayHalfWidth} ${keyWayOffset - 2} L ${keyWayHalfWidth} ${keyWayOffset + 2} Z`);
    keyRightArrow.setAttribute("fill", dimensionColor);
    keyWayDimGroup.appendChild(keyRightArrow);
    
    // Dimension text - No background
    const keyDimText = document.createElementNS(svgNS, "text");
    keyDimText.setAttribute("x", "0");
    keyDimText.setAttribute("y", (keyWayOffset - 5).toString());
    keyDimText.setAttribute("text-anchor", "middle");
    keyDimText.setAttribute("font-size", "11");
    keyDimText.setAttribute("font-family", "monospace");
    keyDimText.setAttribute("fill", textColor);
    keyDimText.textContent = `${keyWayWidth}`;
    keyWayDimGroup.appendChild(keyDimText);
    
    // Keyway depth dimension - Position on the left side
    const keyDepthOffset = -outerDiamRadius * 0.9; // Position on left side
    
    const keyDepthDimLine = document.createElementNS(svgNS, "line");
    keyDepthDimLine.setAttribute("x1", keyDepthOffset.toString());
    keyDepthDimLine.setAttribute("y1", (-(boreRadius)).toString());
    keyDepthDimLine.setAttribute("x2", keyDepthOffset.toString());
    keyDepthDimLine.setAttribute("y2", (-(boreRadius + keyWayDepth)).toString());
    keyDepthDimLine.setAttribute("stroke", dimensionColor);
    keyDepthDimLine.setAttribute("stroke-width", "0.75");
    keyWayDimGroup.appendChild(keyDepthDimLine);
    
    // Top extension line
    const keyTopExtLine = document.createElementNS(svgNS, "line");
    keyTopExtLine.setAttribute("x1", (-keyWayHalfWidth).toString());
    keyTopExtLine.setAttribute("y1", (-(boreRadius + keyWayDepth)).toString());
    keyTopExtLine.setAttribute("x2", keyDepthOffset.toString());
    keyTopExtLine.setAttribute("y2", (-(boreRadius + keyWayDepth)).toString());
    keyTopExtLine.setAttribute("stroke", dimensionColor);
    keyTopExtLine.setAttribute("stroke-width", "0.5");
    keyTopExtLine.setAttribute("stroke-dasharray", "3,2");
    keyWayDimGroup.appendChild(keyTopExtLine);
    
    // Bottom extension line
    const keyBottomExtLine = document.createElementNS(svgNS, "line");
    keyBottomExtLine.setAttribute("x1", (-keyWayHalfWidth).toString());
    keyBottomExtLine.setAttribute("y1", (-(boreRadius)).toString());
    keyBottomExtLine.setAttribute("x2", keyDepthOffset.toString());
    keyBottomExtLine.setAttribute("y2", (-(boreRadius)).toString());
    keyBottomExtLine.setAttribute("stroke", dimensionColor);
    keyBottomExtLine.setAttribute("stroke-width", "0.5");
    keyBottomExtLine.setAttribute("stroke-dasharray", "3,2");
    keyWayDimGroup.appendChild(keyBottomExtLine);
    
    // Arrows for keyway depth
    const keyTopArrow = document.createElementNS(svgNS, "path");
    keyTopArrow.setAttribute("d", `M ${keyDepthOffset} ${-(boreRadius + keyWayDepth) - 3} L ${keyDepthOffset - 2} ${-(boreRadius + keyWayDepth)} L ${keyDepthOffset + 2} ${-(boreRadius + keyWayDepth)} Z`);
    keyTopArrow.setAttribute("fill", dimensionColor);
    keyWayDimGroup.appendChild(keyTopArrow);
    
    const keyBottomArrow = document.createElementNS(svgNS, "path");
    keyBottomArrow.setAttribute("d", `M ${keyDepthOffset} ${-boreRadius + 3} L ${keyDepthOffset - 2} ${-boreRadius} L ${keyDepthOffset + 2} ${-boreRadius} Z`);
    keyBottomArrow.setAttribute("fill", dimensionColor);
    keyWayDimGroup.appendChild(keyBottomArrow);
    
    // Dimension text - No background
    const keyDepthText = document.createElementNS(svgNS, "text");
    keyDepthText.setAttribute("x", (keyDepthOffset - 15).toString());
    keyDepthText.setAttribute("y", (-(boreRadius + keyWayDepth/2)).toString());
    keyDepthText.setAttribute("text-anchor", "end");
    keyDepthText.setAttribute("font-size", "11");
    keyDepthText.setAttribute("font-family", "monospace");
    keyDepthText.setAttribute("fill", textColor);
    keyDepthText.textContent = `${keyWayDepth}`;
    keyWayDimGroup.appendChild(keyDepthText);
    
    mainGroup.appendChild(keyWayDimGroup);
    
    // Inner diameter dimension - Place on top
    const innerDiameterDimGroup = document.createElementNS(svgNS, "g");
    
    // Position inner diameter dimension at top of circle
    const innerDiamRadius = innerDiameter / 2;
    const innerDimOffset = -outerDiamRadius * 1.3; // Position on top
    
    // Dimension line with arrows
    const innerDimLine = document.createElementNS(svgNS, "line");
    innerDimLine.setAttribute("x1", (-innerDiamRadius).toString());
    innerDimLine.setAttribute("y1", innerDimOffset.toString());
    innerDimLine.setAttribute("x2", innerDiamRadius.toString());
    innerDimLine.setAttribute("y2", innerDimOffset.toString());
    innerDimLine.setAttribute("stroke", dimensionColor);
    innerDimLine.setAttribute("stroke-width", "0.75");
    innerDimLine.setAttribute("stroke-dasharray", "4,2");
    innerDiameterDimGroup.appendChild(innerDimLine);
    
    // Left extension line
    const innerLeftExtLine = document.createElementNS(svgNS, "line");
    innerLeftExtLine.setAttribute("x1", (-innerDiamRadius).toString());
    innerLeftExtLine.setAttribute("y1", (-innerDiamRadius).toString());
    innerLeftExtLine.setAttribute("x2", (-innerDiamRadius).toString());
    innerLeftExtLine.setAttribute("y2", innerDimOffset.toString());
    innerLeftExtLine.setAttribute("stroke", dimensionColor);
    innerLeftExtLine.setAttribute("stroke-width", "0.5");
    innerLeftExtLine.setAttribute("stroke-dasharray", "3,2");
    innerDiameterDimGroup.appendChild(innerLeftExtLine);
    
    // Right extension line
    const innerRightExtLine = document.createElementNS(svgNS, "line");
    innerRightExtLine.setAttribute("x1", innerDiamRadius.toString());
    innerRightExtLine.setAttribute("y1", (-innerDiamRadius).toString());
    innerRightExtLine.setAttribute("x2", innerDiamRadius.toString());
    innerRightExtLine.setAttribute("y2", innerDimOffset.toString());
    innerRightExtLine.setAttribute("stroke", dimensionColor);
    innerRightExtLine.setAttribute("stroke-width", "0.5");
    innerRightExtLine.setAttribute("stroke-dasharray", "3,2");
    innerDiameterDimGroup.appendChild(innerRightExtLine);
    
    // Arrows for inner diameter
    const innerLeftArrow = document.createElementNS(svgNS, "path");
    innerLeftArrow.setAttribute("d", `M ${-innerDiamRadius - 3} ${innerDimOffset} L ${-innerDiamRadius} ${innerDimOffset - 2} L ${-innerDiamRadius} ${innerDimOffset + 2} Z`);
    innerLeftArrow.setAttribute("fill", dimensionColor);
    innerDiameterDimGroup.appendChild(innerLeftArrow);
    
    const innerRightArrow = document.createElementNS(svgNS, "path");
    innerRightArrow.setAttribute("d", `M ${innerDiamRadius + 3} ${innerDimOffset} L ${innerDiamRadius} ${innerDimOffset - 2} L ${innerDiamRadius} ${innerDimOffset + 2} Z`);
    innerRightArrow.setAttribute("fill", dimensionColor);
    innerDiameterDimGroup.appendChild(innerRightArrow);
    
    // Dimension text - No background
    const innerDimText = document.createElementNS(svgNS, "text");
    innerDimText.setAttribute("x", "0");
    innerDimText.setAttribute("y", (innerDimOffset - 5).toString());
    innerDimText.setAttribute("text-anchor", "middle");
    innerDimText.setAttribute("font-size", "11");
    innerDimText.setAttribute("font-family", "monospace");
    innerDimText.setAttribute("fill", textColor);
    innerDimText.textContent = `Ø${innerDiameter}`;
    innerDiameterDimGroup.appendChild(innerDimText);
    
    mainGroup.appendChild(innerDiameterDimGroup);
    
    // Add title - FRONT VIEW
    const title = document.createElementNS(svgNS, "text");
    title.setAttribute("x", "0");
    title.setAttribute("y", (-viewBoxCenter + 20).toString());
    title.setAttribute("text-anchor", "middle");
    title.setAttribute("font-size", "14");
    title.setAttribute("font-weight", "bold");
    title.setAttribute("font-family", "Arial, sans-serif");
    title.setAttribute("fill", textColor);
    title.textContent = "FRONT VIEW";
    svg.appendChild(title);
    
    // Append the SVG to the container
    container.appendChild(svg);
  }
  
  function drawSideView(container: HTMLDivElement, params: PulleyParameters) {
    // Set up SVG properties
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    const strokeColor = isDarkMode ? "#aaa" : "#333";
    const hiddenLineColor = isDarkMode ? "#777" : "#999";
    const centerLineColor = isDarkMode ? "#88f" : "#00f";
    const dimensionColor = isDarkMode ? "#aaa" : "#555";
    const textColor = isDarkMode ? "#eee" : "#333";
    const fillColor = isDarkMode ? "#333" : "#fff";
    const grooveColor = isDarkMode ? "#faa" : "#f00";
    
    // Calculate dimensions and scaling
    const diameter = params.diameter;
    const thickness = params.thickness;
    const innerDiameter = params.innerDiameter;
    const boreDiameter = params.boreDiameter;
    const grooveWidth = params.grooveWidth;
    const grooveDepth = params.grooveDepth;
    const keyWayWidth = params.keyWayWidth;
    const keyWayDepth = params.keyWayDepth;
    
    // Calculate max dimension for viewport scaling
    const maxDimension = Math.max(diameter, thickness * 2);
    
    // Increase size by reducing padding and using more viewport space
    const viewBoxSize = maxDimension * 2;
    const viewBoxCenter = viewBoxSize / 2;
    
    // Set SVG attributes with proper viewBox for automatic scaling
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${viewBoxSize} ${viewBoxSize}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.overflow = "visible";
    
    // Create a group to center all elements
    const mainGroup = document.createElementNS(svgNS, "g");
    mainGroup.setAttribute("transform", `translate(${viewBoxCenter}, ${viewBoxCenter})`);
    svg.appendChild(mainGroup);
    
    // Add defs for styling elements
    const defs = document.createElementNS(svgNS, "defs");
    
    // Hidden line pattern
    const hiddenLinePattern = document.createElementNS(svgNS, "pattern");
    hiddenLinePattern.setAttribute("id", "hiddenLine");
    hiddenLinePattern.setAttribute("patternUnits", "userSpaceOnUse");
    hiddenLinePattern.setAttribute("width", "10");
    hiddenLinePattern.setAttribute("height", "4");
    hiddenLinePattern.setAttribute("patternTransform", "rotate(0)");
    
    const hiddenLineRect = document.createElementNS(svgNS, "line");
    hiddenLineRect.setAttribute("x1", "0");
    hiddenLineRect.setAttribute("y1", "2");
    hiddenLineRect.setAttribute("x2", "5");
    hiddenLineRect.setAttribute("y2", "2");
    hiddenLineRect.setAttribute("stroke", hiddenLineColor);
    hiddenLineRect.setAttribute("stroke-width", "1");
    
    hiddenLinePattern.appendChild(hiddenLineRect);
    defs.appendChild(hiddenLinePattern);
    
    // Center line pattern
    const centerLinePattern = document.createElementNS(svgNS, "pattern");
    centerLinePattern.setAttribute("id", "centerLine");
    centerLinePattern.setAttribute("patternUnits", "userSpaceOnUse");
    centerLinePattern.setAttribute("width", "10");
    centerLinePattern.setAttribute("height", "4");
    
    const centerLineRect = document.createElementNS(svgNS, "line");
    centerLineRect.setAttribute("x1", "0");
    centerLineRect.setAttribute("y1", "2");
    centerLineRect.setAttribute("x2", "6");
    centerLineRect.setAttribute("y2", "2");
    centerLineRect.setAttribute("stroke", centerLineColor);
    centerLineRect.setAttribute("stroke-width", "1");
    
    centerLinePattern.appendChild(centerLineRect);
    defs.appendChild(centerLinePattern);
    
    svg.appendChild(defs);
    
    // Draw outer rectangle (outline)
    const outerRadius = diameter / 2;
    const halfThickness = thickness / 2;
    
    const outline = document.createElementNS(svgNS, "rect");
    outline.setAttribute("x", (-halfThickness).toString());
    outline.setAttribute("y", (-outerRadius).toString());
    outline.setAttribute("width", thickness.toString());
    outline.setAttribute("height", diameter.toString());
    outline.setAttribute("fill", fillColor);
    outline.setAttribute("stroke", strokeColor);
    outline.setAttribute("stroke-width", "1.5");
    mainGroup.appendChild(outline);
    
    // Draw center lines
    const centerLineHorizontal = document.createElementNS(svgNS, "line");
    centerLineHorizontal.setAttribute("x1", (-halfThickness * 1.5).toString());
    centerLineHorizontal.setAttribute("y1", "0");
    centerLineHorizontal.setAttribute("x2", (halfThickness * 1.5).toString());
    centerLineHorizontal.setAttribute("y2", "0");
    centerLineHorizontal.setAttribute("stroke", centerLineColor);
    centerLineHorizontal.setAttribute("stroke-width", "0.75");
    centerLineHorizontal.setAttribute("stroke-dasharray", "8,3");
    mainGroup.appendChild(centerLineHorizontal);
    
    // Draw V-groove
    const grooveHalfWidth = grooveWidth / 2;
    const innerRadius = innerDiameter / 2;
    
    // Top V-groove
    const topVGroove = document.createElementNS(svgNS, "path");
    topVGroove.setAttribute("d", `
      M ${-grooveHalfWidth} ${-outerRadius}
      L 0 ${-innerRadius}
      L ${grooveHalfWidth} ${-outerRadius}
    `);
    topVGroove.setAttribute("fill", "none");
    topVGroove.setAttribute("stroke", grooveColor);
    topVGroove.setAttribute("stroke-width", "1.5");
    mainGroup.appendChild(topVGroove);
    
    // Bottom V-groove
    const bottomVGroove = document.createElementNS(svgNS, "path");
    bottomVGroove.setAttribute("d", `
      M ${-grooveHalfWidth} ${outerRadius}
      L 0 ${innerRadius}
      L ${grooveHalfWidth} ${outerRadius}
    `);
    bottomVGroove.setAttribute("fill", "none");
    bottomVGroove.setAttribute("stroke", grooveColor);
    bottomVGroove.setAttribute("stroke-width", "1.5");
    mainGroup.appendChild(bottomVGroove);
    
    // Draw inner diameter lines (horizontal)
    const innerTopLine = document.createElementNS(svgNS, "line");
    innerTopLine.setAttribute("x1", (-halfThickness).toString());
    innerTopLine.setAttribute("y1", (-innerRadius).toString());
    innerTopLine.setAttribute("x2", halfThickness.toString());
    innerTopLine.setAttribute("y2", (-innerRadius).toString());
    innerTopLine.setAttribute("stroke", strokeColor);
    innerTopLine.setAttribute("stroke-width", "1");
    innerTopLine.setAttribute("stroke-dasharray", "5,3");
    mainGroup.appendChild(innerTopLine);
    
    const innerBottomLine = document.createElementNS(svgNS, "line");
    innerBottomLine.setAttribute("x1", (-halfThickness).toString());
    innerBottomLine.setAttribute("y1", innerRadius.toString());
    innerBottomLine.setAttribute("x2", halfThickness.toString());
    innerBottomLine.setAttribute("y2", innerRadius.toString());
    innerBottomLine.setAttribute("stroke", strokeColor);
    innerBottomLine.setAttribute("stroke-width", "1");
    innerBottomLine.setAttribute("stroke-dasharray", "5,3");
    mainGroup.appendChild(innerBottomLine);
    
    // Draw bore diameter lines
    const boreRadius = boreDiameter / 2;
    
    const boreTopLine = document.createElementNS(svgNS, "line");
    boreTopLine.setAttribute("x1", (-halfThickness).toString());
    boreTopLine.setAttribute("y1", (-boreRadius).toString());
    boreTopLine.setAttribute("x2", halfThickness.toString());
    boreTopLine.setAttribute("y2", (-boreRadius).toString());
    boreTopLine.setAttribute("stroke", strokeColor);
    boreTopLine.setAttribute("stroke-width", "1.5");
    mainGroup.appendChild(boreTopLine);
    
    const boreBottomLine = document.createElementNS(svgNS, "line");
    boreBottomLine.setAttribute("x1", (-halfThickness).toString());
    boreBottomLine.setAttribute("y1", boreRadius.toString());
    boreBottomLine.setAttribute("x2", halfThickness.toString());
    boreBottomLine.setAttribute("y2", boreRadius.toString());
    boreBottomLine.setAttribute("stroke", strokeColor);
    boreBottomLine.setAttribute("stroke-width", "1.5");
    mainGroup.appendChild(boreBottomLine);
    
    // Draw keyway (with hidden lines as it's inside the bore)
    const keyWayHalfWidth = keyWayWidth / 2;
    
    const keyway = document.createElementNS(svgNS, "rect");
    keyway.setAttribute("x", (-keyWayHalfWidth).toString());
    keyway.setAttribute("y", (-(boreRadius + keyWayDepth)).toString());
    keyway.setAttribute("width", keyWayWidth.toString());
    keyway.setAttribute("height", keyWayDepth.toString());
    keyway.setAttribute("fill", "none");
    keyway.setAttribute("stroke", hiddenLineColor);
    keyway.setAttribute("stroke-width", "1");
    keyway.setAttribute("stroke-dasharray", "5,3");
    mainGroup.appendChild(keyway);
    
    // Add dimensions - Improved positioning
    // Outer diameter dimension - Right side
    const diameterDimGroup = document.createElementNS(svgNS, "g");
    
    const outerDimOffset = halfThickness * 1.8; // Position further right
    
    // Dimension line with arrows
    const diamDimLine = document.createElementNS(svgNS, "line");
    diamDimLine.setAttribute("x1", outerDimOffset.toString());
    diamDimLine.setAttribute("y1", (-outerRadius).toString());
    diamDimLine.setAttribute("x2", outerDimOffset.toString());
    diamDimLine.setAttribute("y2", outerRadius.toString());
    diamDimLine.setAttribute("stroke", dimensionColor);
    diamDimLine.setAttribute("stroke-width", "0.75");
    diameterDimGroup.appendChild(diamDimLine);
    
    // Top extension line
    const topExtLine = document.createElementNS(svgNS, "line");
    topExtLine.setAttribute("x1", halfThickness.toString());
    topExtLine.setAttribute("y1", (-outerRadius).toString());
    topExtLine.setAttribute("x2", outerDimOffset.toString());
    topExtLine.setAttribute("y2", (-outerRadius).toString());
    topExtLine.setAttribute("stroke", dimensionColor);
    topExtLine.setAttribute("stroke-width", "0.5");
    topExtLine.setAttribute("stroke-dasharray", "3,2");
    diameterDimGroup.appendChild(topExtLine);
    
    // Bottom extension line
    const bottomExtLine = document.createElementNS(svgNS, "line");
    bottomExtLine.setAttribute("x1", halfThickness.toString());
    bottomExtLine.setAttribute("y1", outerRadius.toString());
    bottomExtLine.setAttribute("x2", outerDimOffset.toString());
    bottomExtLine.setAttribute("y2", outerRadius.toString());
    bottomExtLine.setAttribute("stroke", dimensionColor);
    bottomExtLine.setAttribute("stroke-width", "0.5");
    bottomExtLine.setAttribute("stroke-dasharray", "3,2");
    diameterDimGroup.appendChild(bottomExtLine);
    
    // Arrows for outer dimension
    const topArrow = document.createElementNS(svgNS, "path");
    topArrow.setAttribute("d", `M ${outerDimOffset} ${-outerRadius - 3} L ${outerDimOffset - 2} ${-outerRadius} L ${outerDimOffset + 2} ${-outerRadius} Z`);
    topArrow.setAttribute("fill", dimensionColor);
    diameterDimGroup.appendChild(topArrow);
    
    const bottomArrow = document.createElementNS(svgNS, "path");
    bottomArrow.setAttribute("d", `M ${outerDimOffset} ${outerRadius + 3} L ${outerDimOffset - 2} ${outerRadius} L ${outerDimOffset + 2} ${outerRadius} Z`);
    bottomArrow.setAttribute("fill", dimensionColor);
    diameterDimGroup.appendChild(bottomArrow);
    
    // Dimension text - No background
    const diamText = document.createElementNS(svgNS, "text");
    diamText.setAttribute("x", (outerDimOffset + 15).toString());
    diamText.setAttribute("y", "0");
    diamText.setAttribute("text-anchor", "start");
    diamText.setAttribute("font-size", "11");
    diamText.setAttribute("font-family", "monospace");
    diamText.setAttribute("fill", textColor);
    diamText.textContent = `Ø${diameter}`;
    diameterDimGroup.appendChild(diamText);
    
    mainGroup.appendChild(diameterDimGroup);
    
    // Thickness dimension - Top position
    const thicknessDimGroup = document.createElementNS(svgNS, "g");
    
    const thickDimOffset = -outerRadius * 1.3; // Move up for better visibility
    
    // Dimension line with arrows
    const thickDimLine = document.createElementNS(svgNS, "line");
    thickDimLine.setAttribute("x1", (-halfThickness).toString());
    thickDimLine.setAttribute("y1", thickDimOffset.toString());
    thickDimLine.setAttribute("x2", halfThickness.toString());
    thickDimLine.setAttribute("y2", thickDimOffset.toString());
    thickDimLine.setAttribute("stroke", dimensionColor);
    thickDimLine.setAttribute("stroke-width", "0.75");
    thicknessDimGroup.appendChild(thickDimLine);
    
    // Left extension line
    const leftThickExtLine = document.createElementNS(svgNS, "line");
    leftThickExtLine.setAttribute("x1", (-halfThickness).toString());
    leftThickExtLine.setAttribute("y1", (-outerRadius).toString());
    leftThickExtLine.setAttribute("x2", (-halfThickness).toString());
    leftThickExtLine.setAttribute("y2", thickDimOffset.toString());
    leftThickExtLine.setAttribute("stroke", dimensionColor);
    leftThickExtLine.setAttribute("stroke-width", "0.5");
    leftThickExtLine.setAttribute("stroke-dasharray", "3,2");
    thicknessDimGroup.appendChild(leftThickExtLine);
    
    // Right extension line
    const rightThickExtLine = document.createElementNS(svgNS, "line");
    rightThickExtLine.setAttribute("x1", halfThickness.toString());
    rightThickExtLine.setAttribute("y1", (-outerRadius).toString());
    rightThickExtLine.setAttribute("x2", halfThickness.toString());
    rightThickExtLine.setAttribute("y2", thickDimOffset.toString());
    rightThickExtLine.setAttribute("stroke", dimensionColor);
    rightThickExtLine.setAttribute("stroke-width", "0.5");
    rightThickExtLine.setAttribute("stroke-dasharray", "3,2");
    thicknessDimGroup.appendChild(rightThickExtLine);
    
    // Arrows for thickness dimension
    const leftThickArrow = document.createElementNS(svgNS, "path");
    leftThickArrow.setAttribute("d", `M ${-halfThickness - 3} ${thickDimOffset} L ${-halfThickness} ${thickDimOffset - 2} L ${-halfThickness} ${thickDimOffset + 2} Z`);
    leftThickArrow.setAttribute("fill", dimensionColor);
    thicknessDimGroup.appendChild(leftThickArrow);
    
    const rightThickArrow = document.createElementNS(svgNS, "path");
    rightThickArrow.setAttribute("d", `M ${halfThickness + 3} ${thickDimOffset} L ${halfThickness} ${thickDimOffset - 2} L ${halfThickness} ${thickDimOffset + 2} Z`);
    rightThickArrow.setAttribute("fill", dimensionColor);
    thicknessDimGroup.appendChild(rightThickArrow);
    
    // Dimension text - No background
    const thickText = document.createElementNS(svgNS, "text");
    thickText.setAttribute("x", "0");
    thickText.setAttribute("y", (thickDimOffset - 5).toString());
    thickText.setAttribute("text-anchor", "middle");
    thickText.setAttribute("font-size", "11");
    thickText.setAttribute("font-family", "monospace");
    thickText.setAttribute("fill", textColor);
    thickText.textContent = `${thickness}`;
    thicknessDimGroup.appendChild(thickText);
    
    mainGroup.appendChild(thicknessDimGroup);
    
    // Inner diameter dimension - Left side
    const innerDimGroup = document.createElementNS(svgNS, "g");
    
    const innerDimOffset = -halfThickness * 1.8; // Position further left
    
    // Dimension line with arrows
    const innerDimLine = document.createElementNS(svgNS, "line");
    innerDimLine.setAttribute("x1", innerDimOffset.toString());
    innerDimLine.setAttribute("y1", (-innerRadius).toString());
    innerDimLine.setAttribute("x2", innerDimOffset.toString());
    innerDimLine.setAttribute("y2", innerRadius.toString());
    innerDimLine.setAttribute("stroke", dimensionColor);
    innerDimLine.setAttribute("stroke-width", "0.75");
    innerDimLine.setAttribute("stroke-dasharray", "4,2");
    innerDimGroup.appendChild(innerDimLine);
    
    // Top extension line
    const topInnerExtLine = document.createElementNS(svgNS, "line");
    topInnerExtLine.setAttribute("x1", (-halfThickness).toString());
    topInnerExtLine.setAttribute("y1", (-innerRadius).toString());
    topInnerExtLine.setAttribute("x2", innerDimOffset.toString());
    topInnerExtLine.setAttribute("y2", (-innerRadius).toString());
    topInnerExtLine.setAttribute("stroke", dimensionColor);
    topInnerExtLine.setAttribute("stroke-width", "0.5");
    topInnerExtLine.setAttribute("stroke-dasharray", "3,2");
    innerDimGroup.appendChild(topInnerExtLine);
    
    // Bottom extension line
    const bottomInnerExtLine = document.createElementNS(svgNS, "line");
    bottomInnerExtLine.setAttribute("x1", (-halfThickness).toString());
    bottomInnerExtLine.setAttribute("y1", innerRadius.toString());
    bottomInnerExtLine.setAttribute("x2", innerDimOffset.toString());
    bottomInnerExtLine.setAttribute("y2", innerRadius.toString());
    bottomInnerExtLine.setAttribute("stroke", dimensionColor);
    bottomInnerExtLine.setAttribute("stroke-width", "0.5");
    bottomInnerExtLine.setAttribute("stroke-dasharray", "3,2");
    innerDimGroup.appendChild(bottomInnerExtLine);
    
    // Arrows for inner dimension
    const innerTopArrow = document.createElementNS(svgNS, "path");
    innerTopArrow.setAttribute("d", `M ${innerDimOffset} ${-innerRadius - 3} L ${innerDimOffset - 2} ${-innerRadius} L ${innerDimOffset + 2} ${-innerRadius} Z`);
    innerTopArrow.setAttribute("fill", dimensionColor);
    innerDimGroup.appendChild(innerTopArrow);
    
    const innerBottomArrow = document.createElementNS(svgNS, "path");
    innerBottomArrow.setAttribute("d", `M ${innerDimOffset} ${innerRadius + 3} L ${innerDimOffset - 2} ${innerRadius} L ${innerDimOffset + 2} ${innerRadius} Z`);
    innerBottomArrow.setAttribute("fill", dimensionColor);
    innerDimGroup.appendChild(innerBottomArrow);
    
    // Dimension text - No background
    const innerText = document.createElementNS(svgNS, "text");
    innerText.setAttribute("x", (innerDimOffset - 15).toString());
    innerText.setAttribute("y", "0");
    innerText.setAttribute("text-anchor", "end");
    innerText.setAttribute("font-size", "11");
    innerText.setAttribute("font-family", "monospace");
    innerText.setAttribute("fill", textColor);
    innerText.textContent = `Ø${innerDiameter}`;
    innerDimGroup.appendChild(innerText);
    
    mainGroup.appendChild(innerDimGroup);
    
    // Groove width dimension - Bottom position
    const grooveDimGroup = document.createElementNS(svgNS, "g");
    
    const grooveDimOffset = outerRadius * 1.3; // Position at bottom for better visibility
    
    // Dimension line with arrows
    const grooveDimLine = document.createElementNS(svgNS, "line");
    grooveDimLine.setAttribute("x1", (-grooveHalfWidth).toString());
    grooveDimLine.setAttribute("y1", grooveDimOffset.toString());
    grooveDimLine.setAttribute("x2", grooveHalfWidth.toString());
    grooveDimLine.setAttribute("y2", grooveDimOffset.toString());
    grooveDimLine.setAttribute("stroke", dimensionColor);
    grooveDimLine.setAttribute("stroke-width", "0.75");
    grooveDimGroup.appendChild(grooveDimLine);
    
    // Left extension line
    const leftGrooveExtLine = document.createElementNS(svgNS, "line");
    leftGrooveExtLine.setAttribute("x1", (-grooveHalfWidth).toString());
    leftGrooveExtLine.setAttribute("y1", outerRadius.toString());
    leftGrooveExtLine.setAttribute("x2", (-grooveHalfWidth).toString());
    leftGrooveExtLine.setAttribute("y2", grooveDimOffset.toString());
    leftGrooveExtLine.setAttribute("stroke", dimensionColor);
    leftGrooveExtLine.setAttribute("stroke-width", "0.5");
    leftGrooveExtLine.setAttribute("stroke-dasharray", "3,2");
    grooveDimGroup.appendChild(leftGrooveExtLine);
    
    // Right extension line
    const rightGrooveExtLine = document.createElementNS(svgNS, "line");
    rightGrooveExtLine.setAttribute("x1", grooveHalfWidth.toString());
    rightGrooveExtLine.setAttribute("y1", outerRadius.toString());
    rightGrooveExtLine.setAttribute("x2", grooveHalfWidth.toString());
    rightGrooveExtLine.setAttribute("y2", grooveDimOffset.toString());
    rightGrooveExtLine.setAttribute("stroke", dimensionColor);
    rightGrooveExtLine.setAttribute("stroke-width", "0.5");
    rightGrooveExtLine.setAttribute("stroke-dasharray", "3,2");
    grooveDimGroup.appendChild(rightGrooveExtLine);
    
    // Arrows for groove width
    const leftGrooveArrow = document.createElementNS(svgNS, "path");
    leftGrooveArrow.setAttribute("d", `M ${-grooveHalfWidth - 3} ${grooveDimOffset} L ${-grooveHalfWidth} ${grooveDimOffset - 2} L ${-grooveHalfWidth} ${grooveDimOffset + 2} Z`);
    leftGrooveArrow.setAttribute("fill", dimensionColor);
    grooveDimGroup.appendChild(leftGrooveArrow);
    
    const rightGrooveArrow = document.createElementNS(svgNS, "path");
    rightGrooveArrow.setAttribute("d", `M ${grooveHalfWidth + 3} ${grooveDimOffset} L ${grooveHalfWidth} ${grooveDimOffset - 2} L ${grooveHalfWidth} ${grooveDimOffset + 2} Z`);
    rightGrooveArrow.setAttribute("fill", dimensionColor);
    grooveDimGroup.appendChild(rightGrooveArrow);
    
    // Dimension text - No background
    const grooveText = document.createElementNS(svgNS, "text");
    grooveText.setAttribute("x", "0");
    grooveText.setAttribute("y", (grooveDimOffset + 12).toString());
    grooveText.setAttribute("text-anchor", "middle");
    grooveText.setAttribute("font-size", "11");
    grooveText.setAttribute("font-family", "monospace");
    grooveText.setAttribute("fill", textColor);
    grooveText.textContent = `W${grooveWidth}`;
    grooveDimGroup.appendChild(grooveText);
    
    mainGroup.appendChild(grooveDimGroup);
    
    // Add title - SIDE VIEW
    const title = document.createElementNS(svgNS, "text");
    title.setAttribute("x", "0");
    title.setAttribute("y", (-viewBoxCenter + 20).toString());
    title.setAttribute("text-anchor", "middle");
    title.setAttribute("font-size", "14");
    title.setAttribute("font-weight", "bold");
    title.setAttribute("font-family", "Arial, sans-serif");
    title.setAttribute("fill", textColor);
    title.textContent = "SIDE VIEW";
    svg.appendChild(title);
    
    // Append the SVG to the container
    container.appendChild(svg);
  }
  
  return (
    <div 
      ref={svgContainerRef} 
      className={`w-full ${className}`}
      style={{ minHeight: "500px", border: "1px solid #eee", backgroundColor: "#fff" }}
    />
  );
};

const PulleyDesign: React.FC = () => {
  const [parameters, setParameters] = useState<PulleyParameters>(DEFAULT_PARAMETERS);
  const [isLoading, setIsLoading] = useState(false);
  const drawingRef = useRef<HTMLDivElement>(null);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    if (name === "boreDiameter" && numValue >= parameters.innerDiameter) {
      toast.error("Bore diameter must be smaller than the inner diameter");
      return;
    }
    
    if (name === "innerDiameter" && numValue >= parameters.diameter) {
      toast.error("Inner diameter must be smaller than the pulley diameter");
      return;
    }
    
    if (name === "innerDiameter" && numValue <= parameters.boreDiameter) {
      toast.error("Inner diameter must be larger than the bore diameter");
      return;
    }
    
    setParameters((prev) => ({
      ...prev,
      [name]: numValue,
    }));
  };

  // Handle unit change
  const handleUnitChange = (unit: PulleyParameters["unit"]) => {
    setParameters((prev) => ({
      ...prev,
      unit,
    }));
  };

  // Generate drawing
  const handleGenerateDrawing = () => {
    // Validate parameters
    if (parameters.diameter <= 0 || parameters.thickness <= 0 || parameters.boreDiameter <= 0) {
      toast.error("All dimensions must be positive values");
      return;
    }
    
    if (parameters.boreDiameter >= parameters.innerDiameter) {
      toast.error("Bore diameter must be smaller than the inner diameter");
      return;
    }
    
    if (parameters.innerDiameter >= parameters.diameter) {
      toast.error("Inner diameter must be smaller than the pulley diameter");
      return;
    }
    
    if (parameters.grooveDepth <= 0 || parameters.grooveWidth <= 0) {
      toast.error("Groove dimensions must be positive values");
      return;
    }
    
    if (parameters.keyWayWidth <= 0 || parameters.keyWayDepth <= 0) {
      toast.error("Keyway dimensions must be positive values");
      return;
    }
    
    // Show success message
    toast.success("Pulley drawing updated successfully");
  };

  // Export as PDF
  const handleExportPDF = async () => {
    try {
      if (!drawingRef.current) {
        toast.error("Drawing not found. Please generate a drawing first.");
        return;
      }
      
      setIsLoading(true);
      toast.loading("Generating PDF...");
      
      const canvas = await html2canvas(drawingRef.current, {
        scale: 3, // Increased scale for better quality
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Get PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate scaling to fit the drawing
      const scaleFactor = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height) * 0.95;
      const scaledWidth = canvas.width * scaleFactor;
      const scaledHeight = canvas.height * scaleFactor;
      
      // Center the drawing on the PDF
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;
      
      // Add the drawing to the PDF
      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
      
      // Add metadata
      const { diameter, thickness, boreDiameter, innerDiameter, unit } = parameters;
      const date = new Date().toLocaleDateString();
      
      // Add footer with specifications
      pdf.setFontSize(10);
      pdf.text(
        `Pulley Drawing - Ø${diameter}×${thickness} ${unit} - Bore: Ø${boreDiameter} ${unit} - Inner: Ø${innerDiameter} ${unit} - Generated on ${date}`, 
        pdfWidth / 2, 
        pdfHeight - 10, 
        { align: 'center' }
      );
      
      // Save the PDF
      pdf.save(`pulley_drawing_D${diameter}_T${thickness}_${unit}.pdf`);
      toast.dismiss();
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.dismiss();
      toast.error("Error exporting PDF file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Export as DXF
  const handleExportDXF = () => {
    try {
      setIsLoading(true);
      
      // Create basic DXF content
      let dxfContent = "0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nTABLES\n0\nENDSEC\n0\nSECTION\n2\nBLOCKS\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n";
      
      const { diameter, thickness, boreDiameter, innerDiameter, grooveWidth, keyWayWidth, keyWayDepth, unit } = parameters;
      
      // Top view entities
      // Outer circle
      dxfContent += `0\nCIRCLE\n8\nTOP_VIEW\n10\n0\n20\n0\n30\n0\n40\n${diameter/2}\n`;
      
      // Inner circle
      dxfContent += `0\nCIRCLE\n8\nTOP_VIEW\n10\n0\n20\n0\n30\n0\n40\n${innerDiameter/2}\n`;
      
      // Bore circle
      dxfContent += `0\nCIRCLE\n8\nTOP_VIEW\n10\n0\n20\n0\n30\n0\n40\n${boreDiameter/2}\n`;
      
      // Keyway (rectangle)
      const keyWayHalfWidth = keyWayWidth / 2;
      const boreRadius = boreDiameter / 2;
      
      dxfContent += `0\nLINE\n8\nTOP_VIEW\n10\n${-keyWayHalfWidth}\n20\n${-(boreRadius)}\n30\n0\n11\n${keyWayHalfWidth}\n21\n${-(boreRadius)}\n31\n0\n`;
      dxfContent += `0\nLINE\n8\nTOP_VIEW\n10\n${keyWayHalfWidth}\n20\n${-(boreRadius)}\n30\n0\n11\n${keyWayHalfWidth}\n21\n${-(boreRadius + keyWayDepth)}\n31\n0\n`;
      dxfContent += `0\nLINE\n8\nTOP_VIEW\n10\n${keyWayHalfWidth}\n20\n${-(boreRadius + keyWayDepth)}\n30\n0\n11\n${-keyWayHalfWidth}\n21\n${-(boreRadius + keyWayDepth)}\n31\n0\n`;
      dxfContent += `0\nLINE\n8\nTOP_VIEW\n10\n${-keyWayHalfWidth}\n20\n${-(boreRadius + keyWayDepth)}\n30\n0\n11\n${-keyWayHalfWidth}\n21\n${-(boreRadius)}\n31\n0\n`;
      
      // Add center lines
      dxfContent += `0\nLINE\n8\nCENTER\n10\n${-diameter}\n20\n0\n30\n0\n11\n${diameter}\n21\n0\n31\n0\n`;
      dxfContent += `0\nLINE\n8\nCENTER\n10\n0\n20\n${-diameter}\n30\n0\n11\n0\n21\n${diameter}\n31\n0\n`;
      
      // Side view entities (offset in X to separate views)
      const sideOffset = diameter * 1.5;
      const outerRadius = diameter / 2;
      const halfThickness = thickness / 2;
      
      // Outline rectangle
      dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${sideOffset - halfThickness}\n20\n${-outerRadius}\n30\n0\n11\n${sideOffset + halfThickness}\n21\n${-outerRadius}\n31\n0\n`;
      dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${sideOffset + halfThickness}\n20\n${-outerRadius}\n30\n0\n11\n${sideOffset + halfThickness}\n21\n${outerRadius}\n31\n0\n`;
      dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${sideOffset + halfThickness}\n20\n${outerRadius}\n30\n0\n11\n${sideOffset - halfThickness}\n21\n${outerRadius}\n31\n0\n`;
      dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${sideOffset - halfThickness}\n20\n${outerRadius}\n30\n0\n11\n${sideOffset - halfThickness}\n21\n${-outerRadius}\n31\n0\n`;
      
      // Inner diameter lines
      const innerRadius = innerDiameter / 2;
      
      dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${sideOffset - halfThickness}\n20\n${-innerRadius}\n30\n0\n11\n${sideOffset + halfThickness}\n21\n${-innerRadius}\n31\n0\n`;
      dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${sideOffset - halfThickness}\n20\n${innerRadius}\n30\n0\n11\n${sideOffset + halfThickness}\n21\n${innerRadius}\n31\n0\n`;
      
      // Bore diameter lines
      const boreR = boreDiameter / 2;
      
      dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${sideOffset - halfThickness}\n20\n${-boreR}\n30\n0\n11\n${sideOffset + halfThickness}\n21\n${-boreR}\n31\n0\n`;
      dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${sideOffset - halfThickness}\n20\n${boreR}\n30\n0\n11\n${sideOffset + halfThickness}\n21\n${boreR}\n31\n0\n`;
      
      // V-groove lines
      const grooveHalfWidth = grooveWidth / 2;
      
      // Top V-groove
      dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${sideOffset - grooveHalfWidth}\n20\n${-outerRadius}\n30\n0\n11\n${sideOffset}\n21\n${-innerRadius}\n31\n0\n`;
      dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${sideOffset}\n20\n${-innerRadius}\n30\n0\n11\n${sideOffset + grooveHalfWidth}\n21\n${-outerRadius}\n31\n0\n`;
      
      // Bottom V-groove
      dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${sideOffset - grooveHalfWidth}\n20\n${outerRadius}\n30\n0\n11\n${sideOffset}\n21\n${innerRadius}\n31\n0\n`;
      dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${sideOffset}\n20\n${innerRadius}\n30\n0\n11\n${sideOffset + grooveHalfWidth}\n21\n${outerRadius}\n31\n0\n`;
      
      // Keyway in side view
      dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${sideOffset - keyWayHalfWidth}\n20\n${-(boreR)}\n30\n0\n11\n${sideOffset + keyWayHalfWidth}\n21\n${-(boreR)}\n31\n0\n`;
      dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${sideOffset + keyWayHalfWidth}\n20\n${-(boreR)}\n30\n0\n11\n${sideOffset + keyWayHalfWidth}\n21\n${-(boreR + keyWayDepth)}\n31\n0\n`;
      dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${sideOffset + keyWayHalfWidth}\n20\n${-(boreR + keyWayDepth)}\n30\n0\n11\n${sideOffset - keyWayHalfWidth}\n21\n${-(boreR + keyWayDepth)}\n31\n0\n`;
      dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${sideOffset - keyWayHalfWidth}\n20\n${-(boreR + keyWayDepth)}\n30\n0\n11\n${sideOffset - keyWayHalfWidth}\n21\n${-(boreR)}\n31\n0\n`;
      
      // Center line
      dxfContent += `0\nLINE\n8\nCENTER\n10\n${sideOffset - diameter}\n20\n0\n30\n0\n11\n${sideOffset + diameter}\n21\n0\n31\n0\n`;
      
      // Add text for view labels
      dxfContent += `0\nTEXT\n8\nANNOTATION\n10\n0\n20\n${-outerRadius - 20}\n30\n0\n40\n10\n1\nTOP VIEW\n`;
      dxfContent += `0\nTEXT\n8\nANNOTATION\n10\n${sideOffset}\n20\n${-outerRadius - 20}\n30\n0\n40\n10\n1\nSIDE VIEW\n`;
      
      // Add title block
      dxfContent += `0\nTEXT\n8\nANNOTATION\n10\n${sideOffset / 2}\n20\n${outerRadius + 40}\n30\n0\n40\n10\n1\nPULLEY DRAWING\n`;
      dxfContent += `0\nTEXT\n8\nANNOTATION\n10\n${sideOffset / 2}\n20\n${outerRadius + 60}\n30\n0\n40\n8\n1\nDiameter: ${diameter}${unit}, Thickness: ${thickness}${unit}, Bore: ${boreDiameter}${unit}\n`;
      
      // End the DXF file
      dxfContent += "0\nENDSEC\n0\nEOF";
      
      // Create blob and download
      const blob = new Blob([dxfContent], { type: 'application/dxf' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `pulley_drawing_D${diameter}_T${thickness}_${unit}.dxf`;
      
      link.click();
      toast.success("DXF file exported successfully");
    } catch (error) {
      console.error("Error exporting DXF:", error);
      toast.error("Error exporting DXF file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-background py-12 px-4 sm:px-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Pulley Design Generator
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Create precise technical drawings for pulleys with custom dimensions.
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <div className="control-panel animate-slide-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
              <div className="space-y-1.5">
                <Label htmlFor="diameter" className="control-label">
                  Diameter
                </Label>
                <Input
                  id="diameter"
                  name="diameter"
                  type="number"
                  value={parameters.diameter}
                  onChange={handleInputChange}
                  min={1}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="thickness" className="control-label">
                  Thickness
                </Label>
                <Input
                  id="thickness"
                  name="thickness"
                  type="number"
                  value={parameters.thickness}
                  onChange={handleInputChange}
                  min={1}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="boreDiameter" className="control-label">
                  Bore Diameter (Shaft)
                </Label>
                <Input
                  id="boreDiameter"
                  name="boreDiameter"
                  type="number"
                  value={parameters.boreDiameter}
                  onChange={handleInputChange}
                  min={1}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="innerDiameter" className="control-label">
                  Inner Diameter (V-Taper)
                </Label>
                <Input
                  id="innerDiameter"
                  name="innerDiameter"
                  type="number"
                  value={parameters.innerDiameter}
                  onChange={handleInputChange}
                  min={1}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="grooveDepth" className="control-label">
                  Groove Depth
                </Label>
                <Input
                  id="grooveDepth"
                  name="grooveDepth"
                  type="number"
                  value={parameters.grooveDepth}
                  onChange={handleInputChange}
                  min={1}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="grooveWidth" className="control-label">
                  Groove Width
                </Label>
                <Input
                  id="grooveWidth"
                  name="grooveWidth"
                  type="number"
                  value={parameters.grooveWidth}
                  onChange={handleInputChange}
                  min={1}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="keyWayWidth" className="control-label">
                  Keyway Width
                </Label>
                <Input
                  id="keyWayWidth"
                  name="keyWayWidth"
                  type="number"
                  value={parameters.keyWayWidth}
                  onChange={handleInputChange}
                  min={1}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="keyWayDepth" className="control-label">
                  Keyway Depth
                </Label>
                <Input
                  id="keyWayDepth"
                  name="keyWayDepth"
                  type="number"
                  value={parameters.keyWayDepth}
                  onChange={handleInputChange}
                  min={1}
                  className="h-9"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1.5 w-full sm:w-auto">
                <Label className="control-label">Unit</Label>
                <div className="flex border rounded-md overflow-hidden">
                  {(['mm', 'cm', 'm', 'in'] as const).map((unit) => (
                    <button
                      key={unit}
                      className={cn(
                        "px-3 py-1.5 text-sm transition-colors",
                        parameters.unit === unit
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                      onClick={() => handleUnitChange(unit)}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <Button onClick={handleGenerateDrawing} className="flex-1 sm:flex-none">
                  Generate
                </Button>
                <Button variant="outline" onClick={handleExportPDF} className="flex-1 sm:flex-none">
                  PDF
                </Button>
                <Button variant="outline" onClick={handleExportDXF} className="flex-1 sm:flex-none">
                  DXF
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="mt-8">
          <div 
            ref={drawingRef}
            className="bg-white rounded-lg shadow-soft border border-border overflow-hidden p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top View */}
              <div className="relative">
                <div className="bg-white p-2 rounded-md absolute top-2 left-2 border border-border text-sm font-medium z-10">
                  TOP VIEW
                </div>
                <EnhancedPulleyDrawing 
                  parameters={parameters}
                  view="top"
                  className="w-full transition-all duration-500 ease-out-expo"
                />
              </div>
              
              {/* Side View */}
              <div className="relative">
                <div className="bg-white p-2 rounded-md absolute top-2 left-2 border border-border text-sm font-medium z-10">
                  SIDE VIEW
                </div>
                <EnhancedPulleyDrawing 
                  parameters={parameters}
                  view="side"
                  className="w-full transition-all duration-500 ease-out-expo"
                />
              </div>
            </div>
            
            {/* Common title block below both views */}
            <div className="mt-6 bg-white/90 backdrop-blur-sm border border-border rounded-md p-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">PULLEY DRAWING</div>
                  <div className="text-sm font-medium mt-1">
                    Ø{parameters.diameter} × {parameters.thickness} {parameters.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">BORE DIAMETER</div>
                  <div className="text-sm font-medium mt-1">
                    Ø{parameters.boreDiameter} {parameters.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">INNER DIAMETER</div>
                  <div className="text-sm font-medium mt-1">
                    Ø{parameters.innerDiameter} {parameters.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">V-GROOVE</div>
                  <div className="text-sm font-medium mt-1">
                    D: {parameters.grooveDepth} × W: {parameters.grooveWidth} {parameters.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">KEYWAY</div>
                  <div className="text-sm font-medium mt-1">
                    W: {parameters.keyWayWidth} × D: {parameters.keyWayDepth} {parameters.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">DATE</div>
                  <div className="text-sm font-medium mt-1">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">SCALE</div>
                  <div className="text-sm font-medium mt-1">
                    1:1
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">UNIT</div>
                  <div className="text-sm font-medium mt-1">
                    {parameters.unit}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 shadow-lg flex items-center space-x-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <div className="text-sm font-medium">Processing...</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PulleyDesign;