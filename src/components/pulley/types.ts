
export interface PulleyParameters {
  diameter: number;
  thickness: number;
  boreDiameter: number;
  unit: "mm" | "cm" | "m" | "in";
  innerDiameter?: number;
  grooveDepth?: number;
}

export interface DrawingViewProps {
  parameters: PulleyParameters;
  containerSize: { width: number; height: number };
  isDarkMode: boolean;
  scaleFactor: number;
}

export type ViewType = "top" | "side";
