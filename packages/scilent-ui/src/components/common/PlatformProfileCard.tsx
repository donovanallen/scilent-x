'use client';

import * as React from 'react';
import {
  cn,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  Badge,
  Skeleton,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Button,
  Separator,
} from '@scilent-one/ui';
import {
  User,
  Globe,
  Crown,
  RefreshCw,
  AtSign,
  ExternalLink,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { ProviderIcon } from '../../icons/ProviderIcon';
import { type Provider, PROVIDER_LABELS } from '../../icons/types';
import { type PlatformName } from './PlatformBadge';
import { ProviderSyncStatus, type ProviderSyncStatusType } from './ProviderSyncStatus';

/** Profile image data */
export interface ProfileImage {
  url: string;
  width?: number;
  height?: number;
}

/** Subscription information */
export interface SubscriptionInfo {
  type: string;
  status?: string;
}

/** Profile data structure */
export interface PlatformProfile {
  /** Display name shown prominently */
  displayName?: string | null;
  /** Username/handle */
  username?: string | null;
  /** Profile image */
  profileImage?: ProfileImage | null;
  /** Country code or name */
  country?: string | null;
  /** Subscription info */
  subscription?: SubscriptionInfo | null;
  /** External profile URL */
  externalUrl?: string | null;
}

/** Followed artist data */
export interface FollowedArtist {
  /** Artist name */
  name: string;
  /** Unique identifier (platform-specific) */
  id?: string;
}

/** Followed artists result */
export interface FollowedArtistsData {
  /** List of artists */
  artists: FollowedArtist[];
  /** Total count of followed artists */
  total?: number;
  /** Whether there are more artists beyond the fetched list */
  hasMore?: boolean;
}

/** Error state information */
export interface ProfileError {
  /** Error message to display */
  message: string;
  /** Error code for conditional handling */
  code?: 'NOT_CONNECTED' | 'TOKEN_EXPIRED' | 'PROVIDER_ERROR' | string;
}

export interface PlatformProfileCardProps extends Omit<
  React.ComponentProps<typeof Card>,
  'children'
> {
  /** The platform/provider name */
  platform: PlatformName;
  /** Profile data - when provided, shows the profile */
  profile?: PlatformProfile | null;
  /** Followed artists data */
  followedArtists?: FollowedArtistsData | null;
  /** Error state */
  error?: ProfileError | null;
  /** Loading state */
  isLoading?: boolean;
  /** Whether reconnect action is in progress */
  isReconnecting?: boolean;
  /** Callback when user clicks reconnect */
  onReconnect?: () => void;
  /** Custom label for the reconnect button */
  reconnectLabel?: string;
  /** Custom label for the external link button */
  externalLinkLabel?: string;
  /** Whether to show the followed artists section */
  showFollowedArtists?: boolean;
  /** Maximum number of artist badges to show */
  maxArtistBadges?: number;
  /** Custom footer content (replaces default external link button) */
  footer?: React.ReactNode;
  /** Whether to hide the card when not connected (error code: NOT_CONNECTED) */
  hideWhenNotConnected?: boolean;
  /** Whether the card starts collapsed */
  defaultCollapsed?: boolean;
  /** Controlled collapsed state */
  collapsed?: boolean;
  /** Callback when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Whether the card is collapsible */
  collapsible?: boolean;
}

/**
 * Checks if the platform is a supported provider with icon
 */
function isSupportedProvider(platform: string): platform is Provider {
  return ['spotify', 'apple_music', 'tidal'].includes(
    platform.toLowerCase().replace(/[\s-]/g, '_')
  );
}

/**
 * Gets the display label for a platform
 */
function getPlatformLabel(platform: string): string {
  const normalized = platform.toLowerCase().replace(/[\s-]/g, '_');
  if (isSupportedProvider(normalized)) {
    return PROVIDER_LABELS[normalized];
  }
  // Capitalize first letter of each word
  return platform
    .split(/[\s_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * A generic profile card component for displaying connected platform profiles.
 *
 * This component handles:
 * - Loading state (skeleton)
 * - Error states with optional reconnect action
 * - Profile display with avatar, name, username, country
 * - Subscription badge
 * - Followed artists preview
 * - External profile link
 */
/**
 * Derives the connection status from the component state
 */
function deriveConnectionStatus(
  isLoading: boolean,
  error?: ProfileError | null,
  profile?: PlatformProfile | null
): ProviderSyncStatusType {
  if (isLoading) return 'loading';
  if (error?.code === 'TOKEN_EXPIRED') return 'expired';
  if (error?.code === 'NOT_CONNECTED') return 'disconnected';
  if (error) return 'error';
  if (profile) return 'connected';
  return 'disconnected';
}

export function PlatformProfileCard({
  platform,
  profile,
  followedArtists,
  error,
  isLoading = false,
  isReconnecting = false,
  onReconnect,
  reconnectLabel,
  externalLinkLabel,
  showFollowedArtists = true,
  maxArtistBadges = 5,
  footer,
  hideWhenNotConnected = true,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  collapsible = true,
  className,
  ...props
}: PlatformProfileCardProps) {
  const [internalCollapsed, setInternalCollapsed] =
    React.useState(defaultCollapsed);
  const isCollapsed = controlledCollapsed ?? internalCollapsed;

  const handleToggleCollapse = () => {
    const newValue = !isCollapsed;
    setInternalCollapsed(newValue);
    onCollapsedChange?.(newValue);
  };

  const normalizedPlatform = platform.toLowerCase().replace(/[\s-]/g, '_');
  const platformLabel = getPlatformLabel(platform);
  const hasProviderIcon = isSupportedProvider(normalizedPlatform);
  const connectionStatus = deriveConnectionStatus(isLoading, error, profile);

  // Loading state
  if (isLoading) {
    return (
      <PlatformProfileCardSkeleton
        platform={platform}
        className={className}
        {...props}
      />
    );
  }

  // Hide card if not connected and hideWhenNotConnected is true
  if (error?.code === 'NOT_CONNECTED' && hideWhenNotConnected) {
    return null;
  }

  // Error state
  if (error && !profile) {
    const errorMessage =
      error.code === 'TOKEN_EXPIRED'
        ? `Your ${platformLabel} connection has expired.`
        : error.message || `Unable to load ${platformLabel} profile.`;

    return (
      <Card className={cn('border-destructive/50', className)} {...props}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasProviderIcon ? (
                <ProviderIcon
                  provider={normalizedPlatform as Provider}
                  color="white"
                />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
              <CardTitle className="text-base">{platformLabel}</CardTitle>
            </div>
            <ProviderSyncStatus status={connectionStatus} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          {onReconnect && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReconnect}
              disabled={isReconnecting}
              className="w-full"
            >
              <RefreshCw
                className={cn('h-4 w-4 mr-2', isReconnecting && 'animate-spin')}
              />
              {isReconnecting
                ? 'Reconnecting...'
                : reconnectLabel || `Reconnect ${platformLabel}`}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // No profile data
  if (!profile) {
    return null;
  }

  const displayName =
    profile.displayName ?? profile.username ?? `${platformLabel} User`;
  const externalUrl =
    profile.externalUrl ??
    (profile.username
      ? getDefaultExternalUrl(normalizedPlatform, profile.username)
      : null);

  // External link button component (reused in both states)
  const ExternalLinkButton = externalUrl ? (
    <Button variant="outline" size="sm" asChild>
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2"
      >
        {externalLinkLabel || `View on ${platformLabel}`}
        <ExternalLink className="size-4" />
      </a>
    </Button>
  ) : null;

  // Collapsed state - compact single row
  if (collapsible && isCollapsed) {
    return (
      <Card className={className} {...props}>
        <div className="flex items-center justify-between gap-3 p-4">
          {/* Left side: Icon, Name, Status */}
          <div className="flex items-center gap-3 min-w-0">
            {hasProviderIcon ? (
              <ProviderIcon
                provider={normalizedPlatform as Provider}
                color="white"
              />
            ) : (
              <User className="h-5 w-5 shrink-0" />
            )}
            <span className="font-medium truncate">{platformLabel}</span>
            <ProviderSyncStatus status={connectionStatus} />
          </div>

          {/* Right side: External link + Expand button */}
          <div className="flex items-center gap-2 shrink-0">
            {ExternalLinkButton}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleToggleCollapse}
              aria-label="Expand card"
            >
              <ChevronDown className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Expanded state - full card
  return (
    <Card className={className} {...props}>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {hasProviderIcon ? (
              <ProviderIcon
                provider={normalizedPlatform as Provider}
                color="white"
              />
            ) : (
              <User className="h-5 w-5" />
            )}
            <CardTitle>
              <h5>{platformLabel}</h5>
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <ProviderSyncStatus status={connectionStatus} />
            {profile.subscription && (
              <Badge variant="secondary" className="text-xs">
                <Crown className="h-3 w-3 mr-1" />
                {profile.subscription.type}
              </Badge>
            )}
            {collapsible && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleToggleCollapse}
                aria-label="Collapse card"
              >
                <ChevronUp className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Separator className="my-4" />
        {/* Profile Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            {profile.profileImage ? (
              <AvatarImage src={profile.profileImage.url} alt={displayName} />
            ) : null}
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-medium truncate">{displayName}</span>
            {profile.username && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <AtSign className="size-3" />
                <span className="text-xs text-muted-foreground truncate">
                  {profile.username}
                </span>
              </div>
            )}
            {profile.country && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Globe className="size-3" />
                <span className="text-xs">{profile.country}</span>
              </div>
            )}
          </div>
        </div>

        {/* Followed Artists Section */}
        {showFollowedArtists &&
          followedArtists &&
          followedArtists.artists.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="size-4" />
                  <span>Followed Artists</span>
                  {followedArtists.total !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {followedArtists.total.toLocaleString()}
                    </Badge>
                  )}
                </div>

                {/* Preview of followed artists */}
                <div className="flex flex-wrap gap-1">
                  {followedArtists.artists
                    .slice(0, maxArtistBadges)
                    .map((artist) => (
                      <Badge
                        key={artist.id ?? artist.name}
                        variant="outline"
                        className="text-xs"
                      >
                        {artist.name}
                      </Badge>
                    ))}
                  {followedArtists.hasMore && (
                    <Badge
                      variant="outline"
                      className="text-xs text-muted-foreground"
                    >
                      +more
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}
      </CardContent>

      {/* Footer */}
      {(footer || externalUrl) && (
        <CardFooter>
          {footer ?? (
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a
                href={externalUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                {externalLinkLabel || `View on ${platformLabel}`}
                <ExternalLink className="size-4" />
              </a>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Gets the default external profile URL for known platforms
 */
function getDefaultExternalUrl(
  platform: string,
  username: string
): string | null {
  const urls: Record<string, (username: string) => string> = {
    tidal: (u) => `https://tidal.com/profile/${u}`,
    spotify: (u) => `https://open.spotify.com/user/${u}`,
    apple_music: () => 'https://music.apple.com', // Apple Music doesn't have public profiles
  };

  return urls[platform]?.(username) ?? null;
}

export interface PlatformProfileCardSkeletonProps extends React.ComponentProps<
  typeof Card
> {
  /** The platform name (for header display) */
  platform?: PlatformName;
}

/**
 * Loading skeleton for PlatformProfileCard
 */
export function PlatformProfileCardSkeleton({
  platform,
  className,
  ...props
}: PlatformProfileCardSkeletonProps) {
  const platformLabel = platform ? getPlatformLabel(platform) : undefined;
  const normalizedPlatform = platform?.toLowerCase().replace(/[\s-]/g, '_');
  const hasProviderIcon = normalizedPlatform
    ? isSupportedProvider(normalizedPlatform)
    : false;

  return (
    <Card className={className} {...props}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {hasProviderIcon && normalizedPlatform ? (
            <ProviderIcon
              provider={normalizedPlatform as Provider}
              size="sm"
              color="current"
              className="text-muted-foreground"
            />
          ) : (
            <User className="h-5 w-5 text-muted-foreground" />
          )}
          {platformLabel ? (
            <CardTitle className="text-base">{platformLabel}</CardTitle>
          ) : (
            <Skeleton className="h-5 w-16" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
