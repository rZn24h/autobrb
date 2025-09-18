"use client";

import { useState } from "react";
import { generateTestIframe, FACEBOOK_TEST_URL } from "@/utils/facebookTest";

export default function TestFacebookPage() {
  const [testUrl, setTestUrl] = useState(FACEBOOK_TEST_URL);
  const [iframeCode, setIframeCode] = useState(generateTestIframe());

  const handleUrlChange = (url: string) => {
    setTestUrl(url);
    setIframeCode(generateTestIframe(url));
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">Test Iframe Facebook</h1>

          <div className="card mb-4">
            <div className="card-header">
              <h5>Testare URL Facebook</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">URL Facebook:</label>
                <input
                  type="url"
                  className="form-control"
                  value={testUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://www.facebook.com/username/posts/..."
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Codul iframe generat:</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={iframeCode}
                  readOnly
                  style={{ fontSize: "0.9rem" }}
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={() => handleUrlChange(FACEBOOK_TEST_URL)}
              >
                Folosește URL-ul de test
              </button>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header">
              <h5>Previzualizare Iframe</h5>
            </div>
            <div className="card-body">
              <div
                dangerouslySetInnerHTML={{ __html: iframeCode }}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "10px",
                  backgroundColor: "#f8f9fa",
                }}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5>Informații despre URL</h5>
            </div>
            <div className="card-body">
              <p>
                <strong>URL original:</strong> {testUrl}
              </p>
              <p>
                <strong>URL encodat:</strong> {encodeURIComponent(testUrl)}
              </p>
              <p>
                <strong>Lungime iframe:</strong> {iframeCode.length} caractere
              </p>
              <p>
                <strong>Contine Facebook:</strong>{" "}
                {testUrl.includes("facebook.com") ? "✅ Da" : "❌ Nu"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
