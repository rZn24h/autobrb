'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const LoginRegisterComponent = dynamic(() => import('./LoginRegisterComponent'), {
  loading: () => (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Se încarcă...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  ssr: false
});

export default function LoginRegisterPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Se încarcă...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <LoginRegisterComponent />;
} 