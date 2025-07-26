import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import heroImage from '@/assets/hero-market.jpg';
import { 
  Store, 
  Users, 
  TrendingUp, 
  Shield, 
  Smartphone, 
  Globe,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, userData, loading } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && user && userData) {
      navigate('/dashboard');
    }
  }, [user, userData, loading, navigate]);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const features = [
    {
      icon: Store,
      title: 'Browse Suppliers',
      description: 'Find the best raw material suppliers in your area',
    },
    {
      icon: TrendingUp,
      title: 'Compare Prices',
      description: 'Get the best deals by comparing prices across suppliers',
    },
    {
      icon: Users,
      title: 'Group Orders',
      description: 'Join with other vendors for bulk buying discounts',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing for all transactions',
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Designed for easy use on mobile devices',
    },
    {
      icon: Globe,
      title: 'Hindi Support',
      description: 'Full support for Hindi language interface',
    },
  ];

  const benefits = [
    'Save up to 30% on raw material costs',
    'Reduce procurement time by 50%',
    'Access to verified suppliers only',
    'Real-time inventory updates',
    'Digital receipt management',
    'Group buying opportunities',
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LanguageToggle />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-accent/80"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center text-white">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-primary-glow bg-clip-text text-transparent">
                रसोई सेतु
              </span>
              <br />
              <span className="text-3xl md:text-4xl font-medium">Rasoi Setu</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
              The ultimate raw material procurement platform connecting Indian street food vendors with trusted suppliers
            </p>
            <p className="text-lg md:text-xl mb-12 text-white/80 max-w-2xl mx-auto">
              Compare prices • Join group orders • Save money • Grow your business
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto shadow-glow"
            >
              {t('getStarted')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 h-auto"
            >
              {t('learnMore')}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Why Choose Rasoi Setu?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built specifically for Indian street food vendors with features that understand your business needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-elegant transition-all duration-300 bg-card/90 backdrop-blur-sm border-0">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                    <feature.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 bg-gradient-accent bg-clip-text text-transparent">
                Transform Your Business
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of successful vendors who have revolutionized their raw material procurement with Rasoi Setu
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-accent flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button 
                onClick={handleGetStarted}
                size="lg" 
                className="mt-8 bg-gradient-accent hover:shadow-glow transition-all duration-300"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8">
                <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-6 shadow-elegant">
                  <h3 className="text-2xl font-bold mb-4">Success Story</h3>
                  <p className="text-muted-foreground mb-4">
                    "Rasoi Setu helped me reduce my raw material costs by 35% and save 2 hours daily on procurement. 
                    The group orders feature is a game-changer!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">RS</span>
                    </div>
                    <div>
                      <p className="font-medium">Raj Singh</p>
                      <p className="text-sm text-muted-foreground">Street Food Vendor, Delhi</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-primary-glow to-accent text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Procurement?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join Rasoi Setu today and start saving money while growing your street food business
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto shadow-glow"
          >
            Get Started for Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/50 backdrop-blur-sm py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            रसोई सेतु • Rasoi Setu
          </h3>
          <p className="text-muted-foreground mb-6">
            Connecting vendors with suppliers across India
          </p>
          <div className="text-sm text-muted-foreground">
            © 2024 Rasoi Setu. Built with ❤️ for Indian street food vendors.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
