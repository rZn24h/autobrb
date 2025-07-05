'use client';

import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="global-error-page" style={{ backgroundColor: 'var(--background-main)', minHeight: '100vh' }}>
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-8 col-xl-6 text-center">
                {/* Icon și titlu */}
                <div className="mb-4">
                  <div className="error-icon mb-4" style={{ fontSize: '8rem', color: 'var(--danger-color)' }}>
                    <i className="bi bi-exclamation-octagon"></i>
                  </div>
                  <h1 className="display-1 text-danger mb-3" style={{ fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    500
                  </h1>
                  <h2 className="h2 mb-4 text-light" style={{ fontWeight: '600' }}>
                    Eroare internă a serverului
                  </h2>
                </div>

                {/* Mesaj descriptiv */}
                <div className="card border-0 shadow-lg mb-5" style={{ backgroundColor: 'var(--gray-900)', border: '1px solid var(--gray-800)' }}>
                  <div className="card-body p-4 p-md-5">
                    <p className="lead text-light mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                      Ne pare rău, a apărut o eroare neașteptată pe server. 
                      Vă rugăm să încercați din nou sau să navigați către pagina principală.
                    </p>
                    
                    {/* Informații suplimentare */}
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center text-light">
                          <i className="bi bi-arrow-clockwise text-warning me-3" style={{ fontSize: '1.2rem' }}></i>
                          <span>Reîncercați operația</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex align-items-center text-light">
                          <i className="bi bi-house text-info me-3" style={{ fontSize: '1.2rem' }}></i>
                          <span>Mergeți la pagina principală</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Butoane de acțiune */}
                <div className="action-buttons">
                  <div className="row g-3 justify-content-center">
                    <div className="col-12 col-md-6">
                      <button 
                        onClick={() => reset()}
                        className="btn btn-warning btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                        style={{ 
                          backgroundColor: 'var(--warning-color)', 
                          borderColor: 'var(--warning-color)',
                          fontSize: '1.1rem',
                          padding: '0.75rem 1.5rem'
                        }}
                      >
                        <i className="bi bi-arrow-clockwise"></i>
                        Încearcă din nou
                      </button>
                    </div>
                    
                    <div className="col-12 col-md-6">
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
                  </div>
                </div>

                {/* Informații suplimentare */}
                <div className="mt-5">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm" style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)' }}>
                        <div className="card-body p-3 text-center">
                          <i className="bi bi-telephone text-danger mb-2" style={{ fontSize: '2rem' }}></i>
                          <h5 className="text-light mb-2">Suport tehnic</h5>
                          <p className="text-light mb-0 small">Contactați echipa de suport</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm" style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)' }}>
                        <div className="card-body p-3 text-center">
                          <i className="bi bi-clock-history text-info mb-2" style={{ fontSize: '2rem' }}></i>
                          <h5 className="text-light mb-2">Status</h5>
                          <p className="text-light mb-0 small">Verificați statusul serviciului</p>
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
            .global-error-page {
              background: linear-gradient(135deg, var(--background-main) 0%, var(--gray-900) 100%);
            }
            
            .error-icon {
              animation: shake 2s infinite;
            }
            
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
              20%, 40%, 60%, 80% { transform: translateX(5px); }
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
      </body>
    </html>
  );
} 