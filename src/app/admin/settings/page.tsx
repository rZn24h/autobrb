'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc, getDoc, DocumentData } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/utils/firebase';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminNavbar from '@/components/AdminNavbar';
import { processImage, isImageFile } from '@/utils/imageProcessing';

interface ConfigData {
  nume: string;
  slogan: string;
  logoUrl: string;
  bannerImg: string;
  locatie?: string;
  whatsapp?: string;
  facebook?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState<ConfigData>({
    nume: '',
    slogan: '',
    logoUrl: '',
    bannerImg: '',
    locatie: '',
    whatsapp: '',
    facebook: '',
    metaTitle: '',
    metaDescription: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'config', 'public');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as ConfigData;
          setForm({
            nume: data.nume || '',
            slogan: data.slogan || '',
            logoUrl: data.logoUrl || '',
            bannerImg: data.bannerImg || '',
            locatie: data.locatie || '',
            whatsapp: data.whatsapp || '',
            facebook: data.facebook || '',
            metaTitle: data.metaTitle || '',
            metaDescription: data.metaDescription || '',
          });
        }
      } catch (err) {
        setError('Eroare la încărcarea configurației');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value || '' }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!isImageFile(file)) {
        setError('Vă rugăm să selectați doar fișiere imagine.');
        return;
      }

      try {
        const processedImage = await processImage(file);
        if (processedImage) {
          if (type === 'logo') {
            setLogoFile(processedImage.file);
            setForm(prev => ({ ...prev, logoUrl: processedImage.url }));
          } else {
            setBannerFile(processedImage.file);
            setForm(prev => ({ ...prev, bannerImg: processedImage.url }));
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('A apărut o eroare la procesarea imaginii.');
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let logoUrl = form.logoUrl;
      let bannerImg = form.bannerImg;

      // Upload logo if changed
      if (logoFile) {
        const logoRef = ref(storage, `config/public/logo_${Date.now()}`);
        await uploadBytes(logoRef, logoFile);
        logoUrl = await getDownloadURL(logoRef);
      }

      // Upload banner if changed
      if (bannerFile) {
        const bannerRef = ref(storage, `config/public/banner_${Date.now()}`);
        await uploadBytes(bannerRef, bannerFile);
        bannerImg = await getDownloadURL(bannerRef);
      }

      // Save to Firestore
      const configData = {
        ...form,
        logoUrl,
        bannerImg,
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid
      };

      await setDoc(doc(db, 'config', 'public'), configData, { merge: true });
      setSuccess('Configurația a fost salvată cu succes!');
      setForm(prev => ({ ...prev, logoUrl, bannerImg }));
      setLogoFile(null);
      setBannerFile(null);
    } catch (err) {
      setError('Eroare la salvarea configurației');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminAuthGuard>
        <AdminNavbar />
        <div className="container py-4">
          <div>Se încarcă...</div>
        </div>
      </AdminAuthGuard>
    );
  }

  return (
    <AdminAuthGuard>
      <AdminNavbar />
      <div className="container py-4">
        <h1 className="mb-4 text-dark">Setări</h1>
        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label text-dark">Nume site</label>
              <input
                type="text"
                className="form-control"
                name="nume"
                value={form.nume}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-dark">Slogan</label>
              <input
                type="text"
                className="form-control"
                name="slogan"
                value={form.slogan}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-dark">Logo</label>
              {form.logoUrl && (
                <div className="mb-2">
                  <img
                    src={form.logoUrl}
                    alt="Logo"
                    style={{ maxHeight: '100px', maxWidth: '200px' }}
                    className="img-thumbnail"
                  />
                </div>
              )}
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'logo')}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-dark">Banner</label>
              {form.bannerImg && (
                <div className="mb-2">
                  <img
                    src={form.bannerImg}
                    alt="Banner"
                    style={{ maxHeight: '100px', maxWidth: '200px' }}
                    className="img-thumbnail"
                  />
                </div>
              )}
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'banner')}
              />
            </div>

            {/* Contact Information */}
            <div className="col-12">
              <hr className="my-4" />
              <h3 className="h5 mb-3">Informații de contact</h3>
            </div>
            
            <div className="col-md-4">
              <label className="form-label text-dark">Locație</label>
              <input
                type="text"
                className="form-control"
                name="locatie"
                value={form.locatie}
                onChange={handleChange}
                placeholder="Ex: Suceava, România"
              />
            </div>
            
            <div className="col-md-4">
              <label className="form-label text-dark">Telefon/WhatsApp</label>
              <input
                type="tel"
                className="form-control"
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                placeholder="Ex: 0722000000"
              />
            </div>
            
            <div className="col-md-4">
              <label className="form-label text-dark">Link Facebook</label>
              <input
                type="url"
                className="form-control"
                name="facebook"
                value={form.facebook}
                onChange={handleChange}
                placeholder="Ex: https://www.facebook.com/numepagina"
              />
            </div>

            <div className="col-12">
              <h3 className="h5 mt-4 mb-3 text-dark">Meta Date SEO</h3>
            </div>
            
            <div className="col-md-6">
              <label className="form-label text-dark">Titlu Site (Meta Title)</label>
              <input
                type="text"
                className="form-control"
                name="metaTitle"
                value={form.metaTitle}
                onChange={handleChange}
                placeholder="Titlul care apare în tab-ul browserului"
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label text-dark">Descriere Site (Meta Description)</label>
              <input
                type="text"
                className="form-control"
                name="metaDescription"
                value={form.metaDescription}
                onChange={handleChange}
                placeholder="Descrierea site-ului pentru motoarele de căutare"
              />
            </div>

            <div className="col-12">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Se salvează...' : 'Salvează'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminAuthGuard>
  );
} 