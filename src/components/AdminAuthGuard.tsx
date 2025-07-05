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

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/");
        setChecking(false);
        return;
      }
      const checkRole = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().role === "admin") {
            setIsAdmin(true);
          } else {
            router.replace("/");
          }
        } catch (e) {
          console.error('Error checking admin role:', e);
          router.replace("/");
        } finally {
          setChecking(false);
        }
      };
      
      // Add timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        if (checking) {
          console.error('Admin check timeout');
          setChecking(false);
          router.replace("/");
        }
      }, 10000); // 10 second timeout
      
      checkRole();
      
      return () => clearTimeout(timeout);
    }
  }, [user, loading, router, checking]);

  if (loading || checking) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Se verifică accesul...</span>
        </div>
        <p className="mt-3">Se verifică permisiunile de acces...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-5 text-center">
        <h2 className="mb-4">⚠️ Acces interzis</h2>
        <p className="lead">Nu ai permisiunea de a accesa această pagină.</p>
        <p className="text-muted">Această secțiune este disponibilă doar pentru administratori.</p>
      </div>
    );
  }

  return <>{children}</>;
} 