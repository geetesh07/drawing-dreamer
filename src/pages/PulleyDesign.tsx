import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import * as makerjs from 'makerjs';

// Define the pulley parameters type
interface PulleyParameters {
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

// Create a component for displaying Maker.js models
const MakerJsDrawing: React.FC<{
  parameters: PulleyParameters;
  view: "top" | "side";
  className?: string;
}> = ({ parameters, view, className }) => {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (svgContainerRef.current) {
      // Clear any previous content
      svgContainerRef.current.innerHTML = '';
      
      try {
        // Create the model based on view type
        const model = view === "top" 
          ? createTopViewModel(parameters) 
          : createSideViewModel(parameters);
        
        // Convert to SVG
        const svgOptions = {
          svgAttrs: { 
            width: '100%', 
            height: '100%',
            class: 'pulley-drawing',
            viewBox: '-110 -110 220 220' // Center the drawing and allow space for dimensions
          },
          fontSize: 10,
          useSvgPathOnly: false
        };
        
        const svgString = makerjs.exporter.toSVG(model, svgOptions);
        
        // Insert SVG into the container
        svgContainerRef.current.innerHTML = svgString;
      } catch (error) {
        console.error("Error rendering MakerJS drawing:", error);
        // Fallback to a simple message if drawing fails
        svgContainerRef.current.innerHTML = `<div style="display: flex; height: 100%; align-items: center; justify-content: center; color: #666;">
          <p>Drawing engine error: ${(error as Error).message || "Unknown error"}</p>
        </div>`;
      }
    }
  }, [parameters, view]);
  
  // Create a top view model
  function createTopViewModel(params: PulleyParameters) {
    // Create a new model
    const model: makerjs.IModel = { 
      models: {}, 
      paths: {} 
    };
    
    const outerRadius = params.diameter / 2;
    const innerRadius = params.innerDiameter / 2;
    const boreRadius = params.boreDiameter / 2;
    
    // Create circles for outer diameter
    model.paths['outerCircle'] = new makerjs.paths.Circle([0, 0], outerRadius);
    model.paths['innerCircle'] = new makerjs.paths.Circle([0, 0], innerRadius);
    model.paths['boreCircle'] = new makerjs.paths.Circle([0, 0], boreRadius);
    
    // Add keyway - using models.Rectangle instead of paths.Rectangle
    const keyWayHalfWidth = params.keyWayWidth / 2;
    const keyWayDepth = params.keyWayDepth;
    
    // Create a rectangle model for the keyway
    model.models['keyway'] = new makerjs.models.Rectangle(
      params.keyWayWidth,
      params.keyWayDepth
    );
    
    // Position the keyway correctly
    makerjs.model.move(model.models['keyway'], 
      [-keyWayHalfWidth, -boreRadius - params.keyWayDepth]
    );
    
    return model;
  }
  
  // Create a side view model
  function createSideViewModel(params: PulleyParameters) {
    // Create a new model
    const model: makerjs.IModel = { 
      models: {}, 
      paths: {} 
    };
    
    const outerRadius = params.diameter / 2;
    const innerRadius = params.innerDiameter / 2;
    const boreRadius = params.boreDiameter / 2;
    const halfThickness = params.thickness / 2;
    const grooveWidth = params.grooveWidth;
    const grooveHalfWidth = grooveWidth / 2;
    
    // Main outline (rectangle)
    model.models['outline'] = new makerjs.models.Rectangle(
      params.thickness,
      params.diameter
    );
    
    // Center the outline rectangle
    makerjs.model.move(model.models['outline'], 
      [-halfThickness, -outerRadius]
    );
    
    // Inner diameter line (top)
    model.paths['innerTop'] = new makerjs.paths.Line(
      [-halfThickness, -innerRadius],
      [halfThickness, -innerRadius]
    );
    
    // Inner diameter line (bottom)
    model.paths['innerBottom'] = new makerjs.paths.Line(
      [-halfThickness, innerRadius],
      [halfThickness, innerRadius]
    );
    
    // Bore diameter line (top)
    model.paths['boreTop'] = new makerjs.paths.Line(
      [-halfThickness, -boreRadius],
      [halfThickness, -boreRadius]
    );
    
    // Bore diameter line (bottom)
    model.paths['boreBottom'] = new makerjs.paths.Line(
      [-halfThickness, boreRadius],
      [halfThickness, boreRadius]
    );
    
    // V-groove (top)
    model.paths['vGrooveTop1'] = new makerjs.paths.Line(
      [-grooveHalfWidth, -outerRadius],
      [0, -innerRadius]
    );
    
    model.paths['vGrooveTop2'] = new makerjs.paths.Line(
      [0, -innerRadius],
      [grooveHalfWidth, -outerRadius]
    );
    
    // V-groove (bottom)
    model.paths['vGrooveBottom1'] = new makerjs.paths.Line(
      [-grooveHalfWidth, outerRadius],
      [0, innerRadius]
    );
    
    model.paths['vGrooveBottom2'] = new makerjs.paths.Line(
      [0, innerRadius],
      [grooveHalfWidth, outerRadius]
    );
    
    // Keyway
    const keyWayHalfWidth = params.keyWayWidth / 2;
    const keyWayDepth = params.keyWayDepth;
    
    // Create a rectangle model for the keyway
    model.models['keyway'] = new makerjs.models.Rectangle(
      params.keyWayWidth, 
      params.keyWayDepth
    );
    
    // Position the keyway correctly
    makerjs.model.move(model.models['keyway'], 
      [-keyWayHalfWidth, -boreRadius - params.keyWayDepth]
    );
    
    return model;
  }
  
  return (
    <div 
      ref={svgContainerRef} 
      className={`w-full h-96 ${className}`}
      style={{ minHeight: "400px", border: "1px solid #eee", backgroundColor: "#fff" }}
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
      // Create models for both views
      const topViewModel = createTopViewModel(parameters);
      const sideViewModel = createSideViewModel(parameters);
      
      // Combine models
      const combinedModel: makerjs.IModel = { models: {} };
      combinedModel.models = {
        topView: topViewModel,
        sideView: makerjs.model.move(sideViewModel, [parameters.diameter * 1.5, 0])
      };
      
      // Generate DXF content
      const dxfContent = makerjs.exporter.toDXF(combinedModel);
      
      // Create blob and download
      const blob = new Blob([dxfContent], { type: 'application/dxf' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `pulley_drawing_D${parameters.diameter}_T${parameters.thickness}_${parameters.unit}.dxf`;
      
      link.click();
      toast.success("DXF file exported successfully");
    } catch (error) {
      console.error("Error exporting DXF:", error);
      toast.error("Error exporting DXF file. Please try again.");
    }
  };
  
  // Create a clean top view model for export
  function createTopViewModel(params: PulleyParameters) {
    // Create a new model
    const model: makerjs.IModel = { models: {}, paths: {} };
    
    const outerRadius = params.diameter / 2;
    const innerRadius = params.innerDiameter / 2;
    const boreRadius = params.boreDiameter / 2;
    
    // Create circles for outer diameter, inner diameter, and bore
    model.paths['outerCircle'] = new makerjs.paths.Circle([0, 0], outerRadius);
    model.paths['innerCircle'] = new makerjs.paths.Circle([0, 0], innerRadius);
    model.paths['boreCircle'] = new makerjs.paths.Circle([0, 0], boreRadius);
    
    // Add keyway using models.Rectangle
    const keyWayHalfWidth = params.keyWayWidth / 2;
    
    model.models['keyway'] = new makerjs.models.Rectangle(
      params.keyWayWidth,
      params.keyWayDepth
    );
    
    // Position the keyway
    makerjs.model.move(model.models['keyway'], 
      [-keyWayHalfWidth, -boreRadius - params.keyWayDepth]
    );
    
    return model;
  }
  
  // Create a clean side view model for export
  function createSideViewModel(params: PulleyParameters) {
    // Create a new model
    const model: makerjs.IModel = { models: {}, paths: {} };
    
    const outerRadius = params.diameter / 2;
    const innerRadius = params.innerDiameter / 2;
    const boreRadius = params.boreDiameter / 2;
    const halfThickness = params.thickness / 2;
    const grooveWidth = params.grooveWidth;
    const grooveHalfWidth = grooveWidth / 2;
    
    // Main outline using models.Rectangle
    model.models['outline'] = new makerjs.models.Rectangle(
      params.thickness,
      params.diameter
    );
    
    // Center the rectangle
    makerjs.model.move(model.models['outline'], 
      [-halfThickness, -outerRadius]
    );
    
    // Inner diameter lines
    model.paths['innerTop'] = new makerjs.paths.Line(
      [-halfThickness, -innerRadius],
      [halfThickness, -innerRadius]
    );
    
    model.paths['innerBottom'] = new makerjs.paths.Line(
      [-halfThickness, innerRadius],
      [halfThickness, innerRadius]
    );
    
    // Bore diameter lines
    model.paths['boreTop'] = new makerjs.paths.Line(
      [-halfThickness, -boreRadius],
      [halfThickness, -boreRadius]
    );
    
    model.paths['boreBottom'] = new makerjs.paths.Line(
      [-halfThickness, boreRadius],
      [halfThickness, boreRadius]
    );
    
    // V-groove (top)
    model.paths['vGrooveTop1'] = new makerjs.paths.Line(
      [-grooveHalfWidth, -outerRadius],
      [0, -innerRadius]
    );
    
    model.paths['vGrooveTop2'] = new makerjs.paths.Line(
      [0, -innerRadius],
      [grooveHalfWidth, -outerRadius]
    );
    
    // V-groove (bottom)
    model.paths['vGrooveBottom1'] = new makerjs.paths.Line(
      [-grooveHalfWidth, outerRadius],
      [0, innerRadius]
    );
    
    model.paths['vGrooveBottom2'] = new makerjs.paths.Line(
      [0, innerRadius],
      [grooveHalfWidth, outerRadius]
    );
    
    // Keyway
    const keyWayHalfWidth = params.keyWayWidth / 2;
    
    // Create a rectangle model for the keyway
    model.models['keyway'] = new makerjs.models.Rectangle(
      params.keyWayWidth, 
      params.keyWayDepth
    );
    
    // Position the keyway correctly
    makerjs.model.move(model.models['keyway'], 
      [-keyWayHalfWidth, -boreRadius - params.keyWayDepth]
    );
    
    return model;
  }

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
                <MakerJsDrawing 
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
                <MakerJsDrawing 
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
