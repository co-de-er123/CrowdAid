/**
 * Authentication utility functions
 */

/**
 * Get the authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Set the authentication token in localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

/**
 * Remove the authentication token from localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem('token');};

/**
 * Get the refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

/**
 * Set the refresh token in localStorage
 */
export const setRefreshToken = (token: string): void => {
  localStorage.setItem('refreshToken', token);
};

/**
 * Remove the refresh token from localStorage
 */
export const removeRefreshToken = (): void => {
  localStorage.removeItem('refreshToken');
};

/**
 * Get the current user from localStorage
 */
export const getCurrentUser = (): any | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Set the current user in localStorage
 */
export const setCurrentUser = (user: any): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Remove the current user from localStorage
 */
export const removeCurrentUser = (): void => {
  localStorage.removeItem('user');
};

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Check if the current user has the required role(s)
 * @param requiredRoles Single role or array of roles to check against
 */
export const hasRole = (requiredRoles: string | string[]): boolean => {
  const user = getCurrentUser();
  if (!user || !user.role) return false;
  
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(user.role);
  }
  
  return user.role === requiredRoles;
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = (): void => {
  removeAuthToken();
  removeRefreshToken();
  removeCurrentUser();
};

/**
 * Get the authorization header for API requests
 */
export const getAuthHeader = (): { Authorization: string } | {} => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Parse JWT token to get payload
 */
export const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

/**
 * Check if the JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Date.now() / 1000; // Convert to seconds
  return decoded.exp < currentTime;
};

/**
 * Get the remaining time until token expiration in milliseconds
 */
export const getTokenExpirationTime = (token: string): number | null => {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return null;
  
  const currentTime = Date.now() / 1000; // Convert to seconds
  return (decoded.exp - currentTime) * 1000; // Convert to milliseconds
};
