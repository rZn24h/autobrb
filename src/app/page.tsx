'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import Link from 'next/link';
import { useConfig } from '@/hooks/useConfig';
import CarCard from '@/components/CarCard';

type SortOption = 'price-asc' | 'price-desc';

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

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
  const { config, loading: loadingConfig } = useConfig();

  // Extract unique brands from cars
  const allMarci = useMemo(() => {
    return Array.from(new Set(cars.map(car => car.marca).filter(Boolean))).sort();
  }, [cars]);

  // Filter brands based on search input
  useEffect(() => {
    const searchTerm = searchMarca.trim().toLowerCase();
    if (searchTerm) {
      const filtered = allMarci.filter(marca => 
        marca.toLowerCase().includes(searchTerm)
      );
      setFilteredMarci(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredMarci(allMarci);
      setShowSuggestions(false);
    }
  }, [searchMarca, allMarci]);

  // Handle brand selection
  const handleBrandSelect = (selectedMarca: string) => {
    setMarca(selectedMarca);
    setSearchMarca(selectedMarca);
    setShowSuggestions(false);
  };

  // Handle input change
  const handleBrandInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchMarca(value);
    setShowSuggestions(true);
    if (!value.trim()) {
      setMarca('');
      setFilteredMarci(allMarci);
    }
  };

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

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      const q = query(collection(db, 'cars'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCars(data);
      setFiltered(data);
      setLoading(false);
    };
    fetchCars();
  }, []);

  const handleSort = (option: SortOption) => {
    setSortBy(current => current === option ? null : option);
  };

  useEffect(() => {
    let result = cars;
    
    // Apply filters
    if (marca) {
      result = result.filter(car => 
        car.marca?.toLowerCase().includes(marca.toLowerCase())
      );
    }
    if (pretMin) result = result.filter(car => Number(car.pret) >= Number(pretMin));
    if (pretMax) result = result.filter(car => Number(car.pret) <= Number(pretMax));
    
    // Apply sorting if selected
    if (sortBy) {
      result = [...result].sort((a, b) => {
        const priceA = Number(a.pret);
        const priceB = Number(b.pret);
        return sortBy === 'price-asc' ? priceA - priceB : priceB - priceA;
      });
    }
    
    setFiltered(result);
  }, [marca, pretMin, pretMax, cars, sortBy]);

  const handleReset = () => {
    setMarca('');
    setSearchMarca('');
    setPretMin('');
    setPretMax('');
    setSortBy(null);
    setShowSuggestions(false);
  };

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
              <p className="lead mb-0">{config?.slogan || 'Descoperă mașina perfectă pentru tine!'}</p>

              {/* Search Section */}
              <div className="search-container mt-4">
                <div className="row g-3">
                  {/* Brand Search */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="position-relative search-bar-item">
                      <label className="form-label text-white">Marcă</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
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
                      {showSuggestions && (
                        <div className="brand-suggestions position-absolute w-100 bg-white shadow-sm rounded mt-1">
                          <ul className="list-unstyled m-0 p-0">
                            {filteredMarci.map((marca, index) => (
                              <li
                                key={index}
                                onClick={() => handleBrandSelect(marca)}
                                className="suggestion-item px-3 py-2 cursor-pointer"
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
                  <div className="col-12 col-sm-6 col-lg-3">
                    <label className="form-label text-white">Preț minim</label>
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      placeholder="Preț minim"
                      value={pretMin}
                      onChange={(e) => setPretMin(e.target.value)}
                    />
                  </div>

                  <div className="col-12 col-sm-6 col-lg-3">
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
                  <div className="col-12 col-lg-3">
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
            <div className="row g-4">
              {filtered.map((car) => (
                <div key={car.id} className="col-12 col-sm-6 col-md-6 col-lg-4">
                  <CarCard car={car} />
                </div>
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
