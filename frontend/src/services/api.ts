import axios from 'axios';

// API Base URL - use relative URL in production, localhost in development
const getBaseURL = () => {
  if (import.meta.env.PROD) {
    return '/api'
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
}

const API_BASE_URL = getBaseURL();

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },
  
  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/register', { email, password, name });
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
  }
};

// Customer API
export const customerAPI = {
  getAll: async () => {
    const response = await api.get('/customers');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },
  
  create: async (customerData: any) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },
  
  update: async (id: string, customerData: any) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  }
};

// Invoice API
export const invoiceAPI = {
  getAll: async () => {
    const response = await api.get('/invoices');
    return response.data;
  },
  
  getDefaults: async () => {
    const response = await api.get('/invoices/defaults');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },
  
  create: async (invoiceData: any) => {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  },
  
  update: async (id: string, invoiceData: any) => {
    const response = await api.put(`/invoices/${id}`, invoiceData);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  },
  
  downloadPDF: async (id: string) => {
    const response = await api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Quote API
export const quoteAPI = {
  getAll: async () => {
    const response = await api.get('/quotes');
    return response.data;
  },
  
  getDefaults: async () => {
    const response = await api.get('/quotes/defaults');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/quotes/${id}`);
    return response.data;
  },
  
  create: async (quoteData: any) => {
    const response = await api.post('/quotes', quoteData);
    return response.data;
  },
  
  update: async (id: string, quoteData: any) => {
    const response = await api.put(`/quotes/${id}`, quoteData);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/quotes/${id}`);
    return response.data;
  },
  
  downloadPDF: async (id: string) => {
    const response = await api.get(`/quotes/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Settings API
export const settingsAPI = {
  get: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
  
  update: async (settingsData: any) => {
    const response = await api.put('/settings', settingsData);
    return response.data;
  },
  
  uploadLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await api.post('/settings/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  deleteLogo: async () => {
    const response = await api.delete('/settings/logo');
    return response.data;
  }
};
