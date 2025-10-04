import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { LogOut, User, Receipt, Users, Settings, Building, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const navigation = [
    { name: 'My Expenses', href: '/dashboard', icon: Receipt },
    ...(user?.role === 'Manager' || user?.role === 'Admin' 
      ? [
          { name: 'Approvals', href: '/dashboard/approvals', icon: Settings },
          { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 }
        ] 
      : []),
    ...(user?.role === 'Admin' 
      ? [
          { name: 'Company Expenses', href: '/dashboard/company-expenses', icon: Building },
          { name: 'Users', href: '/dashboard/users', icon: Users },
          { name: 'Workflows', href: '/dashboard/workflows', icon: Settings }
        ] 
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-primary">
                ExpenseFlow
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs text-gray-500">({user?.role})</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;