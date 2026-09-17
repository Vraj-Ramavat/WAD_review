import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Terminal, Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const signup = useAuthStore((state) => state.signup);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();
  const fromLoc = (location.state as any)?.from;
  const from = fromLoc ? `${fromLoc.pathname}${fromLoc.search || ''}` : '/analyze';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    const success = await signup(email, password);
    setIsSubmitting(false);

    if (success) {
      navigate(from, { replace: true });
    }
  };


  const displayError = localError || authError;

  return (
    <div className="ui-overlay min-h-screen flex items-center justify-center p-6 text-starwhite font-mono">
      <div className="max-w-md w-full p-8 rounded-md instrument-panel border-amber/40 shadow-2xl space-y-6 ui-interactive">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full instrument-panel border-brass/40 text-xs text-amber">
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Commander Registration</span>
          </div>

          <h2 className="text-2xl font-serif font-extrabold text-starwhite flex items-center gap-2 pt-1">
            <Terminal className="w-6 h-6 text-amber" />
            <span>Create CodeGalaxy Account</span>
          </h2>
          <p className="text-xs text-slate font-sans">
            Register to unlock ML bug-risk telemetry & persistent solar system saves.
          </p>
        </div>

        {displayError && (
          <div className="p-3.5 rounded bg-copper/10 border border-copper/50 text-copper text-xs font-sans flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-copper" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs text-slate uppercase font-mono block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brass absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="commander@codegalaxy.io"
                className="w-full pl-10 pr-4 py-3 rounded bg-deepspace/90 border border-amber/60 text-starwhite placeholder-slate/50 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber font-mono text-sm shadow-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate uppercase font-mono block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brass absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-3 rounded bg-deepspace/90 border border-amber/60 text-starwhite placeholder-slate/50 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber font-mono text-sm shadow-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate uppercase font-mono block">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brass absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-4 py-3 rounded bg-deepspace/90 border border-amber/60 text-starwhite placeholder-slate/50 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber font-mono text-sm shadow-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 py-3.5 rounded bg-amber text-void font-bold text-sm font-sans hover:bg-amber/90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-amber/20 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Registering Account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs font-sans text-slate border-t border-brass/30 pt-4">
          <span>Already registered? </span>
          <Link to="/login" className="text-amber hover:underline font-bold font-mono">
            Commander Login &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
