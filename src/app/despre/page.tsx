'use client';

import { useConfig } from '@/hooks/useConfig';
import Image from 'next/image';

export default function AboutPage() {
  const { config } = useConfig();

  return (
    <div className="container mt-5 pt-5">
      <div className="row">
        <div className="col-lg-6">
          <h1 className="mb-4">Despre Noi</h1>
          <p className="lead">
            Suntem pasionați de automobile și ne dedicăm să oferim cele mai bune servicii pentru clienții noștri.
          </p>
          <p>
            Cu o experiență vastă în domeniu, echipa noastră este pregătită să vă ofere consiliere profesională și să vă ajute să găsiți mașina perfectă pentru nevoile dumneavoastră.
          </p>
        </div>
        <div className="col-lg-6">
          <Image
            src="/images/about-us.jpg"
            alt="Despre noi"
            width={500}
            height={300}
            className="img-fluid rounded shadow"
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      </div>
    </div>
  );
} 