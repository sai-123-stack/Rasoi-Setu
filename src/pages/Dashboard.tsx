import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RetailerDashboard from '@/components/dashboard/RetailerDashboard';
import SupplierDashboard from '@/components/dashboard/SupplierDashboard';
import LanguageToggle from '@/components/LanguageToggle';
import { Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="relative">
      <LanguageToggle />
      {userData.role === 'retailer' ? (
        <RetailerDashboard />
      ) : (
        <SupplierDashboard />
      )}
    </div>
  );
};

export default Dashboard;