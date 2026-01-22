import { BaseCreditsProvider } from './base.credits-provider';
import { MusoProvider } from './muso.provider';
import type { CreditsProviderConfig } from '../types/index';

export type CreditsProviderName = 'muso';

export interface CreditsProviderRegistryConfig {
  providers: Partial<Record<CreditsProviderName, CreditsProviderConfig>>;
  defaultProvider?: CreditsProviderName | undefined;
}

type CreditsProviderConstructor = new (config: CreditsProviderConfig) => BaseCreditsProvider;

/**
 * Registry for credits providers.
 * Manages the lifecycle and access to different credits data sources.
 */
export class CreditsProviderRegistry {
  private providers = new Map<string, BaseCreditsProvider>();
  private defaultProviderName: CreditsProviderName;

  constructor(config: CreditsProviderRegistryConfig) {
    this.defaultProviderName = config.defaultProvider ?? 'muso';
    this.initializeProviders(config);
  }

  private initializeProviders(config: CreditsProviderRegistryConfig): void {
    const providerClasses: Record<CreditsProviderName, CreditsProviderConstructor> = {
      muso: MusoProvider as unknown as CreditsProviderConstructor,
    };

    for (const [name, providerConfig] of Object.entries(config.providers)) {
      if (providerConfig) {
        const ProviderClass = providerClasses[name as CreditsProviderName];
        if (ProviderClass) {
          const provider = new ProviderClass(providerConfig);
          if (provider.isConfigured()) {
            this.providers.set(name, provider);
          }
        }
      }
    }
  }

  /**
   * Get a provider by name
   */
  get(name: string): BaseCreditsProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Get the default provider
   */
  getDefault(): BaseCreditsProvider | undefined {
    return this.providers.get(this.defaultProviderName);
  }

  /**
   * Get all configured providers
   */
  getAll(): BaseCreditsProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Check if any providers are configured
   */
  hasProviders(): boolean {
    return this.providers.size > 0;
  }

  /**
   * Register a custom provider at runtime
   */
  register(provider: BaseCreditsProvider): void {
    if (provider.isConfigured()) {
      this.providers.set(provider.name, provider);
    }
  }
}

// Re-exports
export {
  BaseCreditsProvider,
  type CreditsProviderConfig,
  type EnrichmentOptions,
} from './base.credits-provider';
export { MusoProvider, DEFAULT_MUSO_CONFIG, type MusoProviderConfig } from './muso.provider';
