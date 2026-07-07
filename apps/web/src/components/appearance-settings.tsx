'use client';

import { Label, ToggleGroup, ToggleGroupItem } from '@scilent-one/ui';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { usePalette } from '@/components/palette-provider';
import { PALETTES } from '@/lib/themes';

const MODES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { palette, setPalette } = usePalette();
  const [mounted, setMounted] = useState(false);

  // next-themes values are only known on the client; wait for mount to avoid a
  // hydration mismatch on the mode control.
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Label>Mode</Label>
        <p className='text-sm text-muted-foreground'>
          Choose light, dark, or follow your system setting.
        </p>
        <ToggleGroup
          type='single'
          variant='outline'
          value={mounted ? (theme ?? 'system') : ''}
          onValueChange={(value) => {
            if (value) setTheme(value);
          }}
          className='mt-1'
        >
          {MODES.map(({ value, label, icon: Icon }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              aria-label={label}
              className='gap-2'
            >
              <Icon className='size-4' />
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className='space-y-2'>
        <Label>Palette</Label>
        <p className='text-sm text-muted-foreground'>
          Pick a color theme. Applies in both light and dark mode.
        </p>
        <ToggleGroup
          type='single'
          variant='outline'
          value={palette}
          onValueChange={(value) => {
            if (value) setPalette(value as (typeof PALETTES)[number]['id']);
          }}
          className='mt-1 flex-wrap'
        >
          {PALETTES.map((p) => (
            <ToggleGroupItem
              key={p.id}
              value={p.id}
              aria-label={p.label}
              className='h-auto flex-col items-start gap-1 px-3 py-2'
            >
              <span className='flex items-center gap-2'>
                <span
                  className='inline-flex size-4 overflow-hidden rounded-full border border-border'
                  aria-hidden
                >
                  <span
                    className='size-full'
                    style={{ backgroundColor: p.swatch.light }}
                  />
                  <span
                    className='size-full'
                    style={{ backgroundColor: p.swatch.dark }}
                  />
                </span>
                <span className='font-medium'>{p.label}</span>
              </span>
              <span className='text-xs text-muted-foreground'>
                {p.description}
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
