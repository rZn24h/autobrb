'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { collection, getDocs, query, orderBy, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import Link from 'next/link';
import Image from 'next/image';
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

// Pagination constants - optimizat pentru mobile
const INITIAL_LIMIT = 6;
const LOAD_MORE_LIMIT = 6;
const PRIORITY_IMAGES_COUNT = 3; // Redus pentru mobile

export default function HomePage() {
  const [cars, setCars] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [displayedCars, setDisplayedCars] = useState<any[]>([]);
  const [marca, setMarca] = useState('');
  const [searchMarca, setSearchMarca] = useState('');
  const [filteredMarci, setFilteredMarci] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pretMin, setPretMin] = useState('');
  const [pretMax, setPretMax] = useState('');
  const [sortBy, setSortBy] = useState<SortOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [brands, setBrands] = useState<string[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const { config, loading: loadingConfig } = useConfig();
  const inputRef = useRef<HTMLInputElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Fetch brands from Firestore - optimizat cu useCallback
  const fetchBrands = useCallback(async () => {
    try {
      setLoadingBrands(true);
      const brandsData = await getBrands();
      const brandNames = brandsData.map(brand => brand.name).sort();
      setBrands(brandNames);
    } catch (error) {
      console.error('Error fetching brands:', error);
      const fallbackBrands = Array.from(new Set(cars.map(car => car.marca).filter(Boolean))).sort();
      setBrands(fallbackBrands);
    } finally {
      setLoadingBrands(false);
    }
  }, [cars]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

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
    if (!searchMarca.trim() && showSuggestions) {
      setFilteredMarci(brands);
    }
  }, [filteredBrands, searchMarca, showSuggestions, brands]);

  // Handle brand selection - memoized
  const handleBrandSelect = useCallback((selectedMarca: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    setMarca(selectedMarca);
    setSearchMarca(selectedMarca);
    setShowSuggestions(false);
    
    if (inputRef.current) {
      inputRef.current.value = selectedMarca;
    }
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.value = selectedMarca;
      }
    }, 10);
  }, []);

  // Handle input change - memoized
  const handleBrandInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchMarca(value);
    setShowSuggestions(true);
    if (!value.trim()) {
      setMarca('');
      setFilteredMarci(brands);
    } else {
      setMarca(value);
    }
  }, [brands]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (target.closest('.brand-suggestions') || target.closest('.suggestion-item')) {
        return;
      }
      
      if (target.closest('input[type="text"]')) {
        return;
      }
      
      if (!target.closest('.search-bar-item')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch initial cars - optimizat
  const fetchInitialCars = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'cars'), orderBy('createdAt', 'desc'), limit(INITIAL_LIMIT));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setCars(data);
      setFiltered(data);
      setHasMore(snap.docs.length === INITIAL_LIMIT);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialCars();
  }, [fetchInitialCars]);

  // Load more cars function - optimizat cu IntersectionObserver
  const loadMoreCars = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const lastDoc = cars[cars.length - 1];
      if (!lastDoc) return;
      
      const q = query(
        collection(db, 'cars'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc.createdAt),
        limit(LOAD_MORE_LIMIT)
      );
      
      const snap = await getDocs(q);
      const newCars = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (newCars.length > 0) {
        setCars(prevCars => [...prevCars, ...newCars]);
        setHasMore(newCars.length === LOAD_MORE_LIMIT);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more cars:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [cars, loadingMore, hasMore]);

  // Setup intersection observer for infinite scroll - optimizat
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreCars();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // Încarcă mai devreme pentru UX mai bun
      }
    );

    observer.observe(loadMoreRef.current);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadingMore, loadMoreCars]);

  // Handle sort - memoized
  const handleSort = useCallback((option: SortOption) => {
    setSortBy(current => current === option ? null : option);
  }, []);

  // Filter and sort cars - memoized și optimizat
  useEffect(() => {
    let result = [...cars];

    // Filter by brand
    if (marca) {
      result = result.filter(car => {
        const carMarca = car.marca ? car.marca.toLowerCase() : '';
        const searchMarca = marca.toLowerCase();
        return carMarca.includes(searchMarca);
      });
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
      {/* Hero Section with Banner - optimizat */}
      <section 
        className="hero-section position-relative d-flex align-items-center justify-content-center text-white"
        style={{
          minHeight: '50vh',
          backgroundColor: '#f8f9fa',
          marginTop: '-56px'
        }}
      >
        {/* Banner Image - optimizat cu priority */}
        {config?.bannerImg ? (
          <Image
            src={config.bannerImg}
            alt="Banner AutoBRB"
            fill
            priority
            className="position-absolute"
            style={{
              objectFit: 'cover',
              zIndex: 0
            }}
            sizes="100vw"
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLDSBGLwGXXKmSGfLzBgRGC5bLAJkpb0bLWQz8jLYJLpbKYdFqg2AzIZsxjnOEcYDXDJOjDpGcILRiHEgVmxhDEgZzQjkJIKRBBOOBvABGXMwQQfHgIIE/9k="
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

              {/* Search Section - optimizat pentru mobile */}
              <div className="search-container mt-4 d-flex justify-content-center">
                <div className="search-bar w-100">
                  {/* Brand Search */}
                  <div className="search-bar-item">
                    <label className="form-label text-dark" style={{ fontSize: '1.18rem', textAlign: 'center', marginBottom: 8 }}>Marcă</label>
                    <div className="position-relative w-100">
                      <input
                        ref={inputRef}
                        type="text"
                        className="form-control form-control-lg"
                        placeholder={loadingBrands ? "Se încarcă mărcile..." : "Caută marcă..."}
                        value={searchMarca}
                        onChange={handleBrandInputChange}
                        onFocus={() => {
                          setShowSuggestions(true);
                          setFilteredMarci(brands);
                        }}
                        onClick={() => {
                          setShowSuggestions(true);
                          setFilteredMarci(brands);
                        }}
                        disabled={loadingBrands}
                        style={{ background: '#fff', color: '#000', width: '100%', fontSize: '1.45rem', padding: '22px 32px', minHeight: 70, height: '100%' }}
                      />
                      {showSuggestions && filteredMarci.length > 0 && (
                        <div 
                          className="brand-suggestions"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            zIndex: 99999,
                            pointerEvents: 'auto',
                            background: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: 8,
                            maxHeight: 152,
                            overflowY: 'auto',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                          }}
                        >
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                            {filteredMarci.slice(0, 10).map((marca, index) => (
                              <li
                                key={index}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleBrandSelect(marca, e); }}
                                onMouseDown={(e) => e.preventDefault()}
                                className="suggestion-item"
                                style={{ cursor: 'pointer', userSelect: 'none', pointerEvents: 'auto', zIndex: 99999, color: '#111', background: '#fff', padding: '16px 24px', fontSize: '1.15rem', minHeight: 56, height: 'auto', whiteSpace: 'normal' }}
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
                  <div className="search-bar-item">
                    <label className="form-label text-dark" style={{ fontSize: '1.18rem', textAlign: 'center', marginBottom: 8 }}>Preț minim</label>
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      placeholder="Preț minim"
                      value={pretMin}
                      onChange={(e) => setPretMin(e.target.value)}
                      style={{ background: '#fff', color: '#000', width: '100%', fontSize: '1.45rem', padding: '22px 32px', minHeight: 70, height: '100%' }}
                    />
                  </div>
                  <div className="search-bar-item">
                    <label className="form-label text-dark" style={{ fontSize: '1.18rem', textAlign: 'center', marginBottom: 8 }}>Preț maxim</label>
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      placeholder="Preț maxim"
                      value={pretMax}
                      onChange={(e) => setPretMax(e.target.value)}
                      style={{ background: '#fff', color: '#000', width: '100%', fontSize: '1.45rem', padding: '22px 32px', minHeight: 70, height: '100%' }}
                    />
                  </div>
                  {/* Reset Button */}
                  <div className="search-bar-item">
                    <label className="form-label text-dark" style={{ fontSize: '1.18rem', textAlign: 'center', marginBottom: 8 }}>&nbsp;</label>
                    <button
                      className="btn btn-danger btn-lg w-100"
                      onClick={handleReset}
                      style={{ fontSize: '1.45rem', padding: '22px 32px', minHeight: 70, height: '100%' }}
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

      {/* Main Content - optimizat pentru mobile */}
      <div className="main-container py-5">
        <div className="listings-container">
          <div className="listings-header mb-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 w-100">
              <h2 className="h3 mb-0 text-light">Anunțuri disponibile</h2>
              <div className="sort-controls d-flex flex-row flex-wrap gap-2 justify-content-center align-items-center mt-2 mt-lg-0">
                <button
                  className={`btn ${sortBy === 'price-asc' ? 'btn-danger' : 'btn-outline-danger'} fw-semibold`}
                  onClick={() => handleSort('price-asc')}
                  style={{ fontSize: '1.15rem', minHeight: 48 }}
                >
                  <i className="bi bi-sort-numeric-down me-1"></i>
                  Preț crescător
                </button>
                <button
                  className={`btn ${sortBy === 'price-desc' ? 'btn-danger' : 'btn-outline-danger'} fw-semibold`}
                  onClick={() => handleSort('price-desc')}
                  style={{ fontSize: '1.15rem', minHeight: 48 }}
                >
                  <i className="bi bi-sort-numeric-up-alt me-1"></i>
                  Preț descrescător
                </button>
              </div>
            </div>
          </div>

          {/* Cars Grid - optimizat cu lazy loading */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Se încarcă anunțurile...</span>
              </div>
            </div>
          ) : filtered.length > 0 ? (
            <>
              <div className="listings-grid mt-5">
                {filtered.map((car, index) => (
                  <CarCard key={car.id} car={car} priority={index < PRIORITY_IMAGES_COUNT} />
                ))}
              </div>
              
              {/* Load More Trigger - optimizat cu IntersectionObserver */}
              {hasMore && (
                <div ref={loadMoreRef} className="text-center py-4">
                  {loadingMore ? (
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Se încarcă mai multe anunțuri...</span>
                    </div>
                  ) : (
                    <div className="text-muted">Derulează pentru mai multe anunțuri</div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted mb-0">Nu am găsit anunțuri care să corespundă criteriilor tale.</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .listings-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 600px) {
          .listings-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 992px) {
          .listings-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .car-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 90%;
        }
        .spec-text {
          font-size: 1.05rem;
        }
        .search-container {
          max-width: 1100px;
          margin: 0 auto;
        }
        .search-bar {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 600px) {
          .search-bar {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
        }
        @media (min-width: 1200px) {
          .search-bar {
            grid-template-columns: repeat(4, 1fr);
            justify-items: center;
            align-items: stretch;
            gap: 2.2rem;
          }
          .search-bar-item {
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
            height: 100%;
          }
          .search-bar-item input[type="text"],
          .search-bar-item input[type="number"] {
            background: #23262b;
            color: #fff;
            border: none;
            border-radius: 12px;
            font-size: 1.08rem;
            font-weight: 500;
            padding: 8px 32px;
            height: 38px;
            min-height: 38px;
            max-height: 38px;
            max-width: 520px;
            width: 100%;
            margin: 0 auto;
            box-sizing: border-box;
          }
          .search-bar-item button {
            background: #dc3545;
            color: #fff;
            border: none;
            border-radius: 12px;
            font-size: 1.08rem;
            font-weight: 600;
            padding: 8px 36px;
            height: 38px;
            min-height: 38px;
            max-height: 38px;
            max-width: 520px;
            width: 100%;
            margin: 0 auto;
            box-sizing: border-box;
            transition: background 0.2s;
            white-space: normal;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .search-bar-item button:hover {
            background: #b91c2b;
          }
          .search-bar-item label {
            color: #fff;
            text-align: center;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 1.08rem;
          }
        }
        .search-bar-item input,
        .search-bar-item button {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          font-size: 1.08rem;
          padding: 8px 32px;
          min-height: 38px;
          max-height: 38px;
          border-radius: 12px;
          box-sizing: border-box;
          border: none;
        }
        .search-bar-item label {
          font-weight: 600;
          font-size: 1.08rem;
          color: #fff;
          text-align: center;
          margin-bottom: 8px;
        }
        .brand-suggestions {
          max-width: 350px !important;
          width: 100% !important;
          left: 0;
          right: 0;
          margin: 0 auto;
          max-height: 152px !important;
          overflow-y: auto !important;
        }
        .brand-suggestions ul {
          width: 100%;
        }
        .brand-suggestions li {
          color: #111;
          background: #fff;
          padding: 10px 16px;
          font-size: 0.98rem;
          border-bottom: 1px solid #eee;
          white-space: normal;
        }
        .brand-suggestions li:last-child {
          border-bottom: none;
        }
        .brand-suggestions li:hover {
          background: #f2f2f2;
        }
        @media (max-width: 600px) {
          .brand-suggestions {
            max-width: 100% !important;
            width: 100% !important;
          }
        }
        /* Card specs grid responsive: 2 coloane pe mobil, flex pe desktop, centrat și spacing egal */
        :global(.specs-grid) {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.9rem 2.2rem;
          justify-items: center;
          align-items: center;
          padding: 10px 0 10px 0;
        }
        :global(.spec-item) {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
        }
        :global(.spec-icon) {
          font-size: 1.35rem;
          margin-bottom: 2px;
          color: #dc3545 !important;
        }
        :global(.price-tag) {
          color: #dc3545 !important;
          font-weight: 700;
          font-size: 1.18rem;
        }
        @media (min-width: 600px) {
          :global(.specs-grid) {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem 2.8rem;
            justify-content: center;
            align-items: center;
            padding: 10px 0 10px 0;
          }
          :global(.spec-item) {
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin-left: auto;
            margin-right: auto;
          }
        }
      `}</style>
    </div>
  );
}
