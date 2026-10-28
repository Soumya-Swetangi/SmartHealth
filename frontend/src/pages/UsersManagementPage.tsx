import React, { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { User, UserRole } from '../types';
import { NORTHEAST_VILLAGES_LIST } from '../utils/constants';
import { formatDateTime } from '../utils/formatters';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Pagination } from '../components/common/Pagination';
import { Users, UserPlus, Search, Filter, Shield, Check, X, Phone, Mail } from 'lucide-react';

export const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Add staff modal
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState<'health_worker' | 'admin'>('health_worker');
  const [staffVillage, setStaffVillage] = useState(NORTHEAST_VILLAGES_LIST[0].name);
  const [staffPhone, setStaffPhone] = useState('');
  const [savingStaff, setSavingStaff] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers({
        role: roleFilter || undefined,
        search: searchTerm || undefined,
        page,
        limit: 8
      });
      setUsers(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.pages);
        setTotalItems(res.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleToggleActive = async (user: User) => {
    try {
      await userService.updateUser(user.id || user._id!, {
        isActive: !user.isActive
      });
      loadUsers();
    } catch {
      alert('Failed to update user status');
    }
  };

  const handleChangeRole = async (user: User, newRole: UserRole) => {
    try {
      await userService.updateUser(user.id || user._id!, { role: newRole });
      loadUsers();
    } catch {
      alert('Failed to update role');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStaff(true);
    try {
      await authService.register({
        name: staffName,
        email: staffEmail,
        password: staffPassword,
        village: staffVillage,
        phone: staffPhone
      });
      setIsStaffModalOpen(false);
      // Reset form
      setStaffName('');
      setStaffEmail('');
      setStaffPassword('');
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create staff member');
    } finally {
      setSavingStaff(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#685044]/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3a405a] text-[#f9dec9] text-xs font-bold rounded-full mb-1">
            <Users className="w-3.5 h-3.5 text-[#99b2dd]" />
            <span>Regional Administrative Governance</span>
          </div>
          <h1 className="text-2xl font-black text-[#3a405a]">
            Surveillance Personnel & Citizen Directory
          </h1>
          <p className="text-xs text-[#685044] mt-1 max-w-xl">
            Provision roles, manage local health workers, and monitor citizen accounts across Northeast districts.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsStaffModalOpen(true)}
          className="flex items-center gap-2 font-bold shadow-md"
        >
          <UserPlus className="w-4 h-4 text-[#99b2dd]" />
          Provision Staff Account
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#685044]/20 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search by name, email, village..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#685044]/30 bg-white text-[#3a405a] placeholder-[#685044]/50 focus:outline-none focus:ring-1 focus:ring-[#99b2dd]"
          />
          <Search className="w-4 h-4 text-[#685044] absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#685044]" />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
          >
            <option value="">All Roles</option>
            <option value="citizen">Citizens</option>
            <option value="health_worker">Health Workers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-[#685044]/20 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner size="md" label="Loading user directory..." />
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#685044]">
            <Users className="w-10 h-10 text-[#685044]/40 mx-auto mb-2" />
            <p className="font-bold text-sm text-[#3a405a]">No Users Match Filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#3a405a]">
              <thead className="bg-[#f9dec9]/40 border-b border-[#685044]/15 text-[#685044] font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Jurisdiction</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#685044]/10">
                {users.map((u) => {
                  const id = u.id || u._id!;
                  return (
                    <tr key={id} className="hover:bg-[#f9dec9]/20 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-[#3a405a]">{u.name}</p>
                        <div className="flex items-center gap-1 text-[11px] text-[#685044]">
                          <Mail className="w-3 h-3" />
                          <span>{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1 text-[10px] text-[#685044]/80">
                            <Phone className="w-3 h-3" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#685044]">
                        {u.village}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u, e.target.value as UserRole)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-[#685044]/30 bg-white capitalize text-[#3a405a]"
                        >
                          <option value="citizen">Citizen</option>
                          <option value="health_worker">Health Worker</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            u.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm ${
                            u.isActive
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={totalItems}
        />
      </div>

      {/* Provision Staff Account Modal */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title="Provision Health Worker or Administrator"
        maxWidth="md"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            placeholder="e.g. Dr. Hiren Barman"
          />

          <Input
            label="Official Email Address"
            type="email"
            required
            value={staffEmail}
            onChange={(e) => setStaffEmail(e.target.value)}
            placeholder="e.g. hiren@health.assam.gov.in"
          />

          <Input
            label="Temporary Password"
            type="password"
            required
            value={staffPassword}
            onChange={(e) => setStaffPassword(e.target.value)}
            placeholder="Minimum 6 characters"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#3a405a] uppercase mb-1">
                Role Designation
              </label>
              <select
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
              >
                <option value="health_worker">Health Worker</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3a405a] uppercase mb-1">
                Assigned Village
              </label>
              <select
                value={staffVillage}
                onChange={(e) => setStaffVillage(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
              >
                {NORTHEAST_VILLAGES_LIST.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Phone Contact"
            value={staffPhone}
            onChange={(e) => setStaffPhone(e.target.value)}
            placeholder="+91 98765 00000"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-[#685044]/15">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsStaffModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={savingStaff}>
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
