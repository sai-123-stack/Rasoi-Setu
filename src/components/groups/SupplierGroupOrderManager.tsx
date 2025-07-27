import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getReviewableGroupOrders, GroupOrder } from '@/lib/firestore';
import { Loader2, Users, ArrowRight } from 'lucide-react';

const SupplierGroupOrderManager: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<GroupOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getReviewableGroupOrders()
        .then(setOrders)
        .catch(() => toast({ title: t('error'), description: t('failed_to_load_group_orders'), variant: 'destructive' }))
        .finally(() => setLoading(false));
    }
  }, [user, t, toast]);

  if (loading) {
    return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('incoming_group_orders')}</h2>
          <p className="text-muted-foreground">{t('review_and_accept_orders')}</p>
        </div>
      </div>
      
      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{t('no_orders_to_review')}</h3>
            <p className="text-muted-foreground">{t('check_back_later_for_group_orders')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orders.map(order => (
            <Card key={order.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{order.itemName}</CardTitle>
                <CardDescription>Target: {order.targetQty} units</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <p><strong>{t('status')}:</strong> <span className="font-semibold text-primary">{t(order.status)}</span></p>
                <p><strong>{t('current_quantity')}:</strong> {order.currentQty} / {order.targetQty}</p>
                 <p><strong>{t('proposed_price')}:</strong> ₹{order.pricePerUnit}/unit</p>
              </CardContent>
              <div className="p-4 pt-0 mt-auto">
                <Button className="w-full" onClick={() => navigate(`/supplier/group-orders/${order.id}`)}>
                  {t('review_order')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplierGroupOrderManager;