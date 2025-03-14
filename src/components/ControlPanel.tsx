
import React from "react";
import { DrawingDimensions, Unit, validateCornerRadius } from "@/utils/drawingUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ControlPanelProps {
  dimensions: DrawingDimensions;
  setDimensions: React.Dispatch<React.SetStateAction<DrawingDimensions>>;
  onGenerateDrawing: () => void;
  onExportDXF: () => void;
  onExportPDF: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  dimensions,
  setDimensions,
  onGenerateDrawing,
  onExportDXF,
  onExportPDF,
}) => {
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    if (name === "cornerRadius") {
      const validRadius = validateCornerRadius(
        dimensions.width,
        dimensions.height,
        numValue
      );
      
      if (validRadius !== numValue) {
        toast.info(`Corner radius limited to ${validRadius} ${dimensions.unit}`);
      }
      
      setDimensions((prev) => ({
        ...prev,
        [name]: validRadius,
      }));
    } else {
      setDimensions((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    }
  };

  // Handle unit change
  const handleUnitChange = (unit: Unit) => {
    setDimensions((prev) => ({
      ...prev,
      unit,
    }));
  };

  return (
    <div className="control-panel animate-slide-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
        <div className="space-y-1.5">
          <Label htmlFor="width" className="control-label">
            Width
          </Label>
          <Input
            id="width"
            name="width"
            type="number"
            value={dimensions.width}
            onChange={handleInputChange}
            min={1}
            className="h-9"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="height" className="control-label">
            Height
          </Label>
          <Input
            id="height"
            name="height"
            type="number"
            value={dimensions.height}
            onChange={handleInputChange}
            min={1}
            className="h-9"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="depth" className="control-label">
            Depth
          </Label>
          <Input
            id="depth"
            name="depth"
            type="number"
            value={dimensions.depth}
            onChange={handleInputChange}
            min={1}
            className="h-9"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="cornerRadius" className="control-label">
            Corner Radius
          </Label>
          <Input
            id="cornerRadius"
            name="cornerRadius"
            type="number"
            value={dimensions.cornerRadius}
            onChange={handleInputChange}
            min={0}
            className="h-9"
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1.5 w-full sm:w-auto">
          <Label className="control-label">Unit</Label>
          <div className="flex border rounded-md overflow-hidden">
            {(['mm', 'cm', 'm', 'in'] as Unit[]).map((unit) => (
              <button
                key={unit}
                className={cn(
                  "px-3 py-1.5 text-sm transition-colors",
                  dimensions.unit === unit
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
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={onGenerateDrawing} className="flex-1 sm:flex-none">
            Generate
          </Button>
          <Button variant="outline" onClick={onExportDXF} className="flex-1 sm:flex-none">
            DXF
          </Button>
          <Button variant="outline" onClick={onExportPDF} className="flex-1 sm:flex-none">
            PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
