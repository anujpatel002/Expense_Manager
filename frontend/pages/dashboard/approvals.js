import { useState } from 'react';
import Layout from '../../components/Layout';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { usePendingApprovals, useCreateExpense } from '../../hooks/useExpenses';
import { formatCurrency, formatDate } from '../../lib/utils';
import { CheckCircle, XCircle, MessageSquare, User, Shield, AlertTriangle, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Approvals() {
  const { expenses, isLoading, mutate } = usePendingApprovals();
  const { updateExpenseStatus } = useCreateExpense();
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApproval = async (expenseId, status) => {
    if (status === 'Rejected' && !comment.trim()) {
      toast.error('Comment is required for rejection');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateExpenseStatus(expenseId, status, comment);
      toast.success(`Expense ${status.toLowerCase()} successfully`);
      setSelectedExpense(null);
      setComment('');
      mutate();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update expense');
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Pending Approvals</h1>

        {expenses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No expenses pending approval</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {expenses.map((expense) => (
              <Card key={expense._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        {expense.submittedBy.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{expense.submittedBy.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {formatCurrency(expense.amount, expense.currency)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(expense.expenseDate)}
                      </p>
                      {expense.riskScore > 0 && (
                        <div className="flex items-center justify-end mt-2">
                          <Shield className={`h-4 w-4 mr-1 ${
                            expense.riskScore > 70 ? 'text-red-500' :
                            expense.riskScore > 40 ? 'text-yellow-500' : 'text-green-500'
                          }`} />
                          <span className={`text-sm font-medium ${
                            expense.riskScore > 70 ? 'text-red-600' :
                            expense.riskScore > 40 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            Risk: {expense.riskScore}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Category</p>
                        <p>{expense.category}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Description</p>
                        <p>{expense.description}</p>
                      </div>
                    </div>

                    {/* Fraud Detection Alerts */}
                    {expense.fraudFlags && expense.fraudFlags.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                          <span className="font-medium text-yellow-800">Fraud Detection Alerts</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {expense.fraudFlags.map((flag, index) => (
                            <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                              {flag.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                        {expense.requiresReview && (
                          <p className="text-sm text-yellow-700 mt-2">
                            ⚠️ This expense requires additional review due to detected anomalies.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Location Information */}
                    {expense.location && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-blue-800">Location</span>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">
                          {expense.location.address || 
                           `${expense.location.latitude?.toFixed(4)}, ${expense.location.longitude?.toFixed(4)}`}
                        </p>
                      </div>
                    )}

                    {expense.receiptImageUrl && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Receipt</p>
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}/uploads/receipts/${expense.receiptImageUrl}`}
                          alt="Receipt"
                          className="max-w-xs rounded border cursor-pointer hover:opacity-80"
                          onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}/uploads/receipts/${expense.receiptImageUrl}`, '_blank')}
                        />
                      </div>
                    )}

                    {selectedExpense === expense._id ? (
                      <div className="space-y-4 border-t pt-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Comment {selectedExpense === expense._id ? '(Required for rejection)' : '(Optional)'}
                          </label>
                          <Input
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add your comment..."
                            className="w-full"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleApproval(expense._id, 'Approved')}
                            disabled={isSubmitting}
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleApproval(expense._id, 'Rejected')}
                            disabled={isSubmitting}
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedExpense(null);
                              setComment('');
                            }}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t pt-4">
                        <Button
                          onClick={() => setSelectedExpense(expense._id)}
                          className="w-full"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Review & Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}