'use client';

import * as React from 'react';
import { useHarmonyInteraction } from './provider';
import type { InteractiveWrapperProps } from './types';
import { EntityMenu } from './menus';
import { EntityPreview } from './previews';

/**
 * Wrapper component that adds interactive behaviors to any child element.
 * 
 * Based on provider configuration, this wraps children with:
 * - Context menus (right-click on web, long-press on mobile)
 * - Hover previews (web only)
 * 
 * When used outside of a HarmonyInteractionProvider, simply renders children unchanged.
 * 
 * @example
 * ```tsx
 * <InteractiveWrapper entityType="track" entity={track}>
 *   <TrackCard track={track} />
 * </InteractiveWrapper>
 * ```
 */
export function InteractiveWrapper({
  entityType,
  entity,
  children,
  className,
  disabled = false,
}: InteractiveWrapperProps) {
  const interaction = useHarmonyInteraction();

  // If interactions are completely disabled, just render children
  if (!interaction.enabled || disabled) {
    return <>{children}</>;
  }

  // Wrap with menu and preview based on config
  let content = children;

  // Add hover preview wrapper (only if enabled)
  if (interaction.enableHoverPreview) {
    content = (
      <EntityPreview entityType={entityType} entity={entity}>
        {content}
      </EntityPreview>
    );
  }

  // Add context menu wrapper (only if enabled)
  if (interaction.enableContextMenu) {
    content = (
      <EntityMenu entityType={entityType} entity={entity}>
        {content}
      </EntityMenu>
    );
  }

  // Wrap in a span to apply className if provided
  if (className) {
    return <span className={className}>{content}</span>;
  }

  return <>{content}</>;
}
