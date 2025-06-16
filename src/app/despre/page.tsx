'use client';

import { useConfig } from '@/hooks/useConfig';
import Image from 'next/image';

export default function AboutPage() {
  const { config } = useConfig();

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="display-4 text-center mb-5">Despre noi</h1>
          
          {config?.logoUrl && (
            <div className="text-center mb-5">
              <img 
                src={config.logoUrl} 
                alt={config?.nume || 'Logo'} 
                className="img-fluid"
                style={{
                  maxWidth: '300px',
                  maxHeight: '300px',
                  objectFit: 'contain'
                }}
              />
            </div>
          )}

          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="h4 mb-4">Platforma noastră</h2>
              <p className="lead mb-4">
                AutoBRB este o platformă modernă dedicată vânzării și cumpărării de mașini, 
                oferind o experiență simplă și eficientă atât pentru vânzători, cât și pentru cumpărători.
              </p>

              <h3 className="h5 mb-3">Scopul nostru</h3>
              <p className="mb-4">
                Ne propunem să simplificăm procesul de vânzare și cumpărare de mașini prin:
              </p>
              <ul className="mb-4">
                <li>Oferirea unei platforme intuitive și ușor de utilizat</li>
                <li>Asigurarea unui mediu sigur pentru tranzacții</li>
                <li>Furnizarea de informații detaliate și relevante despre fiecare vehicul</li>
                <li>Oferirea unui suport tehnic rapid și eficient</li>
              </ul>

              <h3 className="h5 mb-3">Cui ne adresăm</h3>
              <p className="mb-4">
                Platforma noastră este destinată:
              </p>
              <ul className="mb-4">
                <li>Dealerilor auto care doresc să-și promoveze parcul auto</li>
                <li>Persoanelor fizice care doresc să-și vândă mașina</li>
                <li>Cumpărătorilor în căutarea mașinii potrivite</li>
                <li>Pasionaților de automobile care doresc să exploreze oferte actualizate</li>
              </ul>

              <div className="mt-5 pt-4 border-top">
                <h3 className="h5 mb-3">Dezvoltator</h3>
                <p className="mb-0">
                  Această platformă a fost dezvoltată cu pasiune și atenție la detalii, 
                  folosind cele mai moderne tehnologii web pentru a oferi o experiență 
                  optimă utilizatorilor noștri.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 