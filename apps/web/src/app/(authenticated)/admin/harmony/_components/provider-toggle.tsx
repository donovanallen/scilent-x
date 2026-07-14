'use client';

import {
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@scilent-one/ui';
import { Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { updateProviderEnabled } from '../actions';

interface ProviderToggleProps {
  providerName: string;
  enabled: boolean;
  hasCredentials: boolean;
}

export function ProviderToggle({
  providerName,
  enabled,
  hasCredentials,
}: ProviderToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      const result = await updateProviderEnabled(providerName, checked);

      if (!result.success) {
        toast.error(`Failed to update ${providerName}`, {
          description: result.error,
        });
      } else {
        toast.success(`${providerName} ${checked ? 'enabled' : 'disabled'}`);
      }
    });
  };

  const isDisabled = !hasCredentials || isPending;

  // Show tooltip explaining why toggle is disabled
  if (!hasCredentials) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className='inline-flex'>
              <Switch
                checked={false}
                disabled={true}
                aria-label={`Toggle ${providerName}`}
              />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className='text-xs'>
              Missing required credentials (environment variables)
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className='flex items-center gap-2' aria-busy={isPending}>
      <Switch
        checked={enabled}
        disabled={isDisabled}
        onCheckedChange={handleToggle}
        aria-label={`Toggle ${providerName}`}
        className={`transition-opacity ${isPending ? 'opacity-50 cursor-wait' : ''}`}
      />
      {isPending && (
        <Loader2 className='h-3 w-3 animate-spin text-muted-foreground' />
      )}
    </div>
  );
}
