
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
      
      // Create PDF with proper dimensions - IMPORTANT: Use landscape orientation
      const pdf = new jsPDF({
        orientation: 'landscape', // Ensure landscape orientation
        unit: 'mm',
        format: 'a4'
      });
      
      // Get PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Draw a white background first (instead of using template)
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
      
      // Calculate the drawing area based on template size
      // These values are adjusted for landscape A4
      const drawingAreaX = pdfWidth * 0.1; // 10% from left margin
      const drawingAreaY = pdfHeight * 0.15; // 15% from top margin
      const drawingAreaWidth = pdfWidth * 0.8; // 80% of page width 
      const drawingAreaHeight = pdfHeight * 0.7; // 70% of page height
      
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
      
      // Add the drawing to the PDF
      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
      
      // Add metadata
      const { width, height, cornerRadius, depth, unit } = dimensions;
      const date = new Date().toLocaleDateString();
      
      // Add border and title block
      pdf.setDrawColor(0);
      pdf.setLineWidth(0.5);
      
      // Draw border around the drawing area
      pdf.rect(drawingAreaX - 5, drawingAreaY - 5, 
               drawingAreaWidth + 10, drawingAreaHeight + 10);
      
      // Draw title block at bottom
      const titleBlockY = drawingAreaY + drawingAreaHeight + 10;
      const titleBlockHeight = pdfHeight - titleBlockY - 10;
      pdf.rect(drawingAreaX - 5, titleBlockY, drawingAreaWidth + 10, titleBlockHeight);
      
      // Vertical dividers in title block
      const dividerX1 = drawingAreaX + (drawingAreaWidth / 3);
      const dividerX2 = drawingAreaX + (drawingAreaWidth * 2/3);
      pdf.line(dividerX1, titleBlockY, dividerX1, titleBlockY + titleBlockHeight);
      pdf.line(dividerX2, titleBlockY, dividerX2, titleBlockY + titleBlockHeight);
      
      // Add company info and metadata
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text("TECHNICAL DRAWING", drawingAreaX, drawingAreaY - 10);
      
      // Add specs in title block
      pdf.setFontSize(10);
      pdf.text(`Dimensions: ${width}×${height}×${depth} ${unit}`, drawingAreaX + 5, titleBlockY + 10);
      pdf.text(`Corner Radius: ${cornerRadius} ${unit}`, drawingAreaX + 5, titleBlockY + 20);
      pdf.text(`Drawing Date: ${date}`, dividerX1 + 5, titleBlockY + 10);
      pdf.text("Scale: 1:1", dividerX1 + 5, titleBlockY + 20);
      pdf.text("Drawing Generator Demo", dividerX2 + 5, titleBlockY + 10);
      pdf.text("Engineering Department", dividerX2 + 5, titleBlockY + 20);
      
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
