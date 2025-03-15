// Drawing utilities
export type Unit = 'mm' | 'cm' | 'm' | 'in';
export type ViewType = 'top' | 'side';

export interface DrawingDimensions {
  width: number;
  height: number;
  depth?: number;
  cornerRadius: number;
  unit: Unit;
}

export const DEFAULT_DIMENSIONS: DrawingDimensions = {
  width: 200,
  height: 100,
  depth: 50,
  cornerRadius: 10,
  unit: 'mm', // Default to millimeters
};

export const UNIT_CONVERSION = {
  mm: 1,
  cm: 10,
  m: 1000,
  in: 25.4,
};

/**
 * Convert a value from one unit to another
 */
export function convertUnits(value: number, fromUnit: Unit, toUnit: Unit): number {
  const valueInMm = value * UNIT_CONVERSION[fromUnit];
  return valueInMm / UNIT_CONVERSION[toUnit];
}

/**
 * Calculate the scale factor for a drawing based on container size
 */
export function calculateScaleFactor(
  dimensions: DrawingDimensions,
  containerWidth: number,
  containerHeight: number,
  padding: number = 40
): number {
  const { width, height, depth } = dimensions;
  
  // Calculate available space accounting for padding
  const availableWidth = containerWidth - padding * 2;
  const availableHeight = containerHeight - padding * 2;
  
  // For side view, use depth as width
  const dimensionWidth = depth ?? width;
  
  // Return the smaller scale factor to fit both dimensions
  return Math.min(availableWidth / width, availableHeight / height);
}

/**
 * Format a number as a string with the unit
 */
export function formatWithUnit(value: number, unit: Unit): string {
  return `${value} ${unit}`;
}

/**
 * Validate and adjust corner radius
 */
export function validateCornerRadius(width: number, height: number, cornerRadius: number): number {
  // Corner radius cannot be larger than half the smaller dimension
  const maxRadius = Math.min(width, height) / 2;
  return Math.min(cornerRadius, maxRadius);
}

/**
 * Generate paths for a rounded rectangle
 */
export function generateRoundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): string {
  // Ensure radius is not larger than half the smaller dimension
  radius = Math.min(radius, Math.min(width, height) / 2);
  
  return `
    M${x + radius},${y}
    h${width - 2 * radius}
    a${radius},${radius} 0 0 1 ${radius},${radius}
    v${height - 2 * radius}
    a${radius},${radius} 0 0 1 ${-radius},${radius}
    h${-width + 2 * radius}
    a${radius},${radius} 0 0 1 ${-radius},${-radius}
    v${-height + 2 * radius}
    a${radius},${radius} 0 0 1 ${radius},${-radius}
    z
  `;
}

/**
 * Generate DXF content for both top and side views
 * Creates a more standards-compliant DXF file with improved structure
 * and additional metadata
 */
export function generateDXF(dimensions: DrawingDimensions): string {
  const { width, height, depth = 50, cornerRadius, unit } = dimensions;
  const validRadius = validateCornerRadius(width, height, cornerRadius);
  
  // Current date in proper format
  const currentDate = new Date().toISOString().substring(0, 10).replace(/-/g, "");
  const currentTime = new Date().toTimeString().substring(0, 8).replace(/:/g, "");
  
  // Track layers for better organization
  const LAYER_TOP_VIEW = "TOP_VIEW";
  const LAYER_SIDE_VIEW = "SIDE_VIEW";
  const LAYER_DIMENSIONS = "DIMENSIONS";
  
  // Start DXF content with improved header
  let dxfContent = "";
  
  // HEADER section with metadata
  dxfContent += "0\nSECTION\n2\nHEADER\n";
  dxfContent += "9\n$ACADVER\n1\nAC1027\n"; // AutoCAD 2013 format
  dxfContent += `9\n$TDCREATE\n40\n${currentDate}.${currentTime}\n`;
  dxfContent += "9\n$INSUNITS\n70\n4\n"; // Units (4 = mm)
  dxfContent += "9\n$MEASUREMENT\n70\n1\n"; // Metric
  dxfContent += "9\n$LIMMIN\n10\n0.0\n20\n0.0\n"; // Drawing limits min
  dxfContent += `9\n$LIMMAX\n10\n${width + depth + 100}\n20\n${height + 100}\n`; // Drawing limits max
  dxfContent += "0\nENDSEC\n";
  
  // TABLES section - define layers, text styles, etc.
  dxfContent += "0\nSECTION\n2\nTABLES\n";
  
  // Layer table
  dxfContent += "0\nTABLE\n2\nLAYER\n70\n3\n"; // 3 layers
  
  // Define TOP_VIEW layer
  dxfContent += "0\nLAYER\n2\n" + LAYER_TOP_VIEW + "\n";
  dxfContent += "70\n0\n"; // Layer is on and thawed
  dxfContent += "62\n5\n"; // Blue color
  dxfContent += "6\nCONTINUOUS\n"; // Line type
  
  // Define SIDE_VIEW layer
  dxfContent += "0\nLAYER\n2\n" + LAYER_SIDE_VIEW + "\n";
  dxfContent += "70\n0\n";
  dxfContent += "62\n3\n"; // Green color
  dxfContent += "6\nCONTINUOUS\n";
  
  // Define DIMENSIONS layer
  dxfContent += "0\nLAYER\n2\n" + LAYER_DIMENSIONS + "\n";
  dxfContent += "70\n0\n";
  dxfContent += "62\n1\n"; // Red color
  dxfContent += "6\nCONTINUOUS\n";
  
  dxfContent += "0\nENDTAB\n";  // End LAYER table
  
  // Define text style
  dxfContent += "0\nTABLE\n2\nSTYLE\n70\n1\n";
  dxfContent += "0\nSTYLE\n2\nSTANDARD\n70\n0\n40\n0.0\n41\n1.0\n50\n0.0\n";
  dxfContent += "71\n0\n42\n0.2\n3\ntxt\n4\n\n0\nENDTAB\n";
  
  dxfContent += "0\nENDSEC\n"; // End TABLES section
  
  // Start BLOCKS section (we don't use blocks in this simple example)
  dxfContent += "0\nSECTION\n2\nBLOCKS\n0\nENDSEC\n";
  
  // Start ENTITIES section - add drawing elements
  dxfContent += "0\nSECTION\n2\nENTITIES\n";
  
  // Add title text
  dxfContent += "0\nTEXT\n";
  dxfContent += "8\n" + LAYER_DIMENSIONS + "\n"; // Layer
  dxfContent += `10\n${(width/2)}\n20\n${-20}\n30\n0\n`; // Position
  dxfContent += "40\n10\n"; // Text height
  dxfContent += "1\nTECHNICAL DRAWING\n"; // Text content
  dxfContent += "72\n1\n"; // Text alignment (centered)
  dxfContent += "11\n" + (width/2) + "\n21\n" + (-20) + "\n31\n0\n"; // Alignment point
  
  // Add dimensions text
  dxfContent += "0\nTEXT\n";
  dxfContent += "8\n" + LAYER_DIMENSIONS + "\n";
  dxfContent += `10\n${(width/2)}\n20\n${-35}\n30\n0\n`;
  dxfContent += "40\n5\n"; // Text height
  dxfContent += `1\n${width}x${height}x${depth} ${unit} - R${cornerRadius} ${unit}\n`;
  dxfContent += "72\n1\n"; // Centered
  dxfContent += "11\n" + (width/2) + "\n21\n" + (-35) + "\n31\n0\n";
  
  // ======== TOP VIEW ========
  
  // Top-right corner arc
  dxfContent += "0\nARC\n";
  dxfContent += "8\n" + LAYER_TOP_VIEW + "\n"; // Layer
  dxfContent += `10\n${width - validRadius}\n20\n${validRadius}\n30\n0\n`; // Center
  dxfContent += `40\n${validRadius}\n`; // Radius
  dxfContent += "50\n0\n51\n90\n"; // Start and end angles
  
  // Top-left corner arc
  dxfContent += "0\nARC\n";
  dxfContent += "8\n" + LAYER_TOP_VIEW + "\n";
  dxfContent += `10\n${validRadius}\n20\n${validRadius}\n30\n0\n`;
  dxfContent += `40\n${validRadius}\n`;
  dxfContent += "50\n90\n51\n180\n";
  
  // Bottom-left corner arc
  dxfContent += "0\nARC\n";
  dxfContent += "8\n" + LAYER_TOP_VIEW + "\n";
  dxfContent += `10\n${validRadius}\n20\n${height - validRadius}\n30\n0\n`;
  dxfContent += `40\n${validRadius}\n`;
  dxfContent += "50\n180\n51\n270\n";
  
  // Bottom-right corner arc
  dxfContent += "0\nARC\n";
  dxfContent += "8\n" + LAYER_TOP_VIEW + "\n";
  dxfContent += `10\n${width - validRadius}\n20\n${height - validRadius}\n30\n0\n`;
  dxfContent += `40\n${validRadius}\n`;
  dxfContent += "50\n270\n51\n0\n";
  
  // Top line
  dxfContent += "0\nLINE\n";
  dxfContent += "8\n" + LAYER_TOP_VIEW + "\n";
  dxfContent += `10\n${validRadius}\n20\n0\n30\n0\n`; // Start point
  dxfContent += `11\n${width - validRadius}\n21\n0\n31\n0\n`; // End point
  
  // Right line
  dxfContent += "0\nLINE\n";
  dxfContent += "8\n" + LAYER_TOP_VIEW + "\n";
  dxfContent += `10\n${width}\n20\n${validRadius}\n30\n0\n`;
  dxfContent += `11\n${width}\n21\n${height - validRadius}\n31\n0\n`;
  
  // Bottom line
  dxfContent += "0\nLINE\n";
  dxfContent += "8\n" + LAYER_TOP_VIEW + "\n";
  dxfContent += `10\n${validRadius}\n20\n${height}\n30\n0\n`;
  dxfContent += `11\n${width - validRadius}\n21\n${height}\n31\n0\n`;
  
  // Left line
  dxfContent += "0\nLINE\n";
  dxfContent += "8\n" + LAYER_TOP_VIEW + "\n";
  dxfContent += `10\n0\n20\n${validRadius}\n30\n0\n`;
  dxfContent += `11\n0\n21\n${height - validRadius}\n31\n0\n`;
  
  // Add "TOP VIEW" text
  dxfContent += "0\nTEXT\n";
  dxfContent += "8\n" + LAYER_DIMENSIONS + "\n";
  dxfContent += `10\n${width/2}\n20\n${height + 20}\n30\n0\n`;
  dxfContent += "40\n7\n"; // Text height
  dxfContent += "1\nTOP VIEW\n";
  dxfContent += "72\n1\n"; // Centered
  dxfContent += `11\n${width/2}\n21\n${height + 20}\n31\n0\n`;
  
  // Add width dimension
  dxfContent += "0\nLINE\n";
  dxfContent += "8\n" + LAYER_DIMENSIONS + "\n";
  dxfContent += `10\n0\n20\n${height + 10}\n30\n0\n`;
  dxfContent += `11\n${width}\n21\n${height + 10}\n31\n0\n`;
  
  // Dimension arrows for width
  dxfContent += "0\nLINE\n8\n" + LAYER_DIMENSIONS + "\n10\n0\n20\n${height + 10}\n30\n0\n11\n5\n21\n${height + 8}\n31\n0\n";
  dxfContent += "0\nLINE\n8\n" + LAYER_DIMENSIONS + "\n10\n0\n20\n${height + 10}\n30\n0\n11\n5\n21\n${height + 12}\n31\n0\n";
  dxfContent += "0\nLINE\n8\n" + LAYER_DIMENSIONS + "\n10\n${width}\n20\n${height + 10}\n30\n0\n11\n${width-5}\n21\n${height + 8}\n31\n0\n";
  dxfContent += "0\nLINE\n8\n" + LAYER_DIMENSIONS + "\n10\n${width}\n20\n${height + 10}\n30\n0\n11\n${width-5}\n21\n${height + 12}\n31\n0\n";
  
  // Width dimension text
  dxfContent += "0\nTEXT\n";
  dxfContent += "8\n" + LAYER_DIMENSIONS + "\n";
  dxfContent += `10\n${width/2}\n20\n${height + 10}\n30\n0\n`;
  dxfContent += "40\n5\n"; // Text height
  dxfContent += `1\n${width} ${unit}\n`;
  dxfContent += "72\n1\n"; // Centered
  dxfContent += `11\n${width/2}\n21\n${height + 10}\n31\n0\n`;
  
  // Add height dimension
  dxfContent += "0\nLINE\n";
  dxfContent += "8\n" + LAYER_DIMENSIONS + "\n";
  dxfContent += `10\n${-10}\n20\n0\n30\n0\n`;
  dxfContent += `11\n${-10}\n21\n${height}\n31\n0\n`;
  
  // Dimension arrows for height
  dxfContent += "0\nLINE\n8\n" + LAYER_DIMENSIONS + "\n10\n${-10}\n20\n0\n30\n0\n11\n${-8}\n21\n5\n31\n0\n";
  dxfContent += "0\nLINE\n8\n" + LAYER_DIMENSIONS + "\n10\n${-10}\n20\n0\n30\n0\n11\n${-12}\n21\n5\n31\n0\n";
  dxfContent += "0\nLINE\n8\n" + LAYER_DIMENSIONS + "\n10\n${-10}\n20\n${height}\n30\n0\n11\n${-8}\n21\n${height-5}\n31\n0\n";
  dxfContent += "0\nLINE\n8\n" + LAYER_DIMENSIONS + "\n10\n${-10}\n20\n${height}\n30\n0\n11\n${-12}\n21\n${height-5}\n31\n0\n";
  
  // Height dimension text
  dxfContent += "0\nTEXT\n";
  dxfContent += "8\n" + LAYER_DIMENSIONS + "\n";
  dxfContent += `10\n${-10}\n20\n${height/2}\n30\n0\n`;
  dxfContent += "40\n5\n"; // Text height
  dxfContent += `1\n${height} ${unit}\n`;
  dxfContent += "72\n1\n"; // Centered
  dxfContent += "50\n90\n"; // Rotation 90 degrees
  dxfContent += `11\n${-10}\n21\n${height/2}\n31\n0\n`;
  
  // ======== SIDE VIEW ========
  
  // Side view - offset to the right
  const sideViewOffsetX = width + 50; // 50 units gap between views
  
  // Draw simple rectangle for side view
  // Top line
  dxfContent += "0\nLINE\n";
  dxfContent += "8\n" + LAYER_SIDE_VIEW + "\n";
  dxfContent += `10\n${sideViewOffsetX}\n20\n0\n30\n0\n`;
  dxfContent += `11\n${sideViewOffsetX + depth}\n21\n0\n31\n0\n`;
  
  // Right line
  dxfContent += "0\nLINE\n";
  dxfContent += "8\n" + LAYER_SIDE_VIEW + "\n";
  dxfContent += `10\n${sideViewOffsetX + depth}\n20\n0\n30\n0\n`;
  dxfContent += `11\n${sideViewOffsetX + depth}\n21\n${height}\n31\n0\n`;
  
  // Bottom line
  dxfContent += "0\nLINE\n";
  dxfContent += "8\n" + LAYER_SIDE_VIEW + "\n";
  dxfContent += `10\n${sideViewOffsetX + depth}\n20\n${height}\n30\n0\n`;
  dxfContent += `11\n${sideViewOffsetX}\n21\n${height}\n31\n0\n`;
  
  // Left line
  dxfContent += "0\nLINE\n";
  dxfContent += "8\n" + LAYER_SIDE_VIEW + "\n";
  dxfContent += `10\n${sideViewOffsetX}\n20\n${height}\n30\n0\n`;
  dxfContent += `11\n${sideViewOffsetX}\n21\n0\n31\n0\n`;
  
  // Add "SIDE VIEW" text
  dxfContent += "0\nTEXT\n";
  dxfContent += "8\n" + LAYER_DIMENSIONS + "\n";
  dxfContent += `10\n${sideViewOffsetX + depth/2}\n20\n${height + 20}\n30\n0\n`;
  dxfContent += "40\n7\n"; // Text height
  dxfContent += "1\nSIDE VIEW\n";
  dxfContent += "72\n1\n"; // Centered
  dxfContent += `11\n${sideViewOffsetX + depth/2}\n21\n${height + 20}\n31\n0\n`;
  
  // Add depth dimension
  dxfContent += "0\nLINE\n";
  dxfContent += "8\n" + LAYER_DIMENSIONS + "\n";
  dxfContent += `10\n${sideViewOffsetX}\n20\n${height + 10}\n30\n0\n`;
  dxfContent += `11\n${sideViewOffsetX + depth}\n21\n${height + 10}\n31\n0\n`;
  
  // Dimension arrows for depth
  dxfContent += "0\nLINE\n8\n" + LAYER_DIMENSIONS + "\n10\n${sideViewOffsetX}\n20\n${height + 10}\n30\n0\n11\n${sideViewOffsetX + 5}\n21\n${height + 8}\n31\n0\n";
  dxfContent += "0\nLINE\n8\n" + LAYER_DIMENSIONS + "\n10\n${sideViewOffsetX}\n20\n${height + 10}\n30\n0\n11\n${sideViewOffsetX + 5}\n21\n${height + 12}\n31\n0\n";
  dxfContent += "0\nLINE\n8\n" + LAYER_DIMENSIONS + "\n10\n${sideViewOffsetX + depth}\n20\n${height + 10}\n30\n0\n11\n${sideViewOffsetX + depth - 5}\n21\n${height + 8}\n31\n0\n";
  dxfContent += "0\nLINE\n8\n" + LAYER_DIMENSIONS + "\n10\n${sideViewOffsetX + depth}\n20\n${height + 10}\n30\n0\n11\n${sideViewOffsetX + depth - 5}\n21\n${height + 12}\n31\n0\n";
  
  // Depth dimension text
  dxfContent += "0\nTEXT\n";
  dxfContent += "8\n" + LAYER_DIMENSIONS + "\n";
  dxfContent += `10\n${sideViewOffsetX + depth/2}\n20\n${height + 10}\n30\n0\n`;
  dxfContent += "40\n5\n"; // Text height
  dxfContent += `1\n${depth} ${unit}\n`;
  dxfContent += "72\n1\n"; // Centered
  dxfContent += `11\n${sideViewOffsetX + depth/2}\n21\n${height + 10}\n31\n0\n`;
  
  // Add corner radius annotation
  if (validRadius > 0) {
    dxfContent += "0\nTEXT\n";
    dxfContent += "8\n" + LAYER_DIMENSIONS + "\n";
    dxfContent += `10\n${validRadius}\n20\n${validRadius}\n30\n0\n`;
    dxfContent += "40\n4\n"; // Text height
    dxfContent += `1\nR${validRadius}\n`;
    dxfContent += `11\n${validRadius}\n21\n${validRadius}\n31\n0\n`;
    
    // Corner radius leader line
    dxfContent += "0\nLINE\n";
    dxfContent += "8\n" + LAYER_DIMENSIONS + "\n";
    dxfContent += `10\n${validRadius}\n20\n${validRadius}\n30\n0\n`;
    dxfContent += `11\n${validRadius - 5}\n21\n${validRadius - 5}\n31\n0\n`;
  }
  
  // Add copyright and date information
  dxfContent += "0\nTEXT\n";
  dxfContent += "8\n" + LAYER_DIMENSIONS + "\n";
  dxfContent += `10\n${(width + sideViewOffsetX + depth)/2}\n20\n${-45}\n30\n0\n`;
  dxfContent += "40\n3.5\n"; // Text height
  dxfContent += `1\nCreated with Drawing Dreamer - ${new Date().toISOString().slice(0, 10)}\n`;
  dxfContent += "72\n1\n"; // Centered
  dxfContent += `11\n${(width + sideViewOffsetX + depth)/2}\n21\n${-45}\n31\n0\n`;
  
  // End the DXF file
  dxfContent += "0\nENDSEC\n0\nEOF";
  
  return dxfContent;
}

/**
 * Calculate the actual drawing dimensions with the scaling applied
 */
export function getScaledDimensions(
  dimensions: DrawingDimensions,
  scaleFactor: number
): { 
  width: number; 
  height: number; 
  depth: number; 
  cornerRadius: number; 
  x: number; 
  y: number;
} {
  const { width, height, depth = 0, cornerRadius } = dimensions;
  
  return {
    width: width * scaleFactor,
    height: height * scaleFactor,
    depth: depth * scaleFactor,
    cornerRadius: cornerRadius * scaleFactor,
    x: 0,
    y: 0,
  };
}