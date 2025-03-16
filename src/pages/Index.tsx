
import React, { useState, useRef } from "react";
import DrawingArea from "@/components/DrawingArea";
import ControlPanel from "@/components/ControlPanel";
import ViewSelector from "@/components/ViewSelector";
import ExportOptions from "@/components/ExportOptions";
import { DrawingDimensions, DEFAULT_DIMENSIONS } from "@/utils/drawingUtils";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
  const handleExportDXF = () => {
    setIsLoading(true);
    
    try {
      // Using the ExportOptions component's logic directly
      const exportDXFButton = document.querySelector('[data-export-dxf]') as HTMLButtonElement;
      if (exportDXFButton) {
        exportDXFButton.click();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Export as PDF
  const handleExportPDF = () => {
    setIsLoading(true);
    
    try {
      // Using the ExportOptions component's logic directly
      const exportPDFButton = document.querySelector('[data-export-pdf]') as HTMLButtonElement;
      if (exportPDFButton) {
        exportPDFButton.click();
      }
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
          
          {/* Combine both views in a single container for better exporting */}
          <div 
            ref={drawingRef}
            className="bg-white rounded-lg shadow-soft border border-border overflow-hidden p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top View */}
              <div className="relative">
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
              <div className="relative">
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
          </div>
          
          {/* Hidden but functional ExportOptions component */}
          <div className="hidden">
            <ExportOptions dimensions={dimensions} drawingRef={drawingRef} />
          </div>
          
          {/* Visible export buttons that trigger the hidden component functionality */}
          <div className="mt-4 flex justify-end space-x-2">
            <button 
              data-export-dxf
              onClick={() => {
                const exportOptionsEl = document.querySelector('[data-export-dxf]');
                if (exportOptionsEl) {
                  exportOptionsEl.dispatchEvent(new Event('click'));
                }
              }}
              className="text-sm font-medium px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
            >
              Export DXF
            </button>
            <button 
              data-export-pdf
              onClick={() => {
                const exportOptionsEl = document.querySelector('[data-export-pdf]');
                if (exportOptionsEl) {
                  exportOptionsEl.dispatchEvent(new Event('click'));
                }
              }}
              className="text-sm font-medium px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Export PDF
            </button>
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
