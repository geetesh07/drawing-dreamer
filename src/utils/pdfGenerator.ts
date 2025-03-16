
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { InputParameters } from "@/types/unifiedGenerator";

export const generatePDF = async (
  componentRef: React.RefObject<HTMLDivElement>,
  title: string,
  inputParams: InputParameters,
  additionalDetails: Record<string, string>
): Promise<jsPDF> => {
  if (!componentRef.current) {
    throw new Error("Drawing element not found");
  }
  
  const canvas = await html2canvas(componentRef.current, {
    scale: 2, // Increase quality
    backgroundColor: '#ffffff'
  });
  
  const imgData = canvas.toDataURL('image/png', 1.0);
  
  // Create PDF with proper dimensions - IMPORTANT: Use landscape orientation
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
  
  // Try to load template or add borders
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
  
  const detailsKeys = Object.keys(additionalDetails);
  if (detailsKeys.length >= 2) {
    pdf.text(`${detailsKeys[0]}: ${additionalDetails[detailsKeys[0]]}`, pdfWidth / 4 + 10, pdfHeight - 20);
    pdf.text(`${detailsKeys[1]}: ${additionalDetails[detailsKeys[1]]}`, pdfWidth / 4 + 10, pdfHeight - 15);
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
  
  // Return the PDF for downloading
  return pdf;
};
