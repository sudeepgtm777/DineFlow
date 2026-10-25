export const API_BASE_URL = "/api/v1";

export const backendOrigin =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "");
