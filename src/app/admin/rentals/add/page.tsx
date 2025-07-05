"use client";

import { useState, useRef } from 'react';
import { addRental } from '../../../../utils/apiRentals';
import { useAuth } from '@/contexts/AuthContext';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminNavbar from '@/components/AdminNavbar';
import { BrandSelector } from '@/components/BrandSelector';

const REGISTER_SECRET = process.env.NEXT_PUBLIC_REGISTER_SECRET || 'adminSecret2025';

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

const initialFormState = {
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
};

export default function AddRentalPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialFormState);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  const [intervalInput, setIntervalInput] = useState({ days: '', price: '' });
  const [confirmedIntervals, setConfirmedIntervals] = useState<PricingInterval[]>([]);
  const [intervalError, setIntervalError] = useState<string>('');

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

    // Images validation
    if (images.length === 0) {
      newErrors.images = 'Trebuie să selectezi cel puțin o imagine';
      isValid = false;
    } else if (images.length > 12) {
      newErrors.images = 'Poți selecta maxim 12 imagini';
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
      if (files.length > 12) {
        setErrors(prev => ({ ...prev, images: 'Poți selecta maxim 12 imagini' }));
        setImages([]);
        setCoverImageIndex(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setErrors(prev => ({ ...prev, images: undefined }));
        setImages(files);
        setCoverImageIndex(0);
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
    
    if (!window.confirm('Ești sigur că vrei să postezi acest anunț de închiriat?')) {
      return;
    }
    
    setLoading(true);
    try {
      if (!user) {
        throw new Error('Trebuie să fii autentificat pentru a adăuga o închiriere');
      }

      // Format pricing text from intervals
      const pricingText = confirmedIntervals
        .map(interval => `${interval.days} zile: ${interval.price} €/zi`)
        .join(', ');

      const formWithPricing = {
        ...form,
        pret: pricingText || form.pret
      };

      // Add rental with cover image index
      await addRental(formWithPricing, images, user.uid, coverImageIndex);
      
      // Show success message
      setSuccess('✅ Anunțul de închiriat a fost adăugat cu succes!');
      
      // Reset form
      setForm(initialFormState);
      setImages([]);
      setCoverImageIndex(0);
      setConfirmedIntervals([]);
      setIntervalInput({ days: '', price: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Clear success message after 3 seconds and offer navigation
      setTimeout(() => {
        setSuccess('');
        // Offer navigation to list page
        if (window.confirm('Anunțul a fost adăugat cu succes! Vrei să vezi lista de închirieri?')) {
          window.location.href = '/admin/rentals/list';
        }
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Eroare la adăugarea anunțului de închiriat');
      console.error('Error adding rental:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (coverImageIndex >= index && coverImageIndex > 0) {
      setCoverImageIndex(prev => prev - 1);
    }
  };

  const setCoverImage = (index: number) => {
    setCoverImageIndex(index);
  };

  return (
    <AdminAuthGuard>
      <AdminNavbar />
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h3 mb-0 text-dark">Adaugă închiriere</h1>
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
                            disabled={loading}
                          />
                        </div>

                        <div className="col-md-3">
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

                        <div className="col-md-3">
                          <label htmlFor="an" className="form-label text-light">An fabricație *</label>
                          <input
                            type="number"
                            className={`form-control ${errors.an ? 'is-invalid' : ''}`}
                            id="an"
                            name="an"
                            value={form.an}
                            onChange={handleChange}
                            placeholder="Ex: 2020"
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          />
                          {errors.an && <div className="invalid-feedback">{errors.an}</div>}
                        </div>

                        <div className="col-md-3">
                          <label htmlFor="km" className="form-label text-light">Kilometraj</label>
                          <input
                            type="number"
                            className={`form-control ${errors.km ? 'is-invalid' : ''}`}
                            id="km"
                            name="km"
                            value={form.km}
                            onChange={handleChange}
                            placeholder="Ex: 50000"
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          />
                          {errors.km && <div className="invalid-feedback">{errors.km}</div>}
                        </div>

                        <div className="col-md-3">
                          <label htmlFor="caroserie" className="form-label text-light">Caroserie</label>
                          <select
                            className={`form-select ${errors.caroserie ? 'is-invalid' : ''}`}
                            id="caroserie"
                            name="caroserie"
                            value={form.caroserie}
                            onChange={handleChange}
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          >
                            <option value="">Alege caroseria...</option>
                            {caroserieOptions.map(option => (
                              <option key={option.value} value={option.value} style={{ backgroundColor: '#fff', color: '#222' }}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors.caroserie && <div className="invalid-feedback">{errors.caroserie}</div>}
                        </div>

                        <div className="col-md-3">
                          <label htmlFor="combustibil" className="form-label text-light">Combustibil *</label>
                          <select
                            className={`form-select ${errors.combustibil ? 'is-invalid' : ''}`}
                            id="combustibil"
                            name="combustibil"
                            value={form.combustibil}
                            onChange={handleChange}
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          >
                            <option value="">Alege combustibilul...</option>
                            <option value="Benzină" style={{ backgroundColor: '#fff', color: '#222' }}>Benzină</option>
                            <option value="Motorină" style={{ backgroundColor: '#fff', color: '#222' }}>Motorină</option>
                            <option value="GPL" style={{ backgroundColor: '#fff', color: '#222' }}>GPL</option>
                            <option value="Electric" style={{ backgroundColor: '#fff', color: '#222' }}>Electric</option>
                            <option value="Hibrid" style={{ backgroundColor: '#fff', color: '#222' }}>Hibrid</option>
                          </select>
                          {errors.combustibil && <div className="invalid-feedback">{errors.combustibil}</div>}
                        </div>

                        <div className="col-md-3">
                          <label htmlFor="transmisie" className="form-label text-light">Transmisie *</label>
                          <select
                            className={`form-select ${errors.transmisie ? 'is-invalid' : ''}`}
                            id="transmisie"
                            name="transmisie"
                            value={form.transmisie}
                            onChange={handleChange}
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          >
                            <option value="">Alege transmisia...</option>
                            <option value="Manuală" style={{ backgroundColor: '#fff', color: '#222' }}>Manuală</option>
                            <option value="Automată" style={{ backgroundColor: '#fff', color: '#222' }}>Automată</option>
                          </select>
                          {errors.transmisie && <div className="invalid-feedback">{errors.transmisie}</div>}
                        </div>

                        <div className="col-md-3">
                          <label htmlFor="capacitate" className="form-label text-light">Capacitate (cm³) *</label>
                          <input
                            type="number"
                            className={`form-control ${errors.capacitate ? 'is-invalid' : ''}`}
                            id="capacitate"
                            name="capacitate"
                            value={form.capacitate}
                            onChange={handleChange}
                            placeholder="Ex: 1995"
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          />
                          {errors.capacitate && <div className="invalid-feedback">{errors.capacitate}</div>}
                        </div>

                        <div className="col-md-3">
                          <label htmlFor="putere" className="form-label text-light">Putere (CP)</label>
                          <input
                            type="number"
                            className={`form-control ${errors.putere ? 'is-invalid' : ''}`}
                            id="putere"
                            name="putere"
                            value={form.putere}
                            onChange={handleChange}
                            placeholder="Ex: 190"
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          />
                          {errors.putere && <div className="invalid-feedback">{errors.putere}</div>}
                        </div>

                        <div className="col-md-3">
                          <label htmlFor="tractiune" className="form-label text-light">Tracțiune</label>
                          <select
                            className={`form-select ${errors.tractiune ? 'is-invalid' : ''}`}
                            id="tractiune"
                            name="tractiune"
                            value={form.tractiune}
                            onChange={handleChange}
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          >
                            <option value="">Alege tracțiunea...</option>
                            <option value="4x4" style={{ backgroundColor: '#fff', color: '#222' }}>4x4</option>
                            <option value="Față" style={{ backgroundColor: '#fff', color: '#222' }}>Față</option>
                            <option value="Spate" style={{ backgroundColor: '#fff', color: '#222' }}>Spate</option>
                          </select>
                          {errors.tractiune && <div className="invalid-feedback">{errors.tractiune}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Intervals */}
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

                {/* Description */}
                <div className="col-12">
                  <div className="card" style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)' }}>
                    <div className="card-header" style={{ backgroundColor: 'var(--gray-700)', borderBottom: '1px solid var(--gray-600)' }}>
                      <h5 className="mb-0 text-light">Descriere</h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label htmlFor="descriere" className="form-label text-light">Descriere *</label>
                        <textarea
                          className={`form-control ${errors.descriere ? 'is-invalid' : ''}`}
                          id="descriere"
                          name="descriere"
                          value={form.descriere}
                          onChange={handleChange}
                          rows={4}
                          placeholder="Descriere detaliată a mașinii..."
                          style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                        />
                        {errors.descriere && <div className="invalid-feedback">{errors.descriere}</div>}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="dotari" className="form-label text-light">Dotări</label>
                        <textarea
                          className={`form-control ${errors.dotari ? 'is-invalid' : ''}`}
                          id="dotari"
                          name="dotari"
                          value={form.dotari}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Lista de dotări, separate prin virgulă..."
                          style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                        />
                        {errors.dotari && <div className="invalid-feedback">{errors.dotari}</div>}
                      </div>

                      <div className="row g-3">
                        <div className="col-md-6">
                          <label htmlFor="contact" className="form-label text-light">Contact</label>
                          <input
                            type="text"
                            className={`form-control ${errors.contact ? 'is-invalid' : ''}`}
                            id="contact"
                            name="contact"
                            value={form.contact}
                            onChange={handleChange}
                            placeholder="Ex: 0722 000 000"
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          />
                          {errors.contact && <div className="invalid-feedback">{errors.contact}</div>}
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="locatie" className="form-label text-light">Locație</label>
                          <input
                            type="text"
                            className={`form-control ${errors.locatie ? 'is-invalid' : ''}`}
                            id="locatie"
                            name="locatie"
                            value={form.locatie}
                            onChange={handleChange}
                            placeholder="Ex: Suceava"
                            style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                          />
                          {errors.locatie && <div className="invalid-feedback">{errors.locatie}</div>}
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
                      <div className="mb-3">
                        <label htmlFor="images" className="form-label text-light">Selectează imagini (1-12) *</label>
                        <input
                          type="file"
                          className={`form-control ${errors.images ? 'is-invalid' : ''}`}
                          id="images"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                          style={{ backgroundColor: '#fff', color: '#222', border: '1px solid #ced4da' }}
                        />
                        {errors.images && <div className="invalid-feedback">{errors.images}</div>}
                      </div>

                      {images.length > 0 && (
                        <div className="row g-3">
                          {images.map((image, index) => (
                            <div key={index} className="col-md-3 col-sm-4 col-6">
                              <div className="position-relative">
                                <img
                                  src={URL.createObjectURL(image)}
                                  alt={`Preview ${index + 1}`}
                                  className="img-fluid rounded"
                                  style={{ 
                                    width: '100%', 
                                    height: '150px', 
                                    objectFit: 'cover',
                                    border: coverImageIndex === index ? '3px solid #0d6efd' : '1px solid var(--gray-600)'
                                  }}
                                />
                                <div className="position-absolute top-0 end-0 m-2">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    onClick={() => removeImage(index)}
                                  >
                                    <i className="bi bi-x"></i>
                                  </button>
                                </div>
                                <div className="text-center mt-2">
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${coverImageIndex === index ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setCoverImage(index)}
                                  >
                                    {coverImageIndex === index ? 'Imagine principală' : 'Setează ca principală'}
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

                {/* Submit Button */}
                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Se salvează...
                      </>
                    ) : (
                      'Adaugă închiriere'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
} 