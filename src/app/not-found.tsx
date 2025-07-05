import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <h1 className="display-1 text-danger">404</h1>
        <h2 className="h4 mb-4">Pagina nu a fost găsită</h2>
        <p className="text-muted mb-4">
          Pagina pe care o cauți nu există sau a fost mutată.
        </p>
        <Link href="/" className="btn btn-primary">
          Înapoi la pagina principală
        </Link>
      </div>
    </div>
  );
} 