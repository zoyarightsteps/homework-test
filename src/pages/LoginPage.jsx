import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import { homePathForRoles } from '../utils/roles';
import { getErrorMessage } from '../utils/getErrorMessage';
import { Input } from '../components/ui/Field';
import Button from '../components/ui/Button';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@rightsteps.app', password: 'Admin@123' },
  { role: 'Parent', email: 'manish@rightsteps.app', password: 'Manish1234' },
  { role: 'Tutor', email: 'james.wilson@tutors.uk', password: 'SecurePass123' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user, tokens } = await loginApi(email, password);
      login(user, tokens);
      navigate(homePathForRoles(user.roles), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
            R
          </div>
          <h1 className="text-xl font-bold text-slate-900">RightSteps Homework</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Demo accounts</p>
          <div className="space-y-1">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs hover:bg-slate-50"
              >
                <span>
                  <span className="font-semibold text-slate-700">{acc.role}</span>{' '}
                  <span className="text-slate-400">{acc.email}</span>
                </span>
                <span className="text-blue-600">Use</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
