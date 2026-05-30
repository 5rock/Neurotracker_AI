/**
 * Map axios/auth errors to user-facing messages.
 */
export const getAuthErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error) return fallback;

  const status = error.response?.status;
  const data = error.response?.data;
  const serverMessage = data?.message;

  if (serverMessage) return serverMessage;

  if (status === 429) {
    const url = error.config?.url || '';
    if (url.includes('/auth/guest') || data?.code === 'GUEST_RATE_LIMIT') {
      return 'Guest login limit reached. Please try again later or create a free account.';
    }
    return 'Too many requests. Please wait a moment and try again.';
  }

  if (status === 401) return 'Invalid credentials. Please check your email and password.';
  if (status === 400) return data?.message || 'Invalid request. Please check your input.';
  if (status === 403) return data?.message || 'Access denied.';
  if (status >= 500) return 'Server error. Please try again in a moment.';

  // Axios network / CORS — no response received
  if (error.message === 'Network Error' || !error.response) {
    return 'Cannot reach the server. Use VITE_API_URL=/api in dev and ensure the backend is running on port 5000.';
  }

  return error.message || fallback;
};

/** Extract user from axios response (handles response.data.user) */
export const extractAuthUser = (response) => {
  const payload = response?.data ?? response;
  return payload?.user ?? null;
};

/** Extract full auth payload from axios response */
export const extractAuthPayload = (response) => response?.data ?? response;
