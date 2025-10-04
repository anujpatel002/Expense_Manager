import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function Register() {
  const { register: registerUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const [countries, setCountries] = useState([]);
  const [step, setStep] = useState(1); // 1: form, 2: OTP verification
  const [formData, setFormData] = useState(null);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
    fetchCountries();
    getUserLocation();
  }, [isAuthenticated, router]);

  const getUserLocation = async () => {
    try {
      // Get user's location using IP geolocation
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data.country_name) {
        setUserLocation(data.country_name);
        setValue('country', data.country_name);
      }
    } catch (error) {
      console.error('Failed to get user location:', error);
      // Fallback to India as default
      setValue('country', 'India');
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await api.get('/currency/countries');
      setCountries(response.data.data.countries);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      // Fallback to hardcoded list
      setCountries([
        { name: 'India', currencies: [{ code: 'INR', name: 'Indian Rupee' }] },
        { name: 'United States', currencies: [{ code: 'USD', name: 'US Dollar' }] },
        { name: 'United Kingdom', currencies: [{ code: 'GBP', name: 'British Pound' }] }
      ]);
    }
  };

  const onSubmit = async (data) => {
    try {
      setFormData(data);
      // Send OTP to email
      await api.post('/auth/send-otp', { email: data.email, type: 'signup' });
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send OTP');
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    try {
      // Verify OTP and register user
      await api.post('/auth/verify-otp', { 
        email: formData.email, 
        otp, 
        type: 'signup',
        userData: formData 
      });
      toast.success('Email verified! Creating account...');
      await registerUser(formData);
      toast.success('Registration successful!');
      router.replace('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  const resendOTP = async () => {
    try {
      await api.post('/auth/send-otp', { email: formData.email, type: 'signup' });
      toast.success('OTP resent to your email!');
    } catch (error) {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Expense Manager</CardTitle>
          <p className="text-gray-600">{step === 1 ? 'Create your account' : 'Verify your email'}</p>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <Input
                    {...register('name', { required: 'Name is required' })}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <Input
                    type="password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <select
                    {...register('country', { required: 'Country is required' })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select your country</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="India">India</option>
                    {countries.map((country) => (
                      <option key={country.name} value={country.name}>
                        {country.name} ({country.currencies.map(c => c.code).join(', ')})
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-sm text-red-600 mt-1">{errors.country.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  We've sent a 6-digit OTP to <strong>{formData?.email}</strong>
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Enter OTP</label>
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>

              <Button 
                onClick={verifyOTP} 
                disabled={isVerifying || otp.length !== 6} 
                className="w-full"
              >
                {isVerifying ? 'Verifying...' : 'Verify & Create Account'}
              </Button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={resendOTP}
                  className="text-sm text-primary hover:underline"
                >
                  Resend OTP
                </button>
                <br />
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Back to form
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}