'use client';

import * as React from 'react';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@scilent-one/ui';
import { useHarmonyInteraction } from '../provider';
import type { EntityType, HarmonizedEntity } from '../types';
import { TrackHoverPreview } from './TrackHoverPreview';
import { AlbumHoverPreview } from './AlbumHoverPreview';
import { ArtistHoverPreview } from './ArtistHoverPreview';

export interface EntityPreviewProps {
  /** Type of entity */
  entityType: EntityType;
  /** The entity data */
  entity: HarmonizedEntity;
  /** Child element to wrap as the preview trigger */
  children: React.ReactNode;
  /** Whether the preview is disabled */
  disabled?: boolean;
}

/**
 * Platform-adaptive preview wrapper that switches between HoverCard (web)
 * and Popover with tap trigger (mobile) based on the provider configuration.
 * 
 * Renders the appropriate entity-specific preview content based on entityType.
 */
export function EntityPreview({
  entityType,
  entity,
  children,
  disabled = false,
}: EntityPreviewProps) {
  const interaction = useHarmonyInteraction();
  const [isOpen, setIsOpen] = React.useState(false);

  // If interactions are disabled or hover previews are off, just render children
  if (!interaction.enabled || !interaction.enableHoverPreview || disabled) {
    return <>{children}</>;
  }

  // Get preview mode for this entity type
  const previewMode = interaction.previewContent?.[entityType] ?? 'mini';

  // Check if it's a custom component
  const isCustomComponent = typeof previewMode === 'function';

  // Get the preview content based on entity type
  const previewContent = React.useMemo(() => {
    // Custom component provided
    if (isCustomComponent) {
      const CustomComponent = previewMode;
      return <CustomComponent entityType={entityType} entity={entity} />;
    }

    // Use built-in preview components
    const mode = previewMode as 'mini' | 'full' | 'links';
    
    switch (entityType) {
      case 'track':
        return <TrackHoverPreview entity={entity} mode={mode} />;
      case 'album':
        return <AlbumHoverPreview entity={entity} mode={mode} />;
      case 'artist':
        return <ArtistHoverPreview entity={entity} mode={mode} />;
      default:
        return null;
    }
  }, [entityType, entity, previewMode, isCustomComponent]);

  // Web platform: use hover card
  if (interaction.platform === 'web') {
    return (
      <HoverCard openDelay={interaction.hoverDelay} closeDelay={150}>
        <HoverCardTrigger asChild>
          {children}
        </HoverCardTrigger>
        <HoverCardContent className="w-80" side="right" align="start">
          {previewContent}
        </HoverCardContent>
      </HoverCard>
    );
  }

  // Mobile platform: use popover with tap trigger
  // Wrap children in a div with onClick to handle tap-to-preview
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(true);
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        {previewContent}
      </PopoverContent>
    </Popover>
  );
}
