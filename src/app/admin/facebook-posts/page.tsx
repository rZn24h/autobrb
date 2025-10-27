"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import AdminNavbar from "@/components/AdminNavbar";
import {
  addFacebookPost,
  getFacebookPosts,
  deleteFacebookPost,
  toggleFacebookPostStatus,
} from "@/utils/apiFacebookPosts";
import {
  FACEBOOK_TEST_URL,
  generateTestIframe,
  validateFacebookUrl,
} from "@/utils/facebookTest";

interface FacebookPost {
  id: string;
  title: string;
  facebookUrl: string;
  iframeCode: string;
  isActive: boolean;
  createdAt: any;
  createdBy: string;
}

interface FormErrors {
  title?: string;
  facebookUrl?: string;
  iframeCode?: string;
}

const initialFormState = {
  title: "",
  facebookUrl: "",
  iframeCode: "",
};

export default function FacebookPostsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [previewIframe, setPreviewIframe] = useState("");
  const [testUrl, setTestUrl] = useState("");
  const [inputMode, setInputMode] = useState<"url" | "iframe">("url");

  // Load existing posts on component mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoadingPosts(true);
      const postsData = await getFacebookPosts();
      setPosts(postsData);
    } catch (err) {
      setError("Eroare la încărcarea postărilor Facebook");
    } finally {
      setLoadingPosts(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Required fields validation
    if (!form.title.trim()) {
      newErrors.title = "Titlul este obligatoriu";
      isValid = false;
    }

    if (!form.facebookUrl.trim() && !form.iframeCode.trim()) {
      newErrors.facebookUrl =
        "URL-ul Facebook sau codul iframe este obligatoriu";
      isValid = false;
    } else if (
      form.facebookUrl.trim() &&
      !form.facebookUrl.includes("facebook.com")
    ) {
      newErrors.facebookUrl = "URL-ul trebuie să fie de pe Facebook";
      isValid = false;
    } else if (form.iframeCode.trim() && !isIframeCode(form.iframeCode)) {
      newErrors.iframeCode = "Codul iframe nu este valid";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const generateIframeCode = (facebookUrl: string): string => {
    // Use Facebook's oEmbed API for better compatibility
    const encodedUrl = encodeURIComponent(facebookUrl);
    return `<iframe src="https://www.facebook.com/plugins/post.php?href=${encodedUrl}&show_text=true&width=500&height=auto" width="500" height="690" style="border:none;overflow:hidden;max-width:100%" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`;
  };

  const generateAlternativeEmbed = (facebookUrl: string): string => {
    // Alternative method using Facebook's embed code
    return `<div class="fb-post" data-href="${facebookUrl}" data-width="500" data-show-text="true"><blockquote cite="${facebookUrl}" class="fb-xfbml-parse-ignore"><a href="${facebookUrl}">Vezi postarea pe Facebook</a></blockquote></div>`;
  };

  const extractUrlFromIframe = (iframeCode: string): string | null => {
    const match = iframeCode.match(/href=([^&]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
    return null;
  };

  const isIframeCode = (input: string): boolean => {
    return (
      input.trim().startsWith("<iframe") &&
      input.includes("facebook.com/plugins/post.php")
    );
  };

  const processInput = (input: string) => {
    if (isIframeCode(input)) {
      // It's an iframe code
      const extractedUrl = extractUrlFromIframe(input);
      if (extractedUrl) {
        setForm((prev) => ({
          ...prev,
          facebookUrl: extractedUrl,
          iframeCode: input,
        }));
        setPreviewIframe(input);
      }
    } else if (input.includes("facebook.com")) {
      // It's a Facebook URL
      setForm((prev) => ({
        ...prev,
        facebookUrl: input,
        iframeCode: generateIframeCode(input),
      }));
      setPreviewIframe(generateIframeCode(input));
    }
  };

  const testFacebookUrl = async (url: string) => {
    try {
      // Test if the URL is accessible and valid
      const response = await fetch(
        `https://graph.facebook.com/v18.0/oembed_post?url=${encodeURIComponent(
          url
        )}&access_token=YOUR_ACCESS_TOKEN`
      );
      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error testing Facebook URL:", error);
      return false;
    }
  };

  const handleTestUrl = async () => {
    if (!testUrl.trim()) {
      setError("Te rugăm să introduci un URL pentru testare");
      return;
    }

    if (!testUrl.includes("facebook.com")) {
      setError("URL-ul trebuie să fie de pe Facebook");
      return;
    }

    setLoading(true);
    try {
      const isValid = await testFacebookUrl(testUrl);
      if (isValid) {
        setSuccess("✅ URL-ul Facebook este valid!");
        setForm((prev) => ({ ...prev, facebookUrl: testUrl }));
        setPreviewIframe(generateIframeCode(testUrl));
      } else {
        setError(
          "❌ URL-ul Facebook nu este valid sau postarea nu este publică"
        );
      }
    } catch (err) {
      setError("Eroare la testarea URL-ului");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Generate preview iframe when URL changes
    if (name === "facebookUrl" && value.includes("facebook.com")) {
      setPreviewIframe(generateIframeCode(value));
    }

    // Process iframe code when it changes
    if (name === "iframeCode" && value.trim()) {
      if (isIframeCode(value)) {
        setPreviewIframe(value);
        const extractedUrl = extractUrlFromIframe(value);
        if (extractedUrl) {
          setForm((prev) => ({ ...prev, facebookUrl: extractedUrl }));
        }
      }
    }

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setErrors({});

    if (!validateForm()) {
      setError("Te rugăm să corectezi erorile din formular.");
      return;
    }

    if (
      !window.confirm("Ești sigur că vrei să adaugi această postare Facebook?")
    ) {
      return;
    }

    setLoading(true);
    try {
      if (!user) {
        throw new Error(
          "Trebuie să fii autentificat pentru a adăuga o postare"
        );
      }

      // Use existing iframe code or generate new one
      const finalIframeCode =
        form.iframeCode.trim() || generateIframeCode(form.facebookUrl);
      const finalFacebookUrl =
        form.facebookUrl.trim() || extractUrlFromIframe(form.iframeCode) || "";

      // Add Facebook post
      await addFacebookPost({
        title: form.title,
        facebookUrl: finalFacebookUrl,
        iframeCode: finalIframeCode,
        isActive: true,
        createdBy: user.uid,
      });

      // Show success message
      setSuccess("✅ Postarea Facebook a fost adăugată cu succes!");

      // Reset form
      setForm(initialFormState);
      setPreviewIframe("");

      // Reload posts
      await loadPosts();

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "A apărut o eroare la adăugarea postării"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm("Ești sigur că vrei să ștergi această postare?")) {
      return;
    }

    try {
      await deleteFacebookPost(postId);
      setSuccess("✅ Postarea a fost ștearsă cu succes!");
      await loadPosts();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError("Eroare la ștergerea postării");
    }
  };

  const toggleActiveStatus = async (postId: string, currentStatus: boolean) => {
    try {
      await toggleFacebookPostStatus(postId, currentStatus);
      setSuccess(
        `✅ Postarea a fost ${
          currentStatus ? "dezactivată" : "activată"
        } cu succes!`
      );
      await loadPosts();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError("Eroare la actualizarea statusului postării");
    }
  };

  return (
    <AdminAuthGuard>
      <AdminNavbar />
      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            <h1 className="mb-4 text-dark">Gestionare Postări Facebook</h1>

            {/* Success message */}
            {success && (
              <div
                className="alert alert-success alert-dismissible fade show"
                role="alert"
              >
                {success}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSuccess("")}
                ></button>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div
                className="alert alert-danger alert-dismissible fade show"
                role="alert"
              >
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError("")}
                ></button>
              </div>
            )}

            {/* Instructions */}
            <div className="alert alert-primary mb-4">
              <h6>
                <i className="bi bi-lightbulb me-2"></i>Cum să adaugi o postare
                Facebook:
              </h6>
              <div className="row">
                <div className="col-md-6">
                  <h6>
                    <i className="bi bi-link-45deg me-2"></i>Metoda 1: URL
                    Facebook
                  </h6>
                  <ol className="mb-0">
                    <li>Mergi la postarea Facebook</li>
                    <li>Copiază URL-ul din browser</li>
                    <li>Lipește URL-ul în câmpul dedicat</li>
                  </ol>
                </div>
                <div className="col-md-6">
                  <h6>
                    <i className="bi bi-code me-2"></i>Metoda 2: Cod Iframe
                  </h6>
                  <ol className="mb-0">
                    <li>Apasă "..." pe postarea Facebook</li>
                    <li>Selectează "Încorporare" sau "Embed"</li>
                    <li>Copiază codul iframe complet</li>
                    <li>Lipește codul în câmpul dedicat</li>
                  </ol>
                </div>
              </div>
              <div className="mt-3 p-3 bg-light rounded">
                <strong>⚠️ Important:</strong> Asigură-te că postarea este{" "}
                <strong>publică</strong> pentru ca integrarea să funcționeze!
              </div>
            </div>

            {/* Add new post form */}
            <div className="card shadow mb-4">
              <div className="card-header">
                <h5 className="mb-0">Adaugă Postare Facebook</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Titlu postare *</label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.title ? "is-invalid" : ""
                        }`}
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Ex: BMW Seria 5 - Ofertă specială"
                      />
                      {errors.title && (
                        <div className="invalid-feedback">{errors.title}</div>
                      )}
                    </div>

                    {/* Input Mode Toggle */}
                    <div className="col-12">
                      <div className="btn-group mb-3" role="group">
                        <button
                          type="button"
                          className={`btn ${
                            inputMode === "url"
                              ? "btn-primary"
                              : "btn-outline-primary"
                          }`}
                          onClick={() => setInputMode("url")}
                        >
                          <i className="bi bi-link-45deg me-2"></i>
                          URL Facebook
                        </button>
                        <button
                          type="button"
                          className={`btn ${
                            inputMode === "iframe"
                              ? "btn-primary"
                              : "btn-outline-primary"
                          }`}
                          onClick={() => setInputMode("iframe")}
                        >
                          <i className="bi bi-code me-2"></i>
                          Cod Iframe
                        </button>
                      </div>
                    </div>

                    {inputMode === "url" ? (
                      <div className="col-md-6">
                        <label className="form-label">URL Facebook *</label>
                        <input
                          type="url"
                          className={`form-control ${
                            errors.facebookUrl ? "is-invalid" : ""
                          }`}
                          name="facebookUrl"
                          value={form.facebookUrl}
                          onChange={handleChange}
                          placeholder="https://www.facebook.com/username/posts/..."
                        />
                        {errors.facebookUrl && (
                          <div className="invalid-feedback">
                            {errors.facebookUrl}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="col-12">
                        <label className="form-label">
                          Cod Iframe Facebook *
                        </label>
                        <textarea
                          className={`form-control ${
                            errors.iframeCode ? "is-invalid" : ""
                          }`}
                          name="iframeCode"
                          value={form.iframeCode}
                          onChange={handleChange}
                          rows={3}
                          placeholder='<iframe src="https://www.facebook.com/plugins/post.php?href=..." width="500" height="690"...></iframe>'
                        />
                        {errors.iframeCode && (
                          <div className="invalid-feedback">
                            {errors.iframeCode}
                          </div>
                        )}
                        <small className="form-text text-muted">
                          Lipește direct codul iframe de la Facebook
                        </small>
                      </div>
                    )}

                    {/* Test section */}
                    <div className="col-12">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6 className="card-title">
                            <i className="bi bi-tools me-2"></i>
                            Testează{" "}
                            {inputMode === "url" ? "URL-ul" : "codul iframe"}
                          </h6>

                          {inputMode === "url" ? (
                            <div className="row g-2">
                              <div className="col-md-8">
                                <input
                                  type="url"
                                  className="form-control"
                                  value={testUrl}
                                  onChange={(e) => setTestUrl(e.target.value)}
                                  placeholder="Lipește URL-ul Facebook aici pentru testare..."
                                />
                              </div>
                              <div className="col-md-4">
                                <button
                                  type="button"
                                  className="btn btn-outline-primary w-100"
                                  onClick={handleTestUrl}
                                  disabled={loading || !testUrl.trim()}
                                >
                                  {loading ? (
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                  ) : (
                                    <i className="bi bi-check-circle me-2"></i>
                                  )}
                                  Testează URL
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="row g-2">
                              <div className="col-md-8">
                                <textarea
                                  className="form-control"
                                  rows={3}
                                  value={testUrl}
                                  onChange={(e) => setTestUrl(e.target.value)}
                                  placeholder="Lipește codul iframe aici pentru testare..."
                                />
                              </div>
                              <div className="col-md-4">
                                <button
                                  type="button"
                                  className="btn btn-outline-primary w-100"
                                  onClick={() => {
                                    if (isIframeCode(testUrl)) {
                                      setForm((prev) => ({
                                        ...prev,
                                        iframeCode: testUrl,
                                      }));
                                      setPreviewIframe(testUrl);
                                      setSuccess(
                                        "✅ Codul iframe a fost procesat cu succes!"
                                      );
                                    } else {
                                      setError("❌ Codul iframe nu este valid");
                                    }
                                  }}
                                  disabled={!testUrl.trim()}
                                >
                                  <i className="bi bi-check-circle me-2"></i>
                                  Testează Iframe
                                </button>
                              </div>
                            </div>
                          )}

                          <small className="text-muted mt-2 d-block">
                            {inputMode === "url"
                              ? "Această funcție va testa dacă URL-ul Facebook este valid și accesibil."
                              : "Această funcție va testa dacă codul iframe este valid și va genera previzualizarea."}
                          </small>

                          <div className="mt-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary me-2"
                              onClick={() => {
                                setTestUrl(FACEBOOK_TEST_URL);
                                setForm((prev) => ({
                                  ...prev,
                                  facebookUrl: FACEBOOK_TEST_URL,
                                }));
                                setPreviewIframe(generateTestIframe());
                              }}
                            >
                              <i className="bi bi-lightning me-1"></i>
                              Testează cu URL-ul de exemplu
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-info"
                              onClick={() => {
                                const exampleIframe =
                                  '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fsbarbieru%2Fposts%2Fpfbid033HtHTZ7cVEJYBT3W3hKzy2qZve2cgTpjfYR5AqvEhHq35Jf9xuN6U3JGtJ8C67kKl&show_text=true&width=500" width="500" height="690" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>';
                                setTestUrl(exampleIframe);
                                setForm((prev) => ({
                                  ...prev,
                                  iframeCode: exampleIframe,
                                }));
                                setPreviewIframe(exampleIframe);
                                setInputMode("iframe");
                              }}
                            >
                              <i className="bi bi-code me-1"></i>
                              Testează cu iframe-ul de exemplu
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preview section */}
                    {previewIframe && (
                      <div className="col-12">
                        <label className="form-label">Previzualizare:</label>
                        <div
                          className="border rounded p-3 mb-3"
                          style={{ backgroundColor: "#f8f9fa" }}
                        >
                          <div
                            dangerouslySetInnerHTML={{ __html: previewIframe }}
                          />
                        </div>

                        {/* Debug information */}
                        <div className="alert alert-info">
                          <h6>
                            <i className="bi bi-info-circle me-2"></i>Informații
                            pentru debugging:
                          </h6>
                          <small>
                            <strong>URL original:</strong> {form.facebookUrl}
                            <br />
                            <strong>URL encodat:</strong>{" "}
                            {encodeURIComponent(form.facebookUrl)}
                            <br />
                            <strong>Iframe generat:</strong>
                            <pre
                              className="mt-2"
                              style={{
                                fontSize: "0.8rem",
                                backgroundColor: "#f8f9fa",
                                padding: "0.5rem",
                                borderRadius: "4px",
                              }}
                            >
                              {previewIframe}
                            </pre>
                          </small>
                        </div>
                      </div>
                    )}

                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Se salvează...
                          </>
                        ) : (
                          "Adaugă Postare"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Existing posts list */}
            <div className="card shadow">
              <div className="card-header">
                <h5 className="mb-0">Postări Facebook Existente</h5>
              </div>
              <div className="card-body">
                {loadingPosts ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Se încarcă...</span>
                    </div>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-facebook fs-1 mb-3 d-block"></i>
                    <p>Nu există postări Facebook adăugate încă.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Titlu</th>
                          <th>URL Facebook</th>
                          <th>Status</th>
                          <th>Data creării</th>
                          <th>Acțiuni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {posts.map((post) => (
                          <tr key={post.id}>
                            <td>
                              <strong>{post.title}</strong>
                            </td>
                            <td>
                              <a
                                href={post.facebookUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-decoration-none"
                              >
                                <i className="bi bi-facebook me-1"></i>
                                Vezi pe Facebook
                              </a>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  post.isActive ? "bg-success" : "bg-secondary"
                                }`}
                              >
                                {post.isActive ? "Activ" : "Inactiv"}
                              </span>
                            </td>
                            <td>
                              {post.createdAt?.toDate?.()
                                ? post.createdAt
                                    .toDate()
                                    .toLocaleDateString("ro-RO")
                                : "N/A"}
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() =>
                                    toggleActiveStatus(post.id, post.isActive)
                                  }
                                  title={
                                    post.isActive ? "Dezactivează" : "Activează"
                                  }
                                >
                                  <i
                                    className={`bi ${
                                      post.isActive ? "bi-eye-slash" : "bi-eye"
                                    }`}
                                  ></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(post.id)}
                                  title="Șterge"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
