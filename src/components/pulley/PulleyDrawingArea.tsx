
import React, { useRef, useEffect, useState } from "react";
import { ViewType, PulleyParameters } from "./types";
import { createSvgElement, calculateScaleFactor, addShadowFilter } from "./drawingUtils";
import { drawTopView } from "./TopView";
import { drawSideView } from "./SideView";

interface PulleyDrawingAreaProps {
  parameters: PulleyParameters;
  view: ViewType;
  className?: string;
}

const PulleyDrawingArea: React.FC<PulleyDrawingAreaProps> = ({ 
  parameters, 
  view,
  className 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Get container size on mount and window resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Update on theme change
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' && 
            containerRef.current && 
            containerSize.width > 0) {
          // Redraw when theme changes
          drawSvg();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, [containerSize, parameters, view]);

  // Create or update SVG drawing
  const drawSvg = () => {
    if (!containerRef.current || containerSize.width === 0) return;

    // Calculate scale factor based on container size
    const { diameter, thickness, boreDiameter, unit } = parameters;
    
    // Calculate scale factor
    const scaleFactor = calculateScaleFactor(containerSize, parameters, view);
    
    // Apply scale factor
    const scaledDiameter = diameter * scaleFactor;
    const scaledThickness = thickness * scaleFactor;
    const scaledBoreDiameter = boreDiameter * scaleFactor;
    
    // Position drawing in center of container
    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;
    
    // Create SVG element - fixed by passing the ref object, not the element itself
    const svg = createSvgElement(containerRef, containerSize.width, containerSize.height);
    if (!svg) return;

    // Add shadow filter definition
    addShadowFilter(svg);
    
    // Check if we're in dark mode
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    // Draw based on active view
    if (view === "top") {
      drawTopView(
        svg, 
        centerX, 
        centerY, 
        scaledDiameter, 
        scaledBoreDiameter, 
        parameters, 
        scaleFactor,
        isDarkMode
      );
    } else {
      drawSideView(
        svg, 
        centerX, 
        centerY, 
        scaledDiameter, 
        scaledThickness, 
        scaledBoreDiameter, 
        parameters,
        isDarkMode
      );
    }
  };

  // Create or update SVG drawing when dependencies change
  useEffect(() => {
    drawSvg();
    
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [parameters, containerSize, view]);

  return <div ref={containerRef} className={className} style={{ width: '100%', height: '100%', minHeight: 400 }} />;
};

export default PulleyDrawingArea;
