"use client";

import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaRoad, FaGasPump, FaCog, FaCar, FaTachometerAlt, FaWhatsapp, FaPhone } from 'react-icons/fa';
import { useConfig } from '@/hooks/useConfig';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RentalDetails {
  id: string;
  title: string;
  marca: string;
  model: string;
  an: number;
  pret: string; // Preț în format text (ex: "400 €/zi")
  km: number;
  combustibil: string;
  transmisie: string;
  caroserie: string;
  capacitate: string;
  putere?: string;
  tractiune?: string;
  descriere: string;
  dotari?: string;
  images: string[];
  coverImage?: string;
  contact?: string;
  locatie?: string;
}

export default function RentalClient({ rental }: { rental: RentalDetails }) {
  const { config } = useConfig();
  const router = useRouter();
  const images: string[] = rental.images || [];
  const [activeImage, setActiveImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  const handleImageClick = (index: number) => {
    setActiveImage(index);
    setShowLightbox(true);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showLightbox) return;
      
      switch (e.key) {
        case 'Escape':
          setShowLightbox(false);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setActiveImage(prev => (prev === 0 ? images.length - 1 : prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setActiveImage(prev => (prev === images.length - 1 ? 0 : prev + 1));
          break;
      }
    };

    if (showLightbox) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showLightbox, images.length]);

  const nextImage = () => {
    setActiveImage(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setActiveImage(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const whatsappMsg = encodeURIComponent(`Salut! Sunt interesat de închirierea ${rental.marca} ${rental.model} la prețul de ${rental.pret}.`);
  const whatsappLink = config?.whatsapp ? `https://wa.me/${config.whatsapp.replace(/\D/g, '')}?text=${whatsappMsg}` : '';

  return (
    <div className="car-details-page" style={{ backgroundColor: 'var(--background-main)' }}>
      <style jsx>{`
        .price-list-container {
          text-align: center;
        }
        
        .price-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .price-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: linear-gradient(135deg, var(--gray-800) 0%, var(--gray-700) 100%);
          border: 1px solid var(--gray-600);
          border-radius: 0.75rem;
          transition: all 0.3s ease;
        }
        
        .price-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border-color: var(--danger-color);
        }
        
        .price-days {
          display: flex;
          align-items: center;
          font-size: 1rem;
          font-weight: 500;
        }
        
        .price-amount {
          text-align: right;
        }
        
        .price-amount .text-danger {
          font-size: 1.5rem;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .single-price {
          text-align: center;
        }
        
        .single-price .text-danger {
          font-size: 2rem;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        @media (max-width: 768px) {
          .price-item {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }
          
          .price-amount {
            text-align: center;
          }
        }
      `}</style>
      
      {/* Back button */}
      <div className="container mt-3 mt-md-4">
        <Link href="/rentals" className="btn btn-outline-danger">
          <i className="bi bi-arrow-left me-2"></i>
          Înapoi la lista de închirieri
        </Link>
      </div>

      {/* Main content */}
      <div className="container mt-3 mt-md-4">
        <div className="row g-3 g-md-4">
          {/* Left column - Images and car details */}
          <div className="col-lg-8">
            {/* Main image container */}
            <div className="card border-0 shadow-sm mb-3 mb-md-4" style={{ backgroundColor: 'var(--gray-900)', border: '1px solid var(--gray-800)' }}>
              <div className="card-body p-0">
                <div className="position-relative">
                  {/* Main image */}
                  <div className="position-relative" style={{ height: '500px', backgroundColor: 'var(--gray-900)' }}>
                    <img
                      src={rental.images[activeImage]}
                      alt={`${rental.marca} ${rental.model}`}
                      className="img-fluid w-100 h-100"
                      style={{ 
                        objectFit: 'contain',
                        padding: '1rem',
                        cursor: 'pointer'
                      }}
                      onClick={() => setShowLightbox(true)}
                    />
                    
                    {/* Navigation arrows */}
                    {rental.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImage(prev => (prev === 0 ? rental.images.length - 1 : prev - 1))}
                          className="btn btn-dark position-absolute top-50 start-0 translate-middle-y ms-2 ms-md-3 rounded-circle d-none d-sm-flex"
                          style={{ width: '40px', height: '40px', padding: 0, zIndex: 10 }}
                        >
                          <i className="bi bi-chevron-left"></i>
                        </button>
                        <button
                          onClick={() => setActiveImage(prev => (prev === rental.images.length - 1 ? 0 : prev + 1))}
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
                        title="Mărește imaginea"
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
                          {rental.marca} {rental.model}
                          <span className="ms-2 opacity-75">{rental.an}</span>
                        </h1>
                        <span className="badge bg-dark text-white">
                          {activeImage + 1} / {rental.images.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnails strip */}
                  {rental.images.length > 1 && (
                    <div className="border-top" style={{ borderColor: 'var(--gray-700)' }}>
                      <div className="d-flex gap-1 gap-md-2 p-1 p-md-2 overflow-auto" style={{ 
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--gray-700) var(--gray-800)'
                      }}>
                        {rental.images.map((image, index) => (
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
                              alt={`${rental.marca} ${rental.model} - Imagine ${index + 1}`}
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
            {/* Car details card - moved here, full width */}
            <div className="card border-0 shadow-sm mb-3 mb-md-4" style={{ backgroundColor: 'var(--gray-900)', border: '1px solid var(--gray-800)' }}>
              <div className="card-body">
                <h3 className="h5 text-light mb-3">Detalii mașină</h3>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <FaCar className="text-danger me-2" />
                      <div>
                        <small className="text-light opacity-75 d-block">Marcă</small>
                        <span className="text-light">{rental.marca}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <FaCar className="text-danger me-2" />
                      <div>
                        <small className="text-light opacity-75 d-block">Model</small>
                        <span className="text-light">{rental.model}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <FaTachometerAlt className="text-danger me-2" />
                      <div>
                        <small className="text-light opacity-75 d-block">An</small>
                        <span className="text-light">{rental.an}</span>
                      </div>
                    </div>
                  </div>

                  {/* Kilometraj - hide if not present */}
                  {rental.km ? (
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <FaRoad className="text-danger me-2" />
                        <div>
                          <small className="text-light opacity-75 d-block">Kilometraj</small>
                          <span className="text-light">{new Intl.NumberFormat('ro-RO').format(rental.km)} km</span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <FaGasPump className="text-danger me-2" />
                      <div>
                        <small className="text-light opacity-75 d-block">Combustibil</small>
                        <span className="text-light">{rental.combustibil}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <FaCog className="text-danger me-2" />
                      <div>
                        <small className="text-light opacity-75 d-block">Transmisie</small>
                        <span className="text-light">{rental.transmisie}</span>
                      </div>
                    </div>
                  </div>

                  {rental.caroserie && (
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <FaCar className="text-danger me-2" />
                        <div>
                          <small className="text-light opacity-75 d-block">Caroserie</small>
                          <span className="text-light">{rental.caroserie}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {rental.capacitate && (
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <FaCog className="text-danger me-2" />
                        <div>
                          <small className="text-light opacity-75 d-block">Capacitate</small>
                          <span className="text-light">{rental.capacitate} cm³</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {rental.putere && (
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <FaTachometerAlt className="text-danger me-2" />
                        <div>
                          <small className="text-light opacity-75 d-block">Putere</small>
                          <span className="text-light">{rental.putere} CP</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Right column - Price and contact only */}
          <div className="col-lg-4">
            {/* Price and contact card */}
            <div className="card border-0 shadow-sm mb-3 mb-md-4" style={{ backgroundColor: 'var(--gray-900)', border: '1px solid var(--gray-800)' }}>
              <div className="card-body">
                <div className="text-center mb-4">
                  {/* Price intervals list, styled */}
                  {rental.pret && rental.pret.includes(':') ? (
                    <div className="price-list-container">
                      <h3 className="h5 text-light mb-3">Tarife închiriere</h3>
                      <div className="price-list">
                        {rental.pret.split(',').map((interval, idx) => {
                          const trimmedInterval = interval.trim();
                          const match = trimmedInterval.match(/(\d+)\s*zile:\s*(\d+)\s*€\/zi/);
                          
                          if (match) {
                            const days = match[1];
                            const price = match[2];
                            return (
                              <div key={idx} className="price-item">
                                <div className="price-days">
                                  <i className="bi bi-calendar-check text-danger me-2"></i>
                                  <span className="text-light">{days} zile</span>
                                </div>
                                <div className="price-amount">
                                  <span className="text-danger fw-bold fs-5">{price} €</span>
                                  <small className="text-light opacity-75 d-block">pe zi</small>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div key={idx} className="price-item">
                                <div className="price-amount">
                                  <span className="text-danger fw-bold fs-5">{trimmedInterval}</span>
                                </div>
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="single-price">
                      <h2 className="h3 text-danger fw-bold mb-2">{rental.pret}</h2>
                      <p className="text-light opacity-75 mb-0">Preț închiriere</p>
                    </div>
                  )}
                </div>

                {/* Location information */}
                {config?.locatie && (
                  <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'var(--gray-800)' }}>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                      <div>
                        <small className="text-light opacity-75 d-block">Locație</small>
                        <span className="text-light">{config.locatie}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* WhatsApp Contact Button */}
                {whatsappLink && (
                  <a 
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success w-100 mb-3 d-flex align-items-center justify-content-center"
                    style={{ fontSize: '1.1rem' }}
                  >
                    <FaWhatsapp className="me-2" />
                    Contact pe WhatsApp
                  </a>
                )}
                {/* Phone Contact - always show if config.phone exists */}
                {config?.whatsapp && (
                  <a 
                    href={`tel:${config.whatsapp}`}
                    className="btn btn-danger w-100 d-flex align-items-center justify-content-center mb-2"
                    style={{ fontSize: '1.1rem' }}
                  >
                    <FaPhone className="me-2" />
                    Sună: {config.whatsapp}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {rental.descriere && (
          <div className="row mt-4">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm" style={{ backgroundColor: 'var(--gray-900)', border: '1px solid var(--gray-800)' }}>
                <div className="card-body">
                  <h3 className="h5 text-light mb-3">Descriere</h3>
                  <div className="text-light" style={{ lineHeight: '1.6' }}>
                    {rental.descriere.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-2">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        {rental.dotari && (
          <div className="row mt-4">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm" style={{ backgroundColor: 'var(--gray-900)', border: '1px solid var(--gray-800)' }}>
                <div className="card-body">
                  <h3 className="h5 text-light mb-3">Dotări</h3>
                  <div className="text-light" style={{ lineHeight: '1.6' }}>
                    {rental.dotari.split('\n').map((dotare, index) => (
                      <p key={index} className="mb-1">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        {dotare}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div 
          className="lightbox-overlay"
          onClick={() => setShowLightbox(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div className="position-relative" style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={rental.images[activeImage]}
              alt={`${rental.marca} ${rental.model}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
            
            {/* Close button */}
            <button
              onClick={() => setShowLightbox(false)}
              className="btn btn-dark position-absolute top-0 end-0 m-3 rounded-circle"
              style={{ width: '40px', height: '40px', padding: 0 }}
            >
              <i className="bi bi-x-lg"></i>
            </button>

            {/* Navigation arrows */}
            {rental.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="btn btn-dark position-absolute top-50 start-0 translate-middle-y ms-3 rounded-circle"
                  style={{ width: '50px', height: '50px', padding: 0 }}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="btn btn-dark position-absolute top-50 end-0 translate-middle-y me-3 rounded-circle"
                  style={{ width: '50px', height: '50px', padding: 0 }}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </>
            )}

            {/* Image counter */}
            <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3">
              <span className="badge bg-dark text-white px-3 py-2">
                {activeImage + 1} / {rental.images.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 