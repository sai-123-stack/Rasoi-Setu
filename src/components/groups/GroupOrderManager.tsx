import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Plus, Users, Clock, Target, TrendingDown } from 'lucide-react';
import { 
  createGroupOrder,
  joinGroupOrder,
  getActiveGroupOrders,
  GroupOrder 
} from '@/lib/firestore';

const CATEGORIES = [
  'vegetables',
  'spices',
  'grains',
  'dairy',
  'oil',
  'snacks',
  'beverages',
  'packaging',
  'other'
];

const UNITS = ['kg', 'grams', 'litre', 'ml', 'pieces', 'dozen', 'packet'];

interface GroupOrderFormData {
  itemName: string;
  category: string;
  targetPrice: string;
  unit: string;
  minVendors: string;
  deadline: string;
}

const GroupOrderManager: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<GroupOrderFormData>({
    itemName: '',
    category: '',
    targetPrice: '',
    unit: '',
    minVendors: '',
    deadline: ''
  });

  useEffect(() => {
    loadGroupOrders();
    const interval = setInterval(loadGroupOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadGroupOrders = async () => {
    try {
      const orders = await getActiveGroupOrders();
      setGroupOrders(orders);
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_to_load_group_orders'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      category: '',
      targetPrice: '',
      unit: '',
      minVendors: '',
      deadline: ''
    });
  };

  const handleCreateGroupOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.itemName || !formData.category || !formData.targetPrice || 
        !formData.unit || !formData.minVendors || !formData.deadline) {
      toast({
        title: t('error'),
        description: t('please_fill_required_fields'),
        variant: 'destructive'
      });
      return;
    }

    try {
      const groupOrderData = {
        createdBy: user.uid,
        itemName: formData.itemName,
        category: formData.category,
        targetPrice: parseFloat(formData.targetPrice),
        unit: formData.unit,
        minVendors: parseInt(formData.minVendors),
        joinedVendors: [{
          userId: user.uid,
          quantity: 1,
          joinedAt: new Date()
        }],
        deadline: new Date(formData.deadline),
        status: 'active' as const
      };

      await createGroupOrder(groupOrderData);
      toast({
        title: t('success'),
        description: t('group_order_created_successfully')
      });

      setDialogOpen(false);
      resetForm();
      loadGroupOrders();
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_to_create_group_order'),
        variant: 'destructive'
      });
    }
  };

  const handleJoinGroupOrder = async (groupOrderId: string, quantity: number = 1) => {
    if (!user) return;

    try {
      await joinGroupOrder(groupOrderId, user.uid, quantity);
      toast({
        title: t('success'),
        description: t('joined_group_order_successfully')
      });
      loadGroupOrders();
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_to_join_group_order'),
        variant: 'destructive'
      });
    }
  };

  const getTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const timeLeft = deadline.getTime() - now.getTime();
    
    if (timeLeft <= 0) {
      return t('expired');
    }
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getProgressPercentage = (joinedVendors: number, minVendors: number) => {
    return Math.min((joinedVendors / minVendors) * 100, 100);
  };

  const isUserJoined = (groupOrder: GroupOrder) => {
    return user && groupOrder.joinedVendors.some(vendor => vendor.userId === user.uid);
  };

  const getTotalQuantity = (groupOrder: GroupOrder) => {
    return groupOrder.joinedVendors.reduce((total, vendor) => total + vendor.quantity, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Users className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{t('loading_group_orders')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('group_orders')}</h2>
          <p className="text-muted-foreground">{t('join_create_bulk_orders')}</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="w-4 h-4" />
              {t('create_group_order')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('create_new_group_order')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateGroupOrder} className="space-y-4">
              <div>
                <Label htmlFor="itemName">{t('item_name')} *</Label>
                <Input
                  id="itemName"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  placeholder={t('enter_item_name')}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">{t('category')} *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_category')} />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {t(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetPrice">{t('target_price')} *</Label>
                  <Input
                    id="targetPrice"
                    type="number"
                    step="0.01"
                    value={formData.targetPrice}
                    onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit">{t('unit')} *</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('select_unit')} />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {t(unit)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="minVendors">{t('minimum_vendors')} *</Label>
                <Input
                  id="minVendors"
                  type="number"
                  min="2"
                  value={formData.minVendors}
                  onChange={(e) => setFormData({ ...formData, minVendors: e.target.value })}
                  placeholder="2"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="deadline">{t('deadline')} *</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {t('create_group_order')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                >
                  {t('cancel')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {groupOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{t('no_active_group_orders')}</h3>
            <p className="text-muted-foreground mb-4">{t('create_first_group_order')}</p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              {t('create_group_order')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groupOrders.map((groupOrder) => {
            const progress = getProgressPercentage(groupOrder.joinedVendors.length, groupOrder.minVendors);
            const timeLeft = getTimeRemaining(groupOrder.deadline);
            const totalQuantity = getTotalQuantity(groupOrder);
            const userJoined = isUserJoined(groupOrder);
            
            return (
              <Card key={groupOrder.id} className={`relative ${progress >= 100 ? 'border-green-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{groupOrder.itemName}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {t(groupOrder.category)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">₹{groupOrder.targetPrice}</div>
                      <div className="text-xs text-muted-foreground">/{t(groupOrder.unit)}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {t('vendors_joined')}
                      </span>
                      <span className="font-medium">
                        {groupOrder.joinedVendors.length}/{groupOrder.minVendors}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{totalQuantity} {t(groupOrder.unit)}</div>
                        <div className="text-muted-foreground">{t('total_quantity')}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <div>
                        <div className={`font-medium ${timeLeft === t('expired') ? 'text-red-600' : ''}`}>
                          {timeLeft}
                        </div>
                        <div className="text-muted-foreground">{t('time_left')}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('potential_savings')}</span>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingDown className="w-3 h-3" />
                      <span className="font-medium">15-25%</span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    {userJoined ? (
                      <div className="text-center">
                        <Badge className="bg-green-500 text-white mb-2">
                          {t('already_joined')}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {progress >= 100 ? t('group_order_ready') : t('waiting_for_more_vendors')}
                        </p>
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleJoinGroupOrder(groupOrder.id!)}
                        disabled={timeLeft === t('expired')}
                      >
                        {timeLeft === t('expired') ? t('expired') : t('join_group_order')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroupOrderManager;