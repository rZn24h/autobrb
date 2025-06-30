'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import Link from 'next/link';
import { useConfig } from '@/hooks/useConfig';
import dynamic from 'next/dynamic';
import { getBrands } from '@/utils/apiBrands';
import BrandSuggestionsPortal from '@/components/BrandSuggestionsPortal';

// Lazy load CarCard pentru a reduce bundle size
const CarCard = dynamic(() => import('@/components/CarCard'), {
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
});

type SortOption = 'price-asc' | 'price-desc';

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Cache pentru datele mașinilor
let carsCache: any[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minute

export default function HomePage() {
  const [cars, setCars] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [marca, setMarca] = useState('');
  const [searchMarca, setSearchMarca] = useState('');
  const [filteredMarci, setFilteredMarci] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pretMin, setPretMin] = useState('');
  const [pretMax, setPretMax] = useState('');
  const [sortBy, setSortBy] = useState<SortOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<string[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const { config, loading: loadingConfig } = useConfig();
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch brands from Firestore
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoadingBrands(true);
        const brandsData = await getBrands();
        const brandNames = brandsData.map(brand => brand.name).sort();
        setBrands(brandNames);
      } catch (error) {
        console.error('Error fetching brands:', error);
        // Fallback to extracting from cars if brands fetch fails
        const fallbackBrands = Array.from(new Set(cars.map(car => car.marca).filter(Boolean))).sort();
        setBrands(fallbackBrands);
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, [cars]);

  // Filter brands based on search input - memoized
  const filteredBrands = useMemo(() => {
    const searchTerm = searchMarca.trim().toLowerCase();
    if (searchTerm) {
      return brands.filter(marca => 
        marca.toLowerCase().includes(searchTerm)
      );
    }
    return brands;
  }, [searchMarca, brands]);

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
      setFilteredMarci(brands);
    }
  }, [brands]);

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

  // Fetch cars with caching
  useEffect(() => {
    const fetchCars = async () => {
      const now = Date.now();
      
      // Use cache if it's still valid
      if (carsCache.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
        setCars(carsCache);
        setFiltered(carsCache);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const q = query(collection(db, 'cars'), orderBy('createdAt', 'desc'), limit(50));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Update cache
        carsCache = data;
        lastFetchTime = now;
        
        setCars(data);
        setFiltered(data);
      } catch (error) {
        console.error('Error fetching cars:', error);
        // Fallback to cache if available
        if (carsCache.length > 0) {
          setCars(carsCache);
          setFiltered(carsCache);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  // Handle sort - memoized
  const handleSort = useCallback((option: SortOption) => {
    setSortBy(current => current === option ? null : option);
  }, []);

  // Filter and sort cars - memoized
  useEffect(() => {
    let result = [...cars];

    // Filter by brand
    if (marca) {
      result = result.filter(car => 
        car.marca && car.marca.toLowerCase().includes(marca.toLowerCase())
      );
    }

    // Filter by price range
    if (pretMin) {
      result = result.filter(car => car.pret >= Number(pretMin));
    }
    if (pretMax) {
      result = result.filter(car => car.pret <= Number(pretMax));
    }

    // Sort
    if (sortBy) {
      result.sort((a, b) => {
        if (sortBy === 'price-asc') {
          return a.pret - b.pret;
        } else {
          return b.pret - a.pret;
        }
      });
    }

    setFiltered(result);
  }, [cars, marca, pretMin, pretMax, sortBy]);

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
          <img 
            src={config.bannerImg} 
            alt="Banner" 
            className="position-absolute w-100 h-100"
            style={{
              objectFit: 'cover',
              top: 0,
              left: 0,
              zIndex: 0
            }}
            loading="eager"
          />
        ) : (
          <div 
            className="position-absolute w-100 h-100"
            style={{
              backgroundColor: 'var(--color-primary)',
              top: 0,
              left: 0,
              zIndex: 0
            }}
          />
        )}
        
        {/* Overlay for better text readability */}
        <div 
          className="position-absolute w-100 h-100" 
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            top: 0,
            left: 0,
            zIndex: 1
          }}
        />
        
        {/* Centered Content */}
        <div className="container position-relative text-center px-4" style={{ zIndex: 2 }}>
          {loadingConfig ? (
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Se încarcă configurarea...</span>
            </div>
          ) : (
            <>
              <h1 className="display-4 fw-bold mb-4">{config?.nume || 'Anunțuri Auto'}</h1>
              {config?.sloganVanzari ? (
                <p className="lead mb-0">{config.sloganVanzari}</p>
              ) : config?.slogan ? (
                <p className="lead mb-0">{config.slogan}</p>
              ) : null}

              {/* Search Section */}
              <div className="search-container mt-4">
                <div className="search-bar">
                  {/* Brand Search */}
                  <div className="search-bar-item">
                    <label className="form-label text-white">Marcă</label>
                    <div className="position-relative">
                      <input
                        ref={inputRef}
                        type="text"
                        className="form-control form-control-lg"
                        placeholder={loadingBrands ? "Se încarcă mărcile..." : "Caută marcă..."}
                        value={searchMarca}
                        onChange={handleBrandInputChange}
                        onFocus={() => {
                          setShowSuggestions(true);
                          if (!searchMarca.trim()) {
                            setFilteredMarci(brands);
                          }
                        }}
                        disabled={loadingBrands}
                      />
                      <BrandSuggestionsPortal anchorRef={inputRef} visible={showSuggestions && filteredMarci.length > 0}>
                        <div className="brand-suggestions">
                          <ul>
                            {filteredMarci.slice(0, 10).map((marca, index) => (
                              <li
                                key={index}
                                onClick={() => handleBrandSelect(marca)}
                                className="suggestion-item"
                              >
                                {marca}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </BrandSuggestionsPortal>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="search-bar-item">
                    <label className="form-label text-white">Preț minim</label>
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      placeholder="Preț minim"
                      value={pretMin}
                      onChange={(e) => setPretMin(e.target.value)}
                    />
                  </div>

                  <div className="search-bar-item">
                    <label className="form-label text-white">Preț maxim</label>
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      placeholder="Preț maxim"
                      value={pretMax}
                      onChange={(e) => setPretMax(e.target.value)}
                    />
                  </div>

                  {/* Reset Button */}
                  <div className="search-bar-item">
                    <label className="form-label text-white">&nbsp;</label>
                    <button
                      className="btn btn-danger btn-lg w-100"
                      onClick={handleReset}
                    >
                      Resetează filtrele
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="main-container py-5">
        {/* Listings Container */}
        <div className="listings-container">
          <div className="listings-header mb-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <h2 className="h3 mb-0 text-light">Anunțuri disponibile</h2>
              <div className="sort-controls d-flex gap-2 flex-wrap">
                <button
                  className={`btn ${sortBy === 'price-asc' ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={() => handleSort('price-asc')}
                >
                  <i className="bi bi-sort-numeric-down me-1"></i>
                  Preț crescător
                </button>
                <button
                  className={`btn ${sortBy === 'price-desc' ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={() => handleSort('price-desc')}
                >
                  <i className="bi bi-sort-numeric-up-alt me-1"></i>
                  Preț descrescător
                </button>
              </div>
            </div>
          </div>

          {/* Cars Grid */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Se încarcă anunțurile...</span>
              </div>
            </div>
          ) : filtered.length > 0 ? (
            <div className="listings-grid">
              {filtered.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted mb-0">Nu am găsit anunțuri care să corespundă criteriilor tale.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
