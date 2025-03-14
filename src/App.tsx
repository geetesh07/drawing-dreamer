
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Index from "./pages/Index";
import PulleyDesign from "./pages/PulleyDesign";
import IdlerDesign from "./pages/IdlerDesign";
import NotFound from "./pages/NotFound";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { BriefcaseConveyorBelt, Circle, Home as HomeIcon, Ruler } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-background">
            <div className="container mx-auto py-4">
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
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </header>
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/conveyor" element={<Index />} />
              <Route path="/pulley" element={<PulleyDesign />} />
              <Route path="/idler" element={<IdlerDesign />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
