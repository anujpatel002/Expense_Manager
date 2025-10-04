import Layout from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useCompanyExpenses } from '../../hooks/useExpenses';
import { formatDate } from '../../lib/utils';
import { useCurrency } from '../../hooks/useCurrency';
import { Building, Receipt, User, Eye } from 'lucide-react';
import { useState } from 'react';

export default function CompanyExpenses() {
  const { expenses, isLoading } = useCompanyExpenses();
  const { defaultCurrency, formatAmount } = useCurrency();
  const [selectedReceipt, setSelectedReceipt] = useState(null);

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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const categoryTotals = getExpensesByCategory();

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
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              All Approved Expenses ({expenses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No approved expenses found</p>
              </div>
            ) : (
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
                    {expenses.map((expense) => (
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
                          {formatAmount(expense.amount, expense.currency)}
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