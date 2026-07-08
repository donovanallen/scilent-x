'use client';

import * as React from 'react';
import { PostCard, type PostCardProps, Badge, cn } from '@scilent-one/ui';
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

  return (
    <div className={cn('rounded-lg border bg-card overflow-hidden', className)}>
      <button
        type="button"
        className={cn(
          'flex w-full items-center gap-3 border-b bg-muted/20 p-3 text-left transition-colors',
          onSubjectClick && 'hover:bg-muted/40'
        )}
        onClick={onSubjectClick}
        disabled={!onSubjectClick}
      >
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
      </button>

      <PostCard
        {...postCardProps}
        className="border-0 rounded-none shadow-none"
      />
    </div>
  );
}
