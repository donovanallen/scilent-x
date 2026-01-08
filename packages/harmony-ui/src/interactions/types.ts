import type { ComponentType, ReactNode } from 'react';
import type {
  HarmonizedTrack,
  HarmonizedRelease,
  HarmonizedArtist,
} from '../types';

/**
 * Entity types supported by the interaction system
 */
export type EntityType = 'track' | 'album' | 'artist';

/**
 * Types of provider actions available in context menus
 */
export type ProviderActionType =
  | 'like'
  | 'save'
  | 'follow'
  | 'add_to_playlist'
  | 'open_external';

/**
 * Known streaming/music providers
 */
export type ProviderName =
  | 'spotify'
  | 'tidal'
  | 'apple_music'
  | 'youtube_music'
  | 'deezer'
  | 'amazon_music'
  | string;

/**
 * Individual provider action definition
 */
export interface ProviderAction<T extends HarmonizedEntity = HarmonizedEntity> {
  /** Unique identifier for this action */
  id: string;
  /** The provider this action is for (e.g., 'spotify', 'tidal') */
  provider: ProviderName;
  /** Type of action */
  actionType: ProviderActionType;
  /** Display label for the action */
  label: string;
  /** Optional icon component */
  icon?: ComponentType<{ className?: string }>;
  /** Async handler for the action */
  onAction: (entity: T) => Promise<void>;
  /** Whether the action is disabled */
  disabled?: boolean;
  /** Whether this action is currently loading */
  loading?: boolean;
}

/**
 * Provider actions organized by entity type
 */
export interface ProviderActions {
  track?: ProviderAction<HarmonizedTrack>[];
  album?: ProviderAction<HarmonizedRelease>[];
  artist?: ProviderAction<HarmonizedArtist>[];
}

/**
 * Describes a connected provider and its capabilities
 */
export interface EnabledProvider {
  /** Provider identifier */
  name: ProviderName;
  /** Display name for the provider */
  displayName: string;
  /** Whether the user is currently connected/authenticated */
  connected: boolean;
  /** What actions this provider supports */
  capabilities: {
    /** Can save/like tracks */
    canSaveTracks?: boolean;
    /** Can save/like albums */
    canSaveAlbums?: boolean;
    /** Can follow artists */
    canFollowArtists?: boolean;
    /** Can add to playlists */
    canAddToPlaylist?: boolean;
    /** Can open external links */
    canOpenExternal?: boolean;
  };
}

/**
 * Platform configuration for interaction behaviors
 */
export type Platform = 'web' | 'mobile' | 'auto';

/**
 * Union type for all harmonized entities
 */
export type HarmonizedEntity =
  | HarmonizedTrack
  | HarmonizedRelease
  | HarmonizedArtist;

/**
 * Menu action definition for context/dropdown menus
 */
export interface MenuAction {
  /** Unique identifier for the action */
  id: string;
  /** Display label for the action */
  label: string;
  /** Optional icon component */
  icon?: ComponentType<{ className?: string }>;
  /** Navigation href (mutually exclusive with onClick) */
  href?: string;
  /** Click handler (mutually exclusive with href) */
  onClick?: () => void;
  /** Whether the action is disabled */
  disabled?: boolean;
  /** Whether this is a destructive action */
  destructive?: boolean;
}

/**
 * Preview content modes
 */
export type PreviewMode = 'mini' | 'full' | 'links';

/**
 * Preview content configuration - can be a preset mode or a custom component
 */
export type PreviewContent = PreviewMode | ComponentType<EntityPreviewContentProps>;

/**
 * Props passed to custom preview content components
 */
export interface EntityPreviewContentProps {
  entityType: EntityType;
  entity: HarmonizedEntity;
}

/**
 * Main configuration for the Harmony Interaction Provider
 */
export interface HarmonyInteractionConfig {
  /**
   * Platform to configure interaction behavior for
   * - 'web': Uses right-click context menus and hover previews
   * - 'mobile': Uses long-press menus and tap-to-preview popovers
   * - 'auto': Auto-detects using useIsMobile hook
   * @default 'auto'
   */
  platform?: Platform;

  /**
   * Whether context menus are enabled
   * @default true
   */
  enableContextMenu?: boolean;

  /**
   * Whether hover previews are enabled (web only)
   * @default true
   */
  enableHoverPreview?: boolean;

  /**
   * Delay in milliseconds before showing hover preview
   * @default 300
   */
  hoverDelay?: number;

  /**
   * Callback for navigating to entity detail views
   */
  onNavigate?: (entityType: EntityType, entity: HarmonizedEntity) => void;

  /**
   * Callback for opening external platform links
   */
  onOpenExternal?: (url: string, platform: string) => void;

  /**
   * Callback for copying entity link/share
   */
  onCopyLink?: (entity: HarmonizedEntity, entityType: EntityType) => void;

  /**
   * Callback for viewing entity credits/metadata
   */
  onViewCredits?: (entity: HarmonizedEntity, entityType: EntityType) => void;

  /**
   * Custom menu items per entity type
   * These are appended to the default menu items
   */
  customMenuItems?: Partial<Record<EntityType, MenuAction[]>>;

  /**
   * Provider-specific actions per entity type
   * These are rendered in a dedicated "Provider Actions" section of context menus
   * Separate from customMenuItems to allow proper grouping and provider-aware UI
   */
  providerActions?: ProviderActions;

  /**
   * List of enabled/connected providers
   * Used to determine which provider actions to show
   */
  enabledProviders?: EnabledProvider[];

  /**
   * Preview content mode per entity type
   * - 'mini': Key stats, small artwork, quick links
   * - 'full': Expanded card with more metadata
   * - 'links': Just platform icons/links
   * - Custom component: Consumer provides their own
   */
  previewContent?: Partial<Record<EntityType, PreviewContent>>;
}

/**
 * Internal context value with resolved configuration
 */
export interface HarmonyInteractionContextValue extends Required<Omit<HarmonyInteractionConfig, 'onNavigate' | 'onOpenExternal' | 'onCopyLink' | 'onViewCredits' | 'customMenuItems' | 'providerActions' | 'enabledProviders' | 'previewContent'>> {
  /** Whether interactions are enabled (provider is present) */
  enabled: boolean;
  /** Resolved platform (auto is replaced with actual value) */
  platform: 'web' | 'mobile';
  
  // Optional callbacks
  onNavigate?: HarmonyInteractionConfig['onNavigate'];
  onOpenExternal?: HarmonyInteractionConfig['onOpenExternal'];
  onCopyLink?: HarmonyInteractionConfig['onCopyLink'];
  onViewCredits?: HarmonyInteractionConfig['onViewCredits'];
  customMenuItems?: HarmonyInteractionConfig['customMenuItems'];
  providerActions?: HarmonyInteractionConfig['providerActions'];
  enabledProviders?: HarmonyInteractionConfig['enabledProviders'];
  previewContent?: HarmonyInteractionConfig['previewContent'];
}

/**
 * Props for the InteractiveWrapper component
 */
export interface InteractiveWrapperProps {
  /** Type of entity being wrapped */
  entityType: EntityType;
  /** The entity data */
  entity: HarmonizedEntity;
  /** Children to wrap with interaction behaviors */
  children: ReactNode;
  /** Additional class name */
  className?: string;
  /** Whether to disable interactions for this wrapper */
  disabled?: boolean;
  /** 
   * Side to position the hover preview 
   * @default 'right'
   */
  previewSide?: 'top' | 'right' | 'bottom' | 'left';
  /**
   * Alignment for the hover preview
   * @default 'start'
   */
  previewAlign?: 'start' | 'center' | 'end';
}
