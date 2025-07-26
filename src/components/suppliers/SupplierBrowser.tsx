import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Search, Store, MapPin, Star, ShoppingCart, Plus } from 'lucide-react';
import { 
  getAllSuppliers, 
  getAllInventory,
  Supplier,
  InventoryItem 
} from '@/lib/firestore';
import { useCart } from '@/contexts/CartContext'; // Import the shared cart context
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  'all', 'vegetables', 'spices', 'grains', 'dairy', 'oil',
  'snacks', 'beverages', 'packaging', 'other'
];

const SupplierBrowser: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  // Use the shared cart context instead of local state
  const { cart, addToCart, updateCartQuantity, cartCount } = useCart();
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'suppliers' | 'products'>('suppliers');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter logic now runs on the local inventory state for performance
    let filtered = [...inventory];
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      if (viewMode === 'products') {
        filtered = filtered.filter(item => item.name.toLowerCase().includes(lowercasedTerm));
      }
    }
    setFilteredInventory(filtered);
  }, [searchTerm, selectedCategory, inventory, viewMode]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [suppliersData, inventoryData] = await Promise.all([
        getAllSuppliers(),
        getAllInventory()
      ]);
      setSuppliers(suppliersData);
      setInventory(inventoryData);
      setFilteredInventory(inventoryData);
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_to_load_data'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getSupplierInventory = (supplierId: string) => {
    return inventory.filter(item => item.supplierId === supplierId);
  };

  const getSupplierById = (supplierId: string) => {
    return suppliers.find(supplier => supplier.userId === supplierId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Store className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{t('loading_suppliers')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('browseSuppliers')}</h2>
          <p className="text-muted-foreground">{t('find_raw_materials')}</p>
        </div>
        
        {cartCount > 0 && (
          <Button variant="outline" className="gap-2" onClick={() => navigate('/cart')}>
            <ShoppingCart className="w-4 h-4" />
            {t('cart')} ({cartCount})
          </Button>
        )}
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'suppliers' | 'products')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="suppliers">{t('suppliers')}</TabsTrigger>
          <TabsTrigger value="products">{t('products')}</TabsTrigger>
        </TabsList>

        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={viewMode === 'suppliers' ? t('search_suppliers') : t('search_products')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>
          
          {viewMode === 'products' && (
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {t(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suppliers
              .filter(supplier => 
                !searchTerm || 
                supplier.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.location.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((supplier) => {
                const supplierItems = getSupplierInventory(supplier.userId);
                
                return (
                  <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{supplier.storeName}</CardTitle>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{supplier.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{supplier.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {t('total_orders')}: {supplier.totalOrders}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredInventory.map((item) => {
              const supplier = getSupplierById(item.supplierId);
              const cartItem = cart.find(cartItem => cartItem.id === item.id);
              
              return (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{item.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {t(item.category)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">₹{item.price}</div>
                        <div className="text-xs text-muted-foreground">/{t(item.unit)}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {supplier && (
                      <div className="flex items-center gap-2 text-sm">
                        <Store className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{supplier.storeName}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('stock')}</span>
                      <span className={`font-medium ${item.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.stock} {t(item.unit)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {cartItem ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Button size="sm" variant="outline" onClick={() => updateCartQuantity(item.id!, cartItem.quantity - 1)} className="h-8 w-8 p-0">-</Button>
                          <span className="px-2 py-1 bg-muted rounded text-sm font-medium">{cartItem.quantity}</span>
                          <Button size="sm" variant="outline" onClick={() => updateCartQuantity(item.id!, cartItem.quantity + 1)} className="h-8 w-8 p-0">+</Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => addToCart(item)} className="flex-1 gap-2" disabled={item.stock === 0}>
                          <Plus className="w-3 h-3" />
                          {t('add_to_cart')}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupplierBrowser;