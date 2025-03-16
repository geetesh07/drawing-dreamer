
import { CalculatedParameters } from "@/types/unifiedGenerator";

// Generate pulley DXF - matching the approach used in PulleyDesign
export const generatePulleyDXF = (pulley: CalculatedParameters["pulley"]) => {
  const { diameter, thickness, boreDiameter, innerDiameter, unit } = pulley;
  const radius = diameter / 2;
  const boreRadius = boreDiameter / 2;
  
  // Create basic DXF content
  let dxfContent = "0\nSECTION\n2\nHEADER\n";
  dxfContent += "9\n$ACADVER\n1\nAC1027\n"; // AutoCAD 2013 format
  dxfContent += "0\nENDSEC\n";
  
  // Add tables section with layers
  dxfContent += "0\nSECTION\n2\nTABLES\n";
  dxfContent += "0\nTABLE\n2\nLAYER\n70\n3\n"; // 3 layers
  
  // Define TOP_VIEW layer
  dxfContent += "0\nLAYER\n2\nTOP_VIEW\n";
  dxfContent += "70\n0\n"; // Layer is on and thawed
  dxfContent += "62\n5\n"; // Blue color
  dxfContent += "6\nCONTINUOUS\n"; // Line type
  
  // Define SIDE_VIEW layer
  dxfContent += "0\nLAYER\n2\nSIDE_VIEW\n";
  dxfContent += "70\n0\n";
  dxfContent += "62\n3\n"; // Green color
  dxfContent += "6\nCONTINUOUS\n";
  
  // Define DIMENSIONS layer
  dxfContent += "0\nLAYER\n2\nDIMENSIONS\n";
  dxfContent += "70\n0\n";
  dxfContent += "62\n1\n"; // Red color
  dxfContent += "6\nCONTINUOUS\n";
  
  dxfContent += "0\nENDTAB\n";  // End LAYER table
  dxfContent += "0\nENDSEC\n"; // End TABLES section
  
  // Start ENTITIES section
  dxfContent += "0\nSECTION\n2\nENTITIES\n";
  
  // Top view (circle)
  dxfContent += `0\nCIRCLE\n8\nTOP_VIEW\n10\n0\n20\n0\n30\n0\n40\n${radius}\n`;
  
  // Bore hole
  dxfContent += `0\nCIRCLE\n8\nTOP_VIEW\n10\n0\n20\n0\n30\n0\n40\n${boreRadius}\n`;
  
  // Add keyway on top view
  const keyWayWidth = pulley.keyWayWidth;
  const keyWayHeight = pulley.keyWayDepth;
  
  dxfContent += `0\nLINE\n8\nTOP_VIEW\n10\n${-keyWayWidth/2}\n20\n${-boreRadius}\n30\n0\n11\n${keyWayWidth/2}\n21\n${-boreRadius}\n31\n0\n`;
  dxfContent += `0\nLINE\n8\nTOP_VIEW\n10\n${-keyWayWidth/2}\n20\n${-boreRadius}\n30\n0\n11\n${-keyWayWidth/2}\n21\n${-boreRadius-keyWayHeight}\n31\n0\n`;
  dxfContent += `0\nLINE\n8\nTOP_VIEW\n10\n${keyWayWidth/2}\n20\n${-boreRadius}\n30\n0\n11\n${keyWayWidth/2}\n21\n${-boreRadius-keyWayHeight}\n31\n0\n`;
  dxfContent += `0\nLINE\n8\nTOP_VIEW\n10\n${-keyWayWidth/2}\n20\n${-boreRadius-keyWayHeight}\n30\n0\n11\n${keyWayWidth/2}\n21\n${-boreRadius-keyWayHeight}\n31\n0\n`;
  
  // Side view (rectangle) - offset by radius*3 in Y
  const sideViewOffsetY = radius * 3;
  const halfThickness = thickness / 2;
  
  // Main rectangle
  dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${-halfThickness}\n20\n${-radius + sideViewOffsetY}\n30\n0\n11\n${halfThickness}\n21\n${-radius + sideViewOffsetY}\n31\n0\n`;
  dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${halfThickness}\n20\n${-radius + sideViewOffsetY}\n30\n0\n11\n${halfThickness}\n21\n${radius + sideViewOffsetY}\n31\n0\n`;
  dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${halfThickness}\n20\n${radius + sideViewOffsetY}\n30\n0\n11\n${-halfThickness}\n21\n${radius + sideViewOffsetY}\n31\n0\n`;
  dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${-halfThickness}\n20\n${radius + sideViewOffsetY}\n30\n0\n11\n${-halfThickness}\n21\n${-radius + sideViewOffsetY}\n31\n0\n`;
  
  // Center hole line
  dxfContent += `0\nLINE\n8\nSIDE_VIEW\n6\nDASHED\n10\n${-halfThickness-10}\n20\n${sideViewOffsetY}\n30\n0\n11\n${halfThickness+10}\n21\n${sideViewOffsetY}\n31\n0\n`;
  
  // Inner V-groove lines
  const innerRadius = innerDiameter / 2;
  const grooveDepth = pulley.grooveDepth;
  
  // Top inner line
  dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${-halfThickness}\n20\n${-innerRadius + sideViewOffsetY}\n30\n0\n11\n${halfThickness}\n21\n${-innerRadius + sideViewOffsetY}\n31\n0\n`;
  
  // Bottom inner line
  dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${-halfThickness}\n20\n${innerRadius + sideViewOffsetY}\n30\n0\n11\n${halfThickness}\n21\n${innerRadius + sideViewOffsetY}\n31\n0\n`;
  
  // V-groove
  dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${-halfThickness/2}\n20\n${-innerRadius + sideViewOffsetY}\n30\n0\n11\n0\n21\n${sideViewOffsetY}\n31\n0\n`;
  dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${halfThickness/2}\n20\n${-innerRadius + sideViewOffsetY}\n30\n0\n11\n0\n21\n${sideViewOffsetY}\n31\n0\n`;
  dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${-halfThickness/2}\n20\n${innerRadius + sideViewOffsetY}\n30\n0\n11\n0\n21\n${sideViewOffsetY}\n31\n0\n`;
  dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${halfThickness/2}\n20\n${innerRadius + sideViewOffsetY}\n30\n0\n11\n0\n21\n${sideViewOffsetY}\n31\n0\n`;
  
  // Add text for dimensions
  dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${-radius - 20}\n30\n0\n40\n10\n1\nPULLEY DRAWING\n`;
  dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${-radius - 40}\n30\n0\n40\n8\n1\nDiameter: ${diameter}${unit}\n`;
  dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${-radius - 55}\n30\n0\n40\n8\n1\nThickness: ${thickness}${unit}\n`;
  dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${-radius - 70}\n30\n0\n40\n8\n1\nBore: ${boreDiameter}${unit}\n`;
  
  // Add view titles
  dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${radius + 20}\n30\n0\n40\n8\n1\nTOP VIEW\n`;
  dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${sideViewOffsetY + radius + 20}\n30\n0\n40\n8\n1\nSIDE VIEW\n`;
  
  dxfContent += "0\nENDSEC\n0\nEOF";
  
  return dxfContent;
};

// Generate idler DXF - matching the approach used in IdlerDesign
export const generateIdlerDXF = (idler: CalculatedParameters["idler"]) => {
  const { outerDiameter, length, innerDiameter, unit } = idler;
  const radius = outerDiameter / 2;
  const boreRadius = innerDiameter / 2;
  
  // Create basic DXF content
  let dxfContent = "0\nSECTION\n2\nHEADER\n";
  dxfContent += "9\n$ACADVER\n1\nAC1027\n"; // AutoCAD 2013 format
  dxfContent += "0\nENDSEC\n";
  
  // Add tables section with layers
  dxfContent += "0\nSECTION\n2\nTABLES\n";
  dxfContent += "0\nTABLE\n2\nLAYER\n70\n3\n"; // 3 layers
  
  // Define TOP_VIEW layer
  dxfContent += "0\nLAYER\n2\nTOP_VIEW\n";
  dxfContent += "70\n0\n"; // Layer is on and thawed
  dxfContent += "62\n5\n"; // Blue color
  dxfContent += "6\nCONTINUOUS\n"; // Line type
  
  // Define SIDE_VIEW layer
  dxfContent += "0\nLAYER\n2\nSIDE_VIEW\n";
  dxfContent += "70\n0\n";
  dxfContent += "62\n3\n"; // Green color
  dxfContent += "6\nCONTINUOUS\n";
  
  // Define SECTION_VIEW layer
  dxfContent += "0\nLAYER\n2\nSECTION_VIEW\n";
  dxfContent += "70\n0\n";
  dxfContent += "62\n1\n"; // Red color
  dxfContent += "6\nCONTINUOUS\n";
  
  // Define DIMENSIONS layer
  dxfContent += "0\nLAYER\n2\nDIMENSIONS\n";
  dxfContent += "70\n0\n";
  dxfContent += "62\n2\n"; // Yellow color
  dxfContent += "6\nCONTINUOUS\n";
  
  dxfContent += "0\nENDTAB\n";  // End LAYER table
  dxfContent += "0\nENDSEC\n"; // End TABLES section
  
  // Start ENTITIES section
  dxfContent += "0\nSECTION\n2\nENTITIES\n";
  
  // Top view (circle)
  dxfContent += `0\nCIRCLE\n8\nTOP_VIEW\n10\n0\n20\n0\n30\n0\n40\n${radius}\n`;
  
  // Bore hole
  dxfContent += `0\nCIRCLE\n8\nTOP_VIEW\n10\n0\n20\n0\n30\n0\n40\n${boreRadius}\n`;
  
  // Side view (rectangle) - offset by radius*3 in Y
  const sideViewOffsetY = radius * 3;
  const halfLength = length / 2;
  
  // Main rectangle for side view
  dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${-halfLength}\n20\n${-radius + sideViewOffsetY}\n30\n0\n11\n${halfLength}\n21\n${-radius + sideViewOffsetY}\n31\n0\n`;
  dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${halfLength}\n20\n${-radius + sideViewOffsetY}\n30\n0\n11\n${halfLength}\n21\n${radius + sideViewOffsetY}\n31\n0\n`;
  dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${halfLength}\n20\n${radius + sideViewOffsetY}\n30\n0\n11\n${-halfLength}\n21\n${radius + sideViewOffsetY}\n31\n0\n`;
  dxfContent += `0\nLINE\n8\nSIDE_VIEW\n10\n${-halfLength}\n20\n${radius + sideViewOffsetY}\n30\n0\n11\n${-halfLength}\n21\n${-radius + sideViewOffsetY}\n31\n0\n`;
  
  // Center hole line on side view
  dxfContent += `0\nLINE\n8\nSIDE_VIEW\n6\nDASHED\n10\n${-halfLength-10}\n20\n${sideViewOffsetY}\n30\n0\n11\n${halfLength+10}\n21\n${sideViewOffsetY}\n31\n0\n`;
  
  // Section view (offset below the side view)
  const sectionViewOffsetY = sideViewOffsetY + radius * 3;
  
  // Outer circle for section view
  dxfContent += `0\nCIRCLE\n8\nSECTION_VIEW\n10\n0\n20\n${sectionViewOffsetY}\n30\n0\n40\n${radius}\n`;
  
  // Inner circle for section view
  dxfContent += `0\nCIRCLE\n8\nSECTION_VIEW\n10\n0\n20\n${sectionViewOffsetY}\n30\n0\n40\n${boreRadius}\n`;
  
  // Add center lines
  dxfContent += `0\nLINE\n8\nSECTION_VIEW\n6\nCENTER\n10\n${-radius-10}\n20\n${sectionViewOffsetY}\n30\n0\n11\n${radius+10}\n21\n${sectionViewOffsetY}\n31\n0\n`;
  dxfContent += `0\nLINE\n8\nSECTION_VIEW\n6\nCENTER\n10\n0\n20\n${sectionViewOffsetY-radius-10}\n30\n0\n11\n0\n21\n${sectionViewOffsetY+radius+10}\n31\n0\n`;
  
  // Add hatch pattern for section (simplified)
  const hatchSpacing = 5;
  for (let i = -radius; i <= radius; i += hatchSpacing) {
      // Skip the center bore
      if (i > -boreRadius && i < boreRadius) continue;
      
      dxfContent += `0\nLINE\n8\nSECTION_VIEW\n10\n${-Math.sqrt(radius*radius - i*i)}\n20\n${sectionViewOffsetY + i}\n30\n0\n11\n${Math.sqrt(radius*radius - i*i)}\n21\n${sectionViewOffsetY + i}\n31\n0\n`;
  }
  
  // Add text for dimensions
  dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${-radius - 20}\n30\n0\n40\n10\n1\nIDLER DRAWING\n`;
  dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${-radius - 40}\n30\n0\n40\n8\n1\nDiameter: ${outerDiameter}${unit}\n`;
  dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${-radius - 55}\n30\n0\n40\n8\n1\nLength: ${length}${unit}\n`;
  dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${-radius - 70}\n30\n0\n40\n8\n1\nBore: ${innerDiameter}${unit}\n`;
  
  // Add view titles
  dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${radius + 20}\n30\n0\n40\n8\n1\nTOP VIEW\n`;
  dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${sideViewOffsetY + radius + 20}\n30\n0\n40\n8\n1\nSIDE VIEW\n`;
  dxfContent += `0\nTEXT\n8\nDIMENSIONS\n10\n0\n20\n${sectionViewOffsetY + radius + 20}\n30\n0\n40\n8\n1\nSECTION VIEW\n`;
  
  dxfContent += "0\nENDSEC\n0\nEOF";
  
  return dxfContent;
};
