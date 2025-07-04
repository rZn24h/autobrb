"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight, FaRoad, FaGasPump, FaCog, FaCar, FaTachometerAlt, FaWhatsapp, FaPhone, FaCalendar, FaBolt } from 'react-icons/fa';
import { useConfig } from '@/hooks/useConfig';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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

        /* Thumbnails responsive */
        .row.g-2.mb-3 {
          display: flex;
          flex-wrap: nowrap;
          overflow-x: auto;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .row.g-2.mb-3 .col-3,
        .row.g-2.mb-3 .col-md-2 {
          flex: 0 0 auto;
          width: 80px;
          max-width: 80px;
        }
        @media (min-width: 768px) {
          .row.g-2.mb-3 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
            overflow-x: unset;
            gap: 0.5rem;
          }
          .row.g-2.mb-3 .col-3,
          .row.g-2.mb-3 .col-md-2 {
            width: 100%;
            max-width: unset;
          }
        }
        .position-relative[style*='cursor: pointer'] {
          border-radius: 10px;
          border: 2px solid transparent;
          transition: border 0.2s;
        }
        .position-relative[style*='cursor: pointer'][data-active='true'] {
          border: 2px solid #dc3545;
          box-shadow: 0 0 0 2px #fff, 0 2px 8px rgba(0,0,0,0.08);
        }
        .main-image-wrapper img {
          max-width: 100%;
          width: 100%;
          height: auto;
          border-radius: 12px;
          cursor: pointer;
        }
        @media (min-width: 768px) {
          .main-image-wrapper img {
            height: 400px;
            object-fit: cover;
          }
        }
        /* Lightbox styles */
        .lightbox {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.95);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
        .lightbox-img {
          max-width: 98vw;
          max-height: 80vh;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        }
        .lightbox-close {
          position: absolute;
          top: 24px;
          right: 32px;
          font-size: 2.2rem;
          color: #fff;
          cursor: pointer;
          z-index: 10001;
        }
        .lightbox-arrows {
          position: absolute;
          top: 50%;
          left: 0; right: 0;
          display: flex;
          justify-content: space-between;
          width: 100vw;
          pointer-events: none;
        }
        .lightbox-arrow {
          pointer-events: all;
          font-size: 2.5rem;
          color: #fff;
          background: rgba(0,0,0,0.3);
          border-radius: 50%;
          padding: 0.3em 0.5em;
          margin: 0 1.5vw;
          cursor: pointer;
          transition: background 0.2s;
        }
        .lightbox-arrow:hover {
          background: #dc3545;
        }
        @media (max-width: 600px) {
          .lightbox-img {
            max-width: 98vw;
            max-height: 60vh;
          }
          .lightbox-close {
            top: 12px;
            right: 12px;
            font-size: 1.7rem;
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
            {/* Gallery Container */}
            <div className="gallery-container mb-4 position-relative">
              {/* Main Image cu săgeți */}
              <div className="main-image-wrapper mb-2 text-center position-relative" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {rental.images.length > 1 && (
                  <button type="button" className="btn btn-dark position-absolute start-0 top-50 translate-middle-y z-2" style={{left: 10, zIndex: 2}} onClick={prevImage}>
                    <FaChevronLeft />
                  </button>
                )}
                <Image
                  src={rental.images[activeImage]}
                  alt={`${rental.marca} ${rental.model} - Imagine ${activeImage + 1}`}
                  width={800}
                  height={600}
                  className="img-fluid"
                  style={{
                    objectFit: 'cover',
                    width: '100%',
                    height: '400px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.18)'
                  }}
                  onClick={() => setShowLightbox(true)}
                  sizes="(max-width: 768px) 100vw, 800px"
                />
                {rental.images.length > 1 && (
                  <button type="button" className="btn btn-dark position-absolute end-0 top-50 translate-middle-y z-2" style={{right: 10, zIndex: 2}} onClick={nextImage}>
                    <FaChevronRight />
                  </button>
                )}
              </div>
              {/* Thumbnails Row - toate vizibile, fără scroll */}
              <div className="d-flex flex-row flex-wrap justify-content-center align-items-center gap-2 pb-2" style={{marginTop: 8}}>
                {rental.images.map((image, index) => (
                  <div key={index} className="thumb-wrapper" style={{ minWidth: 80, maxWidth: 100 }}>
                    <div
                      className="position-relative"
                      style={{
                        cursor: 'pointer',
                        border: index === activeImage ? '2px solid #dc3545' : '2px solid transparent',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: index === activeImage ? '0 0 0 2px #fff' : 'none'
                      }}
                      onClick={() => setActiveImage(index)}
                    >
                      <Image
                        src={image}
                        alt={`${rental.marca} ${rental.model} - Thumbnail ${index + 1}`}
                        width={100}
                        height={75}
                        className="img-fluid w-100 h-100"
                        style={{ objectFit: 'cover', aspectRatio: '4/3' }}
                        loading="lazy"
                        sizes="(max-width: 768px) 25vw, 12vw"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Car details card - vertical list, dark, clasic */}
            <div className="card border-0 shadow-sm mb-3 mb-md-4" style={{ backgroundColor: 'var(--gray-900)', border: '1px solid var(--gray-800)' }}>
              <div className="card-body p-3 p-md-4">
                <h3 className="h5 mb-3 mb-md-4 text-light">
                  <i className="bi bi-wrench-adjustable text-light me-2"></i>Detalii tehnice
                </h3>
                <ul className="list-unstyled mb-0">
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <FaCar className="text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }} />
                    <span className="text-light fw-bold" style={{ fontSize: '1.05rem' }}>{rental.marca} {rental.model}</span>
                  </li>
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <FaCalendar className="text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }} />
                    <span className="text-light" style={{ fontSize: '1.05rem' }}>{rental.an}</span>
                  </li>
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <FaTachometerAlt className="text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }} />
                    <span className="text-light" style={{ fontSize: '1.05rem' }}>{new Intl.NumberFormat('ro-RO').format(rental.km)} km</span>
                  </li>
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <FaCar className="text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }} />
                    <span className="text-light" style={{ fontSize: '1.05rem' }}>{rental.caroserie}</span>
                  </li>
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <FaGasPump className="text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }} />
                    <span className="text-light" style={{ fontSize: '1.05rem' }}>{rental.combustibil}</span>
                  </li>
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <FaCog className="text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }} />
                    <span className="text-light" style={{ fontSize: '1.05rem' }}>{rental.transmisie}</span>
                  </li>
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <FaTachometerAlt className="text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }} />
                    <span className="text-light" style={{ fontSize: '1.05rem' }}>{rental.capacitate} cm³</span>
                  </li>
                  {rental.putere && (
                    <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                      <FaBolt className="text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }} />
                      <span className="text-light" style={{ fontSize: '1.05rem' }}>{rental.putere} CP</span>
                    </li>
                  )}
                  {rental.tractiune && (
                    <li className="d-flex align-items-center py-2">
                      <FaCog className="text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }} />
                      <span className="text-light" style={{ fontSize: '1.05rem' }}>{rental.tractiune}</span>
                    </li>
                  )}
                </ul>
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
                  <div className="d-grid gap-2 mb-3 mb-md-4">
                    <a
                      href={`tel:${config.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-danger btn-lg d-flex align-items-center justify-content-center gap-2"
                    >
                      <i className="bi bi-telephone"></i> Sună-ne acum: {formatPhone(config.whatsapp)}
                    </a>
                  </div>
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

        {/* Contact Information */}
        {rental.contact && (
          <div className="row mt-4">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm" style={{ backgroundColor: 'var(--gray-900)', border: '1px solid var(--gray-800)' }}>
                <div className="card-body">
                  <h3 className="h5 text-light mb-3">Contact</h3>
                  <p className="mb-0">
                    <i className="bi bi-person me-2 text-danger"></i>
                    Contact: {formatPhone(rental.contact)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div 
          className="lightbox"
          onClick={() => setShowLightbox(false)}
        >
          <div className="position-relative" style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
            <Image
              src={rental.images[activeImage]}
              alt={`${rental.marca} ${rental.model}`}
              width={1200}
              height={900}
              className="img-fluid lightbox-img"
              style={{ 
                maxHeight: '95vh', 
                maxWidth: '95vw',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}
              sizes="95vw"
            />
            
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLightbox(false);
              }}
              className="btn btn-dark position-absolute top-0 end-0 m-3 rounded-circle lightbox-close"
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
                  className="btn btn-dark position-absolute top-50 start-0 translate-middle-y ms-3 rounded-circle lightbox-arrow"
                  style={{ width: '50px', height: '50px', padding: 0 }}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="btn btn-dark position-absolute top-50 end-0 translate-middle-y me-3 rounded-circle lightbox-arrow"
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