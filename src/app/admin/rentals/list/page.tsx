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

interface RentalData {
  id: string;
  marca: string;
  model: string;
  an: number;
  pret: string; // Preț în format text (ex: "400 €/zi")
  km: number;
  combustibil: string;
  images?: string[];
  coverImage?: string;
  createdAt: {
    toDate: () => Date;
  };
}

export default function ListRentalsPage() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState<RentalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    setLoading(true);
    setError('');
    try {
      const rentalsRef = collection(db, 'rentals');
      const querySnapshot = await getDocs(rentalsRef);
      const rentalsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RentalData[];
      
      // Sort the data in memory
      rentalsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setRentals(rentalsData);
    } catch (err) {
      setError('Eroare la încărcarea anunțurilor de închiriat');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rentalId: string) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest anunț de închiriat? Această acțiune nu poate fi anulată.')) {
      return;
    }

    setError('');
    setSuccess('');
    try {
      const rental = rentals.find(r => r.id === rentalId);
      if (!rental) {
        throw new Error('Anunțul nu a fost găsit');
      }

      const imageUrls = [...(rental.images || [])];
      if (rental.coverImage && !imageUrls.includes(rental.coverImage)) {
        imageUrls.push(rental.coverImage);
      }

      for (const imageUrl of imageUrls) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (err) {
          console.error('Eroare la ștergerea imaginii:', err);
        }
      }

      await deleteDoc(doc(db, 'rentals', rentalId));
      
      setRentals(rentals.filter(rental => rental.id !== rentalId));
      setSuccess('✅ Anunțul de închiriat a fost șters cu succes!');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Eroare la ștergerea anunțului de închiriat');
      console.error(err);
    }
  };

  const handleEdit = (rentalId: string) => {
    router.push(`/admin/rentals/edit/${rentalId}`);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ro-RO').format(num);
  };

  return (
    <AdminAuthGuard>
      <AdminNavbar />
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0 text-dark">Listă închirieri</h1>
          <Link href="/admin/rentals/add" className="btn btn-primary">
            <i className="bi bi-plus-lg me-2"></i>
            Adaugă închiriere
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
            <div className="spinner-border text-dark" role="status">
              <span className="visually-hidden">Se încarcă...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : rentals.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-dark mb-4">Nu există închirieri în baza de date.</p>
            <Link href="/admin/rentals/add" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2"></i>
              Adaugă prima închiriere
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {rentals.map(rental => (
              <div key={rental.id} className="col-md-6 col-lg-4">
                <div className="card h-100" style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)' }}>
                  <div className="position-relative">
                    <img
                      src={rental.coverImage || (rental.images && rental.images[0])}
                      alt={`${rental.marca} ${rental.model}`}
                      className="car-image"
                    />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title fw-bold mb-3 text-light">
                      {rental.marca} {rental.model}
                      <span className="text-light opacity-75 ms-2">{rental.an}</span>
                    </h5>
                    
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-light opacity-75">Preț:</span>
                        <span className="fw-bold text-danger">{rental.pret}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-light opacity-75">Kilometraj:</span>
                        <span className="text-light">{formatNumber(rental.km)} km</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-light opacity-75">Combustibil:</span>
                        <span className="text-light">{rental.combustibil}</span>
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button 
                        onClick={() => handleEdit(rental.id)} 
                        className="btn btn-outline-danger flex-grow-1"
                      >
                        <i className="bi bi-pencil me-2"></i>
                        Editează
                      </button>
                      <button 
                        onClick={() => handleDelete(rental.id)} 
                        className="btn btn-outline-secondary"
                        title="Șterge anunțul"
                      >
                        <i className="bi bi-trash"></i>
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