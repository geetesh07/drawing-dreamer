
import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import PulleyDrawingArea from "@/components/PulleyDrawingArea";

// Define the idler parameters type
interface IdlerParameters {
  diameter: number;
  width: number;
  boreDiameter: number;
  unit: "mm" | "cm" | "m" | "in";
}

// Default idler parameters
const DEFAULT_PARAMETERS: IdlerParameters = {
  diameter: 120,
  width: 30,
  boreDiameter: 20,
  unit: "mm",
};

const IdlerDesign = () => {
  const [parameters, setParameters] = useState<IdlerParameters>(DEFAULT_PARAMETERS);
  const [isLoading, setIsLoading] = useState(false);
  const drawingRef = useRef<HTMLDivElement>(null);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    if (name === "boreDiameter" && numValue >= parameters.diameter) {
      toast.error("Bore diameter must be smaller than the idler diameter");
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

  // Generate drawing (update parameters)
  const handleGenerateDrawing = () => {
    // Validate parameters
    if (parameters.diameter <= 0 || parameters.width <= 0 || parameters.boreDiameter <= 0) {
      toast.error("All dimensions must be positive values");
      return;
    }
    
    if (parameters.boreDiameter >= parameters.diameter) {
      toast.error("Bore diameter must be smaller than the idler diameter");
      return;
    }
    
    // Show success message
    toast.success("Idler drawing updated successfully");
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
      const { diameter, width, boreDiameter, unit } = parameters;
      const date = new Date().toLocaleDateString();
      
      // Add footer with specifications
      pdf.setFontSize(10);
      pdf.text(
        `Idler Drawing - Ø${diameter}×${width} ${unit} - Bore: Ø${boreDiameter} ${unit} - Generated on ${date}`, 
        pdfWidth / 2, 
        pdfHeight - 10, 
        { align: 'center' }
      );
      
      // Save the PDF
      pdf.save(`idler_drawing_D${diameter}_W${width}_${unit}.pdf`);
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
            Idler Design Generator
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Create precise technical drawings for idlers with custom dimensions.
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <div className="control-panel animate-slide-in">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-5">
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
                <Label htmlFor="boreDiameter" className="control-label">
                  Bore Diameter
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
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="mt-8">
          <div 
            ref={drawingRef}
            className="bg-white rounded-lg shadow-soft border border-border overflow-hidden p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top View */}
              <div className="relative">
                <PulleyDrawingArea 
                  parameters={{...parameters, thickness: parameters.width}}
                  view="top"
                  className="w-full transition-all duration-500 ease-out-expo"
                />
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-border rounded-md p-3 shadow-sm text-left">
                  <div className="text-xs font-medium text-muted-foreground">TOP VIEW</div>
                  <div className="text-sm font-medium mt-1">
                    Ø{parameters.diameter} {parameters.unit}
                  </div>
                </div>
              </div>
              
              {/* Side View */}
              <div className="relative">
                <PulleyDrawingArea 
                  parameters={{...parameters, thickness: parameters.width}}
                  view="side"
                  className="w-full transition-all duration-500 ease-out-expo"
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">IDLER DRAWING</div>
                  <div className="text-sm font-medium mt-1">
                    Ø{parameters.diameter} × {parameters.width} {parameters.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">BORE DIAMETER</div>
                  <div className="text-sm font-medium mt-1">
                    Ø{parameters.boreDiameter} {parameters.unit}
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

export default IdlerDesign;
