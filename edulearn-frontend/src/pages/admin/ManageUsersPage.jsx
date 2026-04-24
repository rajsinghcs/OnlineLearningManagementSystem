import React, { useEffect, useState } from 'react';
import { authApi } from '../../api/authApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  UserMinusIcon, 
  UserPlusIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  FunnelIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatUtils';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await authApi.getAllUsers();
        setUsers(res.data);
      } catch (err) {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSuspend = async (userId) => {
    try {
      await authApi.suspendUser(userId);
      setUsers(users.map(u => u.userId === userId ? { ...u, status: u.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED' } : u));
      toast.success('User status updated');
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await authApi.deleteUser(userId);
      setUsers(users.filter(u => u.userId !== userId));
      toast.success('User deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesFilter = filter === 'ALL' || u.role === filter;
    const matchesSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Management</h1>
          <p className="text-gray-500 mt-2 font-medium">Control platform access and user roles.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {['ALL', 'STUDENT', 'INSTRUCTOR', 'ADMIN'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === f ? 'bg-primary-600 text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {f === 'ALL' ? 'All Roles' : `${f}s`}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <div className="relative max-w-md">
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-primary-500 focus:border-primary-500"
            />
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {filteredUsers.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700">
                        {user.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{user.fullName}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                      user.role === 'ADMIN' ? 'text-purple-600 bg-purple-50' : 
                      user.role === 'INSTRUCTOR' ? 'text-secondary-600 bg-secondary-50' : 'text-blue-600 bg-blue-50'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                      user.status === 'SUSPENDED' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
                    }`}>
                      {user.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500">
                    {formatDate(user.createdAt || new Date())}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleSuspend(user.userId)}
                        className={`p-2 rounded-lg transition-colors ${user.status === 'SUSPENDED' ? 'text-green-600 hover:bg-green-50' : 'text-amber-600 hover:bg-amber-50'}`}
                      >
                        {user.status === 'SUSPENDED' ? <UserPlusIcon className="h-5 w-5" /> : <UserMinusIcon className="h-5 w-5" />}
                      </button>
                      <button 
                        onClick={() => handleDelete(user.userId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-20 text-center text-gray-400 text-sm italic">No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsersPage;
