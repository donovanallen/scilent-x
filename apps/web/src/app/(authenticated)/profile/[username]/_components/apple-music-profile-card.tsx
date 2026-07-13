'use client';

import {
  PlatformProfileCard,
  type PlatformProfile,
  type FollowedArtistsData,
  type PlaylistsData,
  type RecentTracksData,
  type ProfileError,
} from '@scilent-one/scilent-ui';
import { useEffect, useState } from 'react';

import { connectAppleMusic } from '@/lib/musickit';

import {
  getProviderProfile,
  getFollowedArtists,
  getPlaylists,
  getRecentlyPlayed,
  type ProviderProfileResult,
  type FollowedArtistsResult,
  type PlaylistsResult,
  type RecentlyPlayedResult,
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
  const [playlistsResult, setPlaylistsResult] =
    useState<PlaylistsResult | null>(null);
  const [recentlyPlayedResult, setRecentlyPlayedResult] =
    useState<RecentlyPlayedResult | null>(null);
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
        // Fetch profile, library artists, playlists, and recent listen
        // history in parallel.
        const [profileData, artistsData, playlistsData, recentlyPlayedData] =
          await Promise.all([
            getProviderProfile(userId, 'apple_music'),
            getFollowedArtists(userId, 'apple_music', 5), // First 5 for preview
            getPlaylists(userId, 'apple_music', 5), // First 5 for preview
            getRecentlyPlayed(userId, 'apple_music', 5), // Last 5 tracks
          ]);

        if (!isCancelled) {
          setResult(profileData);
          setArtistsResult(artistsData);
          setPlaylistsResult(playlistsData);
          setRecentlyPlayedResult(recentlyPlayedData);
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

  const playlists: PlaylistsData | null =
    playlistsResult?.success && playlistsResult.playlists
      ? {
          playlists: playlistsResult.playlists.map((playlist) => {
            const id = playlist.externalIds.apple_music as string | undefined;
            return {
              name: playlist.name,
              isPublic: playlist.isPublic ?? false,
              ...(id ? { id } : {}),
              ...(playlist.trackCount !== undefined
                ? { trackCount: playlist.trackCount }
                : {}),
            };
          }),
          total: playlistsResult.total ?? 0,
          hasMore: playlistsResult.hasMore ?? false,
        }
      : null;

  const recentTracks: RecentTracksData | null =
    recentlyPlayedResult?.success && recentlyPlayedResult.items
      ? {
          tracks: recentlyPlayedResult.items.map((item) => {
            const artistName = item.track.artists[0]?.name;
            const id = item.track.externalIds.apple_music;
            return {
              title: item.track.title,
              ...(artistName ? { artistName } : {}),
              ...(id ? { id } : {}),
            };
          }),
          hasMore: recentlyPlayedResult.hasMore ?? false,
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
      playlists={playlists}
      recentTracks={recentTracks}
      error={error}
      isLoading={isLoading}
      isReconnecting={isReconnecting}
      onReconnect={handleReconnect}
      hideWhenNotConnected
      followedArtistsViewAllHref='/artists?provider=apple_music'
    />
  );
}
