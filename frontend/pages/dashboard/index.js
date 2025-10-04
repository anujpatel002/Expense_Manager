import { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import ExpenseForm from '../../components/ExpenseForm';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useMyExpenses } from '../../hooks/useExpenses';
import { formatDate } from '../../lib/utils';
import { useCurrency } from '../../hooks/useCurrency';
import { useAuth } from '../../context/AuthContext';
import { Plus, Receipt, Clock, CheckCircle, XCircle, X, ChevronLeft, ChevronRight, Building, User } from 'lucide-react';

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const { expenses, isLoading, mutate } = useMyExpenses();
  const { formatAmount } = useCurrency();
  const { user } = useAuth();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    mutate();
  };

  const totalPages = Math.ceil(expenses.length / recordsPerPage);
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    return expenses.slice(startIndex, startIndex + recordsPerPage);
  }, [expenses, currentPage, recordsPerPage]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const getExpenseStats = () => {
    const pending = expenses.filter(e => e.status === 'Pending').length;
    const approved = expenses.filter(e => e.status === 'Approved').length;
    const rejected = expenses.filter(e => e.status === 'Rejected').length;
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    return { pending, approved, rejected, totalAmount };
  };

  const stats = getExpenseStats();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <h1 className="text-4xl font-bold gradient-text">My Dashboard</h1>
              <div className="absolute -bottom-2 left-0 w-20 h-1 bg-gradient-primary rounded-full" />
            </div>
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {expenses.length} Total Expenses
            </div>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? 'outline' : 'default'}
            className="shadow-ai-glow"
          >
            {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {showForm ? 'Cancel' : 'New Expense'}
          </Button>
        </div>

        {/* Employee Info */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="ai-card hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Building className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-textSecondary text-sm">Department</p>
                    <p className="text-xl font-bold text-text">{user.department || 'Not Assigned'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="ai-card hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <User className="h-8 w-8 text-secondary" />
                  <div>
                    <p className="text-textSecondary text-sm">Manager</p>
                    <p className="text-xl font-bold text-text">
                      {user.manager ? user.manager.name : 'No Manager Assigned'}
                    </p>
                    {user.manager && (
                      <p className="text-sm text-textSecondary">{user.manager.email}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="ai-card hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-textSecondary text-sm">Pending</p>
                  <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="ai-card hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-textSecondary text-sm">Approved</p>
                  <p className="text-2xl font-bold text-success">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="ai-card hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-textSecondary text-sm">Rejected</p>
                  <p className="text-2xl font-bold text-error">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-error" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="ai-card hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-textSecondary text-sm">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">{formatAmount(stats.totalAmount)}</p>
                </div>
                <Receipt className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <div className="flex justify-center">
            <ExpenseForm onSuccess={handleFormSuccess} />
          </div>
        )}

        {/* Quick Actions */}
        {!showForm && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="ai-card hover-lift cursor-pointer" onClick={() => setShowForm(true)}>
              <CardContent className="p-6 text-center">
                <Plus className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2 text-text">Submit Expense</h3>
                <p className="text-textSecondary text-sm">Create a new expense claim</p>
              </CardContent>
            </Card>
            
            <Card className="ai-card hover-lift">
              <CardContent className="p-6 text-center">
                <Receipt className="h-12 w-12 text-secondary mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2 text-text">Recent Expenses</h3>
                <p className="text-textSecondary text-sm">View your latest {Math.min(5, expenses.length)} expenses</p>
                <div className="mt-3 space-y-1">
                  {expenses.slice(0, 3).map(expense => (
                    <div key={expense._id} className="text-xs text-textSecondary flex justify-between">
                      <span>{expense.description.slice(0, 20)}...</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        expense.status === 'Approved' ? 'bg-success/10 text-success' :
                        expense.status === 'Pending' ? 'bg-warning/10 text-warning' :
                        'bg-error/10 text-error'
                      }`}>
                        {expense.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="ai-card hover-lift">
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-warning mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2 text-text">Pending Approvals</h3>
                <p className="text-textSecondary text-sm">{stats.pending} expenses awaiting approval</p>
                {stats.pending > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-textSecondary">
                      Oldest pending: {expenses.find(e => e.status === 'Pending') ? 
                        formatDate(expenses.find(e => e.status === 'Pending').expenseDate) : 'None'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Receipt className="h-5 w-5 mr-2" />
                Expense History
              </div>
              {expenses.length > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  Page {currentPage} of {totalPages} ({expenses.length} total)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative mb-6">
                  <Receipt className="h-20 w-20 text-textSecondary mx-auto animate-float" />
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">No expenses yet</h3>
                <p className="text-textSecondary mb-6">Start by creating your first expense</p>
                <Button onClick={() => setShowForm(true)} variant="default">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Expense
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 font-semibold text-text">Date</th>
                      <th className="text-left py-4 px-4 font-semibold text-text">Description</th>
                      <th className="text-left py-4 px-4 font-semibold text-text">Category</th>
                      <th className="text-left py-4 px-4 font-semibold text-text">Amount</th>
                      <th className="text-left py-4 px-4 font-semibold text-text">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedExpenses.map((expense) => (
                      <tr key={expense._id} className="border-b border-border hover:bg-surface transition-colors duration-200">
                        <td className="py-3 px-4">
                          {formatDate(expense.expenseDate)}
                        </td>
                        <td className="py-3 px-4">{expense.description}</td>
                        <td className="py-3 px-4">{expense.category}</td>
                        <td className="py-3 px-4">
                          {formatAmount(expense.amountInDefaultCurrency || expense.amount)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(expense.status)}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                expense.status
                              )}`}
                            >
                              {expense.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, expenses.length)} of {expenses.length} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center px-3 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                              className={`w-10 h-10 text-sm border rounded-md ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'hover:bg-gray-50'
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
                        className="flex items-center px-3 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}