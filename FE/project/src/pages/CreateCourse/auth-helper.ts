// Helper để check authentication status
// Sử dụng trong development để debug token issues

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('access_token');
  return !!token && token.trim() !== '';
}

/**
 * Get token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem('access_token');
}

/**
 * Decode JWT token (basic, không verify signature)
 */
export function decodeToken(token: string): any {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  return Date.now() > expirationTime;
}

/**
 * Get user info from token
 */
export function getUserFromToken(): any {
  const token = getToken();
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded;
}

/**
 * Debug: Print token info to console
 */
export function debugToken(): void {
  console.group('🔐 Token Debug Info');
  
  const token = getToken();
  
  if (!token) {
    console.warn('❌ No token found in localStorage');
    console.log('Key checked: "access_token"');
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.groupEnd();
    return;
  }
  
  console.log('✅ Token exists');
  console.log('Length:', token.length);
  console.log('Preview:', token.substring(0, 30) + '...');
  console.log('Format:', token.startsWith('eyJ') ? 'Valid JWT' : 'Invalid format');
  
  const decoded = decodeToken(token);
  if (decoded) {
    console.log('Decoded payload:', decoded);
    console.log('User ID:', decoded.sub || decoded.userId);
    console.log('Role:', decoded.role);
    console.log('Expires at:', new Date(decoded.exp * 1000).toLocaleString());
    console.log('Is expired:', isTokenExpired(token) ? '❌ YES' : '✅ NO');
  }
  
  console.groupEnd();
}

/**
 * Logout helper
 */
export function logout(): void {
  localStorage.removeItem('access_token');
  console.log('✅ Token removed from localStorage');
}
