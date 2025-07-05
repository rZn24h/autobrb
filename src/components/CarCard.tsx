'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaRoad, FaGasPump, FaCog, FaTachometerAlt, FaCar } from 'react-icons/fa';
import { memo } from 'react';

interface CarCardProps {
  car: {
    id: string;
    title: string;
    marca: string;
    model: string;
    an: number;
    pret: number;
    km: number;
    combustibil: string;
    transmisie: string;
    putere?: string;
    capacitate: string;
    images: string[];
    coverImage?: string;
  };
  type?: 'rental' | 'sale';
  priority?: boolean;
}

const CarCard = memo(function CarCard({ car, type = 'sale', priority = false }: CarCardProps) {
  const formattedPrice = new Intl.NumberFormat('ro-RO').format(car.pret);
  const formattedKm = new Intl.NumberFormat('ro-RO').format(car.km);
  
  const displayImage = car.coverImage || car.images[0];

  const linkHref = type === 'rental' ? `/rentals/${car.id}` : `/cars/${car.id}`;

  let displayPrice = formattedPrice + ' €';
  if (type === 'rental') {
    // Show only the first interval if multiple
    const firstInterval = String(car.pret).split(',')[0]?.trim();
    displayPrice = firstInterval || String(car.pret);
  }

  return (
    <Link 
      href={linkHref}
      className="text-decoration-none card h-100 border-0 shadow-sm hover-card"
      style={{
        backgroundColor: 'var(--gray-800)',
        border: '1px solid var(--gray-700)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      {/* Car Image - Optimizat pentru performanță și CLS */}
      <div 
        className="position-relative card-img-wrapper" 
        style={{
          overflow: 'hidden', 
          borderTopLeftRadius: 'calc(0.375rem - 1px)', 
          borderTopRightRadius: 'calc(0.375rem - 1px)',
          height: '200px', // Dimensiune fixă pentru a evita CLS
          width: '100%'
        }}
      >
        <Image
          src={displayImage}
          alt={`${car.marca} ${car.model} - ${car.an}`}
          fill
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          className="car-image"
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%'
          }}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLDSBGLwGXXKmSGfLzBgRGC5bLAJkpb0bLWQz8jLYJLpbKYdFqg2AzIZsxjnOEcYDXDJOjDpGcILRiHEgVmxhDEgZzQjkJIKRBBOOBvABGXMwQQfHgIIE/9k="
          quality={75}
          onLoad={(e) => {
            // Optimizare pentru CLS
            const target = e.target as HTMLImageElement;
            target.style.opacity = '1';
          }}
          onError={(e) => {
            // Fallback pentru imagini care nu se încarcă
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-car.jpg';
          }}
        />
      </div>

      {/* Car Details - Repoziționat */}
      <div className="card-body d-flex flex-column" style={{ height: '100%' }}>
        {/* Titlu - Culoare albă */}
        <h5 
          className="card-title mb-3" 
          style={{
            color: '#ffffff',
            fontSize: '1.1rem',
            fontWeight: '600',
            lineHeight: '1.3',
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.6rem'
          }}
        >
          {car.title}
        </h5>
        
        {/* Informații despre mașină */}
        <div className="specs-grid mb-3">
          <div className="spec-item">
            <FaRoad className="spec-icon" />
            <span className="spec-text">{formattedKm} km</span>
          </div>
          <div className="spec-item">
            <FaGasPump className="spec-icon" />
            <span className="spec-text">{car.combustibil}</span>
          </div>
          <div className="spec-item">
            <FaCog className="spec-icon" />
            <span className="spec-text">{car.transmisie}</span>
          </div>
          <div className="spec-item">
            <FaTachometerAlt className="spec-icon" />
            <span className="spec-text">{car.putere || 'N/A'}</span>
          </div>
        </div>
        
        {/* Informații despre mașină - partea de jos */}
        <div className="mt-auto">
          <div className="text-center mb-2">
            <small className="text-muted">
              {car.marca} {car.model} • {car.an}
            </small>
          </div>
          
          {/* Preț - Poziționat în partea de jos */}
          <div className="price-tag text-center" style={{ marginTop: 'auto' }}>
            {displayPrice}
          </div>
        </div>
      </div>
    </Link>
  );
});

export default CarCard; 