
import React from "react";
import { InputParameters } from "@/types/unifiedGenerator";

interface InputSummaryProps {
  inputParams: InputParameters;
}

const InputSummary: React.FC<InputSummaryProps> = ({ inputParams }) => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-medium mb-2">Input Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/10 rounded-md">
        <div>
          <div className="text-sm text-muted-foreground">Belt Width:</div>
          <div className="font-medium">{inputParams.beltWidth} {inputParams.unit}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Belt Speed:</div>
          <div className="font-medium">{inputParams.beltSpeed} m/s</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Capacity:</div>
          <div className="font-medium">{inputParams.capacity} t/h</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Material:</div>
          <div className="font-medium">{inputParams.material}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Inclination:</div>
          <div className="font-medium">{inputParams.inclination}°</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Unit:</div>
          <div className="font-medium">{inputParams.unit}</div>
        </div>
      </div>
    </div>
  );
};

export default InputSummary;
