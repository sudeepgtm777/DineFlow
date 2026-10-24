import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { endpoints } from "@/lib/api/endpoints";
import { toast } from 'react-toastify';

const Settings = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${endpoints.user}/all`, {
        withCredentials: true,
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const promoteUser = async (userId) => {
    try {
      const response = await api.put(
        `${endpoints.user}/promote/${userId}`,
        {},
        {
          withCredentials: true,
        },
      );
      toast.success(response.data.message);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error('Failed to promote user');
    }
  };

  const demoteUser = async (userId) => {
    try {
      const response = await api.put(
        `${endpoints.user}/demote/${userId}`,
        {},
        {
          withCredentials: true,
        },
      );
      toast.success(response.data.message);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error demoting user:', error);
      toast.error('Failed to demote user');
    }
  };

  return (
    <div className='p-6'>
      <h1 className='text-3xl font-bold mb-6'>Settings</h1>

      {/* Tab Navigation */}
      <div className='flex space-x-4 mb-6 border-b'>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2 px-4 ${
            activeTab === 'users'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab('restaurant')}
          className={`pb-2 px-4 ${
            activeTab === 'restaurant'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Restaurant Settings
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-2 px-4 ${
            activeTab === 'system'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          System Settings
        </button>
      </div>

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-4'>User Management</h2>

          {loading ? (
            <div className='flex justify-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full table-auto'>
                <thead>
                  <tr className='bg-gray-50'>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Profile
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Name
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Email
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Phone
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Role
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {users.map((user) => (
                    <tr key={user._id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <img
                          src={
                            user.profile?.profilePhoto ||
                            'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=40'
                          }
                          alt={user.fullname}
                          className='h-10 w-10 rounded-full object-cover'
                        />
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-medium text-gray-900'>
                          {user.fullname}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {user.email}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {user.phoneNumber}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin'
                              ? 'bg-red-100 text-red-800'
                              : user.role === 'cook'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        {user.role === 'admin' ? (
                          <button
                            onClick={() => demoteUser(user._id)}
                            className='bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors'
                          >
                            Demote
                          </button>
                        ) : (
                          <button
                            onClick={() => promoteUser(user._id)}
                            className='bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors'
                          >
                            Promote to Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className='text-center py-8 text-gray-500'>
                  No users found
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Restaurant Settings Tab */}
      {activeTab === 'restaurant' && (
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-4'>Restaurant Settings</h2>
          <p className='text-gray-600'>
            Restaurant configuration options will be added here.
          </p>
        </div>
      )}

      {/* System Settings Tab */}
      {activeTab === 'system' && (
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-4'>System Settings</h2>
          <p className='text-gray-600'>
            System configuration options will be added here.
          </p>
        </div>
      )}
    </div>
  );
};

export default Settings;
