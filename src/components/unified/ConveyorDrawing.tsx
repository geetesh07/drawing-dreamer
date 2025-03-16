
import React from "react";
import { Button } from "@/components/ui/button";
import DrawingArea from "@/components/DrawingArea";
import { formatWithUnit } from "@/utils/drawingUtils";
import { CalculatedParameters, InputParameters } from "@/types/unifiedGenerator";

interface ConveyorDrawingProps {
  conveyorRef: React.RefObject<HTMLDivElement>;
  calculatedParams: CalculatedParameters;
  inputParams: InputParameters;
  handleExportDXF: (type: "conveyor" | "pulley" | "idler") => void;
  handleExportPDF: (componentRef: React.RefObject<HTMLDivElement>, title: string) => void;
}

const ConveyorDrawing: React.FC<ConveyorDrawingProps> = ({
  conveyorRef,
  calculatedParams,
  inputParams,
  handleExportDXF,
  handleExportPDF
}) => {
  return (
    <div className="bg-card border rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Conveyor Drawing</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportDXF("conveyor")}>
            Export DXF
          </Button>
          <Button variant="outline" onClick={() => handleExportPDF(conveyorRef, "Conveyor")}>
            Export PDF
          </Button>
        </div>
      </div>
      
      <div ref={conveyorRef} className="bg-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top view */}
          <div className="relative">
            <DrawingArea 
              dimensions={calculatedParams.conveyor} 
              activeView="top" 
              className="w-full"
            />
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-border rounded-md p-3 shadow-sm text-left">
              <div className="text-xs font-medium text-muted-foreground">TOP VIEW</div>
            </div>
          </div>
          
          {/* Side view */}
          <div className="relative">
            <DrawingArea 
              dimensions={calculatedParams.conveyor} 
              activeView="side" 
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
              <div className="text-xs font-medium text-muted-foreground">CONVEYOR DIMENSIONS</div>
              <div className="text-sm font-medium mt-1">
                {formatWithUnit(calculatedParams.conveyor.width, calculatedParams.conveyor.unit)} × 
                {formatWithUnit(calculatedParams.conveyor.height, calculatedParams.conveyor.unit)} × 
                {formatWithUnit(calculatedParams.conveyor.depth, calculatedParams.conveyor.unit)}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">BELT WIDTH</div>
              <div className="text-sm font-medium mt-1">
                {formatWithUnit(inputParams.beltWidth, inputParams.unit)}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">CAPACITY</div>
              <div className="text-sm font-medium mt-1">
                {inputParams.capacity} t/h
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">BELT SPEED</div>
              <div className="text-sm font-medium mt-1">
                {inputParams.beltSpeed} m/s
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConveyorDrawing;
