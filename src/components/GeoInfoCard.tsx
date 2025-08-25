type Props = {
  data: any;
};

// Safe getter for nested keys like "location.city"
function get(obj: any, path: string): any {
  if (!obj || typeof obj !== 'object') return undefined;
  if (!path.includes('.')) return obj[path];
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function guessField(data: any, candidates: string[], fallback: string = ''): string {
  for (const c of candidates) {
    const v = get(data, c);
    if (v === null || v === undefined) continue;
    const s = String(v);
    if (s.trim() !== '') return s;
  }
  return fallback;
}

function guessNumber(data: any, candidates: string[]): number | null {
  for (const c of candidates) {
    const v = get(data, c);
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && v.trim() && !Number.isNaN(Number(v))) {
      return Number(v);
    }
  }
  return null;
}

export default function GeoInfoCard({ data }: Props) {
  const ip = guessField(data, ['ip', 'query', 'ipAddress', 'IPAddress', 'ip_address'], 'Unknown');
  const city = guessField(data, ['city', 'location.city', 'City'], '');
  const region = guessField(data, ['region', 'regionName', 'location.region', 'state', 'State'], '');
  const country = guessField(data, ['country', 'country_name', 'countryCode', 'Country', 'location.country'], '');
  const isp = guessField(data, ['isp', 'org', 'organization', 'as', 'ASN', 'carrier'], '');
  const lat = guessNumber(data, ['lat', 'latitude', 'location.lat', 'location.latitude']);
  const lng = guessNumber(data, ['lng', 'lon', 'longitude', 'location.lng', 'location.lon', 'location.longitude']);

  const label = (text: string) => <span className="text-sm text-gray-500">{text}</span>;
  const value = (text: string | number | null | undefined) => (
    <span className="text-sm font-medium text-gray-900">{text ?? '-'}</span>
  );

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          {label('IP Address')}
          <div>{value(ip)}</div>
        </div>
        <div className="space-y-1">
          {label('ISP / Organization')}
          <div>{value(isp || '-')}</div>
        </div>
        <div className="space-y-1">
          {label('City')}
          <div>{value(city || '-')}</div>
        </div>
        <div className="space-y-1">
          {label('Region')}
          <div>{value(region || '-')}</div>
        </div>
        <div className="space-y-1">
          {label('Country')}
          <div>{value(country || '-')}</div>
        </div>
        <div className="space-y-1">
          {label('Coordinates')}
          <div>{value(lat !== null && lng !== null ? `${lat}, ${lng}` : '-')}</div>
        </div>
      </div>

      <details className="rounded-lg border border-gray-200">
        <summary className="cursor-pointer select-none px-3 py-2 text-sm text-gray-700">
          Raw response (JSON)
        </summary>
        <pre className="overflow-auto text-xs p-3 bg-gray-50 rounded-b-lg">
{JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}
