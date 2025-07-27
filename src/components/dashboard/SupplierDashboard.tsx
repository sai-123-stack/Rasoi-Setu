import { Users } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getSupplierInventory, getSupplierOrders, Order } from '@/lib/firestore';
import {
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  Clock,
  CheckCircle,
} from 'lucide-react';

const SupplierDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout, userData } = useAuth();
  const navigate = useNavigate();
  const [inventoryCount, setInventoryCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const inventoryItems = await getSupplierInventory(user.uid);
        setInventoryCount(inventoryItems.length);

        const supplierOrders = await getSupplierOrders(user.uid);
        setRecentOrders(supplierOrders.slice(0, 3));
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const getPendingOrdersCount = () => {
    return recentOrders.filter(order => order.status === 'pending').length;
  };

  const getCompletedTodayCount = () => {
    const today = new Date().toDateString();
    return recentOrders.filter(order =>
      order.status === 'completed' && new Date(order.updatedAt).toDateString() === today
    ).length;
  };

  const dashboardCards = [
    {
      title: t('manageInventory'),
      description: 'Add, edit, and manage your inventory items',
      icon: Package,
      color: 'bg-gradient-primary',
      href: '/inventory',
    },
    {
      title: t('group_orders'),
      description: 'Review and accept group buy orders',
      icon: Users,
      color: 'bg-gradient-primary',
      href: '/supplier/group-orders', // Add the link here
    },
    {
      title: t('directOrders'),
      description: 'View and manage incoming direct orders',
      icon: ShoppingBag,
      color: 'bg-gradient-accent',
      href: '/orders',
    },
    {
      title: t('profile'),
      description: 'Update your store information',
      icon: Settings,
      color: 'bg-gradient-accent',
      href: '/profile', // You'll need to create this page next
    },
  ];

  const quickStats = [
    {
      label: t('totalItems'),
      value: inventoryCount,
      icon: Package,
      color: 'text-primary',
    },
    {
      label: t('pendingOrders'),
      value: getPendingOrdersCount(),
      icon: Clock,
      color: 'text-accent',
    },
    {
      label: t('completedToday'),
      value: getCompletedTodayCount(),
      icon: CheckCircle,
      color: 'text-primary-glow',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-accent text-accent-foreground py-6 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
            <p className="text-accent-foreground/80">
              {t('welcome')}, {userData?.email?.split('@')[0]}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="bg-white/10 border-white/20 text-accent-foreground hover:bg-white/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('logout')}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-card/90 backdrop-blur-sm border-0 shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Adjusted grid columns */}
          {dashboardCards.map((card, index) => (
            <Card
              key={index}
              className="group hover:shadow-elegant transition-all duration-300 bg-card/90 backdrop-blur-sm border-0 cursor-pointer"
              onClick={() => navigate(card.href)}
            >
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full group-hover:border-accent transition-all duration-300">
                  {t('view')} →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders */}
        <Card className="bg-card/90 backdrop-blur-sm border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-accent" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">Order #{order.id?.slice(-6)}</p>
                      <p className="text-sm text-muted-foreground">{order.items.map(i => i.name).join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {t(order.status)}
                    </span>
                    <p className="text-sm font-medium">₹{order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupplierDashboard;