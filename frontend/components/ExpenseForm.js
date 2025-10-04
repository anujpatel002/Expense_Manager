import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useCreateExpense } from '../hooks/useExpenses';
import { useAuth } from '../context/AuthContext';
import DemoReceiptGenerator from './DemoReceiptGenerator';
import { Upload, X, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const ExpenseForm = ({ onSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [location, setLocation] = useState(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const { createExpense, uploadReceipt } = useCreateExpense();
  const { user } = useAuth();
  
  const defaultCurrency = user?.company?.defaultCurrency || 'USD';
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      amount: '',
      currency: defaultCurrency,
      category: '',
      description: '',
      expenseDate: new Date().toISOString().split('T')[0],
    },
  });

  const processReceiptFile = async (file) => {
    setIsUploading(true);
    try {
      const result = await uploadReceipt(file);
      setReceiptData(result.data);
      
      // Auto-populate form fields with currency conversion
      if (result.data.extractedData.amount) {
        const defaultCurrency = user?.company?.defaultCurrency || 'USD';
        let convertedAmount = parseFloat(result.data.extractedData.amount);
        
        // Assume extracted amount is in USD and convert to company currency
        if (defaultCurrency !== 'USD') {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/currency/rates/USD`);
            const data = await response.json();
            if (data.success && data.data.rates[defaultCurrency]) {
              convertedAmount = convertedAmount * data.data.rates[defaultCurrency];
              setValue('currency', defaultCurrency);
              toast.success(`Amount converted from USD to ${defaultCurrency}`);
            }
          } catch (error) {
            console.error('Currency conversion failed:', error);
            toast.error('Currency conversion failed, using original amount');
          }
        }
        
        setValue('amount', convertedAmount.toFixed(2));
      }
      if (result.data.extractedData.date) {
        setValue('expenseDate', result.data.extractedData.date);
      }
      if (result.data.extractedData.vendor) {
        setValue('description', `Expense at ${result.data.extractedData.vendor}`);
      }
      if (result.data.extractedData.category) {
        setValue('category', result.data.extractedData.category);
      }
      
      // Handle demo receipt data (before OCR processing)
      if (file.suggestedCategory) {
        setValue('category', file.suggestedCategory);
      }
      
      if (file.extractedDate) {
        setValue('expenseDate', file.extractedDate);
      }
      
      if (file.extractedAmount) {
        const defaultCurrency = user?.company?.defaultCurrency || 'USD';
        let convertedAmount = file.extractedAmount;
        
        // Convert from USD to company currency if needed
        if (defaultCurrency !== 'USD' && file.originalCurrency === 'USD') {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/currency/rates/USD`);
            const data = await response.json();
            if (data.success && data.data.rates[defaultCurrency]) {
              convertedAmount = file.extractedAmount * data.data.rates[defaultCurrency];
              toast.success(`Amount converted from USD to ${defaultCurrency}`);
            }
          } catch (error) {
            console.error('Currency conversion failed:', error);
            toast.error('Currency conversion failed, using original amount');
          }
        }
        
        setValue('amount', convertedAmount.toFixed(2));
        setValue('currency', defaultCurrency);
      }
      
      toast.success('Receipt uploaded and processed successfully!');
    } catch (error) {
      toast.error('Failed to process receipt');
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    await processReceiptFile(file);
  };

  const handleDemoReceipt = async (file) => {
    await processReceiptFile(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const onSubmit = async (data) => {
    try {
      await createExpense({
        ...data,
        amount: parseFloat(data.amount),
        receiptImageUrl: receiptData?.filename || null,
        receiptHash: receiptData?.fileHash || null,
        location,
      });
      
      toast.success('Expense submitted successfully!');
      reset();
      setReceiptData(null);
      setLocation(null);
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit expense');
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Submit New Expense</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Demo Receipt Generator */}
        <div className="flex justify-center space-x-4">
          <DemoReceiptGenerator onReceiptGenerated={handleDemoReceipt} />
          
          {/* Location Capture */}
          <div className="flex flex-col items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCapturingLocation(true);
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        address: 'Location captured'
                      });
                      setIsCapturingLocation(false);
                      toast.success('Location captured!');
                    },
                    (error) => {
                      setIsCapturingLocation(false);
                      toast.error('Failed to capture location');
                    }
                  );
                } else {
                  setIsCapturingLocation(false);
                  toast.error('Geolocation not supported');
                }
              }}
              disabled={isCapturingLocation}
            >
              <MapPin className="h-4 w-4 mr-2" />
              {isCapturingLocation ? 'Capturing...' : location ? 'Location Captured' : 'Capture Location'}
            </Button>
            {location && (
              <p className="text-xs text-green-600 mt-1">
                GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </p>
            )}
          </div>
        </div>

        {/* Receipt Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Receipt (Optional)</label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2">Processing receipt...</span>
              </div>
            ) : receiptData ? (
              <div className="flex items-center justify-center space-x-2">
                <span className="text-green-600">Receipt uploaded successfully</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReceiptData(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Drop your receipt here or click to upload
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports JPG, PNG, PDF (max 5MB)
                </p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount *</label>
              <Input
                type="number"
                step="0.01"
                {...register('amount', { required: 'Amount is required', min: 0.01 })}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Currency *</label>
              <select
                {...register('currency', { required: 'Currency is required' })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value={defaultCurrency}>{defaultCurrency} (Company Default)</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="INR">INR - Indian Rupee</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="CNY">CNY - Chinese Yuan</option>
                <option value="SGD">SGD - Singapore Dollar</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select category</option>
              <option value="Travel">Travel</option>
              <option value="Meals">Meals</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Software">Software</option>
              <option value="Marketing">Marketing</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && (
              <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <Input
              {...register('description', { required: 'Description is required' })}
              placeholder="Brief description of the expense"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Expense Date *</label>
            <Input
              type="date"
              {...register('expenseDate', { required: 'Date is required' })}
            />
            {errors.expenseDate && (
              <p className="text-sm text-red-600 mt-1">{errors.expenseDate.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit Expense'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExpenseForm;