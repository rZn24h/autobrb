"use client";

import { useState } from "react";

export default function TestIframePage() {
  const [iframeCode, setIframeCode] = useState(
    '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fsbarbieru%2Fposts%2Fpfbid033HtHTZ7cVEJYBT3W3hKzy2qZve2cgTpjfYR5AqvEhHq35Jf9xuN6U3JGtJ8C67kKl&show_text=true&width=500" width="500" height="690" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>'
  );

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">Test Direct Iframe Facebook</h1>

          <div className="card mb-4">
            <div className="card-header">
              <h5>Codul Iframe</h5>
            </div>
            <div className="card-body">
              <textarea
                className="form-control"
                rows={4}
                value={iframeCode}
                onChange={(e) => setIframeCode(e.target.value)}
                style={{ fontSize: "0.9rem", fontFamily: "monospace" }}
              />
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header">
              <h5>Previzualizare</h5>
            </div>
            <div className="card-body">
              <div
                dangerouslySetInnerHTML={{ __html: iframeCode }}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "10px",
                  backgroundColor: "#f8f9fa",
                  minHeight: "400px",
                }}
              />
            </div>
          </div>

          <div className="alert alert-info">
            <h6>
              <i className="bi bi-info-circle me-2"></i>Informații:
            </h6>
            <ul className="mb-0">
              <li>Acesta este testul direct al iframe-ului Facebook</li>
              <li>Dacă nu se afișează conținutul, postarea poate fi privată</li>
              <li>Poți modifica codul iframe în câmpul de sus</li>
              <li>Salvează codul și folosește-l în admin la "Cod Iframe"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
