import { useState, FormEvent } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import api from '@/services/api';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      localStorage.setItem('library_token', response.data.access_token);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Neighborhood Library</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="container">
        <div className="auth-container">
          <div className="auth-card">
            <h1>📚 Neighborhood Library</h1>
            <h2>Login</h2>
            
            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="error">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="auth-hint">
              <p>Default credentials: admin / admin123</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
