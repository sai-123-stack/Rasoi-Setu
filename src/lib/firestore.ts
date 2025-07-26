import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  setDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface InventoryItem {
  id?: string;
  supplierId: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id?: string;
  userId: string;
  storeName: string;
  location: string;
  contactInfo: {
    phone?: string;
    address?: string;
  };
  rating: number;
  totalOrders: number;
  createdAt: Date;
}

export interface Order {
  id?: string;
  retailerId: string;
  supplierId: string;
  items: Array<{
    itemId: string;
    name: string;
    quantity: number;
    price: number;
    unit: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  isGroupOrder: boolean;
  groupOrderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupOrder {
  id?: string;
  createdBy: string;
  itemName: string;
  category: string;
  targetPrice: number;
  unit: string;
  minVendors: number;
  joinedVendors: Array<{
    userId: string;
    quantity: number;
    joinedAt: Date;
  }>;
  deadline: Date;
  status: 'active' | 'completed' | 'expired';
  createdAt: Date;
}

// User Profile Operations
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const createSupplierProfile = async (userId: string, supplierData: Omit<Supplier, 'id' | 'userId' | 'createdAt'>) => {
  try {
    await setDoc(doc(db, 'suppliers', userId), {
      userId,
      ...supplierData,
      rating: 0,
      totalOrders: 0,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating supplier profile:', error);
    throw error;
  }
};

// Inventory Operations
export const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'inventory'), {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding inventory item:', error);
    throw error;
  }
};

export const updateInventoryItem = async (itemId: string, updates: Partial<Omit<InventoryItem, 'id' | 'createdAt' | 'supplierId'>>) => {
  try {
    await updateDoc(doc(db, 'inventory', itemId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
};

export const deleteInventoryItem = async (itemId: string) => {
  try {
    await deleteDoc(doc(db, 'inventory', itemId));
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
};

export const getSupplierInventory = async (supplierId: string) => {
  try {
    const q = query(
      collection(db, 'inventory'),
      where('supplierId', '==', supplierId),
      orderBy('createdAt', 'desc') // Changed to sort by creation date for better user experience
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as InventoryItem[];
  } catch (error) {
    console.error('Error getting supplier inventory:', error);
    throw error;
  }
};

export const getAllInventory = async () => {
  try {
    const q = query(collection(db, 'inventory'), orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as InventoryItem[];
  } catch (error) {
    console.error('Error getting all inventory:', error);
    throw error;
  }
};

// Supplier Operations
export const getAllSuppliers = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'suppliers'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Supplier[];
  } catch (error) {
    console.error('Error getting suppliers:', error);
    throw error;
  }
};

export const getSupplierProfile = async (userId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'suppliers', userId));
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
      } as Supplier;
    }
    return null;
  } catch (error) {
    console.error('Error getting supplier profile:', error);
    throw error;
  }
};

// Order Operations
export const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const getRetailerOrders = async (retailerId: string) => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('retailerId', '==', retailerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Order[];
  } catch (error) {
    console.error('Error getting retailer orders:', error);
    throw error;
  }
};

export const getSupplierOrders = async (supplierId: string) => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('supplierId', '==', supplierId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Order[];
  } catch (error) {
    console.error('Error getting supplier orders:', error);
    throw error;
  }
};

// Group Order Operations
export const createGroupOrder = async (groupOrder: Omit<GroupOrder, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'groupOrders'), {
      ...groupOrder,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating group order:', error);
    throw error;
  }
};

export const joinGroupOrder = async (groupOrderId: string, userId: string, quantity: number) => {
  try {
    const docRef = doc(db, 'groupOrders', groupOrderId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as GroupOrder;
      const existingVendor = data.joinedVendors.find(v => v.userId === userId);
      
      if (existingVendor) {
        // This case is for updating quantity, which your UI doesn't do yet.
        // For simplicity, we can just prevent joining again, or implement updating logic.
        // Let's just update the joinedVendors array using arrayUnion to be safer.
        console.log("User already in group order. Logic to update quantity can be added here.");
        return;
      }

      const newVendor = {
        userId,
        quantity,
        joinedAt: serverTimestamp() // Using server timestamp for consistency
      };
      
      await updateDoc(docRef, {
        joinedVendors: arrayUnion(newVendor)
      });
    }
  } catch (error) {
    console.error('Error joining group order:', error);
    throw error;
  }
};

export const getActiveGroupOrders = async () => {
  try {
    const q = query(
      collection(db, 'groupOrders'),
      where('status', '==', 'active'),
      orderBy('deadline')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      deadline: doc.data().deadline?.toDate(),
    })) as GroupOrder[];
  } catch (error) {
    console.error('Error getting active group orders:', error);
    throw error;
  }
};

// Search Operations
export const searchInventoryByName = async (searchTerm: string) => {
  try {
    // NOTE: This search is not efficient for large datasets as it downloads all documents.
    // For a production app, consider a dedicated search service like Algolia or Elasticsearch.
    const snapshot = await getDocs(collection(db, 'inventory'));
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as InventoryItem[];
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching inventory:', error);
    throw error;
  }
};

export const getInventoryByCategory = async (category: string) => {
  try {
    const q = query(
      collection(db, 'inventory'),
      where('category', '==', category),
      orderBy('price')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(), // Corrected typo here
    })) as InventoryItem[];
  } catch (error) {
    console.error('Error getting inventory by category:', error);
    throw error;
  }
  
};
// Add this new function in src/lib/firestore.ts, for example after createSupplierProfile

export const updateSupplierProfile = async (userId: string, updates: Partial<Omit<Supplier, 'id' | 'userId' | 'createdAt'>>) => {
  try {
    const supplierRef = doc(db, 'suppliers', userId);
    // Using setDoc with merge will create the doc if it doesn't exist, and update it if it does.
    await setDoc(supplierRef, updates, { merge: true });
  } catch (error) {
    console.error('Error updating supplier profile:', error);
    throw error;
  }
};
export const deleteGroupOrder = async (groupOrderId: string) => {
  try {
    await deleteDoc(doc(db, 'groupOrders', groupOrderId));
  } catch (error) {
    console.error('Error deleting group order:', error);
    throw error;
  }
};