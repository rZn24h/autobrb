"use client";

import { useState } from "react";

interface FacebookPostEmbedProps {
  facebookPostUrl?: string;
  facebookEmbedCode?: string;
  onUrlChange?: (url: string) => void;
  onEmbedCodeChange?: (code: string) => void;
  disabled?: boolean;
  error?: string;
}

export default function FacebookPostEmbed({
  facebookPostUrl = "",
  facebookEmbedCode = "",
  onUrlChange,
  onEmbedCodeChange,
  disabled = false,
  error,
}: FacebookPostEmbedProps) {
  const [inputType, setInputType] = useState<"url" | "embed">("url");
  const [tempUrl, setTempUrl] = useState(facebookPostUrl);
  const [tempEmbedCode, setTempEmbedCode] = useState(facebookEmbedCode);

  const handleUrlSubmit = () => {
    if (tempUrl && onUrlChange) {
      onUrlChange(tempUrl);
    }
  };

  const handleEmbedCodeSubmit = () => {
    if (tempEmbedCode && onEmbedCodeChange) {
      onEmbedCodeChange(tempEmbedCode);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempUrl(e.target.value);
  };

  const handleEmbedCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTempEmbedCode(e.target.value);
  };

  const extractEmbedFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes("facebook.com")) {
        const encodedUrl = encodeURIComponent(url);
        return `<iframe src="https://www.facebook.com/plugins/post.php?href=${encodedUrl}&show_text=true&width=500" width="500" height="690" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`;
      }
    } catch (error) {
      console.error("Error processing URL:", error);
    }
    return "";
  };

  const handleGenerateEmbedFromUrl = () => {
    if (tempUrl) {
      const embedCode = extractEmbedFromUrl(tempUrl);
      if (embedCode) {
        setTempEmbedCode(embedCode);
        if (onEmbedCodeChange) {
          onEmbedCodeChange(embedCode);
        }
        setInputType("embed");
      }
    }
  };

  return (
    <div className="facebook-post-embed">
      <div className="mb-3">
        <label className="form-label">Integrare postare Facebook</label>
        <div className="btn-group w-100" role="group">
          <input
            type="radio"
            className="btn-check"
            name="facebookInputType"
            id="facebookUrl"
            checked={inputType === "url"}
            onChange={() => setInputType("url")}
            disabled={disabled}
          />
          <label className="btn btn-outline-primary" htmlFor="facebookUrl">
            URL Facebook
          </label>

          <input
            type="radio"
            className="btn-check"
            name="facebookInputType"
            id="facebookEmbed"
            checked={inputType === "embed"}
            onChange={() => setInputType("embed")}
            disabled={disabled}
          />
          <label className="btn btn-outline-primary" htmlFor="facebookEmbed">
            Cod Embed
          </label>
        </div>
      </div>

      {inputType === "url" ? (
        <div className="mb-3">
          <label className="form-label">URL postare Facebook</label>
          <div className="input-group">
            <input
              type="url"
              className={`form-control ${error ? "is-invalid" : ""}`}
              value={tempUrl}
              onChange={handleUrlChange}
              placeholder="https://www.facebook.com/username/posts/..."
              disabled={disabled}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleUrlSubmit}
              disabled={disabled || !tempUrl}
            >
              Salvează URL
            </button>
          </div>
          {tempUrl && (
            <div className="mt-2">
              <button
                type="button"
                className="btn btn-sm btn-info"
                onClick={handleGenerateEmbedFromUrl}
                disabled={disabled}
              >
                Generează cod embed automat
              </button>
            </div>
          )}
          {error && <div className="invalid-feedback">{error}</div>}
        </div>
      ) : (
        <div className="mb-3">
          <label className="form-label">Cod embed Facebook</label>
          <textarea
            className={`form-control ${error ? "is-invalid" : ""}`}
            value={tempEmbedCode}
            onChange={handleEmbedCodeChange}
            rows={4}
            placeholder="<iframe src='https://www.facebook.com/plugins/post.php?href=...' ...></iframe>"
            disabled={disabled}
          />
          <div className="mt-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleEmbedCodeSubmit}
              disabled={disabled || !tempEmbedCode}
            >
              Salvează cod embed
            </button>
          </div>
          {error && <div className="invalid-feedback">{error}</div>}
        </div>
      )}

      {/* Preview section */}
      {(facebookPostUrl || facebookEmbedCode) && (
        <div className="mt-4">
          <label className="form-label">Previzualizare postare Facebook</label>
          <div
            className="border rounded p-3"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            {facebookEmbedCode ? (
              <div
                dangerouslySetInnerHTML={{ __html: facebookEmbedCode }}
                style={{ maxWidth: "100%", overflow: "hidden" }}
              />
            ) : facebookPostUrl ? (
              <div className="text-center py-3">
                <p className="text-muted mb-2">
                  <i className="fab fa-facebook me-2"></i>
                  Postare Facebook disponibilă
                </p>
                <a
                  href={facebookPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  Vezi postarea pe Facebook
                </a>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
