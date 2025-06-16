'use client';

import { useState } from 'react';
import { useConfig } from '@/hooks/useConfig';

export default function ContactPage() {
  const { config } = useConfig();
  const [formData, setFormData] = useState({
    nume: '',
    email: '',
    mesaj: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic would go here
    alert('Formularul a fost trimis cu succes!');
    setFormData({ nume: '', email: '', mesaj: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="display-4 text-center mb-5">Contact</h1>

          <div className="row g-4">
            {/* Contact Information */}
            <div className="col-md-6">
              <div className="card shadow-sm h-100" style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)' }}>
                <div className="card-body p-4">
                  <h2 className="h4 mb-4 text-light">Informații contact</h2>
                  
                  <div className="mb-4">
                    <h3 className="h6 mb-2 text-light">Adresă</h3>
                    <p className="mb-0 text-light">{config?.locatie || 'București, România'}</p>
                  </div>

                  <div className="mb-4">
                    <h3 className="h6 mb-2 text-light">Telefon</h3>
                    <p className="mb-0 text-light">
                      <a href={`tel:${config?.whatsapp || '0722000000'}`} className="text-decoration-none text-light">
                        {config?.whatsapp || '0722 000 000'}
                      </a>
                    </p>
                  </div>

                  <div className="mb-4">
                    <h3 className="h6 mb-2 text-light">Email</h3>
                    <p className="mb-0 text-light">
                      <a href="mailto:contact@autod.ro" className="text-decoration-none text-light">
                        contact@autod.ro
                      </a>
                    </p>
                  </div>

                  <div className="mb-4">
                    <h3 className="h6 mb-2 text-light">Program</h3>
                    <p className="mb-0 text-light">Luni - Vineri: 09:00 - 18:00</p>
                    <p className="mb-0 text-light">Sâmbătă: 10:00 - 14:00</p>
                    <p className="mb-0 text-light">Duminică: Închis</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="col-md-6">
              <div className="card shadow-sm h-100" style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)' }}>
                <div className="card-body p-4">
                  <h2 className="h4 mb-4 text-light">Formular contact</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="nume" className="form-label text-light">Nume complet</label>
                      <input
                        type="text"
                        className="form-control"
                        id="nume"
                        name="nume"
                        value={formData.nume}
                        onChange={handleChange}
                        required
                        style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)', color: 'var(--light-color)' }}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label text-light">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)', color: 'var(--light-color)' }}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="mesaj" className="form-label text-light">Mesaj</label>
                      <textarea
                        className="form-control"
                        id="mesaj"
                        name="mesaj"
                        rows={4}
                        value={formData.mesaj}
                        onChange={handleChange}
                        required
                        style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)', color: 'var(--light-color)' }}
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                      Trimite mesaj
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps Embed */}
          <div className="mt-5">
            <div className="card shadow-sm">
              <div className="card-body p-0">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2848.899790399046!2d26.1024!3d44.4268!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDTCsDI1JzM2LjUiTiAyNsKwMDYnMDguNiJF!5e0!3m2!1sen!2sro!4v1635000000000!5m2!1sen!2sro"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 