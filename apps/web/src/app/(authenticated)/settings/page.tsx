'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Separator,
  Switch,
} from '@scilent-one/ui';
import { Bell, ChevronDown, Trash2, User } from 'lucide-react';
import { useState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';

import { useSession } from '@/lib/auth-client';
import {
  getUserPreferences,
  toggleInAppNotifications,
  type NotificationPreferences,
} from './actions';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
  }).format(date);
}

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const [profileOpen, setProfileOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] =
    useState<NotificationPreferences | null>(null);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [isPendingUpdate, startTransition] = useTransition();

  // Load notification preferences on mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        const prefs = await getUserPreferences();
        if (prefs) {
          setNotificationPrefs({
            inAppNotificationsEnabled: prefs.inAppNotificationsEnabled,
            emailNotificationsEnabled: prefs.emailNotificationsEnabled,
            pushNotificationsEnabled: prefs.pushNotificationsEnabled,
          });
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
        toast.error('Failed to load notification preferences');
      } finally {
        setPrefsLoading(false);
      }
    }

    if (session?.user) {
      loadPreferences();
    }
  }, [session?.user]);

  const handleInAppNotificationToggle = (enabled: boolean) => {
    // Optimistically update the UI
    setNotificationPrefs((prev) =>
      prev ? { ...prev, inAppNotificationsEnabled: enabled } : null
    );

    startTransition(async () => {
      const result = await toggleInAppNotifications(enabled);
      if (result.success) {
        toast.success(
          enabled
            ? 'In-app notifications enabled'
            : 'In-app notifications disabled'
        );
      } else {
        // Revert on error
        setNotificationPrefs((prev) =>
          prev ? { ...prev, inAppNotificationsEnabled: !enabled } : null
        );
        toast.error(result.error || 'Failed to update notification settings');
      }
    });
  };

  const handleDeleteAccount = () => {
    // TODO: Implement delete account functionality
    console.log('Delete account clicked - not yet implemented');
  };

  if (isPending) {
    return (
      <div className='w-full py-10'>
        <div className='h-8 w-32 bg-muted animate-pulse rounded mb-2' />
        <div className='h-4 w-48 bg-muted animate-pulse rounded' />
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className='w-full py-10 space-y-8'>
      <div>
        <h1 className='text-3xl font-bold'>Settings</h1>
        <p className='text-muted-foreground mt-1'>
          Manage your account settings
        </p>
      </div>

      <div className='space-y-4'>
        {/* Profile Section */}
        <Card>
          <Collapsible open={profileOpen} onOpenChange={setProfileOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className='cursor-pointer hover:bg-muted/50 transition-colors'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <User className='size-5 text-muted-foreground' />
                    <div>
                      <CardTitle className='text-lg'>Profile</CardTitle>
                      <CardDescription>
                        Your account information
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronDown
                    className={`size-5 text-muted-foreground transition-transform duration-200 ${
                      profileOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className='space-y-4'>
                <div className='flex items-center gap-4'>
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name ?? 'User avatar'}
                      className='size-16 rounded-full'
                    />
                  ) : (
                    <div className='size-16 rounded-full bg-muted flex items-center justify-center text-xl font-medium text-muted-foreground'>
                      {user?.name?.charAt(0)?.toUpperCase() ??
                        user?.email?.charAt(0).toUpperCase() ??
                        '?'}
                    </div>
                  )}
                  <div>
                    <p className='font-medium text-lg'>
                      {user?.name ?? 'No name set'}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {user?.email}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground'>Email</span>
                    <span className='text-sm font-mono'>{user?.email}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground'>
                      User ID
                    </span>
                    <span className='text-sm font-mono truncate max-w-[200px]'>
                      {user?.id}
                    </span>
                  </div>
                  {user?.createdAt && (
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-muted-foreground'>
                        Member since
                      </span>
                      <span className='text-sm'>
                        {formatDate(new Date(user.createdAt))}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Notifications Section */}
        <Card>
          <Collapsible
            open={notificationsOpen}
            onOpenChange={setNotificationsOpen}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className='cursor-pointer hover:bg-muted/50 transition-colors'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Bell className='size-5 text-muted-foreground' />
                    <div>
                      <CardTitle className='text-lg'>Notifications</CardTitle>
                      <CardDescription>
                        Manage how you receive notifications
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronDown
                    className={`size-5 text-muted-foreground transition-transform duration-200 ${
                      notificationsOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className='space-y-4'>
                {prefsLoading ? (
                  <div className='space-y-3'>
                    <div className='h-10 bg-muted animate-pulse rounded' />
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {/* In-App Notifications Toggle */}
                    <div className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <label
                          htmlFor='in-app-notifications'
                          className='text-sm font-medium cursor-pointer'
                        >
                          In-app notifications
                        </label>
                        <p className='text-xs text-muted-foreground'>
                          Receive notifications within the app
                        </p>
                      </div>
                      <Switch
                        id='in-app-notifications'
                        checked={
                          notificationPrefs?.inAppNotificationsEnabled ?? true
                        }
                        onCheckedChange={handleInAppNotificationToggle}
                        disabled={isPendingUpdate}
                      />
                    </div>

                    <Separator />

                    {/* Email Notifications - Coming Soon */}
                    <div className='flex items-center justify-between opacity-50'>
                      <div className='space-y-0.5'>
                        <label className='text-sm font-medium'>
                          Email notifications
                        </label>
                        <p className='text-xs text-muted-foreground'>
                          Receive notifications via email (coming soon)
                        </p>
                      </div>
                      <Switch
                        checked={
                          notificationPrefs?.emailNotificationsEnabled ?? true
                        }
                        disabled
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Delete Account Section */}
        <Card className='border-destructive/50'>
          <Collapsible open={deleteOpen} onOpenChange={setDeleteOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className='cursor-pointer hover:bg-muted/50 transition-colors'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Trash2 className='size-5 text-destructive' />
                    <div>
                      <CardTitle className='text-lg text-destructive'>
                        Delete Account
                      </CardTitle>
                      <CardDescription>
                        Permanently delete your account
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronDown
                    className={`size-5 text-muted-foreground transition-transform duration-200 ${
                      deleteOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <p className='text-sm text-muted-foreground mb-4'>
                  This action cannot be undone. This will permanently delete
                  your account and remove all of your data from our servers.
                </p>
                <Button variant='destructive' onClick={handleDeleteAccount}>
                  <Trash2 className='size-4' />
                  Delete my account
                </Button>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
}
