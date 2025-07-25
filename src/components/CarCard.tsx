'use client';

import Link from 'next/link';
import { FaRoad, FaGasPump, FaCog, FaTachometerAlt, FaCar } from 'react-icons/fa';

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
}

export default function CarCard({ car }: CarCardProps) {
  const formattedPrice = new Intl.NumberFormat('ro-RO').format(car.pret);
  const formattedKm = new Intl.NumberFormat('ro-RO').format(car.km);
  
  const displayImage = car.coverImage || car.images[0];

  return (
    <Link 
      href={`/cars/${car.id}`} 
      className="text-decoration-none card h-100 border-0 shadow-sm hover-card"
      style={{
        backgroundColor: 'var(--gray-800)',
        border: '1px solid var(--gray-700)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      {/* Car Image */}
      <div className="position-relative">
        <img
          src={displayImage}
          alt={`${car.marca} ${car.model}`}
          className="car-image"
          loading="lazy"
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
          <span className="price-tag text-light">{formattedPrice} €</span>
        </div>
      </div>
    </Link>
  );
} 