// Types and Schemas
export {
  // Schemas
  ProviderSourceSchema,
  HarmonizedArtistCreditSchema,
  HarmonizedTrackSchema,
  ReleaseTypeSchema,
  ReleaseStatusSchema,
  ArtworkTypeSchema,
  PartialDateSchema,
  HarmonizedReleaseSchema,
  ArtistTypeSchema,
  HarmonizedArtistSchema,
  // Types
  type ProviderSource,
  type HarmonizedArtistCredit,
  type HarmonizedTrack,
  type ReleaseType,
  type ReleaseStatus,
  type ArtworkType,
  type PartialDate,
  type HarmonizedRelease,
  type ArtistType,
  type HarmonizedArtist,
} from "./types";

// Utility functions
export {
  formatDuration,
  formatPartialDate,
  formatArtistCredits,
  getPrimaryArtistName,
  formatTrackPosition,
  getFrontArtworkUrl,
} from "./utils";

// Common components
export {
  PlatformBadge,
  PlatformBadgeList,
  MetadataTable,
  MetadataGrid,
  MetadataTableSkeleton,
  GridSkeleton,
  ListSkeleton,
  HeroSkeleton,
  PageSkeleton,
  InlineSkeleton,
  type PlatformName,
  type PlatformBadgeProps,
  type PlatformBadgeListProps,
  type MetadataItem,
  type MetadataTableProps,
  type MetadataGridProps,
  type MetadataTableSkeletonProps,
  type GridSkeletonProps,
  type ListSkeletonProps,
  type HeroSkeletonProps,
  type PageSkeletonProps,
  type InlineSkeletonProps,
} from "./components/common";

// Track components
export {
  TrackArtwork,
  TrackCard,
  TrackCardSkeleton,
  TrackList,
  TrackListSkeleton,
  TrackDetails,
  TrackDetailsSkeleton,
  type TrackArtworkProps,
  type TrackCardProps,
  type TrackListProps,
  type TrackListSkeletonProps,
  type TrackDetailsProps,
} from "./components/track";

// Artist components
export {
  ArtistCard,
  ArtistCardSkeleton,
  ArtistHeader,
  ArtistHeaderSkeleton,
  ArtistDiscography,
  ArtistDiscographySkeleton,
  type ArtistCardProps,
  type ArtistHeaderProps,
  type ArtistDiscographyProps,
  type ArtistDiscographySkeletonProps,
} from "./components/artist";

// Album components
export {
  AlbumArtwork,
  AlbumArtworkSkeleton,
  AlbumCard,
  AlbumCardSkeleton,
  AlbumTrackList,
  AlbumTrackListSkeleton,
  AlbumDetails,
  AlbumDetailsSkeleton,
  type AlbumArtworkProps,
  type AlbumArtworkSkeletonProps,
  type AlbumCardProps,
  type AlbumTrackListProps,
  type AlbumTrackListSkeletonProps,
  type AlbumDetailsProps,
} from "./components/album";
