
import React from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { InputParameters, CalculatedParameters } from "@/types/unifiedGenerator";

interface CalculationDetailsProps {
  inputParams: InputParameters;
  calculatedParams: CalculatedParameters;
}

const CalculationDetails: React.FC<CalculationDetailsProps> = ({
  inputParams,
  calculatedParams
}) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="conveyor">
        <AccordionTrigger className="text-lg">Conveyor Parameters</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-base">Primary Dimensions</h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/10 rounded-md">
                <div>
                  <div className="text-sm text-muted-foreground">Length:</div>
                  <div className="font-medium">{calculatedParams.conveyor.width} {calculatedParams.conveyor.unit}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Width:</div>
                  <div className="font-medium">{calculatedParams.conveyor.height} {calculatedParams.conveyor.unit}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Depth:</div>
                  <div className="font-medium">{calculatedParams.conveyor.depth} {calculatedParams.conveyor.unit}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Material Cross Section:</div>
                  <div className="font-medium">{calculatedParams.details.areaCross.toFixed(2)} mm²</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-base">Calculation Details</h3>
              <div className="grid grid-cols-1 gap-4 p-4 bg-muted/10 rounded-md text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Effective Belt Width:</span>
                  <span className="font-mono">{calculatedParams.details.effectiveBeltWidth.toFixed(2)} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Material Height (center):</span>
                  <span className="font-mono">{calculatedParams.details.centralHeight.toFixed(2)} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Material Cross-Section:</span>
                  <span className="font-mono">{calculatedParams.details.areaCrossSqM.toFixed(6)} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Material Density:</span>
                  <span className="font-mono">{calculatedParams.details.materialDensity} kg/m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calculated Capacity:</span>
                  <span className="font-mono">{calculatedParams.details.calculatedCapacity.toFixed(2)} t/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Belt Load:</span>
                  <span className="font-mono">{calculatedParams.details.beltLoad.toFixed(2)} kg/m</span>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="pulley">
        <AccordionTrigger className="text-lg">Pulley Parameters</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-base">Primary Dimensions</h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/10 rounded-md">
                <div>
                  <div className="text-sm text-muted-foreground">Diameter:</div>
                  <div className="font-medium">Ø{calculatedParams.pulley.diameter} {calculatedParams.pulley.unit}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Thickness:</div>
                  <div className="font-medium">{calculatedParams.pulley.thickness} {calculatedParams.pulley.unit}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Bore Diameter:</div>
                  <div className="font-medium">Ø{calculatedParams.pulley.boreDiameter} {calculatedParams.pulley.unit}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Inner Diameter:</div>
                  <div className="font-medium">Ø{calculatedParams.pulley.innerDiameter} {calculatedParams.pulley.unit}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-base">Additional Details</h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/10 rounded-md">
                <div>
                  <div className="text-sm text-muted-foreground">Groove Depth:</div>
                  <div className="font-medium">{calculatedParams.pulley.grooveDepth.toFixed(1)} {calculatedParams.pulley.unit}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Groove Width:</div>
                  <div className="font-medium">{calculatedParams.pulley.grooveWidth.toFixed(1)} {calculatedParams.pulley.unit}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Keyway Width:</div>
                  <div className="font-medium">{calculatedParams.pulley.keyWayWidth.toFixed(1)} {calculatedParams.pulley.unit}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Keyway Depth:</div>
                  <div className="font-medium">{calculatedParams.pulley.keyWayDepth.toFixed(1)} {calculatedParams.pulley.unit}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Load Factor:</div>
                  <div className="font-medium">{calculatedParams.details.loadFactor.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Capacity Factor:</div>
                  <div className="font-medium">{calculatedParams.details.capacityFactor.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="idler">
        <AccordionTrigger className="text-lg">Idler Parameters</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-base">Primary Dimensions</h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/10 rounded-md">
                <div>
                  <div className="text-sm text-muted-foreground">Outer Diameter:</div>
                  <div className="font-medium">Ø{calculatedParams.idler.outerDiameter} {calculatedParams.idler.unit}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Length:</div>
                  <div className="font-medium">{calculatedParams.idler.length} {calculatedParams.idler.unit}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Inner Diameter:</div>
                  <div className="font-medium">Ø{calculatedParams.idler.innerDiameter} {calculatedParams.idler.unit}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-base">Calculation Notes</h3>
              <div className="p-4 bg-muted/10 rounded-md text-sm space-y-2">
                <p className="text-muted-foreground">
                  • Idler diameter is determined by belt width: {inputParams.beltWidth} {inputParams.unit}
                </p>
                <p className="text-muted-foreground">
                  • Idler length is 10% wider than belt width (for tracking): {inputParams.beltWidth} × 1.1 = {calculatedParams.idler.length.toFixed(1)} {calculatedParams.idler.unit}
                </p>
                <p className="text-muted-foreground">
                  • Inner diameter is 25% of outer diameter or minimum 20mm: max(20, {calculatedParams.idler.outerDiameter} × 0.25) = {calculatedParams.idler.innerDiameter} {calculatedParams.idler.unit}
                </p>
                {inputParams.capacity > 1000 || inputParams.beltSpeed > 3.5 ? (
                  <p className="text-muted-foreground">
                    • Heavy duty adjustment applied (×1.2) due to high capacity or speed
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default CalculationDetails;
