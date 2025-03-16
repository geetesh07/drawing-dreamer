
import { Unit } from "@/utils/drawingUtils";

// Define the input parameters type
export interface InputParameters {
  // Common parameters
  beltWidth: number;
  beltSpeed: number;
  capacity: number;
  material: string;
  inclination: number;
  
  // Unit
  unit: "mm" | "cm" | "m" | "in";
}

// Parameters for different components
export interface CalculatedParameters {
  // Conveyor parameters
  conveyor: {
    width: number;
    height: number;
    depth?: number;
    cornerRadius: number;
    unit: "mm" | "cm" | "m" | "in";
  };
  
  // Pulley parameters
  pulley: {
    diameter: number;
    thickness: number;
    boreDiameter: number;
    innerDiameter: number;
    grooveDepth: number;
    grooveWidth: number;
    keyWayWidth: number;
    keyWayDepth: number;
    unit: "mm" | "cm" | "m" | "in";
  };
  
  // Idler parameters
  idler: {
    outerDiameter: number;
    length: number;
    innerDiameter: number;
    unit: "mm" | "cm" | "m" | "in";
  };

  // Calculation details - for displaying intermediate calculation results
  details: {
    areaCross: number;
    areaCrossSqM: number;
    calculatedCapacity: number;
    beltLoad: number;
    effectiveBeltWidth: number;
    centralHeight: number;
    materialHeight: number;
    materialDensity: number;
    loadFactor: number;
    capacityFactor: number;
  };
}

// Default input parameters
export const DEFAULT_INPUT_PARAMETERS: InputParameters = {
  beltWidth: 1000,
  beltSpeed: 1.5,
  capacity: 500,
  material: "coal",
  inclination: 10,
  unit: "mm"
};
