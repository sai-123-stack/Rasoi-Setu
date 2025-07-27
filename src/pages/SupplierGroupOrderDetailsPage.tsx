import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getGroupOrderWithParticipants, acceptGroupOrder, GroupOrder, GroupParticipant } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, X, Users } from 'lucide-react';

const SupplierGroupOrderDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [order, setOrder] = useState<GroupOrder | null>(null);
    const [participants, setParticipants] = useState<GroupParticipant[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (id) {
            getGroupOrderWithParticipants(id).then(data => {
                if (data) {
                    setOrder(data.order);
                    setParticipants(data.participants);
                }
                setLoading(false);
            });
        }
    }, [id]);

    const handleAccept = async () => {
        if (!user || !id || !order) return;
        setProcessing(true);
        try {
            await acceptGroupOrder(id, user.uid, order.pricePerUnit, participants);
            toast({ title: t('success'), description: t('order_accepted_successfully') });
            navigate('/dashboard');
        } catch (error) {
            console.error("Error accepting order:", error);
            toast({ title: t('error'), description: (error as Error).message, variant: 'destructive' });
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = () => {
        toast({ title: t('info'), description: t('order_rejected') });
        navigate('/supplier/group-orders');
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
    if (!order) return <p>{t('order_not_found')}</p>;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Review Group Order: {order.itemName}</CardTitle>
                    <CardDescription>Delivery Area: {order.deliveryArea}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="text-sm text-muted-foreground">{t('status')}</div>
                            <div className="font-bold text-lg text-primary">{t(order.status)}</div>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="text-sm text-muted-foreground">{t('total_quantity')}</div>
                            <div className="font-bold text-lg">{order.currentQty} / {order.targetQty}</div>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="text-sm text-muted-foreground">{t('proposed_price')}</div>
                            <div className="font-bold text-lg">₹{order.pricePerUnit} / unit</div>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="text-sm text-muted-foreground">{t('participants')}</div>
                            <div className="font-bold text-lg">{participants.length}</div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold mt-6 mb-2 text-lg flex items-center gap-2"><Users /> Participants</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            {participants.map(p => (
                                <li key={p.userId}>
                                    Retailer ({p.userId.slice(0,6)}...) has committed to <strong>{p.quantity} units</strong>.
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {order.status !== 'fulfilled' && (
                        <div className="flex gap-4 mt-6 pt-4 border-t">
                            <Button onClick={handleAccept} disabled={processing} className="bg-green-600 hover:bg-green-700">
                                {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                {t('accept_and_fulfill')}
                            </Button>
                            <Button variant="destructive" onClick={handleReject} disabled={processing}>
                                <X className="mr-2 h-4 w-4" />
                                {t('reject_order')}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SupplierGroupOrderDetailsPage;