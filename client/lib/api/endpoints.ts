const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const endpoints = {
  menuItem: `${API_BASE_URL}/menuitem`,
  user: `${API_BASE_URL}/user`,
  order: `${API_BASE_URL}/order`,
  table: `${API_BASE_URL}/table`,
  bill: `${API_BASE_URL}/bill`,
  room: `${API_BASE_URL}/room`,
  pos: `${API_BASE_URL}/pos`,
  booking: `${API_BASE_URL}/roombooking`,
  article: `${API_BASE_URL}/article`,
};
