import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { logoutThunk } from '@/store/authSlice';
import { toggleSidebar } from '@/store/uiSlice';
import UploadProgressBar from '@/components/UploadProgressBar';
import styles from './Header.module.css';

export default function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAppSelector((state) => state.auth);
  const files = useAppSelector((state) => state.upload.files);

  const hasActiveUploads = files.some(
    (f) => f.status === 'uploading' || f.status === 'validating' || f.status === 'extracting'
  );

  const handleLogout = useCallback(() => {
    dispatch(logoutThunk()).then(() => {
      navigate('/');
    });
  }, [dispatch, navigate]);

  const handleToggleSidebar = useCallback(() => {
    dispatch(toggleSidebar());
  }, [dispatch]);

  return (
    <nav className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.leftSection}>
          <Link to="/" className={styles.logo}>
            doc-upload-extract
          </Link>

          {isAuthenticated && (
            <div className={styles.navLinks}>
              <Link to="/" className={styles.navLink}>
                Dashboard
              </Link>
            </div>
          )}
        </div>

        {isAuthenticated && (
          <div className={styles.rightSection}>
            {hasActiveUploads && (
              <div className={styles.progressContainer}>
                <UploadProgressBar />
              </div>
            )}

            <span className={styles.userGreeting}>
              Hello, {currentUser?.username}
            </span>

            <button
              className={styles.logoutButton}
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>

            <button
              className={styles.hamburgerButton}
              onClick={handleToggleSidebar}
              type="button"
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}