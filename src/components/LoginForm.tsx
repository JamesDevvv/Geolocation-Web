import { useState } from 'react';

type Props = {
  onSubmit: (email: string, password: string) => Promise<void> | void;
  loading?: boolean;
  apiError?: string | null;
};

type FieldErrors = {
  email?: string;
  password?: string;
};

const emailRegex =
  // Simple, pragmatic email regex
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm({ onSubmit, loading = false, apiError = null }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!email.trim()) {
      next.email = 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      next.email = 'Enter a valid email address';
    }
    if (!password) {
      next.password = 'Password is required';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(email.trim(), password);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md bg-white shadow rounded-lg p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
        <p className="text-sm text-gray-500">Access your geolocation dashboard</p>
      </div>

      {apiError ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {apiError}
        </div>
      ) : null}

      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={`block w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.email ? 'border-red-300' : 'border-gray-300'
          }`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          placeholder="you@example.com"
        />
        {errors.email ? <p className="text-xs text-red-600 mt-1">{errors.email}</p> : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className={`block w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.password ? 'border-red-300' : 'border-gray-300'
          }`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          placeholder="••••••••"
        />
        {errors.password ? <p className="text-xs text-red-600 mt-1">{errors.password}</p> : null}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-60"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
