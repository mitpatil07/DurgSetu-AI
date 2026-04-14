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

    // Ensure no double slashes and that path starts with a slash
    const cleanBase = API_BASE.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const finalUrl = `${cleanBase}${cleanPath}`;

    console.log("apiFetch calling URL:", finalUrl);
    const response = await fetch(finalUrl, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
    }

    return response;
}