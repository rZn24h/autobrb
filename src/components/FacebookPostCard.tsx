import React, { useEffect } from "react";

interface FacebookPostCardProps {
  post: {
    id: string;
    title: string;
    facebookUrl: string;
    iframeCode: string;
    isActive: boolean;
    createdAt?: any;
  };
}

const FacebookPostCard: React.FC<FacebookPostCardProps> = ({ post }) => {
  useEffect(() => {
    // Load Facebook SDK if not already loaded
    if (typeof window !== "undefined" && !window.FB) {
      const script = document.createElement("script");
      script.src =
        "https://connect.facebook.net/ro_RO/sdk.js#xfbml=1&version=v18.0";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);

      script.onload = () => {
        if (window.FB) {
          window.FB.XFBML.parse();
        }
      };
    } else if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, [post.id]);

  if (!post.isActive) {
    return null;
  }

  return (
    <div className="col-lg-6 col-xl-4 mb-4">
      <div className="card h-100 shadow-sm">
        <div className="card-header bg-primary text-white">
          <h6 className="mb-0">
            <i className="bi bi-facebook me-2"></i>
            {post.title}
          </h6>
        </div>
        <div className="card-body p-0 position-relative">
          {/* Facebook iframe */}
          <div
            dangerouslySetInnerHTML={{ __html: post.iframeCode }}
            style={{
              maxHeight: "400px",
              overflow: "hidden",
            }}
          />

          {/* Overlay with link if iframe fails to load */}
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: "rgba(248, 249, 250, 0.95)",
              zIndex: 1,
              opacity: 0,
              transition: "opacity 0.3s ease",
              pointerEvents: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.pointerEvents = "auto";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0";
              e.currentTarget.style.pointerEvents = "none";
            }}
          >
            <div className="text-center">
              <i className="bi bi-facebook fs-1 text-primary mb-3"></i>
              <p className="text-muted mb-3">Postarea Facebook</p>
              <a
                href={post.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <i className="bi bi-facebook me-2"></i>
                Vezi pe Facebook
              </a>
            </div>
          </div>
        </div>
        <div className="card-footer bg-light">
          <small className="text-muted">
            <i className="bi bi-clock me-1"></i>
            {post.createdAt?.toDate?.()
              ? post.createdAt.toDate().toLocaleDateString("ro-RO")
              : "Data necunoscută"}
          </small>
          <a
            href={post.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline-primary float-end"
          >
            <i className="bi bi-facebook me-1"></i>
            Vezi pe Facebook
          </a>
        </div>
      </div>
    </div>
  );
};

export default FacebookPostCard;
