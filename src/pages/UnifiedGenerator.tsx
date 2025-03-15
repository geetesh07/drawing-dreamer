import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import DrawingArea from "@/components/DrawingArea";
import PulleyDrawingArea from "@/components/PulleyDrawingArea";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { 
  DrawingDimensions, 
  DEFAULT_DIMENSIONS,
  ViewType,
  formatWithUnit,
  generateDXF
} from "@/utils/drawingUtils";

// Define the input parameters type
interface InputParameters {
  // Common parameters
  beltWidth: number;
  beltSpeed: number;
  capacity: number;
  material: string;
  inclination: number;
  
  // Unit
  unit: "mm" | "cm" | "m" | "in";
}

// Parameters for different components
interface CalculatedParameters {
  // Conveyor parameters
  conveyor: DrawingDimensions;
  
  // Pulley parameters
  pulley: {
    diameter: number;
    thickness: number;
    boreDiameter: number;
    innerDiameter: number;
    grooveDepth: number;
    grooveWidth: number;
    keyWayWidth: number;
    keyWayDepth: number;
    unit: "mm" | "cm" | "m" | "in";
  };
  
  // Idler parameters
  idler: {
    outerDiameter: number;
    length: number;
    innerDiameter: number;
    unit: "mm" | "cm" | "m" | "in";
  };

  // Calculation details - for displaying intermediate calculation results
  details: {
    areaCross: number;
    areaCrossSqM: number;
    calculatedCapacity: number;
    beltLoad: number;
    effectiveBeltWidth: number;
    centralHeight: number;
    materialHeight: number;
    materialDensity: number;
    loadFactor: number;
    capacityFactor: number;
  };
}

// Default input parameters
const DEFAULT_INPUT_PARAMETERS: InputParameters = {
  beltWidth: 1000,
  beltSpeed: 1.5,
  capacity: 500,
  material: "coal",
  inclination: 10,
  unit: "mm"
};

const UnifiedGenerator = () => {
  const [inputParams, setInputParams] = useState<InputParameters>(DEFAULT_INPUT_PARAMETERS);
  const [calculatedParams, setCalculatedParams] = useState<CalculatedParameters | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("input");
  const [activeAccordion, setActiveAccordion] = useState<string[]>(["conveyor"]);
  
  // Drawing refs for exports
  const conveyorRef = useRef<HTMLDivElement>(null);
  const pulleyRef = useRef<HTMLDivElement>(null);
  const idlerRef = useRef<HTMLDivElement>(null);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric values
    if (["beltWidth", "beltSpeed", "capacity", "inclination"].includes(name)) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setInputParams(prev => ({
          ...prev,
          [name]: numValue
        }));
      }
    } else {
      // Handle string values
      setInputParams(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle unit change
  const handleUnitChange = (unit: InputParameters["unit"]) => {
    setInputParams(prev => ({
      ...prev,
      unit
    }));
  };

  // Calculate parameters based on formulas
  const calculateParameters = () => {
    try {
      const { beltWidth, beltSpeed, capacity, material, inclination, unit } = inputParams;
      
      // Validate inputs
      if (beltWidth <= 0 || beltSpeed <= 0 || capacity <= 0) {
        toast.error("All values must be positive");
        return;
      }
      
      // Convert belt width to mm for calculations (if needed)
      let beltWidthMm = beltWidth;
      if (unit === "cm") beltWidthMm = beltWidth * 10;
      if (unit === "m") beltWidthMm = beltWidth * 1000;
      if (unit === "in") beltWidthMm = beltWidth * 25.4;
      
      // Material density approximation (kg/m³)
      const materialDensity = {
        coal: 800,
        sand: 1500,
        gravel: 1800,
        ore: 2500,
        grain: 750
      }[material] || 1000;
      
      // ------------------------ CONVEYOR CALCULATIONS -------------------------
      
      // Belt cross-sectional area calculation
      const surchargeAngle = 20; // Angle of surcharge in degrees
      const surchargeAngleRad = (surchargeAngle * Math.PI) / 180;
      
      // Carrying idler configuration
      const troughAngle = 35; // Degrees
      const troughAngleRad = (troughAngle * Math.PI) / 180;
      
      // Calculate the effective belt width (considering trough)
      const effectiveBeltWidth = beltWidthMm * Math.cos(troughAngleRad);
      
      // Calculate the height of the material based on trough angle
      const materialHeight = (beltWidthMm / 6) * Math.tan(troughAngleRad);
      
      // Calculate the height of material at the center
      const centralHeight = materialHeight + (beltWidthMm / 2) * Math.tan(surchargeAngleRad);
      
      // Cross-sectional area of material
      const areaCross = 0.16667 * beltWidthMm * centralHeight;
      
      // Conveyor capacity formula: Q = 3.6 * A * v * ρ
      // where A is area in m², v is speed in m/s, ρ is density in t/m³
      const areaCrossSqM = areaCross / 1000000; // Convert from mm² to m²
      const calculatedCapacity = 3.6 * areaCrossSqM * beltSpeed * (materialDensity / 1000);
      
      // Calculate load on belt
      const beltLoad = calculatedCapacity / (3.6 * beltSpeed); // kg/m
      
      // Conveyor dimensions for drawing
      const conveyorLength = beltWidthMm * 5; // Belt width to length ratio typically 1:5
      const conveyorDepth = Math.max(50, beltWidthMm * 0.2); // Minimum 50mm or 20% of width
      
      // ------------------------ PULLEY CALCULATIONS --------------------------
      
      // Pulley diameter based on belt width and speed
      let pulleyDiameter = 0;
      
      // Determine minimum pulley diameter based on belt width and speed
      if (beltSpeed < 2.5) {
        pulleyDiameter = beltWidthMm * 0.5; // 50% of belt width for low speeds
      } else if (beltSpeed < 5) {
        pulleyDiameter = beltWidthMm * 0.6; // 60% of belt width for medium speeds
      } else {
        pulleyDiameter = beltWidthMm * 0.7; // 70% of belt width for high speeds
      }
      
      // Adjust for capacity
      const capacityFactor = 1 + (capacity / 5000); // Increase diameter for higher capacity
      pulleyDiameter *= capacityFactor;
      
      // Round to standard sizes
      pulleyDiameter = Math.ceil(pulleyDiameter / 50) * 50; // Round up to nearest 50mm
      
      // Pulley face width is wider than belt width to accommodate tracking
      const pulleyThickness = beltWidthMm * 1.2;
      
      // Shaft diameter based on load and pulley diameter
      const loadFactor = Math.sqrt(capacity / 100); // Simple factor for load
      const pulleyBoreDiameter = Math.max(50, pulleyDiameter * 0.2 * loadFactor); // Minimum 50mm
      
      // Inner diameter where V-groove extends to
      const pulleyInnerDiameter = pulleyDiameter * 0.7;
      
      // Groove dimensions
      const grooveDepth = pulleyDiameter * 0.05;
      const grooveWidth = pulleyDiameter * 0.1;
      
      // Keyway dimensions based on shaft size
      const keyWayWidth = Math.max(8, pulleyBoreDiameter * 0.25);
      const keyWayDepth = keyWayWidth * 0.5;
      
      // ------------------------ IDLER CALCULATIONS --------------------------
      
      // Idler roller diameter based on belt width and load
      let idlerDiameter = 0;
      
      // Standard idler sizing based on belt width
      if (beltWidthMm <= 500) {
        idlerDiameter = 89; // mm
      } else if (beltWidthMm <= 800) {
        idlerDiameter = 108; // mm
      } else if (beltWidthMm <= 1200) {
        idlerDiameter = 133; // mm
      } else if (beltWidthMm <= 1600) {
        idlerDiameter = 159; // mm
      } else {
        idlerDiameter = 194; // mm
      }
      
      // Adjust for load and speed
      if (capacity > 1000 || beltSpeed > 3.5) {
        idlerDiameter *= 1.2; // Increase by 20% for heavy duty
      }
      
      // Idler width is slightly wider than belt width
      const idlerWidth = beltWidthMm * 1.1;
      
      // Idler shaft diameter based on idler diameter and load
      const idlerBoreDiameter = Math.max(20, idlerDiameter * 0.25);
      
      // Create calculated parameters
      const params: CalculatedParameters = {
        conveyor: {
          width: conveyorLength, // Length of the conveyor
          height: beltWidthMm, // Width of the conveyor
          depth: conveyorDepth, // Depth/thickness of the conveyor
          cornerRadius: 0, // No corner radius for conveyor
          unit: unit
        },
        pulley: {
          diameter: pulleyDiameter,
          thickness: pulleyThickness,
          boreDiameter: pulleyBoreDiameter,
          innerDiameter: pulleyInnerDiameter,
          grooveDepth: grooveDepth,
          grooveWidth: grooveWidth,
          keyWayWidth: keyWayWidth,
          keyWayDepth: keyWayDepth,
          unit: unit
        },
        idler: {
          outerDiameter: idlerDiameter,
          length: idlerWidth,
          innerDiameter: idlerBoreDiameter,
          unit: unit
        },
        // Store calculation details for displaying in the UI
        details: {
          areaCross,
          areaCrossSqM,
          calculatedCapacity,
          beltLoad,
          effectiveBeltWidth,
          centralHeight,
          materialHeight,
          materialDensity,
          loadFactor,
          capacityFactor
        }
      };
      
      setCalculatedParams(params);
      
      // Switch to results tab
      setActiveTab("results");
      
      toast.success("Parameters calculated successfully");
    } catch (error) {
      console.error("Calculation error:", error);
      toast.error("Error calculating parameters");
    }
  };
  
  // Export as PDF with template
  const handleExportPDF = async (componentRef: React.RefObject<HTMLDivElement>, title: string) => {
    try {
      if (!componentRef.current) {
        toast.error("Drawing element not found");
        return;
      }
      
      setIsLoading(true);
      toast.loading(`Generating ${title} PDF...`);
      
      const canvas = await html2canvas(componentRef.current, {
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
      
      // First create a white background covering the whole page
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
      
      // Try to load template image
      try {
        // Add template or border
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.rect(10, 10, pdfWidth - 20, pdfHeight - 20);
        
        // Add title block
        pdf.setFillColor(240, 240, 240);
        pdf.rect(10, 10, pdfWidth - 20, 20, 'F');
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.rect(10, 10, pdfWidth - 20, 20, 'S');
        
        // Add header
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title.toUpperCase() + " TECHNICAL DRAWING", pdfWidth / 2, 22, { align: 'center' });
        
        // Add company info
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text("Drawing Generator - Engineering Department", pdfWidth - 20, 18, { align: 'right' });
        
        // Add bottom info box
        pdf.setFillColor(240, 240, 240);
        pdf.rect(10, pdfHeight - 30, pdfWidth - 20, 20, 'F');
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.rect(10, pdfHeight - 30, pdfWidth - 20, 20, 'S');
        
        // Add dividing lines for bottom info box
        pdf.line(pdfWidth / 4, pdfHeight - 30, pdfWidth / 4, pdfHeight - 10);
        pdf.line(pdfWidth / 2, pdfHeight - 30, pdfWidth / 2, pdfHeight - 10);
        pdf.line(3 * pdfWidth / 4, pdfHeight - 30, 3 * pdfWidth / 4, pdfHeight - 10);
      } catch (err) {
        console.error("Error with template:", err);
        // Continue without template
      }
      
      // Calculate the drawing area
      const drawingAreaX = pdfWidth * 0.1; // 10% from left
      const drawingAreaY = pdfHeight * 0.15; // 15% from top
      const drawingAreaWidth = pdfWidth * 0.8; // 80% of page width
      const drawingAreaHeight = pdfHeight * 0.6; // 60% of page height
      
      // Calculate scaling to fit the drawing
      const scaleFactor = Math.min(
        drawingAreaWidth / canvas.width,
        drawingAreaHeight / canvas.height
      ) * 0.9; // 90% to leave some margin
      
      const scaledWidth = canvas.width * scaleFactor;
      const scaledHeight = canvas.height * scaleFactor;
      
      // Center the drawing
      const x = drawingAreaX + (drawingAreaWidth - scaledWidth) / 2;
      const y = drawingAreaY + (drawingAreaHeight - scaledHeight) / 2;
      
      // Add the drawing to the PDF
      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
      
      // Add input parameters
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text("INPUT PARAMETERS:", 15, pdfHeight - 25);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Belt Width: ${inputParams.beltWidth} ${inputParams.unit}`, 20, pdfHeight - 20);
      pdf.text(`Belt Speed: ${inputParams.beltSpeed} m/s`, 20, pdfHeight - 15);
      
      // Add calculated parameters specific to component type
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text("CALCULATED DIMENSIONS:", pdfWidth / 4 + 5, pdfHeight - 25);
      
      pdf.setFont('helvetica', 'normal');
      
      if (title === "Conveyor") {
        pdf.text(`Length: ${calculatedParams?.conveyor.width} ${calculatedParams?.conveyor.unit}`, pdfWidth / 4 + 10, pdfHeight - 20);
        pdf.text(`Width: ${calculatedParams?.conveyor.height} ${calculatedParams?.conveyor.unit}`, pdfWidth / 4 + 10, pdfHeight - 15);
      } else if (title === "Pulley") {
        pdf.text(`Diameter: Ø${calculatedParams?.pulley.diameter} ${calculatedParams?.pulley.unit}`, pdfWidth / 4 + 10, pdfHeight - 20);
        pdf.text(`Thickness: ${calculatedParams?.pulley.thickness} ${calculatedParams?.pulley.unit}`, pdfWidth / 4 + 10, pdfHeight - 15);
      } else if (title === "Idler") {
        pdf.text(`Diameter: Ø${calculatedParams?.idler.outerDiameter} ${calculatedParams?.idler.unit}`, pdfWidth / 4 + 10, pdfHeight - 20);
        pdf.text(`Length: ${calculatedParams?.idler.length} ${calculatedParams?.idler.unit}`, pdfWidth / 4 + 10, pdfHeight - 15);
      }
      
      // Add material info
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text("MATERIAL:", pdfWidth / 2 + 5, pdfHeight - 25);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Material: ${inputParams.material}`, pdfWidth / 2 + 10, pdfHeight - 20);
      pdf.text(`Capacity: ${inputParams.capacity} t/h`, pdfWidth / 2 + 10, pdfHeight - 15);
      
      // Add project info
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text("PROJECT INFO:", 3 * pdfWidth / 4 + 5, pdfHeight - 25);
      
      // Date and scale
      const date = new Date().toLocaleDateString();
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Date: ${date}`, 3 * pdfWidth / 4 + 10, pdfHeight - 20);
      pdf.text(`Scale: 1:1`, 3 * pdfWidth / 4 + 10, pdfHeight - 15);
      
      // Save the PDF
      pdf.save(`${title.toLowerCase()}_drawing.pdf`);
      toast.dismiss();
      toast.success(`${title} PDF exported successfully`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.dismiss();
      toast.error("Error exporting PDF file");
    } finally {
      setIsLoading(false);
    }
  };

  // Export as DXF
  const handleExportDXF = (type: "conveyor" | "pulley" | "idler") => {
    try {
      if (!calculatedParams) {
        toast.error("No parameters calculated yet");
        return;
      }
      
      let dxfContent = "";
      let fileName = "";
      
      if (type === "conveyor") {
        dxfContent = generateDXF(calculatedParams.conveyor);
        fileName = `conveyor_${inputParams.beltWidth}${inputParams.unit}.dxf`;
      } else if (type === "pulley") {
        // Simple pulley DXF generation (can be expanded with more detailed geometry)
        dxfContent = generatePulleyDXF(calculatedParams.pulley);
        fileName = `pulley_D${calculatedParams.pulley.diameter}${calculatedParams.pulley.unit}.dxf`;
      } else if (type === "idler") {
        // Simple idler DXF generation
        dxfContent = generateIdlerDXF(calculatedParams.idler);
        fileName = `idler_D${calculatedParams.idler.outerDiameter}${calculatedParams.idler.unit}.dxf`;
      }
      
      // Create blob and download
      const blob = new Blob([dxfContent], { type: 'text/plain' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      
      link.click();
      toast.success("DXF file exported successfully");
    } catch (error) {
      console.error("Error exporting DXF:", error);
      toast.error("Error exporting DXF file. Please try again.");
    }
  };
  
  // Simple pulley DXF generation for export
  const generatePulleyDXF = (pulley: CalculatedParameters["pulley"]) => {
    const { diameter, thickness, boreDiameter, unit } = pulley;
    const radius = diameter / 2;
    
    // Create basic DXF content
    let dxfContent = "0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n";
    
    // Top view (circle)
    dxfContent += `0\nCIRCLE\n8\nTOP_VIEW\n10\n0\n20\n0\n30\n0\n40\n${radius}\n`;
    
    // Bore hole
    dxfContent += `0\nCIRCLE\n8\nTOP_VIEW\n10\n0\n20\n0\n30\n0\n40\n${boreDiameter/2}\n`;
    
    // Side view (rectangle)
    const halfThickness = thickness / 2;
    
    // Rectangle
    dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${-halfThickness}\n20\n${radius + 50}\n30\n0\n11\n${halfThickness}\n21\n${radius + 50}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${halfThickness}\n20\n${radius + 50}\n30\n0\n11\n${halfThickness}\n21\n${radius + 50 + diameter}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${halfThickness}\n20\n${radius + 50 + diameter}\n30\n0\n11\n${-halfThickness}\n21\n${radius + 50 + diameter}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${-halfThickness}\n20\n${radius + 50 + diameter}\n30\n0\n11\n${-halfThickness}\n21\n${radius + 50}\n31\n0\n`;
    
    // Add text for dimensions
    dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${-radius - 20}\n30\n0\n40\n10\n1\nDiameter: ${diameter}${unit}\n`;
    dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${-radius - 35}\n30\n0\n40\n10\n1\nThickness: ${thickness}${unit}\n`;
    dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${-radius - 50}\n30\n0\n40\n10\n1\nBore: ${boreDiameter}${unit}\n`;
    
    dxfContent += "0\nENDSEC\n0\nEOF";
    
    return dxfContent;
  };
  
  // Simple idler DXF generation for export
  const generateIdlerDXF = (idler: CalculatedParameters["idler"]) => {
    const { outerDiameter, length, innerDiameter, unit } = idler;
    const radius = outerDiameter / 2;
    
    // Create basic DXF content
    let dxfContent = "0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n";
    
    // Top view (circle)
    dxfContent += `0\nCIRCLE\n8\nTOP_VIEW\n10\n0\n20\n0\n30\n0\n40\n${radius}\n`;
    
    // Bore hole
    dxfContent += `0\nCIRCLE\n8\nTOP_VIEW\n10\n0\n20\n0\n30\n0\n40\n${innerDiameter/2}\n`;
    
    // Side view (rectangle)
    const halfLength = length / 2;
    
    // Rectangle
    dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${-halfLength}\n20\n${radius + 50}\n30\n0\n11\n${halfLength}\n21\n${radius + 50}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${halfLength}\n20\n${radius + 50}\n30\n0\n11\n${halfLength}\n21\n${radius + 50 + outerDiameter}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${halfLength}\n20\n${radius + 50 + outerDiameter}\n30\n0\n11\n${-halfLength}\n21\n${radius + 50 + outerDiameter}\n31\n0\n`;
    dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${-halfLength}\n20\n${radius + 50 + outerDiameter}\n30\n0\n11\n${-halfLength}\n21\n${radius + 50}\n31\n0\n`;
    
    // Center line (bore)
    dxfContent += `0\nLINE\n8\nSIDE_VIEW\n6\nDASHED\n10\n${-halfLength-20}\n20\n${radius + 50 + outerDiameter/2}\n30\n0\n11\n${halfLength+20}\n21\n${radius + 50 + outerDiameter/2}\n31\n0\n`;
    
    // Add text for dimensions
    dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${-radius - 20}\n30\n0\n40\n10\n1\nDiameter: ${outerDiameter}${unit}\n`;
    dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${-radius - 35}\n30\n0\n40\n10\n1\nLength: ${length}${unit}\n`;
    dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${-radius - 50}\n30\n0\n40\n10\n1\nBore: ${innerDiameter}${unit}\n`;
    
    dxfContent += "0\nENDSEC\n0\nEOF";
    
    return dxfContent;
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
            Conveyor System Generator
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Enter basic parameters to generate technical drawings for conveyor, pulley, and idler components.
          </p>
        </motion.div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="input">Input Parameters</TabsTrigger>
            <TabsTrigger value="results" disabled={!calculatedParams}>Generated Drawings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="input">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>System Parameters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-1.5">
                      <Label htmlFor="beltWidth" className="control-label">
                        Belt Width
                      </Label>
                      <Input
                        id="beltWidth"
                        name="beltWidth"
                        type="number"
                        value={inputParams.beltWidth}
                        onChange={handleInputChange}
                        min={1}
                        className="h-9"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="beltSpeed" className="control-label">
                        Belt Speed (m/s)
                      </Label>
                      <Input
                        id="beltSpeed"
                        name="beltSpeed"
                        type="number"
                        value={inputParams.beltSpeed}
                        onChange={handleInputChange}
                        min={0.1}
                        step={0.1}
                        className="h-9"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="capacity" className="control-label">
                        Capacity (t/h)
                      </Label>
                      <Input
                        id="capacity"
                        name="capacity"
                        type="number"
                        value={inputParams.capacity}
                        onChange={handleInputChange}
                        min={1}
                        className="h-9"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="material" className="control-label">
                        Material Type
                      </Label>
                      <select
                        id="material"
                        name="material"
                        value={inputParams.material}
                        onChange={(e) => setInputParams(prev => ({...prev, material: e.target.value}))}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                      >
                        <option value="coal">Coal</option>
                        <option value="sand">Sand</option>
                        <option value="gravel">Gravel</option>
                        <option value="ore">Ore</option>
                        <option value="grain">Grain</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="inclination" className="control-label">
                        Inclination (degrees)
                      </Label>
                      <Input
                        id="inclination"
                        name="inclination"
                        type="number"
                        value={inputParams.inclination}
                        onChange={handleInputChange}
                        min={0}
                        max={30}
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
                              inputParams.unit === unit
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
                  
                  <div className="flex flex-col space-y-4">
                    <div className="text-sm text-muted-foreground italic">
                      Note: Enter all the required parameters above and click the button below to calculate dimensions
                      and generate detailed drawings for all components.
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={calculateParameters}>
                        Calculate & Generate Drawings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="results">
            {calculatedParams && (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {/* Calculations Section */}
                <motion.div variants={itemVariants} className="bg-card border rounded-lg shadow overflow-hidden">
                  <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Calculated Parameters</h2>
                  </div>
                  
                  <div className="p-6">
                    <Accordion
                      type="multiple"
                      value={activeAccordion}
                      onValueChange={setActiveAccordion}
                      className="w-full"
                    >
                      {/* Input Summary Panel */}
                      <AccordionItem value="input">
                        <AccordionTrigger className="text-lg">Input Parameters</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/10 rounded-md">
                            <div>
                              <div className="text-sm text-muted-foreground">Belt Width:</div>
                              <div className="font-medium">{inputParams.beltWidth} {inputParams.unit}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Belt Speed:</div>
                              <div className="font-medium">{inputParams.beltSpeed} m/s</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Capacity:</div>
                              <div className="font-medium">{inputParams.capacity} t/h</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Material:</div>
                              <div className="font-medium">{inputParams.material}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Inclination:</div>
                              <div className="font-medium">{inputParams.inclination}°</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Unit:</div>
                              <div className="font-medium">{inputParams.unit}</div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      {/* Conveyor Panel */}
                      <AccordionItem value="conveyor">
                        <AccordionTrigger className="text-lg">Conveyor Parameters</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h3 className="font-medium text-base">Primary Dimensions</h3>
                              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/10 rounded-md">
                                <div>
                                  <div className="text-sm text-muted-foreground">Length:</div>
                                  <div className="font-medium">{calculatedParams.conveyor.width} {calculatedParams.conveyor.unit}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Width:</div>
                                  <div className="font-medium">{calculatedParams.conveyor.height} {calculatedParams.conveyor.unit}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Depth:</div>
                                  <div className="font-medium">{calculatedParams.conveyor.depth} {calculatedParams.conveyor.unit}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Material Cross Section:</div>
                                  <div className="font-medium">{calculatedParams.details.areaCross.toFixed(2)} mm²</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h3 className="font-medium text-base">Calculation Details</h3>
                              <div className="grid grid-cols-1 gap-4 p-4 bg-muted/10 rounded-md text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Effective Belt Width:</span>
                                  <span className="font-mono">{calculatedParams.details.effectiveBeltWidth.toFixed(2)} mm</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Material Height (center):</span>
                                  <span className="font-mono">{calculatedParams.details.centralHeight.toFixed(2)} mm</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Material Cross-Section:</span>
                                  <span className="font-mono">{calculatedParams.details.areaCrossSqM.toFixed(6)} m²</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Material Density:</span>
                                  <span className="font-mono">{calculatedParams.details.materialDensity} kg/m³</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Calculated Capacity:</span>
                                  <span className="font-mono">{calculatedParams.details.calculatedCapacity.toFixed(2)} t/h</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Belt Load:</span>
                                  <span className="font-mono">{calculatedParams.details.beltLoad.toFixed(2)} kg/m</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      {/* Pulley Panel */}
                      <AccordionItem value="pulley">
                        <AccordionTrigger className="text-lg">Pulley Parameters</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h3 className="font-medium text-base">Primary Dimensions</h3>
                              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/10 rounded-md">
                                <div>
                                  <div className="text-sm text-muted-foreground">Diameter:</div>
                                  <div className="font-medium">Ø{calculatedParams.pulley.diameter} {calculatedParams.pulley.unit}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Thickness:</div>
                                  <div className="font-medium">{calculatedParams.pulley.thickness} {calculatedParams.pulley.unit}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Bore Diameter:</div>
                                  <div className="font-medium">Ø{calculatedParams.pulley.boreDiameter} {calculatedParams.pulley.unit}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Inner Diameter:</div>
                                  <div className="font-medium">Ø{calculatedParams.pulley.innerDiameter} {calculatedParams.pulley.unit}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h3 className="font-medium text-base">Additional Details</h3>
                              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/10 rounded-md">
                                <div>
                                  <div className="text-sm text-muted-foreground">Groove Depth:</div>
                                  <div className="font-medium">{calculatedParams.pulley.grooveDepth.toFixed(1)} {calculatedParams.pulley.unit}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Groove Width:</div>
                                  <div className="font-medium">{calculatedParams.pulley.grooveWidth.toFixed(1)} {calculatedParams.pulley.unit}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Keyway Width:</div>
                                  <div className="font-medium">{calculatedParams.pulley.keyWayWidth.toFixed(1)} {calculatedParams.pulley.unit}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Keyway Depth:</div>
                                  <div className="font-medium">{calculatedParams.pulley.keyWayDepth.toFixed(1)} {calculatedParams.pulley.unit}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Load Factor:</div>
                                  <div className="font-medium">{calculatedParams.details.loadFactor.toFixed(2)}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Capacity Factor:</div>
                                  <div className="font-medium">{calculatedParams.details.capacityFactor.toFixed(2)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      {/* Idler Panel */}
                      <AccordionItem value="idler">
                        <AccordionTrigger className="text-lg">Idler Parameters</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h3 className="font-medium text-base">Primary Dimensions</h3>
                              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/10 rounded-md">
                                <div>
                                  <div className="text-sm text-muted-foreground">Outer Diameter:</div>
                                  <div className="font-medium">Ø{calculatedParams.idler.outerDiameter} {calculatedParams.idler.unit}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Length:</div>
                                  <div className="font-medium">{calculatedParams.idler.length} {calculatedParams.idler.unit}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Inner Diameter:</div>
                                  <div className="font-medium">Ø{calculatedParams.idler.innerDiameter} {calculatedParams.idler.unit}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h3 className="font-medium text-base">Calculation Notes</h3>
                              <div className="p-4 bg-muted/10 rounded-md text-sm space-y-2">
                                <p className="text-muted-foreground">
                                  • Idler diameter is determined by belt width: {inputParams.beltWidth} {inputParams.unit}
                                </p>
                                <p className="text-muted-foreground">
                                  • Idler length is 10% wider than belt width (for tracking): {inputParams.beltWidth} × 1.1 = {calculatedParams.idler.length.toFixed(1)} {calculatedParams.idler.unit}
                                </p>
                                <p className="text-muted-foreground">
                                  • Inner diameter is 25% of outer diameter or minimum 20mm: max(20, {calculatedParams.idler.outerDiameter} × 0.25) = {calculatedParams.idler.innerDiameter} {calculatedParams.idler.unit}
                                </p>
                                {capacity > 1000 || inputParams.beltSpeed > 3.5 ? (
                                  <p className="text-muted-foreground">
                                    • Heavy duty adjustment applied (×1.2) due to high capacity or speed
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </motion.div>
                
                {/* Conveyor Drawing */}
                <motion.div variants={itemVariants} className="bg-card border rounded-lg shadow overflow-hidden">
                  <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Conveyor Drawing</h2>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleExportDXF("conveyor")}>
                        Export DXF
                      </Button>
                      <Button variant="outline" onClick={() => handleExportPDF(conveyorRef, "Conveyor")}>
                        Export PDF
                      </Button>
                    </div>
                  </div>
                  
                  <div ref={conveyorRef} className="bg-white p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Top View */}
                      <div className="relative">
                        <DrawingArea 
                          dimensions={calculatedParams.conveyor} 
                          activeView="top" 
                          className="w-full"
                        />
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-border rounded-md p-3 shadow-sm text-left">
                          <div className="text-xs font-medium text-muted-foreground">TOP VIEW</div>
                        </div>
                      </div>
                      
                      {/* Side View */}
                      <div className="relative">
                        <DrawingArea 
                          dimensions={calculatedParams.conveyor} 
                          activeView="side" 
                          className="w-full"
                        />
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-border rounded-md p-3 shadow-sm text-left">
                          <div className="text-xs font-medium text-muted-foreground">SIDE VIEW</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Metadata */}
                    <div className="mt-6 bg-white/90 backdrop-blur-sm border border-border rounded-md p-4 shadow-sm">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">CONVEYOR DIMENSIONS</div>
                          <div className="text-sm font-medium mt-1">
                            {formatWithUnit(calculatedParams.conveyor.width, calculatedParams.conveyor.unit)} × 
                            {formatWithUnit(calculatedParams.conveyor.height, calculatedParams.conveyor.unit)} × 
                            {formatWithUnit(calculatedParams.conveyor.depth, calculatedParams.conveyor.unit)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">BELT WIDTH</div>
                          <div className="text-sm font-medium mt-1">
                            {formatWithUnit(inputParams.beltWidth, inputParams.unit)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">CAPACITY</div>
                          <div className="text-sm font-medium mt-1">
                            {inputParams.capacity} t/h
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">BELT SPEED</div>
                          <div className="text-sm font-medium mt-1">
                            {inputParams.beltSpeed} m/s
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Pulley Drawing */}
                <motion.div variants={itemVariants} className="bg-card border rounded-lg shadow overflow-hidden">
                  <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Pulley Drawing</h2>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleExportDXF("pulley")}>
                        Export DXF
                      </Button>
                      <Button variant="outline" onClick={() => handleExportPDF(pulleyRef, "Pulley")}>
                        Export PDF
                      </Button>
                    </div>
                  </div>
                  
                  <div ref={pulleyRef} className="bg-white p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Front View */}
                      <div className="relative">
                        <PulleyDrawingArea 
                          parameters={calculatedParams.pulley}
                          view="top"
                          className="w-full"
                        />
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-border rounded-md p-3 shadow-sm text-left">
                          <div className="text-xs font-medium text-muted-foreground">FRONT VIEW</div>
                        </div>
                      </div>
                      
                      {/* Side View */}
                      <div className="relative">
                        <PulleyDrawingArea 
                          parameters={calculatedParams.pulley}
                          view="side"
                          className="w-full"
                        />
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-border rounded-md p-3 shadow-sm text-left">
                          <div className="text-xs font-medium text-muted-foreground">SIDE VIEW</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Metadata */}
                    <div className="mt-6 bg-white/90 backdrop-blur-sm border border-border rounded-md p-4 shadow-sm">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">PULLEY DIAMETER</div>
                          <div className="text-sm font-medium mt-1">
                            Ø{calculatedParams.pulley.diameter} {calculatedParams.pulley.unit}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">THICKNESS</div>
                          <div className="text-sm font-medium mt-1">
                            {calculatedParams.pulley.thickness} {calculatedParams.pulley.unit}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">BORE DIAMETER</div>
                          <div className="text-sm font-medium mt-1">
                            Ø{calculatedParams.pulley.boreDiameter} {calculatedParams.pulley.unit}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">INNER DIAMETER</div>
                          <div className="text-sm font-medium mt-1">
                            Ø{calculatedParams.pulley.innerDiameter} {calculatedParams.pulley.unit}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Idler Drawing */}
                <motion.div variants={itemVariants} className="bg-card border rounded-lg shadow overflow-hidden">
                  <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Idler Drawing</h2>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleExportDXF("idler")}>
                        Export DXF
                      </Button>
                      <Button variant="outline" onClick={() => handleExportPDF(idlerRef, "Idler")}>
                        Export PDF
                      </Button>
                    </div>
                  </div>
                  
                  <div ref={idlerRef} className="bg-white p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Top View */}
                      <div className="relative">
                        <PulleyDrawingArea 
                          parameters={{
                            ...calculatedParams.idler,
                            diameter: calculatedParams.idler.outerDiameter,
                            thickness: calculatedParams.idler.length,
                            boreDiameter: calculatedParams.idler.innerDiameter,
                            // Additional parameters needed for PulleyDrawingArea
                            innerDiameter: calculatedParams.idler.outerDiameter * 0.7,
                            grooveDepth: 0,
                            grooveWidth: 0,
                            keyWayWidth: calculatedParams.idler.innerDiameter * 0.3,
                            keyWayDepth: calculatedParams.idler.innerDiameter * 0.15
                          }}
                          view="top"
                          className="w-full"
                        />
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-border rounded-md p-3 shadow-sm text-left">
                          <div className="text-xs font-medium text-muted-foreground">FRONT VIEW</div>
                        </div>
                      </div>
                      
                      {/* Side View */}
                      <div className="relative">
                        <PulleyDrawingArea 
                          parameters={{
                            ...calculatedParams.idler,
                            diameter: calculatedParams.idler.outerDiameter,
                            thickness: calculatedParams.idler.length,
                            boreDiameter: calculatedParams.idler.innerDiameter,
                            // Additional parameters needed for PulleyDrawingArea
                            innerDiameter: calculatedParams.idler.outerDiameter * 0.7,
                            grooveDepth: 0,
                            grooveWidth: 0,
                            keyWayWidth: calculatedParams.idler.innerDiameter * 0.3,
                            keyWayDepth: calculatedParams.idler.innerDiameter * 0.15
                          }}
                          view="side"
                          className="w-full"
                        />
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-border rounded-md p-3 shadow-sm text-left">
                          <div className="text-xs font-medium text-muted-foreground">SIDE VIEW</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Metadata */}
                    <div className="mt-6 bg-white/90 backdrop-blur-sm border border-border rounded-md p-4 shadow-sm">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">IDLER DIAMETER</div>
                          <div className="text-sm font-medium mt-1">
                            Ø{calculatedParams.idler.outerDiameter} {calculatedParams.idler.unit}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">LENGTH</div>
                          <div className="text-sm font-medium mt-1">
                            {calculatedParams.idler.length} {calculatedParams.idler.unit}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">BORE DIAMETER</div>
                          <div className="text-sm font-medium mt-1">
                            Ø{calculatedParams.idler.innerDiameter} {calculatedParams.idler.unit}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
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
    </motion.div>
  );
};

export default UnifiedGenerator;
