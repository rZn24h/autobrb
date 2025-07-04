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
      {/* Car Image */}
      <div className="position-relative card-img-wrapper" style={{overflow: 'hidden', borderTopLeftRadius: 'calc(0.375rem - 1px)', borderTopRightRadius: 'calc(0.375rem - 1px)'}}>
        <Image
          src={displayImage}
          alt={`${car.marca} ${car.model}`}
          width={400}
          height={250}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          className="car-image"
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '200px'
          }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLDSBGLwGXXKmSGfLzBgRGC5bLAJkpb0bLWQz8jLYJLpbKYdFqg2AzIZsxjnOEcYDXDJOjDpGcILRiHEgVmxhDEgZzQjkJIKRBBOOBvABGXMwQQfHgIIE/9k="
        />
      </div>

      {/* Car Details */}
      <div className="card-body p-3">
        {/* Title */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h3 
            className="car-title mb-0 text-white" 
            style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#fff'
            }}
          >
            {car.marca} {car.model}
          </h3>
          <span className="text-white" style={{color: '#fff'}}>{car.an}</span>
        </div>

        {/* Specs */}
        <div className="specs-grid mb-3">
          <div className="spec-item d-flex align-items-center">
            <i className="bi bi-speedometer2 spec-icon text-white" style={{color: '#fff'}}></i>
            <span className="spec-text text-white" style={{color: '#fff'}}>{formattedKm} km</span>
          </div>
          <div className="spec-item d-flex align-items-center">
            <i className="bi bi-fuel-pump spec-icon text-white" style={{color: '#fff'}}></i>
            <span className="spec-text text-white" style={{color: '#fff'}}>{car.combustibil}</span>
          </div>
          <div className="spec-item d-flex align-items-center">
            <i className="bi bi-gear spec-icon text-white" style={{color: '#fff'}}></i>
            <span className="spec-text text-white" style={{color: '#fff'}}>{car.transmisie}</span>
          </div>
          <div className="spec-item d-flex align-items-center">
            <FaCar className="spec-icon" style={{color: '#dc3545'}} />
            <span className="spec-text text-white" style={{color: '#fff'}}>{car.capacitate} cm³</span>
          </div>
        </div>

        {/* Price */}
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-white" style={{color: '#fff'}}>Preț:</span>
          <span className="price-tag text-white" style={{color: '#fff'}}>{displayPrice}</span>
        </div>
      </div>
    </Link>
  );
});

export default CarCard; 