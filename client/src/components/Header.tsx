// client/src/components/Header.tsx
// ✅ UPDATED - Uses shared AuthContext for instant updates

import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  Plane, 
  TrendingUp, 
  Search, 
  DollarSign, 
  Info,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Bookmark
} from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const { user, name, email, picture, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigation = [
    { name: 'Home', href: '/', icon: Plane },
    { name: 'Flights', href: '/flights', icon: Search },
    { name: 'Predictions', href: '/predictions', icon: TrendingUp },
    { name: 'Deals', href: '/deals', icon: DollarSign },
    { name: 'About', href: '/about', icon: Info },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src="/assets/SkaiLinker_Icon.png" 
                alt="SkaiLinker" 
                className="h-10 w-10"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=SK';
                }}
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                SkaiLinker
              </span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </nav>

          {/* Right Side - Profile (only show when logged in) & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Profile Section - ONLY SHOW WHEN LOGGED IN */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                  aria-label="User menu"
                  aria-expanded={isDropdownOpen}
                >
                  {/* Profile Picture or Initials */}
                  {picture ? (
                    <img
                      src={picture}
                      alt={name || 'User'}
                      className="w-9 h-9 rounded-full border-2 border-blue-500 object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-blue-500">
                      {getInitials(name)}
                    </div>
                  )}

                  {/* Dropdown Arrow - Hidden on mobile */}
                  <ChevronDown 
                    className={`hidden sm:block w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu - IMPROVED UI */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info Header */}
                    <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        {picture ? (
                          <img
                            src={picture}
                            alt={name || 'User'}
                            className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-500"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg ring-2 ring-blue-500">
                            {getInitials(name)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate text-base">
                            {name || 'User'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {email || 'user@example.com'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-700 dark:text-green-400 font-medium">
                          Signed in with Google
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link href="/profile">
                        <a
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">My Profile</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              View and edit your profile
                            </p>
                          </div>
                        </a>
                      </Link>

                      <Link href="/saved">
                        <a
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                            <Bookmark className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Saved Flights</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Your bookmarked routes
                            </p>
                          </div>
                        </a>
                      </Link>

                      <Link href="/settings">
                        <a
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Settings</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Preferences & notifications
                            </p>
                          </div>
                        </a>
                      </Link>
                    </div>

                    {/* Logout Button */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 px-2 pb-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                          <LogOut className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">Log Out</p>
                          <p className="text-xs text-red-500 dark:text-red-400">
                            Sign out of your account
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden border-t border-gray-200 dark:border-gray-800 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <nav className="flex flex-col px-4 py-2 gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <a
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}