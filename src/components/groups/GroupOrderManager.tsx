import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Plus, Users, Clock, Trash2, ArrowRight } from 'lucide-react';
import { getActiveGroupOrders, deleteGroupOrder, GroupOrder } from '@/lib/firestore';

const GroupOrderManager: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroupOrders();
  }, []);

  const loadGroupOrders = async () => {
    setLoading(true);
    try {
      const orders = await getActiveGroupOrders();
      setGroupOrders(orders);
    } catch (error) {
      toast({ title: t('error'), description: t('failed_to_load_group_orders'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId: string, createdBy: string) => {
    if (user?.uid !== createdBy) {
      toast({ title: t('error'), description: "You can only delete orders you created.", variant: 'destructive' });
      return;
    }
    if (window.confirm(t('confirm_delete_group_order'))) {
      try {
        await deleteGroupOrder(orderId);
        toast({ title: t('success'), description: t('group_order_deleted') });
        loadGroupOrders(); // Refresh the list after deleting
      } catch (error) {
        toast({ title: t('error'), description: t('failed_to_delete_order'), variant: 'destructive' });
      }
    }
  };

  const getTimeLeft = (deadline: any) => {
    // deadline might be a Timestamp object, convert it
    const deadlineDate = deadline.toDate ? deadline.toDate() : new Date(deadline);
    const diff = deadlineDate.getTime() - new Date().getTime();
    if (diff < 0) return t('expired');
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} ${t('days_left')}`;
  };

  if (loading) {
    return <div className="p-8 text-center"><Users className="w-12 h-12 mx-auto animate-pulse" /><p>{t('loading_group_orders')}</p></div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('group_orders')}</h2>
          <p className="text-muted-foreground">{t('join_create_bulk_orders')}</p>
        </div>
        <Button onClick={() => navigate('/group-orders/new')}>
          <Plus className="mr-2 h-4 w-4" /> {t('create_new_group_order')}
        </Button>
      </div>

      {groupOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">{t('no_active_group_orders')}</h3>
            <p className="text-muted-foreground mb-4">{t('create_first_group_order')}</p>
            <Button onClick={() => navigate('/group-orders/new')}>
              {t('create_one_now')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groupOrders.map(order => (
            <Card key={order.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{order.itemName}</CardTitle>
                  {user?.uid === order.createdBy && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(order.id!, order.createdBy)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <CardDescription>Target: {order.targetQty} units</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{Math.round((order.currentQty / order.targetQty) * 100)}%</span>
                  </div>
                  <Progress value={(order.currentQty / order.targetQty) * 100} />
                  <div className="text-xs text-muted-foreground mt-1">{order.currentQty} / {order.targetQty} units filled</div>
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-between">
                  <span><Clock className="inline h-4 w-4 mr-1" />{getTimeLeft(order.deadline)}</span>
                  <span className="font-bold text-primary">₹{order.pricePerUnit}/unit</span>
                </div>
              </CardContent>
              <div className="p-4 pt-0">
                <Button className="w-full" onClick={() => navigate(`/group-orders/${order.id}`)}>
                  {t('view_details')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupOrderManager;