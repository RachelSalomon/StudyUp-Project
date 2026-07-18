const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function loadJQuery() {
  return new Promise((resolve, reject) => {
    if (window.jQuery) {
      resolve(window.jQuery);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://code.jquery.com/jquery-3.7.1.min.js";
    script.onload = () => resolve(window.jQuery);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function jqueryAjax({ url, method = "GET", data = null }) {
  const token = localStorage.getItem("token");

  return new Promise((resolve, reject) => {
    window.jQuery.ajax({
      url: `${BASE_URL}${url}`,
      method,
      contentType: "application/json",
      data: data ? JSON.stringify(data) : undefined,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      success: (response) => resolve(response),
      error: (xhr) => {
        const msg =
          xhr.responseJSON?.message || xhr.statusText || "Request failed";
        reject(new Error(msg));
      },
    });
  });
}

export function buildQuery(params) {
  const query = Object.entries(params)
    .filter(([, v]) => v !== "" && v != null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return query ? `?${query}` : "";
}
