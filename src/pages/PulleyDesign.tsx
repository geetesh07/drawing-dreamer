import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Define the pulley parameters type
interface PulleyParameters {
  diameter: number;
  thickness: number;
  boreDiameter: number;
  innerDiameter: number; // New parameter for inner diameter
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
  boreDiameter: 25, // Shaft diameter
  innerDiameter: 70, // New parameter - where V taper extends to
  grooveDepth: 5,
  grooveWidth: 10,
  keyWayWidth: 6,
  keyWayDepth: 3,
  unit: "mm",
};

// PulleyDrawingArea component
const PulleyDrawingArea: React.FC<{
  parameters: PulleyParameters;
  view: "top" | "side";
  className?: string;
}> = ({ parameters, view, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions - increased significantly for better use of space
    const canvasSize = 1200; // Increased for much larger drawings
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    // Enable high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    
    // Calculate scale to fit drawing in canvas - reduced scaling factor to make drawing larger
    const maxDimension = Math.max(parameters.diameter, parameters.thickness) * 1.2; // Reduced scaling factor
    const scale = (canvasSize * 0.6) / maxDimension; // Increased from 0.8 to 0.6 to make drawing larger
    
    // Center point of canvas
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    
    // Draw based on view
    if (view === "top") {
      drawTopView(ctx, centerX, centerY, scale, parameters, canvasSize);
    } else {
      drawSideView(ctx, centerX, centerY, scale, parameters, canvasSize);
    }
  }, [parameters, view]);

  // Draw front view (formerly top view)
  const drawTopView = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scale: number,
    parameters: PulleyParameters,
    canvasSize: number
  ) => {
    const { diameter, boreDiameter, innerDiameter, keyWayWidth, keyWayDepth } = parameters;
    
    // Draw with improved quality
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    // Draw outer circle with higher quality
    ctx.beginPath();
    ctx.arc(centerX, centerY, (diameter / 2) * scale, 0, Math.PI * 2);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    // Draw inner diameter circle (where V taper extends to) with higher quality
    ctx.beginPath();
    ctx.arc(centerX, centerY, (innerDiameter / 2) * scale, 0, Math.PI * 2);
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Calculate keyway and bore parameters
    const keyWayWidth2 = keyWayWidth * scale;
    const boreRadius = (boreDiameter / 2) * scale;
    
    // Draw complete bore circle with higher quality
    ctx.beginPath();
    ctx.arc(centerX, centerY, boreRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5; // Better quality line
    ctx.stroke();
    
    // Draw keyway shape on top
    ctx.beginPath();
    ctx.rect(centerX - keyWayWidth2/2, centerY - boreRadius - keyWayDepth * scale, keyWayWidth2, keyWayDepth * scale);
    ctx.fillStyle = "#FFF"; // Fill with white to "erase" part of the circle
    ctx.fill();
    
    // Redraw keyway outline - thinner
    ctx.beginPath();
    // Left side of keyway
    ctx.moveTo(centerX - keyWayWidth2/2, centerY - boreRadius);
    ctx.lineTo(centerX - keyWayWidth2/2, centerY - boreRadius - keyWayDepth * scale);
    // Top of keyway
    ctx.lineTo(centerX + keyWayWidth2/2, centerY - boreRadius - keyWayDepth * scale);
    // Right side of keyway
    ctx.lineTo(centerX + keyWayWidth2/2, centerY - boreRadius);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1; // Thinner line
    ctx.stroke();
    
    // Draw dimension lines
    drawDimensionLines(ctx, centerX, centerY, scale, "top", parameters, canvasSize);
  };

  // Draw side view (vertical orientation) with improved quality
  const drawSideView = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scale: number,
    parameters: PulleyParameters,
    canvasSize: number
  ) => {
    const { diameter, thickness, boreDiameter, innerDiameter, grooveDepth, grooveWidth, keyWayWidth, keyWayDepth } = parameters;
    
    // Configure for high quality lines
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    // Calculate dimensions
    const pulleyRadius = (diameter / 2) * scale;
    const innerRadius = (innerDiameter / 2) * scale;
    const pulleyThickness = thickness * scale;
    const boreRadius = (boreDiameter / 2) * scale;
    const grooveDepthScaled = grooveDepth * scale;
    const grooveWidthScaled = grooveWidth * scale;
    
    // Calculate positions (for vertical orientation)
    const leftX = centerX - pulleyThickness / 2;
    const rightX = centerX + pulleyThickness / 2;
    const topY = centerY - pulleyRadius;
    const bottomY = centerY + pulleyRadius;
    
    // Draw main body outline with higher quality
    ctx.beginPath();
    ctx.moveTo(leftX, topY); // Top left
    ctx.lineTo(leftX, bottomY); // Bottom left
    ctx.lineTo(rightX, bottomY); // Bottom right
    ctx.lineTo(rightX, topY); // Top right
    ctx.lineTo(leftX, topY); // Back to top left
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2.5; // Increased for better quality
    ctx.stroke();
    
    // Draw the V-groove with proper inward taper with higher quality
    const grooveLeft = centerX - grooveWidthScaled / 2;
    const grooveRight = centerX + grooveWidthScaled / 2;
    
    // Top side V-groove - inward taper with higher quality
    ctx.beginPath();
    ctx.moveTo(grooveLeft, topY);
    ctx.lineTo(centerX, centerY - innerRadius);
    ctx.lineTo(grooveRight, topY);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2.5; // Increased for better quality
    ctx.stroke();
    
    // Bottom side V-groove - inward taper with higher quality
    ctx.beginPath();
    ctx.moveTo(grooveLeft, bottomY);
    ctx.lineTo(centerX, centerY + innerRadius);
    ctx.lineTo(grooveRight, bottomY);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2.5; // Increased for better quality
    ctx.stroke();
    
    // Draw inner diameter outline with improved quality
    ctx.beginPath();
    ctx.moveTo(leftX, centerY - innerRadius);
    ctx.lineTo(rightX, centerY - innerRadius);
    ctx.moveTo(leftX, centerY + innerRadius);
    ctx.lineTo(rightX, centerY + innerRadius);
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]); // Better dash pattern
    ctx.stroke();
    
    // Draw bore (shaft hole) with improved quality
    ctx.beginPath();
    ctx.moveTo(leftX, centerY - boreRadius);
    ctx.lineTo(rightX, centerY - boreRadius);
    ctx.moveTo(leftX, centerY + boreRadius);
    ctx.lineTo(rightX, centerY + boreRadius);
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1.5; 
    ctx.setLineDash([6, 4]); // Better dash pattern
    ctx.stroke();
    
    // Draw keyway with improved quality
    const keyWayWidthScaled = keyWayWidth * scale;
    const keyWayDepthScaled = keyWayDepth * scale;
    
    ctx.beginPath();
    ctx.moveTo(centerX - keyWayWidthScaled/2, centerY - boreRadius);
    ctx.lineTo(centerX - keyWayWidthScaled/2, centerY - boreRadius - keyWayDepthScaled);
    ctx.lineTo(centerX + keyWayWidthScaled/2, centerY - boreRadius - keyWayDepthScaled);
    ctx.lineTo(centerX + keyWayWidthScaled/2, centerY - boreRadius);
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.stroke();
    
    // Draw dimension lines (vertical orientation)
    drawDimensionLines(ctx, centerX, centerY, scale, "side", parameters, canvasSize);
  };

  // Draw dimension lines
  const drawDimensionLines = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scale: number,
    view: "top" | "side",
    parameters: PulleyParameters,
    canvasSize: number
  ) => {
    const { diameter, thickness, boreDiameter, innerDiameter } = parameters;
    
    // Draw arrow with improved style for better visibility
    const drawArrow = (
      fromX: number, 
      fromY: number, 
      angle: number,
      arrowLength: number = 15,
      arrowWidth: number = Math.PI/7
    ) => {
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(
        fromX + arrowLength * Math.cos(angle - arrowWidth),
        fromY + arrowLength * Math.sin(angle - arrowWidth)
      );
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(
        fromX + arrowLength * Math.cos(angle + arrowWidth),
        fromY + arrowLength * Math.sin(angle + arrowWidth)
      );
      ctx.stroke();
    };
    
    // Draw a dimension line with leader lines and arrows - reduced spacing
    const drawDimension = (
      startX: number, 
      startY: number, 
      endX: number, 
      endY: number, 
      labelText: string, 
      labelPosition: "top" | "bottom" | "left" | "right" | "middle" = "top",
      extensionLength: number = 60, // Reduced from 120 to 60
      extensionGap: number = 15    // Reduced from 20 to 15
    ) => {
      const angle = Math.atan2(endY - startY, endX - startX);
      const perpAngle = angle + Math.PI/2;
      
      // Draw extension lines with gap from object
      const startExtX = startX + extensionGap * Math.cos(angle);
      const startExtY = startY + extensionGap * Math.sin(angle);
      const endExtX = endX - extensionGap * Math.cos(angle);
      const endExtY = endY - extensionGap * Math.sin(angle);
      
      // Extension lines
      ctx.beginPath();
      ctx.moveTo(startExtX, startExtY);
      ctx.lineTo(
        startExtX + extensionLength * Math.cos(perpAngle),
        startExtY + extensionLength * Math.sin(perpAngle)
      );
      ctx.moveTo(endExtX, endExtY);
      ctx.lineTo(
        endExtX + extensionLength * Math.cos(perpAngle),
        endExtY + extensionLength * Math.sin(perpAngle)
      );
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 1.2; // Thicker for better visibility
      ctx.stroke();
      
      // Dimension line with arrows
      const dimLineStartX = startExtX + extensionLength * Math.cos(perpAngle);
      const dimLineStartY = startExtY + extensionLength * Math.sin(perpAngle);
      const dimLineEndX = endExtX + extensionLength * Math.cos(perpAngle);
      const dimLineEndY = endExtY + extensionLength * Math.sin(perpAngle);
      
      // Draw dimension line
      ctx.beginPath();
      ctx.moveTo(dimLineStartX, dimLineStartY);
      ctx.lineTo(dimLineEndX, dimLineEndY);
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      
      // Draw arrowheads using the helper function
      const arrowLength = 15; // Increased for better visibility
      
      // Start arrow
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 1.5;
      drawArrow(dimLineStartX, dimLineStartY, angle + Math.PI, arrowLength);
      
      // End arrow
      drawArrow(dimLineEndX, dimLineEndY, angle, arrowLength);
      
      // Calculate the center point for the label
      let labelX = (dimLineStartX + dimLineEndX) / 2;
      let labelY = (dimLineStartY + dimLineEndY) / 2;
      const labelOffset = 10; // Increased offset
      
      // Position the label
      switch(labelPosition) {
        case "top":
          labelY -= labelOffset;
          break;
        case "bottom":
          labelY += labelOffset + 12;
          break;
        case "left":
          labelX -= labelOffset;
          ctx.textAlign = "right";
          break;
        case "right":
          labelX += labelOffset;
          ctx.textAlign = "left";
          break;
        case "middle":
          // Center of the dimension line
          ctx.textAlign = "center";
          break;
      }
      
      // Draw text with more reasonable font size
      ctx.fillStyle = "#000"; // Black for maximum contrast
      ctx.font = "bold 14px Arial"; // Reduced from 18px to 14px
      ctx.textBaseline = "middle";
      // Draw text with slight shadow for better visibility
      ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
      ctx.shadowBlur = 2; // Reduced from 3 to 2
      ctx.shadowOffsetX = 0.5;
      ctx.shadowOffsetY = 0.5;
      ctx.fillText(labelText, labelX, labelY);
      ctx.shadowColor = "transparent"; // Reset shadow
      ctx.textAlign = "left"; // Reset text alignment
    };
    
    // Leader line with text for circular features - reduced spacing
    const drawLeader = (
      circleX: number, 
      circleY: number, 
      radius: number, 
      labelText: string, 
      angle: number,
      leaderLength: number = 100 // Reduced from 200 to 100 for more compact dimensions
    ) => {
      // Calculate point on circle
      const startX = circleX + radius * Math.cos(angle);
      const startY = circleY + radius * Math.sin(angle);
      
      // Calculate end point of leader
      const endX = startX + leaderLength * Math.cos(angle);
      const endY = startY + leaderLength * Math.sin(angle);
      
      // Draw leader line
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      
      // Draw arrow at circle end using the helper function
      const arrowLength = 15; // Larger arrows
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 1.5;
      drawArrow(startX, startY, angle + Math.PI, arrowLength);
      
      // Position text based on angle quadrant with improved spacing
      let textX = endX;
      let textY = endY;
      const textOffset = 12; // Increased offset
      
      if (angle > -Math.PI/4 && angle < Math.PI/4) {
        // Right side
        textX += textOffset;
        ctx.textAlign = "left";
      } else if (angle >= Math.PI/4 && angle < 3*Math.PI/4) {
        // Bottom side
        textY += textOffset + 5;
        ctx.textAlign = "center";
      } else if ((angle >= 3*Math.PI/4 && angle <= Math.PI) || (angle <= -3*Math.PI/4 && angle >= -Math.PI)) {
        // Left side
        textX -= textOffset;
        ctx.textAlign = "right";
      } else {
        // Top side
        textY -= textOffset;
        ctx.textAlign = "center";
      }
      
      // Draw text with more reasonable font size
      ctx.fillStyle = "#000"; // Black for maximum contrast
      ctx.font = "bold 14px Arial"; // Reduced from 18px to 14px
      ctx.textBaseline = "middle";
      // Draw text with slight shadow for better visibility
      ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
      ctx.shadowBlur = 2; // Reduced from 3 to 2
      ctx.shadowOffsetX = 0.5;
      ctx.shadowOffsetY = 0.5;
      ctx.fillText(labelText, textX, textY);
      ctx.shadowColor = "transparent"; // Reset shadow
      ctx.textAlign = "left"; // Reset alignment
    };
    
    // Calculate the optimal angles and lengths for dimension lines to avoid overlap
    const calculateOptimalPlacement = (baseAngle: number, index: number, total: number, radius: number) => {
      // For front view, space out the angle based on the index
      const angleRange = Math.PI * 1.6; // Use most of the circle except the bottom
      const angleStep = angleRange / (total + 1);
      const angle = baseAngle + angleStep * (index + 1);
      
      // Calculate appropriate leader length based on radius but with lower values
      // We need shorter lines to keep dimensions closer to the drawing
      const baseLengthFactor = 1.5; // Reduced from 2.5 to 1.5
      const lengthVariation = 0.3; // Reduced from 0.5 to 0.3
      const lengthFactor = baseLengthFactor - (index * lengthVariation);
      
      // Calculate leader length - proportional to radius but with lower minimum
      const leaderLength = Math.max(radius * lengthFactor, 90); // Reduced from 150 to 90
      
      return { angle, leaderLength };
    };
    
    if (view === "top") {
      // Front view dimensions with dynamic placement
      const elements = [
        { radius: (diameter/2) * scale, label: `Ø${diameter}` },
        { radius: (innerDiameter/2) * scale, label: `Ø${innerDiameter}` },
        { radius: (boreDiameter/2) * scale, label: `Ø${boreDiameter}` }
      ];
      
      // Sort from largest to smallest radius
      elements.sort((a, b) => b.radius - a.radius);
      
      // Base angle for starting the placement
      const baseAngle = Math.PI * 0.1;
      
      // Draw leaders with optimal placement
      elements.forEach((element, i) => {
        const { angle, leaderLength } = calculateOptimalPlacement(baseAngle, i, elements.length, element.radius);
        drawLeader(centerX, centerY, element.radius, element.label, angle, leaderLength);
      });
    } else {
      // Side view - dynamically place dimensions
      const diameterRadius = (diameter/2) * scale;
      const innerRadius = (innerDiameter/2) * scale;
      const boreRadius = (boreDiameter/2) * scale;
      const pulleyThickness = thickness * scale;
      
      // Calculate horizontal and vertical spacing factors based on canvas size - reduced
      const hSpacing = canvasSize * 0.04; // Reduced from 6% to 4% of canvas size
      const vSpacing = canvasSize * 0.08; // Reduced from 15% to 8% of canvas size
      
      // Thickness - place at the TOP with reduced spacing
      drawDimension(
        centerX - pulleyThickness/2, centerY - diameterRadius - vSpacing,
        centerX + pulleyThickness/2, centerY - diameterRadius - vSpacing,
        `${thickness}`,
        "top",
        40 // Reduced from 80 to 40
      );
      
      // Calculate right side spacing to avoid overlap but keep closer
      const rightSideSpacing1 = centerX + pulleyThickness/2 + hSpacing;
      const rightSideSpacing2 = centerX + pulleyThickness/2 + hSpacing * 1.8; // Reduced from 2.5 to 1.8
      
      // Outer diameter - place on RIGHT with reduced spacing
      drawDimension(
        rightSideSpacing1, centerY - diameterRadius,
        rightSideSpacing1, centerY + diameterRadius,
        `Ø${diameter}`,
        "right",
        50 // Reduced from 120 to 50
      );
      
      // Inner diameter - place on RIGHT with reduced spacing
      drawDimension(
        rightSideSpacing2, centerY - innerRadius,
        rightSideSpacing2, centerY + innerRadius,
        `Ø${innerDiameter}`,
        "right",
        40 // Reduced from 80 to 40
      );
      
      // Calculate left side spacing to keep dimensions closer
      const leftSideSpacing = centerX - pulleyThickness/2 - hSpacing;
      
      // Bore diameter - place on LEFT with reduced spacing
      drawDimension(
        leftSideSpacing, centerY - boreRadius,
        leftSideSpacing, centerY + boreRadius,
        `Ø${boreDiameter}`,
        "left",
        50 // Reduced from 120 to 50
      );
    }
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

// Export as DXF (work in progress feature - requires external library)
const handleExportDXF = () => {
  toast.info("DXF export is currently under development");
  // Implementation would need to use a DXF generation library
  // like makerjs or dxf-writer to convert canvas drawing to DXF
};

// Export as 3D Model (conceptual - requires 3D modeling library)
const handleExport3D = () => {
  toast.info("3D model export is currently under development");
  // Implementation would need a 3D modeling library and STEP file exporter
  // Complex implementation requiring Three.js and converter libraries
};

const PulleyDesign = () => {
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

  // Generate drawing (update parameters)
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

  // Export as PDF with template
  const handleExportPDF = async () => {
    try {
      if (!drawingRef.current) {
        toast.error("Drawing not found. Please generate a drawing first.");
        return;
      }
      
      setIsLoading(true);
      toast.loading("Generating PDF...");
      
      const canvas = await html2canvas(drawingRef.current, {
        scale: 4, // High quality export
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 0
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Create PDF with A4 size (as per engineering template format)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Get PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate the available drawing area in the template (based on provided PDF)
      // Approximate coordinates from the template
      const drawingAreaX = pdfWidth * 0.15; // Starting about 15% from left
      const drawingAreaY = pdfHeight * 0.13; // Starting about 13% from top
      const drawingAreaWidth = pdfWidth * 0.73; // About 73% of page width
      const drawingAreaHeight = pdfHeight * 0.55; // About 55% of page height
      
      // Calculate scaling to fit the drawing in the template's drawing area
      const scaleFactor = Math.min(
        drawingAreaWidth / canvas.width,
        drawingAreaHeight / canvas.height
      ) * 0.95; // 95% of available space to leave some margin
      
      const scaledWidth = canvas.width * scaleFactor;
      const scaledHeight = canvas.height * scaleFactor;
      
      // Center the drawing in the drawing area
      const drawingX = drawingAreaX + (drawingAreaWidth - scaledWidth) / 2;
      const drawingY = drawingAreaY + (drawingAreaHeight - scaledHeight) / 2;
      
      // Add background template first (if available)
      // We'll assume you have a base64 encoded version of the template
      // Insert the template image as the background
      try {
        // Dummy base function to load the template - in production, you would use the actual template
        const templateBase64 = 'data:image/png;base64,...'; // This should be replaced with actual template base64
        pdf.addImage(templateBase64, 'PNG', 0, 0, pdfWidth, pdfHeight);
      } catch (error) {
        console.error("Error adding template:", error);
        // If template fails, just add a header
        pdf.setFontSize(14);
        pdf.text("PULLEY DRAWING", pdfWidth / 2, 15, { align: 'center' });
      }
      
      // Add the drawing on top of the template
      pdf.addImage(imgData, 'PNG', drawingX, drawingY, scaledWidth, scaledHeight);
      
      // Add metadata in the template's title block areas
      const { diameter, thickness, boreDiameter, innerDiameter, unit } = parameters;
      const date = new Date().toLocaleDateString();
      
      // Add specifications in appropriate locations
      pdf.setFontSize(9);
      pdf.text(`Pulley Ø${diameter}×${thickness} ${unit}`, pdfWidth * 0.15, pdfHeight * 0.85);
      pdf.text(`Bore: Ø${boreDiameter} ${unit}`, pdfWidth * 0.15, pdfHeight * 0.87);
      pdf.text(`Inner: Ø${innerDiameter} ${unit}`, pdfWidth * 0.15, pdfHeight * 0.89);
      pdf.text(`Date: ${date}`, pdfWidth * 0.6, pdfHeight * 0.85);
      
      // Custom fields in template areas
      pdf.text("Pulley", 145, 85, { align: 'right' });
      pdf.text("Drawing", 145, 90, { align: 'right' });
      
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
      style={{maxWidth: "100vw", overflowX: "hidden"}}
    >
      <div className="max-w-full w-full mx-auto">
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
                <Button variant="outline" onClick={handleExport3D} className="flex-1 sm:flex-none">
                  3D Model
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="mt-8">
          <div 
            ref={drawingRef}
            className="bg-white rounded-lg shadow-soft border border-border overflow-hidden p-4"
            style={{maxWidth: "100%", width: "100%"}}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Front View */}
              <div className="relative">
                <div className="bg-white p-2 rounded-md absolute top-2 left-2 border border-border text-sm font-medium z-10">
                  FRONT VIEW
                </div>
                <PulleyDrawingArea 
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
                <PulleyDrawingArea 
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
                    Ø{parameters.diameter} × {parameters.thickness}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">BORE DIAMETER</div>
                  <div className="text-sm font-medium mt-1">
                    Ø{parameters.boreDiameter}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">INNER DIAMETER</div>
                  <div className="text-sm font-medium mt-1">
                    Ø{parameters.innerDiameter}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">V-GROOVE</div>
                  <div className="text-sm font-medium mt-1">
                    D: {parameters.grooveDepth} × W: {parameters.grooveWidth}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">KEYWAY</div>
                  <div className="text-sm font-medium mt-1">
                    W: {parameters.keyWayWidth} × D: {parameters.keyWayDepth}
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
        </div>
        
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
