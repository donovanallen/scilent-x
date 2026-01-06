import type {
  HarmonizedTrack,
  HarmonizedArtist,
  HarmonizedRelease,
} from "../types";

// Placeholder image URLs using placehold.co
export const PLACEHOLDER_ALBUM_ART = "https://placehold.co/640x640/1a1a2e/eee?text=Album";
export const PLACEHOLDER_ALBUM_ART_SM = "https://placehold.co/300x300/1a1a2e/eee?text=Album";
export const PLACEHOLDER_ARTIST_IMAGE = "https://placehold.co/640x640/2d2d44/eee?text=Artist";

export const mockArtistCredit = {
  name: "Radiohead",
  externalIds: { spotify: "4Z8W4fKeB5YxbusRsdQVPb" },
};

export const mockArtistCredit2 = {
  name: "Thom Yorke",
  externalIds: { spotify: "4CvTDPKA6W06DRfBnZKrau" },
};

export const mockTrack: HarmonizedTrack = {
  isrc: "GBAYE0000447",
  title: "Everything In Its Right Place",
  position: 1,
  duration: 251000,
  artists: [mockArtistCredit],
  externalIds: {
    spotify: "3bLZ40X6XlhgD4wF2FoC3V",
    musicbrainz: "d7d3c5c8-4f3e-4d5a-8c7e-1a2b3c4d5e6f",
  },
  sources: [
    {
      provider: "spotify",
      id: "3bLZ40X6XlhgD4wF2FoC3V",
      fetchedAt: new Date("2024-01-15"),
    },
    {
      provider: "musicbrainz",
      id: "d7d3c5c8-4f3e-4d5a-8c7e-1a2b3c4d5e6f",
      fetchedAt: new Date("2024-01-14"),
    },
  ],
};

export const mockTrackExplicit: HarmonizedTrack = {
  ...mockTrack,
  isrc: "GBAYE0000448",
  title: "The National Anthem",
  position: 2,
  duration: 350000,
  explicit: true,
  credits: [
    { name: "Thom Yorke", role: "Vocals" },
    { name: "Jonny Greenwood", role: "Guitar" },
    { name: "Ed O'Brien", role: "Guitar" },
    { name: "Colin Greenwood", role: "Bass" },
    { name: "Phil Selway", role: "Drums" },
  ],
  externalIds: {
    spotify: "2UmyXUGhqiGPq3GHZxhFg2",
  },
};

export const mockTracks: HarmonizedTrack[] = [
  mockTrack,
  mockTrackExplicit,
  {
    isrc: "GBAYE0000449",
    title: "How to Disappear Completely",
    position: 3,
    duration: 346000,
    artists: [mockArtistCredit],
    externalIds: { spotify: "3HFPr6gOyBPpq6eV2Jb6Q6" },
    sources: [
      { provider: "spotify", id: "3HFPr6gOyBPpq6eV2Jb6Q6", fetchedAt: new Date() },
    ],
  },
  {
    isrc: "GBAYE0000450",
    title: "Treefingers",
    position: 4,
    duration: 226000,
    artists: [mockArtistCredit],
    externalIds: { spotify: "5YXr4AGfUQpLSLOdP4NM4v" },
    sources: [
      { provider: "spotify", id: "5YXr4AGfUQpLSLOdP4NM4v", fetchedAt: new Date() },
    ],
  },
  {
    isrc: "GBAYE0000451",
    title: "Optimistic",
    position: 5,
    duration: 303000,
    artists: [mockArtistCredit],
    externalIds: { spotify: "1xc3pWWQn3Vwk2LyNXt5P9" },
    sources: [
      { provider: "spotify", id: "1xc3pWWQn3Vwk2LyNXt5P9", fetchedAt: new Date() },
    ],
  },
];

export const mockArtist: HarmonizedArtist = {
  name: "Radiohead",
  nameNormalized: "radiohead",
  sortName: "Radiohead",
  disambiguation: "UK rock band",
  type: "group",
  country: "GB",
  beginDate: { year: 1985 },
  aliases: ["On a Friday"],
  genres: ["Alternative Rock", "Art Rock", "Electronic", "Experimental"],
  externalIds: {
    spotify: "4Z8W4fKeB5YxbusRsdQVPb",
    musicbrainz: "a74b1b7f-71a5-4011-9441-d0b5e4122711",
  },
  sources: [
    {
      provider: "spotify",
      id: "4Z8W4fKeB5YxbusRsdQVPb",
      fetchedAt: new Date("2024-01-15"),
    },
    {
      provider: "musicbrainz",
      id: "a74b1b7f-71a5-4011-9441-d0b5e4122711",
      fetchedAt: new Date("2024-01-14"),
    },
  ],
  mergedAt: new Date("2024-01-15"),
  confidence: 0.95,
};

export const mockSoloArtist: HarmonizedArtist = {
  name: "Thom Yorke",
  sortName: "Yorke, Thom",
  disambiguation: "Radiohead frontman",
  type: "person",
  country: "GB",
  beginDate: { year: 1968, month: 10, day: 7 },
  genres: ["Electronic", "Art Rock", "Experimental"],
  externalIds: {
    spotify: "4CvTDPKA6W06DRfBnZKrau",
  },
  sources: [
    {
      provider: "spotify",
      id: "4CvTDPKA6W06DRfBnZKrau",
      fetchedAt: new Date(),
    },
  ],
  mergedAt: new Date(),
  confidence: 0.92,
};

export const mockRelease: HarmonizedRelease = {
  gtin: "0724352771752",
  title: "Kid A",
  artists: [mockArtistCredit],
  releaseDate: { year: 2000, month: 10, day: 2 },
  releaseType: "album",
  status: "official",
  labels: [{ name: "Parlophone", catalogNumber: "CDKIDA1" }],
  releaseCountry: "GB",
  media: [
    {
      format: "CD",
      position: 1,
      tracks: mockTracks,
    },
  ],
  artwork: [
    {
      url: PLACEHOLDER_ALBUM_ART,
      type: "front",
      width: 640,
      height: 640,
      provider: "placeholder",
    },
  ],
  genres: ["Alternative Rock", "Electronic", "Art Rock"],
  tags: ["2000s", "experimental", "british"],
  externalIds: {
    spotify: "6GjwtEZcfenmOf6l18N7T7",
    musicbrainz: "b1a9c0e9-d987-4042-ae91-78d6a3267d69",
  },
  sources: [
    {
      provider: "spotify",
      id: "6GjwtEZcfenmOf6l18N7T7",
      fetchedAt: new Date("2024-01-15"),
    },
  ],
  mergedAt: new Date("2024-01-15"),
  confidence: 0.98,
};

export const mockSingle: HarmonizedRelease = {
  title: "Creep",
  artists: [mockArtistCredit],
  releaseDate: { year: 1992, month: 9, day: 21 },
  releaseType: "single",
  status: "official",
  labels: [{ name: "Parlophone" }],
  media: [
    {
      position: 1,
      tracks: [
        {
          title: "Creep",
          position: 1,
          duration: 238000,
          artists: [mockArtistCredit],
          externalIds: { spotify: "70LcF31zb1H0PyJoS1Sx1r" },
          sources: [
            { provider: "spotify", id: "70LcF31zb1H0PyJoS1Sx1r", fetchedAt: new Date() },
          ],
        },
      ],
    },
  ],
  genres: ["Alternative Rock"],
  externalIds: { spotify: "2w1YJXWMIco6EBf0CovvVN" },
  sources: [
    { provider: "spotify", id: "2w1YJXWMIco6EBf0CovvVN", fetchedAt: new Date() },
  ],
  mergedAt: new Date(),
  confidence: 0.96,
};

export const mockEP: HarmonizedRelease = {
  title: "My Iron Lung EP",
  artists: [mockArtistCredit],
  releaseDate: { year: 1994, month: 9, day: 26 },
  releaseType: "ep",
  status: "official",
  media: [
    {
      position: 1,
      tracks: [
        {
          title: "My Iron Lung",
          position: 1,
          duration: 275000,
          artists: [mockArtistCredit],
          externalIds: { spotify: "1" },
          sources: [{ provider: "spotify", id: "1", fetchedAt: new Date() }],
        },
        {
          title: "The Trickster",
          position: 2,
          duration: 289000,
          artists: [mockArtistCredit],
          externalIds: { spotify: "2" },
          sources: [{ provider: "spotify", id: "2", fetchedAt: new Date() }],
        },
      ],
    },
  ],
  externalIds: { spotify: "ep1" },
  sources: [{ provider: "spotify", id: "ep1", fetchedAt: new Date() }],
  mergedAt: new Date(),
  confidence: 0.94,
};

export const mockReleases: HarmonizedRelease[] = [
  mockRelease,
  {
    ...mockRelease,
    gtin: "0724353712051",
    title: "OK Computer",
    releaseDate: { year: 1997, month: 6, day: 16 },
    externalIds: { spotify: "6dVIqQ8qmQ5GBnJ9shOYGE" },
  },
  {
    ...mockRelease,
    gtin: "0724352023523",
    title: "The Bends",
    releaseDate: { year: 1995, month: 3, day: 13 },
    externalIds: { spotify: "35UJLpClj5EDrhpNIi4DFg" },
  },
  {
    ...mockRelease,
    gtin: "5099997225225",
    title: "In Rainbows",
    releaseDate: { year: 2007, month: 10, day: 10 },
    externalIds: { spotify: "7eyQXxuf2nGj9d2367Gi5f" },
  },
  mockSingle,
  mockEP,
];

export const mockDoubleAlbum: HarmonizedRelease = {
  title: "Hail to the Thief",
  artists: [mockArtistCredit],
  releaseDate: { year: 2003, month: 6, day: 9 },
  releaseType: "album",
  status: "official",
  media: [
    {
      format: "CD",
      position: 1,
      tracks: mockTracks.slice(0, 3).map((t, i) => ({
        ...t,
        position: i + 1,
        discNumber: 1,
      })),
    },
    {
      format: "CD",
      position: 2,
      tracks: mockTracks.slice(0, 2).map((t, i) => ({
        ...t,
        position: i + 1,
        discNumber: 2,
        isrc: `DISC2-${i}`,
        externalIds: { spotify: `disc2-${i}` },
      })),
    },
  ],
  externalIds: { spotify: "5mzoI3VH0ZWk1pLFR6RoYy" },
  sources: [
    { provider: "spotify", id: "5mzoI3VH0ZWk1pLFR6RoYy", fetchedAt: new Date() },
  ],
  mergedAt: new Date(),
  confidence: 0.97,
};
