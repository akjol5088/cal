/**
 * Utility to get the server URL dynamically.
 * - Localhost / LAN (192.168.x.x, 10.x.x.x): connect to :5000
 * - Vercel / cloud hostname: return null  →  demo mode
 */
export const getServerUrl = () => {
  // 1. Explicit env var always wins (e.g. Railway, Render backend)
  if (import.meta.env.VITE_SERVER_URL) return import.meta.env.VITE_SERVER_URL;

  if (typeof window === 'undefined') return 'http://localhost:5000';

  const { hostname, protocol } = window.location;

  // 2. Localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }

  // 3. Private / LAN IP ranges — server runs on same machine
  const isLAN =
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.')      ||
    hostname.startsWith('172.');
  if (isLAN) {
    return `${protocol}//${hostname}:5000`;
  }

  // 4. Cloud / Vercel / public hostname — no backend available
  //    Return null → SocketContext will enter demo mode immediately
  return null;
};

export const SERVER_URL = getServerUrl();
