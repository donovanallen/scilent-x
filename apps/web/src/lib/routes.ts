import { ArrowRight, Home, LogIn, Settings, Shield, User } from 'lucide-react';

export const ROUTES = {
  home: {
    href: '/',
    label: 'Home',
    icon: Home,
    protected: false,
    isAdmin: false,
  },
  profile: {
    href: '/profile',
    label: 'Profile',
    icon: User,
    protected: true,
    isAdmin: false,
  },
  settings: {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    protected: true,
    isAdmin: false,
  },
  admin: {
    href: '/admin',
    label: 'Admin',
    icon: Shield,
    protected: true,
    isAdmin: true,
  },
  login: {
    href: '/login',
    label: 'Login',
    icon: LogIn,
    protected: false,
    isAdmin: false,
  },
  signup: {
    href: '/signup',
    label: 'Signup',
    icon: ArrowRight,
    protected: false,
    isAdmin: false,
  },
} as const;
