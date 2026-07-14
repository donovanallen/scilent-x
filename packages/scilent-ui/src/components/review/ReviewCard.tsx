'use client';

import * as React from 'react';
import { PostCard, type PostCardProps, Badge, cn } from '@scilent-one/ui';
import { Lock } from 'lucide-react';
import { AlbumArtwork } from '../album/AlbumArtwork';

export interface ReviewSubjectDisplay {
  type: 'RELEASE' | 'TRACK';
  title: string;
  artistLabel?: string | null;
  artworkUrl?: string | null;
  releaseDate?: string | null;
  gtin?: string | null;
  isrc?: string | null;
}

export interface ReviewCardProps extends PostCardProps {
  reviewSubject: ReviewSubjectDisplay;
  onSubjectClick?: () => void;
}

export function ReviewCard({
  reviewSubject,
  onSubjectClick,
  className,
  ...postCardProps
}: ReviewCardProps) {
  const subjectLabel =
    reviewSubject.type === 'TRACK' ? 'Track review' : 'Album review';
  const isSubjectInteractive = Boolean(onSubjectClick);
  const isPrivate = postCardProps.visibility === 'PRIVATE';

  const subjectContent = (
    <>
      <AlbumArtwork
        src={reviewSubject.artworkUrl ?? undefined}
        alt={reviewSubject.title}
        size="md"
        rounded="md"
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] uppercase">
            {subjectLabel}
          </Badge>
        </div>
        <p className="font-medium truncate">{reviewSubject.title}</p>
        <p className="text-sm text-muted-foreground truncate">
          {reviewSubject.artistLabel ?? 'Unknown Artist'}
          {reviewSubject.releaseDate
            ? ` · ${reviewSubject.releaseDate.slice(0, 4)}`
            : ''}
        </p>
      </div>
    </>
  );

  return (
    <div
      className={cn(
        'relative rounded-lg border bg-card overflow-hidden',
        isPrivate && 'border-dashed bg-muted/30',
        className
      )}
    >
      {isPrivate ? (
        <Badge
          variant="outline"
          className="pointer-events-none absolute right-2 top-2 z-10 gap-1 bg-background/80 text-[10px] uppercase text-muted-foreground backdrop-blur-sm"
        >
          <Lock className="h-3 w-3" />
          Private
        </Badge>
      ) : null}

      {isSubjectInteractive ? (
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-3 border-b bg-muted/20 p-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={(event) => {
            event.stopPropagation();
            onSubjectClick?.();
          }}
        >
          {subjectContent}
        </button>
      ) : (
        <div className="flex w-full cursor-default items-center gap-3 border-b bg-muted/20 p-3 text-left">
          {subjectContent}
        </div>
      )}

      <PostCard
        {...postCardProps}
        className="border-0 rounded-none shadow-none"
      />
    </div>
  );
}
