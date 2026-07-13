'use client';

import * as React from 'react';
import { Button, cn } from '@scilent-one/ui';
import { X } from 'lucide-react';
import { AlbumArtwork } from '../album/AlbumArtwork';
import type { SelectedMusicSubject } from './MusicSubjectPicker';

export interface ReviewSubjectPreviewProps {
  subject: SelectedMusicSubject;
  onChange?: () => void;
  onClear?: () => void;
  className?: string;
}

export function ReviewSubjectPreview({
  subject,
  onChange,
  onClear,
  className,
}: ReviewSubjectPreviewProps) {
  const subtitle = subject.type === 'TRACK' ? 'Track' : 'Release';

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-muted/30 p-3',
        className
      )}
    >
      <AlbumArtwork
        src={subject.artworkUrl}
        alt={subject.title}
        size="md"
        rounded="md"
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{subject.title}</p>
        <p className="text-sm text-muted-foreground truncate">
          {subject.artistLabel}
          {subtitle ? ` · ${subtitle}` : ''}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        {onChange ? (
          <Button type="button" size="sm" variant="outline" onClick={onChange}>
            Change
          </Button>
        ) : null}
        {onClear ? (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onClear}
            aria-label="Remove attached music"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
