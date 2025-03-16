
import React from "react";
import { Button } from "@/components/ui/button";
import PulleyDrawingArea from "@/components/pulley/PulleyDrawingArea";
import { CalculatedParameters } from "@/types/unifiedGenerator";

interface PulleyDrawingProps {
  pulleyRef: React.RefObject<HTMLDivElement>;
  calculatedParams: CalculatedParameters;
  handleExportDXF: (type: "conveyor" | "pulley" | "idler") => void;
  handleExportPDF: (componentRef: React.RefObject<HTMLDivElement>, title: string) => void;
}

const PulleyDrawing: React.FC<PulleyDrawingProps> = ({
  pulleyRef,
  calculatedParams,
  handleExportDXF,
  handleExportPDF
}) => {
  return (
    <div className="bg-card border rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Pulley Drawing</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportDXF("pulley")}>
            Export DXF
          </Button>
          <Button variant="outline" onClick={() => handleExportPDF(pulleyRef, "Pulley")}>
            Export PDF
          </Button>
        </div>
      </div>
      
      <div ref={pulleyRef} className="bg-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Front view */}
          <div className="relative">
            <PulleyDrawingArea 
              parameters={calculatedParams.pulley}
              view="top"
              className="w-full"
            />
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-border rounded-md p-3 shadow-sm text-left">
              <div className="text-xs font-medium text-muted-foreground">FRONT VIEW</div>
            </div>
          </div>
          
          {/* Side view */}
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
        
        {/* Metadata */}
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
    </div>
  );
};

export default PulleyDrawing;
