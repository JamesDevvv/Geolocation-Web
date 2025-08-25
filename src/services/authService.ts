import axios from 'axios';

const TOKEN_KEY = 'auth_token';

export type LoginResponse = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  [key: string]: any;
};


export async function getUserIP(): Promise<string | null> {
  try {
    
    const services = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://httpbin.org/ip'
    ];

    for (const service of services) {
      try {
        const response = await axios.get(service, { timeout: 5000 });
        
        
        if (response.data.ip) {
          return response.data.ip;
        }
        if (response.data.origin) {
          return response.data.origin;
        }
      } catch (err) {
        console.warn(`Failed to get IP from ${service}:`, err);
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to get user IP:', error);
    return null;
  }
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    
    const userIP = await getUserIP();
    
    
    const loginData: any = { email, password };
    if (userIP) {
      loginData.ip = userIP;
    }
    
    const res = await axios.post('/api/login', loginData);
    const data: LoginResponse = res.data || {};
    const token =
      data.token ||
      data.accessToken ||
      data.jwt ||
      
      res.headers?.authorization?.replace(/^Bearer\s+/i, '') ||
      res.headers?.Authorization?.replace(/^Bearer\s+/i, '');

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    return data;
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  async logout(): Promise<void> {
    try {
      await axios.post('/api/logout', {}, { headers: this.getAuthHeader() });
    } catch {
      // Ignore errors; always clear local auth
    } finally {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};
