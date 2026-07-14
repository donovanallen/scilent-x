'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@scilent-one/ui';
import { ProfileTypePill } from '@scilent-one/scilent-ui';
import type { ProfileType } from '@scilent-one/db';
import { updateUserProfileType } from '../actions';

const PROFILE_TYPES: { value: ProfileType; label: string }[] = [
  { value: 'USER', label: 'User' },
  { value: 'VOICE', label: 'Verified Voice' },
  { value: 'ARTIST', label: 'Artist' },
];

interface ProfileTypeSelectProps {
  userId: string;
  currentProfileType: ProfileType;
}

export function ProfileTypeSelect({
  userId,
  currentProfileType,
}: ProfileTypeSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (newType: string) => {
    startTransition(async () => {
      const result = await updateUserProfileType(
        userId,
        newType as ProfileType
      );
      if (result.success) {
        toast.success('Profile type updated');
      } else {
        toast.error(result.error || 'Failed to update profile type');
      }
    });
  };

  return (
    <Select
      value={currentProfileType}
      onValueChange={handleChange}
      disabled={isPending}
    >
      <SelectTrigger className='w-[180px]'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PROFILE_TYPES.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            <div className='flex items-center gap-2'>
              <ProfileTypePill profileType={type.value} />
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
