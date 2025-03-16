
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { generatePDF } from "./pdfGenerator";
import { generatePulleyDXF, generateIdlerDXF } from "./dxfGenerators";
import { generateDXF } from "./drawingUtils";
import { InputParameters, CalculatedParameters } from "@/types/unifiedGenerator";

// Export as PDF
export const handleExportPDF = async (
  componentRef: React.RefObject<HTMLDivElement>,
  title: string,
  inputParams: InputParameters,
  calculatedParams: CalculatedParameters
) => {
  try {
    if (!componentRef.current) {
      toast.error("Drawing element not found");
      return;
    }
    
    toast.loading(`Generating ${title} PDF...`);
    
    let additionalDetails: Record<string, string> = {};
    
    if (title === "Conveyor") {
      additionalDetails = {
        "Length": `${calculatedParams.conveyor.width} ${calculatedParams.conveyor.unit}`,
        "Width": `${calculatedParams.conveyor.height} ${calculatedParams.conveyor.unit}`
      };
    } else if (title === "Pulley") {
      additionalDetails = {
        "Diameter": `Ø${calculatedParams.pulley.diameter} ${calculatedParams.pulley.unit}`,
        "Thickness": `${calculatedParams.pulley.thickness} ${calculatedParams.pulley.unit}`
      };
    } else if (title === "Idler") {
      additionalDetails = {
        "Diameter": `Ø${calculatedParams.idler.outerDiameter} ${calculatedParams.idler.unit}`,
        "Length": `${calculatedParams.idler.length} ${calculatedParams.idler.unit}`
      };
    }
    
    const pdf = await generatePDF(componentRef, title, inputParams, additionalDetails);
    
    // Save the PDF
    if (pdf) {
      pdf.save(`${title.toLowerCase()}_drawing.pdf`);
    }
    
    toast.dismiss();
    toast.success(`${title} PDF exported successfully`);
  } catch (error) {
    console.error("Error exporting PDF:", error);
    toast.dismiss();
    toast.error("Error exporting PDF file");
  }
};

// Export as DXF
export const handleExportDXF = (
  type: "conveyor" | "pulley" | "idler",
  calculatedParams: CalculatedParameters
) => {
  try {
    toast.loading(`Generating ${type} DXF...`);
    let dxfContent = "";
    let fileName = "";
    
    if (type === "conveyor") {
      dxfContent = generateDXF(calculatedParams.conveyor);
      fileName = `conveyor_${calculatedParams.conveyor.width}x${calculatedParams.conveyor.height}_${calculatedParams.conveyor.unit}.dxf`;
    } else if (type === "pulley") {
      dxfContent = generatePulleyDXF(calculatedParams.pulley);
      fileName = `pulley_D${calculatedParams.pulley.diameter}_${calculatedParams.pulley.unit}.dxf`;
    } else if (type === "idler") {
      dxfContent = generateIdlerDXF(calculatedParams.idler);
      fileName = `idler_D${calculatedParams.idler.outerDiameter}_${calculatedParams.idler.unit}.dxf`;
    }
    
    // Create blob and download
    const blob = new Blob([dxfContent], { type: 'text/plain' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    
    link.click();
    toast.dismiss();
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} DXF file exported successfully`);
  } catch (error) {
    console.error("Error exporting DXF:", error);
    toast.dismiss();
    toast.error("Error exporting DXF file. Please try again.");
  }
};
