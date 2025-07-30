import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import AppRoutes from '@/routes/AppRoutes';
import { useAuth } from '@/context/AuthContext';
import '@/assets/styles/global.css';

// Layout wrapper component
const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuToggle={toggleSidebar} 
        isMenuOpen={isSidebarOpen} 
      />
      
      <div className="flex">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={closeSidebar} 
        />
        
        <main className="flex-1 min-h-[calc(100vh-4rem)] lg:ml-64">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppLayout>
          <AppRoutes />
        </AppLayout>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Define default options
            className: '',
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            // Default options for specific types
            success: {
              duration: 3000,
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
            error: {
              duration: 5000,
              theme: {
                primary: 'red',
                secondary: 'black',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
};

export default App;