import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { onGroupOrderUpdate, joinGroupOrder, GroupOrder, GroupParticipant } from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users } from 'lucide-react';

const GroupOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<GroupOrder | null>(null);
  const [participants, setParticipants] = useState<GroupParticipant[]>([]);
  const [joinQuantity, setJoinQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onGroupOrderUpdate(id, ({ order, participants }) => {
      setOrder(order);
      setParticipants(participants);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  const handleJoin = async () => {
    if (!user || !id || joinQuantity <= 0) return;
    setJoining(true);
    try {
      await joinGroupOrder(id, user.uid, joinQuantity);
      toast({ title: t('success'), description: t('joined_group_order_successfully') });
      navigate('/group-orders');
    } catch (error) {
      toast({ title: t('error'), description: (error as Error).message, variant: 'destructive' });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }
  if (!order) {
    return <div className="p-8 text-center"><p>{t('order_not_found')}</p></div>;
  }

  const userHasJoined = participants.some(p => p.userId === user?.uid);
  const deadlineDate = (order.deadline as any).toDate ? (order.deadline as any).toDate() : new Date();

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
        <Button variant="outline" onClick={() => navigate(-1)}>&larr; {t('back_to_group_orders')}</Button>
        <Card>
            <CardHeader>
            <CardTitle className="text-2xl">{order.itemName}</CardTitle>
            <CardDescription>{t('delivery_area')}: {order.deliveryArea}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>{t('progress')}</span>
                        <span>{Math.round((order.currentQty / order.targetQty) * 100)}%</span>
                    </div>
                    <Progress value={(order.currentQty / order.targetQty) * 100} />
                    <div className="text-xs text-muted-foreground mt-1">{order.currentQty} / {order.targetQty} {t('units_filled')}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><strong>{t('proposed_price')}:</strong> ₹{order.pricePerUnit} / unit</div>
                    <div><strong>{t('deadline')}:</strong> {deadlineDate.toLocaleString()}</div>
                </div>
                {!userHasJoined && order.status === 'active' && (
                    <div className="pt-4 border-t">
                        {/* <Label htmlFor="joinQuantity">{t('your_quantity')}</Label> */}
                        <div className="mt-2 flex gap-2">
                            <Input type="number" id="joinQuantity" value={joinQuantity} onChange={e => setJoinQuantity(Number(e.target.value))} min={1} />
                            <Button onClick={handleJoin} disabled={joining}>
                                {joining && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {t('joinGroupOrder')}
                            </Button>
                        </div>
                    </div>
                )}
                {userHasJoined && <p className="text-green-600 font-semibold text-center">{t('you_have_joined_this_order')}</p>}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users /> {t('participants')}</CardTitle>
            </CardHeader>
            <CardContent>
                <ul>
                    {participants.map(p => <li key={p.id}>User ({p.userId.slice(0, 6)}...) - {p.quantity} units</li>)}
                </ul>
            </CardContent>
        </Card>
    </div>
  );
};

export default GroupOrderDetailsPage;