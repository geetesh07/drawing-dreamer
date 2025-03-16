
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InputParameters } from "@/types/unifiedGenerator";

interface InputFormProps {
  inputParams: InputParameters;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUnitChange: (unit: InputParameters["unit"]) => void;
  calculateParameters: () => void;
}

const InputForm: React.FC<InputFormProps> = ({
  inputParams,
  handleInputChange,
  handleUnitChange,
  calculateParameters
}) => {
  return (
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
          onChange={(e) => {
            const customChangeEvent = {
              target: {
                name: "material",
                value: e.target.value
              }
            } as React.ChangeEvent<HTMLInputElement>;
            handleInputChange(customChangeEvent);
          }}
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
      
      <div className="lg:col-span-3 flex flex-col space-y-4">
        <div className="text-sm text-muted-foreground italic">
          Note: Enter all the required parameters above and click the button below to calculate dimensions
          and generate detailed drawings for all components.
        </div>
        <div className="flex justify-end">
          <Button onClick={calculateParameters}>
            Calculate & Generate Drawings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InputForm;
