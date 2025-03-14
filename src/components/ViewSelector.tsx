
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
      <button
        className={cn("view-btn", activeView === "top" && "active")}
        onClick={() => onViewChange("top")}
        aria-label="Show top view"
      >
        Top View
      </button>
      <div className="h-4 w-px bg-border mx-1" />
      <button
        className={cn("view-btn", activeView === "side" && "active")}
        onClick={() => onViewChange("side")}
        aria-label="Show side view"
      >
        Side View
      </button>
    </div>
  );
};

export default ViewSelector;
