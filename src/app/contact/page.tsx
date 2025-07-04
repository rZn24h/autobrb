'use client';

import { useState } from 'react';
import { useConfig } from '@/hooks/useConfig';

function formatPhone(phone: string) {
  if (!phone) return '';
  // Extrage doar cifrele
  const digits = phone.replace(/\D/g, '');
  // Dacă deja începe cu 40, nu adăuga încă un +40
  let formatted = digits.startsWith('40') ? digits : '40' + digits.replace(/^0/, '');
  // Format: +40 0XXX XXX XXX sau +40 7XX XXX XXX
  if (formatted.length === 11) {
    return `+${formatted.slice(0,2)} 0${formatted.slice(2,5)} ${formatted.slice(5,8)} ${formatted.slice(8)}`;
  } else if (formatted.length === 12) {
    return `+${formatted.slice(0,2)} ${formatted.slice(2,5)} ${formatted.slice(5,8)} ${formatted.slice(8)}`;
  }
  return phone;
}

export default function ContactPage() {
  const { config } = useConfig();
  const [formData, setFormData] = useState({
    nume: '',
    email: '',
    mesaj: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  const mapLat = config?.mapLat || '47.734478';
  const mapLng = config?.mapLng || '26.666963';
  const googleMapsUrl = `https://www.google.com/maps?q=${mapLat},${mapLng}`;
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${mapLat},${mapLng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <>
      <style jsx>{`
        .map-container {
          position: relative;
          overflow: hidden;
          border-radius: var(--bs-card-border-radius);
        }
        .map-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          transition: opacity 0.3s ease;
          pointer-events: none; /* Allows click to go through to the link */
          opacity: 1;
        }
        .map-container:hover .map-overlay {
          opacity: 0;
        }
        .map-overlay i {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .contact-info-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        .contact-info-item i {
          font-size: 1.25rem;
          margin-top: 0.25rem;
          color: var(--bs-primary);
        }
      `}</style>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <h1 className="display-4 text-center mb-5">Contact</h1>

            <div className="row g-4">
              <div className="col-lg-5">
                <div className="card shadow-sm h-100">
                  <div className="card-body p-4">
                    <h2 className="h4 mb-4">Informații contact</h2>
                    
                    <div className="mb-3 contact-info-item">
                      <i className="bi bi-geo-alt-fill"></i>
                      <div>
                        <h3 className="h6 mb-1">Adresă</h3>
                        <p className="mb-0 text-muted">{config?.locatie || 'București, România'}</p>
                      </div>
                    </div>

                    <div className="mb-3 contact-info-item">
                      <i className="bi bi-telephone-fill"></i>
                      <div>
                        <h3 className="h6 mb-1">Telefon</h3>
                        <p className="mb-0 text-muted">
                          <a href={`tel:${config?.whatsapp || '0722000000'}`} className="text-decoration-none">
                            <i className="bi bi-telephone me-2 text-danger"></i>
                            {formatPhone(config?.whatsapp || '0722000000')}
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="mb-3 contact-info-item">
                       <i className="bi bi-envelope-fill"></i>
                       <div>
                         <h3 className="h6 mb-1">Email</h3>
                         <p className="mb-0 text-muted">
                           <a href={`mailto:${config?.contactEmail || 'contact@autobrb.ro'}`} className="text-decoration-none">
                             {config?.contactEmail || 'contact@autobrb.ro'}
                           </a>
                         </p>
                       </div>
                    </div>

                    <div className="contact-info-item">
                      <i className="bi bi-calendar-week-fill"></i>
                      <div>
                        <h3 className="h6 mb-1">Program</h3>
                        <div className="text-muted">
                          {config?.program ? (
                            config.program.split('\\n').map((line: string, index: number) => (
                              <p key={index} className="mb-0">{line}</p>
                            ))
                          ) : (
                            <>
                              <p className="mb-0">Luni - Vineri: 09:00 - 18:00</p>
                              <p className="mb-0">Sâmbătă: 10:00 - 14:00</p>
                              <p className="mb-0">Duminică: Închis</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-7">
                <div className="card shadow-sm h-100">
                  <div className="card-body p-4">
                    <h2 className="h4 mb-4">Formular contact</h2>
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="nume" className="form-label">Nume complet</label>
                        <input
                          type="text"
                          className="form-control"
                          id="nume"
                          name="nume"
                          value={formData.nume}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="mesaj" className="form-label">Mesaj</label>
                        <textarea
                          className="form-control"
                          id="mesaj"
                          name="mesaj"
                          rows={4}
                          value={formData.mesaj}
                          onChange={handleChange}
                          required
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

            <div className="mt-5">
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="map-container d-block">
                <div className="map-overlay">
                  <i className="bi bi-geo-fill"></i>
                  <p className="h5">Click pentru a deschide harta</p>
                </div>
                <iframe
                  src={googleMapsEmbedUrl}
                  width="100%"
                  height="450"
                  style={{ border: 0, borderRadius: 'var(--bs-card-border-radius)', pointerEvents: 'none' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 