'use client';

import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminNavbar from '@/components/AdminNavbar';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const menu = [
    {
      label: 'Adăugare anunț auto',
      route: '/admin/add',
      desc: 'Adaugă un anunț nou în parcul auto',
      icon: 'bi-plus-circle',
      category: 'Vânzări'
    },
    {
      label: 'Administrare anunțuri',
      route: '/admin/list',
      desc: 'Gestionează toate anunțurile existente',
      icon: 'bi-list-ul',
      category: 'Vânzări'
    },
    {
      label: 'Adăugare închiriere',
      route: '/admin/rentals/add',
      desc: 'Adaugă o închiriere nouă în parcul auto',
      icon: 'bi-plus-circle',
      category: 'Închirieri'
    },
    {
      label: 'Administrare închirieri',
      route: '/admin/rentals/list',
      desc: 'Gestionează toate închirierile existente',
      icon: 'bi-list-ul',
      category: 'Închirieri'
    },
    {
      label: 'Setări parc auto',
      route: '/admin/settings',
      desc: 'Configurează setările generale ale site-ului',
      icon: 'bi-gear',
      category: 'Configurare'
    },
  ];

  const categories = ['Vânzări', 'Închirieri', 'Configurare'];

  return (
    <AdminAuthGuard>
      <AdminNavbar />
      <div className="container py-4">
        <h1 className="mb-4 text-light">Dashboard Admin</h1>
        
        {categories.map(category => (
          <div key={category} className="mb-5">
            <h2 className="h4 mb-4 text-light">{category}</h2>
            <div className="row g-4">
              {menu
                .filter(item => item.category === category)
                .map(item => (
                  <div className="col-md-6 col-lg-4" key={item.route}>
                    <div className="card h-100 shadow-sm" style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)' }}>
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <i className={`bi ${item.icon} fs-2 me-3 text-primary`}></i>
                          <h5 className="card-title mb-0 text-light">{item.label}</h5>
                        </div>
                        <p className="card-text text-light" style={{ color: 'var(--gray-300)' }}>{item.desc}</p>
                        <Link 
                          href={item.route} 
                          className="btn btn-primary w-100"
                        >
                          Accesează
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </AdminAuthGuard>
  );
} 