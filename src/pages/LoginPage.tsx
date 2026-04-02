import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { loginThunk } from '@/store/authSlice';
import ErrorMessage from '@/components/ErrorMessage';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error, loading } = useAppSelector((state) => state.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const result = await dispatch(loginThunk({ username, password }));

    if (loginThunk.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>

        {error && <ErrorMessage message={error} type="error" />}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            className={styles.submitButton}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className={styles.footerText}>
          Don&apos;t have an account?{' '}
          <Link to="/signup" className={styles.link}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}