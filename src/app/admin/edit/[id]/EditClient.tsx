"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db, storage } from '@/utils/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminNavbar from '@/components/AdminNavbar';
import { updateCar } from '@/utils/apiCars';
import { processImage, isImageFile } from '@/utils/imageProcessing';

interface CarData {
  id: string;
  title: string;
  marca: string;
  model: string;
  an: number;
  pret: number;
  km: number;
  caroserie: string;
  transmisie: string;
  combustibil: string;
  capacitate: string;
  putere?: string;
  descriere: string;
  dotari?: string;
  contact?: string;
  locatie?: string;
  images: string[];
  coverImage?: string;
}

export default function EditClient({ carId }: { carId: string }) {
  const router = useRouter();
  const [car, setCar] = useState<CarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const carDoc = await getDoc(doc(db, 'cars', carId));
        if (carDoc.exists()) {
          const data = carDoc.data();
          setCar({
            id: carDoc.id,
            title: data.title || '',
            marca: data.marca || '',
            model: data.model || '',
            an: data.an || 0,
            pret: data.pret || 0,
            km: data.km || 0,
            caroserie: data.caroserie || '',
            transmisie: data.transmisie || '',
            combustibil: data.combustibil || '',
            capacitate: data.capacitate || '',
            putere: data.putere,
            descriere: data.descriere || '',
            dotari: data.dotari,
            contact: data.contact,
            locatie: data.locatie,
            images: data.images || [],
            coverImage: data.coverImage || data.images?.[0],
          });
        } else {
          setError('Anunțul nu a fost găsit');
        }
      } catch (err) {
        setError('Eroare la încărcarea anunțului');
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [carId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!car) return;
    setCar({ ...car, [name]: value });
  };

  const handleCoverImageChange = (imageUrl: string) => {
    if (!car) return;
    setCar({ ...car, coverImage: imageUrl });
  };

  const handleImageDelete = (imageUrl: string) => {
    if (!car) return;
    setImagesToDelete([...imagesToDelete, imageUrl]);
    setCar({ ...car, images: car.images.filter(img => img !== imageUrl) });
    if (car.coverImage === imageUrl) {
      const remainingImages = car.images.filter(img => img !== imageUrl);
      setCar(prev => ({ ...prev!, coverImage: remainingImages[0] || '' }));
    }
  };

  const handleNewImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    setError('');
    const files = Array.from(e.target.files);
    const processedFiles: File[] = [];

    // Verifică dacă adăugarea noilor imagini nu depășește limita de 12
    const currentImageCount = car?.images.length || 0;
    if (currentImageCount + files.length > 12) {
      setError(`Nu poți adăuga mai mult de 12 imagini în total. Ai deja ${currentImageCount} imagini.`);
      return;
    }

    for (const file of files) {
      if (!isImageFile(file)) {
        setError(`Fișierul ${file.name} nu este o imagine validă.`);
        continue;
      }
      try {
        const processed = await processImage(file);
        if (processed) {
          processedFiles.push(processed.file);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Eroare la procesarea imaginii.');
        return;
      }
    }

    if (processedFiles.length > 0) {
      setNewImageFiles(prev => [...prev, ...processedFiles]);
      const newImageUrls = processedFiles.map(file => URL.createObjectURL(file));
      setCar(prev => ({ ...prev!, images: [...prev!.images, ...newImageUrls] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // 1. Șterge imaginile selectate pentru ștergere din storage
      for (const imageUrl of imagesToDelete) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (err) {
          if (err instanceof Error && 'code' in err && (err as any).code !== 'storage/object-not-found') {
            console.warn(`Nu s-a putut șterge imaginea: ${imageUrl}`, err);
          }
        }
      }

      // 2. Construiește lista de imagini finale: doar cele rămase + cele noi încărcate
      let updatedImages: string[] = [];

      // Adaugă imaginile rămase (după ștergere)
      if (car.images.length > 0) {
        updatedImages = car.images.filter(img => !imagesToDelete.includes(img) && !img.startsWith('blob:'));
      }

      // Încarcă noile imagini și adaugă URL-urile lor
      const newImageUrls: string[] = [];
      for (const file of newImageFiles) {
        const imageName = `${car.id}-${Date.now()}-${file.name}`;
        const imageRef = ref(storage, `cars/${imageName}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        newImageUrls.push(url);
      }
      updatedImages.push(...newImageUrls);

      // 3. Dacă nu există imagini rămase și nici noi, lista va fi goală
      // 4. Cover image trebuie să fie una din lista nouă sau gol
      let finalCoverImage: string | undefined = car.coverImage;
      if (!updatedImages.includes(finalCoverImage || '')) {
        finalCoverImage = updatedImages.length > 0 ? updatedImages[0] : '';
      }

      await updateCar(car.id, {
        ...car,
        images: updatedImages,
        coverImage: finalCoverImage || '',
        pret: Number(car.pret),
        km: Number(car.km),
        an: Number(car.an),
        capacitate: String(car.capacitate),
        putere: car.putere ? String(car.putere) : '',
      });

      setSuccess('✅ Anunțul a fost actualizat cu succes!');
      setTimeout(() => router.push('/admin/list'), 2000);
    } catch (err) {
      setError('A apărut o eroare la salvarea anunțului');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminAuthGuard>
        <AdminNavbar />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Se încarcă...</span>
          </div>
        </div>
      </AdminAuthGuard>
    );
  }

  if (!car) {
    return (
      <AdminAuthGuard>
        <AdminNavbar />
        <div className="container py-5">
          <div className="alert alert-danger">{error || 'Anunțul nu a fost găsit'}</div>
        </div>
      </AdminAuthGuard>
    );
  }

  return (
    <AdminAuthGuard>
      <AdminNavbar />
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>Editare anunț</h1>
              <button
                onClick={() => router.back()}
                className="btn btn-outline-secondary"
              >
                ← Înapoi
              </button>
            </div>

            {success && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                {success}
                <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
              </div>
            )}

            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}

            <div className="card shadow">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  {/* Image gallery and cover image selection */}
                  <div className="mb-4">
                    <label className="form-label">Imagini</label>
                    <div className="d-flex flex-wrap gap-3">
                      {car.images.map((imageUrl, idx) => (
                        <div key={idx} className="position-relative" style={{ width: 150 }}>
                          <img
                            src={imageUrl}
                            alt={`Imagine ${idx + 1}`}
                            className="car-thumbnail mb-2"
                            style={{
                              border: imageUrl === car.coverImage ? '3px solid #0d6efd' : '1px solid #dee2e6',
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                            onClick={() => handleImageDelete(imageUrl)}
                            title="Șterge imaginea"
                          >
                            &times;
                          </button>
                          <div className="d-grid">
                            <button
                              type="button"
                              className={`btn btn-sm ${imageUrl === car.coverImage ? 'btn-primary' : 'btn-outline-primary'}`}
                              onClick={() => handleCoverImageChange(imageUrl)}
                            >
                              {imageUrl === car.coverImage ? 'Imagine principală' : 'Setează ca principală'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add new images */}
                  <div className="mb-4">
                    <label className="form-label">Adaugă imagini noi (maxim 12 imagini în total)</label>
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      accept="image/*"
                      onChange={handleNewImages}
                    />
                    <small className="text-muted">
                      Ai {car.images.length} imagini din 12 posibile
                    </small>
                  </div>

                  {/* Basic details */}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Titlu anunț</label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={car.title}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Marcă</label>
                      <input
                        type="text"
                        className="form-control"
                        name="marca"
                        value={car.marca}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Model</label>
                      <input
                        type="text"
                        className="form-control"
                        name="model"
                        value={car.model}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">An fabricație</label>
                      <input
                        type="number"
                        className="form-control"
                        name="an"
                        value={car.an}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Preț (€)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="pret"
                        value={car.pret}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Kilometraj</label>
                      <input
                        type="number"
                        className="form-control"
                        name="km"
                        value={car.km}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Caroserie</label>
                      <select
                        className="form-select"
                        name="caroserie"
                        value={car.caroserie}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Alege caroseria...</option>
                        <option value="Cabrio">Cabrio</option>
                        <option value="Berlina">Berlina</option>
                        <option value="Coupe">Coupe</option>
                        <option value="Pickup">Pickup</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Break">Break</option>
                        <option value="Off-road">Off-road</option>
                        <option value="Minibus">Minibus</option>
                        <option value="Monovolum">Monovolum</option>
                        <option value="SUV">SUV</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Transmisie</label>
                      <select
                        className="form-select"
                        name="transmisie"
                        value={car.transmisie}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Alege transmisia...</option>
                        <option value="Manuală">Manuală</option>
                        <option value="Automată">Automată</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Combustibil</label>
                      <select
                        className="form-select"
                        name="combustibil"
                        value={car.combustibil}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Alege combustibilul...</option>
                        <option value="Benzină">Benzină</option>
                        <option value="Motorină">Motorină</option>
                        <option value="GPL">GPL</option>
                        <option value="Electric">Electric</option>
                        <option value="Hibrid">Hibrid</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Capacitate (cm³)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="capacitate"
                        value={car.capacitate}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Putere (CP)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="putere"
                        value={car.putere}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Descriere</label>
                      <textarea
                        className="form-control"
                        name="descriere"
                        value={car.descriere}
                        onChange={handleChange}
                        rows={4}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Dotări</label>
                      <textarea
                        className="form-control"
                        name="dotari"
                        value={car.dotari}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Lista de dotări, separate prin virgulă..."
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Contact</label>
                      <input
                        type="text"
                        className="form-control"
                        name="contact"
                        value={car.contact}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Locație</label>
                      <input
                        type="text"
                        className="form-control"
                        name="locatie"
                        value={car.locatie}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12 mt-4">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Se salvează...
                          </>
                        ) : (
                          'Salvează modificările'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
} 