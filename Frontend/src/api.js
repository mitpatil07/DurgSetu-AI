const API_BASE =
    import.meta.env.VITE_API_BASE ||
    (window.location.hostname === "localhost"
        ? "http://127.0.0.1:8000/api"
        : "https://hardwood-bumper-lowest-remain.trycloudflare.com/api");

console.log("API_BASE:", API_BASE);

export { API_BASE };


export async function apiFetch(path, options = {}) {
    const token = localStorage.getItem('auth_token');

    const isFormData = options.body instanceof FormData;

    const headers = {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Token ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
    }

    return response;
}