import {
  ArrowRight,
  Database,
  Home,
  LogIn,
  MessageSquare,
  MicVocal,
  ScanSearch,
  Search,
  Rss,
  Settings,
  Star,
  User,
  CloudSync,
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
  search: {
    href: '/search',
    label: 'Search',
    icon: Search,
    protected: true,
    isAdmin: false,
  },
  myArtists: {
    href: '/artists',
    label: 'My Artists',
    icon: MicVocal,
    protected: true,
    isAdmin: false,
  },
  feed: {
    href: '/feed',
    label: 'Feed',
    icon: Rss,
    protected: true,
    isAdmin: false,
  },
  reviews: {
    href: '/reviews',
    label: 'Reviews',
    icon: Star,
    protected: true,
    isAdmin: false,
  },
  messages: {
    href: '/messages',
    label: 'Messages',
    icon: MessageSquare,
    protected: true,
    isAdmin: false,
  },
  users: {
    href: '/users',
    label: 'Users',
    icon: Users,
    protected: true,
    isAdmin: false,
  },
  profile: {
    href: '/profile',
    label: 'My Profile',
    icon: User,
    protected: true,
    isAdmin: false,
    showInNav: false,
  },
  settings: {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    protected: true,
    isAdmin: false,
    showInNav: false,
  },
  signup: {
    href: '/signup',
    label: 'Signup',
    icon: ArrowRight,
    protected: false,
    isAdmin: false,
  },
  login: {
    href: '/login',
    label: 'Login',
    icon: LogIn,
    protected: false,
    isAdmin: false,
  },
  adminUsers: {
    href: '/admin/users',
    label: 'Users',
    icon: Users,
    protected: true,
    isAdmin: true,
  },
  db: {
    href: '/admin/db',
    label: 'Database',
    icon: Database,
    protected: true,
    isAdmin: true,
  },
  harmony: {
    href: '/admin/harmony',
    label: 'Harmony',
    icon: CloudSync,
    protected: true,
    isAdmin: true,
  },
  lookup: {
    href: '/admin/lookup',
    label: 'Lookup',
    icon: ScanSearch,
    protected: true,
    isAdmin: true,
  },
} as const;

/**
 * Sanitize a post-authentication redirect target.
 *
 * Only same-origin, absolute-path destinations are allowed (e.g. `/reviews/new?url=...`).
 * Absolute URLs and protocol-relative paths (`//evil.com`) are rejected to avoid
 * open-redirect vulnerabilities. Returns `null` when the value is missing or unsafe,
 * letting callers fall back to a default destination.
 *
 * This underpins external review ingress: a deep link such as
 * `/login?redirect=/reviews/new?url=<providerUrl>` survives sign-in/sign-up and lands
 * the user on the pre-populated review composer.
 */
export function sanitizeInternalRedirect(
  value: string | null | undefined
): string | null {
  if (!value) return null;
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  return value;
}
