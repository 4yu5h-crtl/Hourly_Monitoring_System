import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Link, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DataEntryPage from "./pages/DataEntry";
import HistoryPage from "./pages/History";
import NotFound from "./pages/NotFound";
import { cn } from "./lib/utils";
import { ClipboardList, History } from "lucide-react";
import skfLogo from "@/assets/skf-logo.png";

const queryClient = new QueryClient();

function NavBar() {
  const location = useLocation();
  const links = [
    { to: "/", label: "Data Entry", icon: ClipboardList },
    { to: "/history", label: "History", icon: History },
  ];

  return (
    <nav className="bg-card border-b border-border px-4">
      <div className="max-w-[1600px] mx-auto flex items-center h-12 gap-4">
        <img src={skfLogo} alt="SKF" className="h-7 object-contain" />
        <div className="w-px h-6 bg-border" />
        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                location.pathname === l.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <l.icon className="w-4 h-4" />
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<DataEntryPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
