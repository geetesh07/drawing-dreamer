
import React from "react";
import { motion } from "framer-motion";
import DeploymentGuide from "@/components/DeploymentGuide";

const Deployment = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5
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
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Deployment Guide
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            How to deploy your Conveyor Design application to a cPanel hosting environment.
          </p>
        </div>
        
        <DeploymentGuide />
      </div>
    </motion.div>
  );
};

export default Deployment;
