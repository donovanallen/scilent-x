'use client';

import { ProviderIcon } from '@scilent-one/harmony-ui';
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
  Separator,
  CardFooter,
} from '@scilent-one/ui';
import {
  Music2,
  User,
  Globe,
  Crown,
  RefreshCw,
  AtSign,
  ExternalLink,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { authClient } from '@/lib/auth-client';

import { getProviderProfile, getFollowedArtists, type ProviderProfileResult, type FollowedArtistsResult } from '../actions';

interface TidalProfileCardProps {
  userId: string;
  isCurrentUser: boolean;
}

export function TidalProfileCard({
  userId,
  isCurrentUser,
}: TidalProfileCardProps) {
  const [result, setResult] = useState<ProviderProfileResult | null>(null);
  const [artistsResult, setArtistsResult] = useState<FollowedArtistsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function fetchProfile() {
      // Only fetch if viewing own profile (privacy)
      if (!isCurrentUser) {
        if (!isCancelled) {
          setIsLoading(false);
        }
        return;
      }

      try {
        // Fetch profile and followed artists in parallel
        const [profileData, artistsData] = await Promise.all([
          getProviderProfile(userId, 'tidal'),
          getFollowedArtists(userId, 'tidal', 5), // Fetch first 5 for preview
        ]);
        
        if (!isCancelled) {
          setResult(profileData);
          setArtistsResult(artistsData);
        }
      } catch (error) {
        console.error('Failed to fetch Tidal profile:', error);
        if (!isCancelled) {
          setResult({
            success: false,
            error: 'Failed to fetch profile',
            errorCode: 'PROVIDER_ERROR',
          });
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      isCancelled = true;
    };
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
      <CardHeader className='pb-0'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <ProviderIcon provider='tidal' color='white' />
            <CardTitle>
              <h5>Tidal</h5>
            </CardTitle>
          </div>
          {profile.subscription && (
            <Badge variant='secondary' className='text-xs'>
              <Crown className='h-3 w-3 mr-1' />
              {profile.subscription.type}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Separator className='my-4' />
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
          <div className='flex flex-col flex-1 min-w-0'>
            <span className='font-medium truncate'>
              {profile.displayName ?? profile.username ?? 'Tidal User'}
            </span>
            {profile.username && (
              <div className='flex items-center gap-1 text-muted-foreground'>
                <AtSign className='size-3' />
                <span className='text-xs text-muted-foreground truncate'>
                  {profile.username}
                </span>
              </div>
            )}
            {profile.country && (
              <div className='flex items-center gap-1 text-muted-foreground'>
                <Globe className='size-3' />
                <span className='text-xs'>{profile.country}</span>
              </div>
            )}
          </div>
        </div>

        {/* Artist Collection Stats */}
        {artistsResult?.success && (
          <>
            <Separator className='my-4' />
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Users className='size-4' />
                  <span>Followed Artists</span>
                </div>
                {artistsResult.total !== undefined && (
                  <Badge variant='secondary' className='text-xs'>
                    {artistsResult.total.toLocaleString()}
                  </Badge>
                )}
              </div>
              
              {/* Preview of followed artists */}
              {artistsResult.artists && artistsResult.artists.length > 0 && (
                <div className='flex flex-wrap gap-1'>
                  {artistsResult.artists.slice(0, 5).map((artist) => (
                    <Badge 
                      key={artist.externalIds.tidal ?? artist.name} 
                      variant='outline' 
                      className='text-xs'
                    >
                      {artist.name}
                    </Badge>
                  ))}
                  {artistsResult.hasMore && (
                    <Badge variant='outline' className='text-xs text-muted-foreground'>
                      +more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant='outline'
          size='sm'
          className='w-full flex items-center gap-2'
        >
          <Link
            href={`https://tidal.com/profile/${profile.username}`}
            target='_blank'
          >
            View on Tidal
          </Link>
          <ExternalLink className='size-4' />
        </Button>
      </CardFooter>
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
