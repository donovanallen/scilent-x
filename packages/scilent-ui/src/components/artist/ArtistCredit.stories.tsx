import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArtistCredit } from './ArtistCredit';
import type { HarmonizedArtistCredit } from '@scilent-one/harmony-engine';

// Mock artist credits for stories
const singleArtist: HarmonizedArtistCredit[] = [
  { name: 'Radiohead', externalIds: { spotify: '4Z8W4fKeB5YxbusRsdQVPb' } },
];

const twoArtists: HarmonizedArtistCredit[] = [
  { name: 'Daft Punk', externalIds: { spotify: '4tZwfgrHOc3mvqYlEYSvVi' } },
  { name: 'Pharrell Williams', externalIds: { spotify: '2RdwBSPQiwcmiDo9kixcl8' } },
];

const multipleArtists: HarmonizedArtistCredit[] = [
  { name: 'Kanye West', externalIds: { spotify: '5K4W6rqBFWDnAN6FQUkS6x' } },
  { name: 'Jay-Z', externalIds: { spotify: '3nFkdlSjzX9mRTtwJOzDYB' } },
  { name: 'Kid Cudi', externalIds: { spotify: '0fA0VVWsXO9YnASrzqfmYu' } },
  { name: 'Bon Iver', externalIds: { spotify: '4LEiUm1SRbFMgfqnQTwUbQ' } },
];

const artistsWithJoinPhrases: HarmonizedArtistCredit[] = [
  { name: 'David Bowie', joinPhrase: ' & ', externalIds: { spotify: '0oSGxfWSnnOXhD2fKuz2Gy' } },
  { name: 'Queen', externalIds: { spotify: '1dfeR4HaWDbWqFHLkxsg1d' } },
];

const artistsWithFeaturing: HarmonizedArtistCredit[] = [
  { name: 'Calvin Harris', joinPhrase: ' feat. ', externalIds: { spotify: '7CajNmpbOovFoOoasH2HaY' } },
  { name: 'Rihanna', externalIds: { spotify: '5pKCCKE2ajJHZ9KAiaK11H' } },
];

const artistsWithCreditedName: HarmonizedArtistCredit[] = [
  {
    name: 'Richard D. James',
    creditedName: 'Aphex Twin',
    externalIds: { spotify: '6kBDZFXuLrZgHnvmPu9NsG' },
  },
];

const complexCredits: HarmonizedArtistCredit[] = [
  { name: 'Mark Ronson', joinPhrase: ' feat. ', externalIds: { spotify: '3hv9jJF3adDNsBSIQDqcjp' } },
  { name: 'Bruno Mars', joinPhrase: ' & ', externalIds: { spotify: '0du5cEVh5yTK9QJze8zA0C' } },
  { name: 'Anderson .Paak', externalIds: { spotify: '3jK9MiCrA42lLAdMGUZpwa' } },
];

const manyArtists: HarmonizedArtistCredit[] = [
  { name: 'Artist 1', externalIds: {} },
  { name: 'Artist 2', externalIds: {} },
  { name: 'Artist 3', externalIds: {} },
  { name: 'Artist 4', externalIds: {} },
  { name: 'Artist 5', externalIds: {} },
  { name: 'Artist 6', externalIds: {} },
  { name: 'Artist 7', externalIds: {} },
];

const meta: Meta<typeof ArtistCredit> = {
  title: 'Artist/ArtistCredit',
  component: ArtistCredit,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    linkable: {
      control: 'boolean',
      description: 'Make artist names clickable/hoverable',
    },
    maxDisplay: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Maximum number of artists to display',
    },
  },
  args: {
    linkable: false,
    maxDisplay: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof ArtistCredit>;

export const SingleArtist: Story = {
  name: 'Single Artist',
  args: {
    artists: singleArtist,
  },
};

export const TwoArtists: Story = {
  name: 'Two Artists',
  args: {
    artists: twoArtists,
  },
};

export const MultipleArtists: Story = {
  name: 'Multiple Artists',
  args: {
    artists: multipleArtists,
  },
};

export const WithJoinPhrase: Story = {
  name: 'With Join Phrase (&)',
  args: {
    artists: artistsWithJoinPhrases,
  },
};

export const WithFeaturing: Story = {
  name: 'With Featuring',
  args: {
    artists: artistsWithFeaturing,
  },
};

export const WithCreditedName: Story = {
  name: 'With Credited Name',
  args: {
    artists: artistsWithCreditedName,
  },
};

export const ComplexCredits: Story = {
  name: 'Complex Credits (Multiple Join Phrases)',
  args: {
    artists: complexCredits,
  },
};

export const Linkable: Story = {
  name: 'Linkable (Hover Effect)',
  args: {
    artists: multipleArtists,
    linkable: true,
  },
};

export const MaxDisplay2: Story = {
  name: 'Max Display: 2',
  args: {
    artists: manyArtists,
    maxDisplay: 2,
  },
};

export const MaxDisplay3: Story = {
  name: 'Max Display: 3',
  args: {
    artists: manyArtists,
    maxDisplay: 3,
  },
};

export const MaxDisplay5: Story = {
  name: 'Max Display: 5',
  args: {
    artists: manyArtists,
    maxDisplay: 5,
  },
};

export const CustomClassName: Story = {
  name: 'Custom Styling',
  args: {
    artists: singleArtist,
    className: 'text-lg font-semibold',
  },
};

export const InContext: Story = {
  name: 'In Context (Track/Album Display)',
  render: () => (
    <div className="space-y-4 w-[300px]">
      <div className="p-3 rounded-lg border">
        <h3 className="font-medium truncate">Get Lucky</h3>
        <ArtistCredit
          artists={[
            { name: 'Daft Punk', joinPhrase: ' feat. ', externalIds: {} },
            { name: 'Pharrell Williams', joinPhrase: ' & ', externalIds: {} },
            { name: 'Nile Rodgers', externalIds: {} },
          ]}
          className="text-sm"
        />
      </div>
      <div className="p-3 rounded-lg border">
        <h3 className="font-medium truncate">Under Pressure</h3>
        <ArtistCredit artists={artistsWithJoinPhrases} className="text-sm" />
      </div>
      <div className="p-3 rounded-lg border">
        <h3 className="font-medium truncate">Collaboration Album</h3>
        <ArtistCredit
          artists={manyArtists}
          maxDisplay={3}
          className="text-sm"
        />
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div className="space-y-4 w-[400px]">
      <div>
        <p className="text-xs text-muted-foreground mb-1">Single Artist:</p>
        <ArtistCredit artists={singleArtist} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">Two Artists:</p>
        <ArtistCredit artists={twoArtists} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">With &amp; Join:</p>
        <ArtistCredit artists={artistsWithJoinPhrases} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">With Featuring:</p>
        <ArtistCredit artists={artistsWithFeaturing} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">Complex Credits:</p>
        <ArtistCredit artists={complexCredits} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">With maxDisplay=3:</p>
        <ArtistCredit artists={manyArtists} maxDisplay={3} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">Linkable:</p>
        <ArtistCredit artists={multipleArtists} linkable />
      </div>
    </div>
  ),
};
