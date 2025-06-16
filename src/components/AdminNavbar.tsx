'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/utils/firebase';

const AdminNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Adaugă anunț', path: '/admin/add' },
    { label: 'Administrare anunțuri', path: '/admin/list' },
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
              <Link
                key={item.path}
                href={item.path}
                className={`text-white text-decoration-none ${
                  pathname === item.path ? 'fw-bold border-bottom border-2' : 'opacity-75 hover-opacity-100'
                }`}
                style={{ 
                  fontSize: '1.125rem',
                  transition: 'all 0.2s ease',
                  paddingBottom: '0.25rem'
                }}
              >
                {item.label}
              </Link>
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