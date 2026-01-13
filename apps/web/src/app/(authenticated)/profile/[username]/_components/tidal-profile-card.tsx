'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Button,
} from '@scilent-one/ui';
import { Music2, User, Globe, Crown, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { authClient } from '@/lib/auth-client';

import { getProviderProfile, type ProviderProfileResult } from '../actions';

interface TidalProfileCardProps {
  userId: string;
  isCurrentUser: boolean;
}

export function TidalProfileCard({
  userId,
  isCurrentUser,
}: TidalProfileCardProps) {
  const [result, setResult] = useState<ProviderProfileResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      // Only fetch if viewing own profile (privacy)
      if (!isCurrentUser) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getProviderProfile(userId, 'tidal');
        setResult(data);
      } catch (error) {
        console.error('Failed to fetch Tidal profile:', error);
        setResult({
          success: false,
          error: 'Failed to fetch profile',
          errorCode: 'PROVIDER_ERROR',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [userId, isCurrentUser]);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      await authClient.linkSocial({
        provider: 'tidal',
        callbackURL: window.location.pathname,
      });
    } catch (error) {
      console.error('Failed to reconnect Tidal:', error);
    } finally {
      setIsReconnecting(false);
    }
  };

  // Don't show card if not current user (privacy)
  if (!isCurrentUser) {
    return null;
  }

  if (isLoading) {
    return <TidalProfileCardSkeleton />;
  }

  if (!result?.success || !result.profile) {
    // Don't show card if not connected
    if (result?.errorCode === 'NOT_CONNECTED') {
      return null;
    }

    // Show error state for other errors with reconnect button
    return (
      <Card className='border-destructive/50'>
        <CardHeader className='pb-3'>
          <div className='flex items-center gap-2'>
            <Music2 className='h-5 w-5 text-muted-foreground' />
            <CardTitle className='text-base'>Tidal</CardTitle>
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          <p className='text-sm text-muted-foreground'>
            {result?.errorCode === 'TOKEN_EXPIRED'
              ? 'Your Tidal connection has expired.'
              : 'Unable to load Tidal profile.'}
          </p>
          <Button
            variant='outline'
            size='sm'
            onClick={handleReconnect}
            disabled={isReconnecting}
            className='w-full'
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isReconnecting ? 'animate-spin' : ''}`}
            />
            {isReconnecting ? 'Reconnecting...' : 'Reconnect Tidal'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const profile = result.profile;

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Music2 className='h-5 w-5 text-[#00FFFF]' />
            <CardTitle className='text-base'>Tidal</CardTitle>
          </div>
          {profile.subscription && (
            <Badge variant='secondary' className='text-xs'>
              <Crown className='h-3 w-3 mr-1' />
              {profile.subscription.type}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Profile Info */}
        <div className='flex items-center gap-3'>
          <Avatar className='h-12 w-12'>
            {profile.profileImage ? (
              <AvatarImage
                src={profile.profileImage.url}
                alt={profile.displayName ?? profile.username ?? 'Tidal user'}
              />
            ) : null}
            <AvatarFallback>
              <User className='h-6 w-6' />
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <p className='font-medium truncate'>
              {profile.displayName ?? profile.username ?? 'Tidal User'}
            </p>
            {profile.username && (
              <p className='text-sm text-muted-foreground truncate'>
                @{profile.username}
              </p>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className='flex flex-wrap gap-2 text-xs text-muted-foreground'>
          {profile.country && (
            <div className='flex items-center gap-1'>
              <Globe className='h-3 w-3' />
              <span>{profile.country}</span>
            </div>
          )}
          {profile.email && (
            <div className='flex items-center gap-1 truncate'>
              <span className='truncate'>{profile.email}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TidalProfileCardSkeleton() {
  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center gap-2'>
          <Music2 className='h-5 w-5 text-muted-foreground' />
          <Skeleton className='h-5 w-16' />
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-12 w-12 rounded-full' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-3 w-16' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
