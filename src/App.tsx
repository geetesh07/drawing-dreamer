import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Index from "./pages/Index";
import PulleyDesign from "./pages/PulleyDesign";
import IdlerDesign from "./pages/IdlerDesign";
import Deployment from "./pages/Deployment";
import NotFound from "./pages/NotFound";
import UnifiedGenerator from "./pages/UnifiedGenerator"; // Import the new component
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { BriefcaseConveyorBelt, Circle, Monitor, Home as HomeIcon, Ruler, Moon, Sun, Server, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./hooks/useTheme";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  const { theme, setTheme } = useTheme();
  
  useEffect(() => {
    // Apply theme class to document root
    document.documentElement.classList.toggle('dark', theme === 'dark');
    
    // Also set a data attribute for additional CSS targeting
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply specific text color classes based on theme
    if (theme === 'dark') {
      document.documentElement.classList.add('text-white');
      document.documentElement.classList.remove('text-black');
    } else {
      document.documentElement.classList.add('text-black');
      document.documentElement.classList.remove('text-white');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
            <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
              <div className="container mx-auto py-4 flex justify-between items-center">
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <Link to="/" className={navigationMenuTriggerStyle()}>
                        <HomeIcon className="mr-2 h-4 w-4" />
                        Home
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link to="/conveyor" className={navigationMenuTriggerStyle()}>
                        <BriefcaseConveyorBelt className="mr-2 h-4 w-4" />
                        Conveyor Belt
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link to="/pulley" className={navigationMenuTriggerStyle()}>
                        <Circle className="mr-2 h-4 w-4" />
                        Pulley
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link to="/idler" className={navigationMenuTriggerStyle()}>
                        <Ruler className="mr-2 h-4 w-4" />
                        Idler
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link to="/generator" className={navigationMenuTriggerStyle()}>
                        <Cog className="mr-2 h-4 w-4" />
                        All-in-One
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link to="/deployment" className={navigationMenuTriggerStyle()}>
                        <Server className="mr-2 h-4 w-4" />
                        Deployment
                      </Link>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleTheme} 
                  className="rounded-full hover:bg-secondary"
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span className="sr-only">
                    {theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                  </span>
                </Button>
              </div>
            </header>
            
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/conveyor" element={<Index />} />
                <Route path="/pulley" element={<PulleyDesign />} />
                <Route path="/idler" element={<IdlerDesign />} />
                <Route path="/generator" element={<UnifiedGenerator />} />
                <Route path="/deployment" element={<Deployment />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;