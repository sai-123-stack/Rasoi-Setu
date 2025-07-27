import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createGroupOrder } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface FormData {
  itemName: string;
  targetQty: number;
  pricePerUnit: number;
  deadline: string;
  deliveryArea: string;
  initialQuantity: number;
}

const CreateGroupOrderForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const defaultDeadline = new Date();
  defaultDeadline.setDate(defaultDeadline.getDate() + 3);
  const defaultDeadlineString = defaultDeadline.toISOString().slice(0, 16);

  // In src/components/groups/CreateGroupOrderForm.tsx

const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!user) return;

    // --- Basic validation ---
    if (Number(data.initialQuantity) > Number(data.targetQty)) {
        toast({ title: t('error'), description: t('initial_qty_error'), variant: 'destructive' });
        return;
    }

    setLoading(true);
    try {
      // Create a JavaScript Date object from the form's string input
      const deadlineDate = new Date(data.deadline);
      
      const groupOrderData = {
        itemName: data.itemName,
        targetQty: Number(data.targetQty),
        pricePerUnit: Number(data.pricePerUnit),
        deadline: deadlineDate, // Pass the JS Date object directly
        deliveryArea: data.deliveryArea,
        createdBy: user.uid,
      };
      
      await createGroupOrder(groupOrderData, Number(data.initialQuantity));

      toast({ title: t('success'), description: t('group_order_created_successfully') });
      navigate('/group-orders');

    } catch (error) {
      console.error("Failed to create group order:", error);
      toast({ 
          title: t('error'), 
          description: (error as Error).message || t('failed_to_create_group_order'), 
          variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
};
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('create_new_group_order')}</CardTitle>
          <CardDescription>{t('fill_form_to_start_group_buy')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="itemName">{t('item_name')}</Label>
              <Input id="itemName" {...register('itemName', { required: true })} placeholder={t('e_g_onions')} />
              {errors.itemName && <p className="text-destructive text-sm mt-1">{t('field_required')}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetQty">{t('target_quantity')}</Label>
                <Input id="targetQty" type="number" {...register('targetQty', { required: true, min: 1 })} placeholder="100" />
                {errors.targetQty && <p className="text-destructive text-sm mt-1">{t('field_required')}</p>}
              </div>
              <div>
                <Label htmlFor="pricePerUnit">{t('proposed_price_per_unit')}</Label>
                <Input id="pricePerUnit" type="number" step="0.01" {...register('pricePerUnit', { required: true, min: 0 })} placeholder="12.50" />
                {errors.pricePerUnit && <p className="text-destructive text-sm mt-1">{t('field_required')}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="deadline">{t('deadline')}</Label>
              <Input id="deadline" type="datetime-local" defaultValue={defaultDeadlineString} {...register('deadline', { required: true })} />
              {errors.deadline && <p className="text-destructive text-sm mt-1">{t('field_required')}</p>}
            </div>
            <div>
              <Label htmlFor="deliveryArea">{t('delivery_area')}</Label>
              <Input id="deliveryArea" {...register('deliveryArea', { required: true })} placeholder={t('e_g_pune')} />
              {errors.deliveryArea && <p className="text-destructive text-sm mt-1">{t('field_required')}</p>}
            </div>
            <div>
              <Label htmlFor="initialQuantity">{t('your_quantity')}</Label>
              <Input id="initialQuantity" type="number" {...register('initialQuantity', { required: true, min: 1 })} placeholder="10" />
              {errors.initialQuantity && <p className="text-destructive text-sm mt-1">{t('field_required')}</p>}
            </div>
            <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {loading ? t('creating') : t('createGroupOrder')}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/group-orders')} className="w-full">
                    {t('cancel')}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateGroupOrderForm;