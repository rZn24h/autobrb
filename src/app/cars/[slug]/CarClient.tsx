"use client";

import { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaRoad, FaGasPump, FaCog, FaCar, FaTachometerAlt, FaWhatsapp, FaPhone } from 'react-icons/fa';
import { useConfig } from '@/hooks/useConfig';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CarDetails {
  id: string;
  title: string;
  marca: string;
  model: string;
  an: number;
  pret: number;
  km: number;
  combustibil: string;
  transmisie: string;
  caroserie: string;
  capacitate: string;
  putere?: string;
  tractiune?: string;
  linkExtern?: string;
  descriere: string;
  dotari?: string;
  images: string[];
  coverImage?: string;
  contact?: string;
  locatie?: string;
}

export default function CarClient({ car }: { car: CarDetails }) {
  const { config } = useConfig();
  const router = useRouter();
  const images: string[] = car.images || [];
  const [activeImage, setActiveImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  const handleImageClick = (index: number) => {
    setActiveImage(index);
    setShowLightbox(true);
  };

  const formattedPrice = new Intl.NumberFormat('ro-RO').format(car.pret);
  const whatsappMsg = encodeURIComponent(`Salut! Sunt interesat de anunțul cu ${car.marca} ${car.model}.`);
  const whatsappLink = config?.whatsapp ? `https://wa.me/${config.whatsapp.replace(/\D/g, '')}` : '';

  return (
    <div className="car-details-page" style={{ backgroundColor: 'var(--background-main)' }}>
      {/* Back button */}
      <div className="container mt-3 mt-md-4">
        <Link href="/" className="btn btn-outline-danger">
          <i className="bi bi-arrow-left me-2"></i>
          Înapoi la lista de mașini
        </Link>
      </div>

      {/* Main content */}
      <div className="container mt-3 mt-md-4">
        <div className="row g-3 g-md-4">
          {/* Left column - Images */}
          <div className="col-lg-8">
            {/* Main image container */}
            <div className="card border-0 shadow-sm mb-3 mb-md-4" style={{ backgroundColor: 'var(--gray-900)', border: '1px solid var(--gray-800)' }}>
              <div className="card-body p-0">
                <div className="position-relative">
                  {/* Main image */}
                  <div className="position-relative" style={{ height: '400px', backgroundColor: 'var(--gray-900)' }}>
                    <img
                      src={car.images[activeImage]}
                      alt={`${car.marca} ${car.model}`}
                      className="img-fluid w-100 h-100"
                      style={{ 
                        objectFit: 'contain',
                        padding: '1rem',
                        cursor: 'zoom-in'
                      }}
                      onClick={() => setShowLightbox(true)}
                    />
                    
                    {/* Navigation arrows */}
                    {car.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImage(prev => (prev === 0 ? car.images.length - 1 : prev - 1))}
                          className="btn btn-dark position-absolute top-50 start-0 translate-middle-y ms-2 ms-md-3 rounded-circle d-none d-sm-flex"
                          style={{ width: '40px', height: '40px', padding: 0, zIndex: 10 }}
                        >
                          <i className="bi bi-chevron-left"></i>
                        </button>
                        <button
                          onClick={() => setActiveImage(prev => (prev === car.images.length - 1 ? 0 : prev + 1))}
                          className="btn btn-dark position-absolute top-50 end-0 translate-middle-y me-2 me-md-3 rounded-circle d-none d-sm-flex"
                          style={{ width: '40px', height: '40px', padding: 0, zIndex: 10 }}
                        >
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </>
                    )}

                    {/* Zoom indicator */}
                    <div className="position-absolute top-0 end-0 m-3">
                      <button 
                        className="btn btn-dark rounded-circle"
                        style={{ width: '40px', height: '40px', padding: 0 }}
                        onClick={() => setShowLightbox(true)}
                      >
                        <i className="bi bi-zoom-in"></i>
                      </button>
                    </div>

                    {/* Image counter */}
                    <div className="position-absolute bottom-0 start-0 end-0 p-2 p-md-3" style={{ 
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
                    }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <h1 className="h4 h3-md mb-0 text-white">
                          {car.marca} {car.model}
                          <span className="ms-2 opacity-75">{car.an}</span>
                        </h1>
                        <span className="badge bg-dark text-white">
                          {activeImage + 1} / {car.images.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnails strip */}
                  {car.images.length > 1 && (
                    <div className="border-top" style={{ borderColor: 'var(--gray-700)' }}>
                      <div className="d-flex gap-1 gap-md-2 p-1 p-md-2 overflow-auto" style={{ 
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--gray-700) var(--gray-800)'
                      }}>
                        {car.images.map((image, index) => (
                          <div 
                            key={index}
                            className="thumbnail-container position-relative"
                            style={{ 
                              cursor: 'pointer',
                              border: activeImage === index ? '2px solid var(--danger-color)' : '2px solid transparent',
                              borderRadius: '0.375rem',
                              overflow: 'hidden',
                              flex: '0 0 auto',
                              width: '80px',
                              height: '60px'
                            }}
                            onClick={() => setActiveImage(index)}
                          >
                            <img
                              src={image}
                              alt={`${car.marca} ${car.model} - Imagine ${index + 1}`}
                              className="img-fluid h-100 w-100"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card border-0 shadow-sm mb-3 mb-md-4" style={{ backgroundColor: 'var(--gray-900)', border: '1px solid var(--gray-800)' }}>
              <div className="card-body p-3 p-md-4">
                <h3 className="h5 mb-3 mb-md-4 text-light">📝 Descriere</h3>
                <div className="description text-light" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                  {car.descriere.split('\n').map((line: string, idx: number) => (
                    <p key={idx} className="mb-2 mb-md-3">{line}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Features */}
            {car.dotari && (
              <div className="card border-0 shadow-sm mb-3 mb-md-4" style={{ backgroundColor: 'var(--gray-900)', border: '1px solid var(--gray-800)' }}>
                <div className="card-body p-3 p-md-4">
                  <h3 className="h5 mb-3 mb-md-4 text-light">✨ Dotări</h3>
                  <div className="row g-2 g-md-3">
                    {car.dotari.split('\n').map((feature: string, idx: number) => {
                      const clean = feature.trim();
                      if (!clean) return null;
                      return (
                        <div key={idx} className="col-12 col-md-6 col-lg-4">
                          <div className="d-flex align-items-center text-light">
                            <i className="bi bi-check2 text-success me-2"></i>
                            {clean}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column - Technical details and contact */}
          <div className="col-lg-4">
            {/* Price and contact */}
            <div className="card border-0 shadow-sm mb-3 mb-md-4" style={{ backgroundColor: 'var(--gray-900)', border: '1px solid var(--gray-800)' }}>
              <div className="card-body p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4">
                  <h3 className="h4 h3-md mb-0 text-light">Preț</h3>
                  <span className="h3 h2-md mb-0 text-danger">
                    {formattedPrice} €
                  </span>
                </div>

                {/* Quick specs */}
                <div className="row g-2 text-center mb-3 mb-md-4">
                  <div className="col-4">
                    <div className="p-2 rounded-3" style={{ backgroundColor: 'var(--gray-700)' }}>
                      <i className="bi bi-speedometer2 text-danger mb-1"></i>
                      <div className="small text-light" style={{ fontSize: '0.75rem' }}>Kilometraj</div>
                      <div className="fw-bold text-light" style={{ fontSize: '0.85rem' }}>{new Intl.NumberFormat('ro-RO').format(car.km)} km</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 rounded-3" style={{ backgroundColor: 'var(--gray-700)' }}>
                      <i className="bi bi-fuel-pump text-danger mb-1"></i>
                      <div className="small text-light" style={{ fontSize: '0.75rem' }}>Combustibil</div>
                      <div className="fw-bold text-light" style={{ fontSize: '0.85rem' }}>{car.combustibil}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 rounded-3" style={{ backgroundColor: 'var(--gray-700)' }}>
                      <i className="bi bi-gear text-danger mb-1"></i>
                      <div className="small text-light" style={{ fontSize: '0.75rem' }}>Transmisie</div>
                      <div className="fw-bold text-light" style={{ fontSize: '0.85rem' }}>{car.transmisie}</div>
                    </div>
                  </div>
                </div>

                {/* Contact buttons */}
                {config?.whatsapp && (
                  <div className="d-grid gap-2 mb-3 mb-md-4">
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success btn-lg d-flex align-items-center justify-content-center gap-2"
                    >
                      <i className="bi bi-whatsapp"></i> Contactează-ne pe WhatsApp
                    </a>
                    <a
                      href={`tel:${config.whatsapp}`}
                      className="btn btn-outline-danger btn-lg d-flex align-items-center justify-content-center gap-2"
                    >
                      <i className="bi bi-telephone"></i> Sună-ne acum
                    </a>
                  </div>
                )}

                {/* Location and contact info */}
                <div className="text-light">
                  {car.locatie && (
                    <p className="mb-2">
                      <i className="bi bi-geo-alt me-2 text-danger"></i>
                      Locație: {car.locatie}
                    </p>
                  )}
                  {car.contact && (
                    <p className="mb-0">
                      <i className="bi bi-person me-2 text-danger"></i>
                      Contact: {car.contact}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Technical details */}
            <div className="card border-0 shadow-sm mb-3 mb-md-4" style={{ backgroundColor: 'var(--gray-900)', border: '1px solid var(--gray-800)' }}>
              <div className="card-body p-3 p-md-4">
                <h3 className="h5 mb-3 mb-md-4 text-light">
                  <i className="bi bi-wrench-adjustable text-light me-2"></i>Detalii tehnice
                </h3>
                <ul className="list-unstyled mb-0">
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <i className="bi bi-car-front text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }}></i>
                    <span className="text-light" style={{ fontSize: '1.05rem' }}>{car.marca} {car.model}</span>
                  </li>
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <i className="bi bi-calendar text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }}></i>
                    <span className="text-light" style={{ fontSize: '1.05rem' }}>{car.an}</span>
                  </li>
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <i className="bi bi-speedometer2 text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }}></i>
                    <span className="text-light" style={{ fontSize: '1.05rem' }}>{new Intl.NumberFormat('ro-RO').format(car.km)} km</span>
                  </li>
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <i className="bi bi-car-front-fill text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }}></i>
                    <span className="text-light" style={{ fontSize: '1.05rem' }}>{car.caroserie}</span>
                  </li>
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <i className="bi bi-fuel-pump text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }}></i>
                    <span className="text-light" style={{ fontSize: '1.05rem' }}>{car.combustibil}</span>
                  </li>
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <i className="bi bi-gear text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }}></i>
                    <span className="text-light" style={{ fontSize: '1.05rem' }}>{car.transmisie}</span>
                  </li>
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <i className="bi bi-droplet text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }}></i>
                    <span className="text-light" style={{ fontSize: '1.05rem' }}>{car.capacitate} cm³</span>
                  </li>
                  {car.putere && (
                    <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                      <i className="bi bi-lightning text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }}></i>
                      <span className="text-light" style={{ fontSize: '1.05rem' }}>{car.putere} CP</span>
                    </li>
                  )}
                  {car.tractiune && (
                    <li className="d-flex align-items-center py-2">
                      <i className="bi bi-diagram-3 text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }}></i>
                      <span className="text-light" style={{ fontSize: '1.05rem' }}>{car.tractiune}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* External link button */}
            {car.linkExtern && (
              <div className="card border-0 shadow-sm" style={{ backgroundColor: 'var(--gray-900)', border: '1px solid var(--gray-800)' }}>
                <div className="card-body p-3 p-md-4">
                  <a 
                    href={car.linkExtern} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-outline-danger w-100"
                  >
                    <i className="bi bi-box-arrow-up-right me-2"></i>
                    Vezi anunțul și pe OLX/Autovit
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div 
          className="lightbox position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 1050
          }}
          onClick={() => setShowLightbox(false)}
        >
          <div className="position-relative" style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={car.images[activeImage]}
              alt={`${car.marca} ${car.model}`}
              className="img-fluid"
              style={{ maxHeight: '90vh', objectFit: 'contain' }}
            />
            <button 
              className="btn btn-danger position-absolute top-0 end-0 m-3"
              onClick={() => setShowLightbox(false)}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 