'use client';

import {
  Button,
  Input,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  cn,
} from '@scilent-one/ui';
import { Minus, Plus, Loader2, Check } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { updateProviderPriority } from '../actions';
import {
  MIN_PROVIDER_PRIORITY,
  MAX_PROVIDER_PRIORITY,
  clampPriority,
} from '../provider-metadata';

interface ProviderPriorityControlProps {
  providerName: string;
  displayName: string;
  /** The effective priority currently persisted for this provider. */
  priority: number;
  /** When true, the control is read-only (e.g. provider disabled/no creds). */
  disabled?: boolean;
  /** Tooltip explaining why the control is disabled. */
  disabledReason?: string;
}

const SAVE_DEBOUNCE_MS = 600;
const SAVED_INDICATOR_MS = 1500;

export function ProviderPriorityControl({
  providerName,
  displayName,
  priority,
  disabled = false,
  disabledReason,
}: ProviderPriorityControlProps) {
  const [value, setValue] = useState(priority);
  const [isPending, startTransition] = useTransition();
  const [justSaved, setJustSaved] = useState(false);

  // Track the last value we successfully persisted so we can revert on error
  // and avoid redundant saves.
  const savedValueRef = useRef(priority);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedIndicatorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Keep local state in sync when the server sends a new value (e.g. after
  // revalidation) as long as the user isn't mid-edit.
  useEffect(() => {
    if (saveTimerRef.current === null) {
      savedValueRef.current = priority;
      setValue(priority);
    }
  }, [priority]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (savedIndicatorTimerRef.current)
        clearTimeout(savedIndicatorTimerRef.current);
    };
  }, []);

  const persist = (next: number) => {
    if (next === savedValueRef.current) return;

    startTransition(async () => {
      const result = await updateProviderPriority(providerName, next);

      if (!result.success) {
        // Revert to the last known-good value.
        setValue(savedValueRef.current);
        toast.error(`Couldn't update ${displayName} priority`, {
          description: result.error,
        });
        return;
      }

      savedValueRef.current = next;
      setJustSaved(true);
      if (savedIndicatorTimerRef.current)
        clearTimeout(savedIndicatorTimerRef.current);
      savedIndicatorTimerRef.current = setTimeout(
        () => setJustSaved(false),
        SAVED_INDICATOR_MS
      );
    });
  };

  const scheduleSave = (next: number) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      persist(next);
    }, SAVE_DEBOUNCE_MS);
  };

  const commitNow = (next: number) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    persist(next);
  };

  const applyChange = (next: number, immediate: boolean) => {
    const clamped = clampPriority(next);
    setValue(clamped);
    setJustSaved(false);
    if (immediate) {
      commitNow(clamped);
    } else {
      scheduleSave(clamped);
    }
  };

  const atMin = value <= MIN_PROVIDER_PRIORITY;
  const atMax = value >= MAX_PROVIDER_PRIORITY;

  const control = (
    <div className='flex flex-col items-end gap-1'>
      <div className='flex items-center gap-1.5'>
        <span className='text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
          Priority
        </span>
        <span className='inline-flex h-4 w-4 items-center justify-center'>
          {isPending ? (
            <Loader2 className='h-3.5 w-3.5 animate-spin text-muted-foreground' />
          ) : justSaved ? (
            <Check className='h-3.5 w-3.5 text-primary' />
          ) : null}
        </span>
      </div>
      <div
        className={cn(
          'flex items-center rounded-md border bg-background shadow-sm transition-opacity',
          disabled && 'opacity-50'
        )}
      >
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8 rounded-r-none border-r text-muted-foreground hover:text-foreground'
          onClick={() => applyChange(value - 5, false)}
          disabled={disabled || atMin}
          aria-label={`Decrease ${displayName} priority`}
        >
          <Minus className='h-3.5 w-3.5' />
        </Button>
        <Input
          type='number'
          inputMode='numeric'
          value={value}
          min={MIN_PROVIDER_PRIORITY}
          max={MAX_PROVIDER_PRIORITY}
          disabled={disabled}
          onChange={(e) => {
            const parsed = Number(e.target.value);
            if (Number.isNaN(parsed)) return;
            setValue(parsed);
            setJustSaved(false);
          }}
          onBlur={(e) => {
            const parsed = Number(e.target.value);
            applyChange(
              Number.isNaN(parsed) ? savedValueRef.current : parsed,
              true
            );
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
          className='h-8 w-12 border-0 px-0 text-center text-sm font-semibold tabular-nums shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
          aria-label={`${displayName} priority`}
        />
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8 rounded-l-none border-l text-muted-foreground hover:text-foreground'
          onClick={() => applyChange(value + 5, false)}
          disabled={disabled || atMax}
          aria-label={`Increase ${displayName} priority`}
        >
          <Plus className='h-3.5 w-3.5' />
        </Button>
      </div>
    </div>
  );

  if (disabled && disabledReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className='inline-flex cursor-not-allowed'>{control}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p className='text-xs'>{disabledReason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return control;
}
