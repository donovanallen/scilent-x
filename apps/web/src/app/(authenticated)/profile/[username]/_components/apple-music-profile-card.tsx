'use client';

import {
  PlatformProfileCard,
  type PlatformProfile,
  type FollowedArtistsData,
  type ProfileError,
} from '@scilent-one/scilent-ui';
import { useEffect, useState } from 'react';

import { connectAppleMusic } from '@/lib/musickit';

import {
  getProviderProfile,
  getFollowedArtists,
  type ProviderProfileResult,
  type FollowedArtistsResult,
} from '../actions';

interface AppleMusicProfileCardProps {
  userId: string;
  isCurrentUser: boolean;
}

export function AppleMusicProfileCard({
  userId,
  isCurrentUser,
}: AppleMusicProfileCardProps) {
  const [result, setResult] = useState<ProviderProfileResult | null>(null);
  const [artistsResult, setArtistsResult] =
    useState<FollowedArtistsResult | null>(null);
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
        // Fetch profile and library artists in parallel
        const [profileData, artistsData] = await Promise.all([
          getProviderProfile(userId, 'apple_music'),
          getFollowedArtists(userId, 'apple_music', 5), // First 5 for preview
        ]);

        if (!isCancelled) {
          setResult(profileData);
          setArtistsResult(artistsData);
        }
      } catch (error) {
        console.error('Failed to fetch Apple Music profile:', error);
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
      // Apple Music re-auth goes through MusicKit rather than an OAuth redirect.
      await connectAppleMusic();
    } catch (error) {
      console.error('Failed to reconnect Apple Music:', error);
    } finally {
      setIsReconnecting(false);
    }
  };

  // Don't show card if not current user (privacy)
  if (!isCurrentUser) {
    return null;
  }

  // Transform data to match PlatformProfileCard props. Apple Music has no
  // public user profile, so the storefront is surfaced as the identity.
  const profile: PlatformProfile | null = result?.success
    ? {
        displayName: result.profile?.displayName ?? null,
        username: result.profile?.username ?? null,
        profileImage: result.profile?.profileImage
          ? { url: result.profile.profileImage.url }
          : null,
        country: result.profile?.country ?? null,
        subscription: result.profile?.subscription
          ? { type: result.profile.subscription.type }
          : null,
        externalUrl: 'https://music.apple.com',
      }
    : null;

  const followedArtists: FollowedArtistsData | null =
    artistsResult?.success && artistsResult.artists
      ? {
          artists: artistsResult.artists.map((artist) => ({
            name: artist.name,
            id: artist.externalIds.apple_music as string,
          })),
          total: artistsResult.total ?? 0,
          hasMore: artistsResult.hasMore ?? false,
        }
      : null;

  const error: ProfileError | null =
    !result?.success && result
      ? {
          message: result.error ?? 'Failed to load profile',
          code: result.errorCode as string,
        }
      : null;

  return (
    <PlatformProfileCard
      platform='apple_music'
      profile={profile}
      followedArtists={followedArtists}
      error={error}
      isLoading={isLoading}
      isReconnecting={isReconnecting}
      onReconnect={handleReconnect}
      hideWhenNotConnected
    />
  );
}
