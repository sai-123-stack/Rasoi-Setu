import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { createOrder } from '@/lib/firestore';
import { useNavigate } from 'react-router-dom';

const CartPage: React.FC = () => {
  const { cart, updateCartQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (!user || cart.length === 0) return;

    // Note: This logic places one order with the supplier of the first item in the cart.
    // A full multi-supplier checkout would be more complex.
    const firstItemSupplierId = cart[0].supplierId;
    
    try {
      await createOrder({
        retailerId: user.uid,
        supplierId: firstItemSupplierId, 
        items: cart.map(item => ({
          itemId: item.id!,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          unit: item.unit,
        })),
        totalAmount: getCartTotal(),
        status: 'pending',
        isGroupOrder: false,
      });
      toast({ title: t('success'), description: t('order_placed_successfully') });
      clearCart();
      navigate('/orders');
    } catch (error) {
      toast({ title: t('error'), description: t('failed_to_place_order'), variant: 'destructive' });
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('back')}
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShoppingCart /> {t('your_cart')}</CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t('cart_is_empty')}</p>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)} / {t(item.unit)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={item.quantity} onChange={(e) => updateCartQuantity(item.id!, parseInt(e.target.value) || 0)} className="w-16 h-8 text-center" />
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id!)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {cart.length > 0 && (
          <CardFooter className="flex flex-col items-stretch space-y-4 pt-6">
            <div className="flex justify-between font-bold text-lg">
              <span>{t('total')}</span>
              <span>₹{getCartTotal().toFixed(2)}</span>
            </div>
            <Button onClick={handlePlaceOrder}>{t('place_order')}</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};
export default CartPage;