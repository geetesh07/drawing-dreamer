
import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import DrawingArea from "@/components/DrawingArea";
import PulleyDrawingArea from "@/components/pulley/PulleyDrawingArea"; // Fixed import path
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { 
  DrawingDimensions, 
  DEFAULT_DIMENSIONS,
  ViewType,
  formatWithUnit,
  generateDXF
} from "@/utils/drawingUtils";

interface InputParameters {
  beltWidth: number;
  beltSpeed: number;
  capacity: number;
  material: string;
  inclination: number;
  unit: "mm" | "cm" | "m" | "in";
}

interface CalculatedParameters {
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
}

const DEFAULT_INPUT_PARAMETERS: InputParameters = {
  beltWidth: 1000,
  beltSpeed: 1.5,
  capacity: 500,
  material: "coal",
  inclination: 10,
  unit: "mm"
};

const PulleyDesign = () => {
  const [inputParams, setInputParams] = useState<InputParameters>(DEFAULT_INPUT_PARAMETERS);
  const [calculatedParams, setCalculatedParams] = useState<CalculatedParameters | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("input");
  const pulleyRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (["beltWidth", "beltSpeed", "capacity", "inclination"].includes(name)) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setInputParams(prev => ({
          ...prev,
          [name]: numValue
        }));
      }
    } else {
      setInputParams(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUnitChange = (unit: InputParameters["unit"]) => {
    setInputParams(prev => ({
      ...prev,
      unit
    }));
  };

  const calculateParameters = () => {
    try {
      const { beltWidth, beltSpeed, capacity, material, inclination, unit } = inputParams;

      if (beltWidth <= 0 || beltSpeed <= 0 || capacity <= 0) {
        toast.error("All values must be positive");
        return;
      }

      let beltWidthMm = beltWidth;
      if (unit === "cm") beltWidthMm = beltWidth * 10;
      if (unit === "m") beltWidthMm = beltWidth * 1000;
      if (unit === "in") beltWidthMm = beltWidth * 25.4;

      const materialDensity = {
        coal: 800,
        sand: 1500,
        gravel: 1800,
        ore: 2500,
        grain: 750
      }[material] || 1000;

      let pulleyDiameter = 0;

      if (beltSpeed < 2.5) {
        pulleyDiameter = beltWidthMm * 0.5;
      } else if (beltSpeed < 5) {
        pulleyDiameter = beltWidthMm * 0.6;
      } else {
        pulleyDiameter = beltWidthMm * 0.7;
      }

      const capacityFactor = 1 + (capacity / 5000);
      pulleyDiameter *= capacityFactor;

      pulleyDiameter = Math.ceil(pulleyDiameter / 50) * 50;

      const pulleyThickness = beltWidthMm * 1.2;
      const loadFactor = Math.sqrt(capacity / 100);
      const pulleyBoreDiameter = Math.max(50, pulleyDiameter * 0.2 * loadFactor);
      const pulleyInnerDiameter = pulleyDiameter * 0.7;
      const grooveDepth = pulleyDiameter * 0.05;
      const grooveWidth = pulleyDiameter * 0.1;
      const keyWayWidth = Math.max(8, pulleyBoreDiameter * 0.25);
      const keyWayDepth = keyWayWidth * 0.5;

      const params: CalculatedParameters = {
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
        }
      };

      setCalculatedParams(params);
      setActiveTab("results");
      toast.success("Parameters calculated successfully");
    } catch (error) {
      console.error("Calculation error:", error);
      toast.error("Error calculating parameters");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-background py-12 px-4 sm:px-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Pulley Design
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Enter basic parameters to generate technical drawings for pulley
          </p>
        </motion.div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="input">Input Parameters</TabsTrigger>
            <TabsTrigger value="results" disabled={!calculatedParams}>Generated Drawing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="input">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>System Parameters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-1.5">
                      <Label htmlFor="beltWidth" className="control-label">
                        Belt Width
                      </Label>
                      <Input
                        id="beltWidth"
                        name="beltWidth"
                        type="number"
                        value={inputParams.beltWidth}
                        onChange={handleInputChange}
                        min={1}
                        className="h-9"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="beltSpeed" className="control-label">
                        Belt Speed (m/s)
                      </Label>
                      <Input
                        id="beltSpeed"
                        name="beltSpeed"
                        type="number"
                        value={inputParams.beltSpeed}
                        onChange={handleInputChange}
                        min={0.1}
                        step={0.1}
                        className="h-9"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="capacity" className="control-label">
                        Capacity (t/h)
                      </Label>
                      <Input
                        id="capacity"
                        name="capacity"
                        type="number"
                        value={inputParams.capacity}
                        onChange={handleInputChange}
                        min={1}
                        className="h-9"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="material" className="control-label">
                        Material Type
                      </Label>
                      <select
                        id="material"
                        name="material"
                        value={inputParams.material}
                        onChange={(e) => setInputParams(prev => ({...prev, material: e.target.value}))}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                      >
                        <option value="coal">Coal</option>
                        <option value="sand">Sand</option>
                        <option value="gravel">Gravel</option>
                        <option value="ore">Ore</option>
                        <option value="grain">Grain</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="inclination" className="control-label">
                        Inclination (degrees)
                      </Label>
                      <Input
                        id="inclination"
                        name="inclination"
                        type="number"
                        value={inputParams.inclination}
                        onChange={handleInputChange}
                        min={0}
                        max={30}
                        className="h-9"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="control-label">Unit</Label>
                      <div className="flex border rounded-md overflow-hidden">
                        {(['mm', 'cm', 'm', 'in'] as const).map((unit) => (
                          <button
                            key={unit}
                            className={cn(
                              "px-3 py-1.5 text-sm transition-colors",
                              inputParams.unit === unit
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            )}
                            onClick={() => handleUnitChange(unit)}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-4">
                    <div className="text-sm text-muted-foreground italic">
                      Note: Enter all the required parameters above and click the button below to calculate dimensions
                      and generate detailed drawings.
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={calculateParameters}>
                        Calculate & Generate Drawing
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="results">
            {calculatedParams && (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                <motion.div variants={itemVariants} className="bg-card border rounded-lg shadow overflow-hidden">
                  <div className="p-4 bg-muted/30 border-b">
                    <h2 className="text-xl font-semibold">Calculated Parameters</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Input Parameters</h3>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-muted-foreground">Belt Width:</span>
                            <span className="ml-2 font-medium">{formatWithUnit(inputParams.beltWidth, inputParams.unit)}</span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Belt Speed:</span>
                            <span className="ml-2 font-medium">{inputParams.beltSpeed} m/s</span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Capacity:</span>
                            <span className="ml-2 font-medium">{inputParams.capacity} t/h</span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Material:</span>
                            <span className="ml-2 font-medium">{inputParams.material}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">Calculated Dimensions</h3>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-muted-foreground">Main Diameter:</span>
                            <span className="ml-2 font-medium">{formatWithUnit(calculatedParams.pulley.diameter, calculatedParams.pulley.unit)}</span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Face Width:</span>
                            <span className="ml-2 font-medium">{formatWithUnit(calculatedParams.pulley.thickness, calculatedParams.pulley.unit)}</span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Bore Diameter:</span>
                            <span className="ml-2 font-medium">{formatWithUnit(calculatedParams.pulley.boreDiameter, calculatedParams.pulley.unit)}</span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Inner Diameter (V-groove):</span>
                            <span className="ml-2 font-medium">{formatWithUnit(calculatedParams.pulley.innerDiameter, calculatedParams.pulley.unit)}</span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Groove Depth:</span>
                            <span className="ml-2 font-medium">{formatWithUnit(calculatedParams.pulley.grooveDepth, calculatedParams.pulley.unit)}</span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Groove Width:</span>
                            <span className="ml-2 font-medium">{formatWithUnit(calculatedParams.pulley.grooveWidth, calculatedParams.pulley.unit)}</span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Keyway (Width × Depth):</span>
                            <span className="ml-2 font-medium">
                              {formatWithUnit(calculatedParams.pulley.keyWayWidth, calculatedParams.pulley.unit)} × {formatWithUnit(calculatedParams.pulley.keyWayDepth, calculatedParams.pulley.unit)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="text-lg font-medium mb-3">Calculation Details</h3>
                      <div className="text-sm text-muted-foreground space-y-2">
                        <p>• Main Diameter = Belt Width × (50-70% based on speed) × Capacity Factor</p>
                        <p>• Face Width = Belt Width × 1.2 (20% wider for tracking)</p>
                        <p>• Bore Diameter = max(50mm, Main Diameter × 0.2 × Load Factor)</p>
                        <p>• Inner Diameter = Main Diameter × 0.7 (V-groove taper)</p>
                        <p>• Groove Depth = Main Diameter × 0.05 (5% of diameter)</p>
                        <p>• Groove Width = Main Diameter × 0.1 (10% of diameter)</p>
                        <p>• Keyway Width = max(8mm, Bore Diameter × 0.25)</p>
                        <p>• Keyway Depth = Keyway Width × 0.5</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="bg-card border rounded-lg shadow overflow-hidden">
                  <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Pulley Drawing</h2>
                  </div>
                  
                  <div ref={pulleyRef} className="bg-white p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative">
                        <PulleyDrawingArea 
                          parameters={calculatedParams.pulley}
                          view="side"
                          className="w-full"
                        />
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-border rounded-md p-3 shadow-sm text-left">
                          <div className="text-xs font-medium text-muted-foreground">FRONT VIEW</div>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <PulleyDrawingArea 
                          parameters={calculatedParams.pulley}
                          view="side"
                          className="w-full"
                        />
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-border rounded-md p-3 shadow-sm text-left">
                          <div className="text-xs font-medium text-muted-foreground">SIDE VIEW</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-white/90 backdrop-blur-sm border border-border rounded-md p-4 shadow-sm">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">PULLEY DIAMETER</div>
                          <div className="text-sm font-medium mt-1">
                            Ø{calculatedParams.pulley.diameter} {calculatedParams.pulley.unit}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">THICKNESS</div>
                          <div className="text-sm font-medium mt-1">
                            {calculatedParams.pulley.thickness} {calculatedParams.pulley.unit}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">BORE DIAMETER</div>
                          <div className="text-sm font-medium mt-1">
                            Ø{calculatedParams.pulley.boreDiameter} {calculatedParams.pulley.unit}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">INNER DIAMETER</div>
                          <div className="text-sm font-medium mt-1">
                            Ø{calculatedParams.pulley.innerDiameter} {calculatedParams.pulley.unit}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default PulleyDesign;
