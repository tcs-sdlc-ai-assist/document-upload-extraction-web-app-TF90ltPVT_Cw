import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { signupThunk } from '@/store/authSlice';
import ErrorMessage from '@/components/ErrorMessage';
import styles from './SignupPage.module.css';

export default function SignupPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error, loading } = useAppSelector((state) => state.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match. Please try again.');
      return;
    }

    const result = await dispatch(signupThunk({ username, password }));

    if (signupThunk.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign Up</h1>

        {localError && <ErrorMessage message={localError} type="error" />}
        {error && !localError && <ErrorMessage message={error} type="error" />}

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
              placeholder="Choose a username"
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
              placeholder="Choose a password"
              required
              autoComplete="new-password"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              className={styles.input}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            className={styles.submitButton}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className={styles.footerText}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}