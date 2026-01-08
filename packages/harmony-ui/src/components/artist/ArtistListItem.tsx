'use client';

import type { HarmonizedArtist } from '@scilent-one/harmony-engine';
import { Badge, cn, Skeleton } from '@scilent-one/ui';
import { ExternalLink, User } from 'lucide-react';
import { PlatformBadgeList } from '../common';
import { InteractiveWrapper } from '../../interactions/InteractiveWrapper';

export interface ArtistListItemProps {
  /** The harmonized artist data */
  artist: HarmonizedArtist;
  /** Whether to show provider badges */
  showProviders?: boolean;
  /** Use abbreviated platform badges (initials) @default true */
  abbreviatedProviders?: boolean;
  /** Whether to show external link on hover */
  showExternalLink?: boolean;
  /** Maximum number of genres to display @default 3 */
  maxGenres?: number;
  /** Whether to enable interactive features (context menu, hover preview) */
  interactive?: boolean;
  /** Side to position the hover preview @default 'right' */
  previewSide?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment for the hover preview @default 'start' */
  previewAlign?: 'start' | 'center' | 'end';
  /** Callback when the artist is clicked */
  onClick?: (artist: HarmonizedArtist) => void;
  className?: string;
}

/**
 * Artist list item component that displays artist information in a compact horizontal layout.
 * Supports interactive features like context menus and hover previews.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ArtistListItem artist={artist} />
 *
 * // With providers
 * <ArtistListItem artist={artist} showProviders />
 *
 * // Interactive with preview
 * <ArtistListItem
 *   artist={artist}
 *   interactive
 *   previewSide="bottom"
 *   showProviders
 * />
 * ```
 */
export function ArtistListItem({
  artist,
  showProviders = false,
  abbreviatedProviders = true,
  showExternalLink = true,
  maxGenres = 3,
  interactive = false,
  previewSide = 'right',
  previewAlign = 'start',
  onClick,
  className,
}: ArtistListItemProps) {
  const primarySource = artist.sources[0];
  const providers = artist.sources.map((s) => s.provider);

  const handleClick = () => {
    onClick?.(artist);
  };

  const element = (
    <div
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer',
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Artist: ${artist.name}`}
    >
      {/* Artist avatar placeholder */}
      <div className="size-14 rounded-full bg-linear-to-br from-muted to-muted/50 flex items-center justify-center shrink-0">
        <User className="size-6 text-muted-foreground/50" />
      </div>

      {/* Artist info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h5 className="truncate group-hover:text-primary transition-colors">
            {artist.name}
          </h5>
          {artist.type && (
            <Badge variant="outline" className="shrink-0 capitalize">
              {artist.type}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {artist.country && <span>{artist.country}</span>}
          {artist.disambiguation && (
            <>
              {artist.country && (
                <span className="text-muted-foreground/50">·</span>
              )}
              <span className="truncate">{artist.disambiguation}</span>
            </>
          )}
        </div>
        {artist.genres && artist.genres.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            {artist.genres.slice(0, maxGenres).map((genre) => (
              <Badge
                key={genre}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4"
              >
                {genre}
              </Badge>
            ))}
            {artist.genres.length > maxGenres && (
              <span className="text-xs text-muted-foreground">
                +{artist.genres.length - maxGenres}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Providers */}
      {showProviders && providers.length > 0 && (
        <PlatformBadgeList
          platforms={providers}
          abbreviated={abbreviatedProviders}
        />
      )}

      {/* External link */}
      {showExternalLink && primarySource?.url && (
        <a
          href={primarySource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="size-4 text-muted-foreground" />
        </a>
      )}
    </div>
  );

  if (interactive) {
    return (
      <InteractiveWrapper
        entityType="artist"
        entity={artist}
        previewSide={previewSide}
        previewAlign={previewAlign}
      >
        {element}
      </InteractiveWrapper>
    );
  }

  return element;
}

export interface ArtistListItemSkeletonProps {
  /** Whether to show provider badges skeleton */
  showProviders?: boolean;
  /** Whether to show genres skeleton */
  showGenres?: boolean;
  className?: string;
}

export function ArtistListItemSkeleton({
  showProviders = false,
  showGenres = true,
  className,
}: ArtistListItemSkeletonProps) {
  return (
    <div className={cn('flex items-center gap-4 p-3', className)}>
      <Skeleton className="size-14 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
        {showGenres && (
          <div className="flex gap-1 mt-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-14" />
          </div>
        )}
      </div>
      {showProviders && (
        <div className="flex gap-1">
          <Skeleton className="h-5 w-8" />
          <Skeleton className="h-5 w-8" />
        </div>
      )}
    </div>
  );
}
