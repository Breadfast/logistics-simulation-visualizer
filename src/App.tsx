import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Index from "./pages/Index";
import Datasets from "./pages/Datasets";
import DriverImportForm from "@/components/DriverImportForm";
import NotFound from "./pages/NotFound";
import SimulationRunner from "./pages/SimulationRunner";
import DatasetDrivers from "./pages/Drivers";

const queryClient = new QueryClient();

function DriverUploadScreen() {
  const { id } = useParams();
  const datasetId = Number(id);
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
      <DriverImportForm datasetId={datasetId} />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/datasets" element={<Datasets />} />
          {/* <Route path="/drivers" element={<Drivers />} /> */}
          <Route path="/datasets/:id/upload-drivers" element={<DriverUploadScreen />} />
          <Route path="/datasets/:id/drivers" element={<DatasetDrivers />} />
          <Route path="/simulation" element={<SimulationRunner />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
