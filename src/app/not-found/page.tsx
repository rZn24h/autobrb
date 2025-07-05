'use client';

import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="not-found-page" style={{ backgroundColor: 'var(--background-main)', minHeight: '100vh' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-6 text-center">
            {/* Icon și titlu */}
            <div className="mb-4">
              <div className="error-icon mb-4" style={{ fontSize: '8rem', color: 'var(--danger-color)' }}>
                <i className="bi bi-exclamation-triangle"></i>
              </div>
              <h1 className="display-1 text-danger mb-3" style={{ fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                404
              </h1>
              <h2 className="h2 mb-4 text-light" style={{ fontWeight: '600' }}>
                Pagina nu a fost găsită
              </h2>
            </div>

            {/* Mesaj descriptiv */}
            <div className="card border-0 shadow-lg mb-5" style={{ backgroundColor: 'var(--gray-900)', border: '1px solid var(--gray-800)' }}>
              <div className="card-body p-4 p-md-5">
                <p className="lead text-light mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                  Ne pare rău, pagina pe care o căutați nu există sau a fost mutată.
                  Vă rugăm să verificați adresa URL sau să navigați către una din paginile noastre.
                </p>
                
                {/* Informații suplimentare */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center text-light">
                      <i className="bi bi-search text-danger me-3" style={{ fontSize: '1.2rem' }}></i>
                      <span>Verificați adresa URL</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center text-light">
                      <i className="bi bi-arrow-left text-danger me-3" style={{ fontSize: '1.2rem' }}></i>
                      <span>Navigați înapoi</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Butoane de navigație */}
            <div className="navigation-buttons">
              <div className="row g-3 justify-content-center">
                <div className="col-12 col-md-4">
                  <Link 
                    href="/" 
                    className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                    style={{ 
                      backgroundColor: 'var(--primary-color)', 
                      borderColor: 'var(--primary-color)',
                      fontSize: '1.1rem',
                      padding: '0.75rem 1.5rem'
                    }}
                  >
                    <i className="bi bi-house"></i>
                    Pagina principală
                  </Link>
                </div>
                
                <div className="col-12 col-md-4">
                  <Link 
                    href="/cars" 
                    className="btn btn-outline-danger btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                    style={{ 
                      borderColor: 'var(--danger-color)',
                      color: 'var(--danger-color)',
                      fontSize: '1.1rem',
                      padding: '0.75rem 1.5rem'
                    }}
                  >
                    <i className="bi bi-car-front"></i>
                    Mașini de vânzare
                  </Link>
                </div>
                
                <div className="col-12 col-md-4">
                  <Link 
                    href="/rentals" 
                    className="btn btn-outline-warning btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                    style={{ 
                      borderColor: 'var(--warning-color)',
                      color: 'var(--warning-color)',
                      fontSize: '1.1rem',
                      padding: '0.75rem 1.5rem'
                    }}
                  >
                    <i className="bi bi-calendar-check"></i>
                    Închirieri
                  </Link>
                </div>
              </div>
            </div>

            {/* Informații suplimentare */}
            <div className="mt-5">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm" style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)' }}>
                    <div className="card-body p-3 text-center">
                      <i className="bi bi-telephone text-danger mb-2" style={{ fontSize: '2rem' }}></i>
                      <h5 className="text-light mb-2">Contact</h5>
                      <p className="text-light mb-0 small">Sunați-ne pentru asistență</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm" style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)' }}>
                    <div className="card-body p-3 text-center">
                      <i className="bi bi-info-circle text-info mb-2" style={{ fontSize: '2rem' }}></i>
                      <h5 className="text-light mb-2">Ajutor</h5>
                      <p className="text-light mb-0 small">Ghid de utilizare</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stiluri CSS personalizate */}
      <style jsx>{`
        .not-found-page {
          background: linear-gradient(135deg, var(--background-main) 0%, var(--gray-900) 100%);
        }
        
        .error-icon {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3) !important;
        }
        
        .btn {
          transition: all 0.3s ease;
        }
        
        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        @media (max-width: 768px) {
          .error-icon {
            font-size: 6rem !important;
          }
          
          .display-1 {
            font-size: 3rem !important;
          }
        }
      `}</style>
    </div>
  );
} 