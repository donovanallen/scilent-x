import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReviewCard } from './ReviewCard';
import { ReviewSubjectPreview } from './ReviewSubjectPreview';
import { ReviewComposer } from './ReviewComposer';
import { mockRelease, mockTrack } from '../../__stories__/mock-data';
import { getPrimaryArtistName } from '../../utils';
import { STORY_ALBUM_ART, STORY_ALBUM_ART_ALT } from './__storybook-art';
import { MusicSubjectPicker } from './MusicSubjectPicker';
import { AlbumListItem } from '../album/AlbumListItem';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Button,
} from '@scilent-one/ui';

const mockAuthor = {
  id: 'user_1',
  name: 'Ada Lovelace',
  username: 'ada',
  avatarUrl: null,
  image: null,
};

const albumSubject = {
  type: 'RELEASE' as const,
  title: mockRelease.title,
  artistLabel: getPrimaryArtistName(mockRelease.artists),
  artworkUrl: STORY_ALBUM_ART,
  releaseDate: '2000-10-02',
  gtin: mockRelease.gtin ?? '0724382774923',
};

const trackSubject = {
  type: 'TRACK' as const,
  title: mockTrack.title,
  artistLabel: getPrimaryArtistName(mockTrack.artists),
  artworkUrl: STORY_ALBUM_ART_ALT,
  isrc: mockTrack.isrc,
};

const meta: Meta = {
  title: 'Review',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

export const ReviewCardAlbum: StoryObj = {
  name: 'Review Card — Album',
  render: () => (
    <div className="w-[560px]">
      <ReviewCard
        id="review_1"
        content="Kid A still feels like a transmission from another decade. The textures, the restraint, the anxiety — it rewards every re-listen."
        contentHtml="<p>Kid A still feels like a transmission from another decade. The textures, the restraint, the anxiety — it rewards every re-listen.</p>"
        author={mockAuthor}
        createdAt={new Date(Date.now() - 1000 * 60 * 60 * 2)}
        likesCount={24}
        commentsCount={5}
        repostsCount={2}
        isLiked={false}
        isReposted={false}
        reviewSubject={albumSubject}
        onSubjectClick={() => {}}
        onLike={() => {}}
        onComment={() => {}}
      />
    </div>
  ),
};

export const ReviewCardTrack: StoryObj = {
  name: 'Review Card — Track',
  render: () => (
    <div className="w-[560px]">
      <ReviewCard
        id="review_2"
        content="That opening synth wash hits differently every time. Short, sharp, perfect."
        author={mockAuthor}
        createdAt={new Date(Date.now() - 1000 * 60 * 30)}
        likesCount={11}
        commentsCount={1}
        repostsCount={0}
        reviewSubject={trackSubject}
        onSubjectClick={() => {}}
      />
    </div>
  ),
};

export const SubjectPreview: StoryObj = {
  name: 'Attached Subject Preview',
  render: () => (
    <div className="w-[560px] space-y-4">
      <ReviewSubjectPreview
        subject={{
          type: 'RELEASE',
          title: mockRelease.title,
          artistLabel: getPrimaryArtistName(mockRelease.artists),
          artworkUrl: STORY_ALBUM_ART,
          snapshot: mockRelease,
          gtin: mockRelease.gtin,
        }}
        onChange={() => {}}
        onClear={() => {}}
      />
      <ReviewSubjectPreview
        subject={{
          type: 'TRACK',
          title: mockTrack.title,
          artistLabel: getPrimaryArtistName(mockTrack.artists),
          artworkUrl: STORY_ALBUM_ART_ALT,
          snapshot: mockTrack,
          isrc: mockTrack.isrc,
        }}
        onChange={() => {}}
      />
    </div>
  ),
};

export const ComposerWithSubject: StoryObj = {
  name: 'Review Composer',
  render: () => (
    <div className="w-[560px]">
      <ReviewComposer
        user={mockAuthor}
        initialSubject={{
          type: 'RELEASE',
          title: mockRelease.title,
          artistLabel: getPrimaryArtistName(mockRelease.artists),
          artworkUrl: STORY_ALBUM_ART,
          snapshot: mockRelease,
          gtin: mockRelease.gtin,
        }}
        onSubmit={async () => {}}
      />
    </div>
  ),
};

export const MusicPickerOpen: StoryObj = {
  name: 'Music Subject Picker',
  render: () => (
    <div className="relative h-[640px] w-[640px] bg-background">
      <Dialog open onOpenChange={() => {}}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Attach music</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2">
            <Button type="button" size="sm">
              Releases
            </Button>
            <Button type="button" size="sm" variant="outline">
              Tracks
            </Button>
          </div>
          <Input defaultValue="kid a" placeholder="Search albums…" />
          <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
            <AlbumListItem
              release={{
                ...mockRelease,
                artwork: [
                  {
                    url: STORY_ALBUM_ART,
                    type: 'front',
                    provider: 'storybook',
                  },
                ],
              }}
              interactive={false}
            />
            <AlbumListItem
              release={{
                ...mockRelease,
                title: 'Amnesiac',
                gtin: '0724353274921',
                artwork: [
                  {
                    url: STORY_ALBUM_ART_ALT,
                    type: 'front',
                    provider: 'storybook',
                  },
                ],
              }}
              interactive={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  ),
};

export const ComposerEmpty: StoryObj = {
  name: 'Review Composer — Empty',
  render: () => (
    <div className="w-[560px]">
      <ReviewComposer user={mockAuthor} onSubmit={async () => {}} />
    </div>
  ),
};

export const FeedMix: StoryObj = {
  name: 'Feed with Reviews',
  render: () => (
    <div className="w-[560px] space-y-4">
      <ReviewCard
        id="review_feed_1"
        content="A landmark record. The production still sounds futuristic twenty-five years later."
        author={mockAuthor}
        createdAt={new Date(Date.now() - 1000 * 60 * 60 * 5)}
        likesCount={48}
        commentsCount={12}
        repostsCount={7}
        reviewSubject={albumSubject}
        onSubjectClick={() => {}}
      />
      <ReviewCard
        id="review_feed_2"
        content="Underrated deep cut. That bass line does all the storytelling."
        author={{
          ...mockAuthor,
          name: 'Nina Simone Fan',
          username: 'nina',
        }}
        createdAt={new Date(Date.now() - 1000 * 60 * 20)}
        likesCount={9}
        commentsCount={2}
        repostsCount={1}
        isLiked
        reviewSubject={trackSubject}
        onSubjectClick={() => {}}
      />
    </div>
  ),
};
