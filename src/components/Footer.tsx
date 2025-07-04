'use client';

import Link from 'next/link';
import { useConfig } from '@/hooks/useConfig';

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

const Footer = () => {
  const { config } = useConfig();

  return (
    <>
      <footer className="footer mt-auto py-4" style={{ backgroundColor: 'var(--gray-900)', borderTop: '1px solid var(--gray-800)' }}>
        <div className="container">
          <div className="row">
            <div className="col-md-6 mb-3 mb-md-0">
              <p className="mb-2 text-light">© 2025 {config?.nume || 'AutoHausDAVID'} – Toate drepturile rezervate</p>
              <div className="footer-links mb-3">
                <Link href="/termeni" className="text-decoration-none me-3 text-light opacity-75 hover-opacity-100">
                  Termeni și condiții
                </Link>
                <Link href="/confidentialitate" className="text-decoration-none text-light opacity-75 hover-opacity-100">
                  Politică de confidențialitate
                </Link>
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              {config?.locatie && (
                <p className="mb-2 text-light">
                  📍 <span className="fw-medium">Locație:</span> {config.locatie}
                </p>
              )}
              {config?.whatsapp && (
                <p className="mb-2 text-light">
                  📞 <span className="fw-medium">Telefon:</span>{' '}
                  <a 
                    href={`tel:${config.whatsapp}`} 
                    className="text-decoration-none text-light opacity-75 hover-opacity-100"
                  >
                    {formatPhone(config.whatsapp)}
                  </a>
                </p>
              )}
              {config?.facebook && (
                <p className="mb-2 text-light">
                  🔗 <span className="fw-medium">Facebook:</span>{' '}
                  <a 
                    href={config.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-decoration-none text-light opacity-75 hover-opacity-100"
                  >
                    {config?.nume || 'AutoHausDAVID'}
                  </a>
                </p>
              )}
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-12 text-center">
              <span style={{ color: 'var(--gray-500)', fontSize: '0.95rem', letterSpacing: '0.5px' }}>powered by rZn24</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer; 