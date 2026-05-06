export const API_BASE_URL = "http://localhost:5000/api";

const buildUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const apiFetch = async (path, options = {}) => {
  const { headers, credentials, ...restOptions } = options;
  const response = await fetch(buildUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    credentials: credentials || "include",
    ...restOptions,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data && (data.message || data.error)
        ? data.message || data.error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
};
