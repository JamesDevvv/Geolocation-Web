import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { authService } from '../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  async function handleSubmit(email: string, password: string) {
    setApiError(null);
    setLoading(true);
    try {
      await authService.login(email, password);
      navigate('/home', { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please check your credentials and try again.';
      setApiError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full flex flex-col items-center space-y-3">
        <LoginForm onSubmit={handleSubmit} loading={loading} apiError={apiError} />
       
      </div>
    </div>
  );
}
