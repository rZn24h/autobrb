'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useConfig } from '@/hooks/useConfig';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { config, loading } = useConfig();
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when pathname changes (navigation occurs)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const navbar = document.getElementById('navbarNav');
      const toggler = document.querySelector('.navbar-toggler');
      
      if (navbar && toggler && !navbar.contains(event.target as Node) && !toggler.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg fixed-top shadow-lg" style={{ 
      backgroundColor: 'rgba(17, 24, 39, 0.95)', 
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <style jsx global>{`
        .navbar {
          transition: all 0.3s ease;
        }
        
        .navbar-toggler {
          border: none !important;
          padding: 0.5rem !important;
          border-radius: 8px !important;
          transition: all 0.3s ease !important;
          background: rgba(220, 53, 69, 0.1) !important;
        }
        
        .navbar-toggler:hover {
          background: rgba(220, 53, 69, 0.2) !important;
          transform: scale(1.05);
        }
        
        .navbar-toggler:focus {
          box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
        }
        
        .navbar-toggler-icon {
          background-image: none !important;
          position: relative;
          width: 1.5em;
          height: 1.5em;
          transition: all 0.3s ease;
        }
        
        .navbar-toggler-icon::before,
        .navbar-toggler-icon::after,
        .navbar-toggler-icon div {
          content: '';
          display: block;
          height: 3px;
          width: 100%;
          background: #dc3545;
          margin: 0.3em 0;
          border-radius: 2px;
          transition: all 0.3s ease;
          transform-origin: center;
        }
        
        .navbar-toggler-icon div {
          margin: 0.3em 0;
        }
        
        /* Hamburger animation when menu is open */
        .navbar-toggler[aria-expanded="true"] .navbar-toggler-icon::before {
          transform: rotate(45deg) translate(6px, 6px);
        }
        
        .navbar-toggler[aria-expanded="true"] .navbar-toggler-icon::after {
          transform: rotate(-45deg) translate(6px, -6px);
        }
        
        .navbar-toggler[aria-expanded="true"] .navbar-toggler-icon div {
          opacity: 0;
        }
        
        .nav-link {
          position: relative;
          transition: all 0.3s ease !important;
          border-radius: 8px;
          margin: 0.25rem 0;
        }
        
        .nav-link:hover {
          background: rgba(220, 53, 69, 0.1) !important;
          transform: translateY(-1px);
        }
        
        .nav-link.active {
          background: rgba(220, 53, 69, 0.15) !important;
          box-shadow: 0 2px 8px rgba(220, 53, 69, 0.2);
        }
        
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2px;
          background: #dc3545;
          border-radius: 1px;
        }
        
        /* Mobile menu improvements */
        @media (max-width: 991.98px) {
          .navbar-collapse {
            background: rgba(17, 24, 39, 0.98);
            backdrop-filter: blur(15px);
            border-radius: 12px;
            margin-top: 1rem;
            padding: 1rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }
          
          .navbar-nav {
            gap: 0.5rem;
          }
          
          .nav-link {
            padding: 0.75rem 1rem !important;
            border-radius: 8px;
            text-align: center;
            font-weight: 500;
          }
          
          .nav-link:hover {
            background: rgba(220, 53, 69, 0.15) !important;
          }
        }
        
        /* Smooth animations for menu collapse */
        .navbar-collapse {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .navbar-collapse.collapsing {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
      
      <div className="container">
        {/* Logo */}
        <Link href="/" className="navbar-brand d-flex align-items-center" onClick={handleLinkClick}>
          {loading ? (
            <div className="spinner-border spinner-border-sm text-light" role="status">
              <span className="visually-hidden">Se încarcă...</span>
            </div>
          ) : config?.logoUrl ? (
            <img
              src={config.logoUrl}
              alt={config.nume || 'Logo'}
              style={{
                width: 'auto',
                height: '40px',
                objectFit: 'contain',
                transition: 'transform 0.3s ease'
              }}
              className="d-inline-block align-top"
            />
          ) : (
            <div className="text-danger" style={{ fontSize: '1.5rem' }}>
              <i className="bi bi-car-front"></i>
            </div>
          )}
        </Link>

        {/* Mobile menu button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
          onClick={toggleMenu}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation links */}
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link 
                href="/" 
                className={`nav-link px-3 py-2 ${pathname === '/' ? 'active fw-bold text-danger' : 'text-light'}`}
                onClick={handleLinkClick}
              >
                <i className="bi bi-car-front me-2"></i>
                Vânzări
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/rentals" 
                className={`nav-link px-3 py-2 ${pathname === '/rentals' ? 'active fw-bold text-danger' : 'text-light'}`}
                onClick={handleLinkClick}
              >
                <i className="bi bi-calendar-check me-2"></i>
                Închirieri
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/contact" 
                className={`nav-link px-3 py-2 ${pathname === '/contact' ? 'active fw-bold text-danger' : 'text-light'}`}
                onClick={handleLinkClick}
              >
                <i className="bi bi-envelope me-2"></i>
                Contact
              </Link>
            </li>
            {user && isAdmin && !adminLoading && (
              <li className="nav-item">
                <Link 
                  href="/admin/dashboard" 
                  className={`nav-link px-3 py-2 d-flex align-items-center ${
                    pathname.startsWith('/admin') ? 'active fw-bold text-danger' : 'text-light'
                  }`}
                  onClick={handleLinkClick}
                >
                  <i className="bi bi-gear-fill me-2"></i>
                  <span>Admin</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;