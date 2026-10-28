import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import {
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  Droplets
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const redirectByRole = (role?: string) => {
    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'health_worker') {
      navigate('/health-worker');
    } else {
      navigate('/citizen');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const loggedInUser = await login(email.trim(), password);
      redirectByRole(loggedInUser.role);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Login failed. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'admin' | 'worker' | 'citizen') => {
    setError('');
    if (role === 'admin') {
      setEmail('admin@smarthealth.ne.gov.in');
      setPassword('Password123!');
    } else if (role === 'worker') {
      setEmail('mary.lyngdoh@health.meghalaya.gov.in');
      setPassword('Password123!');
    } else {
      setEmail('rupjyoti@majuli.in');
      setPassword('Password123!');
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#685044]/20 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#3a405a] text-[#f9dec9] flex items-center justify-center mx-auto shadow-md">
            <Droplets className="w-6 h-6 text-[#99b2dd]" />
          </div>
          <h1 className="text-2xl font-black text-[#3a405a]">
            SmartHealth NE Portal
          </h1>
          <p className="text-xs text-[#685044]">
            Sign in to access regional water quality and health surveillance
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#3a405a] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#685044]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-[#685044]/30 text-sm text-[#3a405a] bg-white focus:outline-none focus:ring-2 focus:ring-[#99b2dd]"
                placeholder="you@smarthealth.ne.gov.in"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3a405a] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#685044]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#685044]/30 text-sm text-[#3a405a] bg-white focus:outline-none focus:ring-2 focus:ring-[#99b2dd]"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#685044]/60 hover:text-[#3a405a]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="w-full font-bold shadow-md"
          >
            Sign In to Portal
          </Button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-4 border-t border-[#685044]/15">
          <p className="text-[11px] font-bold text-[#685044] text-center uppercase tracking-wider mb-2.5">
            Quick Demo Accounts (One-Click Fill)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="px-2.5 py-2 text-xs font-bold rounded-lg bg-[#99b2dd]/25 text-[#3a405a] border border-[#99b2dd]/50 hover:bg-[#99b2dd]/40 transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('worker')}
              className="px-2.5 py-2 text-xs font-bold rounded-lg bg-[#f9dec9]/70 text-[#3a405a] border border-[#685044]/20 hover:bg-[#f9dec9] transition-colors"
            >
              Health Worker
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('citizen')}
              className="px-2.5 py-2 text-xs font-bold rounded-lg bg-[#e9afa3]/30 text-[#3a405a] border border-[#e9afa3]/60 hover:bg-[#e9afa3]/50 transition-colors"
            >
              Citizen
            </button>
          </div>
        </div>

        <div className="text-center pt-2 text-xs text-[#685044]">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-[#3a405a] hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
