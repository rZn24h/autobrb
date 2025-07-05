'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/utils/firebase';
import { isUserAdmin } from '@/utils/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';

// Get the secret key from environment variable or fallback to default
const REGISTER_SECRET = process.env.NEXT_PUBLIC_REGISTER_SECRET || 'adminSecret2025';

export default function LoginRegisterComponent() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authorizationKey, setAuthorizationKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper: Add user to Firestore if not exists
  const ensureUserInFirestore = async (user: any) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        role: 'user',
        createdAt: new Date(),
      });
      return 'user';
    } else {
      const data = userSnap.data();
      return data.role;
    }
  };

  // LOGIN
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const role = await ensureUserInFirestore(userCredential.user);
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      setError('Email sau parolă incorectă');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const role = await ensureUserInFirestore(userCredential.user);
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      setError('Eroare la autentificarea cu Google');
    } finally {
      setLoading(false);
    }
  };

  // REGISTER
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Verify authorization key
    if (authorizationKey !== REGISTER_SECRET) {
      setError('Parola de autorizare este invalidă.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        role: 'user',
        createdAt: new Date(),
      });
      setSuccess('Cont creat cu succes! Vă puteți autentifica acum.');
      setTab('login');
    } catch (error: any) {
      setError('Eroare la crearea contului: ' + (error.message || '')); 
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    // Verify authorization key
    if (authorizationKey !== REGISTER_SECRET) {
      setError('Parola de autorizare este invalidă.');
      setLoading(false);
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        role: 'user',
        createdAt: new Date(),
      }, { merge: true });
      setSuccess('Cont creat cu succes! Vă puteți autentifica acum.');
      setTab('login');
    } catch (error: any) {
      setError('Eroare la crearea contului cu Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="d-flex justify-content-center mb-4">
            <button
              className={`btn btn-link ${tab === 'login' ? 'fw-bold text-primary' : ''}`}
              onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
            >
              Login
            </button>
            <span className="mx-2">|</span>
            <button
              className={`btn btn-link ${tab === 'register' ? 'fw-bold text-primary' : ''}`}
              onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success" role="alert">
              {success}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleEmailLogin} className="mb-3">
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Parolă</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 mb-3"
                disabled={loading}
              >
                {loading ? 'Se încarcă...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailRegister} className="mb-3">
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Parolă</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="authorizationKey" className="form-label">Parolă de autorizare</label>
                <input
                  type="password"
                  className="form-control"
                  id="authorizationKey"
                  value={authorizationKey}
                  onChange={(e) => setAuthorizationKey(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-success w-100 mb-3"
                disabled={loading}
              >
                {loading ? 'Se încarcă...' : 'Creează cont'}
              </button>
            </form>
          )}

          <div className="text-center">
            <p className="mb-3">sau</p>
            {tab === 'login' ? (
              <button
                onClick={handleGoogleLogin}
                className="btn btn-outline-primary w-100"
                disabled={loading}
              >
                <i className="bi bi-google me-2"></i>
                Login cu Google
              </button>
            ) : (
              <button
                onClick={handleGoogleRegister}
                className="btn btn-outline-success w-100"
                disabled={loading}
              >
                <i className="bi bi-google me-2"></i>
                Creează cont cu Google
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 