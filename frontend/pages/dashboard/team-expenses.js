import { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../hooks/useCurrency';
import { Users, Search, Filter, Building2, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import useSWR from 'swr';
import api from '../../lib/api';

const fetcher = (url) => api.get(url).then((res) => res.data.data);

export default function TeamExpenses() {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const { data: teamData, error } = useSWR('/expenses/team-expenses', fetcher);
  const expenses = teamData?.expenses || [];
  const employees = teamData?.employees || [];

  const departments = [...new Set(employees.map(emp => emp.department))].sort();

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = !searchTerm || 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.submittedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !selectedDepartment || expense.submittedBy.department === selectedDepartment;
      const matchesEmployee = !selectedEmployee || expense.submittedBy._id === selectedEmployee;
      return matchesSearch && matchesDepartment && matchesEmployee;
    });
  }, [expenses, searchTerm, selectedDepartment, selectedEmployee]);

  const totalPages = Math.ceil(filteredExpenses.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + recordsPerPage);

  // Reset to page 1 when filters change
  const resetPage = () => {
    if (currentPage > 1 && filteredExpenses.length <= (currentPage - 1) * recordsPerPage) {
      setCurrentPage(1);
    }
  };

  // Effect to reset page when filters change
  useMemo(() => {
    resetPage();
  }, [filteredExpenses.length, currentPage]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesDepartment = !selectedDepartment || emp.department === selectedDepartment;
      const matchesEmployee = !selectedEmployee || emp._id === selectedEmployee;
      const hasExpenses = filteredExpenses.some(e => e.submittedBy._id === emp._id);
      return matchesDepartment && matchesEmployee && hasExpenses;
    });
  }, [employees, selectedDepartment, selectedEmployee, filteredExpenses]);

  const getEmployeeStats = () => {
    const stats = {};
    filteredEmployees.forEach(emp => {
      const empExpenses = filteredExpenses.filter(e => e.submittedBy._id === emp._id);
      stats[emp._id] = {
        total: empExpenses.reduce((sum, e) => sum + (e.amountInDefaultCurrency || e.amount), 0),
        count: empExpenses.length,
        pending: empExpenses.filter(e => e.status === 'Pending').length,
        approved: empExpenses.filter(e => e.status === 'Approved').length
      };
    });
    return stats;
  };

  const employeeStats = getEmployeeStats();

  if (error) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-error">Failed to load team expenses</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="h-8 w-8 mr-3" />
            Team Expenses
          </h1>
          <div className="text-sm text-textSecondary">
            {user?.role === 'Manager' ? 'Department View' : 'Company View'}
          </div>
        </div>

        {/* Filters */}
        <Card className="ai-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textSecondary" />
                <Input
                  placeholder="Search by description, employee, or category..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setSelectedEmployee('');
                  setCurrentPage(1);
                }}
                className="ai-input"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              
              <select
                value={selectedEmployee}
                onChange={(e) => {
                  setSelectedEmployee(e.target.value);
                  setCurrentPage(1);
                }}
                className="ai-input"
              >
                <option value="">All Employees</option>
                {employees
                  .filter(emp => !selectedDepartment || emp.department === selectedDepartment)
                  .map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.department})
                    </option>
                  ))}
              </select>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDepartment('');
                  setSelectedEmployee('');
                  setCurrentPage(1);
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Employee Summary */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle>Employee Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map(employee => (
                <div key={employee._id} className="border border-border rounded-lg p-4 hover:bg-surface transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-text">{employee.name}</h4>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {employee.role}
                    </span>
                  </div>
                  <div className="text-sm text-textSecondary mb-2">
                    <Building2 className="h-3 w-3 inline mr-1" />
                    {employee.department}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-textSecondary">Total: </span>
                      <span className="font-medium text-primary">
                        {formatAmount(employeeStats[employee._id]?.total || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-textSecondary">Count: </span>
                      <span className="font-medium">{employeeStats[employee._id]?.count || 0}</span>
                    </div>
                    <div>
                      <span className="text-textSecondary">Pending: </span>
                      <span className="font-medium text-warning">{employeeStats[employee._id]?.pending || 0}</span>
                    </div>
                    <div>
                      <span className="text-textSecondary">Approved: </span>
                      <span className="font-medium text-success">{employeeStats[employee._id]?.approved || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expenses List */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Receipt className="h-5 w-5 mr-2" />
                Team Expenses
              </div>
              <span className="text-sm font-normal text-textSecondary">
                Page {currentPage} of {totalPages} ({filteredExpenses.length} total)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paginatedExpenses.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-textSecondary mx-auto mb-4" />
                <p className="text-textSecondary">No expenses found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-text">Employee</th>
                        <th className="text-left py-3 px-4 font-semibold text-text">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-text">Description</th>
                        <th className="text-left py-3 px-4 font-semibold text-text">Category</th>
                        <th className="text-left py-3 px-4 font-semibold text-text">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-text">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedExpenses.map((expense) => (
                        <tr key={expense._id} className="border-b border-border hover:bg-surface transition-colors">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-text">{expense.submittedBy.name}</div>
                              <div className="text-sm text-textSecondary">{expense.submittedBy.department}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-text">
                            {formatDate(expense.expenseDate)}
                          </td>
                          <td className="py-3 px-4 text-text">{expense.description}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                              {expense.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-text">
                            {formatAmount(expense.amountInDefaultCurrency || expense.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              expense.status === 'Approved' ? 'bg-success/10 text-success' :
                              expense.status === 'Pending' ? 'bg-warning/10 text-warning' :
                              'bg-error/10 text-error'
                            }`}>
                              {expense.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                    <div className="text-sm text-textSecondary">
                      Showing {startIndex + 1} to {Math.min(startIndex + recordsPerPage, filteredExpenses.length)} of {filteredExpenses.length} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center px-3 py-2 text-sm border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </button>
                      
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
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 text-sm border border-border rounded-md ${
                                currentPage === pageNum
                                  ? 'bg-primary text-white border-primary'
                                  : 'hover:bg-surface'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center px-3 py-2 text-sm border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
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