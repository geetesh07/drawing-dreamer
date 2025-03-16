
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
