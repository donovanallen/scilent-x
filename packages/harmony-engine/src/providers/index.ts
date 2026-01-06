import { BaseProvider } from './base.provider';
import type { ProviderConfig } from '../types/provider.types';
import {
  MusicBrainzProvider,
  // type MusicBrainzConfig,
} from './musicbrainz.provider';
import {
  SpotifyProvider,
  // type SpotifyConfig,
} from './spotify.provider';
import {
  TidalProvider,
  // type TidalConfig,
} from './tidal.provider';

export type ProviderName = 'musicbrainz' | 'spotify' | 'tidal';

export interface ProviderRegistryConfig {
  providers: Partial<Record<ProviderName, ProviderConfig>>;
  defaultProviders?: ProviderName[];
}

type ProviderConstructor = new (config: ProviderConfig) => BaseProvider;

export class ProviderRegistry {
  private providers = new Map<string, BaseProvider>();
  private defaultProviderNames: string[] = [];

  constructor(config: ProviderRegistryConfig) {
    this.initializeProviders(config);
    this.defaultProviderNames = config.defaultProviders ?? ['musicbrainz'];
  }

  private initializeProviders(config: ProviderRegistryConfig): void {
    const providerClasses: Record<ProviderName, ProviderConstructor> = {
      musicbrainz: MusicBrainzProvider as unknown as ProviderConstructor,
      spotify: SpotifyProvider as unknown as ProviderConstructor,
      tidal: TidalProvider as unknown as ProviderConstructor,
    };

    for (const [name, providerConfig] of Object.entries(config.providers)) {
      if (providerConfig?.enabled) {
        const ProviderClass = providerClasses[name as ProviderName];
        if (ProviderClass) {
          this.providers.set(name, new ProviderClass(providerConfig));
        }
      }
    }
  }

  get(name: string): BaseProvider | undefined {
    return this.providers.get(name);
  }

  getAll(): BaseProvider[] {
    return Array.from(this.providers.values());
  }

  getEnabled(): BaseProvider[] {
    return this.getAll().filter((p) => this.providers.has(p.name));
  }

  getDefaults(): BaseProvider[] {
    return this.defaultProviderNames
      .map((name) => this.providers.get(name))
      .filter((p): p is BaseProvider => p !== undefined);
  }

  getByPriority(): BaseProvider[] {
    return this.getEnabled().sort((a, b) => b.priority - a.priority);
  }

  findByUrl(url: string): BaseProvider | undefined {
    return this.getEnabled().find((p) => p.canHandleUrl(url));
  }

  // Register a custom provider at runtime
  register(provider: BaseProvider): void {
    this.providers.set(provider.name, provider);
  }
}

// Re-export
export {
  BaseProvider,
  type ProviderConfig,
  type LookupOptions,
} from './base.provider';
export {
  MusicBrainzProvider,
  type MusicBrainzConfig,
} from './musicbrainz.provider';
export { SpotifyProvider, type SpotifyConfig } from './spotify.provider';
export { TidalProvider, type TidalConfig } from './tidal.provider';
