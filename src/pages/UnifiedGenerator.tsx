import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import components
import InputForm from "@/components/unified/InputForm";
import InputSummary from "@/components/unified/InputSummary";
import CalculationDetails from "@/components/unified/CalculationDetails";
import ConveyorDrawing from "@/components/unified/ConveyorDrawing";
import PulleyDrawing from "@/components/unified/PulleyDrawing";
import IdlerDrawing from "@/components/unified/IdlerDrawing";
import LoadingOverlay from "@/components/unified/LoadingOverlay";

// Import utils and types
import { calculateParameters } from "@/utils/calculationUtils";
import { handleExportDXF, handleExportPDF } from "@/utils/exportUtils";
import { InputParameters, CalculatedParameters, DEFAULT_INPUT_PARAMETERS } from "@/types/unifiedGenerator";

const UnifiedGenerator = () => {
  const [inputParams, setInputParams] = useState<InputParameters>(DEFAULT_INPUT_PARAMETERS);
  const [calculatedParams, setCalculatedParams] = useState<CalculatedParameters | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("input");
  
  // Drawing refs for exports
  const conveyorRef = useRef<HTMLDivElement>(null);
  const pulleyRef = useRef<HTMLDivElement>(null);
  const idlerRef = useRef<HTMLDivElement>(null);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric values
    if (["beltWidth", "beltSpeed", "capacity", "inclination"].includes(name)) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setInputParams(prev => ({
          ...prev,
          [name]: numValue
        }));
      }
    } else {
      // Handle string values
      setInputParams(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle unit change
  const handleUnitChange = (unit: InputParameters["unit"]) => {
    setInputParams(prev => ({
      ...prev,
      unit
    }));
  };

  // Calculate parameters button handler
  const handleCalculateParameters = () => {
    try {
      const { beltWidth, beltSpeed, capacity } = inputParams;
      
      // Validate inputs
      if (beltWidth <= 0 || beltSpeed <= 0 || capacity <= 0) {
        toast.error("All values must be positive");
        return;
      }
      
      setIsLoading(true);
      
      // Calculate parameters using the utility function
      const params = calculateParameters(inputParams);
      setCalculatedParams(params);
      
      // Switch to results tab
      setActiveTab("results");
      
      toast.success("Parameters calculated successfully");
    } catch (error) {
      console.error("Calculation error:", error);
      toast.error("Error calculating parameters");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Export DXF with wrapper to handle loading state
  const exportDXF = (type: "conveyor" | "pulley" | "idler") => {
    if (!calculatedParams) {
      toast.error("No parameters calculated yet");
      return;
    }
    
    setIsLoading(true);
    try {
      handleExportDXF(type, calculatedParams);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Export PDF with wrapper to handle loading state
  const exportPDF = async (componentRef: React.RefObject<HTMLDivElement>, title: string) => {
    if (!calculatedParams) {
      toast.error("No parameters calculated yet");
      return;
    }
    
    setIsLoading(true);
    try {
      await handleExportPDF(componentRef, title, inputParams, calculatedParams);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-background py-12 px-4 sm:px-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Conveyor System Generator
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Enter basic parameters to generate technical drawings for conveyor, pulley, and idler components.
          </p>
        </motion.div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="input">Input Parameters</TabsTrigger>
            <TabsTrigger value="results" disabled={!calculatedParams}>Generated Drawings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="input">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>System Parameters</CardTitle>
                </CardHeader>
                <CardContent>
                  <InputForm 
                    inputParams={inputParams}
                    handleInputChange={handleInputChange}
                    handleUnitChange={handleUnitChange}
                    calculateParameters={handleCalculateParameters}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="results">
            {calculatedParams && (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {/* Calculations Summary Section */}
                <motion.div variants={itemVariants} className="bg-card border rounded-lg shadow overflow-hidden">
                  <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Calculated Parameters</h2>
                  </div>
                  
                  <div className="p-6">
                    <InputSummary inputParams={inputParams} />
                    
                    <CalculationDetails 
                      inputParams={inputParams}
                      calculatedParams={calculatedParams}
                    />
                  </div>
                </motion.div>
                
                {/* Conveyor Drawing */}
                <motion.div variants={itemVariants}>
                  <ConveyorDrawing 
                    conveyorRef={conveyorRef}
                    calculatedParams={calculatedParams}
                    inputParams={inputParams}
                    handleExportDXF={exportDXF}
                    handleExportPDF={exportPDF}
                  />
                </motion.div>
                
                {/* Pulley Drawing */}
                <motion.div variants={itemVariants}>
                  <PulleyDrawing 
                    pulleyRef={pulleyRef}
                    calculatedParams={calculatedParams}
                    handleExportDXF={exportDXF}
                    handleExportPDF={exportPDF}
                  />
                </motion.div>
                
                {/* Idler Drawing */}
                <motion.div variants={itemVariants}>
                  <IdlerDrawing 
                    idlerRef={idlerRef}
                    calculatedParams={calculatedParams}
                    handleExportDXF={exportDXF}
                    handleExportPDF={exportPDF}
                  />
                </motion.div>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Loading overlay */}
      <LoadingOverlay isLoading={isLoading} />
    </motion.div>
  );
};

export default UnifiedGenerator;
