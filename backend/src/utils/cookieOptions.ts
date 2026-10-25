export const authCookieOptions = (maxAge = 24 * 60 * 60 * 1000) => ({
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge,
});
