import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Droplets,
  LayoutDashboard,
  FileText,
  AlertTriangle,
  FlaskConical,
  LogOut,
  Menu,
  X,
  Shield,
  Cpu,
  Users
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/smart-predict', label: 'SmartPredict ML', icon: Cpu },
          { to: '/alerts', label: 'Alerts', icon: AlertTriangle },
          { to: '/water-tests', label: 'Water Quality', icon: FlaskConical },
          { to: '/users', label: 'Users', icon: Users }
        ];
      case 'health_worker':
        return [
          { to: '/health-worker', label: 'Surveillance Desk', icon: LayoutDashboard },
          { to: '/smart-predict', label: 'SmartPredict ML', icon: Cpu },
          { to: '/water-tests', label: 'Water Tests', icon: FlaskConical },
          { to: '/alerts', label: 'Alerts', icon: AlertTriangle }
        ];
      default:
        return [
          { to: '/citizen', label: 'My Overview', icon: LayoutDashboard },
          { to: '/smart-predict', label: 'SmartPredict ML', icon: Cpu },
          { to: '/report-submission', label: 'Submit Report', icon: FileText },
          { to: '/my-reports', label: 'My Reports', icon: FileText },
          { to: '/alerts', label: 'Alerts', icon: AlertTriangle }
        ];
    }
  };

  const navLinks = getNavLinks();
  const isActive = (path: string) => location.pathname === path;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Admin',
          color: 'bg-[#99b2dd]/30 text-[#3a405a] border-[#99b2dd]'
        };
      case 'health_worker':
        return {
          label: 'Health Worker',
          color: 'bg-[#f9dec9] text-[#3a405a] border-[#685044]/30'
        };
      default:
        return {
          label: 'Citizen',
          color: 'bg-[#e9afa3]/35 text-[#3a405a] border-[#e9afa3]'
        };
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#685044]/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#3a405a] flex items-center justify-center shadow-sm group-hover:bg-[#2e3348] transition-all">
              <Droplets className="w-5 h-5 text-[#99b2dd]" />
            </div>
            <div>
              <span className="text-base font-black text-[#3a405a] tracking-tight">
                SmartHealth
              </span>
              <span className="text-xs font-extrabold text-[#685044] ml-1">NE</span>
            </div>
          </Link>

          {/* Desktop Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive(link.to)
                        ? 'bg-[#3a405a] text-white shadow-sm'
                        : 'text-[#685044] hover:text-[#3a405a] hover:bg-[#f9dec9]/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* User Controls */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <div className="hidden sm:flex items-center gap-2.5">
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#3a405a] leading-none">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-[#685044] mt-0.5">
                      {user.village}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      getRoleBadge(user.role).color
                    }`}
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {getRoleBadge(user.role).label}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-[#685044] hover:text-[#3a405a] hover:bg-[#e9afa3]/30 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-lg border border-[#685044]/30 text-[#3a405a] hover:bg-[#f9dec9]/50 text-xs font-bold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 rounded-lg bg-[#3a405a] text-white hover:bg-[#2e3348] text-xs font-bold transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-[#685044] hover:text-[#3a405a] hover:bg-[#f9dec9]/50"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden bg-white border-b border-[#685044]/20">
          <div className="px-4 py-3 space-y-1">
            {user && (
              <div className="pb-3 mb-2 border-b border-[#685044]/15 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#3a405a]">{user.name}</p>
                  <p className="text-[11px] text-[#685044]">{user.email}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                    getRoleBadge(user.role).color
                  }`}
                >
                  {getRoleBadge(user.role).label}
                </span>
              </div>
            )}
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive(link.to)
                      ? 'bg-[#3a405a] text-white'
                      : 'text-[#685044] hover:text-[#3a405a] hover:bg-[#f9dec9]/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
