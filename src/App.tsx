import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";

// Page Imports
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import InventoryManager from "./components/inventory/InventoryManager";
import OrderManager from "./components/orders/OrderManager";
import GroupOrderManager from "./components/groups/GroupOrderManager";
import SupplierProfile from "./components/suppliers/SupplierProfile";
import SupplierBrowser from "./components/suppliers/SupplierBrowser";
import CartPage from "./pages/CartPage";
import ComparePricesPage from "./pages/ComparePricesPage"; // Import placeholder

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inventory" element={<InventoryManager />} />
                <Route path="/orders" element={<OrderManager />} />
                <Route path="/group-orders" element={<GroupOrderManager />} />
                <Route path="/profile" element={<SupplierProfile />} />
                <Route path="/suppliers" element={<SupplierBrowser />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/compare" element={<ComparePricesPage />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;