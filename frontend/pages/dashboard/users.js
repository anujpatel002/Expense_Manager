import { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Plus, User, Mail, Shield, Search, Filter, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const fetcher = (url) => api.get(url).then((res) => res.data.data);

export default function Users() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  
  const { data, error, mutate } = useSWR('/users', fetcher);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const allUsers = data?.users || [];
  const users = allUsers.filter(user => user.role !== 'Admin');
  const managers = users.filter(user => user.role === 'Manager');
  
  const departments = ['Finance', 'HR', 'IT', 'Marketing', 'Sales', 'Operations', 'Legal', 'R&D'];
  
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !selectedDepartment || user.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    });
    
    return filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [users, searchTerm, selectedDepartment, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / recordsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    return filteredAndSortedUsers.slice(startIndex, startIndex + recordsPerPage);
  }, [filteredAndSortedUsers, currentPage, recordsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setCurrentPage(1);
  };

  const onSubmit = async (formData) => {
    try {
      await api.post('/users', formData);
      toast.success('User created successfully!');
      reset();
      setShowForm(false);
      mutate();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create user');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800';
      case 'Manager':
        return 'bg-blue-100 text-blue-800';
      case 'Employee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-red-600">Failed to load users</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center">
            <User className="h-8 w-8 mr-3" />
            User Management
          </h1>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Cancel' : 'Add User'}
          </Button>
        </div>
        
        {/* Search and Filter Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="department">Sort by Department</option>
                  <option value="role">Sort by Role</option>
                  <option value="createdAt">Sort by Date</option>
                </select>
              </div>
              
              <div>
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="w-full"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </Button>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {Math.min((currentPage - 1) * recordsPerPage + 1, filteredAndSortedUsers.length)}-{Math.min(currentPage * recordsPerPage, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} users
              </span>
              {(searchTerm || selectedDepartment) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {showForm && (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <Input
                      {...register('name', { required: 'Name is required' })}
                      placeholder="Full name"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <Input
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      placeholder="email@company.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Password *</label>
                    <Input
                      type="password"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      placeholder="Minimum 6 characters"
                    />
                    {errors.password && (
                      <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Role *</label>
                    <select
                      {...register('role', { required: 'Role is required' })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select role</option>
                      <option value="Employee">Employee</option>
                      <option value="Manager">Manager</option>
                    </select>
                    {errors.role && (
                      <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Department *</label>
                    <select
                      {...register('department', { required: 'Department is required' })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select department</option>
                      <option value="Finance">Finance</option>
                      <option value="HR">Human Resources</option>
                      <option value="IT">Information Technology</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="Operations">Operations</option>
                      <option value="Legal">Legal</option>
                      <option value="R&D">Research & Development</option>
                    </select>
                    {errors.department && (
                      <p className="text-sm text-red-600 mt-1">{errors.department.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Manager (Optional)</label>
                    <select
                      {...register('manager')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">No manager assigned</option>
                      {managers.map((manager) => (
                        <option key={manager._id} value={manager._id}>
                          {manager.name} - {manager.department}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Department Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {departments.map(dept => {
            const deptUsers = users.filter(u => u.department === dept);
            return (
              <Card key={dept} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedDepartment(selectedDepartment === dept ? '' : dept)}>
                <CardContent className="p-4 text-center">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="font-semibold">{dept}</div>
                  <div className="text-2xl font-bold text-blue-600">{deptUsers.length}</div>
                  <div className="text-xs text-gray-500">users</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Users {selectedDepartment && `- ${selectedDepartment} Department`}
              </div>
              <span className="text-sm font-normal text-gray-500">
                Page {currentPage} of {totalPages} ({filteredAndSortedUsers.length} total)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paginatedUsers.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm || selectedDepartment ? 'No users match your filters' : 'No users found'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Department</th>
                        <th className="text-left py-3 px-4">Role</th>
                        <th className="text-left py-3 px-4">Manager</th>
                        <th className="text-left py-3 px-4">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((user) => (
                        <tr key={user._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-gray-400" />
                              {user.name}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2 text-gray-400" />
                              {user.email}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              <Building2 className="h-3 w-3 inline mr-1" />
                              {user.department || 'General'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                                user.role
                              )}`}
                            >
                              <Shield className="h-3 w-3 inline mr-1" />
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {user.manager ? (
                              <div>
                                <div className="font-medium">{user.manager.name}</div>
                                <div className="text-xs text-gray-500">{user.manager.department}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="flex space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="w-10 h-10 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}