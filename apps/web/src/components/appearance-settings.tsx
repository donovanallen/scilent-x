'use client';

import { Label, ToggleGroup, ToggleGroupItem, cn } from '@scilent-one/ui';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { usePalette } from '@/components/palette-provider';
import { PALETTES } from '@/lib/themes';

type Mode = 'light' | 'dark' | 'system';

const MODES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const satisfies ReadonlyArray<{
  value: Mode;
  label: string;
  icon: typeof Sun;
}>;

/** Stylized miniature window used as the mode preview thumbnail. */
function MiniWindow({ dark }: { dark?: boolean }) {
  return (
    <div
      className={cn(
        'flex size-full flex-col gap-1.5 p-2.5',
        dark ? 'bg-neutral-900' : 'bg-white'
      )}
    >
      <div
        className={cn(
          'h-1.5 w-6 rounded-full',
          dark ? 'bg-neutral-100' : 'bg-neutral-900'
        )}
      />
      <div
        className={cn(
          'h-1.5 w-full rounded-full',
          dark ? 'bg-neutral-700' : 'bg-neutral-200'
        )}
      />
      <div
        className={cn(
          'h-1.5 w-2/3 rounded-full',
          dark ? 'bg-neutral-700' : 'bg-neutral-200'
        )}
      />
      <div className='mt-auto flex items-center gap-1'>
        <div
          className={cn(
            'size-2.5 rounded-full',
            dark ? 'bg-neutral-100' : 'bg-neutral-900'
          )}
        />
        <div
          className={cn(
            'h-2.5 flex-1 rounded-full',
            dark ? 'bg-neutral-800' : 'bg-neutral-100'
          )}
        />
      </div>
    </div>
  );
}

function ModePreview({ mode }: { mode: Mode }) {
  if (mode === 'system') {
    return (
      <div className='relative size-full'>
        <MiniWindow />
        <div className='absolute inset-0 [clip-path:polygon(100%_0,100%_100%,0_100%)]'>
          <MiniWindow dark />
        </div>
      </div>
    );
  }
  return <MiniWindow dark={mode === 'dark'} />;
}

/** Small check badge shown in the corner of the selected card. */
function SelectedBadge() {
  return (
    <span className='absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-sm transition-opacity group-data-[state=on]:opacity-100'>
      <Check className='size-3' strokeWidth={3} />
    </span>
  );
}

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
    <div className='space-y-8'>
      <section className='space-y-3'>
        <div className='space-y-1'>
          <Label className='text-sm font-medium'>Mode</Label>
          <p className='text-sm text-muted-foreground'>
            Choose light, dark, or follow your system setting.
          </p>
        </div>
        <ToggleGroup
          type='single'
          value={mounted ? (theme ?? 'system') : ''}
          onValueChange={(value) => {
            if (value) setTheme(value);
          }}
          className='grid w-full grid-cols-3 gap-3'
        >
          {MODES.map(({ value, label, icon: Icon }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              aria-label={label}
              className={cn(
                'group relative flex h-auto w-full flex-col items-stretch gap-0 overflow-hidden rounded-xl border border-border bg-card p-0 text-left shadow-xs transition-all',
                'hover:border-foreground/20 hover:bg-card',
                'data-[state=on]:border-primary data-[state=on]:bg-card data-[state=on]:ring-2 data-[state=on]:ring-primary/40'
              )}
            >
              <SelectedBadge />
              <div className='pointer-events-none aspect-4/3 w-full overflow-hidden border-b border-border/70'>
                <ModePreview mode={value} />
              </div>
              <span className='flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-foreground'>
                <Icon className='size-4 text-muted-foreground' />
                {label}
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </section>

      <section className='space-y-3'>
        <div className='space-y-1'>
          <Label className='text-sm font-medium'>Palette</Label>
          <p className='text-sm text-muted-foreground'>
            Pick a color theme. Applies in both light and dark mode.
          </p>
        </div>
        <ToggleGroup
          type='single'
          value={palette}
          onValueChange={(value) => {
            if (value) setPalette(value as (typeof PALETTES)[number]['id']);
          }}
          className='grid w-full grid-cols-1 gap-3 sm:grid-cols-2'
        >
          {PALETTES.map((p) => (
            <ToggleGroupItem
              key={p.id}
              value={p.id}
              aria-label={p.label}
              className={cn(
                'group relative flex h-auto w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left shadow-xs transition-all',
                'hover:border-foreground/20 hover:bg-card',
                'data-[state=on]:border-primary data-[state=on]:bg-card data-[state=on]:ring-2 data-[state=on]:ring-primary/40'
              )}
            >
              <span
                className='relative flex size-9 shrink-0 items-center justify-center rounded-full border border-border shadow-inner'
                aria-hidden
              >
                <span className='absolute inset-0 overflow-hidden rounded-full'>
                  <span
                    className='absolute inset-0'
                    style={{ backgroundColor: p.swatch.light }}
                  />
                  <span
                    className='absolute inset-0 [clip-path:polygon(100%_0,100%_100%,0_100%)]'
                    style={{ backgroundColor: p.swatch.dark }}
                  />
                </span>
              </span>
              <span className='flex min-w-0 flex-col gap-0.5'>
                <span className='text-sm font-medium text-foreground'>
                  {p.label}
                </span>
                <span className='truncate text-xs text-muted-foreground'>
                  {p.description}
                </span>
              </span>
              <span className='ml-auto flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity group-data-[state=on]:opacity-100'>
                <Check className='size-3' strokeWidth={3} />
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </section>
    </div>
  );
}
