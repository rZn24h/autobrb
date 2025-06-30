import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy,
  doc,
  getDoc
} from 'firebase/firestore';

export interface Brand {
  id?: string;
  name: string;
  createdAt?: Date;
}

// Obține toate mărcile din colecția brands
export const getBrands = async (): Promise<Brand[]> => {
  try {
    const brandsRef = collection(db, 'brands');
    const q = query(brandsRef, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    })) as Brand[];
  } catch (error) {
    console.error('Eroare la obținerea mărcilor:', error);
    throw new Error('Nu s-au putut obține mărcile');
  }
};

// Verifică dacă o marcă există deja (case-insensitive)
export const checkBrandExists = async (brandName: string): Promise<boolean> => {
  try {
    const brandsRef = collection(db, 'brands');
    const q = query(
      brandsRef, 
      where('name', '==', brandName.trim())
    );
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Eroare la verificarea mărcii:', error);
    return false;
  }
};

// Adaugă o marcă nouă în colecția brands
export const addBrand = async (brandName: string): Promise<Brand> => {
  try {
    const trimmedName = brandName.trim();
    
    if (!trimmedName) {
      throw new Error('Numele mărcii nu poate fi gol');
    }
    
    // Verifică dacă marca există deja
    const exists = await checkBrandExists(trimmedName);
    if (exists) {
      throw new Error('Această marcă există deja');
    }
    
    const brandsRef = collection(db, 'brands');
    const newBrand = {
      name: trimmedName,
      createdAt: new Date()
    };
    
    const docRef = await addDoc(brandsRef, newBrand);
    
    return {
      id: docRef.id,
      ...newBrand
    };
  } catch (error) {
    console.error('Eroare la adăugarea mărcii:', error);
    throw error;
  }
};

// Obține o marcă după ID
export const getBrandById = async (brandId: string): Promise<Brand | null> => {
  try {
    const brandRef = doc(db, 'brands', brandId);
    const brandDoc = await getDoc(brandRef);
    
    if (brandDoc.exists()) {
      return {
        id: brandDoc.id,
        ...brandDoc.data(),
        createdAt: brandDoc.data().createdAt?.toDate()
      } as Brand;
    }
    
    return null;
  } catch (error) {
    console.error('Eroare la obținerea mărcii:', error);
    throw new Error('Nu s-a putut obține marca');
  }
}; 