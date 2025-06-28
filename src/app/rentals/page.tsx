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

  return (
    <div className="page-wrapper">
      {/* Hero Section with Banner */}
      <section 
        className="hero-section position-relative d-flex align-items-center justify-content-center text-white"
        style={{
          minHeight: '50vh',
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
        <div className="position-relative text-center px-3">
          <h1 className="display-4 fw-bold mb-3">
            Închirieri Auto
          </h1>
          {config?.sloganInchirieri ? (
            <p className="lead mb-0">{config.sloganInchirieri}</p>
          ) : config?.slogan ? (
            <p className="lead mb-0">{config.slogan}</p>
          ) : null}
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-4" style={{ backgroundColor: 'var(--background-main)' }}>
        <div className="container">
          <div className="row g-3">
            {/* Brand Search */}
            <div className="col-md-4">
              <div className="search-bar-item position-relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Caută după marcă..."
                  value={searchMarca}
                  onChange={handleBrandInputChange}
                  style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)', color: 'var(--text-light)' }}
                />
                {showSuggestions && filteredMarci.length > 0 && (
                  <div className="position-absolute w-100 mt-1" style={{ zIndex: 1000 }}>
                    <div className="list-group" style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)' }}>
                      {filteredMarci.slice(0, 8).map((marca, index) => (
                        <button
                          key={index}
                          type="button"
                          className="list-group-item list-group-item-action text-start"
                          onClick={() => handleBrandSelect(marca)}
                          style={{ 
                            backgroundColor: 'var(--gray-800)', 
                            border: '1px solid var(--gray-700)', 
                            color: 'var(--text-light)',
                            borderTop: index === 0 ? '1px solid var(--gray-700)' : 'none'
                          }}
                        >
                          {marca}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price Range */}
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Preț min (€/zi)"
                value={pretMin}
                onChange={(e) => setPretMin(e.target.value)}
                style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)', color: 'var(--text-light)' }}
              />
            </div>
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Preț max (€/zi)"
                value={pretMax}
                onChange={(e) => setPretMax(e.target.value)}
                style={{ backgroundColor: 'var(--gray-800)', border: '1px solid var(--gray-700)', color: 'var(--text-light)' }}
              />
            </div>

            {/* Sort and Reset */}
            <div className="col-md-2">
              <div className="d-flex gap-2">
                <button
                  onClick={() => handleSort('price-asc')}
                  className={`btn btn-sm ${sortBy === 'price-asc' ? 'btn-danger' : 'btn-outline-danger'}`}
                  title="Sortează după preț (crescător) - primul preț din card"
                >
                  <i className="bi bi-sort-numeric-up"></i>
                </button>
                <button
                  onClick={() => handleSort('price-desc')}
                  className={`btn btn-sm ${sortBy === 'price-desc' ? 'btn-danger' : 'btn-outline-danger'}`}
                  title="Sortează după preț (descrescător) - primul preț din card"
                >
                  <i className="bi bi-sort-numeric-down"></i>
                </button>
                <button
                  onClick={handleReset}
                  className="btn btn-sm btn-outline-secondary"
                  title="Resetează filtrele"
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
              </div>
            </div>
          </div>
          
          {/* Info note about sorting */}
          {sortBy && (
            <div className="row mt-2">
              <div className="col-12">
                <small className="text-light opacity-75">
                  <i className="bi bi-info-circle me-1"></i>
                  Sortarea se face după primul preț afișat în fiecare card (cel mai scurt interval de închiriere).
                </small>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="py-4" style={{ backgroundColor: 'var(--background-main)' }}>
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Se încarcă...</span>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5">
              <h3 className="text-light mb-3">Nu s-au găsit mașini de închiriat</h3>
              <p className="text-light opacity-75 mb-4">
                Încearcă să modifici filtrele sau să revii mai târziu.
              </p>
              <button onClick={handleReset} className="btn btn-danger">
                Resetează filtrele
              </button>
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h4 mb-0 text-light">
                  {filtered.length} mașin{filtered.length === 1 ? 'ă' : filtered.length < 20 ? 'i' : ''} de închiriat
                </h2>
              </div>
              
              <div className="row g-4">
                {filtered.map((rental) => (
                  <div key={rental.id} className="col-md-6 col-lg-4">
                    <CarCard car={rental} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
} 