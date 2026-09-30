import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Sparkles, LayoutDashboard, Info, Home, LogIn, LogOut } from 'lucide-react';
import { useRepoStore } from '../../store/useRepoStore';
import { useAuthStore } from '../../store/useAuthStore';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const currentRepo = useRepoStore((state) => state.currentRepo);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  return (
    <nav className="app-navbar fixed z-50 flex items-center gap-1 p-1.5 rounded-lg instrument-panel border-brass/30 text-xs font-mono shadow-2xl" aria-label="Primary navigation">
      <Link
        to="/"
        title="Landing"
        aria-label="Landing"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
          location.pathname === '/'
            ? 'bg-amber/20 text-amber border border-amber/30'
            : 'text-slate hover:text-starwhite hover:bg-deepspace'
        }`}
      >
        <Home className="w-3.5 h-3.5" />
        <span className="nav-label">Landing</span>
      </Link>

      <Link
        to="/explore"
        title="Milky Way"
        aria-label="Milky Way"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
          location.pathname === '/explore'
            ? 'bg-amber/20 text-amber border border-amber/30'
            : 'text-slate hover:text-starwhite hover:bg-deepspace'
        }`}
      >
        <Compass className="w-3.5 h-3.5" />
        <span className="nav-label">Milky Way</span>
      </Link>

      {currentRepo && (
        <>
          <Link
            to={`/galaxy/${currentRepo.id}`}
            title="Solar System"
            aria-label="Solar System"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
              location.pathname.startsWith('/galaxy/')
                ? 'bg-amber/20 text-amber border border-amber/30'
                : 'text-slate hover:text-starwhite hover:bg-deepspace'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="nav-label">Solar System</span>
          </Link>

          <Link
            to={`/dashboard/${currentRepo.id}`}
            title="Dashboard"
            aria-label="Dashboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
              location.pathname.startsWith('/dashboard/')
                ? 'bg-amber/20 text-amber border border-amber/30'
                : 'text-slate hover:text-starwhite hover:bg-deepspace'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="nav-label">Dashboard</span>
          </Link>
        </>
      )}

      <Link
        to="/about"
        title="About"
        aria-label="About"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
          location.pathname === '/about'
            ? 'bg-amber/20 text-amber border border-amber/30'
            : 'text-slate hover:text-starwhite hover:bg-deepspace'
        }`}
      >
        <Info className="w-3.5 h-3.5" />
        <span className="nav-label">About</span>
      </Link>

      <div className="h-4 w-px bg-brass/30 mx-1" />

      {isAuthenticated ? (
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-amber max-w-[100px] truncate hidden sm:inline px-1">
            {user?.email}
          </span>
          <button
            onClick={() => logout()}
            title="Log Out"
            aria-label="Log out"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded text-slate hover:text-copper hover:bg-deepspace transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="nav-label">Logout</span>
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          title="Login"
          aria-label="Login"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
            location.pathname === '/login'
              ? 'bg-amber/20 text-amber border border-amber/30'
              : 'text-slate hover:text-starwhite hover:bg-deepspace'
          }`}
        >
          <LogIn className="w-3.5 h-3.5 text-amber" />
          <span className="nav-label">Login</span>
        </Link>
      )}
    </nav>
  );
};
