import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { getHome, searchIp, clearSearch, getHistory, getHistoryItem, deleteHistories, type HistoryItem } from '../services/api';
import { isValidIp } from '../utils/validateIp';
import GeoInfoCard from '../components/GeoInfoCard';
import HistoryList from '../components/HistoryList';
import MapView from '../components/MapView';

type LatLng = { lat: number; lng: number } | null;

// Fetch history from backend
async function fetchHistory(): Promise<HistoryItem[]> {
  try {
    const list = await getHistory();
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function extractLatLng(geo: any): LatLng {
  if (!geo || typeof geo !== 'object') return null;

  // Common patterns
  const latCandidates = ['lat', 'latitude', 'Latitude', 'latDecimal', 'location.lat', 'location.latitude'];
  const lngCandidates = ['lng', 'lon', 'longitude', 'Longitude', 'lngDecimal', 'location.lng', 'location.lon', 'location.longitude'];

  const lookup = (obj: any, path: string): any => {
    if (path.includes('.')) {
      return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
    }
    return obj[path];
  };

  let lat: number | undefined;
  let lng: number | undefined;

  for (const key of latCandidates) {
    const v = lookup(geo, key);
    if (typeof v === 'number') {
      lat = v;
      break;
    }
    if (typeof v === 'string' && v.trim() && !Number.isNaN(Number(v))) {
      lat = Number(v);
      break;
    }
  }

  for (const key of lngCandidates) {
    const v = lookup(geo, key);
    if (typeof v === 'number') {
      lng = v;
      break;
    }
    if (typeof v === 'string' && v.trim() && !Number.isNaN(Number(v))) {
      lng = Number(v);
      break;
    }
  }

  if (typeof lat === 'number' && typeof lng === 'number') {
    return { lat, lng };
  }
  return null;
}

function extractIp(geo: any): string | null {
  if (!geo || typeof geo !== 'object') return null;
  // Common ip fields seen across providers
  const keys = ['ip', 'query', 'ipAddress', 'IPAddress', 'ip_address'];
  for (const k of keys) {
    const v = (geo as any)[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

export default function Home() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [searching, setSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [geo, setGeo] = useState<any>(null);
  const [currentIp, setCurrentIp] = useState<string | null>(null);

  const [inputIp, setInputIp] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const center: LatLng = useMemo(() => extractLatLng(geo), [geo]);

  useEffect(() => {
    // Redirect to login if not authed (extra safety)
    if (!authService.isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }

    let active = true;
    async function boot() {
      setLoading(true);
      setError(null);
      try {
        const res = await getHome();
        if (!active) return;
        setGeo(res);
        const ip = extractIp(res);
        setCurrentIp(ip);
        setInputIp('');

        const h = await fetchHistory();
        if (!active) return;
        setHistory(h);
      } catch (err: any) {
        if (!active) return;
        const msg = err?.response?.data?.message || err?.message || 'Failed to load current geolocation.';
        setError(String(msg));
      } finally {
        if (active) setLoading(false);
      }
    }
    boot();

    return () => {
      active = false;
    };
  }, [navigate]);


  async function handleSearch() {
    setInputError(null);
    setError(null);
    const ip = inputIp.trim();
    if (!ip) {
      setInputError('Enter an IP address');
      return;
    }
    if (!isValidIp(ip)) {
      setInputError('Enter a valid IPv4 or IPv6 address');
      return;
    }
    setSearching(true);
    try {
      const res = await searchIp(ip);
      setGeo(res);
      const h = await getHistory();
      setHistory(Array.isArray(h) ? h : []);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch geolocation for the entered IP.';
      setError(String(msg));
    } finally {
      setSearching(false);
    }
  }

  async function handleSelectHistory(id: string | number) {
    setInputError(null);
    setError(null);
    setSearching(true);
    try {
      const res = await getHistoryItem(id);
      setGeo(res);
      const ip = extractIp(res) ?? (history.find((it) => it.id === id)?.ip ?? '');
      setInputIp(ip);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch geolocation for the selected history.';
      setError(String(msg));
    } finally {
      setSearching(false);
    }
  }

  async function handleClear() {
    setInputIp('');
    setInputError(null);
    setError(null);
    setSearching(true);
    try {
      const res = await clearSearch();
      setGeo(res);
      const ip = extractIp(res);
      setCurrentIp(ip);
      const h = await getHistory();
      setHistory(Array.isArray(h) ? h : []);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load current geolocation.';
      setError(String(msg));
    } finally {
      setSearching(false);
    }
  }

  function toggleSelect(id: string | number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function deleteSelected() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setSearching(true);
    try {
      await deleteHistories(ids);
      const h = await getHistory();
      setHistory(Array.isArray(h) ? h : []);
      setSelected(new Set());
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to delete selected history items.';
      setError(String(msg));
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold text-gray-900">Geolocation Dashboard</h1>
            <p className="text-sm text-gray-500">Search IP addresses and view their geolocation info</p>
          </div>
          <button
            onClick={async () => {
              await authService.logout();
              navigate('/login', { replace: true });
            }}
            className="rounded-md bg-gray-800 text-white text-sm px-3 py-2 hover:bg-gray-900"
          >
            Logout
          </button>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {/* Left column: controls + history */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow p-4 space-y-3">
              <label htmlFor="ip" className="block text-sm font-medium text-gray-700">
                Enter IP address
              </label>
              <div className="flex gap-2">
                <input
                  id="ip"
                  type="text"
                  value={inputIp}
                  onChange={(e) => setInputIp(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="e.g. 8.8.8.8"
                />
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="rounded-md bg-indigo-600 text-white text-sm px-4 py-2 hover:bg-indigo-700 disabled:opacity-60"
                >
                  {searching ? 'Searching…' : 'Search'}
                </button>
              </div>
              {inputError ? <p className="text-xs text-red-600">{inputError}</p> : null}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClear}
                  disabled={searching || loading}
                  className="rounded-md bg-gray-200 text-gray-900 text-sm px-3 py-2 hover:bg-gray-300 disabled:opacity-60"
                >
                  Clear to current
                </button>
                {currentIp ? (
                  <span className="text-xs text-gray-500">Logged-in IP: {currentIp}</span>
                ) : null}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-900">Search History</h2>
                <button
                  onClick={deleteSelected}
                  disabled={selected.size === 0}
                  className="text-xs rounded-md bg-red-600 text-white px-2 py-1 disabled:opacity-60"
                >
                  Delete selected
                </button>
              </div>
              <HistoryList
                items={history}
                selected={selected}
                onSelect={handleSelectHistory}
                onToggleSelect={toggleSelect}
              />
            </div>
          </div>

          {/* Right column: geo + map */}
          <div className="md:col-span-2 space-y-4">
            {error ? (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            ) : null}

            <div className="bg-white rounded-lg shadow p-4">
              {loading ? (
                <p className="text-sm text-gray-500">Loading current geolocation…</p>
              ) : geo ? (
                <GeoInfoCard data={geo} />
              ) : (
                <p className="text-sm text-gray-500">No geolocation data yet.</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-[360px]">
                {center ? (
                  <MapView lat={center.lat} lng={center.lng} />
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-gray-500">
                    Location unavailable for this IP.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
