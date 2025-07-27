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
import SupplierProfile from "./components/suppliers/SupplierProfile";
import SupplierBrowser from "./components/suppliers/SupplierBrowser";
import CartPage from "./pages/CartPage";
import ComparePricesPage from "./pages/ComparePricesPage";

// Group Order Imports
import GroupOrderManager from "./components/groups/GroupOrderManager";
import CreateGroupOrderForm from "./components/groups/CreateGroupOrderForm";
import GroupOrderDetailsPage from "./pages/GroupOrderDetailsPage";
import SupplierGroupOrderManager from "./components/groups/SupplierGroupOrderManager";
import SupplierGroupOrderDetailsPage from "./pages/SupplierGroupOrderDetailsPage";


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
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                
                {/* Shared Authenticated Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/orders" element={<OrderManager />} />
                <Route path="/profile" element={<SupplierProfile />} />

                {/* Retailer Routes */}
                <Route path="/suppliers" element={<SupplierBrowser />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/compare" element={<ComparePricesPage />} />
                <Route path="/group-orders" element={<GroupOrderManager />} />
                <Route path="/group-orders/new" element={<CreateGroupOrderForm />} />
                <Route path="/group-orders/:id" element={<GroupOrderDetailsPage />} />
                
                {/* Supplier Routes */}
                <Route path="/inventory" element={<InventoryManager />} />
                <Route path="/supplier/group-orders" element={<SupplierGroupOrderManager />} />
                <Route path="/supplier/group-orders/:id" element={<SupplierGroupOrderDetailsPage />} />

                {/* Catch-all Not Found Route */}
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