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
  outsideDiameter: number;
  insideDiameter: number;
  overpinDiameter: number;
  materialThickness: number;
  width: number;
  pinDiameter: number;
  throughBore: number;
  frontsideOffset: number;
  stickout: number;
  keyWayWidth: number;
  keyWayDepth: number;
  grooveAngle: number;
  unit: "mm" | "cm" | "m" | "in";
}

// Default pulley parameters
const DEFAULT_PARAMETERS: PulleyParameters = {
  outsideDiameter: 100,
  insideDiameter: 60,
  overpinDiameter: 120,
  materialThickness: 10,
  width: 30,
  pinDiameter: 8,
  throughBore: 25,
  frontsideOffset: 5,
  stickout: 12,
  keyWayWidth: 6,
  keyWayDepth: 3,
  grooveAngle: 40,
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
    
    // Set canvas dimensions
    const canvasSize = 500;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    // Calculate scale to fit drawing in canvas
    const maxDimension = Math.max(parameters.outsideDiameter, parameters.overpinDiameter) * 1.2;
    const scale = (canvasSize * 0.8) / maxDimension;
    
    // Center point of canvas
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    
    // Draw based on view
    if (view === "top") {
      drawTopView(ctx, centerX, centerY, scale);
    } else {
      drawSideView(ctx, centerX, centerY, scale);
    }
  }, [parameters, view]);
  
  // Draw top view
  const drawTopView = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scale: number
  ) => {
    const { outsideDiameter, insideDiameter, throughBore, keyWayWidth, keyWayDepth } = parameters;
    
    // Draw outer circle (outside diameter)
    ctx.beginPath();
    ctx.arc(centerX, centerY, (outsideDiameter / 2) * scale, 0, Math.PI * 2);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw inner circle (inside diameter)
    ctx.beginPath();
    ctx.arc(centerX, centerY, (insideDiameter / 2) * scale, 0, Math.PI * 2);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw throughbore circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, (throughBore / 2) * scale, 0, Math.PI * 2);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw keyway as a dotted line extension - not a full rectangle
    // This matches the reference image where the keyway is shown as a reference line
    ctx.beginPath();
    ctx.setLineDash([5, 3]);
    ctx.moveTo(centerX - (throughBore / 2) * scale, centerY);
    ctx.lineTo(centerX - (throughBore / 2) * scale - (keyWayDepth) * scale, centerY);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw keyway width line
    ctx.beginPath();
    ctx.moveTo(centerX - (throughBore / 2) * scale - (keyWayDepth / 2) * scale, centerY - (keyWayWidth / 2) * scale);
    ctx.lineTo(centerX - (throughBore / 2) * scale - (keyWayDepth / 2) * scale, centerY + (keyWayWidth / 2) * scale);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Reset dash
    ctx.setLineDash([]);
    
    // Draw dimension lines
    drawDimensionLines(ctx, centerX, centerY, scale, "top");
    
    // Draw labels
    drawLabels(ctx, centerX, centerY, scale, "top");
  };
  
  // Draw side view
  const drawSideView = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scale: number
  ) => {
    const { 
      outsideDiameter, 
      insideDiameter, 
      overpinDiameter,
      materialThickness,
      width, 
      pinDiameter, 
      throughBore, 
      frontsideOffset,
      stickout,
      grooveAngle 
    } = parameters;
    
    // Calculate dimensions
    const halfWidth = width / 2 * scale;
    const halfOD = outsideDiameter / 2 * scale;
    const halfID = insideDiameter / 2 * scale;
    const halfThroughBore = throughBore / 2 * scale;
    const halfOverpin = overpinDiameter / 2 * scale;
    const halfPinDiameter = pinDiameter / 2 * scale;
    const materialThicknessScaled = materialThickness * scale;
    const frontsideOffsetScaled = frontsideOffset * scale;
    const stickoutScaled = stickout * scale;
    
    // Draw side view outline
    
    // Main body rectangle
    ctx.beginPath();
    ctx.rect(centerX - halfWidth, centerY - halfOD, width * scale, outsideDiameter * scale);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw through bore
    ctx.beginPath();
    ctx.rect(centerX - halfWidth, centerY - halfThroughBore, width * scale, throughBore * scale);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw groove at the top
    const grooveAngleRad = (grooveAngle * Math.PI) / 180;
    const grooveDepth = (overpinDiameter - outsideDiameter) / 2;
    const grooveDepthScaled = grooveDepth * scale;
    
    // Top groove
    ctx.beginPath();
    ctx.moveTo(centerX - halfWidth, centerY - halfOD);
    ctx.lineTo(centerX - halfWidth - grooveDepthScaled, centerY - halfOD - grooveDepthScaled * Math.tan(grooveAngleRad / 2));
    ctx.lineTo(centerX - halfWidth - grooveDepthScaled, centerY - halfOD + pinDiameter * scale);
    ctx.lineTo(centerX - halfWidth, centerY - halfOD + pinDiameter * scale);
    ctx.closePath();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Fill with gradient
    const gradient = ctx.createLinearGradient(
      centerX - halfWidth - grooveDepthScaled, 
      centerY - halfOD, 
      centerX - halfWidth, 
      centerY - halfOD
    );
    gradient.addColorStop(0, "#888");
    gradient.addColorStop(1, "#ccc");
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw pin at the top
    ctx.beginPath();
    ctx.arc(
      centerX - halfWidth - grooveDepthScaled / 2, 
      centerY - halfOD + halfPinDiameter, 
      halfPinDiameter, 
      0, 
      Math.PI * 2
    );
    ctx.fillStyle = "#ddd";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Bottom groove
    ctx.beginPath();
    ctx.moveTo(centerX - halfWidth, centerY + halfOD);
    ctx.lineTo(centerX - halfWidth - grooveDepthScaled, centerY + halfOD + grooveDepthScaled * Math.tan(grooveAngleRad / 2));
    ctx.lineTo(centerX - halfWidth - grooveDepthScaled, centerY + halfOD - pinDiameter * scale);
    ctx.lineTo(centerX - halfWidth, centerY + halfOD - pinDiameter * scale);
    ctx.closePath();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Fill with gradient
    const gradient2 = ctx.createLinearGradient(
      centerX - halfWidth - grooveDepthScaled, 
      centerY + halfOD, 
      centerX - halfWidth, 
      centerY + halfOD
    );
    gradient2.addColorStop(0, "#888");
    gradient2.addColorStop(1, "#ccc");
    ctx.fillStyle = gradient2;
    ctx.fill();
    
    // Draw pin at the bottom
    ctx.beginPath();
    ctx.arc(
      centerX - halfWidth - grooveDepthScaled / 2, 
      centerY + halfOD - halfPinDiameter, 
      halfPinDiameter, 
      0, 
      Math.PI * 2
    );
    ctx.fillStyle = "#ddd";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw material thickness
    ctx.beginPath();
    ctx.rect(
      centerX - halfWidth + frontsideOffsetScaled, 
      centerY - halfID, 
      materialThicknessScaled, 
      insideDiameter * scale
    );
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Fill with gradient
    const gradient3 = ctx.createLinearGradient(
      centerX - halfWidth + frontsideOffsetScaled, 
      centerY, 
      centerX - halfWidth + frontsideOffsetScaled + materialThicknessScaled, 
      centerY
    );
    gradient3.addColorStop(0, "#aaa");
    gradient3.addColorStop(0.5, "#666");
    gradient3.addColorStop(1, "#aaa");
    ctx.fillStyle = gradient3;
    ctx.fill();
    
    // Draw the stickout
    ctx.beginPath();
    ctx.rect(
      centerX - halfWidth + frontsideOffsetScaled + materialThicknessScaled, 
      centerY - halfThroughBore, 
      stickoutScaled, 
      throughBore * scale
    );
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Fill with gradient
    const gradient4 = ctx.createLinearGradient(
      centerX - halfWidth + frontsideOffsetScaled + materialThicknessScaled, 
      centerY, 
      centerX - halfWidth + frontsideOffsetScaled + materialThicknessScaled + stickoutScaled, 
      centerY
    );
    gradient4.addColorStop(0, "#888");
    gradient4.addColorStop(1, "#ccc");
    ctx.fillStyle = gradient4;
    ctx.fill();
    
    // Draw dimension lines
    drawDimensionLines(ctx, centerX, centerY, scale, "side");
    
    // Draw labels
    drawLabels(ctx, centerX, centerY, scale, "side");
  };
  
  // Draw dimension lines
  const drawDimensionLines = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scale: number,
    view: "top" | "side"
  ) => {
    const { 
      outsideDiameter, 
      insideDiameter, 
      overpinDiameter,
      width, 
      throughBore 
    } = parameters;
    
    ctx.setLineDash([5, 3]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#555";
    
    if (view === "top") {
      // Draw crosshair centerlines
      ctx.beginPath();
      ctx.moveTo(centerX - (outsideDiameter / 2) * scale - 20, centerY);
      ctx.lineTo(centerX + (outsideDiameter / 2) * scale + 20, centerY);
      ctx.moveTo(centerX, centerY - (outsideDiameter / 2) * scale - 20);
      ctx.lineTo(centerX, centerY + (outsideDiameter / 2) * scale + 20);
      ctx.stroke();
      
      // Draw outer diameter dimension line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - (outsideDiameter / 2) * scale);
      ctx.lineTo(centerX + (outsideDiameter / 2) * scale + 40, centerY - (outsideDiameter / 2) * scale);
      ctx.lineTo(centerX + (outsideDiameter / 2) * scale + 40, centerY + (outsideDiameter / 2) * scale);
      ctx.lineTo(centerX, centerY + (outsideDiameter / 2) * scale);
      ctx.stroke();
      
    } else {
      // Draw width dimension line
      ctx.beginPath();
      ctx.moveTo(centerX - (width / 2) * scale, centerY - (outsideDiameter / 2) * scale - 40);
      ctx.lineTo(centerX + (width / 2) * scale, centerY - (outsideDiameter / 2) * scale - 40);
      ctx.stroke();
      
      // Draw outside diameter dimension line
      ctx.beginPath();
      ctx.moveTo(centerX + (width / 2) * scale + 20, centerY - (outsideDiameter / 2) * scale);
      ctx.lineTo(centerX + (width / 2) * scale + 40, centerY - (outsideDiameter / 2) * scale);
      ctx.lineTo(centerX + (width / 2) * scale + 40, centerY + (outsideDiameter / 2) * scale);
      ctx.lineTo(centerX + (width / 2) * scale + 20, centerY + (outsideDiameter / 2) * scale);
      ctx.stroke();
      
      // Draw inside diameter dimension line
      ctx.beginPath();
      ctx.moveTo(centerX + (width / 2) * scale + 60, centerY - (insideDiameter / 2) * scale);
      ctx.lineTo(centerX + (width / 2) * scale + 80, centerY - (insideDiameter / 2) * scale);
      ctx.lineTo(centerX + (width / 2) * scale + 80, centerY + (insideDiameter / 2) * scale);
      ctx.lineTo(centerX + (width / 2) * scale + 60, centerY + (insideDiameter / 2) * scale);
      ctx.stroke();
      
      // Draw overpin diameter dimension line
      ctx.beginPath();
      ctx.moveTo(centerX + (width / 2) * scale + 100, centerY - (overpinDiameter / 2) * scale);
      ctx.lineTo(centerX + (width / 2) * scale + 120, centerY - (overpinDiameter / 2) * scale);
      ctx.lineTo(centerX + (width / 2) * scale + 120, centerY + (overpinDiameter / 2) * scale);
      ctx.lineTo(centerX + (width / 2) * scale + 100, centerY + (overpinDiameter / 2) * scale);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  };
  
  // Draw labels
  const drawLabels = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scale: number,
    view: "top" | "side"
  ) => {
    const { 
      outsideDiameter, 
      insideDiameter, 
      overpinDiameter,
      materialThickness,
      width, 
      pinDiameter, 
      throughBore, 
      frontsideOffset,
      stickout,
      unit
    } = parameters;
    
    ctx.font = "12px Arial";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    
    if (view === "top") {
      // Draw keyway label
      ctx.fillText("Keyway", centerX - (throughBore / 2) * scale - 40, centerY - 20);
      
      // Draw outside diameter label
      ctx.fillText(
        `Outside Diameter: ${outsideDiameter}${unit}`, 
        centerX, 
        centerY + (outsideDiameter / 2) * scale + 30
      );
      
      // Draw throughbore label
      ctx.fillText(
        `Throughbore: ${throughBore}${unit}`, 
        centerX, 
        centerY - (throughBore / 2) * scale - 10
      );
    } else {
      // Draw width label
      ctx.fillText(
        `Width: ${width}${unit}`, 
        centerX, 
        centerY - (outsideDiameter / 2) * scale - 50
      );
      
      // Draw pin diameter label
      ctx.fillText(
        `Pin Diameter: ${pinDiameter}${unit}`, 
        centerX - (width / 2) * scale - 60, 
        centerY - (outsideDiameter / 2) * scale + 20
      );
      
      // Draw material thickness label
      ctx.fillText(
        `Material Thickness: ${materialThickness}${unit}`, 
        centerX - (width / 2) * scale + 20, 
        centerY
      );
      
      // Draw outside diameter label
      ctx.fillText(
        `Outside Diameter: ${outsideDiameter}${unit}`, 
        centerX + (width / 2) * scale + 60, 
        centerY
      );
      
      // Draw inside diameter label
      ctx.fillText(
        `Inside Diameter: ${insideDiameter}${unit}`, 
        centerX + (width / 2) * scale + 60, 
        centerY + 20
      );
      
      // Draw overpin diameter label
      ctx.fillText(
        `Overpin Diameter: ${overpinDiameter}${unit}`, 
        centerX + (width / 2) * scale + 60, 
        centerY + 40
      );
      
      // Draw stickout label
      ctx.fillText(
        `Stickout: ${stickout}${unit}`, 
        centerX - (width / 2) * scale + materialThickness * scale + 20, 
        centerY - (throughBore / 2) * scale - 10
      );
      
      // Draw frontside offset label
      ctx.fillText(
        `Frontside Offset: ${frontsideOffset}${unit}`, 
        centerX - (width / 2) * scale + (frontsideOffset / 2) * scale, 
        centerY - (throughBore / 2) * scale - 10
      );
    }
  };
  
  return <canvas ref={canvasRef} className={className} />;
};

const PulleyDesign = () => {
  const [parameters, setParameters] = useState<PulleyParameters>(DEFAULT_PARAMETERS);
  const [isLoading, setIsLoading] = useState(false);
  const drawingRef = useRef<HTMLDivElement>(null);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    if (name === "throughBore" && numValue >= parameters.insideDiameter) {
      toast.error("Throughbore must be smaller than the inside diameter");
      return;
    }
    
    if (name === "insideDiameter" && numValue >= parameters.outsideDiameter) {
      toast.error("Inside diameter must be smaller than the outside diameter");
      return;
    }
    
    if (name === "outsideDiameter" && numValue >= parameters.overpinDiameter) {
      toast.error("Outside diameter must be smaller than the overpin diameter");
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
    if (parameters.outsideDiameter <= 0 || parameters.insideDiameter <= 0 || parameters.throughBore <= 0) {
      toast.error("All diameters must be positive values");
      return;
    }
    
    if (parameters.throughBore >= parameters.insideDiameter) {
      toast.error("Throughbore must be smaller than the inside diameter");
      return;
    }
    
    if (parameters.insideDiameter >= parameters.outsideDiameter) {
      toast.error("Inside diameter must be smaller than the outside diameter");
      return;
    }
    
    if (parameters.outsideDiameter >= parameters.overpinDiameter) {
      toast.error("Outside diameter must be smaller than the overpin diameter");
      return;
    }
    
    if (parameters.width <= 0 || parameters.materialThickness <= 0) {
      toast.error("Width and material thickness must be positive values");
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
        scale: 2, // Increase quality
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
      const scaleFactor = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height) * 0.9;
      const scaledWidth = canvas.width * scaleFactor;
      const scaledHeight = canvas.height * scaleFactor;
      
      // Center the drawing on the PDF
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;
      
      // Add the drawing to the PDF
      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
      
      // Add metadata
      const { outsideDiameter, width, throughBore, unit } = parameters;
      const date = new Date().toLocaleDateString();
      
      // Add footer with specifications
      pdf.setFontSize(10);
      pdf.text(
        `Pulley Drawing - OD: ${outsideDiameter}${unit} × W: ${width}${unit} - Bore: ${throughBore}${unit} - Generated on ${date}`, 
        pdfWidth / 2, 
        pdfHeight - 10, 
        { align: 'center' }
      );
      
      // Save the PDF
      pdf.save(`pulley_drawing_OD${outsideDiameter}_W${width}_${unit}.pdf`);
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
    >
      <div className="max-w-6xl mx-auto">
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Drive Pulley Design Generator
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Create precise technical drawings for drive pulleys with custom dimensions.
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <div className="control-panel bg-card p-5 rounded-lg shadow-sm mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-5">
              <div className="space-y-1.5">
                <Label htmlFor="outsideDiameter" className="control-label">
                  Outside Diameter
                </Label>
                <Input
                  id="outsideDiameter"
                  name="outsideDiameter"
                  type="number"
                  value={parameters.outsideDiameter}
                  onChange={handleInputChange}
                  min={1}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="insideDiameter" className="control-label">
                  Inside Diameter
                </Label>
                <Input
                  id="insideDiameter"
                  name="insideDiameter"
                  type="number"
                  value={parameters.insideDiameter}
                  onChange={handleInputChange}
                  min={1}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="overpinDiameter" className="control-label">
                  Overpin Diameter
                </Label>
                <Input
                  id="overpinDiameter"
                  name="overpinDiameter"
                  type="number"
                  value={parameters.overpinDiameter}
                  onChange={handleInputChange}
                  min={1}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="throughBore" className="control-label">
                  Throughbore
                </Label>
                <Input
                  id="throughBore"
                  name="throughBore"
                  type="number"
                  value={parameters.throughBore}
                  onChange={handleInputChange}
                  min={1}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="width" className="control-label">
                  Width
                </Label>
                <Input
                  id="width"
                  name="width"
                  type="number"
                  value={parameters.width}
                  onChange={handleInputChange}
                  min={1}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="materialThickness" className="control-label">
                  Material Thickness
                </Label>
                <Input
                  id="materialThickness"
                  name="materialThickness"
                  type="number"
                  value={parameters.materialThickness}
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
                <Label htmlFor="frontsideOffset" className="control-label">
                  Frontside Offset
                </Label>
                <Input
                  id="frontsideOffset"
                  name="frontsideOffset"
                  type="number"
                  value={parameters.frontsideOffset}
                  onChange={handleInputChange}
                  min={0}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="stickout" className="control-label">
                  Stickout
                </Label>
                <Input
                  id="stickout"
                  name="stickout"
                  type="number"
                  value={parameters.stickout}
                  onChange={handleInputChange}
                  min={0}
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
                  min={0}
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
                  min={0}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="grooveAngle" className="control-label">
                  Groove Angle (°)
                </Label>
                <Input
                  id="grooveAngle"
                  name="grooveAngle"
                  type="number"
                  value={parameters.grooveAngle}
                  onChange={handleInputChange}
                  min={10}
                  max={90}
                  className="h-9"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
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
                  Export PDF
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="mt-8">
          <div 
            ref={drawingRef}
            className="bg-white rounded-lg shadow-md border border-border overflow-hidden p-6"
          >
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">Drive Pulley</h2>
              <p className="text-sm text-muted-foreground">Reference Drawing</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Top View */}
              <div className="relative bg-gray-50 p-4 rounded-lg">
                <PulleyDrawingArea 
                  parameters={parameters}
                  view="top"
                  className="w-full h-full transition-all duration-500 ease-out-expo"
                />
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-border rounded-md p-3 shadow-sm text-left">
                  <div className="text-xs font-medium text-muted-foreground">TOP VIEW</div>
                  <div className="text-sm font-medium mt-1">
                    Ø{parameters.outsideDiameter} {parameters.unit}
                  </div>
                </div>
              </div>
              
              {/* Side View */}
              <div className="relative bg-gray-50 p-4 rounded-lg">
                <PulleyDrawingArea 
                  parameters={parameters}
                  view="side"
                  className="w-full h-full transition-all duration-500 ease-out-expo"
                />
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-border rounded-md p-3 shadow-sm text-left">
                  <div className="text-xs font-medium text-muted-foreground">SIDE VIEW</div>
                  <div className="text-sm font-medium mt-1">
                    W: {parameters.width} {parameters.unit}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Common title block below both views */}
            <div className="mt-6 bg-white/90 backdrop-blur-sm border border-border rounded-md p-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">PULLEY DRAWING</div>
                  <div className="text-sm font-medium mt-1">
                    OD: Ø{parameters.outsideDiameter} {parameters.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">BORE</div>
                  <div className="text-sm font-medium mt-1">
                    Ø{parameters.throughBore} {parameters.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">GROOVE</div>
                  <div className="text-sm font-medium mt-1">
                    {parameters.grooveAngle}° Angle
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
