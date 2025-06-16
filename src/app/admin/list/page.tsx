'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminNavbar from '@/components/AdminNavbar';
import { deleteObject, ref } from 'firebase/storage';
import { storage } from '@/utils/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CarData {
  id: string;
  marca: string;
  model: string;
  an: number;
  pret: number;
  km: number;
  combustibil: string;
  images?: string[];
  coverImage?: string;
  createdAt: {
    toDate: () => Date;
  };
}

export default function ListCarsPage() {
  const { user } = useAuth();
  const [cars, setCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    setError('');
    try {
      const carsRef = collection(db, 'cars');
      const querySnapshot = await getDocs(carsRef);
      const carsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CarData[];
      
      // Sort the data in memory
      carsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setCars(carsData);
    } catch (err) {
      setError('Eroare la încărcarea anunțurilor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (carId: string) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest anunț? Această acțiune nu poate fi anulată.')) {
      return;
    }

    setError('');
    setSuccess('');
    try {
      const car = cars.find(c => c.id === carId);
      if (!car) {
        throw new Error('Anunțul nu a fost găsit');
      }

      const imageUrls = [...(car.images || [])];
      if (car.coverImage && !imageUrls.includes(car.coverImage)) {
        imageUrls.push(car.coverImage);
      }

      for (const imageUrl of imageUrls) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (err) {
          console.error('Eroare la ștergerea imaginii:', err);
        }
      }

      await deleteDoc(doc(db, 'cars', carId));
      
      setCars(cars.filter(car => car.id !== carId));
      setSuccess('✅ Anunțul a fost șters cu succes!');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Eroare la ștergerea anunțului');
      console.error(err);
    }
  };

  const handleEdit = (carId: string) => {
    router.push(`/admin/edit/${carId}`);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ro-RO').format(num);
  };

  return (
    <AdminAuthGuard>
      <AdminNavbar />
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0 text-light">Listă mașini</h1>
          <Link href="/admin/add" className="btn btn-primary">
            <i className="bi bi-plus-lg me-2"></i>
            Adaugă mașină
          </Link>
        </div>

        {success && (
          <div className="alert alert-success d-flex align-items-center">
            <i className="bi bi-check-circle me-2"></i>
            {success}
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger d-flex align-items-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Se încarcă...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-light mb-4">Nu există mașini în baza de date.</p>
            <Link href="/admin/add" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2"></i>
              Adaugă prima mașină
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {cars.map(car => (
              <div key={car.id} className="col-md-6 col-lg-4">
                <div className="card h-100" style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)' }}>
                  <div className="position-relative">
                    <img
                      src={car.coverImage || (car.images && car.images[0])}
                      alt={`${car.marca} ${car.model}`}
                      className="car-image"
                    />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title fw-bold mb-3 text-light">
                      {car.marca} {car.model}
                      <span className="text-light opacity-75 ms-2">{car.an}</span>
                    </h5>
                    
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-light opacity-75">Preț:</span>
                        <span className="fw-bold text-danger">{formatNumber(car.pret)} €</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-light opacity-75">Kilometraj:</span>
                        <span className="text-light">{formatNumber(car.km)} km</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-light opacity-75">Combustibil:</span>
                        <span className="text-light">{car.combustibil}</span>
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button 
                        onClick={() => handleEdit(car.id)} 
                        className="btn btn-outline-danger flex-grow-1"
                      >
                        <i className="bi bi-pencil me-2"></i>
                        Editează
                      </button>
                      <button 
                        onClick={() => handleDelete(car.id)} 
                        className="btn btn-outline-danger flex-grow-1"
                      >
                        <i className="bi bi-trash me-2"></i>
                        Șterge
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminAuthGuard>
  );
} 