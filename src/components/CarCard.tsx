'use client';

import Link from 'next/link';
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
}

const CarCard = memo(function CarCard({ car, type = 'sale' }: CarCardProps) {
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
        <img
          src={displayImage}
          alt={`${car.marca} ${car.model}`}
          className="car-image"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Car Details */}
      <div className="card-body p-3">
        {/* Title */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h3 
            className="car-title mb-0" 
            style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'var(--light-color)'
            }}
          >
            {car.marca} {car.model}
          </h3>
          <span className="text-light">{car.an}</span>
        </div>

        {/* Specs */}
        <div className="specs-grid mb-3">
          <div className="spec-item">
            <i className="bi bi-speedometer2 spec-icon"></i>
            <span className="spec-text text-light">{formattedKm} km</span>
          </div>
          <div className="spec-item">
            <i className="bi bi-fuel-pump spec-icon"></i>
            <span className="spec-text text-light">{car.combustibil}</span>
          </div>
          <div className="spec-item">
            <i className="bi bi-gear spec-icon"></i>
            <span className="spec-text text-light">{car.transmisie}</span>
          </div>
          <div className="spec-item">
            <i className="bi bi-droplet spec-icon"></i>
            <span className="spec-text text-light">{car.capacitate} cm³</span>
          </div>
        </div>

        {/* Price */}
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-light">Preț:</span>
          <span className="price-tag text-light">{displayPrice}</span>
        </div>
      </div>
    </Link>
  );
});

export default CarCard; 