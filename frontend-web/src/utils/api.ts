import axios from 'axios';

const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

const api = axios.create({
  baseURL: `${apiBase}/api`,
  timeout: 100000, 
  headers: {
    'Content-Type': 'application/json',
  }
});

console.log('API baseURL =', api.defaults.baseURL);

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  sessionStorage.getItem('token') ||
                  sessionStorage.getItem('authToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
    if (token) {
      console.log('Token found and added to request');
    } else {
      console.log('No token found for request');
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        console.error('Unauthorized access - clearing tokens');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('authToken');
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        console.error('Forbidden access');
        alert('Vous n\'avez pas les droits pour accéder à cette ressource.');
      } else if (status >= 500) {
        console.error('Server error:', data);
        alert('Erreur serveur. Veuillez réessayer plus tard.');
      }
    } else if (error.request) {
      console.error('Network error:', error.request);
      alert('Erreur de connexion. Vérifiez votre connexion internet.');
    } else {
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export const authUtils = {
  setToken: (token: string, rememberMe: boolean = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', token);
    storage.setItem('authToken', token); 
  },

  getToken: (): string | null => {
    return localStorage.getItem('token') || 
           localStorage.getItem('authToken') || 
           sessionStorage.getItem('token') ||
           sessionStorage.getItem('authToken');
  },

  removeToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('authToken');
  },

  isAuthenticated: (): boolean => {
    const token = authUtils.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  }
};

export const apiRequest = {
  get: async (url: string, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      console.error(`GET ${url} failed:`, error);
      throw error;
    }
  },

  post: async (url: string, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`POST ${url} failed:`, error);
      throw error;
    }
  },

  put: async (url: string, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`PUT ${url} failed:`, error);
      throw error;
    }
  },

  delete: async (url: string, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      console.error(`DELETE ${url} failed:`, error);
      throw error;
    }
  }
};

export default api;