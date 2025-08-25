import axios from 'axios';
import { authService } from './authService';

export const api = axios.create({
  baseURL: '/', 
  headers: {
    'Content-Type': 'application/json',
  },
});

 
api.interceptors.request.use((config) => {
  const authHeader = authService.getAuthHeader();

  if (!config.headers) {
    config.headers = {} as any;
  }
  Object.assign(config.headers as any, authHeader);
  return config;
});

export type GeoResponse = Record<string, any>;
export type HistoryItem = { id: string | number; ip: string; [key: string]: any };


export async function getMe(): Promise<Record<string, any>> {
  const { data } = await api.get('/api/me');
  return data;
}


export async function getHome(): Promise<GeoResponse> {
  try {
    
    const { getUserIP } = await import('./authService');
    const userIP = await getUserIP();
    
   
    const { data } = await api.post('/api/home', { ip: userIP });
    
    if (import.meta.env.DEV && (!data || typeof data !== 'object')) {
      return mockGeo();
    }
    
    return flattenGeoResponse(data);
  } catch (err) {
    if (import.meta.env.DEV) {
      return mockGeo();
    }
    throw err;
  }
}

export async function searchIp(ip: string): Promise<GeoResponse> {
  try {
    const { data } = await api.post('/api/search-ip', { ip });
    
    if (import.meta.env.DEV && (!data || typeof data !== 'object')) {
      return mockGeo(ip);
    }
   
    return flattenGeoResponse(data);
  } catch (err) {
    if (import.meta.env.DEV) {
      return mockGeo(ip);
    }
    throw err;
  }
}


export async function clearSearch(): Promise<GeoResponse> {
  try {
    const { data } = await api.get('/api/clear-search');
  
    if (import.meta.env.DEV && (!data || typeof data !== 'object')) {
      return mockGeo();
    }
    
    return flattenGeoResponse(data);
  } catch (err) {
    if (import.meta.env.DEV) {
      return mockGeo();
    }
    throw err;
  }
}


export async function getHistory(): Promise<HistoryItem[]> {
  try {
    const { data } = await api.get('/api/history');
    
   
    let historyData = data;
    
   
    if (data && data.data) {
      if (Array.isArray(data.data.history)) {
        historyData = data.data.history;
      } else if (Array.isArray(data.data)) {
        historyData = data.data;
      }
    }
    
  
    if (data && Array.isArray(data.history)) {
      historyData = data.history;
    }
    
   
    if (Array.isArray(historyData)) {
      return historyData;
    }
    
    
    console.log('History API response:', data);
    console.warn('Unexpected history data format, expected array but got:', typeof historyData, historyData);
    return [];
  } catch (err) {
    console.error('Failed to fetch history:', err);
    throw err;
  }
}

export async function getHistoryItem(id: string | number): Promise<GeoResponse> {
  try {
    const { data } = await api.get('/api/history/' + id);
    
    if (import.meta.env.DEV && (!data || typeof data !== 'object')) {
      return mockGeo();
    }
   
    return flattenGeoResponse(data);
  } catch (err) {
    if (import.meta.env.DEV) {
      return mockGeo();
    }
    throw err;
  }
}

export async function deleteHistories(ids: Array<string | number>): Promise<Record<string, any>> {
  const { data } = await api.post('/api/history-delete', { ids });
  return data;
}


function mockGeo(ip?: string): GeoResponse {
  const ipAddr = ip ?? '93.184.216.34';
  if (ip === '8.8.8.8') {
    return {
      ip: '8.8.8.8',
      city: 'Mountain View',
      region: 'CA',
      country: 'US',
      isp: 'Google LLC',
      lat: 37.3861,
      lng: -122.0839,
    };
  }
  if (ip === '1.1.1.1') {
    return {
      ip: '1.1.1.1',
      city: 'Sydney',
      region: 'NSW',
      country: 'AU',
      isp: 'Cloudflare',
      lat: -33.8688,
      lng: 151.2093,
    };
  }
  
  return {
    ip: ipAddr,
    city: 'New York',
    region: 'NY',
    country: 'US',
    isp: 'Mock ISP',
    lat: 40.7128,
    lng: -74.006,
  };
}


function flattenGeoResponse(data: any): GeoResponse {
  if (!data || typeof data !== 'object') {
    return {};
  }

  if (data.lat !== undefined || data.lng !== undefined) {
    return data;
  }

  
  const geo = data.geo || {};
  const ip = data.ip || geo.query || geo.ip;

  
  if (geo.status === 'fail') {
    return {
      ip: ip,
      city: '',
      region: '',
      country: '',
      isp: geo.message || 'Location unavailable',
      lat: null,
      lng: null,
      ...geo
    };
  }

 
  const flattened = {
    ip: ip,
    city: geo.city || '',
    region: geo.region || geo.regionName || '',
    country: geo.country || '',
    isp: geo.isp || geo.org || '',
    lat: geo.lat || null,
    lng: geo.lon || geo.lng || null, 
    
    ...geo
  };

  
  if (geo.lon && !flattened.lng) {
    flattened.lng = geo.lon;
  }

  return flattened;
}

export async function getCurrentGeo(): Promise<GeoResponse> {
  
  return getHome();
}

export async function getGeoByIp(ip: string): Promise<GeoResponse> {
  
  return searchIp(ip);
}
