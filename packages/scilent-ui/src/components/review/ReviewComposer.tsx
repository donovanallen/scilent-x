'use client';

import * as React from 'react';
import { PostForm } from '@scilent-one/ui';
import type { MentionSuggestion } from '@scilent-one/ui';
import { Button } from '@scilent-one/ui';
import { Music2 } from 'lucide-react';

import {
  MusicSubjectPicker,
  type SelectedMusicSubject,
} from './MusicSubjectPicker';
import { ReviewSubjectPreview } from './ReviewSubjectPreview';

export interface ReviewComposerProps {
  user?: {
    name?: string | null;
    username?: string | null;
    avatarUrl?: string | null;
    image?: string | null;
  };
  initialSubject?: SelectedMusicSubject;
  isSubmitting?: boolean;
  onSubmit: (
    content: string,
    contentHtml: string,
    subject: SelectedMusicSubject
  ) => void | Promise<void>;
  onMentionQuery?: (query: string) => Promise<MentionSuggestion[]>;
  onArtistMentionQuery?: (query: string) => Promise<MentionSuggestion[]>;
  className?: string;
}

export function ReviewComposer({
  user,
  initialSubject,
  isSubmitting = false,
  onSubmit,
  onMentionQuery,
  onArtistMentionQuery,
  className,
}: ReviewComposerProps) {
  const [subject, setSubject] = React.useState<SelectedMusicSubject | null>(
    initialSubject ?? null
  );
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [pendingContent, setPendingContent] = React.useState<{
    content: string;
    contentHtml: string;
  } | null>(null);

  React.useEffect(() => {
    if (initialSubject) {
      setSubject(initialSubject);
    }
  }, [initialSubject]);

  const handlePostSubmit = async (content: string, contentHtml: string) => {
    if (!subject) {
      setPendingContent({ content, contentHtml });
      setPickerOpen(true);
      return;
    }

    await onSubmit(content, contentHtml, subject);
  };

  const handleSubjectSelect = (selected: SelectedMusicSubject) => {
    setSubject(selected);

    if (pendingContent) {
      void onSubmit(
        pendingContent.content,
        pendingContent.contentHtml,
        selected
      );
      setPendingContent(null);
    }
  };

  return (
    <div className={className}>
      {subject ? (
        <ReviewSubjectPreview
          subject={subject}
          onChange={() => setPickerOpen(true)}
          onClear={() => setSubject(null)}
          className="mb-3"
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          className="mb-3 w-full justify-start gap-2"
          onClick={() => setPickerOpen(true)}
        >
          <Music2 className="h-4 w-4" />
          Attach album or track
        </Button>
      )}

      <PostForm
        {...(user ? { user } : {})}
        placeholder="Share your thoughts on this music…"
        isSubmitting={isSubmitting}
        onSubmit={handlePostSubmit}
        {...(onMentionQuery ? { onMentionQuery } : {})}
        {...(onArtistMentionQuery ? { onArtistMentionQuery } : {})}
      />

      <MusicSubjectPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleSubjectSelect}
        initialType={subject?.type === 'TRACK' ? 'track' : 'release'}
      />
    </div>
  );
}
