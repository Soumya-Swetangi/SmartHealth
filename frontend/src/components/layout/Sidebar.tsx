import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  FlaskConical,
  AlertTriangle,
  Users,
  MapPin,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const citizenNav = [
    { to: '/citizen', label: 'My Overview', icon: LayoutDashboard },
    { to: '/smart-predict', label: 'SmartPredict ML', icon: Cpu },
    { to: '/report-submission', label: 'Submit Water Report', icon: PlusCircle },
    { to: '/my-reports', label: 'My Submissions', icon: FileText },
    { to: '/alerts', label: 'Village Alerts', icon: AlertTriangle }
  ];

  const healthWorkerNav = [
    { to: '/health-worker', label: 'Surveillance Desk', icon: LayoutDashboard },
    { to: '/smart-predict', label: 'SmartPredict ML', icon: Cpu },
    { to: '/water-tests', label: 'Record Water Test', icon: FlaskConical },
    { to: '/alerts', label: 'Active Alerts', icon: AlertTriangle }
  ];

  const adminNav = [
    { to: '/admin', label: 'Executive Command', icon: LayoutDashboard },
    { to: '/smart-predict', label: 'SmartPredict ML', icon: Cpu },
    { to: '/alerts', label: 'Early Warnings', icon: AlertTriangle },
    { to: '/water-tests', label: 'Water Quality Logs', icon: FlaskConical },
    { to: '/users', label: 'User Directory', icon: Users }
  ];

  const navItems =
    user.role === 'admin'
      ? adminNav
      : user.role === 'health_worker'
      ? healthWorkerNav
      : citizenNav;

  return (
    <aside className="w-64 bg-white border-r border-[#685044]/20 hidden lg:flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)] flex-shrink-0">
      <div>
        <div className="mb-6 px-3 py-2 bg-[#f9dec9]/50 rounded-xl border border-[#685044]/15">
          <p className="text-[11px] font-bold text-[#685044] uppercase tracking-wider">
            Surveillance Jurisdiction
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-[#3a405a]">
            <MapPin className="w-4 h-4 text-[#e9afa3]" />
            <span className="text-xs font-extrabold truncate">{user.village}</span>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#3a405a] text-white shadow-sm'
                      : 'text-[#685044] hover:bg-[#f9dec9]/60 hover:text-[#3a405a]'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Safety Notice Footer Card */}
      <div className="p-3 bg-[#e9afa3]/25 border border-[#e9afa3] rounded-xl text-[11px] text-[#3a405a]">
        <div className="flex items-center gap-1.5 font-bold mb-1 text-[#3a405a]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3a405a]" />
          <span>Surveillance Advisory</span>
        </div>
        <p className="text-[10px] text-[#685044] leading-relaxed">
          Alerts indicate statistical clusters of community reports and require sanitary field validation.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
