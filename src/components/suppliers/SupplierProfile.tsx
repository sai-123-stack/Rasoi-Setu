import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { getSupplierProfile, updateSupplierProfile, Supplier } from '@/lib/firestore';
import { Loader2, Save, User, MapPin, Phone, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SupplierProfile: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<Supplier>>({
    storeName: '',
    location: '',
    contactInfo: { phone: '', address: '' },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const supplierProfile = await getSupplierProfile(user.uid);
          if (supplierProfile) {
            setProfile(supplierProfile);
          }
        } catch (error) {
          toast({ title: t('error'), description: t('failed_to_load_profile'), variant: 'destructive' });
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [user, toast, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'phone' || id === 'address') {
      setProfile(prev => ({
        ...prev,
        contactInfo: { ...prev.contactInfo, [id]: value }
      }));
    } else {
      setProfile(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const profileDataToUpdate = {
        storeName: profile.storeName,
        location: profile.location,
        contactInfo: profile.contactInfo,
      };
      await updateSupplierProfile(user.uid, profileDataToUpdate);
      toast({ title: t('success'), description: t('profile_updated_successfully') });
      navigate('/dashboard');
    } catch (error) {
      toast({ title: t('error'), description: t('failed_to_update_profile'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User /> {t('profile')}</CardTitle>
          <CardDescription>{t('update_your_store_info')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="storeName" className="flex items-center gap-2"><Home />{t('storeName')}</Label>
              <Input id="storeName" value={profile.storeName} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2"><MapPin />{t('location')}</Label>
              <Input id="location" value={profile.location} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2"><Phone />{t('contact_phone')}</Label>
              <Input id="phone" type="tel" value={profile.contactInfo?.phone} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2"><Home />{t('address')}</Label>
              <Input id="address" value={profile.contactInfo?.address} onChange={handleChange} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('save_changes')}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>{t('cancel')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierProfile;