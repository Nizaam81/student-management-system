const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const getAccessTokenRole = () => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const encodedClaims = token.split('.')[1];
    const base64Claims = encodedClaims.replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(
      atob(base64Claims.padEnd(Math.ceil(base64Claims.length / 4) * 4, '=')),
    );

    if (typeof claims.exp !== 'number' || claims.exp <= Date.now() / 1000) {
      return null;
    }

    if (claims.isAdmin === true) return 'admin';
    if (claims.isAdmin === false) return 'student';
    return null;
  } catch {
    return null;
  }
};

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
