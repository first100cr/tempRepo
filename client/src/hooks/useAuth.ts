import { useState, useEffect, useCallback } from 'react';

interface UserData {
  name: string;
  email: string;
  picture: string;
  sub: string;
  credential: string;
}

export function useAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('skailinker_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('skailinker_user');
      }
    }
    setLoading(false);

    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'skailinker_user') {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch (error) {
            console.error('Error parsing user data:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // NEW: Logout function
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('skailinker_user');
    
    // Optional: Call backend logout endpoint
    // fetch('/api/auth/logout', { method: 'POST' })
    //   .catch(err => console.error('Logout error:', err));
    
    // Reload to clear app state
    window.location.href = '/';
  }, []);

  // NEW: Update user function
  const updateUser = useCallback((updates: Partial<UserData>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('skailinker_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { 
    user, 
    loading,
    isAuthenticated: !!user,
    email: user?.email,
    name: user?.name,
    picture: user?.picture,
    sub: user?.sub,
    logout,        // NEW
    updateUser     // NEW
  };
}