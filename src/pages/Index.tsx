
import React, { useState, useRef } from "react";
import DrawingArea from "@/components/DrawingArea";
import ControlPanel from "@/components/ControlPanel";
import ViewSelector from "@/components/ViewSelector";
import { DrawingDimensions, DEFAULT_DIMENSIONS, ViewType, generateDXF } from "@/utils/drawingUtils";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";

// Add dynamic imports for the libraries we're using
const loadLibraries = async () => {
  // We're importing these to ensure they're available for the export
  const html2canvasLib = await import("html2canvas");
  const jsPDFLib = await import("jspdf");
  return { html2canvas: html2canvasLib.default, jsPDF: jsPDFLib.jsPDF };
};

const Index = () => {
  const [dimensions, setDimensions] = useState<DrawingDimensions>(DEFAULT_DIMENSIONS);
  const [isLoading, setIsLoading] = useState(false);
  const drawingRef = useRef<HTMLDivElement>(null);

  // Generate drawing (update dimensions)
  const handleGenerateDrawing = () => {
    // Validate dimensions
    if (dimensions.width <= 0 || dimensions.height <= 0 || (dimensions.depth && dimensions.depth <= 0)) {
      toast.error("Dimensions must be positive values");
      return;
    }
    
    // Show success message
    toast.success("Drawing updated successfully");
  };

  // Export as DXF
  const handleExportDXF = async () => {
    setIsLoading(true);
    
    try {
      const { width, height, cornerRadius, unit } = dimensions;
      
      if (width <= 0 || height <= 0) {
        toast.error("Width and height must be positive values");
        setIsLoading(false);
        return;
      }
      
      // Generate DXF content
      const dxfContent = generateDXF(dimensions);
      
      // Create blob and download
      const blob = new Blob([dxfContent], { type: 'text/plain' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `drawing_${width}x${height}R${cornerRadius}${unit}.dxf`;
      
      link.click();
      toast.success("DXF file exported successfully");
    } catch (error) {
      console.error("Error exporting DXF:", error);
      toast.error("Error exporting DXF file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Export as PDF
  const handleExportPDF = async () => {
    setIsLoading(true);
    
    try {
      if (!drawingRef.current) {
        toast.error("Drawing not found. Please generate a drawing first.");
        setIsLoading(false);
        return;
      }
      
      // Load libraries dynamically
      const { html2canvas, jsPDF } = await loadLibraries();
      
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
      const { width, height, cornerRadius, depth, unit } = dimensions;
      const date = new Date().toLocaleDateString();
      
      // Add footer with dimensions
      pdf.setFontSize(10);
      pdf.text(
        `Production Drawing - ${width}x${height}x${depth} ${unit} - R${cornerRadius} ${unit} - Generated on ${date}`, 
        pdfWidth / 2, 
        pdfHeight - 10, 
        { align: 'center' }
      );
      
      // Save the PDF
      pdf.save(`production_drawing_${width}x${height}R${cornerRadius}${unit}.pdf`);
      toast.success("PDF file exported successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
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
            Production Drawing Generator
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Create precise technical drawings with multiple views for manufacturing.
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <ControlPanel
            dimensions={dimensions}
            setDimensions={setDimensions}
            onGenerateDrawing={handleGenerateDrawing}
            onExportDXF={handleExportDXF}
            onExportPDF={handleExportPDF}
          />
        </motion.div>
        
        <motion.div variants={itemVariants} className="mt-8">
          <ViewSelector activeView="top" onViewChange={() => {}} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top View */}
            <div className="relative bg-white rounded-lg shadow-soft border border-border overflow-hidden">
              <DrawingArea 
                dimensions={dimensions} 
                activeView="top" 
                className="w-full transition-all duration-500 ease-out-expo"
              />
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-border rounded-md p-3 shadow-sm text-left">
                <div className="text-xs font-medium text-muted-foreground">TOP VIEW</div>
                <div className="text-sm font-medium mt-1">
                  {dimensions.width} x {dimensions.height} {dimensions.unit}
                </div>
              </div>
            </div>
            
            {/* Side View */}
            <div 
              ref={drawingRef}
              className="relative bg-white rounded-lg shadow-soft border border-border overflow-hidden"
            >
              <DrawingArea 
                dimensions={dimensions} 
                activeView="side" 
                className="w-full transition-all duration-500 ease-out-expo"
              />
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-border rounded-md p-3 shadow-sm text-left">
                <div className="text-xs font-medium text-muted-foreground">SIDE VIEW</div>
                <div className="text-sm font-medium mt-1">
                  {dimensions.depth} x {dimensions.height} {dimensions.unit}
                </div>
              </div>
            </div>
          </div>
          
          {/* Common title block below both views */}
          <div className="mt-6 bg-white/90 backdrop-blur-sm border border-border rounded-md p-4 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground">PRODUCTION DRAWING</div>
                <div className="text-sm font-medium mt-1">
                  {dimensions.width} x {dimensions.height} x {dimensions.depth} {dimensions.unit}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">CORNER RADIUS</div>
                <div className="text-sm font-medium mt-1">
                  {dimensions.cornerRadius} {dimensions.unit}
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

export default Index;
