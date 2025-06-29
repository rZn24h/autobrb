'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import Link from 'next/link';
import { useConfig } from '@/hooks/useConfig';
import dynamic from 'next/dynamic';
import React from 'react';

// Lazy load CarCard pentru a reduce bundle size
const CarCard = dynamic(
  () => import('@/components/CarCard').then(mod => {
    // Wrap with forwardRef to preserve props
    return React.forwardRef((props: any, ref) => <mod.default {...props} type="rental" ref={ref} />);
  }),
  {
    loading: () => <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: 'var(--gray-800)' }}>
      <div className="placeholder-glow">
        <div className="placeholder" style={{ height: '200px' }}></div>
        <div className="card-body">
          <div className="placeholder col-8 mb-2"></div>
          <div className="placeholder col-6"></div>
        </div>
      </div>
    </div>,
    ssr: false
  }
);

type SortOption = 'price-asc' | 'price-desc';

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Cache pentru datele mașinilor de închiriat
let rentalsCache: any[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minute

// Helper function to extract first price from price string
const extractFirstPrice = (priceString: string): number => {
  if (!priceString) return 0;
  // If it's a simple number, return it
  const simpleNumber = Number(priceString);
  if (!isNaN(simpleNumber)) return simpleNumber;
  // If it contains intervals (like "3 zile: 100 €/zi, 7 zile: 80 €/zi")
  if (priceString.includes(':')) {
    const firstInterval = priceString.split(',')[0]?.trim();
    if (firstInterval) {
      // Extract price from "X zile: Y €/zi" format
      const match = firstInterval.match(/(\d+)\s*€/);
      if (match) {
        return Number(match[1]);
      }
    }
  }
  // Fallback: try to extract any number from the string
  const numberMatch = priceString.match(/(\d+)/);
  return numberMatch ? Number(numberMatch[1]) : 0;
};

export default function RentalsPage() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [marca, setMarca] = useState('');
  const [searchMarca, setSearchMarca] = useState('');
  const [filteredMarci, setFilteredMarci] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pretMin, setPretMin] = useState('');
  const [pretMax, setPretMax] = useState('');
  const [sortBy, setSortBy] = useState<SortOption | null>(null);
  const [loading, setLoading] = useState(true);
  const { config, loading: loadingConfig } = useConfig();

  // Extract unique brands from rentals - memoized
  const allMarci = useMemo(() => {
    return Array.from(new Set(rentals.map(rental => rental.marca).filter(Boolean))).sort();
  }, [rentals]);

  // Filter brands based on search input - memoized
  const filteredBrands = useMemo(() => {
    const searchTerm = searchMarca.trim().toLowerCase();
    if (searchTerm) {
      return allMarci.filter(marca => 
        marca.toLowerCase().includes(searchTerm)
      );
    }
    return allMarci;
  }, [searchMarca, allMarci]);

  // Update filtered brands when search changes
  useEffect(() => {
    setFilteredMarci(filteredBrands);
    setShowSuggestions(!!searchMarca.trim());
  }, [filteredBrands, searchMarca]);

  // Handle brand selection - memoized
  const handleBrandSelect = useCallback((selectedMarca: string) => {
    setMarca(selectedMarca);
    setSearchMarca(selectedMarca);
    setShowSuggestions(false);
  }, []);

  // Handle input change - memoized
  const handleBrandInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchMarca(value);
    setShowSuggestions(true);
    if (!value.trim()) {
      setMarca('');
      setFilteredMarci(allMarci);
    }
  }, [allMarci]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-bar-item')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch rentals with caching
  useEffect(() => {
    const fetchRentals = async () => {
      const now = Date.now();
      
      // Use cache if it's still valid
      if (rentalsCache.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
        setRentals(rentalsCache);
        setFiltered(rentalsCache);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const q = query(collection(db, 'rentals'), orderBy('createdAt', 'desc'), limit(50));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Update cache
        rentalsCache = data;
        lastFetchTime = now;
        
        setRentals(data);
        setFiltered(data);
      } catch (error) {
        console.error('Error fetching rentals:', error);
        // Fallback to cache if available
        if (rentalsCache.length > 0) {
          setRentals(rentalsCache);
          setFiltered(rentalsCache);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRentals();
  }, []);

  // Handle sort - memoized
  const handleSort = useCallback((option: SortOption) => {
    setSortBy(current => current === option ? null : option);
  }, []);

  // Apply filters and sorting - memoized
  const filteredAndSortedRentals = useMemo(() => {
    let result = rentals;
    
    // Apply filters
    if (marca) {
      result = result.filter(rental => 
        rental.marca?.toLowerCase().includes(marca.toLowerCase())
      );
    }
    
    // Price filtering - extract first price for comparison
    if (pretMin || pretMax) {
      result = result.filter(rental => {
        const firstPrice = extractFirstPrice(rental.pret);
        if (pretMin && firstPrice < Number(pretMin)) return false;
        if (pretMax && firstPrice > Number(pretMax)) return false;
        return true;
      });
    }
    
    // Apply sorting if selected
    if (sortBy) {
      result = [...result].sort((a, b) => {
        const priceA = extractFirstPrice(a.pret);
        const priceB = extractFirstPrice(b.pret);
        return sortBy === 'price-asc' ? priceA - priceB : priceB - priceA;
      });
    }
    
    return result;
  }, [marca, pretMin, pretMax, rentals, sortBy]);

  // Update filtered rentals when filters change
  useEffect(() => {
    setFiltered(filteredAndSortedRentals);
  }, [filteredAndSortedRentals]);

  // Handle reset - memoized
  const handleReset = useCallback(() => {
    setMarca('');
    setSearchMarca('');
    setPretMin('');
    setPretMax('');
    setSortBy(null);
    setShowSuggestions(false);
  }, []);

  // Loader global doar pentru config (nu și pentru rentals)
  if (loadingConfig) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Se încarcă...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Hero Section with Banner */}
      <section 
        className="hero-section position-relative d-flex align-items-center justify-content-center text-white"
        style={{
          minHeight: '60vh',
          backgroundColor: '#f8f9fa',
          marginTop: '-56px'
        }}
      >
        {/* Banner Image */}
        {config?.bannerImg ? (
          <div 
            className="position-absolute w-100 h-100"
            style={{
              backgroundImage: `url(${config.bannerImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: 'brightness(0.3)'
            }}
          />
        ) : (
          <div 
            className="position-absolute w-100 h-100"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          />
        )}
        
        {/* Content */}
        <div 
          className="position-relative text-center px-3 d-flex flex-column align-items-center justify-content-center w-100"
          style={{
            zIndex: 20,
            pointerEvents: 'auto',
            top: 0,
          }}
        >
          <div 
            className="d-inline-block px-4 py-3 rounded-4 shadow-lg mb-4"
            style={{
              background: 'rgba(30, 30, 30, 0.55)',
              backdropFilter: 'blur(2px)',
              boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
              maxWidth: '700px',
            }}
          >
            <h1 
              className="display-4 fw-bold mb-3 text-white text-glow"
              style={{
                textShadow: '0 2px 16px rgba(0,0,0,0.7), 0 0 8px #fff',
                letterSpacing: '1px',
              }}
            >
              Închirieri Auto
            </h1>
            {config?.sloganInchirieri ? (
              <p 
                className="lead mb-0 text-white"
                style={{
                  textShadow: '0 2px 8px rgba(0,0,0,0.7), 0 0 4px #fff',
                  fontWeight: 500,
                }}
              >{config.sloganInchirieri}</p>
            ) : config?.slogan ? (
              <p 
                className="lead mb-0 text-white"
                style={{
                  textShadow: '0 2px 8px rgba(0,0,0,0.7), 0 0 4px #fff',
                  fontWeight: 500,
                }}
              >{config.slogan}</p>
            ) : null}
          </div>
          {/* Bara de căutare refăcută, inspirată de vânzări */}
          <div className="container mt-4 d-flex flex-column align-items-center justify-content-center">
            <div className="search-container p-2 p-md-3 rounded-5 shadow mx-auto" style={{ maxWidth: 700, background: 'rgba(255,255,255,0.98)', border: '1.5px solid #ececec', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
              <div className="search-bar w-100">
                {/* Brand Search */}
                <div className="search-bar-item text-center">
                  <label className="form-label fw-semibold text-dark mb-1" style={{fontSize: '1rem'}}>Marcă</label>
                  <div className="position-relative">
                    <input
                      type="text"
                      className="form-control rounded-4 px-3 py-2"
                      style={{ fontSize: '1rem', minHeight: 38, background: '#f8f9fa', border: '1px solid #e0e0e0' }}
                      placeholder="Caută marcă..."
                      value={searchMarca}
                      onChange={handleBrandInputChange}
                      onFocus={() => {
                        setShowSuggestions(true);
                        if (!searchMarca.trim()) {
                          setFilteredMarci(allMarci);
                        }
                      }}
                    />
                    {showSuggestions && filteredMarci.length > 0 && (
                      <div className="brand-suggestions position-absolute w-100 mt-1" style={{ zIndex: 1000 }}>
                        <ul className="list-group shadow-sm">
                          {filteredMarci.slice(0, 8).map((marca, index) => (
                            <li
                              key={index}
                              onClick={() => handleBrandSelect(marca)}
                              className="list-group-item list-group-item-action"
                              style={{ cursor: 'pointer' }}
                            >
                              {marca}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                {/* Price Range */}
                <div className="search-bar-item text-center">
                  <label className="form-label fw-semibold text-dark mb-1" style={{fontSize: '1rem'}}>Preț minim</label>
                  <input
                    type="number"
                    className="form-control rounded-4 px-3 py-2"
                    style={{ fontSize: '1rem', minHeight: 38, background: '#f8f9fa', border: '1px solid #e0e0e0' }}
                    placeholder="Preț minim"
                    value={pretMin}
                    onChange={(e) => setPretMin(e.target.value)}
                  />
                </div>
                <div className="search-bar-item text-center">
                  <label className="form-label fw-semibold text-dark mb-1" style={{fontSize: '1rem'}}>Preț maxim</label>
                  <input
                    type="number"
                    className="form-control rounded-4 px-3 py-2"
                    style={{ fontSize: '1rem', minHeight: 38, background: '#f8f9fa', border: '1px solid #e0e0e0' }}
                    placeholder="Preț maxim"
                    value={pretMax}
                    onChange={(e) => setPretMax(e.target.value)}
                  />
                </div>
                {/* Reset Button */}
                <div className="search-bar-item d-flex align-items-end justify-content-center">
                  <button
                    className="btn btn-outline-danger w-100 rounded-4 px-3 py-2"
                    style={{ fontSize: '1rem', minHeight: 38, border: '1.5px solid #dc3545' }}
                    onClick={handleReset}
                  >
                    Resetează filtrele
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Butoane de sortare sub bara de căutare, deasupra listei */}
      <div className="container mt-4 mb-2">
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-end">
          <button
            onClick={() => handleSort('price-asc')}
            className={`btn btn-lg ${sortBy === 'price-asc' ? 'btn-danger' : 'btn-outline-danger'} shadow-sm`}
            title="Sortează după preț (crescător)"
            style={{ borderRadius: '12px', padding: '12px 20px', minWidth: '120px' }}
          >
            <i className="bi bi-sort-numeric-up me-2"></i>
            Preț ↑
          </button>
          <button
            onClick={() => handleSort('price-desc')}
            className={`btn btn-lg ${sortBy === 'price-desc' ? 'btn-danger' : 'btn-outline-danger'} shadow-sm`}
            title="Sortează după preț (descrescător)"
            style={{ borderRadius: '12px', padding: '12px 20px', minWidth: '120px' }}
          >
            <i className="bi bi-sort-numeric-down me-2"></i>
            Preț ↓
          </button>
        </div>
      </div>

      {/* Results Section - loader doar pe gridul de anunțuri */}
      <section 
        className="py-5" 
        style={{ 
          backgroundColor: 'var(--background-main)',
          marginTop: '0px'
        }}
      >
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h4 mb-0 text-light">
              <i className="bi bi-car-front me-2"></i>
              {filtered.length} mașin{filtered.length === 1 ? 'ă' : filtered.length < 20 ? 'i' : ''} de închiriat
            </h2>
          </div>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Se încarcă...</span>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5">
              <div 
                className="bg-light rounded-4 p-5 shadow-sm"
                style={{ backgroundColor: 'var(--gray-800) !important' }}
              >
                <i className="bi bi-search display-1 text-muted mb-3"></i>
                <h3 className="text-light mb-3">Nu s-au găsit mașini de închiriat</h3>
                <p className="text-light opacity-75 mb-4">
                  Încearcă să modifici filtrele sau să revii mai târziu.
                </p>
                <button 
                  onClick={handleReset} 
                  className="btn btn-danger btn-lg px-4"
                  style={{ borderRadius: '12px' }}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Resetează filtrele
                </button>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {filtered.map((rental) => (
                <div key={rental.id} className="col-md-6 col-lg-4">
                  <CarCard car={rental} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <style jsx>{`
        .search-bar {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.7rem;
        }
        .search-bar-item {
          width: 100%;
        }
        @media (min-width: 768px) {
          .search-bar {
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
        }
        @media (min-width: 992px) {
          .search-bar {
            grid-template-columns: repeat(4, 1fr);
            gap: 1.5rem;
            align-items: end;
          }
          .search-bar-item {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
} 