import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { getRetailerOrders, getActiveGroupOrders } from '@/lib/firestore';
import { 
  Store, Users, ShoppingCart, History, LogOut, Package, Clock
} from 'lucide-react';

const RetailerDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout, userData } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ orders: 0, groupOrders: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      if (user) {
        const [ordersData, groupOrdersData] = await Promise.all([
          getRetailerOrders(user.uid),
          getActiveGroupOrders(),
        ]);
        setStats({
          orders: ordersData.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
          groupOrders: groupOrdersData.length,
        });
      }
    };
    fetchStats();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const dashboardCards = [
    { title: t('browseSuppliers'), description: 'Find suppliers for your raw materials', icon: Store, color: 'bg-gradient-primary', href: '/suppliers' },
    { title: t('groupOrders'), description: 'Join or create bulk buying groups', icon: Users, color: 'bg-gradient-primary', href: '/group-orders' },
    { title: t('directOrders'), description: 'Place orders from your cart', icon: ShoppingCart, color: 'bg-gradient-accent', href: '/cart' },
    { title: t('orderHistory'), description: 'View your past orders and receipts', icon: History, color: 'bg-gradient-primary', href: '/orders' },
  ];

  const quickStats = [
    { label: t('currentOrders'), value: stats.orders, icon: Package, color: 'text-primary' },
    { label: t('activeGroupOrders'), value: stats.groupOrders, icon: Users, color: 'text-accent' },
    { label: t('items_in_cart'), value: cartCount, icon: ShoppingCart, color: 'text-primary-glow' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-primary text-primary-foreground py-6 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
            <p className="text-primary-foreground/80">{t('welcome')}, {userData?.email?.split('@')[0]}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="bg-white/10 border-white/20 hover:bg-white/20">
            <LogOut className="w-4 h-4 mr-2" />
            {t('logout')}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-card/90">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card) => (
            <Card key={card.href} onClick={() => navigate(card.href)} className="group hover:shadow-lg cursor-pointer">
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">{t('view')} →</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RetailerDashboard;