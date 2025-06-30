"use client";

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { updateRental } from '@/utils/apiRentals';
import { useAuth } from '@/contexts/AuthContext';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminNavbar from '@/components/AdminNavbar';
import { BrandSelector } from '@/components/BrandSelector';

interface FormErrors {
  title?: string;
  marca?: string;
  model?: string;
  an?: string;
  pret?: string;
  km?: string;
  caroserie?: string;
  transmisie?: string;
  combustibil?: string;
  capacitate?: string;
  putere?: string;
  tractiune?: string;
  descriere?: string;
  dotari?: string;
  contact?: string;
  locatie?: string;
  images?: string;
}

interface PricingInterval {
  days: string;
  price: string;
}

const caroserieOptions = [
  { value: 'Cabrio', label: 'Cabrio' },
  { value: 'Berlina', label: 'Berlina' },
  { value: 'Coupe', label: 'Coupe' },
  { value: 'Pickup', label: 'Pickup' },
  { value: 'Hatchback', label: 'Hatchback' },
  { value: 'Break', label: 'Break' },
  { value: 'Off-road', label: 'Off-road' },
  { value: 'Minibus', label: 'Minibus' },
  { value: 'Monovolum', label: 'Monovolum' },
  { value: 'SUV', label: 'SUV' },
];

export default function EditRentalPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const rentalId = params.id as string;

  const [form, setForm] = useState({
    title: '',
    marca: '',
    model: '',
    an: '',
    pret: '',
    km: '',
    caroserie: '',
    transmisie: '',
    combustibil: '',
    capacitate: '',
    putere: '',
    tractiune: '',
    descriere: '',
    dotari: '',
    contact: '',
    locatie: '',
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  const [deletedImageIndexes, setDeletedImageIndexes] = useState<number[]>([]);
  const [intervalInput, setIntervalInput] = useState({ days: '', price: '' });
  const [confirmedIntervals, setConfirmedIntervals] = useState<PricingInterval[]>([]);
  const [intervalError, setIntervalError] = useState<string>('');

  useEffect(() => {
    fetchRental();
  }, [rentalId]);

  useEffect(() => {
    if (form.pret) {
      // Parsează stringul "3 zile: 100 €/zi, ..." în array
      const intervals = form.pret.split(',').map(str => {
        const match = str.match(/(\d+) zile: (\d+) €/);
        if (match) return { days: match[1], price: match[2] };
        return null;
      }).filter(Boolean) as PricingInterval[];
      setConfirmedIntervals(intervals);
    }
  }, [form.pret]);

  const fetchRental = async () => {
    try {
      const rentalRef = doc(db, 'rentals', rentalId);
      const rentalSnap = await getDoc(rentalRef);
      
      if (!rentalSnap.exists()) {
        setError('Închirierea nu a fost găsită');
        return;
      }

      const rentalData = rentalSnap.data();
      
      setForm({
        title: rentalData.title || '',
        marca: rentalData.marca || '',
        model: rentalData.model || '',
        an: rentalData.an?.toString() || '',
        pret: rentalData.pret || '',
        km: rentalData.km?.toString() || '',
        caroserie: rentalData.caroserie || '',
        transmisie: rentalData.transmisie || '',
        combustibil: rentalData.combustibil || '',
        capacitate: rentalData.capacitate?.toString() || '',
        putere: rentalData.putere?.toString() || '',
        tractiune: rentalData.tractiune || '',
        descriere: rentalData.descriere || '',
        dotari: rentalData.dotari || '',
        contact: rentalData.contact || '',
        locatie: rentalData.locatie || '',
      });

      setExistingImages(rentalData.images || []);
      
      // Set cover image index
      if (rentalData.coverImage) {
        const coverIndex = rentalData.images?.indexOf(rentalData.coverImage) || 0;
        setCoverImageIndex(coverIndex);
      }
      
    } catch (err) {
      setError('Eroare la încărcarea închirierii');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;
    const currentYear = new Date().getFullYear();

    // Required fields validation - removed km and caroserie as required
    const requiredFields = [
      { key: 'title', label: 'Titlu anunț' },
      { key: 'marca', label: 'Marca' },
      { key: 'model', label: 'Model' },
      { key: 'an', label: 'An fabricație' },
      { key: 'combustibil', label: 'Combustibil' },
      { key: 'transmisie', label: 'Transmisie' },
      { key: 'capacitate', label: 'Capacitate' },
      { key: 'descriere', label: 'Descriere' }
    ];

    requiredFields.forEach(({ key, label }) => {
      if (!form[key as keyof typeof form]) {
        newErrors[key as keyof FormErrors] = `${label} este obligatoriu`;
        isValid = false;
      }
    });

    // Numeric validations
    if (form.km && Number(form.km) <= 0) {
      newErrors.km = 'Kilometrajul trebuie să fie mai mare decât 0';
      isValid = false;
    }

    if (form.capacitate && Number(form.capacitate) <= 0) {
      newErrors.capacitate = 'Capacitatea trebuie să fie mai mare decât 0';
      isValid = false;
    }

    if (form.putere && Number(form.putere) <= 0) {
      newErrors.putere = 'Puterea trebuie să fie mai mare decât 0';
      isValid = false;
    }

    // Year validation
    if (form.an) {
      const yearNum = Number(form.an);
      if (isNaN(yearNum) || yearNum < 1990 || yearNum > currentYear) {
        newErrors.an = `Anul trebuie să fie între 1990 și ${currentYear}`;
        isValid = false;
      }
    }

    // Images validation - must have at least one image
    const totalImages = existingImages.length - deletedImageIndexes.length + newImages.length;
    if (totalImages === 0) {
      newErrors.images = 'Trebuie să ai cel puțin o imagine';
      isValid = false;
    } else if (totalImages > 12) {
      newErrors.images = 'Poți avea maxim 12 imagini';
      isValid = false;
    }

    if (confirmedIntervals.length === 0) {
      newErrors.pret = 'Adaugă cel puțin un interval de preț!';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBrandChange = (value: string) => {
    setForm(prev => ({ ...prev, marca: value }));
    // Clear error when user starts typing
    if (errors.marca) {
      setErrors(prev => ({ ...prev, marca: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalImages = existingImages.length - deletedImageIndexes.length + files.length;
      
      if (totalImages > 12) {
        setErrors(prev => ({ ...prev, images: 'Poți avea maxim 12 imagini în total' }));
        setNewImages([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setErrors(prev => ({ ...prev, images: undefined }));
        setNewImages(files);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setErrors({});
    
    if (!validateForm()) {
      setError('Te rugăm să corectezi erorile din formular.');
      return;
    }
    
    if (!window.confirm('Ești sigur că vrei să actualizezi această închiriere?')) {
      return;
    }
    
    setSaving(true);
    try {
      if (!user) {
        throw new Error('Trebuie să fii autentificat pentru a edita o închiriere');
      }

      // Update rental
      const pricingText = confirmedIntervals
        .map(interval => `${interval.days} zile: ${interval.price} €/zi`)
        .join(', ');
      const formWithPricing = {
        ...form,
        pret: pricingText || form.pret
      };
      await updateRental(rentalId, formWithPricing, newImages, existingImages, coverImageIndex, deletedImageIndexes);
      
      // Show success message
      setSuccess('✅ Închirierea a fost actualizată cu succes!');
      
      setTimeout(() => {
        router.push('/admin/rentals/list');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Eroare la actualizarea închirierii');
      console.error('Error updating rental:', err);
    } finally {
      setSaving(false);
    }
  };

  const removeExistingImage = (index: number) => {
    setDeletedImageIndexes(prev => [...prev, index]);
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const setCoverImage = (index: number, isNewImage: boolean = false) => {
    if (isNewImage) {
      setCoverImageIndex(existingImages.length - deletedImageIndexes.length + index);
    } else {
      setCoverImageIndex(index);
    }
  };

  const getVisibleExistingImages = () => {
    return existingImages.filter((_, index) => !deletedImageIndexes.includes(index));
  };

  const getCurrentCoverImageIndex = () => {
    const visibleImages = getVisibleExistingImages();
    return coverImageIndex < visibleImages.length ? coverImageIndex : 0;
  };

  if (loading) {
    return (
      <AdminAuthGuard>
        <AdminNavbar />
        <div className="container py-4">
          <div className="text-center">
            <div className="spinner-border text-dark" role="status">
              <span className="visually-hidden">Se încarcă...</span>
            </div>
          </div>
        </div>
      </AdminAuthGuard>
    );
  }

  if (error && !loading) {
    return (
      <AdminAuthGuard>
        <AdminNavbar />
        <div className="container py-4">
          <div className="alert alert-danger d-flex flex-column align-items-start">
            <div className="mb-1"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div>
            {Object.values(errors).filter(Boolean).length > 0 && (
              <ul className="mb-0 ps-4">
                {Object.entries(errors).map(([key, val]) => val && (
                  <li key={key} style={{ fontSize: '1rem' }}>
                    {val}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <a href="/admin/rentals/list" className="btn btn-primary">
            Înapoi la listă
          </a>
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
              <h1 className="h3 mb-0 text-dark">Editează închiriere</h1>
              <a href="/admin/rentals/list" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-2"></i>
                Înapoi la listă
              </a>
            </div>

            {success && (
              <div className="alert alert-success d-flex align-items-center">
                <i className="bi bi-check-circle me-2"></i>
                {success}
              </div>
            )}
            
            {error && (
              <div className="alert alert-danger d-flex flex-column align-items-start">
                <div className="mb-1"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div>
                {Object.values(errors).filter(Boolean).length > 0 && (
                  <ul className="mb-0 ps-4">
                    {Object.entries(errors).map(([key, val]) => val && (
                      <li key={key} style={{ fontSize: '1rem' }}>
                        {val}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="needs-validation">
              <div className="row g-4">
                {/* Basic Information */}
                <div className="col-12">
                  <div className="card" style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)' }}>
                    <div className="card-header" style={{ backgroundColor: 'var(--gray-700)', borderBottom: '1px solid var(--gray-600)' }}>
                      <h5 className="mb-0 text-light">Informații de bază</h5>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label htmlFor="title" className="form-label text-light">Titlu anunț *</label>
                          <input
                            type="text"
                            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                            id="title"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Ex: BMW X5 închiriere"
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          />
                          {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="marca" className="form-label text-light">Marcă *</label>
                          <BrandSelector
                            value={form.marca}
                            onChange={handleBrandChange}
                            error={errors.marca}
                            disabled={saving}
                          />
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="model" className="form-label text-light">Model *</label>
                          <input
                            type="text"
                            className={`form-control ${errors.model ? 'is-invalid' : ''}`}
                            id="model"
                            name="model"
                            value={form.model}
                            onChange={handleChange}
                            placeholder="Ex: X5"
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          />
                          {errors.model && <div className="invalid-feedback">{errors.model}</div>}
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="an" className="form-label text-light">An fabricație *</label>
                          <input
                            type="number"
                            className={`form-control ${errors.an ? 'is-invalid' : ''}`}
                            id="an"
                            name="an"
                            value={form.an}
                            onChange={handleChange}
                            placeholder="Ex: 2020"
                            min="1990"
                            max={new Date().getFullYear()}
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          />
                          {errors.an && <div className="invalid-feedback">{errors.an}</div>}
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="km" className="form-label text-light">Kilometraj *</label>
                          <input
                            type="number"
                            className={`form-control ${errors.km ? 'is-invalid' : ''}`}
                            id="km"
                            name="km"
                            value={form.km}
                            onChange={handleChange}
                            placeholder="Ex: 50000"
                            min="0"
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          />
                          {errors.km && <div className="invalid-feedback">{errors.km}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="col-12">
                  <div className="card" style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)' }}>
                    <div className="card-header" style={{ backgroundColor: 'var(--gray-700)', borderBottom: '1px solid var(--gray-600)' }}>
                      <h5 className="mb-0 text-light">Specificații tehnice</h5>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label htmlFor="caroserie" className="form-label text-light">Caroserie *</label>
                          <select
                            className={`form-select ${errors.caroserie ? 'is-invalid' : ''}`}
                            id="caroserie"
                            name="caroserie"
                            value={form.caroserie}
                            onChange={handleChange}
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          >
                            <option value="">Selectează caroseria</option>
                            {caroserieOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          {errors.caroserie && <div className="invalid-feedback">{errors.caroserie}</div>}
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="transmisie" className="form-label text-light">Transmisie *</label>
                          <select
                            className={`form-select ${errors.transmisie ? 'is-invalid' : ''}`}
                            id="transmisie"
                            name="transmisie"
                            value={form.transmisie}
                            onChange={handleChange}
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          >
                            <option value="">Selectează transmisia</option>
                            <option value="Manuală">Manuală</option>
                            <option value="Automată">Automată</option>
                            <option value="CVT">CVT</option>
                          </select>
                          {errors.transmisie && <div className="invalid-feedback">{errors.transmisie}</div>}
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="combustibil" className="form-label text-light">Combustibil *</label>
                          <select
                            className={`form-select ${errors.combustibil ? 'is-invalid' : ''}`}
                            id="combustibil"
                            name="combustibil"
                            value={form.combustibil}
                            onChange={handleChange}
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          >
                            <option value="">Selectează combustibilul</option>
                            <option value="Benzină">Benzină</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Hibrid">Hibrid</option>
                            <option value="Electric">Electric</option>
                            <option value="GPL">GPL</option>
                            <option value="Plug-in Hibrid">Plug-in Hibrid</option>
                          </select>
                          {errors.combustibil && <div className="invalid-feedback">{errors.combustibil}</div>}
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="capacitate" className="form-label text-light">Capacitate motor (cm³) *</label>
                          <input
                            type="number"
                            className={`form-control ${errors.capacitate ? 'is-invalid' : ''}`}
                            id="capacitate"
                            name="capacitate"
                            value={form.capacitate}
                            onChange={handleChange}
                            placeholder="Ex: 2000"
                            min="0"
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          />
                          {errors.capacitate && <div className="invalid-feedback">{errors.capacitate}</div>}
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="putere" className="form-label text-light">Putere (CP)</label>
                          <input
                            type="number"
                            className={`form-control ${errors.putere ? 'is-invalid' : ''}`}
                            id="putere"
                            name="putere"
                            value={form.putere}
                            onChange={handleChange}
                            placeholder="Ex: 150"
                            min="0"
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          />
                          {errors.putere && <div className="invalid-feedback">{errors.putere}</div>}
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="tractiune" className="form-label text-light">Tracțiune</label>
                          <select
                            className="form-select"
                            id="tractiune"
                            name="tractiune"
                            value={form.tractiune}
                            onChange={handleChange}
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          >
                            <option value="">Selectează tracțiunea</option>
                            <option value="Față">Față</option>
                            <option value="Spate">Spate</option>
                            <option value="4x4">4x4</option>
                            <option value="AWD">AWD</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description and Features */}
                <div className="col-12">
                  <div className="card" style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)' }}>
                    <div className="card-header" style={{ backgroundColor: 'var(--gray-700)', borderBottom: '1px solid var(--gray-600)' }}>
                      <h5 className="mb-0 text-light">Descriere și dotări</h5>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-12">
                          <label htmlFor="descriere" className="form-label text-light">Descriere *</label>
                          <textarea
                            className={`form-control ${errors.descriere ? 'is-invalid' : ''}`}
                            id="descriere"
                            name="descriere"
                            value={form.descriere}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Descrie mașina, condițiile de închiriere, etc."
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          />
                          {errors.descriere && <div className="invalid-feedback">{errors.descriere}</div>}
                        </div>

                        <div className="col-12">
                          <label htmlFor="dotari" className="form-label text-light">Dotări</label>
                          <textarea
                            className="form-control"
                            id="dotari"
                            name="dotari"
                            value={form.dotari}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Listează dotările (câte una pe linie)"
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          />
                          <div className="form-text text-light opacity-75">Introdu câte o dotare pe linie</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className="col-12">
                  <div className="card" style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)' }}>
                    <div className="card-header" style={{ backgroundColor: 'var(--gray-700)', borderBottom: '1px solid var(--gray-600)' }}>
                      <h5 className="mb-0 text-light">Imagini</h5>
                    </div>
                    <div className="card-body">
                      {/* Existing Images */}
                      {getVisibleExistingImages().length > 0 && (
                        <div className="mb-4">
                          <h6 className="text-light mb-3">Imagini existente</h6>
                          <div className="row g-3">
                            {getVisibleExistingImages().map((imageUrl, index) => (
                              <div key={index} className="col-md-4 col-lg-3">
                                <div className="position-relative">
                                  <img
                                    src={imageUrl}
                                    alt={`Imagine ${index + 1}`}
                                    className="img-fluid rounded"
                                    style={{ 
                                      width: '100%', 
                                      height: '150px', 
                                      objectFit: 'cover',
                                      border: getCurrentCoverImageIndex() === index ? '3px solid var(--danger-color)' : '1px solid var(--gray-600)'
                                    }}
                                  />
                                  <div className="position-absolute top-0 end-0 m-2">
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-sm rounded-circle"
                                      onClick={() => removeExistingImage(index)}
                                      style={{ width: '30px', height: '30px', padding: 0 }}
                                    >
                                      <i className="bi bi-x"></i>
                                    </button>
                                  </div>
                                  <div className="position-absolute bottom-0 start-0 end-0 p-2">
                                    <button
                                      type="button"
                                      className={`btn btn-sm w-100 ${getCurrentCoverImageIndex() === index ? 'btn-danger' : 'btn-outline-danger'}`}
                                      onClick={() => setCoverImage(index)}
                                    >
                                      {getCurrentCoverImageIndex() === index ? 'Imagine principală' : 'Setează ca principală'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* New Images */}
                      <div className="mb-3">
                        <label htmlFor="images" className="form-label text-light">Adaugă imagini noi</label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className={`form-control ${errors.images ? 'is-invalid' : ''}`}
                          id="images"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                          style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                        />
                        {errors.images && <div className="invalid-feedback">{errors.images}</div>}
                        <div className="form-text text-light opacity-75">Poți adăuga imagini noi până la un total de 12 imagini.</div>
                      </div>

                      {newImages.length > 0 && (
                        <div className="row g-3">
                          {newImages.map((file, index) => (
                            <div key={index} className="col-md-4 col-lg-3">
                              <div className="position-relative">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index + 1}`}
                                  className="img-fluid rounded"
                                  style={{ 
                                    width: '100%', 
                                    height: '150px', 
                                    objectFit: 'cover',
                                    border: coverImageIndex === existingImages.length - deletedImageIndexes.length + index ? '3px solid var(--danger-color)' : '1px solid var(--gray-600)'
                                  }}
                                />
                                <div className="position-absolute top-0 end-0 m-2">
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm rounded-circle"
                                    onClick={() => removeNewImage(index)}
                                    style={{ width: '30px', height: '30px', padding: 0 }}
                                  >
                                    <i className="bi bi-x"></i>
                                  </button>
                                </div>
                                <div className="position-absolute bottom-0 start-0 end-0 p-2">
                                  <button
                                    type="button"
                                    className={`btn btn-sm w-100 ${coverImageIndex === existingImages.length - deletedImageIndexes.length + index ? 'btn-danger' : 'btn-outline-danger'}`}
                                    onClick={() => setCoverImage(index, true)}
                                  >
                                    {coverImageIndex === existingImages.length - deletedImageIndexes.length + index ? 'Imagine principală' : 'Setează ca principală'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interval de preț */}
                <div className="col-12">
                  <div className="card" style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)' }}>
                    <div className="card-header" style={{ backgroundColor: 'var(--gray-700)', borderBottom: '1px solid var(--gray-600)' }}>
                      <h5 className="mb-0 text-light">Intervale de preț</h5>
                    </div>
                    <div className="card-body">
                      {/* Lista intervale confirmate */}
                      {confirmedIntervals.length > 0 && (
                        <ul className="mb-3">
                          {confirmedIntervals.map((interval, idx) => (
                            <li key={idx} className="d-flex align-items-center justify-content-between" style={{ color: '#fff' }}>
                              <span>{interval.days} zile: {interval.price} €/zi</span>
                              <button type="button" className="btn btn-sm btn-danger ms-2" onClick={() => setConfirmedIntervals(confirmedIntervals.filter((_, i) => i !== idx))}>
                                Șterge
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {/* Input pentru adăugare interval nou */}
                      <div className="row g-3 align-items-end mb-2">
                        <div className="col-md-4">
                          <label className="form-label text-light">Zile</label>
                          <input
                            type="number"
                            className="form-control"
                            value={intervalInput.days}
                            onChange={e => setIntervalInput({ ...intervalInput, days: e.target.value })}
                            placeholder="Ex: 3"
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label text-light">Preț (€/zi)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={intervalInput.price}
                            onChange={e => setIntervalInput({ ...intervalInput, price: e.target.value })}
                            placeholder="Ex: 100"
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          />
                        </div>
                        <div className="col-md-4">
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                              setIntervalError('');
                              if (!intervalInput.days || !intervalInput.price) {
                                setIntervalError('Completează ambele câmpuri pentru interval!');
                                return;
                              }
                              if (Number(intervalInput.days) <= 0 || Number(intervalInput.price) <= 0) {
                                setIntervalError('Valorile trebuie să fie pozitive!');
                                return;
                              }
                              setConfirmedIntervals([...confirmedIntervals, { ...intervalInput }]);
                              setIntervalInput({ days: '', price: '' });
                            }}
                          >
                            Confirmă interval
                          </button>
                        </div>
                      </div>
                      {intervalError && <div className="text-danger mb-2">{intervalError}</div>}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="col-12">
                  <div className="d-flex justify-content-end gap-3">
                    <a href="/admin/rentals/list" className="btn btn-secondary">
                      Anulează
                    </a>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Se salvează...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-2"></i>
                          Salvează modificările
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
} 