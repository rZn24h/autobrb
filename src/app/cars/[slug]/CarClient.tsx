"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight, FaRoad, FaGasPump, FaCog, FaCar, FaTachometerAlt, FaWhatsapp, FaPhone, FaCalendar, FaBolt, FaProjectDiagram } from 'react-icons/fa';
import { BiPhone, BiEnvelope } from 'react-icons/bi';
import { useConfig } from '@/hooks/useConfig';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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

export default function CarClient({ car }: { car: CarDetails }) {
  const { config } = useConfig();
  const router = useRouter();
  const images: string[] = car.images || [];
  const [activeImage, setActiveImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const formattedPrice = new Intl.NumberFormat('ro-RO').format(car.pret);
  const whatsappMsg = encodeURIComponent(`Salut! Sunt interesat de anunțul cu ${car.marca} ${car.model}.`);
  const whatsappLink = config?.whatsapp ? `https://wa.me/${config.whatsapp.replace(/\D/g, '')}` : '';

  useEffect(() => {
    // Optimizare pentru CLS - setează loading la false după ce prima imagine se încarcă
    if (car.images && car.images.length > 0) {
      const img = new window.Image();
      img.onload = () => setIsLoading(false);
      img.src = car.images[0];
    } else {
      setIsLoading(false);
    }
  }, [car.images]);

  const formattedKm = new Intl.NumberFormat('ro-RO').format(car.km);

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
          {/* Left column - Images & Description */}
          <div className="col-lg-8">
            {/* Gallery Container */}
            <div className="gallery-container mb-4 position-relative">
              {/* Image Gallery Card */}
              <div className="card border-0 shadow-sm" style={{ backgroundColor: 'var(--gray-900)', border: '1px solid var(--gray-800)' }}>
                <div className="card-body p-3 p-md-4">
                  <h3 className="h5 mb-3 mb-md-4 text-light">
                    <i className="bi bi-images text-danger me-2"></i>Galerie foto
                  </h3>
                  
                  {/* Main Image cu săgeți */}
                  <div className="main-image-wrapper mb-3 text-center position-relative" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {car.images.length > 1 && (
                      <button type="button" className="btn btn-dark position-absolute start-0 top-50 translate-middle-y z-2" style={{left: 10, zIndex: 2}} onClick={prevImage}>
                        <FaChevronLeft />
                      </button>
                    )}
                    <div className="main-image-container position-relative" style={{ height: '400px', borderRadius: '12px', overflow: 'hidden' }}>
                      {isLoading && (
                        <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'var(--gray-800)', zIndex: 1 }}>
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Se încarcă imaginea...</span>
                          </div>
                        </div>
                      )}
                      <Image
                        src={car.images[activeImage]}
                        alt={`${car.marca} ${car.model} - Imagine ${activeImage + 1}`}
                        fill
                        priority={activeImage === 0}
                        loading={activeImage === 0 ? 'eager' : 'lazy'}
                        className="main-image"
                        style={{
                          objectFit: 'cover',
                          opacity: isLoading ? 0 : 1,
                          transition: 'opacity 0.3s ease'
                        }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                        quality={85}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLDSBGLwGXXKmSGfLzBgRGC5bLAJkpb0bLWQz8jLYJLpbKYdFqg2AzIZsxjnOEcYDXDJOjDpGcILRiHEgVmxhDEgZzQjkJIKRBBOOBvABGXMwQQfHgIIE/9k="
                        onLoad={() => setIsLoading(false)}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-car.jpg';
                          setIsLoading(false);
                        }}
                      />
                    </div>
                    {car.images.length > 1 && (
                      <button type="button" className="btn btn-dark position-absolute end-0 top-50 translate-middle-y z-2" style={{right: 10, zIndex: 2}} onClick={nextImage}>
                        <FaChevronRight />
                      </button>
                    )}
                  </div>
                  
                  {/* Thumbnails Row - toate vizibile, fără scroll */}
                  <div className="d-flex flex-row flex-wrap justify-content-center align-items-center gap-2" style={{marginTop: 8}}>
                    {car.images.map((image, index) => (
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
                            alt={`${car.marca} ${car.model} - Thumbnail ${index + 1}`}
                            width={100}
                            height={75}
                            className="img-fluid w-100 h-100"
                            style={{ objectFit: 'cover', aspectRatio: '4/3' }}
                            loading="lazy"
                            sizes="(max-width: 768px) 25vw, 12vw"
                            quality={75}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Image counter */}
                  <div className="text-center mt-3">
                    <small className="text-light">
                      Imagine {activeImage + 1} din {car.images.length}
                    </small>
                  </div>
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
                {/* Quick specs modern grid - doar 3 detalii, încadrate pe pagină */}
                <div className="row g-3 text-center mb-3 mb-md-4 justify-content-center" style={{maxWidth: 600, margin: '0 auto'}}>
                  <div className="col-12 col-md-4">
                    <div className="d-flex flex-column align-items-center justify-content-center p-3 rounded-3" style={{ backgroundColor: 'var(--gray-700)' }}>
                      <FaRoad className="text-danger mb-1" style={{ fontSize: '1.6rem' }} />
                      <div className="small text-light mb-1">Kilometraj</div>
                      <div className="fw-bold text-light" style={{ fontSize: '1.15rem' }}>{formattedKm} km</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="d-flex flex-column align-items-center justify-content-center p-3 rounded-3" style={{ backgroundColor: 'var(--gray-700)' }}>
                      <FaGasPump className="text-danger mb-1" style={{ fontSize: '1.6rem' }} />
                      <div className="small text-light mb-1">Combustibil</div>
                      <div className="fw-bold text-light" style={{ fontSize: '1.15rem' }}>{car.combustibil}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="d-flex flex-column align-items-center justify-content-center p-3 rounded-3" style={{ backgroundColor: 'var(--gray-700)' }}>
                      <FaCog className="text-danger mb-1" style={{ fontSize: '1.6rem' }} />
                      <div className="small text-light mb-1">Transmisie</div>
                      <div className="fw-bold text-light" style={{ fontSize: '1.15rem' }}>{car.transmisie}</div>
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
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-danger btn-lg d-flex align-items-center justify-content-center gap-2"
                    >
                      <i className="bi bi-telephone"></i> Sună-ne acum: {formatPhone(config.whatsapp)}
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
                      Contact: {formatPhone(car.contact)}
                    </p>
                  )}
                </div>
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

            {/* Technical details - vertical list */}
            <div className="card border-0 shadow-sm mb-3 mb-md-4" style={{ backgroundColor: 'var(--gray-900)', border: '1px solid var(--gray-800)' }}>
              <div className="card-body p-3 p-md-4">
                <h3 className="h5 mb-3 mb-md-4 text-light">
                  <i className="bi bi-wrench-adjustable text-light me-2"></i>Detalii tehnice
                </h3>
                <ul className="list-unstyled mb-0">
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <FaCar className="text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }} />
                    <span className="text-light fw-bold" style={{ fontSize: '1.05rem' }}>{car.marca} {car.model}</span>
                  </li>
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <FaCalendar className="text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }} />
                    <span className="text-light" style={{ fontSize: '1.05rem' }}>{car.an}</span>
                  </li>
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <FaTachometerAlt className="text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }} />
                    <span className="text-light" style={{ fontSize: '1.05rem' }}>{formattedKm} km</span>
                  </li>
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <FaCar className="text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }} />
                    <span className="text-light" style={{ fontSize: '1.05rem' }}>{car.caroserie}</span>
                  </li>
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <FaGasPump className="text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }} />
                    <span className="text-light" style={{ fontSize: '1.05rem' }}>{car.combustibil}</span>
                  </li>
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <FaCog className="text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }} />
                    <span className="text-light" style={{ fontSize: '1.05rem' }}>{car.transmisie}</span>
                  </li>
                  <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                    <FaTachometerAlt className="text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }} />
                    <span className="text-light" style={{ fontSize: '1.05rem' }}>{car.capacitate} cm³</span>
                  </li>
                  {car.putere && (
                    <li className="d-flex align-items-center py-2 border-bottom border-gray-700">
                      <FaBolt className="text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }} />
                      <span className="text-light" style={{ fontSize: '1.05rem' }}>{car.putere} CP</span>
                    </li>
                  )}
                  {car.tractiune && (
                    <li className="d-flex align-items-center py-2">
                      <FaProjectDiagram className="text-danger me-3" style={{ fontSize: '1.2rem', minWidth: '28px' }} />
                      <span className="text-light" style={{ fontSize: '1.05rem' }}>{car.tractiune}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Lightbox */}
      {showLightbox && (
        <div 
          className="lightbox position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 1050
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLightbox(false);
            }
          }}
        >
          <div className="position-relative w-100 h-100 d-flex align-items-center justify-content-center p-3">
            {/* Main image */}
            <div className="position-relative" style={{ maxWidth: '95vw', maxHeight: '95vh' }}>
              <Image
                src={car.images[activeImage]}
                alt={`${car.marca} ${car.model} - Imagine ${activeImage + 1}`}
                width={1200}
                height={900}
                className="img-fluid"
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
                className="btn btn-danger position-absolute top-0 end-0 m-2 m-md-3 rounded-circle"
                style={{ 
                  width: '45px', 
                  height: '45px', 
                  padding: 0, 
                  zIndex: 1060,
                  fontSize: '1.2rem'
                }}
                onClick={() => setShowLightbox(false)}
                title="Închide"
              >
                <i className="bi bi-x-lg"></i>
              </button>

              {/* Image counter */}
              <div className="position-absolute top-0 start-0 m-2 m-md-3">
                <span className="badge bg-dark text-white fs-6 px-3 py-2">
                  {activeImage + 1} / {car.images.length}
                </span>
              </div>

              {/* Image title */}
              <div className="position-absolute bottom-0 start-0 end-0 p-2 p-md-3" style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                borderRadius: '0 0 8px 8px'
              }}>
                <h3 className="text-white mb-0 text-center fs-5 fs-md-4">
                  {car.marca} {car.model} - Imagine {activeImage + 1}
                </h3>
              </div>
            </div>

            {/* Navigation arrows - only show if multiple images */}
            {images.length > 1 && (
              <>
                {/* Left arrow */}
                <button
                  onClick={prevImage}
                  className="btn btn-dark position-absolute top-50 start-0 translate-middle-y ms-2 ms-md-4 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '50px', 
                    height: '50px', 
                    padding: 0, 
                    zIndex: 1060,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    fontSize: '1.2rem'
                  }}
                  title="Imaginea anterioară"
                >
                  <i className="bi bi-chevron-left"></i>
                </button>

                {/* Right arrow */}
                <button
                  onClick={nextImage}
                  className="btn btn-dark position-absolute top-50 end-0 translate-middle-y me-2 me-md-4 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '50px', 
                    height: '50px', 
                    padding: 0, 
                    zIndex: 1060,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    fontSize: '1.2rem'
                  }}
                  title="Imaginea următoare"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </>
            )}

            {/* Keyboard navigation hint */}
            <div className="position-absolute bottom-0 end-0 m-2 m-md-3">
              <div className="text-white-50 small d-none d-md-block">
                <i className="bi bi-keyboard me-1"></i>
                Săgeți pentru navigare, ESC pentru închidere
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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
    </div>
  );
} 