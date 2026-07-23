import {useState} from 'react';
import {login, register} from '../api/authApi.js';
import {validateAuthInput} from '../validation/authValidation.js';

export default function AuthForm({onAuthenticated, initialError = ''}) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialError);
  const [submitting, setSubmitting] = useState(false);

  const registering = mode === 'register';

  function switchMode() {
    setMode(registering ? 'login' : 'register');
    setPassword('');
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const validation = validateAuthInput({username, password});
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setSubmitting(true);
    try {
      const response = registering
        ? await register(validation.data)
        : await login(validation.data);
      onAuthenticated(response.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="panel auth-panel" aria-labelledby="auth-heading">
        <div className="auth-heading">
          <p className="eyebrow">Employee management</p>
          <h1 id="auth-heading">{registering ? 'Create account' : 'Log in'}</h1>
          <p>{registering ? 'Register a username and password.' : 'Enter your account credentials.'}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {error && <div className="notice notice-error" role="alert"><span>{error}</span></div>}

          <label className="field">
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              minLength={3}
              maxLength={50}
              autoComplete="username"
              autoFocus
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              maxLength={128}
              autoComplete={registering ? 'new-password' : 'current-password'}
              required
            />
          </label>

          <button className="button button-primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Please wait…' : registering ? 'Register' : 'Log in'}
          </button>
        </form>

        <div className="auth-switch">
          <span>{registering ? 'Already registered?' : 'No account yet?'}</span>
          <button className="text-button" type="button" onClick={switchMode} disabled={submitting}>
            {registering ? 'Log in' : 'Create account'}
          </button>
        </div>
      </section>
    </main>
  );
}
