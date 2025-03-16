
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Ruler, Circle, BriefcaseConveyorBelt } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2
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

  const featureCardVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)" }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <motion.section 
        className="py-20 px-4 sm:px-6 text-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
            Generate Technical Drawings in One Click
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Why waste time creating designs manually? Our automated tools help you generate 
            precise technical drawings for conveyor belts, pulleys, and idlers instantly.
          </p>
          <motion.div 
            className="flex flex-wrap justify-center gap-4"
            variants={itemVariants}
          >
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/conveyor">Get Started <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
              <Link to="#features">Learn More</Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
              Design Tools for Industrial Components
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our suite of specialized tools helps you create production-ready technical drawings 
              for various industrial components.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Conveyor Belt Card */}
            <motion.div 
              className="bg-card rounded-xl shadow-sm overflow-hidden border border-border"
              initial="initial"
              whileHover="hover"
              variants={featureCardVariants}
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BriefcaseConveyorBelt className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Conveyor Belt Design</h3>
                <p className="text-muted-foreground mb-6">
                  Generate precise technical drawings for conveyor belt structures with accurate dimensions and multiple views.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/conveyor">Design Now</Link>
                </Button>
              </div>
            </motion.div>

            {/* Pulley Card */}
            <motion.div 
              className="bg-card rounded-xl shadow-sm overflow-hidden border border-border"
              initial="initial"
              whileHover="hover"
              variants={featureCardVariants}
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Circle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Pulley Design</h3>
                <p className="text-muted-foreground mb-6">
                  Create detailed technical drawings for pulleys with custom diameters and specifications.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/pulley">Design Now</Link>
                </Button>
              </div>
            </motion.div>

            {/* Idler Card */}
            <motion.div 
              className="bg-card rounded-xl shadow-sm overflow-hidden border border-border"
              initial="initial"
              whileHover="hover"
              variants={featureCardVariants}
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Ruler className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Idler Design</h3>
                <p className="text-muted-foreground mb-6">
                  Design idlers with precise measurements and export production-ready technical drawings.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/idler">Design Now</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <motion.section 
        className="py-16 px-4 sm:px-6"
        initial="hidden"
        whileInView="visible"
        variants={containerVariants}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
              Why Choose Our Design Tools?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Save time and reduce errors with our automated drawing generation system.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Time Saving",
                description: "Generate technical drawings in seconds instead of hours of manual work."
              },
              {
                title: "Accuracy",
                description: "Eliminate human errors with precise calculations and standardized drawings."
              },
              {
                title: "Easy Export",
                description: "Export your designs as DXF or PDF files for manufacturing or documentation."
              },
              {
                title: "Multiple Views",
                description: "Automatically generate different views of your components from a single input."
              },
              {
                title: "Customizable",
                description: "Adjust all dimensions and parameters to match your specific requirements."
              },
              {
                title: "Future Automation",
                description: "Coming soon: Advanced parameter calculations based on your requirements."
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="bg-card border border-border rounded-lg p-6"
              >
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-6">
            Ready to Streamline Your Design Process?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Try our drawing generation tools today and see how much time you can save.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/conveyor">Get Started <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
