const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function apiFetch(path, { method = "GET", body, token, headers = {} } = {}) {
  const isFormData = body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/pdf")) {
    return response.blob();
  }

  return response.json();
}

export { API_URL };
