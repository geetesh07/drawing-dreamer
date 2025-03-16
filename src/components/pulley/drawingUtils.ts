
export const formatWithUnit = (value: number, unit: string) => {
  return `${value} ${unit}`;
};

export const calculateScaleFactor = (
  containerSize: { width: number; height: number },
  parameters: { diameter: number; thickness: number },
  view: "top" | "side",
  padding: number = 150
): number => {
  const { width: containerWidth, height: containerHeight } = containerSize;
  const { diameter, thickness } = parameters;
  
  const availableWidth = containerWidth - padding * 2;
  const availableHeight = containerHeight - padding * 2;
  
  let scaleFactor: number;
  
  if (view === "top") {
    // For top view, scale based on diameter
    scaleFactor = availableWidth / diameter;
  } else {
    // For side view, scale based on both diameter and thickness
    scaleFactor = Math.min(availableHeight / diameter, availableWidth / thickness);
  }
  
  return scaleFactor;
};

export const createSvgElement = (containerRef: React.RefObject<HTMLDivElement>, width: number, height: number): SVGSVGElement | null => {
  if (!containerRef.current) return null;
  
  // Clear previous drawing
  containerRef.current.innerHTML = '';
  
  // Create new SVG element
  const svgNS = "http://www.w3.org/2000/svg";
  const newSvg = document.createElementNS(svgNS, "svg");
  newSvg.setAttribute("width", width.toString());
  newSvg.setAttribute("height", height.toString());
  newSvg.style.overflow = "visible";
  
  containerRef.current.appendChild(newSvg);
  return newSvg;
};

export const addShadowFilter = (svg: SVGSVGElement): void => {
  const svgNS = "http://www.w3.org/2000/svg";
  
  // Create defs for shadows
  const defs = document.createElementNS(svgNS, "defs");
  svg.appendChild(defs);
  
  const filter = document.createElementNS(svgNS, "filter");
  filter.setAttribute("id", "shadow");
  filter.setAttribute("x", "-20%");
  filter.setAttribute("y", "-20%");
  filter.setAttribute("width", "140%");
  filter.setAttribute("height", "140%");
  defs.appendChild(filter);
  
  const feGaussianBlur = document.createElementNS(svgNS, "feGaussianBlur");
  feGaussianBlur.setAttribute("in", "SourceAlpha");
  feGaussianBlur.setAttribute("stdDeviation", "3");
  filter.appendChild(feGaussianBlur);
  
  const feOffset = document.createElementNS(svgNS, "feOffset");
  feOffset.setAttribute("dx", "0");
  feOffset.setAttribute("dy", "2");
  feOffset.setAttribute("result", "offsetblur");
  filter.appendChild(feOffset);
  
  const feComponentTransfer = document.createElementNS(svgNS, "feComponentTransfer");
  filter.appendChild(feComponentTransfer);
  
  const feFuncA = document.createElementNS(svgNS, "feFuncA");
  feFuncA.setAttribute("type", "linear");
  feFuncA.setAttribute("slope", "0.2");
  feComponentTransfer.appendChild(feFuncA);
  
  const feMerge = document.createElementNS(svgNS, "feMerge");
  filter.appendChild(feMerge);
  
  const feMergeNode1 = document.createElementNS(svgNS, "feMergeNode");
  feMerge.appendChild(feMergeNode1);
  
  const feMergeNode2 = document.createElementNS(svgNS, "feMergeNode");
  feMergeNode2.setAttribute("in", "SourceGraphic");
  feMerge.appendChild(feMergeNode2);
};
