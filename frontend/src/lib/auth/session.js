const CUSTOMER_TOKEN_KEY = 'thepurple_customer_token';
const ADMIN_TOKEN_KEY = 'thepurple_admin_token';
const ADMIN_PROFILE_KEY = 'thepurple_admin_profile';

const sessionListeners = new Set();

function notifySessionListeners(session) {
  sessionListeners.forEach((listener) => {
    try {
      listener(session);
    } catch (e) {
      console.error('Session listener error:', e);
    }
  });
}

export function observeSession(listener) {
  sessionListeners.add(listener);
  // Emit initial state
  const currentToken = getStoredAdminToken();
  const currentProfile = getStoredAdmin();
  listener(currentToken ? { token: currentToken, admin: currentProfile } : null);

  return () => {
    sessionListeners.delete(listener);
  };
}

// ─── Customer Session ────────────────────────────────────────────────

export function setCustomerSession(token) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  }
}

export function getStoredCustomerToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(CUSTOMER_TOKEN_KEY);
  }
  return null;
}

export function clearCustomerSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  }
}

// ─── Admin Session ───────────────────────────────────────────────────

export function setAdminSession(token, profile) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    if (profile) {
      localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(profile));
    }
    notifySessionListeners({ token, admin: profile });
  }
}

export function getStoredAdminToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  }
  return null;
}

export function getStoredAdmin() {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(ADMIN_PROFILE_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function signOutAdmin() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_PROFILE_KEY);
    notifySessionListeners(null);
  }
  return Promise.resolve();
}

// ─── Shared ──────────────────────────────────────────────────────────

export async function getAccessToken() {
  // If in admin path, prioritize admin token
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return getStoredAdminToken() || null;
  }
  return getStoredCustomerToken() || getStoredAdminToken() || null;
}
