
import { InputParameters, CalculatedParameters } from "@/types/unifiedGenerator";

/**
 * Calculate parameters based on input values
 */
export const calculateParameters = (inputParams: InputParameters): CalculatedParameters => {
  const { beltWidth, beltSpeed, capacity, material, inclination, unit } = inputParams;
  
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
  return {
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
};
