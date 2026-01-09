'use client';

import * as React from 'react';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  Popover,
  PopoverTrigger,
  PopoverContent,
  cn,
} from '@scilent-one/ui';
import { useHarmonyInteraction } from '../provider';
import type { EntityType, HarmonizedEntity, PreviewMode } from '../types';
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
  /** Side to position the preview (web only) */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment of the preview (web only) */
  align?: 'start' | 'center' | 'end';
  /** Additional class name for the preview content container */
  contentClassName?: string;
}

/**
 * Width classes for different preview modes and entity types.
 * Full mode for albums gets extra width for artwork display.
 */
const getContentWidth = (mode: PreviewMode, entityType: EntityType): string => {
  if (mode === 'links') {
    return 'w-64 sm:w-72';
  }
  if (mode === 'full') {
    return entityType === 'album' ? 'w-72 sm:w-80' : 'w-80 sm:w-96';
  }
  // mini mode
  return 'w-72 sm:w-80';
};

/**
 * Platform-adaptive preview wrapper that switches between HoverCard (web)
 * and Popover with tap trigger (mobile) based on the provider configuration.
 * 
 * Renders the appropriate entity-specific preview content based on entityType.
 * Features responsive widths and smooth animations.
 */
export function EntityPreview({
  entityType,
  entity,
  children,
  disabled = false,
  side = 'right',
  align = 'start',
  contentClassName,
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

  // Determine width based on mode
  const contentWidth = isCustomComponent
    ? 'w-80'
    : getContentWidth(previewMode as PreviewMode, entityType);

  // Get the preview content based on entity type
  const previewContent = React.useMemo(() => {
    // Custom component provided
    if (isCustomComponent) {
      const CustomComponent = previewMode;
      return <CustomComponent entityType={entityType} entity={entity} />;
    }

    // Use built-in preview components
    const mode = previewMode as PreviewMode;
    
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

  // Shared content wrapper styles
  const contentStyles = cn(
    contentWidth,
    'max-h-[min(85vh,500px)] overflow-y-auto',
    'scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent',
    contentClassName
  );

  // Web platform: use hover card
  if (interaction.platform === 'web') {
    return (
      <HoverCard openDelay={interaction.hoverDelay} closeDelay={200}>
        <HoverCardTrigger asChild>
          {children}
        </HoverCardTrigger>
        <HoverCardContent
          className={cn(
            contentStyles,
            'animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
          )}
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={16}
        >
          {previewContent}
        </HoverCardContent>
      </HoverCard>
    );
  }

  // Mobile platform: use popover with tap trigger
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(true);
            }
          }}
          className="cursor-pointer touch-manipulation"
        >
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          contentStyles,
          'animate-in fade-in-0 zoom-in-95'
        )}
        sideOffset={8}
        collisionPadding={16}
      >
        {previewContent}
      </PopoverContent>
    </Popover>
  );
}
