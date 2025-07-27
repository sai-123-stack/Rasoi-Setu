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
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

// --- TYPES ---
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
  itemName: string;
  targetQty: number;
  currentQty: number;
  createdBy: string;
  status: 'active' | 'fulfilled' | 'expired' | 'cancelled';
  pricePerUnit: number;
  deadline: Date;
  deliveryArea: string;
  supplierId: string | null;
  createdAt: Date;
}

export interface GroupParticipant {
  id?: string;
  groupOrderId: string;
  userId: string;
  quantity: number;
  joinedAt: Date;
}


// --- USER & SUPPLIER PROFILE OPERATIONS ---
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

export const updateSupplierProfile = async (userId: string, updates: Partial<Omit<Supplier, 'id' | 'userId' | 'createdAt'>>) => {
  try {
    const supplierRef = doc(db, 'suppliers', userId);
    await setDoc(supplierRef, updates, { merge: true });
  } catch (error) {
    console.error('Error updating supplier profile:', error);
    throw error;
  }
};

export const getSupplierProfile = async (userId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'suppliers', userId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate(),
      } as Supplier;
    }
    return null;
  } catch (error) {
    console.error('Error getting supplier profile:', error);
    throw error;
  }
};

export const getAllSuppliers = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'suppliers'));
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as Supplier
    });
  } catch (error) {
    console.error('Error getting suppliers:', error);
    throw error;
  }
};


// --- INVENTORY OPERATIONS ---
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
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
            updatedAt: (data.updatedAt as Timestamp).toDate(),
        } as InventoryItem
    });
  } catch (error) {
    console.error('Error getting supplier inventory:', error);
    throw error;
  }
};

export const getAllInventory = async () => {
  try {
    const q = query(collection(db, 'inventory'), orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
            updatedAt: (data.updatedAt as Timestamp).toDate(),
        } as InventoryItem
    });
  } catch (error) {
    console.error('Error getting all inventory:', error);
    throw error;
  }
};


// --- DIRECT ORDER OPERATIONS ---
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
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
            updatedAt: (data.updatedAt as Timestamp).toDate(),
        } as Order
    });
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
      return snapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              ...data,
              createdAt: (data.createdAt as Timestamp).toDate(),
              updatedAt: (data.updatedAt as Timestamp).toDate(),
          } as Order
      });
    } catch (error) {
      console.error('Error getting supplier orders:', error);
      throw error;
    }
};


// --- GROUP ORDER FUNCTIONS ---
export const createGroupOrder = async (
  orderData: Omit<GroupOrder, 'id' | 'currentQty' | 'createdAt' | 'status' | 'supplierId' | 'deadline'> & { deadline: Date },
  initialQuantity: number
) => {
  const batch = writeBatch(db);
  const groupOrderRef = doc(collection(db, 'groupOrders'));
  
  batch.set(groupOrderRef, {
    ...orderData,
    deadline: Timestamp.fromDate(orderData.deadline), // Convert JS Date to Firestore Timestamp
    currentQty: initialQuantity,
    status: 'active',
    supplierId: null,
    createdAt: serverTimestamp(),
  });

  const participantRef = doc(collection(db, 'groupOrders', groupOrderRef.id, 'participants'), orderData.createdBy);
  batch.set(participantRef, {
    groupOrderId: groupOrderRef.id,
    userId: orderData.createdBy,
    quantity: initialQuantity,
    joinedAt: serverTimestamp(),
  });

  await batch.commit();
  return groupOrderRef.id;
};

export const joinGroupOrder = async (groupOrderId: string, userId: string, quantity: number) => {
  const groupOrderRef = doc(db, 'groupOrders', groupOrderId);
  const participantRef = doc(collection(db, 'groupOrders', groupOrderId, 'participants'), userId);
  const orderDoc = await getDoc(groupOrderRef);

  if (!orderDoc.exists() || orderDoc.data().status !== 'active') {
    throw new Error("Group order is not active or does not exist.");
  }

  const newQty = orderDoc.data().currentQty + quantity;
  if (newQty > orderDoc.data().targetQty) {
    throw new Error("Cannot join with a quantity that exceeds the target.");
  }

  const batch = writeBatch(db);
  batch.update(groupOrderRef, { currentQty: newQty });
  batch.set(participantRef, { groupOrderId, userId, quantity, joinedAt: serverTimestamp() });
  await batch.commit();
};

export const getActiveGroupOrders = async (): Promise<GroupOrder[]> => {
  const q = query(
    collection(db, 'groupOrders'),
    where('status', '==', 'active'),
    orderBy('deadline', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      deadline: (data.deadline as Timestamp).toDate(),
      createdAt: (data.createdAt as Timestamp).toDate(),
    } as GroupOrder;
  });
};

export const getGroupOrderWithParticipants = async (groupOrderId: string) => {
    const orderDoc = await getDoc(doc(db, 'groupOrders', groupOrderId));
    if (!orderDoc.exists()) return null;

    const participantsQuery = query(collection(db, 'groupOrders', groupOrderId, 'participants'));
    const participantsSnapshot = await getDocs(participantsQuery);
    const participants = participantsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            joinedAt: (data.joinedAt as Timestamp).toDate(),
        } as GroupParticipant;
    });
    
    const orderData = orderDoc.data();
    const order = { 
        ...orderData,
        id: orderDoc.id,
        deadline: (orderData.deadline as Timestamp).toDate(),
        createdAt: (orderData.createdAt as Timestamp).toDate(),
    } as GroupOrder;

    return { order, participants };
};

export const onGroupOrderUpdate = (
  groupOrderId: string,
  callback: (data: { order: GroupOrder; participants: GroupParticipant[] }) => void
) => {
  const orderRef = doc(db, 'groupOrders', groupOrderId);
  
  const unsubscribe = onSnapshot(orderRef, async (orderDoc) => {
    if (orderDoc.exists()) {
      const participantsRef = collection(db, 'groupOrders', groupOrderId, 'participants');
      const participantsSnap = await getDocs(participantsRef);
      const participants = participantsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          joinedAt: (data.joinedAt as Timestamp).toDate(),
        } as GroupParticipant;
      });
      
      const orderData = orderDoc.data();
      const order = { 
        ...orderData,
        id: orderDoc.id, 
        deadline: (orderData.deadline as Timestamp).toDate(),
        createdAt: (orderData.createdAt as Timestamp).toDate(),
    } as GroupOrder;
      callback({ order, participants });
    }
  });

  return unsubscribe;
};

export const deleteGroupOrder = async (groupOrderId: string) => {
  await deleteDoc(doc(db, 'groupOrders', groupOrderId));
};

export const getReviewableGroupOrders = async (): Promise<GroupOrder[]> => {
  const q = query(
    collection(db, 'groupOrders'),
    where('status', '==', 'active'),
    where('supplierId', '==', null),
    orderBy('deadline', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
          ...data,
          id: doc.id,
          deadline: (data.deadline as Timestamp).toDate(),
          createdAt: (data.createdAt as Timestamp).toDate(),
      } as GroupOrder;
  });
};

export const acceptGroupOrder = async (
  groupOrderId: string, 
  supplierId: string, 
  finalPrice: number,
  participants: GroupParticipant[]
) => {
  const batch = writeBatch(db);
  const groupOrderRef = doc(db, 'groupOrders', groupOrderId);
  const groupOrderSnap = await getDoc(groupOrderRef);
  const groupOrderData = groupOrderSnap.data();

  if (!groupOrderData) throw new Error("Group order not found.");

  batch.update(groupOrderRef, {
    supplierId: supplierId,
    status: 'fulfilled'
  });

  for (const participant of participants) {
    const orderRef = doc(collection(db, 'orders'));
    const newOrderData = {
      retailerId: participant.userId,
      supplierId: supplierId,
      items: [{
        itemId: 'group_buy_item',
        name: groupOrderData.itemName,
        quantity: participant.quantity,
        price: finalPrice,
        unit: groupOrderData.unit || 'unit'
      }],
      totalAmount: participant.quantity * finalPrice,
      status: 'confirmed' as const,
      isGroupOrder: true,
      groupOrderId: groupOrderId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    batch.set(orderRef, newOrderData);
  }

  await batch.commit();
};
