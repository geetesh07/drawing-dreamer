import React from "react";
import { cn } from "@/lib/utils";
import { ViewType } from "@/utils/drawingUtils";

interface ViewSelectorProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="flex items-center justify-center space-x-2 mb-6 animate-slide-up">
      <span className="text-sm font-medium">Both views shown side by side</span>
    </div>
  );
};

export default ViewSelector;
