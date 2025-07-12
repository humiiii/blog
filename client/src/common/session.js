// Store a value in session
export function storeSession(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

// Retrieve a value from session
export function lookSession(key) {
  const value = sessionStorage.getItem(key);
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return value;
  }
}

// Remove a value from session
export function removeSession(key) {
  sessionStorage.removeItem(key);
}
