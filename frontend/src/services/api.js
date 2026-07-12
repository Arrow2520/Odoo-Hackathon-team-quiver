// src/services/api.js

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // Adjust port if FastAPI runs on a different port

// Helper to configure headers with JWT auth tokens
const getHeaders = () => {
  const token = localStorage.getItem('transitops_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Generic response handler
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const apiService = {
  auth: {
    login: async (email, password) => {
      // Assuming FastAPI uses standard OAuth2 password bearer (form data)
      const formData = new URLSearchParams();
      formData.append('username', email); // OAuth2 uses 'username'
      formData.append('password', password);

      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });
      return handleResponse(res);
    },
    register: async (userData) => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return handleResponse(res);
    }
  },

  vehicles: {
    getAll: async () => {
      const res = await fetch(`${BASE_URL}/vehicles`, { headers: getHeaders() });
      return handleResponse(res);
    },
    create: async (vehicleData) => {
      const res = await fetch(`${BASE_URL}/vehicles`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(vehicleData),
      });
      return handleResponse(res);
    }
  },

  drivers: {
    getAll: async () => {
      const res = await fetch(`${BASE_URL}/drivers`, { headers: getHeaders() });
      return handleResponse(res);
    },
    create: async (driverData) => {
      const res = await fetch(`${BASE_URL}/drivers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(driverData),
      });
      return handleResponse(res);
    }
  },

  trips: {
    getAll: async () => {
      const res = await fetch(`${BASE_URL}/trips`, { headers: getHeaders() });
      return handleResponse(res);
    },
    create: async (tripData) => {
      const res = await fetch(`${BASE_URL}/trips`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(tripData),
      });
      return handleResponse(res);
    },
    complete: async (id, finalOdometer, fuelConsumed) => {
      const res = await fetch(`${BASE_URL}/trips/${id}/complete`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ finalOdometer, fuelConsumed }),
      });
      return handleResponse(res);
    },
    cancel: async (id) => {
      const res = await fetch(`${BASE_URL}/trips/${id}/cancel`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },

  // --- FUEL MANAGEMENT ---
  fuel: {
    getAll: async () => {
      const res = await fetch(`${BASE_URL}/fuel`, { headers: getHeaders() });
      return handleResponse(res);
    },
    create: async (fuelData) => {
      const res = await fetch(`${BASE_URL}/fuel`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(fuelData),
      });
      return handleResponse(res);
    }
  },

  // --- EXPENSE MANAGEMENT ---
  expenses: {
    getAll: async () => {
      const res = await fetch(`${BASE_URL}/expenses`, { headers: getHeaders() });
      return handleResponse(res);
    },
    create: async (expenseData) => {
      const res = await fetch(`${BASE_URL}/expenses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(expenseData),
      });
      return handleResponse(res);
    }
  },
  
  // --- REPORTS & ANALYTICS ---
  // Based on your schemas.py, it looks like you have endpoints for reports
  reports: {
    getKPIs: async () => {
      const res = await fetch(`${BASE_URL}/reports/kpis`, { headers: getHeaders() });
      return handleResponse(res);
    },
    getVehicles: async () => {
      const res = await fetch(`${BASE_URL}/reports/vehicles`, { headers: getHeaders() });
      return handleResponse(res);
    }
  }
};