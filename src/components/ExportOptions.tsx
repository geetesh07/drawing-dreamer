
import React from "react";
import { DrawingDimensions, generateDXF } from "@/utils/drawingUtils";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface ExportOptionsProps {
  dimensions: DrawingDimensions;
  drawingRef: React.RefObject<HTMLDivElement>;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ 
  dimensions,
  drawingRef
}) => {
  
  const exportAsDXF = () => {
    try {
      const { width, height, cornerRadius, unit } = dimensions;
      
      if (width <= 0 || height <= 0) {
        toast.error("Width and height must be positive values");
        return;
      }
      
      // Generate DXF content with both views
      const dxfContent = generateDXF(dimensions);
      
      // Create blob and download
      const blob = new Blob([dxfContent], { type: 'text/plain' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `drawing_${width}x${height}R${cornerRadius}${unit}.dxf`;
      
      link.click();
      toast.success("DXF file with both views exported successfully");
    } catch (error) {
      console.error("Error exporting DXF:", error);
      toast.error("Error exporting DXF file. Please try again.");
    }
  };

  const exportAsPDF = async () => {
    try {
      if (!drawingRef.current) {
        toast.error("Drawing not found. Please generate a drawing first.");
        return;
      }
      
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
      
      // Load the template image (from public folder)
      const template = new Image();
      template.src = 'public/lovable-uploads/d20f33ee-b15d-4653-98ef-a6adddd18558.png';
      
      // First add the template image
      pdf.addImage('public/lovable-uploads/d20f33ee-b15d-4653-98ef-a6adddd18558.png', 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Calculate the drawing area based on the template
      // These values need to be adjusted based on the template
      const drawingAreaX = pdfWidth * 0.15; // 15% from left margin
      const drawingAreaY = pdfHeight * 0.2; // 20% from top margin
      const drawingAreaWidth = pdfWidth * 0.7; // 70% of page width 
      const drawingAreaHeight = pdfHeight * 0.6; // 60% of page height
      
      // Calculate scaling to fit the drawing in the drawing area
      const scaleFactor = Math.min(
        drawingAreaWidth / canvas.width,
        drawingAreaHeight / canvas.height
      ) * 0.9; // 90% of available space to leave some margin
      
      const scaledWidth = canvas.width * scaleFactor;
      const scaledHeight = canvas.height * scaleFactor;
      
      // Center the drawing in the drawing area
      const x = drawingAreaX + (drawingAreaWidth - scaledWidth) / 2;
      const y = drawingAreaY + (drawingAreaHeight - scaledHeight) / 2;
      
      // Add the drawing to the PDF (on top of the template)
      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
      
      // Add metadata
      const { width, height, cornerRadius, depth, unit } = dimensions;
      const date = new Date().toLocaleDateString();
      
      // Add company info at correct position
      pdf.setFontSize(9);
      pdf.text(`Customer: Drawing Generator Demo`, pdfWidth * 0.8, pdfHeight * 0.83);
      pdf.text(`Part: ${width}×${height}×${depth} ${unit}`, pdfWidth * 0.8, pdfHeight * 0.86);
      pdf.text(`Date: ${date}`, pdfWidth * 0.8, pdfHeight * 0.89);
      
      // Save the PDF
      pdf.save(`production_drawing_${width}x${height}R${cornerRadius}${unit}.pdf`);
      toast.dismiss();
      toast.success("PDF file with both views exported successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.dismiss();
      toast.error("Error exporting PDF file. Please try again.");
    }
  };

  return (
    <div className="mt-4 flex justify-end space-x-2">
      <button 
        onClick={exportAsDXF}
        className="text-sm font-medium px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
        data-export-dxf
      >
        Export DXF
      </button>
      <button 
        onClick={exportAsPDF}
        className="text-sm font-medium px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        data-export-pdf
      >
        Export PDF
      </button>
    </div>
  );
};

export default ExportOptions;
