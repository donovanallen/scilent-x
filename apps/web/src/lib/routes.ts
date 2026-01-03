import {
  ArrowRight,
  Database,
  Home,
  LogIn,
  Settings,
  User,
  Users,
} from 'lucide-react';

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
  db: {
    href: '/db',
    label: 'Database',
    icon: Database,
    protected: true,
    isAdmin: true,
  },
  users: {
    href: '/users',
    label: 'Users',
    icon: Users,
    protected: true,
    isAdmin: true,
  },
} as const;
