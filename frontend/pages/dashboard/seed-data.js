import { useState } from 'react';
import Layout from '../../components/Layout';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { Database, Users, Receipt, AlertTriangle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function SeedData() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingType, setSeedingType] = useState('');

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'Admin')) {
      router.push('/dashboard');
    }
  }, [user?.role, isAuthenticated, loading, router]);

  const seedUsers = async () => {
    setIsSeeding(true);
    setSeedingType('users');
    try {
      const response = await api.post('/admin/seed-users');
      toast.success('Users seeded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to seed users');
    } finally {
      setIsSeeding(false);
      setSeedingType('');
    }
  };

  const seedExpenses = async () => {
    setIsSeeding(true);
    setSeedingType('expenses');
    try {
      const response = await api.post('/admin/seed-expenses');
      toast.success('Expenses seeded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to seed expenses');
    } finally {
      setIsSeeding(false);
      setSeedingType('');
    }
  };

  if (loading) {
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
          <AlertTriangle className="h-16 w-16 text-error" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-textSecondary text-center">
            This page is restricted to administrators only.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center">
            <Database className="h-8 w-8 mr-3" />
            Seed Data
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seed Users */}
          <Card className="ai-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 mr-2 text-primary" />
                Seed Users
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-textSecondary">
                Populate the database with sample users across all departments:
              </p>
              <ul className="text-sm text-textSecondary space-y-1">
                <li>• 8 departments (Finance, HR, IT, Marketing, Sales, Operations, Legal, R&D)</li>
                <li>• 54+ users with realistic Indian names</li>
                <li>• Manager-employee relationships</li>
                <li>• Default password: password123</li>
              </ul>
              <Button
                onClick={seedUsers}
                disabled={isSeeding}
                className="w-full"
              >
                {isSeeding && seedingType === 'users' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Seeding Users...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Seed Users
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Seed Expenses */}
          <Card className="ai-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="h-6 w-6 mr-2 text-secondary" />
                Seed Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-textSecondary">
                Generate sample expense data for testing and demonstration:
              </p>
              <ul className="text-sm text-textSecondary space-y-1">
                <li>• Various expense categories</li>
                <li>• Different approval statuses</li>
                <li>• Realistic amounts in INR</li>
                <li>• Distributed across all users</li>
              </ul>
              <Button
                onClick={seedExpenses}
                disabled={isSeeding}
                className="w-full"
                variant="secondary"
              >
                {isSeeding && seedingType === 'expenses' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Seeding Expenses...
                  </>
                ) : (
                  <>
                    <Receipt className="h-4 w-4 mr-2" />
                    Seed Expenses
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Warning Card */}
        <Card className="border-warning bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <h3 className="font-semibold text-warning mb-1">Important Notes</h3>
                <ul className="text-sm text-textSecondary space-y-1">
                  <li>• Seeding will create sample data for testing purposes</li>
                  <li>• Users seeding will clear existing non-admin users</li>
                  <li>• Expenses seeding requires users to be seeded first</li>
                  <li>• Use this feature only in development/demo environments</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}