import Layout from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useCompanyExpenses } from '../../hooks/useExpenses';
import { formatDate } from '../../lib/utils';
import { useCurrency } from '../../hooks/useCurrency';
import { useAuth } from '../../context/AuthContext';
import { Building, Receipt, User, Eye, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';

export default function CompanyExpenses() {
  const { user, isAuthenticated, loading } = useAuth();
  const { expenses, isLoading } = useCompanyExpenses();
  const { defaultCurrency, formatAmount } = useCurrency();
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'Admin')) {
      router.push('/dashboard');
    }
  }, [user?.role, isAuthenticated, loading, router]);

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amountInDefaultCurrency, 0);
  };

  const getExpensesByCategory = () => {
    const categories = {};
    expenses.forEach(expense => {
      if (!categories[expense.category]) {
        categories[expense.category] = 0;
      }
      categories[expense.category] += expense.amountInDefaultCurrency;
    });
    return categories;
  };

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || user?.role !== 'Admin') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Shield className="h-16 w-16 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
          <p className="text-gray-600 text-center">
            This page is restricted to administrators only.
          </p>
        </div>
      </Layout>
    );
  }

  const categoryTotals = getExpensesByCategory();
  
  const totalPages = Math.ceil(expenses.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedExpenses = expenses.slice(startIndex, startIndex + recordsPerPage);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center">
            <Building className="h-8 w-8 mr-3" />
            Company Expenses
          </h1>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Approved Expenses</p>
            <p className="text-2xl font-bold text-green-600">
              {formatAmount(getTotalExpenses())}
            </p>
          </div>
        </div>

        {/* Category Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categoryTotals).map(([category, total]) => (
            <Card key={category}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">{category}</p>
                  <p className="text-lg font-bold">{formatAmount(total)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Expenses List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Receipt className="h-5 w-5 mr-2" />
                All Approved Expenses
              </div>
              <span className="text-sm font-normal text-gray-500">
                Page {currentPage} of {totalPages} ({expenses.length} total)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No approved expenses found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Employee</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Description</th>
                        <th className="text-left py-3 px-4">Category</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedExpenses.map((expense) => (
                        <tr key={expense._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-gray-400" />
                              <div>
                                <p className="font-medium">{expense.submittedBy.name}</p>
                                <p className="text-sm text-gray-500">{expense.submittedBy.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {formatDate(expense.expenseDate)}
                          </td>
                          <td className="py-3 px-4">{expense.description}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {expense.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {formatAmount(expense.amountInDefaultCurrency || expense.amount)}
                          </td>
                          <td className="py-3 px-4">
                            {expense.receiptImageUrl ? (
                              <button
                                onClick={() => setSelectedReceipt(expense.receiptImageUrl)}
                                className="flex items-center text-blue-600 hover:text-blue-800"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </button>
                            ) : (
                              <span className="text-gray-400">No receipt</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Receipt Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg max-w-2xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Receipt</h3>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}/uploads/receipts/${selectedReceipt}`}
                alt="Receipt"
                className="max-w-full h-auto"
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}