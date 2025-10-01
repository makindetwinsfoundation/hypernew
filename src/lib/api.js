const API_BASE_URL = 'https://auth-service-3s1v.onrender.com';
const WALLET_API_BASE_URL = 'https://wallet-service-dmip.onrender.com';

// API utility functions
export const apiRequest = async (endpoint, options = {}, baseUrl = API_BASE_URL) => {
  const url = `${baseUrl}${endpoint}`;
  const token = localStorage.getItem('accessToken');
  
  const config = {
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  console.log('Making API request:', { url, config });

  // Log the Authorization header for debugging token issues
  if (config.headers.Authorization) {
    console.log('Authorization header present:', config.headers.Authorization.substring(0, 20) + '...');
  } else {
    console.log('No Authorization header found in request');
  }

  try {
    const response = await fetch(url, config);
    console.log('API response received:', { status: response.status, ok: response.ok });
    
    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('API response data:', data);
    } else {
      // If not JSON, read as text for better error reporting
      const textResponse = await response.text();
      console.log('Non-JSON response received:', textResponse.substring(0, 200) + '...');
      
      // Try to extract meaningful error message from HTML or text
      let errorMessage = `Server returned non-JSON response (${response.status})`;
      if (textResponse.includes('<!DOCTYPE')) {
        errorMessage = `Server returned HTML page instead of JSON (${response.status}). The API endpoint may be unavailable.`;
      }
      
      throw new Error(errorMessage);
    }

    if (!response.ok) {
      // Handle token expiration
      if (response.status === 401 && token) {
        console.log('Token expired, attempting refresh...');
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${baseUrl}/v1/auth/refresh-token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              console.log('Token refresh successful');
              localStorage.setItem('accessToken', refreshData.accessToken || refreshData.token);
              if (refreshData.refreshToken) {
                localStorage.setItem('refreshToken', refreshData.refreshToken);
              }

              // Retry original request with new token
              config.headers.Authorization = `Bearer ${refreshData.accessToken || refreshData.token}`;
              const retryResponse = await fetch(url, config);
              const retryData = await retryResponse.json();
              console.log('Retry request successful');
              return retryData;
            } else {
              console.log('Token refresh failed, clearing tokens');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Clear tokens and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            // Don't redirect immediately, let the auth context handle it
          }
        } else {
          console.log('No refresh token available, clearing access token');
          localStorage.removeItem('accessToken');
        }
      }
      
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  signup: (email, password) => 
    apiRequest('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email, password) => 
    apiRequest('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verifyEmail: (email,otp) => 
    apiRequest('/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email,otp }),
    }),

  resendVerification: (email) => 
    apiRequest('/v1/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  requestPasswordReset: (email) => 
    apiRequest('/auth/v2/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token, newPassword) => 
    apiRequest('/auth/v2/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),

  refreshToken: (refreshToken) => 
    apiRequest('/auth/v2/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  getUser: () => 
    apiRequest('/v1/auth/user'),

  getVerificationStatus: () => 
    apiRequest('/auth/v2/verification-status'),

  logout: () => 
    apiRequest('/auth/v2/logout', { method: 'POST' }),

  cleanup: () => 
    apiRequest('/auth/v2/cleanup', { method: 'POST' }),

  // PIN Management
  createPin: (userId, pin) => 
    apiRequest('/v1/pin/create', {
      method: 'POST',
      body: JSON.stringify({ userId, pin }),
    }),

  verifyPin: (userId, pin) => 
    apiRequest('/v1/pin/verify', {
      method: 'POST',
      body: JSON.stringify({ userId, pin }),
    }),

  loginWithPin: (userId, pin) => 
    apiRequest('/v1/pin/login', {
      method: 'POST',
      body: JSON.stringify({ userId, pin }),
    }),

  getPinStatus: (userId) => 
    apiRequest(`/v1/pin/status?userId=${userId}`),
};

// Wallet API functions
export const walletAPI = {
  createWallet: (userId) => 
    apiRequest('/v1/wallet/create', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }, WALLET_API_BASE_URL),

  getWalletAddresses: (userId) => 
    apiRequest(`/v1/wallet/addresses/${userId}`, {}, WALLET_API_BASE_URL),

  getWalletBalances: (userId) => 
    apiRequest(`/v1/wallet/balances/${userId}`, {}, WALLET_API_BASE_URL),

  getSpecificBalance: (currency, address) => 
    apiRequest(`/v1/wallet/balance/${currency}/${address}`, {}, WALLET_API_BASE_URL),

  getDepositAddress: (currency, chain, userId) => 
    apiRequest(`/v1/receive/address?currency=${currency}&chain=${chain}&userId=${userId}`, {}, WALLET_API_BASE_URL),

  getDepositHistory: (currency, limit = 20) => 
    apiRequest(`/v1/receive/history?currency=${currency}&limit=${limit}`, {}, WALLET_API_BASE_URL),

  getTransactionHistory: (userId, limit = 5) => 
    apiRequest(`/v1/transactions?userId=${userId}&limit=${limit}`, {}, WALLET_API_BASE_URL),

  getSpecificTransaction: (transactionId) => 
    apiRequest(`/v1/transactions/${transactionId}`, {}, WALLET_API_BASE_URL),

  getWalletHistory: (userId) => 
    apiRequest(`/v1/wallet/history?userId=${userId}`, {}, WALLET_API_BASE_URL),

  getSwapQuote: (fromCurrency, toCurrency, amount) => 
    apiRequest('/v1/wallet/swap/quote', {
      method: 'POST',
      body: JSON.stringify({ 
        fromCurrency: fromCurrency, 
        toCurrency: toCurrency, 
        fromAmount: amount 
      }),
    }, WALLET_API_BASE_URL),

  executeSwap: (userId, fromCurrency, toCurrency, amount, quoteId) => 
    apiRequest('/v1/wallet/swap/execute', {
      method: 'POST',
      body: JSON.stringify({ 
        userId,
        fromCurrency: fromCurrency, 
        toCurrency: toCurrency, 
        fromAmount: amount,
        quoteId 
      }),
    }, WALLET_API_BASE_URL),

  sendExternal: (currency, amount, address) => 
    apiRequest('/v1/send/external', {
      method: 'POST',
      body: JSON.stringify({ 
        currency, 
        amount, 
        toAddress: address,
        chain: currency === 'BTC_TESTNET' ? 'bitcoin-testnet' : 
               currency === 'ETH' ? 'ethereum' : 
               currency === 'ETH_SEPOLIA' ? 'ethereum-sepolia' : 
               'ethereum'
      }),
    }, WALLET_API_BASE_URL),
};

// Test API functions (for development)
export const testAPI = {
  getTestUsers: () => 
    apiRequest('/test/users'),

  createTestUser: (userData) => 
    apiRequest('/test/create-test-user', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
};

export default { apiRequest, authAPI, walletAPI, testAPI };
