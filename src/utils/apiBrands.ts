import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  country?: string;
}

export const getBrands = async (): Promise<Brand[]> => {
  try {
    const brandsRef = collection(db, 'brands');
    const q = query(brandsRef, orderBy('name'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Brand));
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
};

export const getBrandNames = async (): Promise<string[]> => {
  try {
    const brands = await getBrands();
    return brands.map(brand => brand.name);
  } catch (error) {
    console.error('Error fetching brand names:', error);
    return [];
  }
};

export const getBrandByName = async (name: string): Promise<Brand | null> => {
  try {
    const brands = await getBrands();
    return brands.find(brand => brand.name.toLowerCase() === name.toLowerCase()) || null;
  } catch (error) {
    console.error('Error fetching brand by name:', error);
    return null;
  }
};

export const getBrandById = async (id: string): Promise<Brand | null> => {
  try {
    const brands = await getBrands();
    return brands.find(brand => brand.id === id) || null;
  } catch (error) {
    console.error('Error fetching brand by id:', error);
    return null;
  }
};