'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import React, { useState, useRef, useEffect } from 'react';

const AdminNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Vânzări', path: '/admin/list', submenu: [
      { label: 'Adaugă anunț', path: '/admin/add' },
      { label: 'Administrare anunțuri', path: '/admin/list' },
    ]},
    { label: 'Închirieri', path: '/admin/rentals/list', submenu: [
      { label: 'Adaugă închiriere', path: '/admin/rentals/add' },
      { label: 'Administrare închirieri', path: '/admin/rentals/list' },
    ]},
    { label: 'Setări parc auto', path: '/admin/settings' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="admin-navbar py-3" style={{ backgroundColor: 'var(--gray-900)' }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <Link 
            href="/admin/dashboard" 
            className="text-white text-decoration-none"
          >
            <h1 className="h4 mb-0 fw-bold">Admin Panel</h1>
          </Link>
          <div className="d-flex align-items-center" style={{ gap: '2rem' }}>
            {menuItems.map((item) => (
              <div key={item.path} className="position-relative" ref={item.submenu ? dropdownRef : undefined}>
                {item.submenu ? (
                  <>
                    <button
                      type="button"
                      className={`bg-transparent border-0 text-white text-decoration-none ${isActive(item.path) ? 'fw-bold border-bottom border-2' : 'opacity-75 hover-opacity-100'}`}
                      style={{ fontSize: '1.125rem', transition: 'all 0.2s ease', paddingBottom: '0.25rem', outline: 'none' }}
                      onClick={() => setOpenDropdown(openDropdown === item.path ? null : item.path)}
                    >
                      {item.label} <i className={`bi ms-1 ${openDropdown === item.path ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                    </button>
                    {openDropdown === item.path && (
                      <div className="position-absolute top-100 start-0 mt-2" style={{ zIndex: 1000, minWidth: 220 }}>
                        <div className="bg-white border border-secondary rounded shadow py-2">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.path}
                              href={subItem.path}
                              className={`d-block px-4 py-2 text-dark text-decoration-none ${pathname === subItem.path ? 'bg-light fw-bold' : 'hover-bg-light'}`}
                              style={{ fontSize: '1rem', borderRadius: 4 }}
                              onClick={() => setOpenDropdown(null)}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.path}
                    className={`text-white text-decoration-none ${isActive(item.path) ? 'fw-bold border-bottom border-2' : 'opacity-75 hover-opacity-100'}`}
                    style={{ fontSize: '1.125rem', transition: 'all 0.2s ease', paddingBottom: '0.25rem' }}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            <button
              onClick={handleLogout}
              className="btn btn-outline-light ms-4"
              style={{ 
                fontSize: '1rem',
                padding: '0.5rem 1.25rem'
              }}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar; 