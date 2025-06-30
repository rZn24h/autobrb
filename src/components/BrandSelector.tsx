import React, { useState, useEffect } from 'react';
import { useBrands } from '@/hooks/useBrands';

interface BrandSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const BrandSelector: React.FC<BrandSelectorProps> = ({
  value,
  onChange,
  error,
  disabled = false
}) => {
  const { brands, loading, addNewBrand } = useBrands();
  const [selectedOption, setSelectedOption] = useState<'existing' | 'new'>('existing');
  const [newBrandName, setNewBrandName] = useState('');
  const [brandError, setBrandError] = useState<string>('');

  // Actualizează valoarea când se schimbă selecția
  useEffect(() => {
    if (selectedOption === 'existing') {
      onChange(value);
    } else {
      onChange(newBrandName);
    }
  }, [selectedOption, value, newBrandName, onChange]);

  // Curăță erorile când se schimbă selecția
  useEffect(() => {
    setBrandError('');
  }, [selectedOption]);

  const handleExistingBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    onChange(selectedValue);
  };

  const handleNewBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const brandName = e.target.value;
    setNewBrandName(brandName);
    onChange(brandName);
    setBrandError('');
  };

  const handleOptionChange = (option: 'existing' | 'new') => {
    setSelectedOption(option);
    setBrandError('');
    
    if (option === 'existing') {
      setNewBrandName('');
      onChange(value || '');
    } else {
      onChange(newBrandName);
    }
  };

  const handleAddNewBrand = async () => {
    if (!newBrandName.trim()) {
      setBrandError('Introduceți numele mărcii');
      return;
    }

    try {
      await addNewBrand(newBrandName.trim());
      setNewBrandName('');
      setSelectedOption('existing');
      onChange(newBrandName.trim());
    } catch (err) {
      setBrandError(err instanceof Error ? err.message : 'Eroare la adăugarea mărcii');
    }
  };

  const isFormValid = () => {
    if (selectedOption === 'existing') {
      return !!value;
    } else {
      return !!newBrandName.trim();
    }
  };

  const hasBothOptionsFilled = () => {
    return selectedOption === 'existing' && value && newBrandName.trim();
  };

  return (
    <div className="brand-selector">
      {/* Opțiuni de selecție */}
      <div className="mb-3">
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            id="existingBrand"
            name="brandOption"
            checked={selectedOption === 'existing'}
            onChange={() => handleOptionChange('existing')}
            disabled={disabled}
          />
          <label className="form-check-label" htmlFor="existingBrand">
            Alege marcă existentă
          </label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            id="newBrand"
            name="brandOption"
            checked={selectedOption === 'new'}
            onChange={() => handleOptionChange('new')}
            disabled={disabled}
          />
          <label className="form-check-label" htmlFor="newBrand">
            Adaugă marcă nouă
          </label>
        </div>
      </div>

      {/* Dropdown pentru mărci existente */}
      {selectedOption === 'existing' && (
        <div className="mb-3">
          <select
            className={`form-select ${error || brandError ? 'is-invalid' : ''}`}
            value={value}
            onChange={handleExistingBrandChange}
            disabled={disabled || loading}
          >
            <option value="">Alege o marcă...</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.name}>
                {brand.name}
              </option>
            ))}
          </select>
          {loading && <div className="form-text">Se încarcă mărcile...</div>}
        </div>
      )}

      {/* Câmp text pentru marcă nouă */}
      {selectedOption === 'new' && (
        <div className="mb-3">
          <div className="input-group">
            <input
              type="text"
              className={`form-control ${error || brandError ? 'is-invalid' : ''}`}
              value={newBrandName}
              onChange={handleNewBrandChange}
              placeholder="Introduceți numele mărcii noi..."
              disabled={disabled}
            />
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={handleAddNewBrand}
              disabled={disabled || !newBrandName.trim()}
            >
              Adaugă
            </button>
          </div>
        </div>
      )}

      {/* Mesaje de eroare */}
      {error && <div className="invalid-feedback d-block">{error}</div>}
      {brandError && <div className="invalid-feedback d-block">{brandError}</div>}
      
      {/* Eroare pentru ambele opțiuni completate */}
      {hasBothOptionsFilled() && (
        <div className="alert alert-warning alert-sm mt-2">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Alege o singură opțiune pentru marcă
        </div>
      )}

      {/* Validare obligatorie */}
      {!isFormValid() && selectedOption && (
        <div className="form-text text-danger">
          Marca este obligatorie
        </div>
      )}
    </div>
  );
}; 