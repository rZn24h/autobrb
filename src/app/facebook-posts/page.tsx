"use client";

import { useState, useEffect } from "react";
import FacebookPostCard from "@/components/FacebookPostCard";
import { getActiveFacebookPosts } from "@/utils/apiFacebookPosts";

interface FacebookPost {
  id: string;
  title: string;
  facebookUrl: string;
  iframeCode: string;
  isActive: boolean;
  createdAt: any;
}

export default function FacebookPostsPage() {
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const postsData = await getActiveFacebookPosts();
      setPosts(postsData);
    } catch (err) {
      setError("Eroare la încărcarea postărilor Facebook");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Se încarcă...</span>
            </div>
            <p className="mt-3">Se încarcă postările Facebook...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold text-primary">
              <i className="bi bi-facebook me-3"></i>
              Postări Facebook
            </h1>
            <p className="lead text-muted">
              Urmărește cele mai noi postări și anunțuri de pe pagina noastră
              Facebook
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-facebook display-1 text-muted mb-4"></i>
              <h3 className="text-muted">
                Nu există postări disponibile momentan
              </h3>
              <p className="text-muted">
                Vino înapoi mai târziu pentru a vedea cele mai noi postări de pe
                pagina noastră Facebook.
              </p>
              <a
                href="https://www.facebook.com/sbarbieru"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg mt-3"
              >
                <i className="bi bi-facebook me-2"></i>
                Vizitează pagina Facebook
              </a>
            </div>
          ) : (
            <div className="row justify-content-center">
              {posts.map((post) => (
                <FacebookPostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Call to action */}
          <div className="text-center mt-5">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h4 className="card-title">
                  <i className="bi bi-facebook me-2"></i>
                  Urmărește-ne pe Facebook!
                </h4>
                <p className="card-text">
                  Pentru cele mai noi anunțuri și oferte speciale, urmărește
                  pagina noastră Facebook.
                </p>
                <a
                  href="https://www.facebook.com/sbarbieru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-light btn-lg"
                >
                  <i className="bi bi-facebook me-2"></i>
                  Urmărește-ne pe Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
