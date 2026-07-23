import {useCallback, useEffect, useState} from 'react';
import {AuthForm, getCurrentUser, logout} from '../features/auth/index.js';
import {EmployeeManagementPage} from '../features/employees/index.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkAuthentication() {
      try {
        const currentUser = await getCurrentUser();
        if (active) setUser(currentUser);
      } catch (requestError) {
        if (active && requestError.status !== 401) setAuthError(requestError.message);
      } finally {
        if (active) setCheckingAuth(false);
      }
    }

    checkAuthentication();
    return () => {
      active = false;
    };
  }, []);

  function handleAuthenticated(authenticatedUser) {
    setAuthError('');
    setUser(authenticatedUser);
  }

  const handleSessionExpired = useCallback(() => {
    setAuthError('Your session expired. Log in again.');
    setUser(null);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      setAuthError('');
      setUser(null);
    } finally {
      setLoggingOut(false);
    }
  }

  if (checkingAuth) {
    return <main className="auth-page"><div className="auth-loading">Checking session…</div></main>;
  }

  if (!user) {
    return <AuthForm onAuthenticated={handleAuthenticated} initialError={authError} />;
  }

  return (
    <EmployeeManagementPage
      user={user}
      loggingOut={loggingOut}
      onLogout={handleLogout}
      onSessionExpired={handleSessionExpired}
    />
  );
}
