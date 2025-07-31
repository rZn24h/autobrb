import { collection, getDocs, query, orderBy, limit, where, doc, getDoc, addDoc, updateDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { db } from './firebase';

export interface Rental {
  id: string;
  title: string;
  marca: string;
  model: string;
  an: number;
  pret: number;
  km: number;
  combustibil: string;
  transmisie: string;
  putere?: string;
  capacitate: string;
  images: string[];
  coverImage?: string;
  description?: string;
  features?: string[];
  availability?: boolean;
  dailyRate?: number;
  weeklyRate?: number;
  monthlyRate?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export const getRentals = async (sortBy: 'price-asc' | 'price-desc' = 'price-asc', limitCount?: number): Promise<Rental[]> => {
  try {
    const rentalsRef = collection(db, 'rentals');
    let q = query(rentalsRef, orderBy('pret', sortBy === 'price-asc' ? 'asc' : 'desc'));
    
    if (limitCount) {
      q = query(rentalsRef, orderBy('pret', sortBy === 'price-asc' ? 'asc' : 'desc'), limit(limitCount));
    }
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Rental));
  } catch (error) {
    console.error('Error fetching rentals:', error);
    return [];
  }
};

export const getRentalById = async (id: string): Promise<Rental | null> => {
  try {
    const rentalDoc = doc(db, 'rentals', id);
    const snapshot = await getDoc(rentalDoc);
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Rental;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching rental by id:', error);
    return null;
  }
};

export const getRentalsByBrand = async (brand: string): Promise<Rental[]> => {
  try {
    const rentalsRef = collection(db, 'rentals');
    const q = query(rentalsRef, where('marca', '==', brand), orderBy('pret', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Rental));
  } catch (error) {
    console.error('Error fetching rentals by brand:', error);
    return [];
  }
};

export const getAvailableRentals = async (): Promise<Rental[]> => {
  try {
    const rentalsRef = collection(db, 'rentals');
    const q = query(rentalsRef, where('availability', '==', true), orderBy('pret', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Rental));
  } catch (error) {
    console.error('Error fetching available rentals:', error);
    return [];
  }
};

export const addRental = async (rental: Omit<Rental, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'rentals'), {
      ...rental,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding rental:', error);
    return null;
  }
};

export const updateRental = async (id: string, updates: Partial<Rental>): Promise<boolean> => {
  try {
    const rentalDoc = doc(db, 'rentals', id);
    await updateDoc(rentalDoc, {
      ...updates,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating rental:', error);
    return false;
  }
};

export const deleteRental = async (id: string): Promise<boolean> => {
  try {
    const rentalDoc = doc(db, 'rentals', id);
    await deleteDoc(rentalDoc);
    return true;
  } catch (error) {
    console.error('Error deleting rental:', error);
    return false;
  }
};