import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
// No longer need doc and setDoc directly here
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { auth } from '@/lib/firebase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, UserPlus, Mail, Lock, Users } from 'lucide-react';
// Import the helper functions
import { createUserProfile, createSupplierProfile } from '@/lib/firestore';

interface SignupFormProps {
  onToggleMode: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'retailer' | 'supplier' | ''>('');
  const [loading, setLoading] = useState(false);
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !role) {
      toast({
        title: t('error'),
        description: t('fillAllFields'),
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: t('error'),
        description: t('passwordTooWeak'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Use the helper function to create the user profile
      await createUserProfile(user.uid, {
        uid: user.uid,
        email: user.email,
        role: role,
        language: language,
      });

      // If supplier, use the helper function to create the supplier profile
      if (role === 'supplier') {
        await createSupplierProfile(user.uid, {
          storeName: 'My New Store', // Provide a default name
          location: '',
          contactInfo: { phone: '', address: '' }, // Correctly formatted object
          rating: 0,
          totalOrders: 0,
        });
      }

      toast({
        title: t('success'),
        description: t('welcome'),
      });
    } catch (error: any) {
      let errorMessage = t('error');
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = t('emailAlreadyExists');
      } else if (error.code === 'auth/weak-password') {
        errorMessage = t('passwordTooWeak');
      }
      
      toast({
        title: t('error'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card/90 backdrop-blur-lg border-0 shadow-elegant">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center shadow-glow">
          <UserPlus className="w-8 h-8 text-accent-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">
          {t('signup')}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {t('selectRole')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {t('email')}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-background/50 border-primary/20 focus:border-primary"
              placeholder="vendor@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {t('password')}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 bg-background/50 border-primary/20 focus:border-primary"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('role')}
            </Label>
            <Select onValueChange={(value: 'retailer' | 'supplier') => setRole(value)}>
              <SelectTrigger className="h-12 bg-background/50 border-primary/20 focus:border-primary">
                <SelectValue placeholder={t('selectRole')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retailer">{t('retailer')}</SelectItem>
                <SelectItem value="supplier">{t('supplier')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-accent hover:shadow-glow transition-all duration-300"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('loading')}
              </>
            ) : (
              t('signup')
            )}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t('alreadyHaveAccount')}{' '}
            <button
              onClick={onToggleMode}
              className="text-accent hover:text-accent/80 font-medium transition-colors"
            >
              {t('signInHere')}
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignupForm;