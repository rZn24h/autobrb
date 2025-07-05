import { useState, useEffect } from 'react';
import { getBrands, addBrand, checkBrandExists, Brand } from '@/utils/apiBrands';

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Încarcă mărcile la montarea componentei
  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const brandsData = await getBrands();
      setBrands(brandsData);
    } catch (err) {
      console.error('Error loading brands:', err);
      setError(err instanceof Error ? err.message : 'Eroare la încărcarea mărcilor');
    } finally {
      setLoading(false);
    }
  };

  const addNewBrand = async (brandName: string): Promise<Brand> => {
    try {
      setError(null);
      const newBrand = await addBrand(brandName);
      
      // Actualizează lista locală cu noua marcă
      setBrands(prev => [...prev, newBrand].sort((a, b) => a.name.localeCompare(b.name)));
      
      return newBrand;
    } catch (err) {
      console.error('Error adding brand:', err);
      const errorMessage = err instanceof Error ? err.message : 'Eroare la adăugarea mărcii';
      setError(errorMessage);
      throw err;
    }
  };

  const checkBrandExists = async (brandName: string): Promise<boolean> => {
    try {
      return await checkBrandExists(brandName);
    } catch (err) {
      console.error('Eroare la verificarea mărcii:', err);
      return false;
    }
  };

  const refreshBrands = () => {
    loadBrands();
  };

  return {
    brands,
    loading,
    error,
    addNewBrand,
    checkBrandExists,
    refreshBrands
  };
}; 