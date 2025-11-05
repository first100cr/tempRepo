// client/src/contexts/AuthContext.tsx
// ✅ NEW FILE - Shared authentication state

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface UserData {
  name: string;
  email: string;
  picture: string;
  sub: string;
  credential: string;
}

interface DecodedToken {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

interface AuthContextType {
  user: UserData | null;
  name: string;
  email: string;
  picture: string;
  loading: boolean;
  login: (credentialResponse: any) => void;
  logout: () => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('skailinker_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('skailinker_user');
        setError('Session expired. Please log in again.');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (credentialResponse: any) => {
    try {
      setError(null);
      const decoded = jwtDecode<DecodedToken>(credentialResponse.credential);
      const userData: UserData = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        sub: decoded.sub,
        credential: credentialResponse.credential
      };
      
      setUser(userData);
      localStorage.setItem('skailinker_user', JSON.stringify(userData));
      
      console.log('User logged in:', userData);
    } catch (error) {
      console.error('Error decoding token:', error);
      setError('Failed to process login. Please try again.');
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('skailinker_user');
    console.log('User logged out');
  };

  const value = {
    user,
    name: user?.name || '',
    email: user?.email || '',
    picture: user?.picture || '',
    loading,
    login,
    logout,
    error,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}