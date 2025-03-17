import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Define the idler parameters type
interface IdlerParameters {
  outerDiameter: number;
  length: number;
  innerDiameter: number;
  pinLength: number; // Added pin length parameter
  pinDiameter: number; // Added pin diameter parameter
  unit: "mm" | "cm" | "m" | "in";
}

// Default idler parameters
const DEFAULT_PARAMETERS: IdlerParameters = {
  outerDiameter: 120,
  length: 300,
  innerDiameter: 25,
  pinLength: 65, // Default pin length
  pinDiameter: 20, // Default pin diameter
  unit: "mm",
};

// Function to calculate common scale factor for both views
const calculateCommonScale = (parameters: IdlerParameters) => {
  // Include the pins in the total length calculation
  const totalLength = parameters.length + (parameters.pinLength * 2);
  const maxDimension = Math.max(parameters.outerDiameter, totalLength);
  // Base size of a canvas (estimated for display purposes)
  const baseCanvasSize = 1100;
  // Allow some margin around the drawing
  const margin = 0.75;
  
  return (baseCanvasSize * margin) / maxDimension;
};

// Single view IdlerDrawingArea component
export const SingleIdlerView: React.FC<{
  parameters: IdlerParameters;
  view: "top" | "side" | "section";
  className?: string;
  scale: number;
}> = ({ parameters, view, className, scale }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions - increased for better resolution
    const canvasSize = 1100; 
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    // Enable high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    
    // Get theme information
    const isDarkMode = document.documentElement.classList.contains('dark');
    const strokeColor = isDarkMode ? "#ddd" : "#333";
    const textColor = isDarkMode ? "#fff" : "#333";
    const fillColor = isDarkMode ? "#444" : "#eee";
    const sectionColor = isDarkMode ? "#666" : "#ddd";
    const pinColor = isDarkMode ? "#777" : "#aaa";
    
    // Calculate drawing scale - use the passed scale to ensure consistency between views
    const drawingScale = scale;
    
    // Center point of canvas
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    
    // Draw based on view
    if (view === "top") {
      drawTopView(ctx, centerX, centerY, drawingScale, parameters, canvasSize, {
        strokeColor, textColor, fillColor, sectionColor, pinColor
      });
    } else if (view === "side") {
      drawSideView(ctx, centerX, centerY, drawingScale, parameters, canvasSize, {
        strokeColor, textColor, fillColor, sectionColor, pinColor
      });
    } else {
      // Section view
      drawSectionView(ctx, centerX, centerY, drawingScale, parameters, canvasSize, {
        strokeColor, textColor, fillColor, sectionColor, pinColor
      });
    }
  }, [parameters, view, scale]);

  // Draw top view (front view in engineering drawing)
  const drawTopView = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scale: number,
    parameters: IdlerParameters,
    canvasSize: number,
    colors: {
      strokeColor: string;
      textColor: string;
      fillColor: string;
      sectionColor: string;
      pinColor: string;
    }
  ) => {
    const { outerDiameter, length, innerDiameter, pinLength, pinDiameter, unit } = parameters;
    const { strokeColor, textColor, fillColor, pinColor } = colors;
    
    // Calculate dimensions
    const outerRadius = (outerDiameter / 2) * scale;
    const innerRadius = (innerDiameter / 2) * scale;
    const scaledPinLength = pinLength * scale;
    const scaledPinRadius = (pinDiameter / 2) * scale;
    const scaledLength = length * scale;
    const halfLength = scaledLength / 2;
    
    // Draw the main idler body (rectangle)
    ctx.fillStyle = fillColor;
    ctx.fillRect(centerX - halfLength, centerY - outerRadius, scaledLength, outerRadius * 2);
    
    // Draw the outline of the main body
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - halfLength, centerY - outerRadius, scaledLength, outerRadius * 2);
    
    // Draw left pin/shaft extending out
    ctx.fillStyle = pinColor;
    ctx.fillRect(centerX - halfLength - scaledPinLength, centerY - scaledPinRadius, scaledPinLength, scaledPinRadius * 2);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(centerX - halfLength - scaledPinLength, centerY - scaledPinRadius, scaledPinLength, scaledPinRadius * 2);
    
    // Draw right pin/shaft extending out
    ctx.fillStyle = pinColor;
    ctx.fillRect(centerX + halfLength, centerY - scaledPinRadius, scaledPinLength, scaledPinRadius * 2);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(centerX + halfLength, centerY - scaledPinRadius, scaledPinLength, scaledPinRadius * 2);
    
    // Draw center lines
    ctx.beginPath();
    ctx.moveTo(centerX - halfLength - scaledPinLength - 20, centerY);
    ctx.lineTo(centerX + halfLength + scaledPinLength + 20, centerY);
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw dimension lines
    
    // Overall length dimension
    const totalLength = scaledLength + (scaledPinLength * 2);
    const dimLineY = centerY + outerRadius + 60;
    
    // Main dimension line
    ctx.beginPath();
    ctx.moveTo(centerX - halfLength - scaledPinLength, dimLineY);
    ctx.lineTo(centerX + halfLength + scaledPinLength, dimLineY);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Extension lines
    ctx.beginPath();
    ctx.moveTo(centerX - halfLength - scaledPinLength, centerY + outerRadius);
    ctx.lineTo(centerX - halfLength - scaledPinLength, dimLineY);
    ctx.moveTo(centerX + halfLength + scaledPinLength, centerY + outerRadius);
    ctx.lineTo(centerX + halfLength + scaledPinLength, dimLineY);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 0.75;
    ctx.setLineDash([4, 2]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Dimension text
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.fillText(`${length + (pinLength * 2)} ${unit}`, centerX, dimLineY - 10);
    
    // Main body dimension
    const bodyDimLineY = centerY + outerRadius + 30;
    
    // Body dimension line
    ctx.beginPath();
    ctx.moveTo(centerX - halfLength, bodyDimLineY);
    ctx.lineTo(centerX + halfLength, bodyDimLineY);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Extension lines
    ctx.beginPath();
    ctx.moveTo(centerX - halfLength, centerY + outerRadius);
    ctx.lineTo(centerX - halfLength, bodyDimLineY);
    ctx.moveTo(centerX + halfLength, centerY + outerRadius);
    ctx.lineTo(centerX + halfLength, bodyDimLineY);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 0.75;
    ctx.setLineDash([4, 2]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Dimension text
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.fillText(`${length} ${unit}`, centerX, bodyDimLineY - 10);
    
    // Height/diameter dimension
    const diamDimLineX = centerX - halfLength - scaledPinLength - 40;
    
    // Dimension line
    ctx.beginPath();
    ctx.moveTo(diamDimLineX, centerY - outerRadius);
    ctx.lineTo(diamDimLineX, centerY + outerRadius);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Extension lines
    ctx.beginPath();
    ctx.moveTo(centerX - halfLength, centerY - outerRadius);
    ctx.lineTo(diamDimLineX, centerY - outerRadius);
    ctx.moveTo(centerX - halfLength, centerY + outerRadius);
    ctx.lineTo(diamDimLineX, centerY + outerRadius);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 0.75;
    ctx.setLineDash([4, 2]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Dimension text
    ctx.save();
    ctx.translate(diamDimLineX - 15, centerY);
    ctx.rotate(-Math.PI/2);
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.fillText(`Ø${outerDiameter} ${unit}`, 0, 0);
    ctx.restore();
    
    // Pin dimension
    const pinDimLineX = centerX - halfLength - scaledPinLength - 80;
    
    // Pin dimension line
    ctx.beginPath();
    ctx.moveTo(pinDimLineX, centerY - scaledPinRadius);
    ctx.lineTo(pinDimLineX, centerY + scaledPinRadius);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Extension lines
    ctx.beginPath();
    ctx.moveTo(centerX - halfLength - scaledPinLength, centerY - scaledPinRadius);
    ctx.lineTo(pinDimLineX, centerY - scaledPinRadius);
    ctx.moveTo(centerX - halfLength - scaledPinLength, centerY + scaledPinRadius);
    ctx.lineTo(pinDimLineX, centerY + scaledPinRadius);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 0.75;
    ctx.setLineDash([4, 2]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Dimension text
    ctx.save();
    ctx.translate(pinDimLineX - 15, centerY);
    ctx.rotate(-Math.PI/2);
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.fillText(`Ø${pinDiameter} ${unit}`, 0, 0);
    ctx.restore();
    
    // Pin length dimension
    const pinLengthDimLineY = centerY - outerRadius - 40;
    
    // Pin length dimension line
    ctx.beginPath();
    ctx.moveTo(centerX - halfLength - scaledPinLength, pinLengthDimLineY);
    ctx.lineTo(centerX - halfLength, pinLengthDimLineY);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Extension lines
    ctx.beginPath();
    ctx.moveTo(centerX - halfLength - scaledPinLength, centerY - scaledPinRadius);
    ctx.lineTo(centerX - halfLength - scaledPinLength, pinLengthDimLineY);
    ctx.moveTo(centerX - halfLength, centerY - outerRadius);
    ctx.lineTo(centerX - halfLength, pinLengthDimLineY);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 0.75;
    ctx.setLineDash([4, 2]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Dimension text
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.fillText(`${pinLength} ${unit}`, centerX - halfLength - scaledPinLength/2, pinLengthDimLineY - 10);
    
    // Add "FRONT VIEW" text
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.fillText("FRONT VIEW", centerX, 40);
  };

  // Draw side view (end view in engineering drawing)
  const drawSideView = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scale: number,
    parameters: IdlerParameters,
    canvasSize: number,
    colors: {
      strokeColor: string;
      textColor: string;
      fillColor: string;
      sectionColor: string;
      pinColor: string;
    }
  ) => {
    const { outerDiameter, innerDiameter, unit } = parameters;
    const { strokeColor, textColor, fillColor } = colors;
    
    // Calculate dimensions
    const outerRadius = (outerDiameter / 2) * scale;
    const innerRadius = (innerDiameter / 2) * scale;
    
    // Draw outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw inner circle (bore)
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw cross center lines
    ctx.beginPath();
    ctx.moveTo(centerX - outerRadius - 20, centerY);
    ctx.lineTo(centerX + outerRadius + 20, centerY);
    ctx.moveTo(centerX, centerY - outerRadius - 20);
    ctx.lineTo(centerX, centerY + outerRadius + 20);
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw outer diameter dimension
    const diamDimLineX = centerX + outerRadius + 50;
    
    // Dimension line
    ctx.beginPath();
    ctx.moveTo(diamDimLineX, centerY - outerRadius);
    ctx.lineTo(diamDimLineX, centerY + outerRadius);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Extension lines
    ctx.beginPath();
    ctx.moveTo(centerX + outerRadius, centerY - outerRadius);
    ctx.lineTo(diamDimLineX, centerY - outerRadius);
    ctx.moveTo(centerX + outerRadius, centerY + outerRadius);
    ctx.lineTo(diamDimLineX, centerY + outerRadius);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 0.75;
    ctx.setLineDash([4, 2]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Dimension text
    ctx.save();
    ctx.translate(diamDimLineX + 15, centerY);
    ctx.rotate(Math.PI/2);
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.fillText(`Ø${outerDiameter} ${unit}`, 0, 0);
    ctx.restore();
    
    // Draw inner diameter dimension
    const innerDimLineX = centerX - outerRadius - 50;
    
    // Dimension line
    ctx.beginPath();
    ctx.moveTo(innerDimLineX, centerY - innerRadius);
    ctx.lineTo(innerDimLineX, centerY + innerRadius);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Extension lines
    ctx.beginPath();
    ctx.moveTo(centerX - innerRadius, centerY - innerRadius);
    ctx.lineTo(innerDimLineX, centerY - innerRadius);
    ctx.moveTo(centerX - innerRadius, centerY + innerRadius);
    ctx.lineTo(innerDimLineX, centerY + innerRadius);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 0.75;
    ctx.setLineDash([4, 2]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Dimension text
    ctx.save();
    ctx.translate(innerDimLineX - 15, centerY);
    ctx.rotate(-Math.PI/2);
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.fillText(`Ø${innerDiameter} ${unit}`, 0, 0);
    ctx.restore();
    
    // Add "SIDE VIEW" text
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.fillText("SIDE VIEW", centerX, 40);
  };

  // Draw section view
  const drawSectionView = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scale: number,
    parameters: IdlerParameters,
    canvasSize: number,
    colors: {
      strokeColor: string;
      textColor: string;
      fillColor: string;
      sectionColor: string;
      pinColor: string;
    }
  ) => {
    const { outerDiameter, innerDiameter, length, pinLength, pinDiameter, unit } = parameters;
    const { strokeColor, textColor, fillColor, sectionColor, pinColor } = colors;
    
    // Calculate dimensions
    const outerRadius = (outerDiameter / 2) * scale;
    const innerRadius = (innerDiameter / 2) * scale;
    const scaledPinLength = pinLength * scale;
    const scaledPinRadius = (pinDiameter / 2) * scale;
    const scaledLength = length * scale;
    const halfLength = scaledLength / 2;
    
    // Draw outer shape (rectangle with section hatching)
    ctx.fillStyle = fillColor;
    ctx.fillRect(centerX - halfLength, centerY - outerRadius, scaledLength, outerRadius * 2);
    
    // Draw outline
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - halfLength, centerY - outerRadius, scaledLength, outerRadius * 2);
    
    // Draw left pin/shaft
    ctx.fillStyle = pinColor;
    ctx.fillRect(centerX - halfLength - scaledPinLength, centerY - scaledPinRadius, scaledPinLength, scaledPinRadius * 2);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(centerX - halfLength - scaledPinLength, centerY - scaledPinRadius, scaledPinLength, scaledPinRadius * 2);
    
    // Draw right pin/shaft
    ctx.fillStyle = pinColor;
    ctx.fillRect(centerX + halfLength, centerY - scaledPinRadius, scaledPinLength, scaledPinRadius * 2);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(centerX + halfLength, centerY - scaledPinRadius, scaledPinLength, scaledPinRadius * 2);
    
    // Draw the inner hole
    ctx.beginPath();
    ctx.rect(centerX - halfLength, centerY - innerRadius, scaledLength, innerRadius * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw section hatch lines
    ctx.beginPath();
    const hatchSpacing = 5;
    
    // Top area hatching
    for (let y = centerY - outerRadius + hatchSpacing; y < centerY - innerRadius; y += hatchSpacing) {
      ctx.moveTo(centerX - halfLength, y);
      ctx.lineTo(centerX + halfLength, y);
    }
    
    // Bottom area hatching
    for (let y = centerY + innerRadius + hatchSpacing; y < centerY + outerRadius; y += hatchSpacing) {
      ctx.moveTo(centerX - halfLength, y);
      ctx.lineTo(centerX + halfLength, y);
    }
    
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 0.5;
    ctx.stroke();
    
    // Draw center lines
    ctx.beginPath();
    ctx.moveTo(centerX - halfLength - scaledPinLength - 20, centerY);
    ctx.lineTo(centerX + halfLength + scaledPinLength + 20, centerY);
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Add "SECTION VIEW" text
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.fillText("SECTION VIEW A-A", centerX, 40);
    
    // Mark section line "A-A"
    // Left A marker
    ctx.beginPath();
    ctx.arc(centerX - halfLength - scaledPinLength - 50, centerY, 15, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "#f44";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "#f44";
    ctx.textAlign = "center";
    ctx.fillText("A", centerX - halfLength - scaledPinLength - 50, centerY + 5);
    
    // Right A marker
    ctx.beginPath();
    ctx.arc(centerX + halfLength + scaledPinLength + 50, centerY, 15, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "#f44";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "#f44";
    ctx.textAlign = "center";
    ctx.fillText("A", centerX + halfLength + scaledPinLength + 50, centerY + 5);
    
    // Section line
    ctx.beginPath();
    ctx.moveTo(centerX - halfLength - scaledPinLength - 30, centerY);
    ctx.lineTo(centerX + halfLength + scaledPinLength + 30, centerY);
    ctx.strokeStyle = "#f44";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  return <canvas 
    ref={canvasRef} 
    className={className}
    style={{ 
      width: '100%', 
      height: 'auto', 
      margin: '0 auto', 
      display: 'block',
      boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
    }} 
  />;
};

// Combined IdlerDrawingArea to show both views
const IdlerDrawingArea: React.FC<{
  parameters: IdlerParameters;
  className?: string;
}> = ({ parameters, className }) => {
  // Calculate a common scale for both views based on the max dimension
  const commonScale = calculateCommonScale(parameters);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-full">
      <div>
        <SingleIdlerView 
          parameters={parameters} 
          view="top" 
          className={className}
          scale={commonScale}
        />
      </div>
      <div>
        <SingleIdlerView 
          parameters={parameters}
          view="side"
          className={className}
          scale={commonScale}
        />
      </div>
    </div>
  );
};

// Export as DXF
const exportAsDXF = (parameters: IdlerParameters) => {
  try {
    const { outerDiameter, length, innerDiameter, pinLength, pinDiameter, unit } = parameters;
    
    // Create a simple DXF for idler
    let dxfContent = "0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nTABLES\n0\nENDSEC\n0\nSECTION\n2\nBLOCKS\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n";
    
    // Top view (front view in engineering terms)
    const outerRadius = outerDiameter / 2;
    const pinRadius = pinDiameter / 2;
    const halfLength = length / 2;
    
    // Main idler body rectangle
    dxfContent += `0\nLINE\n8\nTOP_VIEW\n10\n${-halfLength}\n20\n${-outerRadius}\n30\n0\n11\n${halfLength}\n21\n${-outerRadius}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nTOP_VIEW\n10\n${halfLength}\n20\n${-outerRadius}\n30\n0\n11\n${halfLength}\n21\n${outerRadius}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nTOP_VIEW\n10\n${halfLength}\n20\n${outerRadius}\n30\n0\n11\n${-halfLength}\n21\n${outerRadius}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nTOP_VIEW\n10\n${-halfLength}\n20\n${outerRadius}\n30\n0\n11\n${-halfLength}\n21\n${-outerRadius}\n31\n0\n`;
    
    // Left pin rectangle
    dxfContent += `0\nLINE\n8\nTOP_VIEW\n10\n${-halfLength - pinLength}\n20\n${-pinRadius}\n30\n0\n11\n${-halfLength}\n21\n${-pinRadius}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nTOP_VIEW\n10\n${-halfLength}\n20\n${-pinRadius}\n30\n0\n11\n${-halfLength}\n21\n${pinRadius}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nTOP_VIEW\n10\n${-halfLength}\n20\n${pinRadius}\n30\n0\n11\n${-halfLength - pinLength}\n21\n${pinRadius}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nTOP_VIEW\n10\n${-halfLength - pinLength}\n20\n${pinRadius}\n30\n0\n11\n${-halfLength - pinLength}\n21\n${-pinRadius}\n31\n0\n`;
    
    // Right pin rectangle
    dxfContent += `0\nLINE\n8\nTOP_VIEW\n10\n${halfLength}\n20\n${-pinRadius}\n30\n0\n11\n${halfLength + pinLength}\n21\n${-pinRadius}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nTOP_VIEW\n10\n${halfLength + pinLength}\n20\n${-pinRadius}\n30\n0\n11\n${halfLength + pinLength}\n21\n${pinRadius}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nTOP_VIEW\n10\n${halfLength + pinLength}\n20\n${pinRadius}\n30\n0\n11\n${halfLength}\n21\n${pinRadius}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nTOP_VIEW\n10\n${halfLength}\n20\n${pinRadius}\n30\n0\n11\n${halfLength}\n21\n${-pinRadius}\n31\n0\n`;
    
    // Center line
    dxfContent += `0\nLINE\n8\nCENTERLINE\n6\nCENTER\n10\n${-halfLength - pinLength - 20}\n20\n0\n30\n0\n11\n${halfLength + pinLength + 20}\n21\n0\n31\n0\n`;
    
    // Section line (for section marking)
    dxfContent += `0\nLINE\n8\nSECTION_LINE\n6\nDASHED\n10\n${-halfLength - pinLength - 20}\n20\n0\n30\n0\n11\n${halfLength + pinLength + 20}\n21\n0\n31\n0\n`;
    
    // Section markers
    dxfContent += `0\nCIRCLE\n8\nSECTION_MARKER\n10\n${-halfLength - pinLength - 50}\n20\n0\n30\n0\n40\n15\n`;
    dxfContent += `0\nTEXT\n8\nSECTION_MARKER\n10\n${-halfLength - pinLength - 50}\n20\n0\n30\n0\n40\n10\n1\nA\n`;
    
    dxfContent += `0\nCIRCLE\n8\nSECTION_MARKER\n10\n${halfLength + pinLength + 50}\n20\n0\n30\n0\n40\n15\n`;
    dxfContent += `0\nTEXT\n8\nSECTION_MARKER\n10\n${halfLength + pinLength + 50}\n20\n0\n30\n0\n40\n10\n1\nA\n`;
    
    // Side view (circle) - offset by outerDiameter + 100 in Y
    const sideViewOffsetY = outerDiameter + 100;
    
    // Outer circle
    dxfContent += `0\nCIRCLE\n8\nSIDE_VIEW\n10\n0\n20\n${sideViewOffsetY}\n30\n0\n40\n${outerRadius}\n`;
    
    // Inner circle (bore)
    dxfContent += `0\nCIRCLE\n8\nSIDE_VIEW\n10\n0\n20\n${sideViewOffsetY}\n30\n0\n40\n${innerDiameter/2}\n`;
    
    // Cross center lines
    dxfContent += `0\nLINE\n8\nCENTERLINE\n6\nCENTER\n10\n${-outerRadius-20}\n20\n${sideViewOffsetY}\n30\n0\n11\n${outerRadius+20}\n21\n${sideViewOffsetY}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nCENTERLINE\n6\nCENTER\n10\n0\n20\n${sideViewOffsetY-outerRadius-20}\n30\n0\n11\n0\n21\n${sideViewOffsetY+outerRadius+20}\n31\n0\n`;
    
    // Section view - offset by 2 * outerDiameter + 200 in Y
    const sectionViewOffsetY = 2 * outerDiameter + 200;
    
    // Main rectangle with section lines
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${-halfLength}\n20\n${sectionViewOffsetY - outerRadius}\n30\n0\n11\n${halfLength}\n21\n${sectionViewOffsetY - outerRadius}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${halfLength}\n20\n${sectionViewOffsetY - outerRadius}\n30\n0\n11\n${halfLength}\n21\n${sectionViewOffsetY + outerRadius}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${halfLength}\n20\n${sectionViewOffsetY + outerRadius}\n30\n0\n11\n${-halfLength}\n21\n${sectionViewOffsetY + outerRadius}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${-halfLength}\n20\n${sectionViewOffsetY + outerRadius}\n30\n0\n11\n${-halfLength}\n21\n${sectionViewOffsetY - outerRadius}\n31\n0\n`;
    
    // Left pin rectangle
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${-halfLength - pinLength}\n20\n${sectionViewOffsetY - pinRadius}\n30\n0\n11\n${-halfLength}\n21\n${sectionViewOffsetY - pinRadius}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${-halfLength}\n20\n${sectionViewOffsetY - pinRadius}\n30\n0\n11\n${-halfLength}\n21\n${sectionViewOffsetY + pinRadius}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${-halfLength}\n20\n${sectionViewOffsetY + pinRadius}\n30\n0\n11\n${-halfLength - pinLength}\n21\n${sectionViewOffsetY + pinRadius}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${-halfLength - pinLength}\n20\n${sectionViewOffsetY + pinRadius}\n30\n0\n11\n${-halfLength - pinLength}\n21\n${sectionViewOffsetY - pinRadius}\n31\n0\n`;
    
    // Right pin rectangle
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${halfLength}\n20\n${sectionViewOffsetY - pinRadius}\n30\n0\n11\n${halfLength + pinLength}\n21\n${sectionViewOffsetY - pinRadius}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${halfLength + pinLength}\n20\n${sectionViewOffsetY - pinRadius}\n30\n0\n11\n${halfLength + pinLength}\n21\n${sectionViewOffsetY + pinRadius}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${halfLength + pinLength}\n20\n${sectionViewOffsetY + pinRadius}\n30\n0\n11\n${halfLength}\n21\n${sectionViewOffsetY + pinRadius}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${halfLength}\n20\n${sectionViewOffsetY + pinRadius}\n30\n0\n11\n${halfLength}\n21\n${sectionViewOffsetY - pinRadius}\n31\n0\n`;
    
    // Inner hole (rectangular section)
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${-halfLength}\n20\n${sectionViewOffsetY - innerDiameter/2}\n30\n0\n11\n${halfLength}\n21\n${sectionViewOffsetY - innerDiameter/2}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${halfLength}\n20\n${sectionViewOffsetY - innerDiameter/2}\n30\n0\n11\n${halfLength}\n21\n${sectionViewOffsetY + innerDiameter/2}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${halfLength}\n20\n${sectionViewOffsetY + innerDiameter/2}\n30\n0\n11\n${-halfLength}\n21\n${sectionViewOffsetY + innerDiameter/2}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${-halfLength}\n20\n${sectionViewOffsetY + innerDiameter/2}\n30\n0\n11\n${-halfLength}\n21\n${sectionViewOffsetY - innerDiameter/2}\n31\n0\n`;
    
    // Add title texts
    dxfContent += `0\nTEXT\n8\nTEXT\n10\n0\n20\n${-outerRadius - 40}\n30\n0\n40\n10\n1\nFRONT VIEW\n`;
    dxfContent += `0\nTEXT\n8\nTEXT\n10\n0\n20\n${sideViewOffsetY + outerRadius + 40}\n30\n0\n40\n10\n1\nSIDE VIEW\n`;
    dxfContent += `0\nTEXT\n8\nTEXT\n10\n0\n20\n${sectionViewOffsetY + outerRadius + 40}\n30\n0\n40\n10\n1\nSECTION VIEW A-A\n`;
    
    // Add dimension text
    dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${-outerRadius - 70}\n30\n0\n40\n8\n1\nIDLER DRAWING\n`;
    dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${-outerRadius - 90}\n30\n0\n40\n8\n1\nOuter Diameter: ${outerDiameter}${unit}\n`;
    dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${-outerRadius - 105}\n30\n0\n40\n8\n1\nLength: ${length}${unit}\n`;
    dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${-outerRadius - 120}\n30\n0\n40\n8\n1\nPin Length: ${pinLength}${unit}\n`;
    dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${-outerRadius - 135}\n30\n0\n40\n8\n1\nPin Diameter: ${pinDiameter}${unit}\n`;
    dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${-outerRadius - 150}\n30\n0\n40\n8\n1\nBore: ${innerDiameter}${unit}\n`;
    
    // End the DXF file
    dxfContent += "0\nENDSEC\n0\nEOF";
    
    // Create blob and download
    const blob = new Blob([dxfContent], { type: 'text/plain' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `idler_D${outerDiameter}_L${length}_ID${innerDiameter}_${unit}.dxf`;
    
    link.click();
    toast.success("DXF file exported successfully");
  } catch (error) {
    console.error("Error exporting DXF:", error);
    toast.error("Error exporting DXF file. Please try again.");
  }
};

// Export as PDF
const exportAsPDF = async (parameters: IdlerParameters, drawingRef: React.RefObject<HTMLDivElement>) => {
  try {
    if (!drawingRef.current) {
      toast.error("Drawing not found. Please generate a drawing first.");
      return;
    }
    
    toast.loading("Generating PDF...");
    
    const canvas = await html2canvas(drawingRef.current, {
      scale: 6,
      backgroundColor: null,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    const { outerDiameter, length, innerDiameter, pinLength, pinDiameter, unit } = parameters;
    
    // Create PDF with proper dimensions
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Get PDF dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Create engineering template
    // Background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
    
    // Title box
    pdf.setFillColor(240, 240, 240);
    pdf.rect(10, 10, pdfWidth - 20, 25, 'F');
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.rect(10, 10, pdfWidth - 20, 25, 'S');
    
    // Title
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("IDLER TECHNICAL DRAWING", pdfWidth / 2, 25, { align: 'center' });
    
    // Drawing area border
    pdf.setLineWidth(0.5);
    pdf.rect(10, 45, pdfWidth - 20, pdfHeight - 85, 'S');
    
    // Info box
    pdf.setFillColor(240, 240, 240);
    pdf.rect(10, pdfHeight - 35, pdfWidth - 20, 25, 'F');
    pdf.setLineWidth(0.5);
    pdf.rect(10, pdfHeight - 35, pdfWidth - 20, 25, 'S');
    
    // Dividers
    pdf.line(pdfWidth / 4, pdfHeight - 35, pdfWidth / 4, pdfHeight - 10);
    pdf.line(pdfWidth / 2, pdfHeight - 35, pdfWidth / 2, pdfHeight - 10);
    pdf.line(3 * pdfWidth / 4, pdfHeight - 35, 3 * pdfWidth / 4, pdfHeight - 10);
    
    // Add the drawing with proper scaling
    const drawingAreaX = 20;
    const drawingAreaY = 50;
    const drawingAreaWidth = pdfWidth - 40;
    const drawingAreaHeight = pdfHeight - 90;
    
    const scaleFactor = Math.min(
      drawingAreaWidth / canvas.width,
      drawingAreaHeight / canvas.height
    ) * 1;
    
    const scaledWidth = canvas.width * scaleFactor;
    const scaledHeight = canvas.height * scaleFactor;
    
    const x = drawingAreaX + (drawingAreaWidth - scaledWidth) / 2;
    const y = drawingAreaY + (drawingAreaHeight - scaledHeight) / 2;
    
    pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight, undefined, 'FAST');

    
    // Add specifications
    const date = new Date().toLocaleDateString();
    
    // Calculate approximate weight
    const calculateWeight = () => {
      // Steel density in kg/mm³
      const steelDensity = 0.000007850;
      
      // Convert all dimensions to mm for calculation
      let od = outerDiameter;
      let id = innerDiameter;
      let len = length;
      let pinLen = pinLength;
      let pinDiam = pinDiameter;
      
      if (unit === "cm") {
        od *= 10;
        id *= 10;
        len *= 10;
        pinLen *= 10;
        pinDiam *= 10;
      } else if (unit === "m") {
        od *= 1000;
        id *= 1000;
        len *= 1000;
        pinLen *= 1000;
        pinDiam *= 1000;
      } else if (unit === "in") {
        od *= 25.4;
        id *= 25.4;
        len *= 25.4;
        pinLen *= 25.4;
        pinDiam *= 25.4;
      }
      
      // Volume calculation for hollow cylinder: π * (OD²-ID²)/4 * length
      const mainVolume = Math.PI * (Math.pow(od, 2) - Math.pow(id, 2))/4 * len;
      
      // Volume of the pins (both sides)
      const pinVolume = Math.PI * Math.pow(pinDiam, 2)/4 * pinLen * 2;
      
      // Total volume
      const totalVolume = mainVolume + pinVolume;
      
      // Weight = Volume * Density
      const weight = totalVolume * steelDensity;
      
      return weight.toFixed(2);
    };
    
    // First column: Dimensions
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("DIMENSIONS:", pdfWidth / 8, pdfHeight - 30);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Outer Ø: ${outerDiameter} ${unit}`, pdfWidth / 8, pdfHeight - 25);
    pdf.text(`Inner Ø: ${innerDiameter} ${unit}`, pdfWidth / 8, pdfHeight - 20);
    pdf.text(`Length: ${length} ${unit}`, pdfWidth / 8, pdfHeight - 15);
    
    // Second column: Pin dimensions
    pdf.setFont("helvetica", "bold");
    pdf.text("PIN DETAILS:", 3 * pdfWidth / 8, pdfHeight - 30);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Pin Ø: ${pinDiameter} ${unit}`, 3 * pdfWidth / 8, pdfHeight - 25);
    pdf.text(`Pin Length: ${pinLength} ${unit}`, 3 * pdfWidth / 8, pdfHeight - 20);
    pdf.text(`Total Length: ${length + (pinLength * 2)} ${unit}`, 3 * pdfWidth / 8, pdfHeight - 15);
    
    // Third column: Drawing info
    pdf.setFont("helvetica", "bold");
    pdf.text("DRAWING INFO:", 5 * pdfWidth / 8, pdfHeight - 30);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Date: ${date}`, 5 * pdfWidth / 8, pdfHeight - 25);
    pdf.text("Scale: 1:1", 5 * pdfWidth / 8, pdfHeight - 20);
    pdf.text(`Weight: ~${calculateWeight()} kg`, 5 * pdfWidth / 8, pdfHeight - 15);
    
    // Fourth column: Approval
    pdf.setFont("helvetica", "bold");
    pdf.text("APPROVAL:", 7 * pdfWidth / 8, pdfHeight - 30);
    pdf.setFont("helvetica", "normal");
    pdf.text("PENDING", 7 * pdfWidth / 8, pdfHeight - 25);
    
    // Save the PDF
    pdf.save(`idler_drawing_D${outerDiameter}_L${length}_ID${innerDiameter}_${unit}.pdf`);
    toast.dismiss();
    toast.success("PDF file exported successfully");
  } catch (error) {
    console.error("Error exporting PDF:", error);
    toast.dismiss();
    toast.error("Error exporting PDF file. Please try again.");
  }
};

const IdlerDesign: React.FC = () => {
  const [parameters, setParameters] = useState<IdlerParameters>(DEFAULT_PARAMETERS);
  const [isLoading, setIsLoading] = useState(false);
  const [showSection, setShowSection] = useState(false);
  const drawingRef = useRef<HTMLDivElement>(null);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    if (name === "innerDiameter" && numValue >= parameters.outerDiameter) {
      toast.error("Inner diameter must be smaller than the outer diameter");
      return;
    }
    
    if (name === "pinDiameter" && numValue >= parameters.outerDiameter) {
      toast.error("Pin diameter must be smaller than the outer diameter");
      return;
    }
    
    setParameters((prev) => ({
      ...prev,
      [name]: numValue,
    }));
  };

  // Handle unit change
  const handleUnitChange = (unit: IdlerParameters["unit"]) => {
    setParameters((prev) => ({
      ...prev,
      unit,
    }));
  };

  // Toggle section view
  const handleToggleSection = () => {
    setShowSection(!showSection);
  };

  // Generate drawing (update parameters)
  const handleGenerateDrawing = () => {
    // Validate parameters
    if (parameters.outerDiameter <= 0 || parameters.length <= 0 || parameters.innerDiameter <= 0) {
      toast.error("All dimensions must be positive values");
      return;
    }
    
    if (parameters.innerDiameter >= parameters.outerDiameter) {
      toast.error("Inner diameter must be smaller than the outer diameter");
      return;
    }
    
    if (parameters.pinDiameter >= parameters.outerDiameter) {
      toast.error("Pin diameter must be smaller than the outer diameter");
      return;
    }
    
    // Show success message
    toast.success("Idler drawing updated successfully");
  };

  // Export as PDF
  const handleExportPDF = () => {
    setIsLoading(true);
    exportAsPDF(parameters, drawingRef)
      .finally(() => setIsLoading(false));
  };

  // Export as DXF
  const handleExportDXF = () => {
    setIsLoading(true);
    exportAsDXF(parameters);
    setIsLoading(false);
  };

  // Calculate approximate steel weight
  const calculateWeight = () => {
    const { outerDiameter, length, innerDiameter, pinLength, pinDiameter, unit } = parameters;
    // Steel density in kg/mm³
    const steelDensity = 0.000007850;
    
    // Convert all dimensions to mm for calculation
    let od = outerDiameter;
    let id = innerDiameter;
    let len = length;
    let pinLen = pinLength;
    let pinDiam = pinDiameter;
    
    if (unit === "cm") {
      od *= 10;
      id *= 10;
      len *= 10;
      pinLen *= 10;
      pinDiam *= 10;
    } else if (unit === "m") {
      od *= 1000;
      id *= 1000;
      len *= 1000;
      pinLen *= 1000;
      pinDiam *= 1000;
    } else if (unit === "in") {
      od *= 25.4;
      id *= 25.4;
      len *= 25.4;
      pinLen *= 25.4;
      pinDiam *= 25.4;
    }
    
    // Volume calculation for hollow cylinder: π * (OD²-ID²)/4 * length
    const mainVolume = Math.PI * (Math.pow(od, 2) - Math.pow(id, 2))/4 * len;
    
    // Volume of the pins (both sides)
    const pinVolume = Math.PI * Math.pow(pinDiam, 2)/4 * pinLen * 2;
    
    // Total volume
    const totalVolume = mainVolume + pinVolume;
    
    // Weight = Volume * Density
    const weight = totalVolume * steelDensity;
    
    return weight.toFixed(2);
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
            Idler Design Generator
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Create precise technical drawings for roller idlers with dimensions.
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <div className="control-panel animate-slide-in">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-5">
              <div className="space-y-1.5">
                <Label htmlFor="outerDiameter" className="control-label">
                  Outer Diameter
                </Label>
                <Input
                  id="outerDiameter"
                  name="outerDiameter"
                  type="number"
                  value={parameters.outerDiameter}
                  onChange={handleInputChange}
                  min={1}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="length" className="control-label">
                  Length
                </Label>
                <Input
                  id="length"
                  name="length"
                  type="number"
                  value={parameters.length}
                  onChange={handleInputChange}
                  min={1}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="innerDiameter" className="control-label">
                  Inner Diameter
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
                <Label htmlFor="pinLength" className="control-label">
                  Pin Length
                </Label>
                <Input
                  id="pinLength"
                  name="pinLength"
                  type="number"
                  value={parameters.pinLength}
                  onChange={handleInputChange}
                  min={1}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="pinDiameter" className="control-label">
                  Pin Diameter
                </Label>
                <Input
                  id="pinDiameter"
                  name="pinDiameter"
                  type="number"
                  value={parameters.pinDiameter}
                  onChange={handleInputChange}
                  min={1}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
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
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex gap-2 rounded-md border overflow-hidden w-full sm:w-auto">
                <button
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors",
                    !showSection
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setShowSection(false)}
                >
                  Standard Views
                </button>
                <button
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors",
                    showSection
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setShowSection(true)}
                >
                  Section View
                </button>
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
            className="bg-white rounded-lg shadow-soft border border-border overflow-hidden p-6"
          >
            {/* Conditional rendering based on showSection state */}
            {showSection ? (
              <SingleIdlerView 
                parameters={parameters}
                view="section"
                className="w-full transition-all duration-500 ease-out-expo"
                scale={calculateCommonScale(parameters)}
              />
            ) : (
              <IdlerDrawingArea 
                parameters={parameters}
                className="w-full transition-all duration-500 ease-out-expo"
              />
            )}
            
            {/* Spec table below drawing */}
            
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

export default IdlerDesign;