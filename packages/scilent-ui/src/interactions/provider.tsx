'use client';

import * as React from 'react';
import { useIsMobile } from '@scilent-one/ui';
import type {
  HarmonyInteractionConfig,
  HarmonyInteractionContextValue,
} from './types';

/**
 * Default configuration values
 */
const defaultConfig: Omit<HarmonyInteractionContextValue, 'enabled' | 'platform'> = {
  enableContextMenu: true,
  enableHoverPreview: true,
  hoverDelay: 300,
};

/**
 * Context for Harmony interaction configuration
 */
const HarmonyInteractionContext =
  React.createContext<HarmonyInteractionContextValue | null>(null);

HarmonyInteractionContext.displayName = 'HarmonyInteractionContext';

export interface HarmonyInteractionProviderProps {
  /** Child components to wrap */
  children: React.ReactNode;
  /** Interaction configuration */
  config?: HarmonyInteractionConfig;
}

/**
 * Provider component that enables interaction behaviors for scilent-ui components.
 * 
 * Wraps your app or a section of it to enable context menus, hover previews,
 * and other interactive features on entity cards and components.
 * 
 * @example
 * ```tsx
 * <HarmonyInteractionProvider
 *   config={{
 *     platform: 'web',
 *     enableContextMenu: true,
 *     enableHoverPreview: true,
 *     onNavigate: (type, entity) => router.push(`/${type}/${entity.id}`),
 *   }}
 * >
 *   <App />
 * </HarmonyInteractionProvider>
 * ```
 */
export function HarmonyInteractionProvider({
  children,
  config = {},
}: HarmonyInteractionProviderProps) {
  const isMobile = useIsMobile();

  // Resolve platform - 'auto' uses the mobile detection hook
  const resolvedPlatform: 'web' | 'mobile' = React.useMemo(() => {
    if (config.platform === 'auto' || config.platform === undefined) {
      return isMobile ? 'mobile' : 'web';
    }
    return config.platform;
  }, [config.platform, isMobile]);

  // Merge config with defaults
  const contextValue = React.useMemo<HarmonyInteractionContextValue>(() => ({
    ...defaultConfig,
    enabled: true,
    platform: resolvedPlatform,
    enableContextMenu: config.enableContextMenu ?? defaultConfig.enableContextMenu,
    enableHoverPreview: config.enableHoverPreview ?? defaultConfig.enableHoverPreview,
    hoverDelay: config.hoverDelay ?? defaultConfig.hoverDelay,
    onNavigate: config.onNavigate,
    onOpenExternal: config.onOpenExternal,
    onCopyLink: config.onCopyLink,
    onViewCredits: config.onViewCredits,
    customMenuItems: config.customMenuItems,
    providerActions: config.providerActions,
    enabledProviders: config.enabledProviders,
    previewContent: config.previewContent,
  }), [
    resolvedPlatform,
    config.enableContextMenu,
    config.enableHoverPreview,
    config.hoverDelay,
    config.onNavigate,
    config.onOpenExternal,
    config.onCopyLink,
    config.onViewCredits,
    config.customMenuItems,
    config.providerActions,
    config.enabledProviders,
    config.previewContent,
  ]);

  return (
    <HarmonyInteractionContext.Provider value={contextValue}>
      {children}
    </HarmonyInteractionContext.Provider>
  );
}

/**
 * Disabled context value returned when provider is not present
 */
const disabledContextValue: HarmonyInteractionContextValue = {
  enabled: false,
  platform: 'web',
  enableContextMenu: false,
  enableHoverPreview: false,
  hoverDelay: 300,
};

/**
 * Hook to access Harmony interaction configuration.
 * 
 * Returns a context value with `enabled: false` if used outside of a provider,
 * allowing components to gracefully degrade when interactions aren't configured.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const interaction = useHarmonyInteraction();
 *   
 *   if (!interaction.enabled) {
 *     return <BasicComponent />;
 *   }
 *   
 *   return <InteractiveComponent {...interaction} />;
 * }
 * ```
 */
export function useHarmonyInteraction(): HarmonyInteractionContextValue {
  const context = React.useContext(HarmonyInteractionContext);
  
  if (!context) {
    // Return safe defaults - interactions disabled
    return disabledContextValue;
  }
  
  return context;
}

export { HarmonyInteractionContext };
