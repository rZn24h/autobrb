'use client';

import { memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/utils/firebase';

const AdminNavbar = memo(function AdminNavbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link href="/admin/dashboard" className="navbar-brand">
          <i className="bi bi-speedometer2 me-2"></i>
          Admin Panel
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link href="/admin/dashboard" className="nav-link">
                <i className="bi bi-house me-1"></i>Dashboard
              </Link>
            </li>
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-car-front me-1"></i>Mașini
              </a>
              <ul className="dropdown-menu">
                <li><Link href="/admin/add" className="dropdown-item">Adaugă mașină</Link></li>
                <li><Link href="/admin/list" className="dropdown-item">Lista mașini</Link></li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-calendar-check me-1"></i>Închirieri
              </a>
              <ul className="dropdown-menu">
                <li><Link href="/admin/rentals/add" className="dropdown-item">Adaugă închiriere</Link></li>
                <li><Link href="/admin/rentals/list" className="dropdown-item">Lista închirieri</Link></li>
              </ul>
            </li>
            <li className="nav-item">
              <Link href="/admin/settings" className="nav-link">
                <i className="bi bi-gear me-1"></i>Setări
              </Link>
            </li>
          </ul>
          
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link href="/" className="nav-link">
                <i className="bi bi-house me-1"></i>Vizualizează site-ul
              </Link>
            </li>
            <li className="nav-item">
              <button 
                onClick={handleLogout}
                className="nav-link btn btn-link text-light"
                style={{ textDecoration: 'none' }}
              >
                <i className="bi bi-box-arrow-right me-1"></i>Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
});

export default AdminNavbar; 