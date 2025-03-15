const IdlerDesign = () => {
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
    const { outerDiameter, length, innerDiameter, unit } = parameters;
    // Steel density in kg/mm³
    const steelDensity = 0.000007850;
    
    // Convert all dimensions to mm for calculation
    let od = outerDiameter;
    let id = innerDiameter;
    let len = length;
    
    if (unit === "cm") {
      od *= 10;
      id *= 10;
      len *= 10;
    } else if (unit === "m") {
      od *= 1000;
      id *= 1000;
      len *= 1000;
    } else if (unit === "in") {
      od *= 25.4;
      id *= 25.4;
      len *= 25.4;
    }
    
    // Volume calculation for hollow cylinder: π * (OD²-ID²)/4 * length
    const volume = Math.PI * (Math.pow(od, 2) - Math.pow(id, 2))/4 * len;
    
    // Weight = Volume * Density
    const weight = volume * steelDensity;
    
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
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
            <div className="mt-6 bg-white/90 backdrop-blur-sm border border-border rounded-md p-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">OUTER DIAMETER</div>
                  <div className="text-sm font-medium mt-1">
                    Ø{parameters.outerDiameter} {parameters.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">LENGTH</div>
                  <div className="text-sm font-medium mt-1">
                    {parameters.length} {parameters.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">INNER DIAMETER</div>
                  <div className="text-sm font-medium mt-1">
                    Ø{parameters.innerDiameter} {parameters.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">MATERIAL</div>
                  <div className="text-sm font-medium mt-1">
                    Carbon Steel
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">SURFACE</div>
                  <div className="text-sm font-medium mt-1">
                    Zinc Plated
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
                  <div className="text-xs font-medium text-muted-foreground">WEIGHT</div>
                  <div className="text-sm font-medium mt-1">
                    Approx. {calculateWeight()} kg
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
};// Export as PDF
const exportAsPDF = async (parameters: IdlerParameters, drawingRef: React.RefObject<HTMLDivElement>) => {
  try {
    if (!drawingRef.current) {
      toast.error("Drawing not found. Please generate a drawing first.");
      return;
    }
    
    toast.loading("Generating PDF...");
    
    const canvas = await html2canvas(drawingRef.current, {
      scale: 3,
      backgroundColor: '#ffffff',
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    const { outerDiameter, length, innerDiameter, unit } = parameters;
    
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
    ) * 0.9;
    
    const scaledWidth = canvas.width * scaleFactor;
    const scaledHeight = canvas.height * scaleFactor;
    
    const x = drawingAreaX + (drawingAreaWidth - scaledWidth) / 2;
    const y = drawingAreaY + (drawingAreaHeight - scaledHeight) / 2;
    
    pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
    
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
      
      if (unit === "cm") {
        od *= 10;
        id *= 10;
        len *= 10;
      } else if (unit === "m") {
        od *= 1000;
        id *= 1000;
        len *= 1000;
      } else if (unit === "in") {
        od *= 25.4;
        id *= 25.4;
        len *= 25.4;
      }
      
      // Volume calculation for hollow cylinder: π * (OD²-ID²)/4 * length
      const volume = Math.PI * (Math.pow(od, 2) - Math.pow(id, 2))/4 * len;
      
      // Weight = Volume * Density
      const weight = volume * steelDensity;
      
      return weight.toFixed(2);
    };
    
    // First column: Dimensions
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("DIMENSIONS:", pdfWidth / 8, pdfHeight - 30);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Ø${outerDiameter}×${length} ${unit}`, pdfWidth / 8, pdfHeight - 25);
    pdf.text(`Inner Ø: ${innerDiameter} ${unit}`, pdfWidth / 8, pdfHeight - 20);
    pdf.text(`Weight: ${calculateWeight()} kg`, pdfWidth / 8, pdfHeight - 15);
    
    // Second column: Material
    pdf.setFont("helvetica", "bold");
    pdf.text("MATERIAL:", 3 * pdfWidth / 8, pdfHeight - 30);
    pdf.setFont("helvetica", "normal");
    pdf.text("Carbon Steel", 3 * pdfWidth / 8, pdfHeight - 25);
    pdf.text("Surface: Zinc Plated", 3 * pdfWidth / 8, pdfHeight - 20);
    
    // Third column: Drawing info
    pdf.setFont("helvetica", "bold");
    pdf.text("DRAWING INFO:", 5 * pdfWidth / 8, pdfHeight - 30);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Date: ${date}`, 5 * pdfWidth / 8, pdfHeight - 25);
    pdf.text("Scale: 1:1", 5 * pdfWidth / 8, pdfHeight - 20);
    
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
};import React, { useState, useRef } from "react";
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
  unit: "mm" | "cm" | "m" | "in";
}

// Default idler parameters
const DEFAULT_PARAMETERS: IdlerParameters = {
  outerDiameter: 120,
  length: 300,
  innerDiameter: 25,
  unit: "mm",
};

// Function to calculate common scale factor for both views
const calculateCommonScale = (parameters: IdlerParameters) => {
  const maxDimension = Math.max(parameters.outerDiameter, parameters.length);
  // Base size of a canvas (estimated for display purposes)
  const baseCanvasSize = 600;
  // Allow some margin around the drawing
  const margin = 0.75;
  
  return (baseCanvasSize * margin) / maxDimension;
};

// Single view IdlerDrawingArea component
const SingleIdlerView: React.FC<{
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
    const canvasSize = 1000; 
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

  // Draw top view (concentric circles)
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
    const { outerDiameter, innerDiameter, unit } = parameters;
    const { strokeColor, textColor, fillColor, pinColor } = colors;
    
    // Calculate radii
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
    
    // Draw inner circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = pinColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw center lines (cross hairs)
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
    
    // Draw dimension lines
    drawDimensionLines(ctx, centerX, centerY, scale, parameters, "top", canvasSize, colors);
    
    // Add "FRONT VIEW" text
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.fillText("FRONT VIEW", centerX, 40);
    
    // Add section cut line if section is available
    ctx.beginPath();
    ctx.moveTo(centerX - outerRadius, centerY);
    ctx.lineTo(centerX + outerRadius, centerY);
    ctx.strokeStyle = "#f00";
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Add section markers
    // Marker A - left side
    ctx.beginPath();
    ctx.arc(centerX - outerRadius - 20, centerY, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#f00";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#f00";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("A", centerX - outerRadius - 20, centerY);
    
    // Marker A - right side
    ctx.beginPath();
    ctx.arc(centerX + outerRadius + 20, centerY, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#f00";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#f00";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("A", centerX + outerRadius + 20, centerY);
    
    // Add arrows for section direction
    const arrowSize = 7;
    
    // Left arrow
    ctx.beginPath();
    ctx.moveTo(centerX - outerRadius - 5, centerY + 15);
    ctx.lineTo(centerX - outerRadius - 5 - arrowSize, centerY + 15);
    ctx.lineTo(centerX - outerRadius - 5 - arrowSize/2, centerY + 15 - arrowSize);
    ctx.fillStyle = "#f00";
    ctx.fill();
    
    // Right arrow
    ctx.beginPath();
    ctx.moveTo(centerX + outerRadius + 5, centerY + 15);
    ctx.lineTo(centerX + outerRadius + 5 + arrowSize, centerY + 15);
    ctx.lineTo(centerX + outerRadius + 5 + arrowSize/2, centerY + 15 - arrowSize);
    ctx.fillStyle = "#f00";
    ctx.fill();
  };

  // Draw side view (rectangle)
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
    const { outerDiameter, length, innerDiameter, unit } = parameters;
    const { strokeColor, textColor, fillColor, pinColor } = colors;
    
    // Calculate dimensions
    const outerRadius = (outerDiameter / 2) * scale;
    const innerRadius = (innerDiameter / 2) * scale;
    const idlerLength = length * scale;
    const idlerLeft = centerX - idlerLength / 2;
    const idlerRight = centerX + idlerLength / 2;
    
    // Fill rectangle
    ctx.fillStyle = fillColor;
    ctx.fillRect(idlerLeft, centerY - outerRadius, idlerLength, outerRadius * 2);
    
    // Draw outer shell (cylinder)
    // Top horizontal line
    ctx.beginPath();
    ctx.moveTo(idlerLeft, centerY - outerRadius);
    ctx.lineTo(idlerRight, centerY - outerRadius);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Bottom horizontal line
    ctx.beginPath();
    ctx.moveTo(idlerLeft, centerY + outerRadius);
    ctx.lineTo(idlerRight, centerY + outerRadius);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Left vertical line
    ctx.beginPath();
    ctx.moveTo(idlerLeft, centerY - outerRadius);
    ctx.lineTo(idlerLeft, centerY + outerRadius);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Right vertical line
    ctx.beginPath();
    ctx.moveTo(idlerRight, centerY - outerRadius);
    ctx.lineTo(idlerRight, centerY + outerRadius);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw hidden lines for internal cavity (dashed lines)
    ctx.beginPath();
    ctx.setLineDash([5, 3]);
    
    // Draw the inner hole through the idler (horizontal hidden lines)
    ctx.moveTo(idlerLeft, centerY - innerRadius);
    ctx.lineTo(idlerRight, centerY - innerRadius);
    ctx.moveTo(idlerLeft, centerY + innerRadius);
    ctx.lineTo(idlerRight, centerY + innerRadius);
    
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw center line (vertical)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - outerRadius - 20);
    ctx.lineTo(centerX, centerY + outerRadius + 20);
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw dimension lines
    drawDimensionLines(ctx, centerX, centerY, scale, parameters, "side", canvasSize, colors);
    
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
    const { outerDiameter, length, innerDiameter, unit } = parameters;
    const { strokeColor, textColor, fillColor, sectionColor, pinColor } = colors;
    
    // Calculate dimensions
    const outerRadius = (outerDiameter / 2) * scale;
    const innerRadius = (innerDiameter / 2) * scale;
    const idlerLength = length * scale;
    const idlerLeft = centerX - idlerLength / 2;
    const idlerRight = centerX + idlerLength / 2;
    
    // Fill rectangle
    ctx.fillStyle = fillColor;
    ctx.fillRect(idlerLeft, centerY - outerRadius, idlerLength, outerRadius * 2);
    
    // Draw outer shell (cylinder)
    // Top outer horizontal line
    ctx.beginPath();
    ctx.moveTo(idlerLeft, centerY - outerRadius);
    ctx.lineTo(idlerRight, centerY - outerRadius);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Bottom outer horizontal line
    ctx.beginPath();
    ctx.moveTo(idlerLeft, centerY + outerRadius);
    ctx.lineTo(idlerRight, centerY + outerRadius);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Left vertical line
    ctx.beginPath();
    ctx.moveTo(idlerLeft, centerY - outerRadius);
    ctx.lineTo(idlerLeft, centerY + outerRadius);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Right vertical line
    ctx.beginPath();
    ctx.moveTo(idlerRight, centerY - outerRadius);
    ctx.lineTo(idlerRight, centerY + outerRadius);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw the cut section showing the inner hole
    ctx.beginPath();
    ctx.rect(idlerLeft, centerY - innerRadius, idlerLength, innerRadius * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw section hatch lines
    ctx.beginPath();
    const hatchSpacing = 5;
    for (let y = centerY - outerRadius + hatchSpacing; y < centerY - innerRadius; y += hatchSpacing) {
      ctx.moveTo(idlerLeft, y);
      ctx.lineTo(idlerRight, y);
    }
    for (let y = centerY + innerRadius + hatchSpacing; y < centerY + outerRadius; y += hatchSpacing) {
      ctx.moveTo(idlerLeft, y);
      ctx.lineTo(idlerRight, y);
    }
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 0.5;
    ctx.stroke();
    
    // Draw dimension lines
    drawDimensionLines(ctx, centerX, centerY, scale, parameters, "section", canvasSize, colors);
    
    // Add "SECTION VIEW" text
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.fillText("SECTION VIEW A-A", centerX, 40);
  };

  // Draw dimension lines
  const drawDimensionLines = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scale: number,
    parameters: IdlerParameters,
    view: "top" | "side" | "section",
    canvasSize: number,
    colors: {
      strokeColor: string;
      textColor: string;
      fillColor: string;
      sectionColor: string;
      pinColor: string;
    }
  ) => {
    const { outerDiameter, length, innerDiameter, unit } = parameters;
    const { textColor } = colors;
    
    // Draw arrow helper function
    const drawArrow = (
      fromX: number, 
      fromY: number, 
      angle: number,
      arrowLength: number = 10,
      arrowWidth: number = Math.PI/8
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
    
    // Draw dimensioned line with label
    const drawDimension = (
      startX: number, 
      startY: number, 
      endX: number, 
      endY: number, 
      labelText: string, 
      labelPosition: "top" | "bottom" | "left" | "right" | "middle" = "top",
      extensionLength: number = 40,
      extensionGap: number = 10
    ) => {
      const angle = Math.atan2(endY - startY, endX - startX);
      const perpAngle = angle + Math.PI/2;
      
      // Extension lines
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(
        startX + extensionLength * Math.cos(perpAngle),
        startY + extensionLength * Math.sin(perpAngle)
      );
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX + extensionLength * Math.cos(perpAngle),
        endY + extensionLength * Math.sin(perpAngle)
      );
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Dimension line with arrows
      const dimLineStartX = startX + extensionLength * Math.cos(perpAngle);
      const dimLineStartY = startY + extensionLength * Math.sin(perpAngle);
      const dimLineEndX = endX + extensionLength * Math.cos(perpAngle);
      const dimLineEndY = endY + extensionLength * Math.sin(perpAngle);
      
      ctx.beginPath();
      ctx.moveTo(dimLineStartX, dimLineStartY);
      ctx.lineTo(dimLineEndX, dimLineEndY);
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw arrowheads
      const arrowLength = 10;
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 1.2;
      drawArrow(dimLineStartX, dimLineStartY, angle + Math.PI, arrowLength);
      drawArrow(dimLineEndX, dimLineEndY, angle, arrowLength);
      
      // Calculate the center point for the label
      let labelX = (dimLineStartX + dimLineEndX) / 2;
      let labelY = (dimLineStartY + dimLineEndY) / 2;
      const labelOffset = 15;
      
      // Position the label
      switch(labelPosition) {
        case "top":
          labelY -= labelOffset;
          break;
        case "bottom":
          labelY += labelOffset;
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
          ctx.textAlign = "center";
          break;
      }
      
      // Draw background for text
      const textWidth = ctx.measureText(labelText).width;
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      if (ctx.textAlign === "center") {
        ctx.fillRect(labelX - textWidth/2 - 5, labelY - 9, textWidth + 10, 18);
      } else if (ctx.textAlign === "right") {
        ctx.fillRect(labelX - textWidth - 5, labelY - 9, textWidth + 10, 18);
      } else {
        ctx.fillRect(labelX - 5, labelY - 9, textWidth + 10, 18);
      }
      
      // Draw text
      ctx.fillStyle = textColor;
      ctx.font = "bold 14px Arial";
      ctx.textBaseline = "middle";
      ctx.fillText(labelText, labelX, labelY);
      ctx.textAlign = "left"; // Reset
    };
    
    // Draw leader line with text
    const drawLeader = (
      circleX: number, 
      circleY: number, 
      radius: number, 
      labelText: string, 
      angle: number,
      leaderLength: number = 80,
      textOffsetMultiplier: number = 1
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
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw arrow at circle end
      const arrowLength = 10;
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 1.2;
      drawArrow(startX, startY, angle + Math.PI, arrowLength);
      
      // Position text
      let textX = endX;
      let textY = endY;
      const textOffset = 15 * textOffsetMultiplier;
      
      if (angle > -Math.PI/4 && angle < Math.PI/4) {
        // Right side
        textX += textOffset;
        ctx.textAlign = "left";
      } else if (angle >= Math.PI/4 && angle < 3*Math.PI/4) {
        // Bottom side
        textY += textOffset;
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
      
      // Draw background for text
      const textWidth = ctx.measureText(labelText).width;
      const bgPadding = 6;
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      
      let bgX, bgY, bgWidth, bgHeight;
      
      if (ctx.textAlign === "center") {
        bgX = textX - textWidth/2 - bgPadding;
        bgY = textY - 9;
        bgWidth = textWidth + bgPadding*2;
        bgHeight = 18;
      } else if (ctx.textAlign === "right") {
        bgX = textX - textWidth - bgPadding;
        bgY = textY - 9;
        bgWidth = textWidth + bgPadding*2;
        bgHeight = 18;
      } else {
        bgX = textX - bgPadding;
        bgY = textY - 9;
        bgWidth = textWidth + bgPadding*2;
        bgHeight = 18;
      }
      
      ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
      ctx.strokeStyle = "#ddd";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(bgX, bgY, bgWidth, bgHeight);
      
      // Draw text
      ctx.fillStyle = textColor;
      ctx.font = "bold 14px Arial";
      ctx.textBaseline = "middle";
      ctx.fillText(labelText, textX, textY);
      ctx.textAlign = "left"; // Reset
    };
    
    // Different dimensions based on view
    if (view === "top") {
      // Top view dimensions (different angles to prevent overlap)
      const outerRadius = (outerDiameter/2) * scale;
      const innerRadius = (innerDiameter/2) * scale;
      
      // Outer diameter
      drawLeader(centerX, centerY, outerRadius, `Ø${outerDiameter} ${unit}`, Math.PI * 0.25, 90, 1.2);
      
      // Inner diameter
      drawLeader(centerX, centerY, innerRadius, `Ø${innerDiameter} ${unit}`, Math.PI * 1.75, 70, 1.2);
      
    } else if (view === "side") {
      // Side view dimensions
      const outerRadius = (outerDiameter/2) * scale;
      const innerRadius = (innerDiameter/2) * scale;
      const idlerLength = length * scale;
      const idlerLeft = centerX - idlerLength / 2;
      const idlerRight = centerX + idlerLength / 2;
      
      // Spacing for dimension lines
      const hSpacing = 70;
      const vSpacing = 70;
      
      // Length dimension on top
      drawDimension(
        idlerLeft, centerY - outerRadius - vSpacing,
        idlerRight, centerY - outerRadius - vSpacing,
        `${length} ${unit}`,
        "top",
        30
      );
      
      // Outer diameter on right
      drawDimension(
        idlerRight + hSpacing, centerY - outerRadius,
        idlerRight + hSpacing, centerY + outerRadius,
        `Ø${outerDiameter} ${unit}`,
        "right",
        30
      );
      
      // Inner diameter centerline
      const innerCenterY = centerY;
      drawLeader(
        centerX, innerCenterY,
        10,
        `Ø${innerDiameter} ${unit}`,
        Math.PI * 0.5,
        50,
        1
      );
    } else {
      // Section view dimensions
      const outerRadius = (outerDiameter/2) * scale;
      const innerRadius = (innerDiameter/2) * scale;
      const idlerLength = length * scale;
      const idlerLeft = centerX - idlerLength / 2;
      const idlerRight = centerX + idlerLength / 2;
      
      // Spacing for dimension lines
      const hSpacing = 70;
      const vSpacing = 70;
      
      // Length dimension on top
      drawDimension(
        idlerLeft, centerY - outerRadius - vSpacing,
        idlerRight, centerY - outerRadius - vSpacing,
        `${length} ${unit}`,
        "top",
        30
      );
      
      // Outer diameter on right
      drawDimension(
        idlerRight + hSpacing, centerY - outerRadius,
        idlerRight + hSpacing, centerY + outerRadius,
        `Ø${outerDiameter} ${unit}`,
        "right",
        30
      );
      
      // Inner diameter 
      drawDimension(
        centerX - innerRadius, centerY + outerRadius + vSpacing/2,
        centerX + innerRadius, centerY + outerRadius + vSpacing/2,
        `Ø${innerDiameter} ${unit}`,
        "bottom",
        30
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

// Combined IdlerDrawingArea to show both views
const IdlerDrawingArea: React.FC<{
  parameters: IdlerParameters;
  className?: string;
}> = ({ parameters, className }) => {
  // Calculate a common scale for both views based on the max dimension
  const commonScale = calculateCommonScale(parameters);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
    const { outerDiameter, length, innerDiameter, unit } = parameters;
    
    // Create a simple DXF for idler
    let dxfContent = "0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nTABLES\n0\nENDSEC\n0\nSECTION\n2\nBLOCKS\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n";
    
    // Top view (concentric circles)
    // Outer circle
    dxfContent += `0\nCIRCLE\n8\nTOP_VIEW\n10\n0\n20\n0\n30\n0\n40\n${outerDiameter/2}\n`;
    
    // Inner circle
    dxfContent += `0\nCIRCLE\n8\nTOP_VIEW\n10\n0\n20\n0\n30\n0\n40\n${innerDiameter/2}\n`;
    
    // Section line (horizontal through center)
    dxfContent += `0\nLINE\n8\nSECTION_LINE\n6\nCENTER\n10\n${-outerDiameter/2 - 20}\n20\n0\n30\n0\n11\n${outerDiameter/2 + 20}\n21\n0\n31\n0\n`;
    
    // Section markers (A-A)
    dxfContent += `0\nCIRCLE\n8\nSECTION_MARKER\n10\n${-outerDiameter/2 - 20}\n20\n0\n30\n0\n40\n5\n`;
    dxfContent += `0\nTEXT\n8\nSECTION_MARKER\n10\n${-outerDiameter/2 - 20}\n20\n0\n30\n0\n40\n5\n1\nA\n`;
    
    dxfContent += `0\nCIRCLE\n8\nSECTION_MARKER\n10\n${outerDiameter/2 + 20}\n20\n0\n30\n0\n40\n5\n`;
    dxfContent += `0\nTEXT\n8\nSECTION_MARKER\n10\n${outerDiameter/2 + 20}\n20\n0\n30\n0\n40\n5\n1\nA\n`;
    
    // Side view (offset by outerDiameter + 50)
    const sideViewOffset = outerDiameter + 50;
    
    // Outer rectangle
    // Top horizontal line
    dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${-length/2}\n20\n${sideViewOffset - outerDiameter/2}\n30\n0\n11\n${length/2}\n21\n${sideViewOffset - outerDiameter/2}\n31\n0\n`;
    
    // Bottom horizontal line
    dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${-length/2}\n20\n${sideViewOffset + outerDiameter/2}\n30\n0\n11\n${length/2}\n21\n${sideViewOffset + outerDiameter/2}\n31\n0\n`;
    
    // Left vertical line
    dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${-length/2}\n20\n${sideViewOffset - outerDiameter/2}\n30\n0\n11\n${-length/2}\n21\n${sideViewOffset + outerDiameter/2}\n31\n0\n`;
    
    // Right vertical line
    dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${length/2}\n20\n${sideViewOffset - outerDiameter/2}\n30\n0\n11\n${length/2}\n21\n${sideViewOffset + outerDiameter/2}\n31\n0\n`;
    
    // Hidden lines for internal cavity
    // Top hidden line
    dxfContent += `0\nLINE\n8\nSIDE_VIEW\n6\nDASHED\n10\n${-length/2}\n20\n${sideViewOffset - innerDiameter/2}\n30\n0\n11\n${length/2}\n21\n${sideViewOffset - innerDiameter/2}\n31\n0\n`;
    
    // Bottom hidden line
    dxfContent += `0\nLINE\n8\nSIDE_VIEW\n6\nDASHED\n10\n${-length/2}\n20\n${sideViewOffset + innerDiameter/2}\n30\n0\n11\n${length/2}\n21\n${sideViewOffset + innerDiameter/2}\n31\n0\n`;
    
    // Center line
    dxfContent += `0\nLINE\n8\nCENTERLINE\n6\nCENTER\n10\n${-length/2 - 20}\n20\n${sideViewOffset}\n30\n0\n11\n${length/2 + 20}\n21\n${sideViewOffset}\n31\n0\n`;
    
    // Section view (offset by 2 * outerDiameter + 100)
    const sectionViewOffset = 2 * outerDiameter + 100;
    
    // Outer rectangle
    // Top horizontal line
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${-length/2}\n20\n${sectionViewOffset - outerDiameter/2}\n30\n0\n11\n${length/2}\n21\n${sectionViewOffset - outerDiameter/2}\n31\n0\n`;
    
    // Bottom horizontal line
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${-length/2}\n20\n${sectionViewOffset + outerDiameter/2}\n30\n0\n11\n${length/2}\n21\n${sectionViewOffset + outerDiameter/2}\n31\n0\n`;
    
    // Left vertical line
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${-length/2}\n20\n${sectionViewOffset - outerDiameter/2}\n30\n0\n11\n${-length/2}\n21\n${sectionViewOffset + outerDiameter/2}\n31\n0\n`;
    
    // Right vertical line
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${length/2}\n20\n${sectionViewOffset - outerDiameter/2}\n30\n0\n11\n${length/2}\n21\n${sectionViewOffset + outerDiameter/2}\n31\n0\n`;
    
    // Inner rectangle (cut section)
    // Top horizontal line
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${-length/2}\n20\n${sectionViewOffset - innerDiameter/2}\n30\n0\n11\n${length/2}\n21\n${sectionViewOffset - innerDiameter/2}\n31\n0\n`;
    
    // Bottom horizontal line
    dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${-length/2}\n20\n${sectionViewOffset + innerDiameter/2}\n30\n0\n11\n${length/2}\n21\n${sectionViewOffset + innerDiameter/2}\n31\n0\n`;
    
    // Section title
    dxfContent += `0\nTEXT\n8\nSECTION_VIEW\n10\n0\n20\n${sectionViewOffset - outerDiameter/2 - 15}\n30\n0\n40\n10\n1\nSECTION A-A\n`;
    
    // End DXF
    dxfContent += "0\nENDSEC\n0\nEOF";
    
    // Create and download the DXF file
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
export default IdlerDesign;