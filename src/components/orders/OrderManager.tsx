import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Package, FileText, Download } from 'lucide-react';
import { 
  getRetailerOrders,
  getSupplierOrders,
  updateOrderStatus,
  Order 
} from '@/lib/firestore';
import jsPDF from 'jspdf';

const OrderManager: React.FC = () => {
  const { user, userData } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && userData) {
      loadOrders();
    }
  }, [user, userData]);

  const loadOrders = async () => {
    try {
      if (user && userData) {
        const ordersData = userData.role === 'retailer' 
          ? await getRetailerOrders(user.uid)
          : await getSupplierOrders(user.uid);
        setOrders(ordersData);
      }
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_to_load_orders'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status);
      toast({
        title: t('success'),
        description: t('order_status_updated')
      });
      loadOrders();
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_to_update_status'),
        variant: 'destructive'
      });
    }
  };

  const generatePDF = (order: Order) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Rasoi Setu', 20, 20);
    doc.setFontSize(16);
    doc.text('Order Invoice', 20, 35);
    
    // Order Info
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.id}`, 20, 50);
    doc.text(`Date: ${order.createdAt.toLocaleDateString()}`, 20, 60);
    doc.text(`Status: ${order.status.toUpperCase()}`, 20, 70);
    
    // Items
    doc.text('Items:', 20, 90);
    let yPosition = 100;
    
    order.items.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name}`, 20, yPosition);
      doc.text(`Qty: ${item.quantity} ${item.unit}`, 100, yPosition);
      doc.text(`Price: ₹${item.price}`, 140, yPosition);
      doc.text(`Total: ₹${(item.quantity * item.price).toFixed(2)}`, 170, yPosition);
      yPosition += 10;
    });
    
    // Total
    doc.text(`Total Amount: ₹${order.totalAmount.toFixed(2)}`, 20, yPosition + 20);
    
    // Save
    doc.save(`order-${order.id}.pdf`);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'rejected': return 'bg-red-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'completed': return <Package className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filterOrdersByStatus = (status: string) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Package className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{t('loading_orders')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('orders')}</h2>
        <p className="text-muted-foreground">
          {userData?.role === 'retailer' ? t('your_order_history') : t('manage_incoming_orders')}
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">{t('all_orders')} ({orders.length})</TabsTrigger>
          <TabsTrigger value="pending">
            {t('pending')} ({filterOrdersByStatus('pending').length})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            {t('confirmed')} ({filterOrdersByStatus('confirmed').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            {t('completed')} ({filterOrdersByStatus('completed').length})
          </TabsTrigger>
          {userData?.role === 'supplier' && (
            <TabsTrigger value="rejected">
              {t('rejected')} ({filterOrdersByStatus('rejected').length})
            </TabsTrigger>
          )}
        </TabsList>

        {['all', 'pending', 'confirmed', 'completed', 'rejected'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {filterOrdersByStatus(status).length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">{t('no_orders_found')}</h3>
                  <p className="text-muted-foreground">
                    {status === 'all' ? t('no_orders_yet') : t(`no_${status}_orders`)}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterOrdersByStatus(status).map((order) => (
                  <Card key={order.id} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {t('order')} #{order.id?.slice(-8)}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {order.createdAt.toLocaleDateString()} • {order.createdAt.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(order.status)} text-white gap-1`}>
                            {getStatusIcon(order.status)}
                            {t(order.status)}
                          </Badge>
                          {order.isGroupOrder && (
                            <Badge variant="outline">{t('group_order')}</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">{t('items')} ({order.items.length})</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span>{item.name}</span>
                              <div className="text-right">
                                <div>{item.quantity} {t(item.unit)} × ₹{item.price}</div>
                                <div className="font-medium">₹{(item.quantity * item.price).toFixed(2)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between font-bold text-lg">
                          <span>{t('total_amount')}</span>
                          <span className="text-primary">₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        {userData?.role === 'supplier' && order.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => handleStatusUpdate(order.id!, 'confirmed')}
                              className="gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {t('confirm_order')}
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleStatusUpdate(order.id!, 'rejected')}
                              className="gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              {t('reject_order')}
                            </Button>
                          </>
                        )}
                        
                        {userData?.role === 'supplier' && order.status === 'confirmed' && (
                          <Button
                            onClick={() => handleStatusUpdate(order.id!, 'completed')}
                            className="gap-2"
                          >
                            <Package className="w-4 h-4" />
                            {t('mark_completed')}
                          </Button>
                        )}
                        
                        {(order.status === 'completed' || userData?.role === 'retailer') && (
                          <Button
                            variant="outline"
                            onClick={() => generatePDF(order)}
                            className="gap-2"
                          >
                            <Download className="w-4 h-4" />
                            {t('download_invoice')}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default OrderManager;