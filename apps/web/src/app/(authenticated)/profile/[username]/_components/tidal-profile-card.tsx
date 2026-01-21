'use client';

import {
  PlatformProfileCard,
  type PlatformProfile,
  type FollowedArtistsData,
  type LibraryCountsData,
  type ProfileError,
} from '@scilent-one/scilent-ui';
import { useEffect, useState } from 'react';

import { authClient } from '@/lib/auth-client';

import {
  getProviderProfile,
  getFollowedArtists,
  getLibraryCounts,
  type ProviderProfileResult,
  type FollowedArtistsResult,
  type LibraryCountsResult,
} from '../actions';

interface TidalProfileCardProps {
  userId: string;
  isCurrentUser: boolean;
}

export function TidalProfileCard({
  userId,
  isCurrentUser,
}: TidalProfileCardProps) {
  const [result, setResult] = useState<ProviderProfileResult | null>(null);
  const [artistsResult, setArtistsResult] =
    useState<FollowedArtistsResult | null>(null);
  const [countsResult, setCountsResult] =
    useState<LibraryCountsResult | null>(null);
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
        // Fetch profile, followed artists, and library counts in parallel
        const [profileData, artistsData, countsData] = await Promise.all([
          getProviderProfile(userId, 'tidal'),
          getFollowedArtists(userId, 'tidal', 5), // Fetch first 5 for preview
          getLibraryCounts(userId, 'tidal'),
        ]);

        if (!isCancelled) {
          setResult(profileData);
          setArtistsResult(artistsData);
          setCountsResult(countsData);
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

  // Transform data to match PlatformProfileCard props
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
        externalUrl: result.profile?.username
          ? `https://tidal.com/profile/${result.profile.username}`
          : null,
      }
    : null;

  const followedArtists: FollowedArtistsData | null =
    artistsResult?.success && artistsResult.artists
      ? {
          artists: artistsResult.artists.map((artist) => ({
            name: artist.name,
            id: artist.externalIds.tidal as string,
          })),
          total: artistsResult.total ?? 0,
          hasMore: artistsResult.hasMore ?? false,
        }
      : null;

  const libraryCounts: LibraryCountsData | null =
    countsResult?.success && countsResult.counts
      ? {
          albums: countsResult.counts.albums,
          playlists: countsResult.counts.playlists,
          artists: countsResult.counts.artists,
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
      platform='tidal'
      profile={profile}
      followedArtists={followedArtists}
      libraryCounts={libraryCounts}
      error={error}
      isLoading={isLoading}
      isReconnecting={isReconnecting}
      onReconnect={handleReconnect}
      hideWhenNotConnected
    />
  );
}
