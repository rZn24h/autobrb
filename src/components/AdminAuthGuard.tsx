"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";

interface Props {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: Props) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkAccess = async () => {
      try {
        if (!loading) {
          if (!user) {
            router.replace("/");
            setChecking(false);
            return;
          }

          // Setează un timeout pentru a evita blocarea
          timeoutId = setTimeout(() => {
            setError("Timeout la verificarea permisiunilor");
            setChecking(false);
          }, 10000); // 10 secunde timeout

          const userDoc = await getDoc(doc(db, "users", user.uid));

          // Curăță timeout-ul dacă verificarea s-a terminat
          clearTimeout(timeoutId);

          if (userDoc.exists() && userDoc.data().role === "admin") {
            setIsAdmin(true);
          } else {
            router.replace("/");
          }
        }
      } catch (e) {
        console.error("Eroare la verificarea permisiunilor:", e);
        setError("Eroare la verificarea permisiunilor");
        router.replace("/");
      } finally {
        clearTimeout(timeoutId);
        setChecking(false);
      }
    };

    checkAccess();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user, loading, router]);

  if (loading || checking) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Se verifică accesul...</span>
        </div>
        <p className="mt-3">Se verifică permisiunile de acces...</p>
        {error && (
          <div className="alert alert-warning mt-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-5 text-center">
        <h2 className="mb-4">⚠️ Acces interzis</h2>
        <p className="lead">Nu ai permisiunea de a accesa această pagină.</p>
        <p className="text-muted">
          Această secțiune este disponibilă doar pentru administratori.
        </p>
        <button
          className="btn btn-primary mt-3"
          onClick={() => router.push("/")}
        >
          Înapoi la pagina principală
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
