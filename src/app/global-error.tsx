'use client';

import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <h1 className="display-1 text-danger">500</h1>
            <h2 className="h4 mb-4">Eroare internă</h2>
            <p className="text-muted mb-4">
              A apărut o eroare neașteptată. Te rugăm să încerci din nou.
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <button onClick={reset} className="btn btn-primary">
                Încearcă din nou
              </button>
              <Link href="/" className="btn btn-outline-primary">
                Pagina principală
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 