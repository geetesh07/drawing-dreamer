
import React, { useEffect, useState } from "react";
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
  const [templateImage, setTemplateImage] = useState<HTMLImageElement | null>(null);
  
  // Load template image on component mount
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Important for CORS
    img.src = "/0298f9f8-b5de-477f-83fa-22ef2d922de2.png";
    img.onload = () => {
      setTemplateImage(img);
    };
    img.onerror = (err) => {
      console.error("Error loading template image:", err);
    };
  }, []);
  
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
      
      // First create a white background covering the whole page
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
      
      // Add the template if available
      if (templateImage) {
        try {
          // Convert the preloaded image to a canvas, then to a dataURL
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = templateImage.width;
          tempCanvas.height = templateImage.height;
          const ctx = tempCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(templateImage, 0, 0);
            const templateDataUrl = tempCanvas.toDataURL('image/png');
            // Add the template to the PDF
            pdf.addImage(templateDataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
          }
        } catch (templateError) {
          console.error("Error adding template from preloaded image:", templateError);
          // Continue without template if there's an error
        }
      } else {
        console.log("Template image not loaded, continuing without template");
      }
      
      // Calculate the drawing area based on template 
      // These values are adjusted for the specific template
      const drawingAreaX = pdfWidth * 0.1; // 10% from left margin
      const drawingAreaY = pdfHeight * 0.15; // 15% from top margin
      const drawingAreaWidth = pdfWidth * 0.8; // 80% of page width 
      const drawingAreaHeight = pdfHeight * 0.6; // 60% of page height (leaving room for title block)
      
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
      
      // Add metadata (placed according to template)
      const { width, height, cornerRadius, depth, unit } = dimensions;
      const date = new Date().toLocaleDateString();
      
      // Add specs in title block areas (adjust position to match template)
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${width}×${height}×${depth} ${unit}`, pdfWidth * 0.15, pdfHeight * 0.85);
      pdf.text(`Corner Radius: ${cornerRadius} ${unit}`, pdfWidth * 0.15, pdfHeight * 0.89);
      pdf.text(`Drawing Date: ${date}`, pdfWidth * 0.45, pdfHeight * 0.85);
      pdf.text("Scale: 1:1", pdfWidth * 0.45, pdfHeight * 0.89);
      pdf.text("Drawing Generator", pdfWidth * 0.75, pdfHeight * 0.85);
      pdf.text("Engineering Department", pdfWidth * 0.75, pdfHeight * 0.89);
      
      // Save the PDF
      pdf.save(`production_drawing_${width}x${height}R${cornerRadius}${unit}.pdf`);
      toast.dismiss();
      toast.success("PDF file exported successfully with template");
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
