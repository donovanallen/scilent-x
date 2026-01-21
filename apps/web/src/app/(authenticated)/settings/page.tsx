'use client';

import {
  ProviderIcon,
  ProviderSyncStatus,
  type IconProvider,
} from '@scilent-one/scilent-ui';
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
} from '@scilent-one/ui';
import {
  ChevronDown,
  Link2,
  RefreshCw,
  Trash2,
  Unlink,
  User,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { authClient, useSession } from '@/lib/auth-client';

type LinkedAccount = {
  id: string;
  providerId: string;
  accountId: string;
  createdAt: Date;
};

/** Streaming providers available for account linking */
const STREAMING_PROVIDERS = [
  { id: 'tidal', name: 'Tidal' },
  { id: 'spotify', name: 'Spotify' },
  // Future: { id: 'apple_music', name: 'Apple Music' },
] as const;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
  }).format(date);
}

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const [profileOpen, setProfileOpen] = useState(true);
  const [connectedOpen, setConnectedOpen] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [linkingProvider, setLinkingProvider] = useState<string | null>(null);
  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(
    null
  );
  const [reconnectingProvider, setReconnectingProvider] = useState<
    string | null
  >(null);

  const fetchLinkedAccounts = useCallback(async () => {
    try {
      const { data } = await authClient.listAccounts();
      if (data) {
        // Filter out credential accounts (password auth)
        const streamingAccounts = data.filter(
          (account) => account.providerId !== 'credential'
        );
        setLinkedAccounts(streamingAccounts as LinkedAccount[]);
      }
    } catch (error) {
      console.error('Failed to fetch linked accounts:', error);
    } finally {
      setAccountsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinkedAccounts();
  }, [fetchLinkedAccounts]);

  const handleLinkAccount = async (providerId: string) => {
    setLinkingProvider(providerId);
    try {
      await authClient.linkSocial({
        provider: providerId,
        callbackURL: '/settings',
      });
    } catch (error) {
      console.error(`Failed to link ${providerId}:`, error);
    } finally {
      setLinkingProvider(null);
    }
  };

  const handleUnlinkAccount = async (providerId: string) => {
    setUnlinkingProvider(providerId);
    try {
      await authClient.unlinkAccount({ providerId });
      await fetchLinkedAccounts();
    } catch (error) {
      console.error(`Failed to unlink ${providerId}:`, error);
    } finally {
      setUnlinkingProvider(null);
    }
  };

  const handleReconnect = async (providerId: string) => {
    setReconnectingProvider(providerId);
    try {
      await authClient.linkSocial({
        provider: providerId,
        callbackURL: '/settings',
      });
    } catch (error) {
      console.error(`Failed to reconnect ${providerId}:`, error);
    } finally {
      setReconnectingProvider(null);
    }
  };

  const isProviderLinked = (providerId: string) => {
    return linkedAccounts.some((account) => account.providerId === providerId);
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
    <div className='flex flex-col h-full min-h-0 pb-6'>
      <div className='mb-6'>
        <h2>Settings</h2>
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

        {/* Connected Accounts Section */}
        <Card>
          <Collapsible open={connectedOpen} onOpenChange={setConnectedOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className='cursor-pointer hover:bg-muted/50 transition-colors'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Link2 className='size-5 text-muted-foreground' />
                    <div>
                      <CardTitle className='text-lg'>
                        Connected Accounts
                      </CardTitle>
                      <CardDescription>
                        Link your streaming service accounts
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronDown
                    className={`size-5 text-muted-foreground transition-transform duration-200 ${
                      connectedOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className='space-y-4'>
                <p className='text-sm text-muted-foreground'>
                  Connect your streaming accounts to access your playlists,
                  favorites, and more.
                </p>
                <Separator />
                {accountsLoading ? (
                  <div className='space-y-3'>
                    {STREAMING_PROVIDERS.map((provider) => (
                      <div
                        key={provider.id}
                        className='flex items-center justify-between py-2'
                      >
                        <div className='h-6 w-20 bg-muted animate-pulse rounded' />
                        <div className='h-9 w-24 bg-muted animate-pulse rounded' />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {STREAMING_PROVIDERS.map((provider) => {
                      const isLinked = isProviderLinked(provider.id);
                      const isLinking = linkingProvider === provider.id;
                      const isUnlinking = unlinkingProvider === provider.id;
                      const isReconnecting =
                        reconnectingProvider === provider.id;

                      return (
                        <div
                          key={provider.id}
                          className='flex items-center justify-between py-2'
                        >
                          <div className='flex items-center gap-3'>
                            <ProviderIcon
                              provider={provider.id as IconProvider}
                              size='sm'
                            />
                            <span className='text-sm font-medium'>
                              {provider.name}
                            </span>
                          </div>
                          {isLinked ? (
                            <div className='flex items-center gap-2'>
                              <ProviderSyncStatus
                                status={
                                  isReconnecting
                                    ? 'syncing'
                                    : isUnlinking
                                      ? 'loading'
                                      : 'connected'
                                }
                              />
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleReconnect(provider.id)}
                                disabled={isReconnecting || isUnlinking}
                                title='Refresh connection'
                              >
                                <RefreshCw
                                  className={`size-4 ${isReconnecting ? 'animate-spin' : ''}`}
                                />
                                {isReconnecting
                                  ? 'Reconnecting...'
                                  : 'Reconnect'}
                              </Button>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => handleUnlinkAccount(provider.id)}
                                disabled={isUnlinking || isReconnecting}
                              >
                                <Unlink className='size-4' />
                                {isUnlinking
                                  ? 'Disconnecting...'
                                  : 'Disconnect'}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant='default'
                              size='sm'
                              onClick={() => handleLinkAccount(provider.id)}
                              disabled={isLinking}
                            >
                              <Link2 className='size-4' />
                              {isLinking ? 'Connecting...' : 'Connect'}
                            </Button>
                          )}
                        </div>
                      );
                    })}
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
