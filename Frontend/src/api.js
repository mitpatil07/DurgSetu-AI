

let base = import.meta.env.VITE_API_BASE || (
    window.location.hostname === "localhost"
        ? "http://127.0.0.1:8000/api"
        : "https://hardwood-bumper-lowest-remain.trycloudflare.com/api"
);

// Ensure the base URL ends with /api (without adding it twice)
if (base && !base.endsWith('/api') && !base.endsWith('/api/')) {
    base = base.endsWith('/') ? `${base}api` : `${base}/api`;
}

export const API_BASE = base;

/**
 * A thin fetch wrapper that:
 *  - Prefixes every path with API_BASE
 *  - Attaches the stored auth token automatically
 *  - Redirects to /login and clears local storage on 401 responses
 *
 * @param {string} path  - API path starting with '/', e.g. '/login/'
 * @param {RequestInit} options  - standard fetch options
 * @returns {Promise<Response>}
 */
export async function apiFetch(path, options = {}) {
    const token = localStorage.getItem('auth_token');

    const isFormData = options.body instanceof FormData;
    const headers = {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Token ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
    }

    return response;
}
