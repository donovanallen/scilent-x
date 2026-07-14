'use client';

import * as React from 'react';
import { Badge, cn } from '@scilent-one/ui';
import type { EditorMention } from '@scilent-one/ui';
import { Disc3, Music2, User } from 'lucide-react';
import type { SelectedMusicSubject } from './MusicSubjectPicker';

export interface ReviewTagsToolbarProps {
  subject: SelectedMusicSubject;
  artistMentions?: EditorMention[];
  className?: string;
}

/**
 * Non-interactive, auto-generated tag pills for a review: the attached
 * subject's artist and track/release name, plus any artist mentions added in
 * the review body. Purely presentational for now (no click behaviour).
 */
export function ReviewTagsToolbar({
  subject,
  artistMentions = [],
  className,
}: ReviewTagsToolbarProps) {
  const isTrack = subject.type === 'TRACK';
  const subjectArtist = subject.artistLabel.trim();

  // Skip artist mentions that duplicate the subject's primary artist.
  const seen = new Set<string>();
  const uniqueArtistMentions = artistMentions.filter((mention) => {
    const label = mention.label.trim();
    if (!label) return false;
    const key = label.toLowerCase();
    if (key === subjectArtist.toLowerCase()) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <div
      className={cn('flex flex-wrap items-center gap-1.5', className)}
      role="list"
      aria-label="Review tags"
    >
      {subjectArtist ? (
        <Badge variant="secondary" className="gap-1" role="listitem">
          <User aria-hidden="true" />
          {subjectArtist}
        </Badge>
      ) : null}
      <Badge variant="secondary" className="gap-1" role="listitem">
        {isTrack ? <Music2 aria-hidden="true" /> : <Disc3 aria-hidden="true" />}
        {subject.title}
      </Badge>
      {uniqueArtistMentions.map((mention) => (
        <Badge
          key={`${mention.id}:${mention.label}`}
          variant="outline"
          className="gap-1"
          role="listitem"
        >
          <User aria-hidden="true" />
          {mention.label}
        </Badge>
      ))}
    </div>
  );
}
