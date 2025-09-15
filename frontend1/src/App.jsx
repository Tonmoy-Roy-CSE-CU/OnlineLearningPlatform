import React, { useState, useEffect } from 'react';
import { AuthContext } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Header from './components/layout/Header';
import StudentDashboard from './components/dashboard/StudentDashboard';
import TeacherDashboard from './components/dashboard/TeacherDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userToken, userData) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {showRegister ? (
          <Register switchToLogin={() => setShowRegister(false)} />
        ) : (
          <Login 
            onLogin={handleLogin} 
            switchToRegister={() => setShowRegister(true)} 
          />
        )}
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token }}>
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={handleLogout} />
        <main>
          {user.role === 'admin' && (
            <AdminDashboard user={user} token={token} />
          )}
          {user.role === 'teacher' && (
            <TeacherDashboard user={user} token={token} />
          )}
          {user.role === 'student' && (
            <StudentDashboard user={user} token={token} />
          )}
        </main>
      </div>
    </AuthContext.Provider>
  );
};

export default App;