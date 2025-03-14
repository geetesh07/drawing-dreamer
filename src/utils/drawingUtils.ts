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
 */
export function generateDXF(dimensions: DrawingDimensions): string {
  const { width, height, depth = 50, cornerRadius, unit } = dimensions;
  const validRadius = validateCornerRadius(width, height, cornerRadius);
  
  // Create simplified DXF content
  let dxfContent = `0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nTABLES\n0\nENDSEC\n0\nSECTION\n2\nBLOCKS\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n`;
  
  // Top view
  // Top-right corner arc
  dxfContent += `0\nARC\n8\n0\n10\n${width - validRadius}\n20\n${validRadius}\n30\n0\n40\n${validRadius}\n50\n0\n51\n90\n`;
  
  // Top-left corner arc
  dxfContent += `0\nARC\n8\n0\n10\n${validRadius}\n20\n${validRadius}\n30\n0\n40\n${validRadius}\n50\n90\n51\n180\n`;
  
  // Bottom-left corner arc
  dxfContent += `0\nARC\n8\n0\n10\n${validRadius}\n20\n${height - validRadius}\n30\n0\n40\n${validRadius}\n50\n180\n51\n270\n`;
  
  // Bottom-right corner arc
  dxfContent += `0\nARC\n8\n0\n10\n${width - validRadius}\n20\n${height - validRadius}\n30\n0\n40\n${validRadius}\n50\n270\n51\n360\n`;
  
  // Top line
  dxfContent += `0\nLINE\n8\n0\n10\n${validRadius}\n20\n0\n11\n${width - validRadius}\n21\n0\n`;
  
  // Right line
  dxfContent += `0\nLINE\n8\n0\n10\n${width}\n20\n${validRadius}\n11\n${width}\n21\n${height - validRadius}\n`;
  
  // Bottom line
  dxfContent += `0\nLINE\n8\n0\n10\n${validRadius}\n20\n${height}\n11\n${width - validRadius}\n21\n${height}\n`;
  
  // Left line
  dxfContent += `0\nLINE\n8\n0\n10\n0\n20\n${validRadius}\n11\n0\n21\n${height - validRadius}\n`;
  
  // Side view - offset to the right
  const sideViewOffsetX = width + 50; // 50 units gap between views
  
  // Draw simple rectangle for side view
  dxfContent += `0\nLINE\n8\n0\n10\n${sideViewOffsetX}\n20\n0\n11\n${sideViewOffsetX + depth}\n21\n0\n`; // Top line
  dxfContent += `0\nLINE\n8\n0\n10\n${sideViewOffsetX + depth}\n20\n0\n11\n${sideViewOffsetX + depth}\n21\n${height}\n`; // Right line
  dxfContent += `0\nLINE\n8\n0\n10\n${sideViewOffsetX + depth}\n20\n${height}\n11\n${sideViewOffsetX}\n21\n${height}\n`; // Bottom line
  dxfContent += `0\nLINE\n8\n0\n10\n${sideViewOffsetX}\n20\n${height}\n11\n${sideViewOffsetX}\n21\n0\n`; // Left line
  
  dxfContent += `0\nENDSEC\n0\nEOF`;
  
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
